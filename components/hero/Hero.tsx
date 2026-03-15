"use client";

import { useRef } from "react";
import { useMousePosition } from "@/hooks/useMousePosition";
import { AnimatedGrid } from "./AnimatedGrid";
import { AmbientParticles } from "./AmbientParticles";
import { HeroText } from "./HeroText";
import { AvatarSection } from "./AvatarSection";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition(containerRef);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-x-clip"
    >
      {/* Grid background */}
      <AnimatedGrid mouseX={mouse.x} mouseY={mouse.y} />

      {/* Ambient particles */}
      <AmbientParticles mouseX={mouse.x} mouseY={mouse.y} />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute right-[10%] top-[20%] h-[320px] w-[320px] rounded-full bg-accent/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[5%] h-[260px] w-[260px] rounded-full bg-accent-purple/[0.04] blur-[80px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-6 md:px-12 lg:px-20">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-24">
          <div className="flex-1">
            <HeroText />
          </div>
          <AvatarSection mouseX={mouse.x} mouseY={mouse.y} />
        </div>
      </div>
    </section>
  );
}
