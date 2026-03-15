"use client";

import { useEffect, useRef, useState } from "react";

interface GridGlowProps {
  mouseX?: number;
  mouseY?: number;
}

const GRID_SIZE = 80;
const GLOW_RADIUS = 180;
// Extra padding beyond the solar system bounding box to ensure no glow bleeds in
const ZONE_PADDING = 60;
// Soft fade zone — glow attenuates as intersections approach the exclusion boundary
const ZONE_FADE = 80;

interface ExclusionZone {
  cx: number;
  cy: number;
  r: number;
}

export function AmbientParticles({ mouseX = 0, mouseY = 0 }: GridGlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const glowMapRef = useRef<Map<string, number>>(new Map());
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
        // Use the larger dimension as radius + padding for planet pills extending beyond
        const r = Math.max(rect.width, rect.height) / 2 + ZONE_PADDING;
        exclusionRef.current = { cx, cy, r };
      }
    }

    // Measure on mount (after a tick so layout is settled) and on resize/scroll
    const initialTimer = setTimeout(measureExclusionZone, 100);
    window.addEventListener("resize", measureExclusionZone);
    window.addEventListener("scroll", measureExclusionZone, { passive: true });

    function handleMouse(e: MouseEvent) {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      measureExclusionZone();
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
      const zone = exclusionRef.current;

      // Check if cursor is inside the exclusion zone (including fade buffer)
      const cursorDistToZone = zone
        ? Math.sqrt((cursor.x - zone.cx) ** 2 + (cursor.y - zone.cy) ** 2)
        : Infinity;
      const cursorInZone = zone ? cursorDistToZone < zone.r : false;

      const activeKeys = new Set<string>();

      if (!cursorInZone) {
        const startCol = Math.max(0, Math.floor((cursor.x - GLOW_RADIUS) / GRID_SIZE));
        const endCol = Math.ceil((cursor.x + GLOW_RADIUS) / GRID_SIZE);
        const startRow = Math.max(0, Math.floor((cursor.y - GLOW_RADIUS) / GRID_SIZE));
        const endRow = Math.ceil((cursor.y + GLOW_RADIUS) / GRID_SIZE);

        for (let col = startCol; col <= endCol; col++) {
          for (let row = startRow; row <= endRow; row++) {
            const ix = col * GRID_SIZE;
            const iy = row * GRID_SIZE;

            // Calculate distance from this intersection to the exclusion zone center
            let zoneAttenuation = 1;
            if (zone) {
              const dzx = ix - zone.cx;
              const dzy = iy - zone.cy;
              const distToCenter = Math.sqrt(dzx * dzx + dzy * dzy);
              // Hard exclude anything inside the zone
              if (distToCenter < zone.r) continue;
              // Soft fade in the buffer region outside the zone
              if (distToCenter < zone.r + ZONE_FADE) {
                zoneAttenuation = (distToCenter - zone.r) / ZONE_FADE;
              }
            }

            const dx = cursor.x - ix;
            const dy = cursor.y - iy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < GLOW_RADIUS) {
              const key = `${col},${row}`;
              activeKeys.add(key);
              const targetOpacity = (1 - dist / GLOW_RADIUS) * 0.35 * zoneAttenuation;
              const current = glowMap.get(key) ?? 0;
              glowMap.set(key, current + (targetOpacity - current) * 0.15);
            }
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

        const grad = ctx.createRadialGradient(ix, iy, 0, ix, iy, 6);
        grad.addColorStop(0, `rgba(79, 123, 247, ${opacity * 0.6})`);
        grad.addColorStop(0.5, `rgba(79, 123, 247, ${opacity * 0.2})`);
        grad.addColorStop(1, `rgba(79, 123, 247, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(ix - 6, iy - 6, 12, 12);

        ctx.beginPath();
        ctx.arc(ix, iy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(237, 237, 237, ${opacity})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(initialTimer);
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", measureExclusionZone);
      window.removeEventListener("scroll", measureExclusionZone);
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
