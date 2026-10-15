// Wave Dude 2D web - small UI preferences remembered in this browser (open sections, filters, the panel width).
// GPL-3.0-or-later.

const PREF = "waveDude.ui.";

/** A small UI preference remembered in this browser (open sections, filters). Never throws. */
export function loadPref<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(PREF + key);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch { return fallback; }
}

export function savePref(key: string, value: unknown): void {
  try { localStorage.setItem(PREF + key, JSON.stringify(value)); } catch { /* private mode: kept for this visit only */ }
}

