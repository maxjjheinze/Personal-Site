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

/**
 * Measures actual DOM element positions and renders a matching snapshot
 * onto an offscreen canvas. This guarantees the pixel intro aligns
 * perfectly with the real hero layout.
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
  ctx.strokeStyle = "rgba(255,255,255,0.025)";
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

  // Measure real DOM positions
  const titleEl = document.querySelector("[data-intro-title]");
  const progressEl = document.querySelector("[data-intro-progress]");
  const tickerEl = document.querySelector("[data-intro-ticker]");
  const avatarEl = document.querySelector("[data-intro-avatar]");

  // The hero elements are rendered with Framer Motion hidden state (y: 40px offset).
  // Subtract 40 from measured Y to get their final visible positions.
  const HIDDEN_Y_OFFSET = 40;

  // Use ticker's left edge as the single alignment anchor for all text.
  // The title has marginLeft: -0.07em to compensate for Space Grotesk glyph
  // bearing, but the canvas uses sans-serif which has different metrics.
  // Using one X for everything guarantees alignment in the canvas.
  const anchorX = tickerEl
    ? tickerEl.getBoundingClientRect().left
    : titleEl
      ? titleEl.getBoundingClientRect().left
      : 0;

  if (titleEl) {
    const titleRect = titleEl.getBoundingClientRect();
    const titleY = titleRect.top - HIDDEN_Y_OFFSET;

    const titleStyle = getComputedStyle(titleEl);
    const fontSize = parseFloat(titleStyle.fontSize);

    // "MAX IN" — first line
    ctx.fillStyle = "#EDEDED";
    ctx.font = `800 ${fontSize}px sans-serif`;
    ctx.fillText("MAX IN", anchorX, titleY + fontSize * 0.82);

    // "PROGRESS"
    if (progressEl) {
      const progRect = progressEl.getBoundingClientRect();
      const grad = ctx.createLinearGradient(anchorX, 0, anchorX + (progRect.right - progRect.left), 0);
      grad.addColorStop(0, "#4F7BF7");
      grad.addColorStop(1, "#8B5CF6");
      ctx.fillStyle = grad;
      ctx.fillText("PROGRESS", anchorX, progRect.top - HIDDEN_Y_OFFSET + fontSize * 0.82);
    }

    // Activity ticker
    if (tickerEl) {
      const tickerRect = tickerEl.getBoundingClientRect();
      ctx.fillStyle = "rgba(131,131,140,0.85)";
      ctx.font = "700 14px sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText(
        "BUILDING IN PUBLIC · MELBOURNE, AU",
        anchorX,
        tickerRect.top - HIDDEN_Y_OFFSET + 14
      );
      ctx.letterSpacing = "0px";
    }
  }

  // Avatar — uses scale animation not y offset, so no Y adjustment needed
  if (avatarEl && avatarImg) {
    const avatarRect = avatarEl.getBoundingClientRect();
    const cx = avatarRect.left + avatarRect.width / 2;
    const cy = avatarRect.top + avatarRect.height / 2;
    const radius = avatarRect.width / 2;

    // Glow
    const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.8);
    glowGrad.addColorStop(0, "rgba(79,123,247,0.15)");
    glowGrad.addColorStop(1, "rgba(79,123,247,0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(cx - radius * 1.8, cy - radius * 1.8, radius * 3.6, radius * 3.6);

    // Orbit rings
    const orbitOffsets = [40, 68, 96];
    for (const offset of orbitOffsets) {
      ctx.strokeStyle = "rgba(237,237,237,0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + offset, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Avatar image
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatarImg, avatarRect.left, avatarRect.top, avatarRect.width, avatarRect.height);
    ctx.restore();

    ctx.strokeStyle = "rgba(237,237,237,0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
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
  maxStagger = 400,
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
        const progress = Math.max(
          0,
          Math.min(1, (elapsed - p.delay) / duration)
        );
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

      if (doneCount === particles.length) {
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    },
    [duration, pixelSize, fadeOut]
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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
      // Brief delay to let the hero DOM render so we can measure positions
      requestAnimationFrame(() => {
        const offscreen = renderPageToCanvas(w, h, img);
        const particles = sampleParticles(offscreen, pixelSize, maxStagger);

        particlesRef.current = particles;
        startTimeRef.current = 0;
        rafRef.current = requestAnimationFrame(animate);
      });
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
