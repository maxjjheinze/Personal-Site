"use client";

import { useEffect, ReactNode } from "react";
import { motion } from "framer-motion";

/* ─── shared types ─── */
interface ModalProps {
  onClose: () => void;
  originRect?: { x: number; y: number } | null;
}

/* ─── animation variants ─── */
const backdrop = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(20px)" },
  exit: { opacity: 0, backdropFilter: "blur(0px)" },
};

const panel = {
  hidden: { scale: 0.3, opacity: 0, y: 120, filter: "blur(20px)", rotateX: 8 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
      mass: 1,
      filter: { duration: 0.6, ease: "easeOut" },
      rotateX: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  exit: {
    scale: 0.7,
    opacity: 0,
    y: 60,
    filter: "blur(12px)",
    transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
  },
};

const accentGlow = {
  hidden: { opacity: 0, scale: 0.2 },
  visible: {
    opacity: [0, 0.15, 0.08],
    scale: [0.2, 1.2, 1],
    transition: { duration: 2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 44, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardSlide = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── shared shell ─── */
function ModalShell({
  onClose,
  originRect,
  children,
  accentColor,
  maxWidth = "max-w-[1152px]",
}: ModalProps & { children: ReactNode; accentColor: string; maxWidth?: string }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
      variants={backdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.6 }}
    >
      {/* backdrop */}
      <motion.div
        role="presentation"
        className="absolute inset-0 bg-black/75"
        style={{ overscrollBehavior: "contain" }}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* panel */}
      <motion.div
        className={`relative z-10 mx-auto w-full ${maxWidth} min-h-[84vh] overflow-hidden rounded-3xl border border-foreground/[0.06] bg-background/[0.92] shadow-2xl backdrop-blur-2xl`}
        variants={panel}
        style={
          originRect
            ? { transformOrigin: `${originRect.x}px ${originRect.y}px` }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* accent glow at top */}
        <motion.div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[70%] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: accentColor }}
          variants={accentGlow}
          initial="hidden"
          animate="visible"
        />

        {/* content wrapper */}
        <motion.div
          className="relative p-12 sm:p-16 md:p-20"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* close button */}
          <motion.button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-8 top-8 flex h-9 w-9 items-center justify-center rounded-full border border-foreground/[0.08] bg-foreground/[0.03] text-muted-foreground transition-all duration-200 hover:border-foreground/20 hover:bg-foreground/[0.08] hover:text-foreground hover:rotate-90"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.6, duration: 0.6, type: "spring", stiffness: 200, damping: 15 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </motion.button>

          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONNECT MODAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const contactLinks = [
  {
    href: "https://x.com/MaxInProgress",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    label: "X",
    handle: "@MaxInProgress",
  },
  {
    href: "mailto:maxjjheinze42@gmail.com",
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "Email",
    handle: "maxjjheinze42@gmail.com",
  },
];

export function ConnectModal({ onClose, originRect }: ModalProps) {
  return (
    <ModalShell onClose={onClose} originRect={originRect} accentColor="#FFFFFF">
      {/* header */}
      <motion.div className="mb-14" variants={fadeUp}>
        <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground/50">
          Get in Touch
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Let&apos;s Connect
        </h2>
        <p className="mt-4 max-w-lg text-xs leading-relaxed text-muted-foreground">
          Good things start with a simple hello.
        </p>
      </motion.div>

      {/* links */}
      <div className="space-y-4">
        {contactLinks.map((link) => (
          <motion.a
            key={link.href}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="group flex items-center gap-5 rounded-xl py-4 px-5 transition-all duration-300 hover:bg-foreground/[0.04]"
            variants={cardSlide}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors duration-300 group-hover:text-foreground">
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xs font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                {link.label}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
                {link.handle}
              </p>
            </div>
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 flex-shrink-0 text-muted-foreground/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-muted-foreground/50"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </motion.a>
        ))}
      </div>
    </ModalShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ABOUT MODAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function AboutModal({ onClose, originRect }: ModalProps) {
  return (
    <ModalShell onClose={onClose} originRect={originRect} accentColor="#BF5AF2">
      {/* header */}
      <motion.div className="mb-14" variants={fadeUp}>
        <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground/50">
          The Story
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          About Me
        </h2>
      </motion.div>

      {/* bio content */}
      <div className="space-y-8">
        <motion.p
          className="text-xs leading-[2] text-foreground/70"
          variants={fadeUp}
        >
          I&apos;m Max, 23, from Melbourne. I work a 9 to 5 in chemical distribution
          but I&apos;m trying to build my way out of it. I studied pharmaceutical science,
          graduated in 2024, and somewhere along the way realised I wanted more.
        </motion.p>

        <motion.p
          className="text-xs leading-[2] text-foreground/70"
          variants={fadeUp}
        >
          Now I vibe code apps, tools, and websites, trade crypto, and mess around with
          algo trading. The goal is{" "}
          <span className="font-medium text-foreground">$10k/month</span>{" "}
          and a laptop I can work from anywhere with. I build everything in public on X.
        </motion.p>

        <motion.p
          className="text-xs leading-[2] text-foreground/70"
          variants={fadeUp}
        >
          I believe in good karma and having the right people around you. If you&apos;re
          on a similar path, hit me up.
        </motion.p>

        {/* stats / highlights */}
        <div className="mt-12 grid grid-cols-3 gap-5">
          {[
            { value: "Melbourne", label: "Based in" },
            { value: "2024", label: "Graduated" },
            { value: "Building", label: "Status" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] px-5 py-6 text-center"
              variants={cardSlide}
            >
              <p className="font-display text-sm font-semibold text-foreground/90">
                {stat.value}
              </p>
              <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/45">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PROJECTS MODAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const projects = [
  {
    title: "Max in Progress",
    description: "This personal site — my corner of the internet, built with Next.js and Framer Motion.",
    tag: "Live",
    tagColor: "text-green-400 border-green-400/20 bg-green-400/5",
    accent: "#4F7BF7",
  },
  {
    title: "Algo Trading Tools",
    description: "Building automated trading strategies and analytics for crypto markets.",
    tag: "In Progress",
    tagColor: "text-amber-400 border-amber-400/20 bg-amber-400/5",
    accent: "#BF5AF2",
  },
  {
    title: "More Coming Soon",
    description: "Always working on something new. Follow along on X for updates.",
    tag: "Soon",
    tagColor: "text-muted-foreground border-foreground/10 bg-foreground/[0.03]",
    accent: "#00D4FF",
  },
];

export function ProjectsModal({ onClose, originRect }: ModalProps) {
  return (
    <ModalShell onClose={onClose} originRect={originRect} accentColor="#00D4FF">
      {/* header */}
      <motion.div className="mb-14" variants={fadeUp}>
        <p className="mb-3 font-mono text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground/50">
          What I&apos;m Building
        </p>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          My Projects
        </h2>
        <p className="mt-4 max-w-lg text-xs leading-relaxed text-muted-foreground">
          Things I&apos;m shipping, experimenting with, and working towards.
        </p>
      </motion.div>

      {/* project cards */}
      <div className="space-y-5">
        {projects.map((project) => (
          <motion.div
            key={project.title}
            className="group rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] px-7 py-7 transition-all duration-300 hover:border-foreground/[0.14] hover:bg-foreground/[0.05]"
            variants={cardSlide}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor: project.accent,
                      boxShadow: `0 0 8px ${project.accent}66`,
                    }}
                  />
                  <h3 className="font-display text-xs font-medium text-foreground/90">
                    {project.title}
                  </h3>
                </div>
                <p className="mt-2 ml-5 text-[11px] leading-relaxed text-muted-foreground/60">
                  {project.description}
                </p>
              </div>
              <span
                className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${project.tagColor}`}
              >
                {project.tag}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </ModalShell>
  );
}
