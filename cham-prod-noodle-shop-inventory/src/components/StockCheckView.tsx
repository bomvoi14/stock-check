import React, { useState, useEffect } from 'react';
import { CatalogItem, StockTransaction, ShopSheet, Language } from '../types';
import { i18nDict } from '../data/i18n';
import { getShopConfigs, ShopConfig } from '../data/shopConfigs';
import { ArrowLeft, CheckSquare, AlertCircle, Plus, Minus, UserCheck, Search, Folder, Save, Layers, MapPin } from 'lucide-react';
import { MultiLocationOverviewModal } from './MultiLocationOverviewModal';

interface StockCheckViewProps {
  catalogItems: CatalogItem[];
  historyLogs: StockTransaction[];
  currentLang: Language;
  onSaveCheck: (transactions: StockTransaction[]) => Promise<void>;
  isSaving: boolean;
  onRequestConfirmModal: (items: any[], onConfirm: () => void) => void;
}

interface RowState {
  qty: number;
  note: string;
  origQty: number;
  origNote: string;
}

export const StockCheckView: React.FC<StockCheckViewProps> = ({
  catalogItems,
  historyLogs,
  currentLang,
  onSaveCheck,
  isSaving,
  onRequestConfirmModal
}) => {
  const dict = i18nDict[currentLang];
  const [shopConfigs, setShopConfigs] = useState<ShopConfig[]>(getShopConfigs());
  const [selectedShop, setSelectedShop] = useState<ShopSheet | null>(null);
  const [staffName, setStaffName] = useState<string>('');
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [todayStaffAlert, setTodayStaffAlert] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOverviewOpen, setIsOverviewOpen] = useState<boolean>(false);

  useEffect(() => {
    setShopConfigs(getShopConfigs());
  }, []);

  // Handle selecting a shop station
  const handleSelectShop = (shop: ShopSheet) => {
    setSelectedShop(shop);
    setSearchQuery('');

    // Filter items for this shop
    const shopItems = catalogItems.filter(i => i.sheet === shop);

    // Find today's latest check transactions for deduplication alert
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const todaysShopCheckLogs = historyLogs.filter(log => {
      const isShop = log.station === shop;
      const isCheck = !log.action_type || log.action_type === 'เช็คสต็อก';
      const isToday = log.timestamp && log.timestamp.startsWith(todayStr);
      return isShop && isCheck && isToday;
    });

    const latestCounts: Record<string, { qty: number; note: string }> = {};
    let lastStaff = '';

    todaysShopCheckLogs.forEach(log => {
      latestCounts[log.item_name] = {
        qty: parseFloat(String(log.quantity)) || 0,
        note: log.note || ''
      };
      if (log.checked_by) lastStaff = log.checked_by;
    });

    if (Object.keys(latestCounts).length > 0) {
      setTodayStaffAlert(lastStaff);
      setStaffName(lastStaff);
    } else {
      setTodayStaffAlert(null);
    }

    // Initialize row states
    const initialStates: Record<string, RowState> = {};
    shopItems.forEach(item => {
      const prev = latestCounts[item.name];
      const qtyVal = prev ? prev.qty : 0;
      const noteVal = prev ? prev.note : '';

      initialStates[item.id] = {
        qty: qtyVal,
        note: noteVal,
        origQty: qtyVal,
        origNote: noteVal
      };
    });

    setRowStates(initialStates);
  };

  const handleQtyChange = (itemId: string, val: number) => {
    setRowStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        qty: Math.max(0, parseFloat(val.toFixed(1)))
      }
    }));
  };

  const handleNoteChange = (itemId: string, noteVal: string) => {
    setRowStates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        note: noteVal
      }
    }));
  };

  const adjustQty = (itemId: string, delta: number) => {
    setRowStates(prev => {
      const current = prev[itemId]?.qty || 0;
      const next = Math.max(0, parseFloat((current + delta).toFixed(1)));
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          qty: next
        }
      };
    });
  };

  const handlePrepareSave = () => {
    if (!staffName.trim()) {
      alert(`⚠️ ${dict.staffRequiredAlert}`);
      return;
    }

    if (!selectedShop) return;

    const shopItems = catalogItems.filter(i => i.sheet === selectedShop);
    const pendingToSubmit: StockTransaction[] = [];
    const modalItems: any[] = [];
    let hasValidationError = false;

    for (const item of shopItems) {
      const state = rowStates[item.id];
      if (!state) continue;

      const q = state.qty;
      const note = state.note.trim();

      // Check if item quantity is 0 and note is missing while previous was > 0
      if (q === 0 && !note && state.origQty > 0) {
        alert(`⚠️ ${dict.zeroQtyNoteAlert}: "${item.name}"`);
        hasValidationError = true;
        break;
      }

      // Record modified or confirmed items
      const isModified = q !== state.origQty || note !== state.origNote;
      if (isModified || state.origQty === 0) {
        const trans: StockTransaction = {
          checked_by: staffName.trim(),
          station: selectedShop,
          action_type: 'เช็คสต็อก',
          category: item.category,
          item_name: item.name,
          quantity: q,
          unit: item.unit,
          note: note,
          timestamp: new Date().toISOString()
        };

        pendingToSubmit.push(trans);
        modalItems.push({
          name: item.name,
          qty: q,
          unit: item.unit,
          note: note
        });
      }
    }

    if (hasValidationError) return;

    if (pendingToSubmit.length === 0) {
      alert(`⚠️ ${dict.noChange}`);
      return;
    }

    onRequestConfirmModal(modalItems, () => {
      onSaveCheck(pendingToSubmit);
    });
  };

  // Render Shop Grid View
  if (!selectedShop) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border border-amber-400">
          <div>
            <h3 className="font-black text-white text-lg md:text-xl flex items-center gap-2 justify-center md:justify-start">
              <CheckSquare className="w-6 h-6 text-amber-200" />
              {dict.modeCheck}
            </h3>
            <p className="text-xs md:text-sm text-amber-100 mt-0.5">
              เลือกหน้าร้านหรือสถานีเพื่อเริ่มตรวจนับสต็อกวัตถุดิบและอุปกรณ์
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOverviewOpen(true)}
            className="w-full md:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-950 text-amber-300 font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all border border-amber-400/40 shrink-0"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>📦 ภาพรวมวัตถุดิบรวมทุกจุดจัดเก็บ</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {shopConfigs.map(shop => {
            return (
              <button
                key={shop.id}
                onClick={() => handleSelectShop(shop.id)}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl shadow-md ${shop.bgClass} ${shop.hoverClass} transition-all transform active:scale-95 gap-2 border border-white/20`}
              >
                <span className="text-4xl filter drop-shadow">{shop.icon}</span>
                <span className="font-extrabold text-sm md:text-base tracking-wide text-center">
                  {shop.label}
                </span>
              </button>
            );
          })}
        </div>

        <MultiLocationOverviewModal
          isOpen={isOverviewOpen}
          onClose={() => setIsOverviewOpen(false)}
          catalogItems={catalogItems}
          historyLogs={historyLogs}
          currentLang={currentLang}
        />
      </div>
    );
  }

  // Render Stock Check Table View for Selected Shop
  const currentShopItems = catalogItems.filter(i => i.sheet === selectedShop);
  const activeShopConfig = shopConfigs.find(s => s.id === selectedShop);

  // Group by category
  const filteredItems = currentShopItems.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.la && item.la.toLowerCase().includes(q)) ||
      (item.mm && item.mm.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const categories = Array.from(new Set(filteredItems.map(i => i.category || dict.catOthers)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
        <button
          onClick={() => setSelectedShop(null)}
          className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-2 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl transition-all text-sm w-full md:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          {dict.back}
        </button>

        <h2 className="text-xl md:text-2xl font-black text-amber-800 flex items-center gap-2">
          {activeShopConfig?.icon || '📝'} {activeShopConfig?.label || selectedShop}
        </h2>

        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
          <button
            type="button"
            onClick={() => setIsOverviewOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-amber-300 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow transition-colors border border-amber-400/40"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>ดูภาพรวมรวมของทุกล็อก</span>
          </button>
          <div className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 shrink-0">
            {currentShopItems.length} รายการ
          </div>
        </div>
      </div>

      {/* Duplicate Count Warning Alert */}
      {todayStaffAlert && (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-300 text-yellow-900 rounded-2xl shadow-sm flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <div className="text-sm">
            <span className="font-bold">{dict.todayCountAlert}: </span>
            <span className="bg-yellow-200 px-2 py-0.5 rounded font-black text-amber-900">
              {todayStaffAlert}
            </span>
          </div>
        </div>
      )}

      {/* Staff Name Input & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
          <input
            type="text"
            value={staffName}
            onChange={e => setStaffName(e.target.value)}
            placeholder={dict.staffPlaceholder}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-amber-300 rounded-2xl font-bold text-center text-gray-800 focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหารายการ..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl font-medium text-gray-800 focus:ring-4 focus:ring-amber-100 focus:border-amber-400 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Item Table Grouped by Category */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-amber-100/80 text-amber-900 border-b border-amber-200">
              <tr>
                <th className="p-3.5 text-left font-bold w-2/5">{dict.colItem}</th>
                <th className="p-3.5 text-center font-bold w-1/4">{dict.colQty}</th>
                <th className="p-3.5 text-center font-bold w-1/6">{dict.colUnit}</th>
                <th className="p-3.5 text-left font-bold w-1/4">{dict.colNote}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => {
                const catItems = filteredItems.filter(i => (i.category || dict.catOthers) === cat);
                if (catItems.length === 0) return null;

                return (
                  <React.Fragment key={cat}>
                    {/* Category Header Row */}
                    <tr className="bg-amber-50/80 border-y border-amber-200/60">
                      <td colSpan={4} className="p-3 font-extrabold text-amber-900 text-sm">
                        <span className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-amber-600" />
                          {cat}
                        </span>
                      </td>
                    </tr>

                    {/* Item Rows */}
                    {catItems.map(item => {
                      const state = rowStates[item.id] || { qty: 0, note: '', origQty: 0, origNote: '' };
                      const isQtyChanged = state.qty !== state.origQty;
                      const isNoteChanged = state.note !== state.origNote;

                      // Multilingual Name
                      const displayName =
                        currentLang === 'la' ? item.la || item.name : currentLang === 'mm' ? item.mm || item.name : item.name;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-gray-100 hover:bg-amber-50/40 transition-colors"
                        >
                          <td className="p-3.5 font-bold text-gray-800">
                            <div>{displayName}</div>
                            {currentLang !== 'th' && (
                              <div className="text-xs font-normal text-gray-400">{item.name}</div>
                            )}
                          </td>

                          {/* Quick Adjust Quantity Controls */}
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => adjustQty(item.id, -1)}
                                className="w-8 h-8 bg-gray-100 hover:bg-amber-200 text-gray-700 rounded-xl font-bold border border-gray-200 flex items-center justify-center transition-colors active:scale-95"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={state.qty}
                                onChange={e => handleQtyChange(item.id, parseFloat(e.target.value) || 0)}
                                className={`w-16 h-10 text-center border-2 rounded-xl font-extrabold text-lg outline-none focus:ring-2 focus:ring-amber-300 transition-all ${
                                  isQtyChanged
                                    ? 'border-red-500 text-red-600 bg-red-50'
                                    : 'border-gray-200 text-gray-800 bg-white'
                                }`}
                              />
                              <button
                                onClick={() => adjustQty(item.id, 1)}
                                className="w-8 h-8 bg-gray-100 hover:bg-amber-200 text-gray-700 rounded-xl font-bold border border-gray-200 flex items-center justify-center transition-colors active:scale-95"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                          <td className="p-3 text-center text-gray-600 font-medium text-sm">
                            {item.unit}
                          </td>

                          <td className="p-3">
                            <input
                              type="text"
                              value={state.note}
                              onChange={e => handleNoteChange(item.id, e.target.value)}
                              placeholder="หมายเหตุ..."
                              className={`w-full p-2 border rounded-xl outline-none text-sm focus:border-amber-400 transition-all ${
                                isNoteChanged ? 'border-red-400 text-red-600' : 'border-gray-200'
                              }`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handlePrepareSave}
        disabled={isSaving}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform active:scale-98 flex justify-center items-center gap-2 border border-amber-400"
      >
        <Save className="w-6 h-6" />
        <span>{dict.saveBtn}</span>
      </button>

      <MultiLocationOverviewModal
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        catalogItems={catalogItems}
        historyLogs={historyLogs}
        currentLang={currentLang}
      />
    </div>
  );
};
