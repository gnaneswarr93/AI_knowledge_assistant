import { Theme } from '../types';

const THEME_STORAGE_KEY = 'enterprise-ai-theme';

export const themeService = {
  getTheme(): Theme {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'system';
  },

  setTheme(theme: Theme): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore
    }
    this.applyTheme(theme);
  },

  getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  },

  getEffectiveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'system') {
      return this.getSystemTheme();
    }
    return theme;
  },

  applyTheme(theme: Theme): 'light' | 'dark' {
    const effectiveTheme = this.getEffectiveTheme(theme);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    }
    return effectiveTheme;
  },

  initThemeListener(onThemeChange?: (effective: 'light' | 'dark') => void): () => void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {};
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const currentTheme = this.getTheme();
      if (currentTheme === 'system') {
        const effective = e.matches ? 'dark' : 'light';
        this.applyTheme('system');
        onThemeChange?.(effective);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else if ('addListener' in mediaQuery) {
      // Safari legacy fallback
      (mediaQuery as MediaQueryList).addListener(handler);
      return () => (mediaQuery as MediaQueryList).removeListener(handler);
    }

    return () => {};
  },
};
