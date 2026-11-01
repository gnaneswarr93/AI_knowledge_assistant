import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from '../types';
import { themeService } from '../services/themeService';

interface ThemeContextValue {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => themeService.getTheme());
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() =>
    themeService.applyTheme(themeService.getTheme())
  );

  useEffect(() => {
    // Apply current theme on mount
    const effective = themeService.applyTheme(theme);
    setEffectiveTheme(effective);

    // Listen for system theme changes if theme is 'system'
    const cleanup = themeService.initThemeListener((newEffective) => {
      setEffectiveTheme(newEffective);
    });

    return cleanup;
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    themeService.setTheme(newTheme);
    setThemeState(newTheme);
    const effective = themeService.applyTheme(newTheme);
    setEffectiveTheme(effective);
  };

  const toggleTheme = () => {
    const nextTheme: Theme = effectiveTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
