import React from 'react';
import { Language } from '../types';
import { i18nDict } from '../data/i18n';
import { ClipboardCheck, PackagePlus, ShoppingCart, History, Database, Settings, Lock } from 'lucide-react';

export type ActiveTab = 'check' | 'receive' | 'restock' | 'history' | 'catalog' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentLang: Language;
  restockCount?: number;
  isPinLocked?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  currentLang,
  restockCount = 0,
  isPinLocked = false
}) => {
  const dict = i18nDict[currentLang];

  const tabs = [
    { id: 'check' as ActiveTab, label: dict.modeCheck, icon: ClipboardCheck, color: 'bg-amber-500 text-white', protected: false },
    { id: 'receive' as ActiveTab, label: dict.modeReceive, icon: PackagePlus, color: 'bg-blue-600 text-white', protected: false },
    { 
      id: 'restock' as ActiveTab, 
      label: dict.restockBtn, 
      icon: ShoppingCart, 
      color: 'bg-red-600 text-white',
      badge: restockCount > 0 ? restockCount : undefined,
      protected: false
    },
    { id: 'history' as ActiveTab, label: dict.historyBtn, icon: History, color: 'bg-emerald-600 text-white', protected: false },
    { id: 'catalog' as ActiveTab, label: dict.catalogBtn, icon: Database, color: 'bg-purple-600 text-white', protected: true }
  ];

  return (
    <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const showLock = tab.protected && isPinLocked;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-3 px-2 rounded-xl font-bold transition-all text-[11px] sm:text-xs md:text-sm flex flex-col sm:flex-row items-center justify-center gap-1.5 md:gap-2 border-2 relative ${
                isActive
                  ? `${tab.color} border-transparent shadow-md scale-[1.02]`
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                {showLock && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-900 p-0.5 rounded-full border border-white shadow-sm" title="ต้องใช้รหัสผ่านผู้จัดการ">
                    <Lock className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <span className="truncate text-center">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

