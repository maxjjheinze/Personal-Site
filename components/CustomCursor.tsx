"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const smoothPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    function handleMouseMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
    }

    function tick() {
      smoothPos.current.x += (pos.current.x - smoothPos.current.x) * 0.15;
      smoothPos.current.y += (pos.current.y - smoothPos.current.y) * 0.15;

      const dot = dotRef.current;
      const glow = glowRef.current;

      if (dot) {
        dot.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (glow) {
        glow.style.transform = `translate(${smoothPos.current.x}px, ${smoothPos.current.y}px) translate(-50%, -50%)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Soft trailing glow */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-8 w-8 rounded-full md:block"
        style={{
          background: "radial-gradient(circle, rgba(79,123,247,0.2) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)",
        }}
      />
      {/* Gradient dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-3 w-3 rounded-full md:block"
        style={{
          background: "linear-gradient(135deg, #4F7BF7, #8B5CF6)",
          boxShadow: "0 0 6px rgba(79,123,247,0.5), 0 0 12px rgba(139,92,246,0.25)",
        }}
      />
    </>
  );
}
