// Wave Dude 2D web - Simple mode, for young explorers: on or off (remembered), and who wants to know when it changes.
// Advanced controls carry the class "adv" and are hidden while it is on (see the app's simple.ts for the rest).
// GPL-3.0-or-later.

import { loadPref, savePref } from "./prefs";

let on = loadPref<boolean>("simple", false);
const listeners: (() => void)[] = [];

export const isSimple = (): boolean => on;

/** Called whenever Simple mode is switched (once per listener, for the life of the page). */
export function onSimpleChange(f: () => void): void { listeners.push(f); }

export function setSimple(v: boolean): void {
  on = v;
  savePref("simple", v);
  document.documentElement.classList.toggle("simple", v);
  for (const f of listeners) f();
}
