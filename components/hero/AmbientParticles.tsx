"use client";

import { useEffect, useRef, useState } from "react";

interface HeatTrailProps {
  mouseX?: number;
  mouseY?: number;
}

const TRAIL_LIFETIME = 3000; // ms before a trail point fully fades
const TRAIL_EMIT_INTERVAL = 30; // ms between emitting trail points
const TRAIL_RADIUS = 40; // glow radius per point
const ZONE_PADDING = 60;

interface ExclusionZone {
  cx: number;
  cy: number;
  r: number;
}

interface TrailPoint {
  x: number;
  y: number;
  birth: number;
}

export function AmbientParticles({ mouseX = 0, mouseY = 0 }: HeatTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const exclusionRef = useRef<ExclusionZone | null>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const lastEmitRef = useRef(0);
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

    const trail = trailRef.current;

    function tick(now: number) {
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas!.width / dpr;
      const ch = canvas!.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      const cursor = cursorRef.current;
      const zone = exclusionRef.current;

      // Emit trail points
      const cursorInZone = zone
        ? Math.sqrt((cursor.x - zone.cx) ** 2 + (cursor.y - zone.cy) ** 2) < zone.r
        : false;

      if (cursor.x > -1000 && !cursorInZone && now - lastEmitRef.current > TRAIL_EMIT_INTERVAL) {
        trail.push({ x: cursor.x, y: cursor.y, birth: now });
        lastEmitRef.current = now;
      }

      // Remove expired points
      while (trail.length > 0 && now - trail[0].birth > TRAIL_LIFETIME) {
        trail.shift();
      }

      // Render trail — each point is a soft radial glow
      for (const point of trail) {
        const age = (now - point.birth) / TRAIL_LIFETIME;
        const fadeOut = 1 - age;
        // Ease out for smooth fade
        const alpha = fadeOut * fadeOut * 0.12;

        if (alpha < 0.002) continue;

        // Skip if inside exclusion zone
        if (zone) {
          const dzx = point.x - zone.cx;
          const dzy = point.y - zone.cy;
          if (Math.sqrt(dzx * dzx + dzy * dzy) < zone.r) continue;
        }

        // Color shifts from blue to purple as it cools
        const r = Math.round(79 + (139 - 79) * age);
        const g = Math.round(123 + (92 - 123) * age);
        const b = Math.round(247 + (246 - 247) * age);

        const grad = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, TRAIL_RADIUS * (1 + age * 0.5)
        );
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(
          point.x - TRAIL_RADIUS * 1.5,
          point.y - TRAIL_RADIUS * 1.5,
          TRAIL_RADIUS * 3,
          TRAIL_RADIUS * 3
        );
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
