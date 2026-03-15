"use client";

import { useEffect, useRef, useState } from "react";

interface GridDissolveProps {
  mouseX?: number;
  mouseY?: number;
}

const GRID_SIZE = 80;
const DISSOLVE_RADIUS = 200;
const ZONE_PADDING = 60;
const ZONE_FADE = 80;

interface ExclusionZone {
  cx: number;
  cy: number;
  r: number;
}

interface Fragment {
  // Original grid position
  originX: number;
  originY: number;
  // Current offset from origin
  offsetX: number;
  offsetY: number;
  // Velocity
  vx: number;
  vy: number;
  // State: 0 = on grid, 1 = fully scattered
  scatter: number;
  size: number;
}

export function AmbientParticles({ mouseX = 0, mouseY = 0 }: GridDissolveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const exclusionRef = useRef<ExclusionZone | null>(null);
  const fragmentsRef = useRef<Map<string, Fragment>>(new Map());
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

    const fragments = fragmentsRef.current;

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

      const cursorInZone = zone
        ? Math.sqrt((cursor.x - zone.cx) ** 2 + (cursor.y - zone.cy) ** 2) < zone.r
        : false;

      const cols = Math.ceil(cw / GRID_SIZE) + 1;
      const rows = Math.ceil(ch / GRID_SIZE) + 1;

      // For each grid intersection, manage fragments
      for (let col = 0; col <= cols; col++) {
        for (let row = 0; row <= rows; row++) {
          const gx = col * GRID_SIZE;
          const gy = row * GRID_SIZE;
          const key = `${col},${row}`;

          // Exclusion zone
          let zoneAlpha = 1;
          if (zone) {
            const dzx = gx - zone.cx;
            const dzy = gy - zone.cy;
            const distToZone = Math.sqrt(dzx * dzx + dzy * dzy);
            if (distToZone < zone.r) { zoneAlpha = 0; }
            else if (distToZone < zone.r + ZONE_FADE) {
              zoneAlpha = (distToZone - zone.r) / ZONE_FADE;
            }
          }
          if (zoneAlpha <= 0) {
            fragments.delete(key);
            continue;
          }

          // Distance from cursor to this intersection
          const dx = gx - cursor.x;
          const dy = gy - cursor.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const inRange = !cursorInZone && dist < DISSOLVE_RADIUS;

          let frag = fragments.get(key);

          if (inRange) {
            // Should be dissolving
            if (!frag) {
              // Create fragment — burst away from cursor
              const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
              const speed = 1.5 + Math.random() * 2;
              frag = {
                originX: gx,
                originY: gy,
                offsetX: 0,
                offsetY: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                scatter: 0,
                size: 1.5 + Math.random() * 1.5,
              };
              fragments.set(key, frag);
            }
            // Increase scatter
            frag.scatter = Math.min(1, frag.scatter + 0.06);
            // Apply velocity
            frag.offsetX += frag.vx;
            frag.offsetY += frag.vy;
            // Dampen slightly
            frag.vx *= 0.98;
            frag.vy *= 0.98;
          } else if (frag) {
            // Should be reforming — pull back to origin
            frag.scatter = Math.max(0, frag.scatter - 0.03);
            frag.offsetX *= 0.92;
            frag.offsetY *= 0.92;
            frag.vx *= 0.9;
            frag.vy *= 0.9;

            // Clean up when fully reformed
            if (frag.scatter < 0.01 && Math.abs(frag.offsetX) < 0.5 && Math.abs(frag.offsetY) < 0.5) {
              fragments.delete(key);
              frag = undefined;
            }
          }

          if (frag && frag.scatter > 0.01) {
            // Draw scattered fragment
            const fx = gx + frag.offsetX;
            const fy = gy + frag.offsetY;
            const alpha = (0.15 + frag.scatter * 0.25) * zoneAlpha;
            ctx.beginPath();
            ctx.arc(fx, fy, frag.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79, 123, 247, ${alpha})`;
            ctx.fill();
          }
        }
      }

      // Draw grid lines (skip segments near scattered intersections)
      ctx.lineWidth = 1;

      // Vertical lines
      for (let col = 0; col <= cols; col++) {
        const gx = col * GRID_SIZE;
        for (let row = 0; row < rows; row++) {
          const gy1 = row * GRID_SIZE;
          const gy2 = (row + 1) * GRID_SIZE;
          const midY = (gy1 + gy2) / 2;

          let alpha = 0.025;
          if (zone) {
            const dzx = gx - zone.cx;
            const dzy = midY - zone.cy;
            const d = Math.sqrt(dzx * dzx + dzy * dzy);
            if (d < zone.r) alpha = 0;
            else if (d < zone.r + ZONE_FADE) alpha *= (d - zone.r) / ZONE_FADE;
          }
          if (alpha <= 0) continue;

          // Check if either endpoint is scattered
          const frag1 = fragments.get(`${col},${row}`);
          const frag2 = fragments.get(`${col},${row + 1}`);
          const s1 = frag1?.scatter ?? 0;
          const s2 = frag2?.scatter ?? 0;
          const maxScatter = Math.max(s1, s2);

          // Fade out line as endpoints scatter
          const lineAlpha = alpha * (1 - maxScatter);
          if (lineAlpha < 0.002) continue;

          ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(gx, gy1);
          ctx.lineTo(gx, gy2);
          ctx.stroke();
        }
      }

      // Horizontal lines
      for (let row = 0; row <= rows; row++) {
        const gy = row * GRID_SIZE;
        for (let col = 0; col < cols; col++) {
          const gx1 = col * GRID_SIZE;
          const gx2 = (col + 1) * GRID_SIZE;
          const midX = (gx1 + gx2) / 2;

          let alpha = 0.025;
          if (zone) {
            const dzx = midX - zone.cx;
            const dzy = gy - zone.cy;
            const d = Math.sqrt(dzx * dzx + dzy * dzy);
            if (d < zone.r) alpha = 0;
            else if (d < zone.r + ZONE_FADE) alpha *= (d - zone.r) / ZONE_FADE;
          }
          if (alpha <= 0) continue;

          const frag1 = fragments.get(`${col},${row}`);
          const frag2 = fragments.get(`${col + 1},${row}`);
          const s1 = frag1?.scatter ?? 0;
          const s2 = frag2?.scatter ?? 0;
          const maxScatter = Math.max(s1, s2);

          const lineAlpha = alpha * (1 - maxScatter);
          if (lineAlpha < 0.002) continue;

          ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(gx1, gy);
          ctx.lineTo(gx2, gy);
          ctx.stroke();
        }
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
