import React from 'react';
import { Language } from '../types';
import { i18nDict } from '../data/i18n';
import { Utensils, Globe, Database, WifiOff, RefreshCw, Settings } from 'lucide-react';

interface HeaderProps {
  currentLang: Language;
  onSetLang: (lang: Language) => void;
  dataMode: 'gas' | 'local';
  onRefreshData?: () => void;
  isLoading?: boolean;
  onOpenSettings?: () => void;
  isSettingsActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSetLang,
  dataMode,
  onRefreshData,
  isLoading,
  onOpenSettings,
  isSettingsActive
}) => {
  const dict = i18nDict[currentLang];

  return (
    <header className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white rounded-2xl p-4 md:p-6 shadow-xl mb-6 relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-white text-amber-600 rounded-2xl flex items-center justify-center shadow-lg font-black text-2xl shrink-0 border-2 border-amber-200">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm flex items-center gap-2 justify-center md:justify-start">
              {dict.title}
              <span className="text-xs bg-amber-800/40 text-amber-100 font-semibold px-2.5 py-0.5 rounded-full border border-amber-300/30">
                ERP v2.5
              </span>
            </h1>
            <p className="text-xs md:text-sm text-amber-100 font-medium mt-0.5">
              {dict.subtitle}
            </p>
          </div>
        </div>

        {/* Status Badge & Language Switcher */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3 w-full md:w-auto">
          {/* Connection Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/30 backdrop-blur-md text-xs font-semibold border border-amber-300/30">
            {dataMode === 'gas' ? (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span className="text-emerald-200">Google Sheets API</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-200" />
                <span className="text-amber-100">Local Cache Mode</span>
              </>
            )}
            {onRefreshData && (
              <button
                onClick={onRefreshData}
                disabled={isLoading}
                title="Refresh Data"
                className="ml-1 p-1 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* Language Selector */}
          <div className="flex bg-amber-950/40 p-1 rounded-xl backdrop-blur-md border border-amber-300/30 shadow-inner">
            <button
              onClick={() => onSetLang('th')}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-1 ${
                currentLang === 'th'
                  ? 'bg-white text-amber-700 shadow-md scale-105'
                  : 'text-amber-100 hover:text-white hover:bg-white/10'
              }`}
            >
              🇹🇭 TH
            </button>
            <button
              onClick={() => onSetLang('la')}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-1 ${
                currentLang === 'la'
                  ? 'bg-white text-amber-700 shadow-md scale-105'
                  : 'text-amber-100 hover:text-white hover:bg-white/10'
              }`}
            >
              🇱🇦 LA
            </button>
            <button
              onClick={() => onSetLang('mm')}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-1 ${
                currentLang === 'mm'
                  ? 'bg-white text-amber-700 shadow-md scale-105'
                  : 'text-amber-100 hover:text-white hover:bg-white/10'
              }`}
            >
              🇲🇲 MM
            </button>
          </div>

          {/* Quick Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold shadow ${
                isSettingsActive
                  ? 'bg-white text-amber-800 border-white shadow-md scale-105 font-black'
                  : 'bg-amber-950/40 hover:bg-white/20 text-white border-amber-300/30'
              }`}
              title="ตั้งค่าระบบ & Sheets"
            >
              <Settings className={`w-4 h-4 ${isSettingsActive ? 'text-amber-700 animate-spin-slow' : 'text-amber-200'}`} />
              <span className="hidden sm:inline">ตั้งค่าระบบ</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
