"use client";

import { useEffect, useState, type RefObject } from "react";

interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(
  ref: RefObject<HTMLElement | null>
): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const { width, height } = ref.current.getBoundingClientRect();
      const x = (e.clientX / width - 0.5) * 30;
      const y = (e.clientY / height - 0.5) * 30;
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [ref]);

  return position;
}
