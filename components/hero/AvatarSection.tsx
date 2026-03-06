"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useIntroComplete } from "@/components/intro/PixelIntro";

interface AvatarSectionProps {
  mouseX?: number;
  mouseY?: number;
}

const ORBITS = [
  { label: "LET'S CONNECT", radiusOffset: 50, speed: 0.2625, startAngle: 0, color: "#4F7BF7" },
  { label: "ABOUT ME", radiusOffset: 85, speed: -0.1875, startAngle: 2.1, color: "#8B5CF6" },
  { label: "MY PROJECTS", radiusOffset: 120, speed: 0.135, startAngle: 4.2, color: "#38BDF8" },
];

function ConnectModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      key="planet-modal"
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-border bg-background/95 p-10 backdrop-blur-xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-mono text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Get in Touch
          </h2>
          <button
            onClick={onClose}
            className="text-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            &#x2715;
          </button>
        </div>

        <div className="space-y-4">
          <a
            href="https://x.com/MaxInProgress"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center gap-4 rounded-xl border border-foreground/[0.08] bg-foreground/[0.03] px-6 py-4 transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/[0.06]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0 text-foreground/70 transition-colors group-hover:text-foreground" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <div className="flex-1">
              <p className="font-mono text-sm font-medium text-foreground/90 group-hover:text-foreground">
                Follow on X
              </p>
              <p className="font-mono text-xs text-muted-foreground/60">
                @MaxInProgress
              </p>
            </div>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>

          <a
            href="mailto:maxjjheinze42@gmail.com"
            className="group flex w-full items-center gap-4 rounded-xl border border-foreground/[0.08] bg-foreground/[0.03] px-6 py-4 transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/[0.06]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0 text-foreground/70 transition-colors group-hover:text-foreground" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <div className="flex-1">
              <p className="font-mono text-sm font-medium text-foreground/90 group-hover:text-foreground">
                Send an Email
              </p>
              <p className="font-mono text-xs text-muted-foreground/60">
                maxjjheinze42@gmail.com
              </p>
            </div>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DefaultModal({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <motion.div
      key="planet-modal"
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 mx-4 w-full max-w-lg rounded-2xl border border-border bg-background/95 p-8 backdrop-blur-xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            &#x2715;
          </button>
        </div>
        <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
          Coming soon...
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AvatarSection({ mouseX = 0, mouseY = 0 }: AvatarSectionProps) {
  const introComplete = useIntroComplete();
  const avatarX = useSpring(mouseX * 0.02, { stiffness: 100, damping: 30 });
  const avatarY = useSpring(mouseY * 0.02, { stiffness: 100, damping: 30 });

  const [activePlanet, setActivePlanet] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [avatarRadius, setAvatarRadius] = useState(160);

  const avatarRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anglesRef = useRef(ORBITS.map((o) => o.startAngle));
  const flexDirRef = useRef<string[]>(ORBITS.map(() => "row"));
  const speedRef = useRef(1);
  const isNearRef = useRef(false);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const avatarRadiusRef = useRef(160);

  useEffect(() => setMounted(true), []);

  // Measure avatar size
  useEffect(() => {
    const measure = () => {
      const el = avatarRef.current;
      if (el) {
        const r = el.offsetWidth / 2;
        setAvatarRadius(r);
        avatarRadiusRef.current = r;
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Mouse proximity detection
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const el = avatarRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
      const threshold = avatarRadiusRef.current + 150;
      isNearRef.current = dist < threshold;
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Orbit animation loop
  useEffect(() => {
    if (!introComplete) return;

    lastTimeRef.current = 0;

    function tick(time: number) {
      const delta = lastTimeRef.current ? time - lastTimeRef.current : 16;
      lastTimeRef.current = time;

      // Smooth speed interpolation toward target
      const target = isNearRef.current ? 0.375 : 0.75;
      speedRef.current += (target - speedRef.current) * 0.03;

      const r0 = avatarRadiusRef.current;

      ORBITS.forEach((orbit, i) => {
        anglesRef.current[i] += orbit.speed * (delta / 1000) * speedRef.current;

        const r = r0 + orbit.radiusOffset;
        const angle = anglesRef.current[i];
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        const el = planetRefs.current[i];
        if (el) {
          el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
          // Hysteresis to prevent rapid flipping at x ≈ 0
          const currentDir = flexDirRef.current[i];
          if (currentDir === "row" && x < -30) {
            flexDirRef.current[i] = "row-reverse";
          } else if (currentDir === "row-reverse" && x > 30) {
            flexDirRef.current[i] = "row";
          }
          el.style.flexDirection = flexDirRef.current[i];
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [introComplete]);

  const closePlanet = useCallback(() => setActivePlanet(null), []);

  return (
    <>
      <motion.div
        className="relative flex flex-shrink-0 items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={introComplete ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{
          duration: 1,
          delay: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        style={{ x: avatarX, y: avatarY }}
      >
        {/* Glow backdrop */}
        <div className="absolute inset-0 scale-150 rounded-full bg-accent/10 blur-3xl animate-glow-pulse" />

        {/* Orbit rings */}
        {introComplete &&
          ORBITS.map((orbit, i) => {
            const r = avatarRadius + orbit.radiusOffset;
            return (
              <motion.div
                key={`ring-${i}`}
                className="absolute rounded-full border border-foreground/[0.04]"
                style={{
                  width: r * 2,
                  height: r * 2,
                  left: "50%",
                  top: "50%",
                  marginLeft: -r,
                  marginTop: -r,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
              />
            );
          })}

        {/* Avatar */}
        <motion.div
          ref={avatarRef}
          className="relative h-48 w-48 overflow-hidden rounded-full border-2 border-foreground/10 sm:h-56 sm:w-56 lg:h-72 lg:w-72 xl:h-80 xl:w-80"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Image
            src="/profile.png"
            alt="Max - Profile Avatar"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, (max-width: 1280px) 288px, 320px"
          />
        </motion.div>

        {/* Orbiting planets */}
        {introComplete &&
          ORBITS.map((orbit, i) => (
            <div
              key={orbit.label}
              ref={(el) => {
                planetRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 flex items-center cursor-pointer group"
              onClick={() => setActivePlanet(orbit.label)}
            >
              <div
                className="flex items-center gap-2 rounded-full border border-foreground/[0.08] bg-background/60 px-3 py-1.5 backdrop-blur-sm transition-all duration-300 group-hover:border-foreground/20 group-hover:bg-background/80"
                style={{
                  boxShadow: `0 0 12px ${orbit.color}15`,
                }}
              >
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125"
                  style={{
                    backgroundColor: orbit.color,
                    boxShadow: `0 0 8px ${orbit.color}66`,
                  }}
                />
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 group-hover:text-foreground/90 transition-colors duration-300 whitespace-nowrap select-none">
                  {orbit.label}
                </span>
              </div>
            </div>
          ))}
      </motion.div>

      {/* Modal portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activePlanet === "LET'S CONNECT" && (
              <ConnectModal onClose={closePlanet} />
            )}
            {activePlanet && activePlanet !== "LET'S CONNECT" && (
              <DefaultModal title={activePlanet} onClose={closePlanet} />
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
