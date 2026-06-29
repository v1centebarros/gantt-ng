"use client";

import { type RefObject, useLayoutEffect, useState } from "react";

export interface Viewport {
  /** Horizontal scroll offset of the container. */
  scrollLeft: number;
  /** Visible width of the container. */
  width: number;
}

/**
 * Track the horizontal scroll offset and width of a scroll container, for
 * viewport virtualization. Scroll updates are throttled to one per animation
 * frame; resize is observed. The initial measure runs in `useLayoutEffect` so
 * the first paint already knows the real width (we never render the full,
 * unclipped chart on a large span).
 */
export function useHorizontalViewport(
  ref: RefObject<HTMLElement | null>,
): Viewport {
  const [vp, setVp] = useState<Viewport>({ scrollLeft: 0, width: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () =>
      setVp((prev) =>
        prev.scrollLeft === el.scrollLeft && prev.width === el.clientWidth
          ? prev
          : { scrollLeft: el.scrollLeft, width: el.clientWidth },
      );

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);

  return vp;
}
