"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const pos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    function handleMouseMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
    }

    function tick() {
      const el = cursorRef.current;
      if (el) {
        el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
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
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
    >
      <div
        className="h-5 w-[10px] -translate-x-1/2 animate-blink rounded-[1px]"
        style={{
          background: "linear-gradient(180deg, #4F7BF7, #8B5CF6)",
          boxShadow: "0 0 8px rgba(79,123,247,0.4), 0 0 16px rgba(139,92,246,0.15)",
        }}
      />
    </div>
  );
}
