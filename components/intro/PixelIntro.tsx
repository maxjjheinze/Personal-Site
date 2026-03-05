"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  r: number;
  g: number;
  b: number;
  delay: number;
}

interface PixelIntroProps {
  children: React.ReactNode;
  pixelSize?: number;
  duration?: number;
  maxStagger?: number;
}

const BG_CSS = "#101014";
const BG_R = 16;
const BG_G = 16;
const BG_B = 20;
const COLOR_THRESHOLD = 20;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Renders an approximation of the hero page onto an offscreen canvas,
 * then samples pixels from it to create particles.
 */
function renderPageToCanvas(
  w: number,
  h: number,
  avatarImg: HTMLImageElement | null
): HTMLCanvasElement {
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext("2d")!;

  // Background
  ctx.fillStyle = BG_CSS;
  ctx.fillRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const isDesktop = w >= 1024;
  const containerW = Math.min(w, 1280);
  const containerLeft = (w - containerW) / 2;
  const paddingX = w >= 1024 ? 80 : w >= 768 ? 48 : 24;

  if (isDesktop) {
    const textX = containerLeft + paddingX;
    const contentCenterY = h / 2;

    // Label
    ctx.fillStyle = "#4F7BF7";
    ctx.font = "600 12px sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText("DIGITAL ARTEFACT / 2026", textX, contentCenterY - 180);
    ctx.letterSpacing = "0px";

    // Title
    const titleSize = w >= 1280 ? 144 : 72;
    ctx.fillStyle = "#EDEDED";
    ctx.font = `800 ${titleSize}px sans-serif`;
    ctx.fillText("MAX IN", textX, contentCenterY - 50);

    const grad = ctx.createLinearGradient(textX, 0, textX + 600, 0);
    grad.addColorStop(0, "#4F7BF7");
    grad.addColorStop(1, "#8B5CF6");
    ctx.fillStyle = grad;
    ctx.fillText("PROGRESS", textX, contentCenterY + titleSize * 0.8);

    // Tagline
    ctx.fillStyle = "#83838C";
    ctx.font = "400 20px sans-serif";
    ctx.fillText(
      "Aspiring Dev, Crypto Enthusiast, Algo Trader.",
      textX,
      contentCenterY + titleSize * 0.8 + 50
    );

    // Date & Time
    const now = new Date();
    const dateStr = now
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
      .toUpperCase();
    const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
    ctx.fillStyle = "rgba(131,131,140,0.6)";
    ctx.font = "400 12px sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText(
      `${dateStr}  ·  ${timeStr}`,
      textX,
      contentCenterY + titleSize * 0.8 + 80
    );
    ctx.letterSpacing = "0px";

    // Avatar
    const avatarSize = w >= 1280 ? 320 : 288;
    const gap = 96;
    const textWidth = containerW - paddingX * 2 - gap - avatarSize;
    const avatarX = containerLeft + paddingX + textWidth + gap;
    const avatarY = contentCenterY - avatarSize / 2;
    const cx = avatarX + avatarSize / 2;
    const cy = avatarY + avatarSize / 2;

    // Glow
    const glowGrad = ctx.createRadialGradient(
      cx,
      cy,
      avatarSize * 0.3,
      cx,
      cy,
      avatarSize * 0.9
    );
    glowGrad.addColorStop(0, "rgba(79,123,247,0.15)");
    glowGrad.addColorStop(1, "rgba(79,123,247,0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(
      avatarX - avatarSize * 0.4,
      avatarY - avatarSize * 0.4,
      avatarSize * 1.8,
      avatarSize * 1.8
    );

    // Rings
    ctx.strokeStyle = "rgba(237,237,237,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, avatarSize / 2 + 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(237,237,237,0.03)";
    ctx.beginPath();
    ctx.arc(cx, cy, avatarSize / 2 + 40, 0, Math.PI * 2);
    ctx.stroke();

    if (avatarImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = "rgba(237,237,237,0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Dots
    const dots = [
      { x: avatarX + avatarSize + 15, y: avatarY + avatarSize * 0.1, s: 6 },
      { x: avatarX + avatarSize + 30, y: avatarY + avatarSize * 0.5, s: 4 },
      {
        x: avatarX + avatarSize * 0.9,
        y: avatarY + avatarSize + 15,
        s: 5,
      },
      { x: avatarX - 10, y: avatarY + avatarSize * 0.05, s: 3 },
    ];
    ctx.fillStyle = "#4F7BF7";
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.s / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    const centerX = w / 2;
    ctx.textAlign = "center";

    ctx.fillStyle = "#4F7BF7";
    ctx.font = "600 10px sans-serif";
    ctx.fillText("DIGITAL ARTEFACT / 2026", centerX, h * 0.2);

    const titleSize = Math.min(w * 0.15, 72);
    ctx.fillStyle = "#EDEDED";
    ctx.font = `800 ${titleSize}px sans-serif`;
    ctx.fillText("MAX IN", centerX, h * 0.2 + titleSize + 10);

    const grad = ctx.createLinearGradient(
      centerX - 200,
      0,
      centerX + 200,
      0
    );
    grad.addColorStop(0, "#4F7BF7");
    grad.addColorStop(1, "#8B5CF6");
    ctx.fillStyle = grad;
    ctx.fillText("PROGRESS", centerX, h * 0.2 + titleSize * 2 + 10);

    ctx.fillStyle = "#83838C";
    ctx.font = "400 16px sans-serif";
    ctx.fillText(
      "Aspiring Dev, Crypto Enthusiast, Algo Trader.",
      centerX,
      h * 0.2 + titleSize * 2 + 50
    );

    const now = new Date();
    const dateStr = now
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
      .toUpperCase();
    const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
    ctx.fillStyle = "rgba(131,131,140,0.6)";
    ctx.font = "400 10px sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText(
      `${dateStr}  ·  ${timeStr}`,
      centerX,
      h * 0.2 + titleSize * 2 + 75
    );
    ctx.letterSpacing = "0px";

    const avatarSize = Math.min(192, w * 0.45);
    const avatarX = centerX - avatarSize / 2;
    const avatarY = h * 0.55;

    if (avatarImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    }

    ctx.textAlign = "start";
  }

  return offscreen;
}

function sampleParticles(
  offscreen: HTMLCanvasElement,
  pixelSize: number,
  maxStagger: number
): Particle[] {
  const ctx = offscreen.getContext("2d")!;
  const w = offscreen.width;
  const h = offscreen.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const pixels = imgData.data;
  const particles: Particle[] = [];

  for (let py = 0; py < h; py += pixelSize) {
    for (let px = 0; px < w; px += pixelSize) {
      const idx = (py * w + px) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      // Skip background-like pixels
      if (
        Math.abs(r - BG_R) < COLOR_THRESHOLD &&
        Math.abs(g - BG_G) < COLOR_THRESHOLD &&
        Math.abs(b - BG_B) < COLOR_THRESHOLD
      ) {
        continue;
      }

      particles.push({
        startX: Math.random() * (w * 1.4) - w * 0.2,
        startY: Math.random() * (h * 1.4) - h * 0.2,
        targetX: px,
        targetY: py,
        r,
        g,
        b,
        delay: Math.random() * maxStagger,
      });
    }
  }

  return particles;
}

export function PixelIntro({
  children,
  pixelSize = 4,
  duration = 1750,
  maxStagger = 400,
}: PixelIntroProps) {
  const [showCanvas, setShowCanvas] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const fadeOut = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.style.transition =
        "opacity 800ms ease-out, filter 800ms ease-out";
      canvasRef.current.style.opacity = "0";
      canvasRef.current.style.filter = "blur(16px)";
    }
    setTimeout(() => setShowCanvas(false), 820);
  }, []);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = BG_CSS;
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      let allDone = true;
      let prevColor = "";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const progress = Math.max(
          0,
          Math.min(1, (elapsed - p.delay) / duration)
        );
        const eased = easeOutCubic(progress);

        if (progress < 1) allDone = false;

        const x = p.startX + (p.targetX - p.startX) * eased;
        const y = p.startY + (p.targetY - p.startY) * eased;

        const color = `rgb(${p.r},${p.g},${p.b})`;
        if (color !== prevColor) {
          ctx.fillStyle = color;
          prevColor = color;
        }
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }

      if (allDone) {
        fadeOut();
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [duration, pixelSize, fadeOut]
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setShowCanvas(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Fill with background immediately
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = BG_CSS;
    ctx.fillRect(0, 0, w, h);

    // Load the avatar image, then render and start animation
    const avatarImg = new Image();
    avatarImg.crossOrigin = "anonymous";
    avatarImg.src = "/profile.png";

    function startAnimation(img: HTMLImageElement | null) {
      const offscreen = renderPageToCanvas(w, h, img);
      const particles = sampleParticles(offscreen, pixelSize, maxStagger);

      particlesRef.current = particles;
      startTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(animate);
    }

    avatarImg.onload = () => startAnimation(avatarImg);
    avatarImg.onerror = () => startAnimation(null);

    // Fallback if image takes too long
    const timeout = setTimeout(() => {
      if (!startTimeRef.current) startAnimation(null);
    }, 2000);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pixelSize, maxStagger, animate]);

  return (
    <>
      {showCanvas && (
        <canvas
          ref={canvasRef}
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}
      {children}
    </>
  );
}
