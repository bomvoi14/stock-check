import React, { useState } from 'react';
import { StockTransaction, Language } from '../types';
import { i18nDict } from '../data/i18n';
import { History, Calendar, Filter, User, Building, Banknote, Search } from 'lucide-react';

interface HistoryViewProps {
  historyLogs: StockTransaction[];
  currentLang: Language;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyLogs,
  currentLang
}) => {
  const dict = i18nDict[currentLang];

  const [filterDate, setFilterDate] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterShop, setFilterShop] = useState<string>('');
  const [filterStaff, setFilterStaff] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique shop stations & staff for filter dropdowns
  const uniqueShops = Array.from(new Set(historyLogs.map(l => l.station).filter(Boolean)));
  const uniqueStaff = Array.from(new Set(historyLogs.map(l => l.checked_by).filter(Boolean)));

  // Filter logs logic
  let filtered = [...historyLogs];

  if (filterDate) {
    filtered = filtered.filter(l => {
      if (!l.timestamp) return false;
      return l.timestamp.startsWith(filterDate);
    });
  }

  if (filterAction) {
    if (filterAction === 'เช็คสต็อก') {
      filtered = filtered.filter(l => !l.action_type || l.action_type === 'เช็คสต็อก');
    } else if (filterAction === 'รับเข้า') {
      filtered = filtered.filter(l => l.action_type === 'รับเข้า');
    }
  }

  if (filterShop) {
    filtered = filtered.filter(l => l.station === filterShop);
  }

  if (filterStaff) {
    filtered = filtered.filter(l => l.checked_by === filterStaff);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      l =>
        l.item_name.toLowerCase().includes(q) ||
        (l.note && l.note.toLowerCase().includes(q)) ||
        l.category.toLowerCase().includes(q)
    );
  }

  // Sort descending by timestamp
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Statistics
  const totalReceiveCost = filtered
    .filter(l => l.action_type === 'รับเข้า')
    .reduce((sum, l) => sum + (parseFloat(String(l.price)) || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div>
          <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2 justify-center md:justify-start">
            <History className="w-5 h-5 text-emerald-600" />
            {dict.searchTitle}
          </h3>
          <p className="text-xs md:text-sm text-emerald-700">
            ดูย้อนหลังการตรวจนับและรับสินค้าเข้าคลัง พร้อมตัวกรองตามวันที่และสถานี
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">จำนวนบันทึกทั้งหมด</div>
            <div className="text-xl font-black text-gray-800">{filtered.length} รายการ</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl font-bold">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">ยอดรับของเข้าคลังรวม</div>
            <div className="text-xl font-black text-emerald-600">
              ฿{totalReceiveCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:col-span-2 md:col-span-1">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">พนักงานผู้บันทึกในระบบ</div>
            <div className="text-xl font-black text-amber-800">{uniqueStaff.length} คน</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-1">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>ตัวกรองค้นหาประวัติ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Date */}
          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full p-2.5 border rounded-xl font-medium text-sm text-gray-700 bg-gray-50 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Action Type */}
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="w-full p-2.5 border rounded-xl font-medium text-sm text-blue-900 bg-blue-50/60 focus:border-emerald-500 outline-none"
          >
            <option value="">{dict.allActions}</option>
            <option value="เช็คสต็อก">📝 ตรวจนับสต็อก</option>
            <option value="รับเข้า">📥 รับของเข้า</option>
          </select>

          {/* Shop */}
          <select
            value={filterShop}
            onChange={e => setFilterShop(e.target.value)}
            className="w-full p-2.5 border rounded-xl font-medium text-sm text-gray-700 bg-gray-50 focus:border-emerald-500 outline-none"
          >
            <option value="">{dict.allShops}</option>
            {uniqueShops.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Staff */}
          <select
            value={filterStaff}
            onChange={e => setFilterStaff(e.target.value)}
            className="w-full p-2.5 border rounded-xl font-medium text-sm text-gray-700 bg-gray-50 focus:border-emerald-500 outline-none"
          >
            <option value="">{dict.allStaff}</option>
            {uniqueStaff.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative pt-1">
          <Search className="absolute left-3 top-4 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ค้นหาตามชื่อสินค้า หรือหมายเหตุ..."
            className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs md:text-sm text-gray-800 bg-gray-50/50 focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="p-3.5 text-center font-bold w-1/5">เวลา / ร้าน</th>
                <th className="p-3.5 text-left font-bold">{dict.colItem}</th>
                <th className="p-3.5 text-center font-bold">{dict.colAction}</th>
                <th className="p-3.5 text-center font-bold">{dict.colStaff}</th>
                <th className="p-3.5 text-right font-bold w-1/5">{dict.colQty}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-12 text-gray-400 font-bold">
                    ⚠️ {dict.noRecord}
                  </td>
                </tr>
              ) : (
                filtered.map((log, idx) => {
                  const action = log.action_type || 'เช็คสต็อก';
                  const isReceive = action === 'รับเข้า';
                  const qtyVal = parseFloat(String(log.quantity)) || 0;
                  const priceVal = parseFloat(String(log.price)) || 0;

                  const dateObj = log.timestamp ? new Date(log.timestamp) : new Date();
                  const dateFormatted = dateObj.toLocaleDateString('th-TH', {
                    day: '2-digit',
                    month: '2-digit'
                  });
                  const timeFormatted = dateObj.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr
                      key={log.id || idx}
                      className={`${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                      } hover:bg-emerald-50/30 transition-colors border-b border-gray-100`}
                    >
                      <td className="p-3.5 text-center">
                        <div className="text-xs text-gray-400 font-medium">
                          {dateFormatted} • {timeFormatted}
                        </div>
                        <div className="font-extrabold text-gray-800 text-xs mt-0.5">
                          📍 {log.station}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-gray-900">{log.item_name}</div>
                        {log.note && (
                          <div className="text-xs text-gray-500 font-normal mt-0.5 bg-gray-100 p-1 rounded">
                            📝 {log.note}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-black border ${
                            isReceive
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {isReceive ? '📥 รับเข้า' : '📝 เช็คสต็อก'}
                        </span>
                      </td>

                      <td className="p-3.5 text-center text-xs font-semibold text-gray-600">
                        {log.checked_by || '-'}
                      </td>

                      <td className="p-3.5 text-right font-black">
                        {isReceive ? (
                          <div>
                            <span className="text-blue-600 text-base">
                              +{qtyVal} <span className="text-xs text-gray-500">{log.unit}</span>
                            </span>
                            {priceVal > 0 && (
                              <div className="text-xs text-emerald-600 font-bold mt-0.5">
                                ฿{priceVal.toLocaleString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-amber-800 text-base">
                            {qtyVal} <span className="text-xs text-gray-500">{log.unit}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
