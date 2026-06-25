"use client";

import { useState } from "react";
import { getAnimationsEnabled, setAnimationsEnabled } from "../lib/preferences";

/** Read/write the global "enable animations" preference. */
export function useAnimationsSetting() {
  const [enabled, setEnabledState] = useState(getAnimationsEnabled);

  function setEnabled(next: boolean) {
    setAnimationsEnabled(next);
    setEnabledState(next);
  }

  return [enabled, setEnabled] as const;
}
