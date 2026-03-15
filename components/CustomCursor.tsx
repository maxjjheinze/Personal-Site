"use client";

import { useEffect, useRef, useState } from "react";

const EDGE_FADE_DISTANCE = 50;
const ENTRY_GRACE_FRAMES = 10;

const TRANSPARENT_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E\") 0 0, none";

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const pos = useRef({ x: -100, y: -100 });
  const visible = useRef(true);
  const entryGraceRef = useRef(0);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    setIsFinePointer(!window.matchMedia("(pointer: coarse)").matches);
  }, []);

  useEffect(() => {
    if (!isFinePointer) return;

    document.documentElement.style.cursor = TRANSPARENT_CURSOR;
    document.body.style.cursor = TRANSPARENT_CURSOR;

    function handleMouseMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
      visible.current = true;
    }

    function handleMouseLeave() {
      visible.current = false;
    }

    function handleMouseEnter(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
      visible.current = true;
      entryGraceRef.current = ENTRY_GRACE_FRAMES;

      document.documentElement.style.cursor = TRANSPARENT_CURSOR;
      document.body.style.cursor = TRANSPARENT_CURSOR;
    }

    function tick() {
      const ring = ringRef.current;
      if (ring) {
        const { x, y } = pos.current;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let clampedFade: number;

        if (!visible.current) {
          clampedFade = 0;
        } else if (entryGraceRef.current > 0) {
          entryGraceRef.current--;
          clampedFade = 1;
        } else {
          const edgeFactor = Math.min(
            x / EDGE_FADE_DISTANCE,
            y / EDGE_FADE_DISTANCE,
            (vw - x) / EDGE_FADE_DISTANCE,
            (vh - y) / EDGE_FADE_DISTANCE,
            1
          );
          clampedFade = Math.max(0, Math.min(1, edgeFactor));
        }

        const scale = 0.5 + clampedFade * 0.5;

        ring.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
        ring.style.opacity = String(clampedFade);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isFinePointer]);

  useEffect(() => {
    if (!isFinePointer) return;

    // The shield captures cursor display but must forward all interactions.
    // We briefly disable pointer-events on the shield during click/mousedown
    // so the real target underneath receives the event.
    const shield = shieldRef.current;
    if (!shield) return;

    function letThrough(e: MouseEvent) {
      shield!.style.pointerEvents = "none";
      // Re-dispatch to the real target underneath
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (target && target !== shield) {
        const cloned = new MouseEvent(e.type, e);
        target.dispatchEvent(cloned);
      }
      // Re-enable shield on next frame
      requestAnimationFrame(() => {
        if (shield) shield.style.pointerEvents = "auto";
      });
    }

    shield.addEventListener("click", letThrough, true);
    shield.addEventListener("mousedown", letThrough, true);
    shield.addEventListener("mouseup", letThrough, true);
    shield.addEventListener("dblclick", letThrough, true);
    shield.addEventListener("contextmenu", letThrough, true);

    return () => {
      shield.removeEventListener("click", letThrough, true);
      shield.removeEventListener("mousedown", letThrough, true);
      shield.removeEventListener("mouseup", letThrough, true);
      shield.removeEventListener("dblclick", letThrough, true);
      shield.removeEventListener("contextmenu", letThrough, true);
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  return (
    <>
      {/* Layer 1: Full-screen cursor shield — ensures native cursor never shows.
          Captures cursor display with the transparent SVG cursor, forwards
          all click/interaction events to elements underneath. */}
      <div
        ref={shieldRef}
        className="fixed inset-0 z-[99998]"
        style={{ cursor: TRANSPARENT_CURSOR }}
      />

      {/* Layer 2: The visible custom orbit ring cursor */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[99999] h-6 w-6 rounded-full border-2 border-foreground/40"
        style={{
          boxShadow: "0 0 10px rgba(79,123,247,0.3), 0 0 20px rgba(79,123,247,0.1)",
          willChange: "transform, opacity",
        }}
      />
    </>
  );
}
