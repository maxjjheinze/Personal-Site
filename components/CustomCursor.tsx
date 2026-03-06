"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const smoothPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.documentElement.style.cursor = "none";

    function handleMouseMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
    }

    function tick() {
      // Smooth interpolation for the ring (trails slightly behind)
      smoothPos.current.x += (pos.current.x - smoothPos.current.x) * 0.15;
      smoothPos.current.y += (pos.current.y - smoothPos.current.y) * 0.15;

      const ring = ringRef.current;
      const glow = glowRef.current;

      if (ring) {
        ring.style.transform = `translate(${smoothPos.current.x}px, ${smoothPos.current.y}px) translate(-50%, -50%)`;
      }
      if (glow) {
        glow.style.transform = `translate(${smoothPos.current.x}px, ${smoothPos.current.y}px) translate(-50%, -50%)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Don't render on touch devices (SSR-safe: render but hidden)
  return (
    <>
      {/* Soft glow trail */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-10 w-10 rounded-full md:block"
        style={{
          background: "radial-gradient(circle, rgba(79,123,247,0.15) 0%, transparent 70%)",
        }}
      />
      {/* Ring cursor */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-5 w-5 rounded-full border border-foreground/40 md:block"
        style={{
          boxShadow: "0 0 8px rgba(79,123,247,0.2), inset 0 0 4px rgba(79,123,247,0.1)",
        }}
      />
    </>
  );
}
