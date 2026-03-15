"use client";

import { useEffect, useRef, useState } from "react";

interface ColorWaveProps {
  mouseX?: number;
  mouseY?: number;
}

const GRID_SIZE = 80;
const WAVE_SPEED = 150; // pixels per second
const WAVE_RADIUS = 350;
const ZONE_PADDING = 60;
const ZONE_FADE = 80;

interface ExclusionZone {
  cx: number;
  cy: number;
  r: number;
}

interface WaveSource {
  x: number;
  y: number;
  time: number;
}

export function AmbientParticles({ mouseX = 0, mouseY = 0 }: ColorWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const exclusionRef = useRef<ExclusionZone | null>(null);
  const wavesRef = useRef<WaveSource[]>([]);
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
      const waves = wavesRef.current;

      // Emit a new wave every 200ms while cursor is on screen
      const cursorInZone = zone
        ? Math.sqrt((cursor.x - zone.cx) ** 2 + (cursor.y - zone.cy) ** 2) < zone.r
        : false;

      if (cursor.x > -1000 && !cursorInZone && now - lastEmitRef.current > 200) {
        waves.push({ x: cursor.x, y: cursor.y, time: now });
        lastEmitRef.current = now;
        // Keep max 15 waves
        if (waves.length > 15) waves.shift();
      }

      // Remove expired waves
      while (waves.length > 0 && now - waves[0].time > (WAVE_RADIUS / WAVE_SPEED) * 1000 + 500) {
        waves.shift();
      }

      const cols = Math.ceil(cw / GRID_SIZE) + 1;
      const rows = Math.ceil(ch / GRID_SIZE) + 1;

      // Draw grid with color wave effect
      // For each grid segment, calculate wave influence and color accordingly
      ctx.lineWidth = 1;

      for (let col = 0; col <= cols; col++) {
        const gx = col * GRID_SIZE;

        // Vertical line segments
        for (let row = 0; row < rows; row++) {
          const gy1 = row * GRID_SIZE;
          const gy2 = (row + 1) * GRID_SIZE;
          const midY = (gy1 + gy2) / 2;

          // Base alpha
          let alpha = 0.025;

          // Exclusion zone
          if (zone) {
            const dzx = gx - zone.cx;
            const dzy = midY - zone.cy;
            const distToZone = Math.sqrt(dzx * dzx + dzy * dzy);
            if (distToZone < zone.r) { alpha = 0; }
            else if (distToZone < zone.r + ZONE_FADE) {
              alpha *= (distToZone - zone.r) / ZONE_FADE;
            }
          }

          if (alpha <= 0) continue;

          // Calculate wave influence at this segment
          let waveIntensity = 0;
          let waveHue = 0; // 0 = blue, 1 = purple
          for (const wave of waves) {
            const dx = gx - wave.x;
            const dy = midY - wave.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const elapsed = (now - wave.time) / 1000;
            const waveEdge = elapsed * WAVE_SPEED;
            const waveDelta = Math.abs(dist - waveEdge);
            const waveWidth = 60;

            if (waveDelta < waveWidth) {
              const strength = (1 - waveDelta / waveWidth);
              const fade = Math.max(0, 1 - waveEdge / WAVE_RADIUS);
              const intensity = strength * strength * fade;
              if (intensity > waveIntensity) {
                waveIntensity = intensity;
                waveHue = Math.min(1, waveEdge / WAVE_RADIUS);
              }
            }
          }

          if (waveIntensity > 0.01) {
            const r = Math.round(79 + (139 - 79) * waveHue);
            const g = Math.round(123 + (92 - 123) * waveHue);
            const b = Math.round(247 + (246 - 247) * waveHue);
            const finalAlpha = alpha + waveIntensity * 0.15;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          }

          ctx.beginPath();
          ctx.moveTo(gx, gy1);
          ctx.lineTo(gx, gy2);
          ctx.stroke();
        }
      }

      for (let row = 0; row <= rows; row++) {
        const gy = row * GRID_SIZE;

        // Horizontal line segments
        for (let col = 0; col < cols; col++) {
          const gx1 = col * GRID_SIZE;
          const gx2 = (col + 1) * GRID_SIZE;
          const midX = (gx1 + gx2) / 2;

          let alpha = 0.025;

          if (zone) {
            const dzx = midX - zone.cx;
            const dzy = gy - zone.cy;
            const distToZone = Math.sqrt(dzx * dzx + dzy * dzy);
            if (distToZone < zone.r) { alpha = 0; }
            else if (distToZone < zone.r + ZONE_FADE) {
              alpha *= (distToZone - zone.r) / ZONE_FADE;
            }
          }

          if (alpha <= 0) continue;

          let waveIntensity = 0;
          let waveHue = 0;
          for (const wave of waves) {
            const dx = midX - wave.x;
            const dy = gy - wave.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const elapsed = (now - wave.time) / 1000;
            const waveEdge = elapsed * WAVE_SPEED;
            const waveDelta = Math.abs(dist - waveEdge);
            const waveWidth = 60;

            if (waveDelta < waveWidth) {
              const strength = (1 - waveDelta / waveWidth);
              const fade = Math.max(0, 1 - waveEdge / WAVE_RADIUS);
              const intensity = strength * strength * fade;
              if (intensity > waveIntensity) {
                waveIntensity = intensity;
                waveHue = Math.min(1, waveEdge / WAVE_RADIUS);
              }
            }
          }

          if (waveIntensity > 0.01) {
            const r = Math.round(79 + (139 - 79) * waveHue);
            const g = Math.round(123 + (92 - 123) * waveHue);
            const b = Math.round(247 + (246 - 247) * waveHue);
            const finalAlpha = alpha + waveIntensity * 0.15;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          }

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
