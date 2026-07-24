import React, { useState } from 'react';
import { CatalogItem, StockTransaction, Language } from '../types';
import { computeMultiLocationInventory } from '../services/inventoryAggregator';
import { Layers, Search, X, Package, AlertTriangle, MapPin, CheckCircle2, Filter, Building2 } from 'lucide-react';

interface MultiLocationOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogItems: CatalogItem[];
  historyLogs: StockTransaction[];
  currentLang: Language;
}

export const MultiLocationOverviewModal: React.FC<MultiLocationOverviewModalProps> = ({
  isOpen,
  onClose,
  catalogItems,
  historyLogs,
  currentLang
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const aggregatedList = computeMultiLocationInventory(catalogItems, historyLogs);

  // Extract unique categories
  const categories = Array.from(new Set(aggregatedList.map(item => item.category))).filter(Boolean);

  const filtered = aggregatedList.filter(item => {
    const normSearch = searchQuery.trim().toLowerCase();
    const matchSearch =
      !normSearch ||
      item.itemName.toLowerCase().includes(normSearch) ||
      item.category.toLowerCase().includes(normSearch) ||
      (item.la && item.la.toLowerCase().includes(normSearch)) ||
      (item.mm && item.mm.toLowerCase().includes(normSearch)) ||
      item.stations.some(s => s.station.toLowerCase().includes(normSearch));

    const matchLow = !filterLowStockOnly || item.isLowStock;
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;

    return matchSearch && matchLow && matchCat;
  });

  const lowStockCount = aggregatedList.filter(i => i.isLowStock).length;
  const normalStockCount = aggregatedList.length - lowStockCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] text-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-400/30 shadow-inner shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black tracking-tight flex items-center gap-2">
                ภาพรวมวัตถุดิบรวมทุกจุดจัดเก็บ
                <span className="bg-amber-500/30 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-400/30">
                  {aggregatedList.length} รายการ
                </span>
              </h3>
              <p className="text-xs text-amber-200/80 hidden sm:block">
                รวมยอดวัตถุดิบชนิดเดียวกันอัตโนมัติจากทุกสถานีและจุดจัดเก็บในร้าน
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors shrink-0"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar: Search + Filter Pills + KPI Counters */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-gray-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อวัตถุดิบ, หมวดหมู่, จุดจัดเก็บ..."
                className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-xl text-xs font-bold outline-none focus:border-amber-500 bg-white shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filter Status Badges */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterLowStockOnly(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border shrink-0 ${
                  !filterLowStockOnly
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <span>รายการทั้งหมด</span>
                <span className="bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded-md text-[10px]">
                  {aggregatedList.length}
                </span>
              </button>

              <button
                onClick={() => setFilterLowStockOnly(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all border shrink-0 ${
                  filterLowStockOnly
                    ? 'bg-red-600 text-white border-red-700 shadow-sm'
                    : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>เหลือน้อย (Min)</span>
                <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-md text-[10px]">
                  {lowStockCount}
                </span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
              <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
                <Filter className="w-3 h-3" /> หมวดหมู่:
              </span>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === 'ALL'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                ทุกหมวดหมู่
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Container with Frozen Sticky Header */}
        <div className="overflow-auto grow bg-slate-50/50 max-h-[68vh] relative">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500 font-bold bg-white m-4 rounded-2xl border border-dashed border-gray-300">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">ไม่พบข้อมูลรายการวัตถุดิบตามเงื่อนไขค้นหา</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* Sticky Table Header */}
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="sticky top-0 z-20 bg-slate-900 text-amber-400 text-xs font-black py-3 px-3 sm:px-4 w-12 text-center uppercase tracking-wider shadow-sm">
                    #
                  </th>
                  <th className="sticky top-0 z-20 bg-slate-900 text-slate-200 text-xs font-black py-3 px-3 sm:px-4 uppercase tracking-wider shadow-sm w-32">
                    หมวดหมู่
                  </th>
                  <th className="sticky top-0 z-20 bg-slate-900 text-slate-200 text-xs font-black py-3 px-3 sm:px-4 uppercase tracking-wider shadow-sm">
                    ชื่อวัตถุดิบ
                  </th>
                  <th className="sticky top-0 z-20 bg-slate-900 text-slate-200 text-xs font-black py-3 px-3 sm:px-4 text-right uppercase tracking-wider shadow-sm w-36">
                    คงเหลือรวม
                  </th>
                  <th className="sticky top-0 z-20 bg-slate-900 text-slate-200 text-xs font-black py-3 px-3 sm:px-4 text-center uppercase tracking-wider shadow-sm w-36">
                    สถานะ
                  </th>
                  <th className="sticky top-0 z-20 bg-slate-900 text-slate-200 text-xs font-black py-3 px-3 sm:px-4 uppercase tracking-wider shadow-sm">
                    กระจายจัดเก็บ (จุด & จำนวน)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 text-xs font-medium bg-white">
                {filtered.map((item, idx) => {
                  const displayName =
                    currentLang === 'la'
                      ? item.la || item.itemName
                      : currentLang === 'mm'
                      ? item.mm || item.itemName
                      : item.itemName;

                  return (
                    <tr
                      key={item.itemName}
                      className={`transition-colors odd:bg-white even:bg-slate-50/70 hover:bg-amber-50/70 ${
                        item.isLowStock ? 'bg-red-50/50 hover:bg-red-100/60 border-l-4 border-l-red-500' : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono text-gray-400 font-bold">
                        {idx + 1}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 sm:px-4 font-bold text-gray-700 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-extrabold inline-block shadow-2xs">
                          {item.category}
                        </span>
                      </td>

                      {/* Item Name */}
                      <td className="py-3 px-3 sm:px-4 font-black text-slate-800 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span>{displayName}</span>
                          {currentLang !== 'th' && (
                            <span className="text-xs text-gray-400 font-normal">({item.itemName})</span>
                          )}
                        </div>
                      </td>

                      {/* Grand Total Quantity */}
                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-black text-base tracking-tight font-mono ${
                            item.isLowStock ? 'text-red-600' : 'text-slate-900'
                          }`}
                        >
                          {item.grandTotalQty}{' '}
                          <span className="text-xs font-bold text-gray-500 font-sans">{item.unit}</span>
                        </span>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        {item.isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-700 border border-red-300 shadow-2xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            เหลือน้อย (Min {item.totalMinQty})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ปกติ (Min {item.totalMinQty})
                          </span>
                        )}
                      </td>

                      {/* Station Breakdown Badges */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.stations.map((st, sIdx) => (
                            <div
                              key={sIdx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50/60 border border-amber-200/90 rounded-lg text-slate-700 text-[11px] font-bold hover:bg-amber-100 transition-colors shadow-2xs"
                            >
                              <Building2 className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-slate-600">{st.station}:</span>
                              <span className="font-mono font-black text-amber-900">
                                {st.qty} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-900 text-slate-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 border-t border-slate-800">
          <span className="text-amber-400 font-medium text-center sm:text-left flex items-center gap-1">
            💡 แสดงแนวแถวแบบตรึงหัวตาราง รวมยอดวัตถุดิบอัตโนมัติจากทุกล็อกจัดเก็บ
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-colors shadow shrink-0"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
