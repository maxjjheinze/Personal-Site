"use client";

import { useEffect, useRef } from "react";

const EDGE_FADE_DISTANCE = 50;

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const pos = useRef({ x: -100, y: -100 });
  const visible = useRef(true);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

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
    }

    function tick() {
      const ring = ringRef.current;
      if (ring) {
        const { x, y } = pos.current;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Calculate edge proximity (0 = at edge, 1 = fully inside)
        const edgeFactor = visible.current
          ? Math.min(
              x / EDGE_FADE_DISTANCE,
              y / EDGE_FADE_DISTANCE,
              (vw - x) / EDGE_FADE_DISTANCE,
              (vh - y) / EDGE_FADE_DISTANCE,
              1
            )
          : 0;

        const clampedFade = Math.max(0, Math.min(1, edgeFactor));
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
        transition: "opacity 150ms ease-out",
      }}
    />
  );
}
