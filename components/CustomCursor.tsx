"use client";

import { useEffect, useRef } from "react";

const EDGE_FADE_DISTANCE = 50;
// Frames to show cursor at full opacity on re-entry before edge fade kicks in
const ENTRY_GRACE_FRAMES = 10;

const TRANSPARENT_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E\") 0 0, none";

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const pos = useRef({ x: -100, y: -100 });
  const visible = useRef(true);
  const entryGraceRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Reinforce transparent cursor via JS so it's always set
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

      // Reinforce cursor hiding on every re-entry
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
          // During grace period, show at full opacity regardless of edge proximity
          entryGraceRef.current--;
          clampedFade = 1;
        } else {
          // Normal edge fade
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
  }, []);

  return (
    <div
      ref={ringRef}
      className="pointer-events-none fixed left-0 top-0 z-[99999] hidden h-6 w-6 rounded-full border-2 border-foreground/40 md:block"
      style={{
        boxShadow: "0 0 10px rgba(79,123,247,0.3), 0 0 20px rgba(79,123,247,0.1)",
        willChange: "transform, opacity",
      }}
    />
  );
}
