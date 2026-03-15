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

  // Grid lines (matching AnimatedGrid line pattern)
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

  // No scale transform — content renders at native size now
  const isDesktop = w >= 1024;
  const containerW = Math.min(w, 1280);
  const containerLeft = (w - containerW) / 2;
  const paddingX = w >= 1024 ? 80 : w >= 768 ? 48 : 24;

  if (isDesktop) {
    const textX = containerLeft + paddingX - 80;
    const contentCenterY = h / 2;

    // Title — shifted left by 0.07em to match CSS marginLeft: -0.07em
    const titleSize = w >= 1280 ? 115 : 58;
    const titleOffsetX = textX - titleSize * 0.07;
    ctx.fillStyle = "#EDEDED";
    ctx.font = `800 ${titleSize}px sans-serif`;
    ctx.fillText("MAX IN", titleOffsetX, contentCenterY - 50);

    const grad = ctx.createLinearGradient(titleOffsetX, 0, titleOffsetX + 500, 0);
    grad.addColorStop(0, "#4F7BF7");
    grad.addColorStop(1, "#8B5CF6");
    ctx.fillStyle = grad;
    ctx.fillText("PROGRESS", titleOffsetX, contentCenterY + titleSize * 0.8);

    // Activity ticker placeholder — stays at textX (aligned with title after offset)
    ctx.fillStyle = "rgba(131,131,140,0.6)";
    ctx.font = "700 14px sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText(
      "BUILDING IN PUBLIC · MELBOURNE, AU",
      titleOffsetX,
      contentCenterY + titleSize * 0.8 + 50
    );
    ctx.letterSpacing = "0px";

    // Avatar — sizes match new AvatarSection (no 0.8 scale)
    const avatarSize = w >= 1280 ? 256 : 230;
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

    // Orbit rings — updated offsets
    const orbitOffsets = [40, 68, 96];
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

    const titleSize = Math.min(w * 0.12, 58);
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

    ctx.fillStyle = "rgba(131,131,140,0.6)";
    ctx.font = "700 12px sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText(
      "BUILDING IN PUBLIC · MELBOURNE, AU",
      centerX,
      h * 0.2 + titleSize * 2 + 50
    );
    ctx.letterSpacing = "0px";

    const avatarSize = Math.min(154, w * 0.4);
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

    // Fill with background immediately
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
