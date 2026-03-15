"use client";

import { useEffect, useRef, useState } from "react";

interface GridGlowProps {
  mouseX?: number;
  mouseY?: number;
}

const GRID_SIZE = 80;
const GLOW_RADIUS = 180;

export function AmbientParticles({ mouseX = 0, mouseY = 0 }: GridGlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const glowMapRef = useRef<Map<string, number>>(new Map());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Suppress unused prop warnings — props kept for API compat with Hero
  void mouseX;
  void mouseY;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    function handleMouse(e: MouseEvent) {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("mousemove", handleMouse, { passive: true });

    function handleLeave() {
      cursorRef.current = { x: -9999, y: -9999 };
    }
    document.addEventListener("mouseleave", handleLeave);

    const glowMap = glowMapRef.current;

    function tick() {
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.width / dpr;
      const ch = canvas!.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const cursor = cursorRef.current;

      // Determine which grid intersections are near the cursor
      const startCol = Math.max(0, Math.floor((cursor.x - GLOW_RADIUS) / GRID_SIZE));
      const endCol = Math.ceil((cursor.x + GLOW_RADIUS) / GRID_SIZE);
      const startRow = Math.max(0, Math.floor((cursor.y - GLOW_RADIUS) / GRID_SIZE));
      const endRow = Math.ceil((cursor.y + GLOW_RADIUS) / GRID_SIZE);

      // Set target glow for nearby intersections
      const activeKeys = new Set<string>();
      for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
          const ix = col * GRID_SIZE;
          const iy = row * GRID_SIZE;
          const dx = cursor.x - ix;
          const dy = cursor.y - iy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < GLOW_RADIUS) {
            const key = `${col},${row}`;
            activeKeys.add(key);
            const targetOpacity = (1 - dist / GLOW_RADIUS) * 0.35;
            const current = glowMap.get(key) ?? 0;
            // Ease toward target
            glowMap.set(key, current + (targetOpacity - current) * 0.15);
          }
        }
      }

      // Fade out inactive intersections
      for (const [key, val] of glowMap.entries()) {
        if (!activeKeys.has(key)) {
          const next = val * 0.9;
          if (next < 0.002) {
            glowMap.delete(key);
          } else {
            glowMap.set(key, next);
          }
        }
      }

      // Render glowing dots
      for (const [key, opacity] of glowMap.entries()) {
        const [colStr, rowStr] = key.split(",");
        const ix = parseInt(colStr) * GRID_SIZE;
        const iy = parseInt(rowStr) * GRID_SIZE;

        // Outer soft glow
        const grad = ctx.createRadialGradient(ix, iy, 0, ix, iy, 6);
        grad.addColorStop(0, `rgba(79, 123, 247, ${opacity * 0.6})`);
        grad.addColorStop(0.5, `rgba(79, 123, 247, ${opacity * 0.2})`);
        grad.addColorStop(1, `rgba(79, 123, 247, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(ix - 6, iy - 6, 12, 12);

        // Core bright dot
        ctx.beginPath();
        ctx.arc(ix, iy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(237, 237, 237, ${opacity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 1 }}
    />
  );
}
