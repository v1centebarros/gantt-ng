/**
 * App-wide UI preferences stored in localStorage (not per-document). The
 * animations flag is mirrored onto <html data-animations="on|off"> so CSS can
 * disable animations/transitions globally. The initial value is applied
 * flash-free by an inline script in the root layout.
 */

export const ANIMATIONS_STORAGE_KEY = "gantt-ng:animations";

export function getAnimationsEnabled(): boolean {
  if (typeof document === "undefined") return true;
  return document.documentElement.dataset.animations !== "off";
}

export function setAnimationsEnabled(enabled: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.animations = enabled ? "on" : "off";
  try {
    localStorage.setItem(ANIMATIONS_STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // localStorage may be unavailable (private mode); the attribute still applies.
  }
}

/** Inline-script body that applies the saved preference before first paint. */
export const ANIMATIONS_INIT_SCRIPT = `try{document.documentElement.dataset.animations=localStorage.getItem('${ANIMATIONS_STORAGE_KEY}')==='off'?'off':'on'}catch(e){}`;
