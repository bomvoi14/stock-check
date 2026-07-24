import { CatalogItem, StockTransaction } from '../types';
import { DEFAULT_CATALOG, INITIAL_TRANSACTIONS } from '../data/initialData';

const LOCAL_STORAGE_CATALOG_KEY = 'cham_prod_catalog_v2';
const LOCAL_STORAGE_HISTORY_KEY = 'cham_prod_history_v2';
const LOCAL_STORAGE_SCRIPT_URL_KEY = 'cham_prod_script_url_v2';

export const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzHg49ZFeI0-dBUZIwKznbIo97V1-F_zqz2LdScYdVzyYEr0aD64d3i4k-lkIESZGDZ9A/exec";

export function getStoredScriptUrl(): string {
  const saved = localStorage.getItem(LOCAL_STORAGE_SCRIPT_URL_KEY);
  return saved !== null ? saved : DEFAULT_SCRIPT_URL;
}

export function saveStoredScriptUrl(url: string): void {
  localStorage.setItem(LOCAL_STORAGE_SCRIPT_URL_KEY, url.trim());
}

// Get Catalog items (from GAS or LocalStorage)
export async function getCatalogItems(customUrl?: string): Promise<{ items: CatalogItem[]; source: 'gas' | 'local' }> {
  const url = customUrl || getStoredScriptUrl();
  
  if (url) {
    try {
      const response = await fetch(`${url}?sheet=catalog`, { signal: AbortSignal.timeout(6000) });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const items: CatalogItem[] = data.map((row: any, idx: number) => ({
            id: String(idx + 1),
            sheet: row.sheet || row[0] || 'ก๋วยเตี๋ยวหมู',
            category: row.category || row[1] || 'ทั่วไป',
            name: String(row.name || row[2] || '').trim(),
            unit: String(row.unit || row[3] || '').trim(),
            min: parseFloat(row.min || row[4]) || 0,
            max: parseFloat(row.max || row[5]) || 0,
            la: String(row.la || row[6] || '').trim(),
            mm: String(row.mm || row[7] || '').trim()
          })).filter(i => i.name.length > 0);

          if (items.length > 0) {
            localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(items));
            return { items, source: 'gas' };
          }
        }
      }
    } catch (e) {
      console.warn("GAS fetch catalog failed or timed out, falling back to local cache/default data", e);
    }
  }

  // Local fallback
  const cached = localStorage.getItem(LOCAL_STORAGE_CATALOG_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { items: parsed, source: 'local' };
      }
    } catch (e) {}
  }

  // Default seed
  localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(DEFAULT_CATALOG));
  return { items: DEFAULT_CATALOG, source: 'local' };
}

// Get Stock History Log
export async function getHistoryLogs(customUrl?: string): Promise<{ logs: StockTransaction[]; source: 'gas' | 'local' }> {
  const url = customUrl || getStoredScriptUrl();

  if (url) {
    try {
      const response = await fetch(`${url}?sheet=${encodeURIComponent('บันทึกสต๊อก')}`, { signal: AbortSignal.timeout(6000) });
      if (response.ok) {
        const rawData = await response.json();
        if (Array.isArray(rawData) && rawData.length > 1) {
          // slice 1 to skip header row
          const logs: StockTransaction[] = rawData.slice(1)
            .filter((row: any) => row[0] && String(row[0]).trim() !== '')
            .map((row: any, idx: number) => {
              const rawDate = row[0];
              const dateStr = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();
              return {
                id: `gas_${idx}_${Date.now()}`,
                timestamp: dateStr,
                checked_by: String(row[1] || 'พนักงาน').trim(),
                station: String(row[2] || 'ก๋วยเตี๋ยวหมู').trim(),
                action_type: (row[3] === 'รับเข้า' ? 'รับเข้า' : 'เช็คสต็อก') as any,
                category: String(row[4] || 'ทั่วไป').trim(),
                item_name: String(row[5] || row[4] || '-').trim(),
                quantity: parseFloat(row[6]) || parseFloat(row[5]) || 0,
                unit: String(row[7] || row[6] || '').trim(),
                price: parseFloat(row[8]) || '',
                note: String(row[9] || '').trim(),
                translatedNote: String(row[10] || row[9] || '').trim()
              };
            });

          localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(logs));
          return { logs, source: 'gas' };
        }
      }
    } catch (e) {
      console.warn("GAS fetch history failed or timed out, falling back to local cache", e);
    }
  }

  // Local Fallback
  const cached = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { logs: parsed, source: 'local' };
      }
    } catch (e) {}
  }

  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
  return { logs: INITIAL_TRANSACTIONS, source: 'local' };
}

// Post single transaction to GAS or Local
export async function postTransaction(trans: StockTransaction, customUrl?: string): Promise<{ success: boolean; mode: 'gas' | 'local' }> {
  const url = customUrl || getStoredScriptUrl();

  // Save to LocalStorage history first to ensure no data loss
  const cachedLogs = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
  let logs: StockTransaction[] = [];
  if (cachedLogs) {
    try { logs = JSON.parse(cachedLogs); } catch (e) {}
  }
  const newLog: StockTransaction = {
    ...trans,
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: trans.timestamp || new Date().toISOString()
  };
  logs.unshift(newLog);
  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(logs));

  if (url) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(trans)
      });
      if (response.ok) {
        return { success: true, mode: 'gas' };
      }
    } catch (e) {
      console.warn("GAS POST failed, saved to local cache", e);
    }
  }

  return { success: true, mode: 'local' };
}

// Post batch transactions in single request if supported, or parallelized
export async function postBatchTransactions(transactions: StockTransaction[], customUrl?: string): Promise<{ count: number; mode: 'gas' | 'local' }> {
  const url = customUrl || getStoredScriptUrl();

  // Always save to LocalStorage history first to prevent data loss
  const cachedLogs = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
  let logs: StockTransaction[] = [];
  if (cachedLogs) {
    try { logs = JSON.parse(cachedLogs); } catch (e) {}
  }
  const newLogs: StockTransaction[] = transactions.map(trans => ({
    ...trans,
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: trans.timestamp || new Date().toISOString()
  }));
  logs = [...newLogs, ...logs];
  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(logs));

  if (url && transactions.length > 0) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(transactions)
      });
      if (response.ok) {
        return { count: transactions.length, mode: 'gas' };
      }
    } catch (e) {
      console.warn("GAS Batch POST failed, saved to local cache", e);
    }
  }

  return { count: transactions.length, mode: 'local' };
}

// Catalog Mutation (Local + GAS capability)
export function saveCatalogItems(items: CatalogItem[]): void {
  localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(items));
}

export function resetToDefaultData(): void {
  localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(DEFAULT_CATALOG));
  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
}
