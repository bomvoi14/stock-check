import { CatalogItem, StockTransaction } from '../types';

export interface StationStockInfo {
  station: string;
  qty: number;
  lastCheckDate?: string;
  lastCheckStaff?: string;
}

export interface AggregatedItemSummary {
  itemName: string;
  unit: string;
  category: string;
  la?: string;
  mm?: string;
  grandTotalQty: number;
  totalMinQty: number;
  totalMaxQty: number;
  stations: StationStockInfo[];
  stationCount: number;
  isLowStock: boolean;
}

export function computeMultiLocationInventory(
  catalogItems: CatalogItem[],
  historyLogs: StockTransaction[]
): AggregatedItemSummary[] {
  // 1. Build map of latest check per (itemName, station)
  const stationCheckMap: Record<string, { qty: number; timestamp: string; staff: string }> = {};

  historyLogs.forEach(log => {
    const isCheck = !log.action_type || log.action_type === 'เช็คสต็อก';
    if (!isCheck) return;

    const normName = (log.item_name || '').trim().toLowerCase();
    const station = (log.station || 'ทั่วไป').trim();
    const key = `${normName}:::${station}`;

    const logDate = log.timestamp ? new Date(log.timestamp).getTime() : 0;
    const existing = stationCheckMap[key];

    if (!existing || logDate > new Date(existing.timestamp).getTime()) {
      stationCheckMap[key] = {
        qty: parseFloat(String(log.quantity)) || 0,
        timestamp: log.timestamp || new Date().toISOString(),
        staff: log.checked_by || ''
      };
    }
  });

  // 2. Build map of receive goods per (itemName, station) AFTER latest check
  const stationReceiveMap: Record<string, number> = {};

  historyLogs.forEach(log => {
    const isReceive = log.action_type === 'รับเข้า';
    if (!isReceive) return;

    const normName = (log.item_name || '').trim().toLowerCase();
    const station = (log.station || 'ทั่วไป').trim();
    const key = `${normName}:::${station}`;

    const logDate = log.timestamp ? new Date(log.timestamp).getTime() : 0;
    const checkEntry = stationCheckMap[key];
    const checkDate = checkEntry ? new Date(checkEntry.timestamp).getTime() : 0;

    if (logDate >= checkDate) {
      const receiveQty = parseFloat(String(log.quantity)) || 0;
      stationReceiveMap[key] = (stationReceiveMap[key] || 0) + receiveQty;
    }
  });

  // 3. Group catalog items by itemName (normalized)
  const groupedCatalog: Record<string, {
    originalName: string;
    unit: string;
    category: string;
    la?: string;
    mm?: string;
    catalogItemsList: CatalogItem[];
  }> = {};

  catalogItems.forEach(item => {
    const normName = (item.name || '').trim().toLowerCase();
    if (!groupedCatalog[normName]) {
      groupedCatalog[normName] = {
        originalName: item.name.trim(),
        unit: item.unit.trim(),
        category: item.category.trim(),
        la: item.la,
        mm: item.mm,
        catalogItemsList: []
      };
    }
    groupedCatalog[normName].catalogItemsList.push(item);
  });

  // 4. Construct aggregated summaries
  const results: AggregatedItemSummary[] = [];

  Object.entries(groupedCatalog).forEach(([normName, group]) => {
    let grandTotalQty = 0;
    let totalMinQty = 0;
    let totalMaxQty = 0;
    const stationsList: StationStockInfo[] = [];

    // Collect station info from catalog entries
    group.catalogItemsList.forEach(catItem => {
      const station = catItem.sheet;
      const key = `${normName}:::${station}`;

      const checkEntry = stationCheckMap[key];
      const baseQty = checkEntry ? checkEntry.qty : 0;
      const addedQty = stationReceiveMap[key] || 0;
      const currentQty = parseFloat((baseQty + addedQty).toFixed(1));

      grandTotalQty += currentQty;
      totalMinQty += catItem.min || 0;
      totalMaxQty += catItem.max || 0;

      stationsList.push({
        station,
        qty: currentQty,
        lastCheckDate: checkEntry?.timestamp,
        lastCheckStaff: checkEntry?.staff
      });
    });

    // Also check if there are transaction records for this item in stations NOT listed in catalog
    Object.keys(stationCheckMap).forEach(key => {
      if (key.startsWith(`${normName}:::`)) {
        const station = key.split(':::')[1];
        const alreadyIncluded = stationsList.some(s => s.station === station);

        if (!alreadyIncluded) {
          const checkEntry = stationCheckMap[key];
          const baseQty = checkEntry ? checkEntry.qty : 0;
          const addedQty = stationReceiveMap[key] || 0;
          const currentQty = parseFloat((baseQty + addedQty).toFixed(1));

          grandTotalQty += currentQty;

          stationsList.push({
            station,
            qty: currentQty,
            lastCheckDate: checkEntry?.timestamp,
            lastCheckStaff: checkEntry?.staff
          });
        }
      }
    });

    results.push({
      itemName: group.originalName,
      unit: group.unit,
      category: group.category,
      la: group.la,
      mm: group.mm,
      grandTotalQty: parseFloat(grandTotalQty.toFixed(1)),
      totalMinQty: parseFloat(totalMinQty.toFixed(1)),
      totalMaxQty: parseFloat(totalMaxQty.toFixed(1)),
      stations: stationsList,
      stationCount: stationsList.length,
      isLowStock: grandTotalQty <= totalMinQty
    });
  });

  return results.sort((a, b) => a.itemName.localeCompare(b.itemName, 'th'));
}
