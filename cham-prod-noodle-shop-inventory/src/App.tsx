import React, { useState, useEffect } from 'react';
import { CatalogItem, StockTransaction, Language } from './types';
import {
  getCatalogItems,
  getHistoryLogs,
  postBatchTransactions,
  saveCatalogItems,
  getPendingCount,
  syncPendingTransactions
} from './services/gasService';
import {
  isPinEnabled,
  isSessionUnlocked,
  setSessionUnlocked
} from './services/pinService';

import { computeMultiLocationInventory } from './services/inventoryAggregator';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { StockCheckView } from './components/StockCheckView';
import { ReceiveCartView } from './components/ReceiveCartView';
import { RestockView } from './components/RestockView';
import { HistoryView } from './components/HistoryView';
import { CatalogManagerView } from './components/CatalogManagerView';
import { SettingsView } from './components/SettingsView';
import { ConfirmModal } from './components/ConfirmModal';
import { PinLockModal } from './components/PinLockModal';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('th');
  const [activeTab, setActiveTab] = useState<ActiveTab>('check');

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [historyLogs, setHistoryLogs] = useState<StockTransaction[]>([]);
  const [dataMode, setDataMode] = useState<'gas' | 'local'>('local');
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // PIN Security Lock Modal State
  const [pinModal, setPinModal] = useState<{
    isOpen: boolean;
    targetTab: ActiveTab | null;
    targetTabName: string;
  }>({
    isOpen: false,
    targetTab: null,
    targetTabName: ''
  });

  const handleTabChangeRequest = (tab: ActiveTab) => {
    if ((tab === 'catalog' || tab === 'settings') && isPinEnabled() && !isSessionUnlocked()) {
      const tabName = tab === 'catalog' ? 'แคตตาล็อกสินค้า' : 'ตั้งค่าระบบ & Sheets';
      setPinModal({
        isOpen: true,
        targetTab: tab,
        targetTabName: tabName
      });
    } else {
      setActiveTab(tab);
    }
  };

  const handlePinUnlockSuccess = () => {
    const target = pinModal.targetTab;
    setPinModal({ isOpen: false, targetTab: null, targetTabName: '' });
    showToast('🔓 ปลดล็อกสิทธิ์ผู้จัดการสำเร็จ!');
    if (target) {
      setActiveTab(target);
    }
  };

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    items: any[];
    onConfirmAction: () => void;
    accentColor: 'amber' | 'blue' | 'emerald';
  }>({
    isOpen: false,
    title: '',
    items: [],
    onConfirmAction: () => {},
    accentColor: 'amber'
  });

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catRes, histRes] = await Promise.all([getCatalogItems(), getHistoryLogs()]);
      setCatalogItems(catRes.items);
      setHistoryLogs(histRes.logs);
      setDataMode(catRes.source === 'gas' && histRes.source === 'gas' ? 'gas' : 'local');
      setPendingCount(getPendingCount());
    } catch (e) {
      console.error("Failed loading initial data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const refresh = () => {
      syncPendingTransactions().catch(error => console.warn('Pending sync failed', error))
        .finally(() => loadData());
    };
    refresh();
    window.addEventListener('online', refresh);
    return () => window.removeEventListener('online', refresh);
  }, []);

  // Save Check Stock Transactions
  const handleSaveCheckStock = async (transactions: StockTransaction[]) => {
    setIsSaving(true);
    try {
      const result = await postBatchTransactions(transactions);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      showToast(result.mode === 'gas' ? '✅ ส่งผลตรวจนับเข้า Google Sheets แล้ว' : '📱 เก็บผลตรวจนับในเครื่อง รอส่งเมื่อออนไลน์');
      await loadData();
      setActiveTab('history');
    } catch (e) {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Receive Goods Transactions
  const handleSaveReceiveGoods = async (transactions: StockTransaction[]) => {
    setIsSaving(true);
    try {
      const result = await postBatchTransactions(transactions);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      showToast(result.mode === 'gas' ? '✅ ส่งรายการรับของเข้า Google Sheets แล้ว' : '📱 เก็บรายการรับของในเครื่อง รอส่งเมื่อออนไลน์');
      await loadData();
      setActiveTab('history');
    } catch (e) {
      alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Catalog Changes
  const handleSaveCatalogItems = (items: CatalogItem[]) => {
    setCatalogItems(items);
    saveCatalogItems(items);
    showToast('✅ บันทึกข้อมูลแคตตาล็อกสำเร็จ!');
  };

  // Modal Opener Helper
  const handleOpenConfirmModal = (
    title: string,
    items: any[],
    onConfirm: () => void,
    accentColor: 'amber' | 'blue' | 'emerald' = 'amber'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      items,
      onConfirmAction: onConfirm,
      accentColor
    });
  };

  // Use the same stock engine for the badge and purchase list.
  const restockBadgeCount = computeMultiLocationInventory(catalogItems, historyLogs)
    .filter(item => item.totalMinQty > 0 && item.isLowStock).length;

  return (
    <div className="min-h-screen bg-[#fdf6e3] text-gray-900 font-sans p-3 sm:p-5 md:p-8 antialiased selection:bg-amber-200">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Header
          currentLang={currentLang}
          onSetLang={setCurrentLang}
          dataMode={dataMode}
          onRefreshData={loadData}
          isLoading={isLoading}
          onOpenSettings={() => handleTabChangeRequest('settings')}
          isSettingsActive={activeTab === 'settings'}
        />

        {pendingCount > 0 && (
          <div role="status" className="my-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-900">
            มี {pendingCount} รายการรอส่ง Google Sheets — กรุณาอย่าล้างข้อมูลเว็บไซต์
            <button className="ml-3 underline" onClick={() => syncPendingTransactions().then(loadData).catch(() => showToast('ยังส่งไม่สำเร็จ กรุณาลองใหม่'))}>ลองส่งอีกครั้ง</button>
          </div>
        )}
        {/* Navigation Bar */}
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChangeRequest}
          currentLang={currentLang}
          restockCount={restockBadgeCount}
          isPinLocked={isPinEnabled() && !isSessionUnlocked()}
        />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-2xl shadow-2xl border-2 border-emerald-400 animate-bounce text-sm">
            {toastMessage}
          </div>
        )}

        {/* Loading Spinner Screen */}
        {isLoading && (
          <div className="bg-white p-12 rounded-2xl shadow-lg border border-gray-100 text-center my-6">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="font-extrabold text-amber-900 text-lg">กำลังโหลดข้อมูลระบบสต็อก...</div>
          </div>
        )}

        {/* Main Tab Views */}
        {!isLoading && (
          <main className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-xl border border-amber-100 min-h-[60vh]">
            {activeTab === 'check' && (
              <StockCheckView
                catalogItems={catalogItems}
                historyLogs={historyLogs}
                currentLang={currentLang}
                onSaveCheck={handleSaveCheckStock}
                isSaving={isSaving}
                onRequestConfirmModal={(items, action) =>
                  handleOpenConfirmModal('📝 ยืนยันการนับสต็อก', items, action, 'amber')
                }
              />
            )}

            {activeTab === 'receive' && (
              <ReceiveCartView
                catalogItems={catalogItems}
                currentLang={currentLang}
                onSaveReceive={handleSaveReceiveGoods}
                isSaving={isSaving}
                onRequestConfirmModal={(items, action) =>
                  handleOpenConfirmModal('📥 ยืนยันการรับของเข้าคลัง', items, action, 'blue')
                }
              />
            )}

            {activeTab === 'restock' && (
              <RestockView
                catalogItems={catalogItems}
                historyLogs={historyLogs}
                currentLang={currentLang}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView historyLogs={historyLogs} currentLang={currentLang} />
            )}

            {activeTab === 'catalog' && (
              <CatalogManagerView
                catalogItems={catalogItems}
                currentLang={currentLang}
                onSaveCatalog={handleSaveCatalogItems}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView currentLang={currentLang} onRefreshAllData={loadData} />
            )}
          </main>
        )}

        {/* Universal Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          items={confirmModal.items}
          onConfirm={confirmModal.onConfirmAction}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          isSaving={isSaving}
          currentLang={currentLang}
          accentColor={confirmModal.accentColor}
        />

        {/* Manager PIN Unlock Modal */}
        <PinLockModal
          isOpen={pinModal.isOpen}
          targetTabName={pinModal.targetTabName}
          onSuccess={handlePinUnlockSuccess}
          onCancel={() => setPinModal({ isOpen: false, targetTab: null, targetTabName: '' })}
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-amber-800/60 font-medium py-2">
          ระบบสต็อกร้านชามโปรด (Cham Prod Noodle Shop Inventory ERP) © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
