import { create } from 'zustand';
import { getSettings } from '@/api/settings';
import { applyColorPalette, updateFavicon } from '@/utils/colorUtils';
import type { SiteSettings } from '@/types';

const STORAGE_KEY = 'theme-settings';

interface ThemeState {
  logoUrl: string | null;
  primaryColor: string;
  loading: boolean;
  setTheme: (settings: SiteSettings) => void;
  initTheme: () => void;
  fetchSettings: () => Promise<void>;
}

/**
 * Persist theme settings to localStorage so they can be applied
 * synchronously on next page load, eliminating FOUC.
 */
function persistSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage full or unavailable — graceful degradation
  }
}

function loadPersistedSettings(): SiteSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SiteSettings;
  } catch {
    // Corrupted data
  }
  return null;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  logoUrl: null,
  primaryColor: '#C7000B',
  loading: false,

  setTheme: (settings: SiteSettings) => {
    // Apply color palette as CSS custom properties
    if (settings.primaryColor) {
      applyColorPalette(document.documentElement, settings.primaryColor);
      updateFavicon(settings.primaryColor);
    }
    // Persist to localStorage for instant restore on next page load
    persistSettings({
      logoUrl: settings.logoUrl ?? undefined,
      primaryColor: settings.primaryColor || '#C7000B',
    });
    set({
      logoUrl: settings.logoUrl ?? null,
      primaryColor: settings.primaryColor || '#C7000B',
    });
  },

  /**
   * Synchronous init — applies cached theme from localStorage immediately
   * (before any API call), then fetches the latest from the server in the
   * background. This eliminates FOUC on page refresh.
   */
  initTheme: () => {
    // 1. Apply cached settings instantly (synchronous, no flash)
    const cached = loadPersistedSettings();
    if (cached) {
      get().setTheme(cached);
    }

    // 2. Fetch latest from server to stay in sync (async, non-blocking)
    get().fetchSettings();
  },

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const res = await getSettings();
      if (res.code === 200) {
        get().setTheme(res.data);
      }
    } catch {
      // Use cached/defaults — already applied
    } finally {
      set({ loading: false });
    }
  },
}));
