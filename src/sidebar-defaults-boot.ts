/**
 * Exposes sidebar defaults to the content script (injected sidebar).
 * Loaded as the first content script so content.js can read window.__SIDEBAR_*.
 * Single source of truth: storage.ts.
 */
import { DEFAULT_SETTINGS, PRESET_THEMES } from './storage';

declare global {
  interface Window {
    __SIDEBAR_DEFAULT_SETTINGS__?: typeof DEFAULT_SETTINGS;
    __SIDEBAR_PRESET_THEMES__?: typeof PRESET_THEMES;
  }
}

if (typeof window !== 'undefined') {
  window.__SIDEBAR_DEFAULT_SETTINGS__ = DEFAULT_SETTINGS;
  window.__SIDEBAR_PRESET_THEMES__ = PRESET_THEMES;
}
