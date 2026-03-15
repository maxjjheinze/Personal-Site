"use client";

import { useEffect, useRef, useState } from "react";

interface GridWarpProps {
  mouseX?: number;
  mouseY?: number;
}

const GRID_SIZE = 68;
const WARP_RADIUS = 200;
const WARP_STRENGTH = 30;
const ZONE_PADDING = 60;
const ZONE_FADE = 80;

interface ExclusionZone {
  cx: number;
  cy: number;
  r: number;
}

export function AmbientParticles({ mouseX = 0, mouseY = 0 }: GridWarpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const smoothCursorRef = useRef({ x: -9999, y: -9999 });
  const exclusionRef = useRef<ExclusionZone | null>(null);
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

    function measureExclusionZone() {
      const solarEl = document.querySelector("[data-solar-system]");
      if (solarEl) {
        const rect = solarEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const r = Math.max(rect.width, rect.height) / 2 + ZONE_PADDING;
        exclusionRef.current = { cx, cy, r };
      }
    }

    const initialTimer = setTimeout(measureExclusionZone, 100);
    window.addEventListener("resize", measureExclusionZone);

    let firstMove = true;
    function handleMouse(e: MouseEvent) {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      if (firstMove) {
        smoothCursorRef.current = { x: e.clientX, y: e.clientY };
        firstMove = false;
      }
      measureExclusionZone();
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

      const zone = exclusionRef.current;
      if (zone) {
        const dzx = px - zone.cx;
        const dzy = py - zone.cy;
        if (Math.sqrt(dzx * dzx + dzy * dzy) < zone.r) return [px, py];
        const cdx = cx - zone.cx;
        const cdy = cy - zone.cy;
        if (Math.sqrt(cdx * cdx + cdy * cdy) < zone.r) return [px, py];
      }

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
      const zone = exclusionRef.current;

      const cols = Math.ceil(cw / GRID_SIZE) + 1;
      const rows = Math.ceil(ch / GRID_SIZE) + 1;

      ctx.lineWidth = 1;

      // Vertical lines
      for (let col = 0; col <= cols; col++) {
        const baseX = col * GRID_SIZE;
        ctx.beginPath();

        for (let row = 0; row <= rows; row++) {
          const baseY = row * GRID_SIZE;
          const [wx, wy] = warpPoint(baseX, baseY, cx, cy);

          let alpha = 0.025;
          if (zone) {
            const dzx = baseX - zone.cx;
            const dzy = baseY - zone.cy;
            const distToZone = Math.sqrt(dzx * dzx + dzy * dzy);
            if (distToZone < zone.r) alpha = 0;
            else if (distToZone < zone.r + ZONE_FADE) alpha *= (distToZone - zone.r) / ZONE_FADE;
          }

          if (alpha <= 0) {
            ctx.stroke();
            ctx.beginPath();
            continue;
          }

          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
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

          let alpha = 0.025;
          if (zone) {
            const dzx = baseX - zone.cx;
            const dzy = baseY - zone.cy;
            const distToZone = Math.sqrt(dzx * dzx + dzy * dzy);
            if (distToZone < zone.r) alpha = 0;
            else if (distToZone < zone.r + ZONE_FADE) alpha *= (distToZone - zone.r) / ZONE_FADE;
          }

          if (alpha <= 0) {
            ctx.stroke();
            ctx.beginPath();
            continue;
          }

          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          if (col === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(initialTimer);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", measureExclusionZone);
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
