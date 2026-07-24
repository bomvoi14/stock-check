import React, { useState } from 'react';
import { CatalogItem, ShopSheet, Language } from '../types';
import { i18nDict } from '../data/i18n';
import { Database, Plus, Edit2, Trash2, Search, Save, X, Layers } from 'lucide-react';

interface CatalogManagerViewProps {
  catalogItems: CatalogItem[];
  currentLang: Language;
  onSaveCatalog: (items: CatalogItem[]) => void;
}

const SHOPS: ShopSheet[] = [
  'ก๋วยเตี๋ยวหมู',
  'ก๋วยเตี๋ยวไก่',
  'อาหารตามสั่ง',
  'อุปกรณ์ในร้าน',
  'สำรอง1',
  'สำรอง2',
  'สำรอง3',
  'สำรอง4'
];

export const CatalogManagerView: React.FC<CatalogManagerViewProps> = ({
  catalogItems,
  currentLang,
  onSaveCatalog
}) => {
  const dict = i18nDict[currentLang];
  const [items, setItems] = useState<CatalogItem[]>(catalogItems);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterShop, setFilterShop] = useState<string>('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<CatalogItem>>({
    sheet: 'ก๋วยเตี๋ยวหมู',
    category: 'ทั่วไป',
    name: '',
    unit: 'ห่อ',
    min: 5,
    max: 15,
    la: '',
    mm: ''
  });

  const handleOpenAdd = () => {
    setEditingItem({
      id: `item_${Date.now()}`,
      sheet: 'ก๋วยเตี๋ยวหมู',
      category: 'ทั่วไป',
      name: '',
      unit: 'ห่อ',
      min: 5,
      max: 15,
      la: '',
      mm: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CatalogItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDuplicateToStation = (item: CatalogItem) => {
    setEditingItem({
      ...item,
      id: `item_${Date.now()}`,
      sheet: item.sheet === 'อุปกรณ์ในร้าน' ? 'ก๋วยเตี๋ยวหมู' : 'อุปกรณ์ในร้าน'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบรายการนี้ออกจากแคตตาล็อกใช่หรือไม่?')) {
      const updated = items.filter(i => i.id !== id);
      setItems(updated);
      onSaveCatalog(updated);
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.name?.trim()) {
      alert('กรุณากรอกชื่อสินค้า');
      return;
    }

    const newItem: CatalogItem = {
      id: editingItem.id || `item_${Date.now()}`,
      sheet: editingItem.sheet || 'ก๋วยเตี๋ยวหมู',
      category: editingItem.category?.trim() || 'ทั่วไป',
      name: editingItem.name.trim(),
      unit: editingItem.unit?.trim() || 'ชิ้น',
      min: Number(editingItem.min) || 0,
      max: Number(editingItem.max) || 0,
      la: editingItem.la?.trim() || '',
      mm: editingItem.mm?.trim() || ''
    };

    let updated: CatalogItem[];
    const exists = items.some(i => i.id === newItem.id);

    if (exists) {
      updated = items.map(i => (i.id === newItem.id ? newItem : i));
    } else {
      updated = [newItem, ...items];
    }

    setItems(updated);
    onSaveCatalog(updated);
    setIsModalOpen(false);
  };

  // Filter Catalog
  const filtered = items.filter(item => {
    const matchShop = !filterShop || item.sheet === filterShop;
    const matchQuery =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.la && item.la.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.mm && item.mm.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchShop && matchQuery;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div>
          <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2 justify-center md:justify-start">
            <Database className="w-5 h-5 text-purple-600" />
            {dict.manageCatalog}
          </h3>
          <p className="text-xs md:text-sm text-purple-700">
            เพิ่ม แก้ไข ปรับจุดสั่งซื้อ (Min/Max) และจัดการคำแปลภาษาลาว/พม่า
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 border border-purple-500"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.addItem}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า หมวดหมู่ หรือคำแปล..."
            className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:border-purple-500 outline-none"
          />
        </div>

        <select
          value={filterShop}
          onChange={e => setFilterShop(e.target.value)}
          className="w-full p-2.5 border rounded-xl text-sm focus:border-purple-500 outline-none bg-white font-medium"
        >
          <option value="">{dict.allShops}</option>
          {SHOPS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Master Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-purple-100/70 text-purple-950 border-b border-purple-200">
              <tr>
                <th className="p-3.5 text-center font-bold">{dict.colShop}</th>
                <th className="p-3.5 text-left font-bold">{dict.category}</th>
                <th className="p-3.5 text-left font-bold">{dict.colItem}</th>
                <th className="p-3.5 text-center font-bold">ภาษาลาว / พม่า</th>
                <th className="p-3.5 text-center font-bold">{dict.colMinMax}</th>
                <th className="p-3.5 text-center font-bold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-gray-400 font-bold">
                    ไม่พบรายการสินค้าในแคตตาล็อก
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-purple-50/20">
                    <td className="p-3.5 text-center text-xs font-bold text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded-lg">{item.sheet}</span>
                    </td>

                    <td className="p-3.5 font-medium text-gray-700 text-xs">
                      {item.category}
                    </td>

                    <td className="p-3.5 font-bold text-gray-900">
                      <div>
                        {item.name} <span className="text-xs text-gray-400 font-normal">({item.unit})</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-center text-xs text-gray-500">
                      <div>🇱🇦 {item.la || '-'}</div>
                      <div>🇲🇲 {item.mm || '-'}</div>
                    </td>

                    <td className="p-3.5 text-center text-xs font-bold text-purple-900">
                      Min: {item.min} | Max: {item.max}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleDuplicateToStation(item)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1"
                          title="เพิ่มสินค้าเดียวกันไปยังจุดจัดเก็บอื่น"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border-t-8 border-purple-600 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              {editingItem.id ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่ในแคตตาล็อก'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{dict.shopStation}</label>
                  <select
                    value={editingItem.sheet}
                    onChange={e => setEditingItem({ ...editingItem, sheet: e.target.value as ShopSheet })}
                    className="w-full p-2.5 border rounded-xl font-medium focus:border-purple-500 outline-none"
                  >
                    {SHOPS.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{dict.category}</label>
                  <input
                    type="text"
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                    placeholder="เช่น เส้นก๋วยเตี๋ยว, ผักสด"
                    className="w-full p-2.5 border rounded-xl focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">ชื่อสินค้า (ภาษาไทย)*</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="เช่น เส้นเล็ก, หมูสด"
                    className="w-full p-2.5 border rounded-xl font-bold focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{dict.colUnit}</label>
                  <input
                    type="text"
                    required
                    value={editingItem.unit}
                    onChange={e => setEditingItem({ ...editingItem, unit: e.target.value })}
                    placeholder="เช่น ห่อ, กก."
                    className="w-full p-2.5 border rounded-xl focus:border-purple-500 outline-none text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{dict.minStock}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editingItem.min}
                    onChange={e => setEditingItem({ ...editingItem, min: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border rounded-xl font-bold text-center text-red-600 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{dict.maxStock}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editingItem.max}
                    onChange={e => setEditingItem({ ...editingItem, max: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 border rounded-xl font-bold text-center text-emerald-600 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">🇱🇦 ชื่อภาษาลาว (LA)</label>
                  <input
                    type="text"
                    value={editingItem.la}
                    onChange={e => setEditingItem({ ...editingItem, la: e.target.value })}
                    placeholder="คำแปลภาษาลาว..."
                    className="w-full p-2.5 border rounded-xl focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">🇲🇲 ชื่อภาษาพม่า (MM)</label>
                  <input
                    type="text"
                    value={editingItem.mm}
                    onChange={e => setEditingItem({ ...editingItem, mm: e.target.value })}
                    placeholder="คำแปลภาษาพม่า..."
                    className="w-full p-2.5 border rounded-xl focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 p-3 border-2 border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกสินค้า</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
