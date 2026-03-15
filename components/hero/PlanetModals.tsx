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
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panel = {
  hidden: { scale: 0.85, opacity: 0, y: 30 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 28, mass: 0.8 },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: 20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ─── shared shell ─── */
function ModalShell({
  onClose,
  originRect,
  children,
  accentColor,
  maxWidth = "max-w-3xl",
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
      transition={{ duration: 0.25 }}
    >
      {/* backdrop */}
      <div
        role="presentation"
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        style={{ overscrollBehavior: "contain" }}
        onClick={onClose}
      />

      {/* panel */}
      <motion.div
        className={`relative z-10 mx-auto w-full ${maxWidth} overflow-hidden rounded-3xl border border-foreground/[0.06] bg-background/[0.92] shadow-2xl backdrop-blur-2xl`}
        variants={panel}
        style={
          originRect
            ? { transformOrigin: `${originRect.x}px ${originRect.y}px` }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* accent glow at top */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[70%] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: accentColor, opacity: 0.07 }}
        />

        {/* content wrapper */}
        <motion.div
          className="relative p-10 sm:p-14 md:p-16"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-8 top-8 flex h-9 w-9 items-center justify-center rounded-full border border-foreground/[0.08] bg-foreground/[0.03] text-muted-foreground transition-all duration-200 hover:border-foreground/20 hover:bg-foreground/[0.08] hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>

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
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    label: "X / Twitter",
    description: "Follow along — I build in public",
    accent: "group-hover:text-foreground",
  },
  {
    href: "mailto:maxjjheinze42@gmail.com",
    external: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "Email",
    description: "Reach out directly — I reply fast",
    accent: "group-hover:text-accent",
  },
  {
    href: "https://github.com/maxjjheinze",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
    label: "GitHub",
    description: "Check out the code behind everything",
    accent: "group-hover:text-foreground",
  },
];

export function ConnectModal({ onClose, originRect }: ModalProps) {
  return (
    <ModalShell onClose={onClose} originRect={originRect} accentColor="#FFFFFF">
      {/* header */}
      <motion.div className="mb-12" variants={fadeUp}>
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground/60">
          Get in Touch
        </p>
        <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Let&apos;s Connect
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
          Whether you want to collaborate, chat about crypto, or just say hey — I&apos;m always down to connect.
        </p>
      </motion.div>

      {/* links grid */}
      <div className="space-y-4">
        {contactLinks.map((link) => (
          <motion.a
            key={link.href}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="group flex items-center gap-6 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] px-7 py-6 transition-all duration-300 hover:border-foreground/[0.14] hover:bg-foreground/[0.05]"
            variants={fadeUp}
          >
            <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] text-muted-foreground transition-colors duration-300 ${link.accent}`}>
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-base font-medium text-foreground/90 transition-colors group-hover:text-foreground">
                {link.label}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground/60 transition-colors group-hover:text-muted-foreground/80">
                {link.description}
              </p>
            </div>
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 flex-shrink-0 text-muted-foreground/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-muted-foreground/60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M7 17L17 7M17 7H7M17 7v10" />
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
      <motion.div className="mb-12" variants={fadeUp}>
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground/60">
          The Story
        </p>
        <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          About Me
        </h2>
      </motion.div>

      {/* bio content */}
      <div className="space-y-7">
        <motion.p
          className="text-base leading-[1.85] text-foreground/75"
          variants={fadeUp}
        >
          I&apos;m Max, 23, from Melbourne. I work a 9 to 5 in chemical distribution
          but I&apos;m trying to build my way out of it. I studied pharmaceutical science,
          graduated in 2024, and somewhere along the way realised I wanted more.
        </motion.p>

        <motion.p
          className="text-base leading-[1.85] text-foreground/75"
          variants={fadeUp}
        >
          Now I vibe code apps, tools, and websites, trade crypto, and mess around with
          algo trading. The goal is{" "}
          <span className="font-medium text-foreground">$10k/month</span>{" "}
          and a laptop I can work from anywhere with. I build everything in public on X.
        </motion.p>

        <motion.p
          className="text-base leading-[1.85] text-foreground/75"
          variants={fadeUp}
        >
          I believe in good karma and having the right people around you. If you&apos;re
          on a similar path, hit me up.
        </motion.p>

        {/* stats / highlights */}
        <motion.div
          className="mt-10 grid grid-cols-3 gap-4"
          variants={fadeUp}
        >
          {[
            { value: "Melbourne", label: "Based in" },
            { value: "2024", label: "Graduated" },
            { value: "Building", label: "Status" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] px-5 py-5 text-center"
            >
              <p className="font-display text-lg font-semibold text-foreground/90">
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
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
      <motion.div className="mb-12" variants={fadeUp}>
        <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground/60">
          What I&apos;m Building
        </p>
        <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          My Projects
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
          Things I&apos;m shipping, experimenting with, and working towards.
        </p>
      </motion.div>

      {/* project cards */}
      <div className="space-y-4">
        {projects.map((project) => (
          <motion.div
            key={project.title}
            className="group rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] px-7 py-6 transition-all duration-300 hover:border-foreground/[0.14] hover:bg-foreground/[0.05]"
            variants={fadeUp}
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
                  <h3 className="font-display text-base font-medium text-foreground/90">
                    {project.title}
                  </h3>
                </div>
                <p className="mt-2 ml-5 text-sm leading-relaxed text-muted-foreground/60">
                  {project.description}
                </p>
              </div>
              <span
                className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${project.tagColor}`}
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
