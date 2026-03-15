"use client";

import { useEffect, useRef, useState } from "react";

interface SpotlightGridProps {
  mouseX?: number;
  mouseY?: number;
}

const GRID_SIZE = 80;
const SPOTLIGHT_RADIUS = 250;
const ZONE_PADDING = 60;
const ZONE_FADE = 80;

interface ExclusionZone {
  cx: number;
  cy: number;
  r: number;
}

export function AmbientParticles({ mouseX = 0, mouseY = 0 }: SpotlightGridProps) {
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

    function handleMouse(e: MouseEvent) {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      measureExclusionZone();
    }
    window.addEventListener("mousemove", handleMouse, { passive: true });

    function handleLeave() {
      cursorRef.current = { x: -9999, y: -9999 };
    }
    document.addEventListener("mouseleave", handleLeave);

    function tick() {
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.width / dpr;
      const ch = canvas!.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      // Smooth cursor
      const target = cursorRef.current;
      const smooth = smoothCursorRef.current;
      smooth.x += (target.x - smooth.x) * 0.1;
      smooth.y += (target.y - smooth.y) * 0.1;

      const cx = smooth.x;
      const cy = smooth.y;
      const zone = exclusionRef.current;

      const cols = Math.ceil(cw / GRID_SIZE) + 1;
      const rows = Math.ceil(ch / GRID_SIZE) + 1;

      // Draw vertical lines — only visible segments near spotlight
      ctx.lineWidth = 1;
      for (let col = 0; col <= cols; col++) {
        const baseX = col * GRID_SIZE;
        ctx.beginPath();
        let drawing = false;

        for (let py = 0; py <= ch; py += 4) {
          const dx = baseX - cx;
          const dy = py - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Spotlight falloff
          let alpha = 0;
          if (dist < SPOTLIGHT_RADIUS) {
            const falloff = 1 - dist / SPOTLIGHT_RADIUS;
            alpha = falloff * falloff * 0.12;
          }

          // Exclusion zone fade
          if (zone && alpha > 0) {
            const dzx = baseX - zone.cx;
            const dzy = py - zone.cy;
            const distToZone = Math.sqrt(dzx * dzx + dzy * dzy);
            if (distToZone < zone.r) {
              alpha = 0;
            } else if (distToZone < zone.r + ZONE_FADE) {
              alpha *= (distToZone - zone.r) / ZONE_FADE;
            }
          }

          if (alpha > 0.001) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            if (!drawing) {
              ctx.moveTo(baseX, py);
              drawing = true;
            } else {
              ctx.lineTo(baseX, py);
            }
          } else if (drawing) {
            ctx.stroke();
            ctx.beginPath();
            drawing = false;
          }
        }
        if (drawing) ctx.stroke();
      }

      // Draw horizontal lines
      for (let row = 0; row <= rows; row++) {
        const baseY = row * GRID_SIZE;
        ctx.beginPath();
        let drawing = false;

        for (let px = 0; px <= cw; px += 4) {
          const dx = px - cx;
          const dy = baseY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let alpha = 0;
          if (dist < SPOTLIGHT_RADIUS) {
            const falloff = 1 - dist / SPOTLIGHT_RADIUS;
            alpha = falloff * falloff * 0.12;
          }

          if (zone && alpha > 0) {
            const dzx = px - zone.cx;
            const dzy = baseY - zone.cy;
            const distToZone = Math.sqrt(dzx * dzx + dzy * dzy);
            if (distToZone < zone.r) {
              alpha = 0;
            } else if (distToZone < zone.r + ZONE_FADE) {
              alpha *= (distToZone - zone.r) / ZONE_FADE;
            }
          }

          if (alpha > 0.001) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            if (!drawing) {
              ctx.moveTo(px, baseY);
              drawing = true;
            } else {
              ctx.lineTo(px, baseY);
            }
          } else if (drawing) {
            ctx.stroke();
            ctx.beginPath();
            drawing = false;
          }
        }
        if (drawing) ctx.stroke();
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
