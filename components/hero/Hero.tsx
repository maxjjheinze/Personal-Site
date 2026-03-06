"use client";

import { useRef, useState, useCallback } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { AnimatedGrid } from "./AnimatedGrid";
import { HeroText } from "./HeroText";
import { AvatarSection } from "./AvatarSection";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition(containerRef);
  const [proximity, setProximity] = useState(0);

  const handleProximityChange = useCallback((value: number) => {
    setProximity(value);
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
          <div
            className="flex-1 transition-[filter,opacity] duration-700 ease-out"
            style={{
              filter: `blur(${proximity * 3}px)`,
              opacity: 1 - proximity * 0.25,
            }}
          >
            <HeroText />
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
