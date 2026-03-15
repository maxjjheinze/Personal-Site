"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useIntroComplete } from "@/components/intro/PixelIntro";
import { ConnectModal, AboutModal, ProjectsModal } from "@/components/hero/PlanetModals";

interface AvatarSectionProps {
  mouseX?: number;
  mouseY?: number;
}

const ORBITS = [
  { label: "LET'S CONNECT", radiusOffset: 40, speed: 0.2625, startAngle: 0, color: "#FFFFFF" },
  { label: "ABOUT ME", radiusOffset: 68, speed: -0.1875, startAngle: 2.1, color: "#BF5AF2" },
  { label: "MY PROJECTS", radiusOffset: 96, speed: 0.135, startAngle: 4.2, color: "#00D4FF" },
];

export function AvatarSection({ mouseX = 0, mouseY = 0 }: AvatarSectionProps) {
  const introComplete = useIntroComplete();
  const avatarX = useSpring(mouseX * 0.02, { stiffness: 100, damping: 30 });
  const avatarY = useSpring(mouseY * 0.02, { stiffness: 100, damping: 30 });

  const [activePlanet, setActivePlanet] = useState<string | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [avatarRadius, setAvatarRadius] = useState(128);

  const avatarRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const anglesRef = useRef(ORBITS.map((o) => o.startAngle));
  const flexDirRef = useRef<string[]>(ORBITS.map(() => "row"));
  const speedRef = useRef(1);
  const isNearRef = useRef(false);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const avatarRadiusRef = useRef(128);
  const proximityRef = useRef(0);
  const solarSystemRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Magnetic cursor state
  const cursorRef = useRef({ x: 0, y: 0 });
  const avatarCenterRef = useRef({ x: 0, y: 0 });

  useEffect(() => setMounted(true), []);

  // Measure avatar size
  useEffect(() => {
    const measure = () => {
      const el = avatarRef.current;
      if (el) {
        const r = el.offsetWidth / 2;
        setAvatarRadius(r);
        avatarRadiusRef.current = r;
        const rect = el.getBoundingClientRect();
        avatarCenterRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Mouse proximity + cursor tracking
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      const el = avatarRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      avatarCenterRef.current = { x: cx, y: cy };
      const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
      const solarRadius = avatarRadiusRef.current + 96 + 60;
      const fadeZone = 120;
      isNearRef.current = dist < solarRadius + fadeZone;
      if (dist <= solarRadius) {
        proximityRef.current = 1;
      } else {
        const raw = 1 - Math.min((dist - solarRadius) / fadeZone, 1);
        proximityRef.current = raw * raw;
      }
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Orbit animation loop with magnetic cursor
  useEffect(() => {
    if (!introComplete) return;

    lastTimeRef.current = 0;

    function tick(time: number) {
      const delta = lastTimeRef.current ? time - lastTimeRef.current : 16;
      lastTimeRef.current = time;

      const target = isNearRef.current ? 0.1875 : 1.125;
      speedRef.current += (target - speedRef.current) * 0.03;

      const r0 = avatarRadiusRef.current;
      const p = proximityRef.current;
      const center = avatarCenterRef.current;
      const cursor = cursorRef.current;

      ORBITS.forEach((orbit, i) => {
        anglesRef.current[i] += orbit.speed * (delta / 1000) * speedRef.current;

        const r = r0 + orbit.radiusOffset;
        const angle = anglesRef.current[i];
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        const el = planetRefs.current[i];
        if (el) {
          const planetScale = 1 + p * 0.15;
          el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${planetScale})`;
          const currentDir = flexDirRef.current[i];
          if (currentDir === "row" && x < -30) {
            flexDirRef.current[i] = "row-reverse";
          } else if (currentDir === "row-reverse" && x > 30) {
            flexDirRef.current[i] = "row";
          }
          el.style.flexDirection = flexDirRef.current[i];
        }
      });

      const ss = solarSystemRef.current;
      if (ss) {
        ss.style.transform = `scale(${1 + p * 0.05})`;
      }

      const glow = glowRef.current;
      if (glow) {
        const glowScale = 1.5 + p * 0.5;
        const glowOpacity = 0.1 + p * 0.15;
        glow.style.transform = `scale(${glowScale})`;
        glow.style.opacity = String(glowOpacity);
      }

      ringRefs.current.forEach((ring) => {
        if (ring) {
          ring.style.borderColor = `rgba(237, 237, 237, ${0.04 + p * 0.12})`;
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [introComplete]);

  const closePlanet = useCallback(() => {
    setActivePlanet(null);
    setModalOrigin(null);
  }, []);

  const handlePlanetClick = useCallback((label: string, index: number) => {
    // Capture pill position for source-aware transition
    const pillEl = planetRefs.current[index];
    if (pillEl) {
      const rect = pillEl.getBoundingClientRect();
      setModalOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    setActivePlanet(label);
  }, []);

  // Reduced motion check for breathing animation
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <div ref={solarSystemRef} data-solar-system className="transition-transform duration-200 ease-out">
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
        <div
          ref={glowRef}
          className="absolute inset-0 scale-150 rounded-full bg-accent/10 blur-3xl transition-none"
          style={{ opacity: 0.1 }}
        />

        {/* Orbit rings */}
        {introComplete &&
          ORBITS.map((orbit, i) => {
            const r = avatarRadius + orbit.radiusOffset;
            return (
              <motion.div
                key={`ring-${i}`}
                ref={(el) => { ringRefs.current[i] = el; }}
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

        {/* Avatar with breathing animation */}
        <motion.div
          ref={avatarRef}
          data-intro-avatar
          className="relative h-[154px] w-[154px] overflow-hidden rounded-full border-2 border-foreground/10 sm:h-[179px] sm:w-[179px] lg:h-[230px] lg:w-[230px] xl:h-64 xl:w-64"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.02, 1] }}
          whileHover={{ scale: 1.05 }}
          transition={prefersReducedMotion ? { type: "spring", stiffness: 300, damping: 20 } : {
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Image
            src="/profile.png"
            alt="Max - Profile Avatar"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 154px, (max-width: 1024px) 179px, (max-width: 1280px) 230px, 256px"
          />
        </motion.div>

        {/* Orbiting planets */}
        {introComplete &&
          ORBITS.map((orbit, i) => (
            <button
              key={orbit.label}
              ref={(el) => {
                planetRefs.current[i] = el as HTMLDivElement | null;
              }}
              className="absolute left-1/2 top-1/2 flex items-center cursor-pointer group border-0 bg-transparent p-0"
              aria-label={orbit.label}
              onClick={() => handlePlanetClick(orbit.label, i)}
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
                    boxShadow: `0 0 10px ${orbit.color}99, 0 0 20px ${orbit.color}44`,
                  }}
                />
                <span className="font-display text-[12px] font-medium uppercase tracking-[0.15em] text-muted-foreground/70 group-hover:text-foreground/90 transition-colors duration-300 whitespace-nowrap select-none">
                  {orbit.label}
                </span>
              </div>
            </button>
          ))}
      </motion.div>
      </div>

      {/* Modal portal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {activePlanet === "LET'S CONNECT" && (
              <ConnectModal onClose={closePlanet} originRect={modalOrigin} />
            )}
            {activePlanet === "ABOUT ME" && (
              <AboutModal onClose={closePlanet} originRect={modalOrigin} />
            )}
            {activePlanet === "MY PROJECTS" && (
              <ProjectsModal onClose={closePlanet} originRect={modalOrigin} />
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
