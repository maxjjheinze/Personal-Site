"use client";

import { useRef, useCallback } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { AnimatedGrid } from "./AnimatedGrid";
import { HeroText } from "./HeroText";
import { AvatarSection } from "./AvatarSection";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const blurOverlayRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition(containerRef);

  const handleProximityChange = useCallback((value: number) => {
    const overlay = blurOverlayRef.current;
    const wrapper = textWrapperRef.current;
    if (!overlay || !wrapper) return;

    const blur = value * 24;
    // Gradient starts far right and sweeps left as cursor approaches
    const gradientStart = Math.max(0, 50 - value * 70);

    overlay.style.backdropFilter = `blur(${blur}px) brightness(${1 - value * 0.3})`;
    overlay.style.setProperty("-webkit-backdrop-filter", `blur(${blur}px) brightness(${1 - value * 0.3})`);
    overlay.style.opacity = String(value > 0.01 ? 1 : 0);
    overlay.style.maskImage = `linear-gradient(to right, transparent ${gradientStart}%, black 100%)`;
    overlay.style.setProperty("-webkit-mask-image", `linear-gradient(to right, transparent ${gradientStart}%, black 100%)`);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-x-clip"
    >
      {/* Grid background */}
      <AnimatedGrid mouseX={mouse.x} mouseY={mouse.y} />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-accent/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[5%] h-[400px] w-[400px] rounded-full bg-accent-purple/[0.04] blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 lg:px-20 scale-[0.8]">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-32">
          <div ref={textWrapperRef} className="relative flex-1">
            <HeroText />
            {/* Gradient blur overlay — darkens + blurs from right to left */}
            <div
              ref={blurOverlayRef}
              className="pointer-events-none absolute inset-0 opacity-0"
              style={{
                maskImage: "linear-gradient(to right, transparent 50%, black 100%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 50%, black 100%)",
              }}
            />
          </div>
          <AvatarSection
            mouseX={mouse.x}
            mouseY={mouse.y}
            onProximityChange={handleProximityChange}
          />
        </div>
      </div>
    </section>
  );
}
