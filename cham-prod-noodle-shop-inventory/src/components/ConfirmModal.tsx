import React from 'react';
import { Language } from '../types';
import { i18nDict } from '../data/i18n';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  items: {
    name: string;
    station?: string;
    qty: number;
    unit: string;
    price?: number | string;
    note?: string;
  }[];
  onConfirm: () => void;
  onClose: () => void;
  isSaving: boolean;
  currentLang: Language;
  accentColor?: 'amber' | 'blue' | 'emerald';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  items,
  onConfirm,
  onClose,
  isSaving,
  currentLang,
  accentColor = 'amber'
}) => {
  if (!isOpen) return null;

  const dict = i18nDict[currentLang];

  const colorStyles = {
    amber: {
      border: 'border-t-8 border-amber-500',
      title: 'text-amber-700',
      btn: 'bg-amber-500 hover:bg-amber-600 text-white'
    },
    blue: {
      border: 'border-t-8 border-blue-600',
      title: 'text-blue-700',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    emerald: {
      border: 'border-t-8 border-emerald-600',
      title: 'text-emerald-700',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
  }[accentColor];

  const totalPrice = items.reduce((sum, i) => sum + (parseFloat(String(i.price)) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl ${colorStyles.border} relative max-h-[90vh] flex flex-col`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className={`text-xl font-bold ${colorStyles.title} mb-4 text-center flex items-center justify-center gap-2`}>
          <CheckCircle2 className="w-6 h-6" />
          {title || dict.confirmTitle}
        </h3>

        <div className="overflow-y-auto max-h-[50vh] mb-4 space-y-2 text-sm border p-3 rounded-xl bg-gray-50 shadow-inner">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-start border-b border-gray-200 pb-2.5 pt-1 last:border-0"
            >
              <div className="flex flex-col font-medium text-gray-800">
                <span>
                  {item.name}
                  {item.station && (
                    <span className="text-xs font-normal text-gray-500 ml-1.5 bg-gray-200/60 px-1.5 py-0.5 rounded">
                      {item.station}
                    </span>
                  )}
                </span>
                {item.note && (
                  <span className="text-xs text-amber-700 font-normal mt-0.5 flex items-center gap-1">
                    📝 {item.note}
                  </span>
                )}
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="font-bold text-red-600">
                  {item.qty} <span className="text-xs text-gray-600 font-normal">{item.unit}</span>
                </div>
                {item.price !== undefined && parseFloat(String(item.price)) > 0 && (
                  <div className="text-xs font-bold text-emerald-600 mt-0.5">
                    ฿{parseFloat(String(item.price)).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalPrice > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center text-sm font-bold text-blue-900">
            <span>{dict.totalPrice}</span>
            <span className="text-lg text-emerald-700 font-black">
              ฿{totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 p-3 border-2 border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm"
          >
            {dict.editBtn}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSaving}
            className={`flex-1 p-3 rounded-xl font-bold shadow-md transition-colors text-sm flex items-center justify-center gap-2 ${colorStyles.btn} ${
              isSaving ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {dict.saving}
              </>
            ) : (
              dict.confirmBtn
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
