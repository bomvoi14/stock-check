import React, { useState } from 'react';
import { CatalogItem, StockTransaction, RestockItem, Language } from '../types';
import { i18nDict } from '../data/i18n';
import { computeMultiLocationInventory } from '../services/inventoryAggregator';
import { ShoppingCart, Copy, Sparkles, Check, AlertTriangle, Layers, MapPin } from 'lucide-react';

interface RestockViewProps {
  catalogItems: CatalogItem[];
  historyLogs: StockTransaction[];
  currentLang: Language;
}

export const RestockView: React.FC<RestockViewProps> = ({
  catalogItems,
  historyLogs,
  currentLang
}) => {
  const dict = i18nDict[currentLang];
  const [copied, setCopied] = useState<boolean>(false);

  // Compute Perpetual Inventory & Restock Items (Multi-Location aware)
  const computeRestockList = (): { restockItem: RestockItem; stationBreakdown?: { station: string; qty: number }[] }[] => {
    const aggregatedList = computeMultiLocationInventory(catalogItems, historyLogs);
    const results: { restockItem: RestockItem; stationBreakdown?: { station: string; qty: number }[] }[] = [];

    aggregatedList.forEach(agg => {
      if (agg.isLowStock && agg.totalMinQty > 0) {
        const suggested = Math.max(0, parseFloat((agg.totalMaxQty - agg.grandTotalQty).toFixed(1)));
        
        // Find a representative catalog item for this group
        const matchedItem = catalogItems.find(i => i.name.trim().toLowerCase() === agg.itemName.toLowerCase()) || {
          id: `agg_${Date.now()}_${Math.random()}`,
          sheet: agg.stations.map(s => s.station).join(', '),
          category: agg.category,
          name: agg.itemName,
          unit: agg.unit,
          min: agg.totalMinQty,
          max: agg.totalMaxQty,
          la: agg.la,
          mm: agg.mm
        };

        results.push({
          restockItem: {
            item: {
              ...matchedItem,
              sheet: agg.stationCount > 1 ? `รวม ${agg.stationCount} จุด` : matchedItem.sheet
            },
            currentQty: agg.grandTotalQty,
            minQty: agg.totalMinQty,
            maxQty: agg.totalMaxQty,
            suggestedBuy: suggested,
            editableBuyQty: suggested
          },
          stationBreakdown: agg.stations
        });
      }
    });

    return results;
  };

  const initialRestockItems = computeRestockList();
  const [items, setItems] = useState<{ restockItem: RestockItem; stationBreakdown?: { station: string; qty: number }[] }[]>(initialRestockItems);

  const handleBuyQtyChange = (itemId: string, qtyVal: number) => {
    setItems(prev =>
      prev.map(i =>
        i.restockItem.item.id === itemId
          ? { ...i, restockItem: { ...i.restockItem, editableBuyQty: Math.max(0, qtyVal) } }
          : i
      )
    );
  };

  const handleCopyOrderList = () => {
    const today = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    let orderText = `🛒 รายการสั่งซื้อวัตถุดิบประจำวันที่ ${today}\n-------------------------------\n`;
    let itemCount = 0;
    items.forEach(entry => {
      const restock = entry.restockItem;
      if (restock.editableBuyQty > 0) {
        orderText += `- ${restock.item.name}: ${restock.editableBuyQty} ${restock.item.unit} (${restock.item.sheet})\n`;
        itemCount++;
      }
    });

    if (itemCount === 0) {
      alert("ไม่มีรายการที่ต้องสั่งซื้อครับ");
      return;
    }

    orderText += "\nขอบคุณครับ 🙏";

    navigator.clipboard
      .writeText(orderText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        alert(`✅ ${dict.copiedSuccess}`);
      })
      .catch(() => {
        alert(`❌ ${dict.copyError}`);
      });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Banner */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div>
          <h3 className="font-bold text-red-900 text-lg flex items-center gap-2 justify-center md:justify-start">
            <ShoppingCart className="w-5 h-5 text-red-600" />
            {dict.restockTitle}
          </h3>
          <p className="text-xs md:text-sm text-red-700">
            💡 {dict.restockHint} (จุดสั่งซื้อ Min - Max Target)
          </p>
        </div>
      </div>

      {/* Restock Table */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-red-100/80 text-red-950 border-b border-red-200">
              <tr>
                <th className="p-3.5 text-center font-bold w-1/6">{dict.colShop}</th>
                <th className="p-3.5 text-left font-bold w-1/3">{dict.colItem}</th>
                <th className="p-3.5 text-center font-bold">{dict.colCurrent}</th>
                <th className="p-3.5 text-center font-bold">{dict.colMinMax}</th>
                <th className="p-3.5 text-center font-bold">{dict.colBuy}</th>
                <th className="p-3.5 text-center font-bold w-1/6">{dict.colUnit}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-12 text-emerald-600 font-bold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Sparkles className="w-8 h-8 text-emerald-500 animate-bounce" />
                      <span>{dict.noItemsToBuy}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map(entry => {
                  const restock = entry.restockItem;
                  const displayName =
                    currentLang === 'la'
                      ? restock.item.la || restock.item.name
                      : currentLang === 'mm'
                      ? restock.item.mm || restock.item.name
                      : restock.item.name;

                  const isCritical = restock.currentQty <= 0;

                  return (
                    <tr
                      key={restock.item.id}
                      className="border-b border-gray-100 hover:bg-red-50/30 transition-colors"
                    >
                      <td className="p-3.5 text-center text-xs font-bold text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-lg">{restock.item.sheet}</span>
                      </td>

                      <td className="p-3.5 font-bold text-gray-800">
                        <div>{displayName}</div>
                        <div className="text-xs text-gray-400 font-normal">{restock.item.category}</div>
                        {entry.stationBreakdown && entry.stationBreakdown.length > 1 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {entry.stationBreakdown.map((st, sIdx) => (
                              <span key={sIdx} className="text-[10px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-amber-600" /> {st.station}: {st.qty}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center font-black">
                        {isCritical ? (
                          <span className="text-red-600 bg-red-100 px-2.5 py-1 rounded-full text-xs font-black inline-flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> 0 (หมด)
                          </span>
                        ) : (
                          <span className="text-amber-700 font-extrabold text-base">
                            {restock.currentQty}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center text-xs text-gray-500 font-medium">
                        Min: {restock.minQty} | Max: {restock.maxQty}
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={restock.editableBuyQty}
                          onChange={e => handleBuyQtyChange(restock.item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 h-10 text-center border-2 border-red-300 rounded-xl font-black text-lg text-red-600 outline-none focus:ring-2 focus:ring-red-400 bg-red-50/50"
                        />
                      </td>

                      <td className="p-3.5 text-center text-gray-600 font-medium text-sm">
                        {restock.item.unit}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Copy Purchase Order Button */}
      {items.length > 0 && (
        <button
          onClick={handleCopyOrderList}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform active:scale-98 flex justify-center items-center gap-2 border border-blue-500"
        >
          {copied ? <Check className="w-6 h-6 text-emerald-300" /> : <Copy className="w-6 h-6" />}
          <span>{dict.copyListBtn}</span>
        </button>
      )}
    </div>
  );
};
