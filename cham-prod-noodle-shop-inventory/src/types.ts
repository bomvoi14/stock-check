export type Language = 'th' | 'la' | 'mm';

export type ActionType = 'เช็คสต็อก' | 'รับเข้า';

export type ShopSheet = 
  | 'ก๋วยเตี๋ยวหมู'
  | 'ก๋วยเตี๋ยวไก่'
  | 'อาหารตามสั่ง'
  | 'อุปกรณ์ในร้าน'
  | 'สำรอง1'
  | 'สำรอง2'
  | 'สำรอง3'
  | 'สำรอง4';

export interface CatalogItem {
  id: string;
  sheet: ShopSheet | string;
  category: string;
  name: string; // TH
  unit: string; // TH
  min: number;
  max: number;
  la?: string;  // Lao name
  mm?: string;  // Myanmar name
}

export interface StockTransaction {
  id?: string;
  timestamp: string; // ISO string or Date
  checked_by: string;
  station: string; // ShopSheet
  action_type: ActionType;
  category: string;
  item_name: string;
  quantity: number;
  unit: string;
  price?: number | string;
  note?: string;
  translatedNote?: string;
}

export interface RestockItem {
  item: CatalogItem;
  currentQty: number;
  minQty: number;
  maxQty: number;
  suggestedBuy: number;
  editableBuyQty: number;
  lastCheckDate?: string;
  lastCheckStaff?: string;
}

export interface TranslationDict {
  [key: string]: {
    th: string;
    la: string;
    mm: string;
  };
}
