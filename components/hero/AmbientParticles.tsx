"use client";

import { useEffect, useRef, useState } from "react";

interface GridWarpProps {
  mouseX?: number;
  mouseY?: number;
}

const GRID_SIZE = 68;
const WARP_RADIUS = 200;
const WARP_STRENGTH = 30;
const BASE_ALPHA = 0.025;

export function AmbientParticles({ mouseX = 0, mouseY = 0 }: GridWarpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const smoothCursorRef = useRef({ x: -9999, y: -9999 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

    let firstMove = true;
    function handleMouse(e: MouseEvent) {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      if (firstMove) {
        smoothCursorRef.current = { x: e.clientX, y: e.clientY };
        firstMove = false;
      }
    }
    window.addEventListener("mousemove", handleMouse, { passive: true });

    function handleLeave() {
      cursorRef.current = { x: -9999, y: -9999 };
    }
    document.addEventListener("mouseleave", handleLeave);

    function warpPoint(px: number, py: number, cx: number, cy: number): [number, number] {
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= WARP_RADIUS || dist === 0) return [px, py];

      const factor = (1 - dist / WARP_RADIUS);
      const push = factor * factor * WARP_STRENGTH;
      return [px + (dx / dist) * push, py + (dy / dist) * push];
    }

    function tick() {
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.width / dpr;
      const ch = canvas!.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const target = cursorRef.current;
      const smooth = smoothCursorRef.current;
      smooth.x += (target.x - smooth.x) * 0.12;
      smooth.y += (target.y - smooth.y) * 0.12;

      const cx = smooth.x;
      const cy = smooth.y;

      const cols = Math.ceil(cw / GRID_SIZE) + 1;
      const rows = Math.ceil(ch / GRID_SIZE) + 1;

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255, 255, 255, ${BASE_ALPHA})`;

      // Vertical lines
      for (let col = 0; col <= cols; col++) {
        const baseX = col * GRID_SIZE;
        ctx.beginPath();
        for (let row = 0; row <= rows; row++) {
          const baseY = row * GRID_SIZE;
          const [wx, wy] = warpPoint(baseX, baseY, cx, cy);
          if (row === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      // Horizontal lines
      for (let row = 0; row <= rows; row++) {
        const baseY = row * GRID_SIZE;
        ctx.beginPath();
        for (let col = 0; col <= cols; col++) {
          const baseX = col * GRID_SIZE;
          const [wx, wy] = warpPoint(baseX, baseY, cx, cy);
          if (col === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
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
