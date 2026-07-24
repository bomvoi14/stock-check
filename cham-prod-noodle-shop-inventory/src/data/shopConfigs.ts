import { ShopSheet } from '../types';

export interface ShopConfig {
  id: ShopSheet;
  label: string;
  icon: string;
  colorTheme: string;
  bgClass: string;
  hoverClass: string;
}

export const COLOR_THEMES: Record<string, { label: string; bg: string; hover: string; badge: string; colorCode: string }> = {
  red: { label: 'แดง (Red)', bg: 'bg-red-600 text-white', hover: 'hover:bg-red-700', badge: 'bg-red-100 text-red-800 border-red-300', colorCode: '#dc2626' },
  rose: { label: 'กุหลาบ (Rose)', bg: 'bg-rose-600 text-white', hover: 'hover:bg-rose-700', badge: 'bg-rose-100 text-rose-800 border-rose-300', colorCode: '#e11d48' },
  pink: { label: 'ชมพู (Pink)', bg: 'bg-pink-600 text-white', hover: 'hover:bg-pink-700', badge: 'bg-pink-100 text-pink-800 border-pink-300', colorCode: '#db2777' },
  purple: { label: 'ม่วง (Purple)', bg: 'bg-purple-600 text-white', hover: 'hover:bg-purple-700', badge: 'bg-purple-100 text-purple-800 border-purple-300', colorCode: '#9333ea' },
  violet: { label: 'ม่วงน้ำเงิน (Violet)', bg: 'bg-violet-600 text-white', hover: 'hover:bg-violet-700', badge: 'bg-violet-100 text-violet-800 border-violet-300', colorCode: '#7c3aed' },
  indigo: { label: 'คราม (Indigo)', bg: 'bg-indigo-600 text-white', hover: 'hover:bg-indigo-700', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300', colorCode: '#4f46e5' },
  blue: { label: 'น้ำเงิน (Blue)', bg: 'bg-blue-600 text-white', hover: 'hover:bg-blue-700', badge: 'bg-blue-100 text-blue-800 border-blue-300', colorCode: '#2563eb' },
  sky: { label: 'ฟ้า (Sky)', bg: 'bg-sky-500 text-white', hover: 'hover:bg-sky-600', badge: 'bg-sky-100 text-sky-800 border-sky-300', colorCode: '#0ea5e9' },
  cyan: { label: 'ฟ้าอมเขียว (Cyan)', bg: 'bg-cyan-600 text-white', hover: 'hover:bg-cyan-700', badge: 'bg-cyan-100 text-cyan-800 border-cyan-300', colorCode: '#0891b2' },
  teal: { label: 'เขียวไข่กา (Teal)', bg: 'bg-teal-600 text-white', hover: 'hover:bg-teal-700', badge: 'bg-teal-100 text-teal-800 border-teal-300', colorCode: '#0d9488' },
  emerald: { label: 'มรกต (Emerald)', bg: 'bg-emerald-600 text-white', hover: 'hover:bg-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', colorCode: '#059669' },
  green: { label: 'เขียว (Green)', bg: 'bg-green-600 text-white', hover: 'hover:bg-green-700', badge: 'bg-green-100 text-green-800 border-green-300', colorCode: '#16a34a' },
  lime: { label: 'เขียวมะนาว (Lime)', bg: 'bg-lime-600 text-white', hover: 'hover:bg-lime-700', badge: 'bg-lime-100 text-lime-800 border-lime-300', colorCode: '#65a30d' },
  amber: { label: 'ส้มเหลือง (Amber)', bg: 'bg-amber-500 text-white', hover: 'hover:bg-amber-600', badge: 'bg-amber-100 text-amber-800 border-amber-300', colorCode: '#f59e0b' },
  orange: { label: 'ส้มสด (Orange)', bg: 'bg-orange-600 text-white', hover: 'hover:bg-orange-700', badge: 'bg-orange-100 text-orange-800 border-orange-300', colorCode: '#ea580c' },
  slate: { label: 'เทาเข้ม (Slate)', bg: 'bg-slate-700 text-white', hover: 'hover:bg-slate-800', badge: 'bg-slate-100 text-slate-800 border-slate-300', colorCode: '#334155' },
};

export const DEFAULT_SHOP_CONFIGS: ShopConfig[] = [
  { id: 'ก๋วยเตี๋ยวหมู', label: 'ก๋วยเตี๋ยวหมู', icon: '🍜', colorTheme: 'amber', bgClass: 'bg-amber-500 text-white', hoverClass: 'hover:bg-amber-600' },
  { id: 'ก๋วยเตี๋ยวไก่', label: 'ก๋วยเตี๋ยวไก่', icon: '🍲', colorTheme: 'emerald', bgClass: 'bg-emerald-600 text-white', hoverClass: 'hover:bg-emerald-700' },
  { id: 'อาหารตามสั่ง', label: 'อาหารตามสั่ง', icon: '🥘', colorTheme: 'orange', bgClass: 'bg-orange-600 text-white', hoverClass: 'hover:bg-orange-700' },
  { id: 'อุปกรณ์ในร้าน', label: 'อุปกรณ์ในร้าน', icon: '🔧', colorTheme: 'blue', bgClass: 'bg-blue-600 text-white', hoverClass: 'hover:bg-blue-700' },
  { id: 'สำรอง1', label: 'ตู้แช่ 1', icon: '🧊', colorTheme: 'cyan', bgClass: 'bg-cyan-600 text-white', hoverClass: 'hover:bg-cyan-700' },
  { id: 'สำรอง2', label: 'สำรอง 2', icon: '📦', colorTheme: 'slate', bgClass: 'bg-slate-500 text-white', hoverClass: 'hover:bg-slate-600' },
  { id: 'สำรอง3', label: 'สำรอง 3', icon: '📦', colorTheme: 'slate', bgClass: 'bg-slate-500 text-white', hoverClass: 'hover:bg-slate-600' },
  { id: 'สำรอง4', label: 'สำรอง 4', icon: '📦', colorTheme: 'slate', bgClass: 'bg-slate-500 text-white', hoverClass: 'hover:bg-slate-600' },
];

const STORAGE_KEY = 'cham_prod_shop_configs_v1';

export function getShopConfigs(): ShopConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return DEFAULT_SHOP_CONFIGS.map(def => {
          const match = parsed.find((p: any) => p.id === def.id);
          if (match) {
            const themeKey = match.colorTheme && COLOR_THEMES[match.colorTheme] ? match.colorTheme : def.colorTheme;
            const theme = COLOR_THEMES[themeKey];
            return {
              ...def,
              label: match.label || def.label,
              icon: match.icon || def.icon,
              colorTheme: themeKey as any,
              bgClass: theme.bg,
              hoverClass: theme.hover,
            };
          }
          return def;
        });
      }
    }
  } catch (e) {
    console.error('Failed to parse shop configs:', e);
  }
  return DEFAULT_SHOP_CONFIGS;
}

export function saveShopConfigs(configs: ShopConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch (e) {
    console.error('Failed to save shop configs:', e);
  }
}
