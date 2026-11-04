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
          const catalogRows = Array.isArray(data[0]) && ['name','ชื่อสินค้า','ชื่อรายการ'].includes(String(data[0][2] || '').trim().toLowerCase()) ? data.slice(1) : data;
          const items: CatalogItem[] = catalogRows.map((row: any, idx: number) => ({
            id: String(idx + 1),
            sheet: row.sheet || row[0] || 'ก๋วยเตี๋ยวหมู',
            category: row.category || row[1] || 'ทั่วไป',
            name: String(row.name || row[2] || '').trim(),
            unit: String(row.unit || row[3] || '').trim(),
            min: Number(row.min ?? row[4]) || 0,
            max: Number(row.max ?? row[5]) || 0,
            la: String(row.la ?? row[6] ?? '').trim(),
            mm: String(row.mm ?? row[7] ?? '').trim()
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
        if (Array.isArray(rawData) && rawData.length >= 1) {
          // slice 1 to skip header row
          const logs: StockTransaction[] = rawData.slice(1)
            .filter((row: any) => row[0] && String(row[0]).trim() !== '')
            .map((row: any, idx: number) => {
              const rawDate = row[0];
              const parsedDate = rawDate ? new Date(rawDate) : new Date(NaN);
              const dateStr = !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : String(rawDate || '');
              return {
                id: String(row[11] || `legacy_${idx}`),
                timestamp: dateStr,
                checked_by: String(row[1] || 'พนักงาน').trim(),
                station: String(row[2] || 'ก๋วยเตี๋ยวหมู').trim(),
                action_type: (row[3] === 'รับเข้า' ? 'รับเข้า' : 'เช็คสต็อก') as any,
                category: String(row[4] || 'ทั่วไป').trim(),
                item_name: String(row[5] || row[4] || '-').trim(),
                quantity: Number(row[6]) || 0,
                unit: String(row[7] ?? '').trim(),
                price: row[8] === '' ? '' : (Number(row[8]) || 0),
                note: String(row[9] || '').trim(),
                translatedNote: String(row[10] || row[9] || '').trim()
              };
            });

          localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(logs));
          return { logs: [...pendingTransactions().filter(p => !logs.some(log => log.id === p.id)), ...logs], source: 'gas' };
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
        return { logs: [...pendingTransactions(), ...parsed], source: 'local' };
      }
    } catch (e) {}
  }

  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
  return { logs: [...pendingTransactions(), ...INITIAL_TRANSACTIONS], source: 'local' };
}

// Keep unsent operations separate from server-confirmed history.
const PENDING_KEY = 'cham_prod_pending_transactions_v26';
export function getPendingCount(): number {
  try { return (JSON.parse(localStorage.getItem(PENDING_KEY) || '[]') as StockTransaction[]).length; }
  catch { return 0; }
}
function pendingTransactions(): StockTransaction[] {
  try {
    const data = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
function setPending(transactions: StockTransaction[]): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify(transactions));
}
let syncInFlight: Promise<{ synced: number; pending: number }> | null = null;
export function syncPendingTransactions(customUrl?: string): Promise<{ synced: number; pending: number }> {
  if (syncInFlight) return syncInFlight;
  syncInFlight = performSync(customUrl).finally(() => { syncInFlight = null; });
  return syncInFlight;
}
async function performSync(customUrl?: string): Promise<{ synced: number; pending: number }> {
  const queue = pendingTransactions();
  if (!queue.length) return { synced: 0, pending: 0 };
  const url = customUrl || getStoredScriptUrl();
  if (!url) return { synced: 0, pending: queue.length };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(queue)
  });
  if (!response.ok) throw new Error('Server HTTP ' + response.status);
  const result = await response.json();
  if (result?.status !== 'success' || result.count !== queue.length) {
    throw new Error('Server did not confirm the full batch');
  }
  const sentIds = new Set(queue.map(item => item.id));
  setPending(pendingTransactions().filter(item => !sentIds.has(item.id)));
  return { synced: queue.length, pending: getPendingCount() };
}

// Queue writes first; only report remote success after explicit GAS confirmation.
export async function postTransaction(trans: StockTransaction, customUrl?: string): Promise<{ success: boolean; mode: 'gas' | 'local' }> {
  const result = await postBatchTransactions([trans], customUrl);
  return { success: true, mode: result.mode };
}

export async function postBatchTransactions(transactions: StockTransaction[], customUrl?: string): Promise<{ count: number; mode: 'gas' | 'local' }> {
  if (!transactions.length) return { count: 0, mode: 'local' };
  const queued = transactions.map(trans => ({
    ...trans,
    id: trans.id || ('tx_' + Date.now() + '_' + Math.random().toString(36).slice(2)),
    timestamp: trans.timestamp || new Date().toISOString()
  }));
  setPending([...pendingTransactions(), ...queued]);
  try {
    const result = await syncPendingTransactions(customUrl);
    return { count: queued.length, mode: result.pending === 0 ? 'gas' : 'local' };
  } catch (error) {
    console.warn('Stock transactions are pending sync', error);
    return { count: queued.length, mode: 'local' };
  }
}

// Catalog Mutation (Local + GAS capability)
export function saveCatalogItems(items: CatalogItem[]): void {
  localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(items));
}

export function resetToDefaultData(): void {
  localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(DEFAULT_CATALOG));
  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
}
