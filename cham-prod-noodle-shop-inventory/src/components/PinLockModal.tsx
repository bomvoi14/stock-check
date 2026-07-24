import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, X, Check, ShieldAlert, Delete } from 'lucide-react';
import { verifyPin, isDefaultPin } from '../services/pinService';

interface PinLockModalProps {
  isOpen: boolean;
  targetTabName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  targetTabName,
  onSuccess,
  onCancel
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg(null);
      setShake(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg(null);

      // Auto submit on 4th digit
      if (nextPin.length === 4) {
        if (verifyPin(nextPin)) {
          onSuccess();
        } else {
          setShake(true);
          setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
          setTimeout(() => {
            setPin('');
            setShake(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all ${shake ? 'animate-bounce' : ''}`}>
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-6 text-white text-center relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-400/30 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-black tracking-tight">ยืนยันสิทธิ์ผู้จัดการ</h3>
          <p className="text-xs text-amber-200/80 font-medium mt-1">
            ใส่รหัส PIN เพื่อเข้าใช้งานเมนู <span className="font-bold text-amber-300 underline">{targetTabName}</span>
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 bg-slate-50/50">
          
          {/* PIN Dots Indicator */}
          <div className="flex justify-center items-center gap-4 py-2">
            {[0, 1, 2, 3].map(idx => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                  pin.length > idx
                    ? 'bg-amber-500 border-amber-500 scale-125 shadow-md shadow-amber-200'
                    : 'bg-white border-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Error Banner */}
          {errorMsg ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : isDefaultPin() ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2 rounded-xl text-[11px] font-medium text-center">
              💡 รหัสผ่านเริ่มต้นจากระบบคือ <span className="font-extrabold font-mono text-amber-950 bg-amber-200/80 px-1.5 py-0.5 rounded">1234</span>
            </div>
          ) : null}

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="w-16 h-16 rounded-2xl bg-white border border-gray-200 text-slate-800 text-2xl font-black shadow-sm hover:bg-amber-50 hover:border-amber-300 active:scale-95 transition-all flex items-center justify-center"
              >
                {num}
              </button>
            ))}
            
            <button
              type="button"
              onClick={handleClear}
              className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center"
            >
              ล้าง
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="w-16 h-16 rounded-2xl bg-white border border-gray-200 text-slate-800 text-2xl font-black shadow-sm hover:bg-amber-50 hover:border-amber-300 active:scale-95 transition-all flex items-center justify-center"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center"
              title="ลบตัวหลังสุด"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Footer Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
