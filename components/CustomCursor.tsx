"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const glowPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    function handleMouseMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
    }

    function tick() {
      // Ring trails behind the dot
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;
      // Glow trails even further behind
      glowPos.current.x += (pos.current.x - glowPos.current.x) * 0.08;
      glowPos.current.y += (pos.current.y - glowPos.current.y) * 0.08;

      const dot = dotRef.current;
      const ring = ringRef.current;
      const glow = glowRef.current;

      if (dot) {
        dot.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ring) {
        ring.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }
      if (glow) {
        glow.style.transform = `translate(${glowPos.current.x}px, ${glowPos.current.y}px) translate(-50%, -50%)`;
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
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-10 w-10 rounded-full md:block"
        style={{
          background: "radial-gradient(circle, rgba(79,123,247,0.15) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)",
        }}
      />
      {/* Orbiting ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-7 w-7 rounded-full border border-foreground/[0.08] md:block"
        style={{
          boxShadow: "0 0 10px rgba(79,123,247,0.1)",
        }}
      />
      {/* Center gradient dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-2.5 w-2.5 rounded-full md:block"
        style={{
          background: "linear-gradient(135deg, #4F7BF7, #8B5CF6)",
          boxShadow: "0 0 6px rgba(79,123,247,0.5), 0 0 12px rgba(139,92,246,0.2)",
        }}
      />
    </>
  );
}
