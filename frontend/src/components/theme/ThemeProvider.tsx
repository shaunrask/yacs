import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

type ThemeName = 'light' | 'dark';

type ThemeContextValue = {
  name: ThemeName;
  setTheme: (n: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'app-theme';

function getSystemTheme(): ThemeName {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function loadInitial(): ThemeName {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
  return stored === 'light' || stored === 'dark' ? stored : getSystemTheme();
}

function applyHtmlClass(name: ThemeName) {
  const root = document.documentElement;
  if (name === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export const AppThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [name, setName] = useState<ThemeName>(() => loadInitial());

  // Apply on mount + whenever name changes
  useEffect(() => {
    applyHtmlClass(name);
    localStorage.setItem(STORAGE_KEY, name);
  }, [name]);

  // If user hasn't chosen, follow system changes
  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return; // user has explicit choice; don't override

    const handler = () => setName(getSystemTheme());
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  const setTheme = useCallback((n: ThemeName) => setName(n), []);
  const toggleTheme = useCallback(() => setName((p) => (p === 'light' ? 'dark' : 'light')), []);

  const value = useMemo(() => ({ name, setTheme, toggleTheme }), [name, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within AppThemeProvider');
  return ctx;
}
