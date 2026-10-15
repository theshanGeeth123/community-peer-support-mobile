import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export type ThemePalette = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  text: string;
  muted: string;
  subtle: string;
  border: string;
  teal: string;
  tealSoft: string;
  aqua: string;
  onTeal: string;
};

export const lightPalette: ThemePalette = {
  background: '#F5FAF9', surface: '#FFFFFF', surfaceSecondary: '#EDF5F4',
  surfaceElevated: '#FFFFFF', text: '#0E2A47', muted: '#64808C', subtle: '#8BA3AB',
  border: '#E0EDEB', teal: '#0E7C86', tealSoft: '#EAF8F5', aqua: '#7FD3C3', onTeal: '#FFFFFF',
};
export const darkPalette: ThemePalette = {
  background: '#081824', surface: '#112B39', surfaceSecondary: '#193542',
  surfaceElevated: '#1D3B48', text: '#EFF9FC', muted: '#B4C9D3', subtle: '#99B0BC',
  border: '#345364', teal: '#78DDD6', tealSoft: '#173D47', aqua: '#7FD3C3', onTeal: '#062C34',
};

const STORAGE_KEY = '@alyven:appearance:mode';

type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemePalette;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (active && (saved === 'dark' || saved === 'light')) setModeState(saved);
    }).catch(() => { /* Keep default light on storage failure. */ });
    return () => { active = false; };
  }, []);
  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next).catch(() => { /* UI remains usable. */ });
  }, []);
  useEffect(() => {
    Appearance.setColorScheme(mode);
    StatusBar.setBarStyle(mode === 'dark' ? 'light-content' : 'dark-content');
  }, [mode]);
  const toggleTheme = useCallback(() => setMode(mode === 'dark' ? 'light' : 'dark'), [mode, setMode]);
  const value = useMemo(() => ({ mode, isDark: mode === 'dark', colors: mode === 'dark' ? darkPalette : lightPalette, setMode, toggleTheme }), [mode, setMode, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
