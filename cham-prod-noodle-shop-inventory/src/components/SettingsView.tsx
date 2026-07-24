import React, { useState } from 'react';
import { Language } from '../types';
import { i18nDict } from '../data/i18n';
import {
  getStoredScriptUrl,
  saveStoredScriptUrl,
  resetToDefaultData,
  DEFAULT_SCRIPT_URL
} from '../services/gasService';
import {
  getShopConfigs,
  saveShopConfigs,
  COLOR_THEMES,
  ShopConfig,
  DEFAULT_SHOP_CONFIGS
} from '../data/shopConfigs';
import {
  isPinEnabled,
  setPinEnabled,
  getStoredPin,
  savePin,
  setSessionUnlocked,
  verifyPin
} from '../services/pinService';
import { Settings, Link, Database, Download, Upload, RotateCcw, Check, Copy, ExternalLink, ShieldCheck, Palette, LayoutGrid, Lock, KeyRound, ShieldAlert, Key } from 'lucide-react';

interface SettingsViewProps {
  currentLang: Language;
  onRefreshAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentLang,
  onRefreshAllData
}) => {
  const dict = i18nDict[currentLang];
  const [scriptUrl, setScriptUrl] = useState<string>(getStoredScriptUrl());
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  // Manager PIN State
  const [pinEnabled, setPinEnabledState] = useState<boolean>(isPinEnabled());
  const [oldPin, setOldPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinStatusMsg, setPinStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Shop station card customizer state
  const [shopConfigs, setShopConfigs] = useState<ShopConfig[]>(getShopConfigs());
  const [cardNotice, setCardNotice] = useState<boolean>(false);

  const handleTogglePinEnabled = () => {
    const nextVal = !pinEnabled;
    setPinEnabled(nextVal);
    setPinEnabledState(nextVal);
    setPinStatusMsg({
      text: nextVal ? 'เปิดใช้งานระบบยืนยันสิทธิ์ผู้จัดการแล้ว' : 'ปิดการใช้งานระบบยืนยันสิทธิ์ผู้จัดการแล้ว',
      isError: false
    });
    setTimeout(() => setPinStatusMsg(null), 3000);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinStatusMsg(null);

    // Validate old pin if pin is enabled
    if (isPinEnabled() && !verifyPin(oldPin)) {
      setPinStatusMsg({ text: 'รหัสผ่านเดิมไม่ถูกต้อง', isError: true });
      return;
    }

    if (newPin.length < 4) {
      setPinStatusMsg({ text: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 หลัก', isError: true });
      return;
    }

    if (newPin !== confirmPin) {
      setPinStatusMsg({ text: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน', isError: true });
      return;
    }

    if (savePin(newPin)) {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setPinStatusMsg({ text: 'เปลี่ยนรหัสผ่านผู้จัดการสำเร็จแล้ว!', isError: false });
      setTimeout(() => setPinStatusMsg(null), 3500);
    } else {
      setPinStatusMsg({ text: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่าน', isError: true });
    }
  };

  const handleLockNow = () => {
    setSessionUnlocked(false);
    setPinStatusMsg({ text: 'ล็อกสิทธิ์ผู้จัดการเรียบร้อยแล้ว!', isError: false });
    setTimeout(() => setPinStatusMsg(null), 3000);
  };

  const handleUpdateCardField = (id: string, field: keyof ShopConfig, value: any) => {
    setShopConfigs(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        if (field === 'colorTheme' && COLOR_THEMES[value]) {
          updated.bgClass = COLOR_THEMES[value].bg;
          updated.hoverClass = COLOR_THEMES[value].hover;
        }
        return updated;
      }
      return c;
    }));
  };

  const handleSaveCardConfigs = () => {
    saveShopConfigs(shopConfigs);
    setCardNotice(true);
    setTimeout(() => setCardNotice(false), 3000);
    onRefreshAllData();
  };

  const handleResetCardConfigs = () => {
    if (confirm('คุณต้องการรีเซ็ตชื่อ สี และไอคอนของการ์ดหน้าหลักกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      setShopConfigs(DEFAULT_SHOP_CONFIGS);
      saveShopConfigs(DEFAULT_SHOP_CONFIGS);
      onRefreshAllData();
    }
  };

  const handleSaveScriptUrl = () => {
    saveStoredScriptUrl(scriptUrl);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    onRefreshAllData();
  };

  const handleTestConnection = async () => {
    setTestStatus('กำลังทดสอบการเชื่อมต่อ...');
    try {
      const res = await fetch(`${scriptUrl}?sheet=catalog`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        setTestStatus('✅ เชื่อมต่อ Google Apps Script สำเร็จ!');
      } else {
        setTestStatus('⚠️ ไม่สามารถดึงข้อมูลได้ (โปรดตรวจสอบการตั้งค่า Deploy เป็น Anyone)');
      }
    } catch (e) {
      setTestStatus('❌ การเชื่อมต่อล้มเหลว (อาจติด CORS หรือ URL ไม่ถูกต้อง)');
    }
  };

  const handleResetData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      resetToDefaultData();
      onRefreshAllData();
      alert('รีเซ็ตข้อมูลสำเร็จ!');
    }
  };

  const handleExportData = () => {
    const catalog = localStorage.getItem('cham_prod_catalog_v2') || '[]';
    const history = localStorage.getItem('cham_prod_history_v2') || '[]';

    const backup = {
      app: 'Cham Prod ERP',
      exportedAt: new Date().toISOString(),
      catalog: JSON.parse(catalog),
      history: JSON.parse(history)
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cham_prod_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Title Banner */}
      <div className="bg-slate-800 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-700 rounded-xl text-amber-400 font-bold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{dict.settingsBtn}</h3>
            <p className="text-xs text-slate-300">
              เชื่อมต่อ Google Sheets Web App, ส่งออกข้อมูลสำรอง และจัดการระบบ
            </p>
          </div>
        </div>
      </div>

      {/* Google Apps Script Endpoint Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
        <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
          <Link className="w-5 h-5 text-amber-600" />
          Google Apps Script Web App URL
        </h4>

        <p className="text-xs text-gray-600 leading-relaxed">
          ระบุ Web App URL ของ Google Apps Script เพื่อบันทึกข้อมูลและซิงค์กับ Google Sheets
          ของร้านโดยตรง
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={scriptUrl}
            onChange={e => setScriptUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="flex-1 p-3 border-2 border-gray-300 rounded-xl font-mono text-xs focus:border-amber-500 outline-none text-gray-800"
          />

          <button
            onClick={handleSaveScriptUrl}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-3 rounded-xl text-sm shadow transition-all flex items-center justify-center gap-2"
          >
            {isSaved ? <Check className="w-4 h-4 text-white" /> : null}
            <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึก URL'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors border border-slate-300"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ทดสอบการเชื่อมต่อ</span>
          </button>

          <button
            onClick={() => setScriptUrl(DEFAULT_SCRIPT_URL)}
            className="text-xs text-amber-700 hover:underline font-semibold"
          >
            ใช้ URL สคริปต์เริ่มต้น
          </button>
        </div>

        {testStatus && (
          <div className="p-3 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800">
            {testStatus}
          </div>
        )}
      </div>

      {/* Manager PIN Security Settings */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              ระบบจำกัดสิทธิ์ผู้จัดการ (Manager PIN Lock)
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              ป้องกันพนักงานทั่วไปเข้าถึงหรือแก้ไขเมนู <b>"แคตตาล็อกสินค้า"</b> และ <b>"ตั้งค่าระบบ & Sheets"</b>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTogglePinEnabled}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm border ${
                pinEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${pinEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{pinEnabled ? 'เปิดใช้งานอยู่' : 'ปิดการใช้งาน'}</span>
            </button>

            {pinEnabled && (
              <button
                type="button"
                onClick={handleLockNow}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                title="ล็อกสิทธิ์ผู้จัดการทันที"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>ล็อกทันที</span>
              </button>
            )}
          </div>
        </div>

        {pinStatusMsg && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            pinStatusMsg.isError
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}>
            {pinStatusMsg.isError ? <ShieldAlert className="w-4 h-4 text-red-600" /> : <Check className="w-4 h-4 text-emerald-600" />}
            <span>{pinStatusMsg.text}</span>
          </div>
        )}

        {/* Change PIN Form */}
        <form onSubmit={handleChangePin} className="space-y-4">
          <h5 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-amber-600" />
            ตั้งค่า / เปลี่ยนรหัสผ่าน PIN ผู้จัดการ
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pinEnabled && (
              <div>
                <label className="text-[11px] font-bold text-gray-600 block mb-1">รหัสผ่านเดิม</label>
                <input
                  type="password"
                  maxLength={12}
                  value={oldPin}
                  onChange={e => setOldPin(e.target.value)}
                  placeholder="ใส่ PIN เดิม (เช่น 1234)"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-mono focus:border-amber-500 outline-none"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">รหัสผ่านใหม่ (PIN 4-12 หลัก)</label>
              <input
                type="password"
                maxLength={12}
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="ระบุ PIN ใหม่..."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-mono focus:border-amber-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                maxLength={12}
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value)}
                placeholder="ระบุ PINใหม่อีกครั้ง..."
                className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-mono focus:border-amber-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              💡 รหัส PIN เริ่มต้นจากระบบคือ <span className="font-mono font-bold">1234</span>
            </span>

            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>บันทึกรหัสผ่านใหม่</span>
            </button>
          </div>
        </form>
      </div>

      {/* Station Cards Name, Icon & Color Customizer */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-600" />
              ปรับแต่งชื่อ ไอคอน และสีการ์ดหน้าหลัก (Station Cards)
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              ปรับเปลี่ยนข้อความ (เช่น สำรอง 1 เป็น ตู้แช่ 1), ไอคอนสัญลักษณ์ และโทนสีการ์ดตามที่คุณต้องการ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCardConfigs}
              className="text-xs text-gray-500 hover:text-red-600 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              คืนค่าเริ่มต้น
            </button>
            <button
              onClick={handleSaveCardConfigs}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{cardNotice ? 'บันทึกเรียบร้อย!' : 'บันทึกการปรับแต่ง'}</span>
            </button>
          </div>
        </div>

        {cardNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            บันทึกการปรับแต่งสีและชื่อการ์ดสำเร็จ! การ์ดในหน้าหลักจะอัปเดตทันที
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shopConfigs.map(item => {
            const currentTheme = COLOR_THEMES[item.colorTheme] || COLOR_THEMES.slate;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-gray-200 bg-slate-50/60 space-y-3"
              >
                {/* Live Card Preview Badge */}
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                  <span className="text-xs font-bold text-gray-400">
                    รหัสสถานี: <span className="text-gray-700">{item.id}</span>
                  </span>
                  <div className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-sm ${currentTheme.bg}`}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  {/* Icon Input */}
                  <div className="col-span-3">
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">ไอคอน</label>
                    <input
                      type="text"
                      value={item.icon}
                      onChange={e => handleUpdateCardField(item.id, 'icon', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-center font-extrabold text-sm bg-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  {/* Name Input */}
                  <div className="col-span-9">
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">ชื่อการ์ดแสดงผล</label>
                    <input
                      type="text"
                      value={item.label}
                      onChange={e => handleUpdateCardField(item.id, 'label', e.target.value)}
                      placeholder="เช่น ตู้แช่ 1, ก๋วยเตี๋ยวหมู..."
                      className="w-full p-2 border border-gray-300 rounded-lg font-bold text-xs bg-white text-gray-800 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Theme Selector - 16 Standard Color Swatches Without Text */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-gray-500 block">โทนสีการ์ด (เลือกสีมาตรฐาน 16 สี)</label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {currentTheme.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {Object.entries(COLOR_THEMES).map(([themeKey, themeObj]) => {
                      const isSelected = item.colorTheme === themeKey;
                      return (
                        <button
                          key={themeKey}
                          type="button"
                          onClick={() => handleUpdateCardField(item.id, 'colorTheme', themeKey)}
                          title={themeObj.label}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all shadow-2xs relative ${
                            isSelected
                              ? 'ring-2 ring-slate-900 ring-offset-2 scale-110 z-10 shadow-md'
                              : 'hover:scale-105 opacity-90 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: themeObj.colorCode }}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md space-y-4">
        <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          สำรองข้อมูลและรีเซ็ตระบบ
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>ดาวน์โหลด JSON สำรองข้อมูล</span>
          </button>

          <button
            onClick={handleResetData}
            className="p-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4 text-red-600" />
            <span>รีเซ็ตกลับเป็นข้อมูลตัวอย่าง</span>
          </button>
        </div>
      </div>

      {/* Deployment Instructions Box & Code Snippet */}
      <div className="bg-amber-50/80 p-6 rounded-2xl border border-amber-200 text-amber-900 space-y-4">
        <h5 className="font-bold text-base flex items-center gap-2 text-amber-900">
          💡 วิธีเชื่อมต่อและโค้ด Google Apps Script (Code.gs)
        </h5>

        <ol className="list-decimal list-inside text-xs space-y-2 text-amber-800 leading-relaxed font-medium">
          <li>เปิด Google Sheets ของร้านชามโปรด แล้วเลือกเมนู <b>ส่วนขยาย (Extensions) &gt; Apps Script</b></li>
          <li>คัดลอกโค้ด <code className="bg-amber-200/80 px-1.5 py-0.5 rounded font-mono text-amber-950">Code.gs</code> ด้านล่างนี้ไปวางแทนที่โค้ดเดิมใน Apps Script</li>
          <li>กดเมนู <b>ทำให้ใช้งานได้ (Deploy) &gt; การทบทวนรายการใหม่ (New Deployment)</b></li>
          <li>เลือกประเภทเป็น <b>เว็บแอป (Web App)</b> และตั้งค่า <i>Who has access (ผู้มีสิทธิ์เข้าถึง)</i> เป็น <b>Everyone (ทุกคน)</b></li>
          <li>คัดลอก Web App URL ที่ได้มาวางในช่องระบุ URL ด้านบน แล้วกด <b>บันทึก URL</b></li>
        </ol>

        {/* Code.gs Viewer & Copy */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto relative space-y-2 shadow-inner border border-slate-700">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700 text-slate-400 text-xs font-sans">
            <span className="font-bold flex items-center gap-1 text-amber-400">📄 Code.gs (สำหรับวางใน Google Apps Script - รองรับเช็คสต๊อกหลายรายการแบบรวดเร็ว)</span>
            <button
              onClick={() => {
                const gasCode = `function doGet(e) {
  var sheetName = e && e.parameter && e.parameter.sheet ? e.parameter.sheet : 'catalog';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.getSheets()[0]; // ใช้ชีตแรกหากหาชื่อชีตไม่เจอ
  }
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('บันทึกสต๊อก');
    if (!sheet) {
      sheet = ss.insertSheet('บันทึกสต๊อก');
      sheet.appendRow(['Timestamp', 'ผู้เช็ค/ผู้รับ', 'สถานี/ร้าน', 'ประเภท', 'หมวดหมู่', 'รายการ', 'จำนวน', 'หน่วย', 'ราคา', 'หมายเหตุ', 'แปลภาษา']);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#f3f4f6');
    }
    
    var payload = JSON.parse(e.postData.contents);
    var items = Array.isArray(payload) ? payload : [payload];
    
    var rows = items.map(function(item) {
      var ts = item.timestamp ? new Date(item.timestamp) : new Date();
      var formattedDate = Utilities.formatDate(ts, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
      return [
        formattedDate,
        item.checked_by || 'พนักงาน',
        item.station || '',
        item.action_type || 'เช็คสต็อก',
        item.category || '',
        item.item_name || '',
        item.quantity || 0,
        item.unit || '',
        item.price || '',
        item.note || '',
        item.translatedNote || ''
      ];
    });

    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 11).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
                navigator.clipboard.writeText(gasCode);
                alert('คัดลอกโค้ด Apps Script เรียบร้อยแล้ว!');
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px] transition-colors flex items-center gap-1 shadow"
            >
              <Copy className="w-3 h-3" /> คัดลอกโค้ด
            </button>
          </div>
          <pre className="text-emerald-300 leading-relaxed whitespace-pre font-mono">
{`function doGet(e) {
  var sheetName = e && e.parameter && e.parameter.sheet ? e.parameter.sheet : 'catalog';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('บันทึกสต๊อก');
    if (!sheet) {
      sheet = ss.insertSheet('บันทึกสต๊อก');
      sheet.appendRow(['Timestamp', 'ผู้เช็ค/ผู้รับ', 'สถานี/ร้าน', 'ประเภท', 'หมวดหมู่', 'รายการ', 'จำนวน', 'หน่วย', 'ราคา', 'หมายเหตุ', 'แปลภาษา']);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#f3f4f6');
    }
    
    var payload = JSON.parse(e.postData.contents);
    var items = Array.isArray(payload) ? payload : [payload];
    
    var rows = items.map(function(item) {
      var ts = item.timestamp ? new Date(item.timestamp) : new Date();
      var formattedDate = Utilities.formatDate(ts, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
      return [
        formattedDate,
        item.checked_by || 'พนักงาน',
        item.station || '',
        item.action_type || 'เช็คสต็อก',
        item.category || '',
        item.item_name || '',
        item.quantity || 0,
        item.unit || '',
        item.price || '',
        item.note || '',
        item.translatedNote || ''
      ];
    });

    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 11).setValues(rows);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
          </pre>
        </div>

        {/* Structural Breakdown & Template CSV Exporter */}
        <div className="bg-white p-5 rounded-xl border border-amber-200 text-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <h6 className="font-extrabold text-amber-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-600" />
              โครงสร้าง Google Sheet แนะนำสำหรับร้านชามโปรด (Database Schema)
            </h6>
            <button
              onClick={() => {
                const csvHeader = "sheet,category,name,unit,min,max,la,mm\n" +
                  "ก๋วยเตี๋ยวหมู,วัตถุดิบหลัก,เส้นเล็ก,ถุง,10,50,ເສັ້ນນ້ອຍ,ခေါက်ဆွဲသေး\n" +
                  "ก๋วยเตี๋ยวหมู,ลูกชิ้น,ลูกชิ้นหมู,กก.,5,20,ລູກຊິ້ນໝູ,ဝက်သားလုံး\n" +
                  "ก๋วยเตี๋ยวไก่,ผักสด,ถั่วงอก,กก.,3,15,ຖົ່ວງອກ,ပဲပင်ပေါက်\n" +
                  "ตู้แช่ 1,ของแช่เย็น,หมูเด้ง,ถุง,5,20,ໝູເດ້ງ,ဝက်သားအကြိတ်";
                
                const blob = new Blob(["\uFEFF" + csvHeader], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "cham_prod_catalog_template.csv";
                link.click();
              }}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              ดาวน์โหลดแม่แบบ CSV (catalog)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                📌 แผ่นงาน 1: <code className="bg-amber-100 text-amber-900 px-1 rounded font-mono">catalog</code> (หรือแยกชีตตามชื่อสถานี)
              </span>
              <p className="text-slate-600 text-[11px]">เก็บข้อมูลรายการสินค้า แคตตาล็อก และจุดแจ้งเตือนสต๊อกขั้นต่ำ</p>
              <div className="bg-white p-2 rounded border border-slate-200 overflow-x-auto text-[10px] font-mono text-slate-700">
                <span className="font-bold text-amber-800">คอลัมน์ A - H:</span><br/>
                sheet | category | name | unit | min | max | la | mm
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                📌 แผ่นงาน 2: <code className="bg-amber-100 text-amber-900 px-1 rounded font-mono">บันทึกสต๊อก</code> (ระบบสร้างให้อัตโนมัติ)
              </span>
              <p className="text-slate-600 text-[11px]">บันทึกประวัติการเช็คสต๊อกประจำวัน การรับวัตถุดิบเข้า และการจัดซื้อ</p>
              <div className="bg-white p-2 rounded border border-slate-200 overflow-x-auto text-[10px] font-mono text-slate-700">
                <span className="font-bold text-emerald-800">คอลัมน์ A - K:</span><br/>
                Timestamp | ผู้เช็ค/ผู้รับ | สถานี/ร้าน | ประเภท | หมวดหมู่ | รายการ | จำนวน | หน่วย | ราคา | หมายเหตุ | แปลภาษา
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
