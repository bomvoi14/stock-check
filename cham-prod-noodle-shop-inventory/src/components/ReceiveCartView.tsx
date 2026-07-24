import React, { useState } from 'react';
import { CatalogItem, StockTransaction, Language } from '../types';
import { i18nDict } from '../data/i18n';
import { PackagePlus, Search, ShoppingBag, Trash2, Plus, Minus, UserCheck, CheckCircle2 } from 'lucide-react';

interface ReceiveCartViewProps {
  catalogItems: CatalogItem[];
  currentLang: Language;
  onSaveReceive: (transactions: StockTransaction[]) => Promise<void>;
  isSaving: boolean;
  onRequestConfirmModal: (items: any[], onConfirm: () => void) => void;
}

interface CartItem {
  catalogItem: CatalogItem;
  qty: number;
  price: number | string;
  note: string;
}

export const ReceiveCartView: React.FC<ReceiveCartViewProps> = ({
  catalogItems,
  currentLang,
  onSaveReceive,
  isSaving,
  onRequestConfirmModal
}) => {
  const dict = i18nDict[currentLang];
  const [staffName, setStaffName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Filter autocomplete catalog items
  const filteredCatalog = searchQuery.trim()
    ? catalogItems
        .filter(item => {
          const q = searchQuery.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            (item.la && item.la.toLowerCase().includes(q)) ||
            (item.mm && item.mm.toLowerCase().includes(q)) ||
            item.category.toLowerCase().includes(q) ||
            item.sheet.toLowerCase().includes(q)
          );
        })
        .slice(0, 12)
    : [];

  const handleAddToCart = (item: CatalogItem) => {
    setSearchQuery('');
    setShowDropdown(false);

    setCart(prev => {
      const existingIdx = prev.findIndex(
        c => c.catalogItem.id === item.id || (c.catalogItem.name === item.name && c.catalogItem.sheet === item.sheet)
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].qty += 1;
        return updated;
      } else {
        return [
          {
            catalogItem: item,
            qty: 1,
            price: '',
            note: ''
          },
          ...prev
        ];
      }
    });
  };

  const handleUpdateCart = (index: number, field: 'qty' | 'price' | 'note', value: any) => {
    setCart(prev => {
      const updated = [...prev];
      if (field === 'qty') {
        updated[index].qty = Math.max(0.1, parseFloat(value) || 0);
      } else if (field === 'price') {
        updated[index].price = value;
      } else if (field === 'note') {
        updated[index].note = value;
      }
      return updated;
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(String(item.price)) || 0), 0);

  const handlePrepareSave = () => {
    if (!staffName.trim()) {
      alert(`⚠️ ${dict.staffRequiredAlert}`);
      return;
    }

    if (cart.length === 0) {
      alert(`⚠️ ${dict.emptyCartAlert}`);
      return;
    }

    const pendingTransactions: StockTransaction[] = [];
    const modalItems: any[] = [];

    cart.forEach(c => {
      const q = parseFloat(String(c.qty)) || 0;
      const p = parseFloat(String(c.price)) || 0;

      if (q > 0) {
        pendingTransactions.push({
          checked_by: staffName.trim(),
          station: c.catalogItem.sheet,
          action_type: 'รับเข้า',
          category: c.catalogItem.category,
          item_name: c.catalogItem.name,
          quantity: q,
          unit: c.catalogItem.unit,
          price: p,
          note: c.note.trim(),
          timestamp: new Date().toISOString()
        });

        modalItems.push({
          name: c.catalogItem.name,
          station: c.catalogItem.sheet,
          qty: q,
          unit: c.catalogItem.unit,
          price: p,
          note: c.note.trim()
        });
      }
    });

    if (pendingTransactions.length === 0) {
      alert('⚠️ กรุณาระบุจำนวนสินค้าให้ถูกต้อง');
      return;
    }

    onRequestConfirmModal(modalItems, () => {
      onSaveReceive(pendingTransactions);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div>
          <h3 className="font-bold text-blue-900 text-lg flex items-center gap-2 justify-center md:justify-start">
            <PackagePlus className="w-5 h-5 text-blue-600" />
            {dict.modeReceive}
          </h3>
          <p className="text-xs md:text-sm text-blue-700">
            ค้นหาสินค้า เพิ่มลงบิล ระบุราคา และบันทึกเข้าคลังสินค้า
          </p>
        </div>
      </div>

      {/* Staff Name Input */}
      <div className="relative">
        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
        <input
          type="text"
          value={staffName}
          onChange={e => setStaffName(e.target.value)}
          placeholder={dict.staffPlaceholder}
          className="w-full pl-12 pr-4 py-3.5 border-2 border-blue-300 rounded-2xl font-bold text-center text-gray-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Live Catalog Search with Dropdown Autocomplete */}
      <div className="relative z-30">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setShowDropdown(true)}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            placeholder={dict.searchPh}
            className="w-full pl-12 pr-4 py-4 border-2 border-blue-400 rounded-2xl font-bold text-lg outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 shadow-md transition-all text-gray-800"
          />
        </div>

        {/* Autocomplete Dropdown List */}
        {showDropdown && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-2xl shadow-2xl max-h-72 overflow-y-auto z-40 divide-y divide-gray-100">
            {filteredCatalog.length === 0 ? (
              <div className="p-4 text-center text-gray-400 font-medium">
                ไม่พบสินค้า "{searchQuery}"
              </div>
            ) : (
              filteredCatalog.map(item => {
                const displayName =
                  currentLang === 'la' ? item.la || item.name : currentLang === 'mm' ? item.mm || item.name : item.name;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleAddToCart(item)}
                    className="p-3.5 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        {displayName}
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {item.unit}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 font-semibold mt-0.5">
                        📍 {item.sheet} • {item.category}
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow hover:bg-blue-700 transition-colors">
                      + เพิ่ม
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Shopping Cart List */}
      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-blue-900 text-base md:text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            {dict.cartTitle}
          </h3>
          <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full text-xs shadow">
            {cart.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden mb-4">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-blue-100 text-blue-950">
              <tr>
                <th className="p-3 text-left font-bold w-2/5">{dict.colItem}</th>
                <th className="p-3 text-center font-bold">{dict.colQty}</th>
                <th className="p-3 text-center font-bold">{dict.colPrice}</th>
                <th className="p-3 text-center w-12">🗑️</th>
              </tr>
            </thead>
            <tbody>
              {cart.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-gray-400 font-medium">
                    {dict.emptyCart}
                  </td>
                </tr>
              ) : (
                cart.map((item, idx) => {
                  const displayName =
                    currentLang === 'la'
                      ? item.catalogItem.la || item.catalogItem.name
                      : currentLang === 'mm'
                      ? item.catalogItem.mm || item.catalogItem.name
                      : item.catalogItem.name;

                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/30">
                      <td className="p-3">
                        <div className="font-bold text-gray-800">{displayName}</div>
                        <div className="text-xs text-blue-600 font-medium">
                          📍 {item.catalogItem.sheet}
                        </div>
                        <input
                          type="text"
                          value={item.note}
                          onChange={e => handleUpdateCart(idx, 'note', e.target.value)}
                          placeholder="หมายเหตุเพิ่มเติม..."
                          className="mt-1 w-full text-xs p-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:border-blue-400 outline-none"
                        />
                      </td>

                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.qty}
                            onChange={e => handleUpdateCart(idx, 'qty', e.target.value)}
                            className="w-16 h-9 text-center border-2 border-blue-200 rounded-lg font-bold text-base outline-none focus:border-blue-500 text-blue-900"
                          />
                          <span className="text-xs text-gray-500 font-medium">
                            {item.catalogItem.unit}
                          </span>
                        </div>
                      </td>

                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={e => handleUpdateCart(idx, 'price', e.target.value)}
                          placeholder="0"
                          className="w-20 h-9 text-center border-2 border-emerald-200 rounded-lg font-bold text-base text-emerald-700 outline-none focus:border-emerald-500"
                        />
                      </td>

                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveFromCart(idx)}
                          className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Total Price Display */}
        <div className="p-4 bg-white rounded-2xl border-2 border-blue-200 shadow-sm flex justify-between items-center">
          <span className="font-bold text-gray-700 text-sm md:text-base">{dict.totalPrice}</span>
          <span className="font-black text-2xl md:text-3xl text-emerald-600">
            ฿{totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handlePrepareSave}
        disabled={isSaving}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform active:scale-98 flex justify-center items-center gap-2 border border-blue-500"
      >
        <CheckCircle2 className="w-6 h-6" />
        <span>{dict.saveReceiveBtn}</span>
      </button>
    </div>
  );
};
