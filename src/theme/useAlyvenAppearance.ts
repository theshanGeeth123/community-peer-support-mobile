/** Non-destructive theming layer. Light mode returns source colors/classes unchanged. */
import { useCallback, useMemo } from 'react';
import { useTheme } from './ThemeProvider';

const MAP: Record<string, string> = {
  '#ffffff': '#142D3B', '#fff': '#142D3B', '#f5faf9': '#081824', '#edf5f4': '#193542',
  '#eaf8f5': '#173D47', '#e0edeb': '#345364', '#d8f3ea': '#1A4948', '#b7e7da': '#285B5A',
  '#97ddcf': '#33706E', '#f7fffd': '#112B39', '#f8faff': '#122938', '#f5f7ff': '#142C3C',
  '#ebf3f7': '#193642', '#0c4a60': '#84CADA', '#eef2f7': '#1E3647', '#c4d8da': '#44636F', '#cde1e5': '#365462', '#b8e7dc': '#295B5A',
  '#0e2a47': '#EFF9FC', '#092238': '#EFF9FC', '#1c3a50': '#E1F0F7', '#31515f': '#C6DCE4',
  '#4d6c78': '#B4C9D3', '#64808c': '#B4C9D3', '#8ba3ab': '#99B0BC', '#93a5ad': '#A9BEC9',
  '#0e7c86': '#78DDD6', '#09646e': '#6ACCC6', '#168994': '#83E0D9', '#14536b': '#86D5E1',
  '#166a76': '#85D7DD', '#245069': '#B0D8E6', '#376a74': '#A5D3D9', '#416e78': '#AED0D9',
  '#fecaca': '#7D4A56', '#fef2f2': '#42252F', '#fff1f2': '#422530', '#ffe4e6': '#51303B',
  '#b91c1c': '#FF9DA7', '#e11d48': '#FF8BA2', '#dc2626': '#FF8F9A', '#be123c': '#FF9BAB',
  '#991b1b': '#FFADB5', '#9f1239': '#FF9AAA', '#ef4444': '#FF9CA3', '#fda4af': '#FFBAC3',
  '#fffbeb': '#423622', '#fef3c7': '#534425', '#fff7ed': '#3F3023', '#ffedd5': '#4C3826',
  '#fde68a': '#6B5329', '#fed7aa': '#5C4029', '#fef9c3': '#443F25',
  '#b45309': '#F9CA88', '#d97706': '#FFC679', '#c2410c': '#FDB48E', '#ea580c': '#FFB28A',
  '#92400e': '#F9C990', '#78350f': '#FFC18A', '#9a3412': '#F9B79A', '#854d0e': '#FBD68E',
  '#ecfdf5': '#163D37', '#f0fdf4': '#183B33', '#dcfce7': '#244E42', '#d1fae5': '#215648',
  '#a7f3d0': '#327D6B', '#bbf7d0': '#316B51', '#cffafe': '#1A4851',
  '#059669': '#6FE4AF', '#047857': '#74D9AD', '#065f46': '#89D9B6', '#15803d': '#71E39B',
  '#16a34a': '#7FE7A5', '#22c55e': '#84E7A6', '#10b981': '#7BEAC3',
  '#0284c7': '#7FC9F3', '#f59e0b': '#F7CF83', '#fbbf24': '#F7D77A',
  '#faf5ff': '#302743', '#ddd6fe': '#4E477A', '#312e81': '#B9B4FC', '#7c2d12': '#FFB998',
  '#1e293b': '#ECF4FC', '#6b7280': '#B3BFCC', '#000000': '#EFF9FC',
};

/** Accent blocks intentionally remain dark enough for white text in both modes. */
const BG_OVERRIDES: Record<string, string> = {
  '#0e2a47': '#0B3041', '#092238': '#092238', '#0e7c86': '#086F7D',
  '#09646e': '#075A67', '#168994': '#0D7F89', '#1c3a50': '#143C50',
  '#31515f': '#215160', '#14536b': '#14536B', '#166a76': '#126475',
  '#245069': '#194960', '#ffffff': '#142D3B', '#fff': '#142D3B',
};

function resolveDarkColor(color: string, property: string): string {
  const key = color.toLowerCase();
  if (property === 'shadowColor') return '#000000';
  if (property === 'backgroundColor' && BG_OVERRIDES[key]) return BG_OVERRIDES[key];
  // White foreground on dark accent backgrounds should keep its contrast.
  if ((property === 'color' || property === 'tintColor') && (key === '#fff' || key === '#ffffff')) return '#FFFFFF';
  return MAP[key] ?? color;
}

/** Use for inline icons, backgrounds and style properties. */
export function useThemeTone() {
  const { isDark } = useTheme();
  return useCallback((value: string, property = 'color') => isDark ? resolveDarkColor(value, property) : value, [isDark]);
}

function convertStyles<T>(value: T, isDark: boolean, prop = ''): T {
  if (!isDark || value == null) return value;
  if (Array.isArray(value)) return value.map((item) => convertStyles(item, isDark, prop)) as T;
  if (typeof value === 'string') return resolveDarkColor(value, prop) as T;
  if (typeof value !== 'object') return value;
  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    result[key] = convertStyles(entry, isDark, key);
  }
  return result as T;
}

/** Maps static StyleSheet styles to dark colors without changing layout/spacing. */
export function useThemedStyles<T extends Record<string, unknown>>(baseStyles: T): T {
  const { isDark } = useTheme();
  return useMemo(() => convertStyles(baseStyles, isDark), [baseStyles, isDark]);
}

const CLASS_MAP: Record<string, string> = {
  'bg-white': 'bg-[#142D3B]', 'bg-slate-50': 'bg-[#0E2432]', 'bg-slate-100': 'bg-[#193542]',
  'bg-slate-200': 'bg-[#234552]', 'bg-indigo-50': 'bg-[#173D47]', 'bg-indigo-100': 'bg-[#1A4948]',
  'bg-violet-50': 'bg-[#173D47]', 'bg-emerald-50': 'bg-[#183B33]', 'bg-red-50': 'bg-[#42252F]',
  'bg-rose-50': 'bg-[#422530]', 'bg-amber-50': 'bg-[#423622]', 'bg-blue-50': 'bg-[#1B3546]',
  'bg-green-50': 'bg-[#183B33]',
  'bg-red-100': 'bg-[#4E2A35]', 'bg-red-300': 'bg-[#784451]',
  'text-slate-300': 'text-[#A8C1CC]', 'text-indigo-900': 'text-[#BAF3ED]', 'text-indigo-200': 'text-[#BCEFE7]',
  'text-indigo-100': 'text-[#D8F3EA]', 'text-red-500': 'text-[#FF9DA7]', 'text-rose-600': 'text-[#FF9AAF]',
  'text-emerald-600': 'text-[#81E6AD]', 'border-indigo-600': 'border-[#58C9C4]',
  'border-amber-200': 'border-[#6C562D]', 'border-rose-300': 'border-[#7D4A56]',
  'text-slate-900': 'text-[#EFF9FC]', 'text-slate-800': 'text-[#E1F0F7]',
  'text-slate-700': 'text-[#C6DCE4]', 'text-slate-600': 'text-[#B4C9D3]',
  'text-slate-500': 'text-[#B4C9D3]', 'text-slate-400': 'text-[#99B0BC]',
  'text-indigo-600': 'text-[#78DDD6]', 'text-indigo-700': 'text-[#6ACCC6]',
  'text-emerald-700': 'text-[#7BEAC3]', 'text-red-700': 'text-[#FF9DA7]',
  'border-slate-100': 'border-[#2C4957]', 'border-slate-200': 'border-[#345364]',
  'border-slate-300': 'border-[#436372]', 'border-indigo-100': 'border-[#285B5A]',
  'border-indigo-200': 'border-[#347B79]', 'border-red-200': 'border-[#7D4A56]',
  'border-emerald-100': 'border-[#275A4C]', 'border-emerald-200': 'border-[#326A58]',
  'placeholder:text-slate-400': 'placeholder:text-[#99B0BC]',
};

export function useThemedClassName() {
  const { isDark } = useTheme();
  return useCallback((classes: string | false | null | undefined) => {
    if (!classes || !isDark) return classes || '';
    return classes.split(/\s+/).map((name) => CLASS_MAP[name] ?? name).join(' ');
  }, [isDark]);
}
