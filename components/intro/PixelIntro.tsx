"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

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

const IntroContext = createContext(true);

export function useIntroComplete() {
  return useContext(IntroContext);
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function renderPageToCanvas(
  w: number,
  h: number,
  avatarImg: HTMLImageElement | null
): HTMLCanvasElement {
  const offscreen = document.createElement("canvas");
  offscreen.width = w;
  offscreen.height = h;
  const ctx = offscreen.getContext("2d")!;

  ctx.fillStyle = BG_CSS;
  ctx.fillRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.025)";
  ctx.lineWidth = 1;
  for (let gx = 0; gx < w; gx += 68) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, h);
    ctx.stroke();
  }
  for (let gy = 0; gy < h; gy += 68) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }

  const isDesktop = w >= 1024;
  const containerW = Math.min(w, 1280);
  const containerLeft = (w - containerW) / 2;
  const paddingX = w >= 1024 ? 80 : w >= 768 ? 48 : 24;

  // Use Space Grotesk (font-display) to match the actual page
  const spaceGrotesk = getComputedStyle(document.documentElement).getPropertyValue("--font-space-grotesk").trim();
  const titleFont = spaceGrotesk ? `${spaceGrotesk}, sans-serif` : "sans-serif";

  if (isDesktop) {
    const centerY = h / 2;
    const avatarSize = w >= 1280 ? 205 : 184;

    const baseX = containerLeft + paddingX + 68;

    // Find the actual visible left edge of the title "M" by pixel-scanning.
    // Render "M" on a tiny temp canvas, scan columns left-to-right for the
    // first non-empty pixel. Do the same for the ticker "B". The difference
    // tells us exactly how many pixels to shift the ticker to visually align.
    function findVisualLeftEdge(font: string, char: string, size: number): number {
      const tmp = document.createElement("canvas");
      tmp.width = size * 2;
      tmp.height = size * 2;
      const tc = tmp.getContext("2d")!;
      tc.fillStyle = "#000000";
      tc.fillRect(0, 0, tmp.width, tmp.height);
      tc.fillStyle = "#FFFFFF";
      tc.font = font;
      tc.fillText(char, 0, size * 1.2);
      const imgData = tc.getImageData(0, 0, tmp.width, tmp.height);
      const px = imgData.data;
      for (let col = 0; col < tmp.width; col++) {
        for (let row = 0; row < tmp.height; row++) {
          const idx = (row * tmp.width + col) * 4;
          if (px[idx] > 10) return col; // found first bright pixel
        }
      }
      return 0;
    }

    // Scaled down ~15% from CSS values so canvas rendering visually matches the page
    const isXL = w >= 1280;
    const fontSize = isXL ? 64 : 32;
    const maxInY = isXL ? centerY - 20 : centerY - 10;
    const progressY = isXL ? centerY + 52 : centerY + 26;
    const tickerY = isXL ? centerY + 88 : centerY + 44;
    const tickerFontSize = isXL ? 12 : 10;

    const titleLeftEdge = findVisualLeftEdge(`700 ${fontSize}px ${titleFont}`, "M", fontSize);
    const tickerLeftEdge = findVisualLeftEdge(`700 ${tickerFontSize}px ${titleFont}`, "B", tickerFontSize);
    const visualOffset = titleLeftEdge - tickerLeftEdge;

    // "MAX IN" — matches font-display text-[46px]/text-[5.75rem] font-bold tracking-tighter
    ctx.fillStyle = "#EDEDED";
    ctx.font = `700 ${fontSize}px ${titleFont}`;
    ctx.letterSpacing = `${-0.05 * fontSize}px`;
    ctx.fillText("MAX IN", baseX, maxInY);

    // "PROGRESS"
    const grad = ctx.createLinearGradient(baseX, 0, baseX + 500, 0);
    grad.addColorStop(0, "#5A8AFF");
    grad.addColorStop(1, "#A578FF");
    ctx.fillStyle = grad;
    ctx.fillText("PROGRESS", baseX, progressY);

    // Reset letter spacing for ticker
    ctx.letterSpacing = "0px";

    // Ticker
    ctx.fillStyle = "rgba(131,131,140,0.85)";
    ctx.font = `700 ${tickerFontSize}px ${titleFont}`;
    ctx.letterSpacing = `${0.25 * tickerFontSize}px`;
    ctx.fillText("BUILDING IN PUBLIC · MELBOURNE, AU", baseX + visualOffset, tickerY);
    ctx.letterSpacing = "0px";

    // Avatar — matches lg:-translate-x-[136px] on avatar wrapper
    const avatarX = containerLeft + containerW - paddingX - avatarSize - 136;
    const avatarY = centerY - avatarSize / 2;
    const cx = avatarX + avatarSize / 2;
    const cy = avatarY + avatarSize / 2;

    // Glow
    const glowGrad = ctx.createRadialGradient(cx, cy, avatarSize * 0.3, cx, cy, avatarSize * 0.9);
    glowGrad.addColorStop(0, "rgba(79,123,247,0.15)");
    glowGrad.addColorStop(1, "rgba(79,123,247,0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(avatarX - avatarSize * 0.4, avatarY - avatarSize * 0.4, avatarSize * 1.8, avatarSize * 1.8);

    // Orbit rings
    const orbitOffsets = [32, 54, 77];
    for (const offset of orbitOffsets) {
      ctx.strokeStyle = "rgba(237,237,237,0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, avatarSize / 2 + offset, 0, Math.PI * 2);
      ctx.stroke();
    }

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

  } else {
    const centerX = w / 2;
    ctx.textAlign = "center";

    const titleSize = Math.min(w * 0.1, 46);
    ctx.fillStyle = "#EDEDED";
    ctx.font = `700 ${titleSize}px ${titleFont}`;
    ctx.letterSpacing = `${-0.05 * titleSize}px`;
    ctx.fillText("MAX IN", centerX, h * 0.2 + titleSize + 10);

    const grad = ctx.createLinearGradient(centerX - 200, 0, centerX + 200, 0);
    grad.addColorStop(0, "#5A8AFF");
    grad.addColorStop(1, "#A578FF");
    ctx.fillStyle = grad;
    ctx.fillText("PROGRESS", centerX, h * 0.2 + titleSize * 2 + 10);

    ctx.letterSpacing = "0px";
    ctx.fillStyle = "rgba(131,131,140,0.85)";
    ctx.font = `700 12px ${titleFont}`;
    ctx.letterSpacing = `${0.25 * 12}px`;
    ctx.fillText("BUILDING IN PUBLIC · MELBOURNE, AU", centerX, h * 0.2 + titleSize * 2 + 50);
    ctx.letterSpacing = "0px";

    const avatarSize = Math.min(154, w * 0.4);
    const avatarX = centerX - avatarSize / 2;
    const avatarY = h * 0.55;

    if (avatarImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
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
  pixelSize = 2,
  duration = 1750,
  maxStagger = 250,
}: PixelIntroProps) {
  const [showCanvas, setShowCanvas] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const cssDimsRef = useRef({ w: 0, h: 0 });
  const fadingRef = useRef(false);

  const fadeOut = useCallback(() => {
    setIntroComplete(true);
    if (canvasRef.current) {
      canvasRef.current.style.transition =
        "opacity 1000ms ease-out, filter 1000ms ease-out, transform 1000ms ease-out";
      canvasRef.current.style.opacity = "0";
      canvasRef.current.style.filter = "blur(32px)";
      canvasRef.current.style.transform = "scale(1.05)";
    }
    setTimeout(() => setShowCanvas(false), 1020);
  }, []);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h } = cssDimsRef.current;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = BG_CSS;
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      let doneCount = 0;
      let prevColor = "";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const progress = Math.max(0, Math.min(1, (elapsed - p.delay) / duration));
        const eased = easeOutQuart(progress);

        if (progress >= 1) doneCount++;

        const x = p.startX + (p.targetX - p.startX) * eased;
        const y = p.startY + (p.targetY - p.startY) * eased;

        const color = `rgb(${p.r},${p.g},${p.b})`;
        if (color !== prevColor) {
          ctx.fillStyle = color;
          prevColor = color;
        }
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }

      if (!fadingRef.current && doneCount > particles.length * 0.85) {
        fadingRef.current = true;
        fadeOut();
      }

      if (doneCount === particles.length) return;
      rafRef.current = requestAnimationFrame(animate);
    },
    [duration, pixelSize, fadeOut]
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setIntroComplete(true);
      setShowCanvas(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    cssDimsRef.current = { w, h };

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BG_CSS;
    ctx.fillRect(0, 0, w, h);

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

    const timeout = setTimeout(() => {
      if (!startTimeRef.current) startAnimation(null);
    }, 2000);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pixelSize, maxStagger, animate]);

  return (
    <IntroContext.Provider value={introComplete}>
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
    </IntroContext.Provider>
  );
}
