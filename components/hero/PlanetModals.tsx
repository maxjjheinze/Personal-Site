"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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
        className={`relative z-10 mx-auto w-full ${maxWidth} h-[84vh] overflow-y-auto scroll-smooth rounded-3xl border border-foreground/[0.06] bg-background/[0.92] shadow-2xl backdrop-blur-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        variants={panel}
        style={{
          ...(originRect
            ? { transformOrigin: `${originRect.x}px ${originRect.y}px` }
            : {}),
        }}
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
      <svg viewBox="0 0 24 24" className="h-[33px] w-[33px]" fill="currentColor">
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
      <svg viewBox="0 0 24 24" className="h-[33px] w-[33px]" fill="none" stroke="currentColor" strokeWidth="1.5">
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
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          DMs open. Inbox open. Always down to chat.
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
            className="group flex items-center gap-5 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] py-6 px-7 transition-all duration-300 hover:border-foreground/[0.14] hover:bg-foreground/[0.05]"
            variants={cardSlide}
          >
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors duration-300 group-hover:text-foreground">
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-[18px] font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                {link.label}
              </p>
              <p className="mt-0.5 text-[13px] text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
                {link.handle}
              </p>
            </div>
            <svg
              viewBox="0 0 24 24"
              className="h-[23px] w-[23px] flex-shrink-0 text-muted-foreground/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-muted-foreground/50"
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

const aboutChips = [
  { label: "Melbourne", color: "#4F7BF7" },
  { label: "Pharma Background", color: "#34D399" },
  { label: "Vibe Coder", color: "#F472B6" },
  { label: "Crypto", color: "#F59E0B" },
  { label: "Algo Trading", color: "#EF4444" },
  { label: "I Want a Porsche", color: "#BF5AF2" },
  { label: "Heavy on Caffeine", color: "#8B5CF6" },
  { label: "In Progress", color: "#00D4FF" },
];

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
      <div className="space-y-5">
        <motion.p className="text-[13px] leading-[2] text-foreground/70" variants={fadeUp}>
          I&apos;m Max, based in Melbourne. During the day, I work in Regulatory
          &amp; Quality in chemical distribution. My 9 to 5 pays the bills and at
          night, I&apos;m building towards something bigger.
        </motion.p>

        <motion.p className="text-[13px] leading-[2] text-foreground/70" variants={fadeUp}>
          It started with small automation workflows and process improvements at
          work through AI and coding. Now I build tools and apps while also being
          heavily involved in crypto and algorithmic trading.
        </motion.p>

        <motion.p className="text-[13px] leading-[2] text-foreground/70" variants={fadeUp}>
          I always need something to do. The kind of person who needs three
          projects running at once and still feels like there&apos;s not enough
          going on.
        </motion.p>

        <motion.p className="text-[13px] leading-[2] text-foreground/70" variants={fadeUp}>
          Similar path? Let&apos;s talk.
        </motion.p>

        {/* info chips */}
        <motion.div className="mt-10 flex flex-wrap gap-2.5" variants={fadeUp}>
          {aboutChips.map((chip) => (
            <span
              key={chip.label}
              className="flex items-center gap-2 rounded-full border border-foreground/[0.08] bg-foreground/[0.02] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: chip.color }}
              />
              {chip.label}
            </span>
          ))}
        </motion.div>
      </div>
    </ModalShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PROJECTS MODAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

interface Project {
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  accent: string;
  href?: string;
  image?: string;
  imageBg?: string;
  comingSoon?: boolean;
  icon: ReactNode;
}

const projects: Project[] = [
  {
    title: "Algo Hub",
    description: "Minimalistic front-end dashboard, tracking dynamic algorithmic trading statistics with unique visualizations.",
    tag: "Live",
    tagColor: "text-green-400 border-green-400/20 bg-green-400/5",
    accent: "#BF5AF2",
    href: "https://algohub-public.vercel.app/",
    image: "/projects/algohub.png",
    imageBg: "#101014",
    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A0A0A] border border-[#F59E42]/15">
        <svg width="18" height="18" viewBox="0 0 512 512" fill="none">
          <polyline points="96,256 176,256 208,128 304,384 336,256 416,256" stroke="#F59E42" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    ),
  },
  {
    title: "Task Manager",
    description: "Jot down ideas quickly, organize your tasks, and actually make sure you\u2019ve done them.",
    tag: "Live",
    tagColor: "text-green-400 border-green-400/20 bg-green-400/5",
    accent: "#4F7BF7",
    href: "https://max-task-manager.vercel.app/",
    image: "/projects/taskmanager.png",
    imageBg: "#101014",
    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="5.5" height="5.5" rx="1.2" stroke="#BF5AF2" strokeWidth="1.5" />
          <rect x="10.5" y="2" width="5.5" height="5.5" rx="1.2" stroke="#BF5AF2" strokeWidth="1.5" />
          <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.2" stroke="#BF5AF2" strokeWidth="1.5" />
          <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.2" stroke="#BF5AF2" strokeWidth="1.5" />
        </svg>
      </div>
    ),
  },
  {
    title: "TimeMaxxing",
    description: "Are you as productive as you think you are? If you want to meet your goals, track your Google Chrome usage and be strict with your time.",
    tag: "In Progress",
    tagColor: "text-amber-400 border-amber-400/20 bg-amber-400/5",
    accent: "#00D4FF",
    href: "https://time-maxxing.vercel.app/",
    image: "/projects/timemaxxing.png",
    imageBg: "#101014",
    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M6 2H12M7 2V4.5C7 5.5 9 7.5 9 9C9 7.5 11 5.5 11 4.5V2M7 16V13.5C7 12.5 9 10.5 9 9C9 10.5 11 12.5 11 13.5V16M6 16H12" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
  },
  {
    title: "More Coming Soon",
    description: "Always working on something new. Follow along on X for updates.",
    tag: "Soon",
    tagColor: "text-muted-foreground border-foreground/10 bg-foreground/[0.03]",
    accent: "#555555",
    href: "https://x.com/MaxInProgress",
    comingSoon: true,
    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/[0.05]">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="4" cy="9" r="1.5" fill="#555" />
          <circle cx="9" cy="9" r="1.5" fill="#555" />
          <circle cx="14" cy="9" r="1.5" fill="#555" />
        </svg>
      </div>
    ),
  },
];

function ComingSoonCover() {
  const bars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl bg-[#101014]">
      {/* subtle grid lines */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
      {/* equalizer bars */}
      <div className="relative flex items-end gap-[5px] h-16">
        {bars.map((i) => (
          <motion.div
            key={i}
            className="w-[4px] rounded-full"
            style={{ background: "linear-gradient(to top, rgba(255,255,255,0.06), rgba(255,255,255,0.15))" }}
            animate={{ height: ["8px", `${20 + Math.sin(i * 0.8) * 12}px`, "8px"] }}
            transition={{
              duration: 1.6 + Math.sin(i) * 0.4,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {/* subtle glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="h-20 w-32 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (0.5 - y) * 25,
      rotateY: (x - 0.5) * 20,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const cardContent = (
    <div
      className={`group flex flex-col md:flex-row rounded-2xl border ${project.comingSoon ? "border-dashed border-foreground/[0.06] opacity-60 hover:opacity-80" : "border-foreground/[0.06] hover:border-foreground/[0.14]"} bg-foreground/[0.02] overflow-hidden transition-all duration-300 hover:bg-foreground/[0.05]`}
    >
      {/* left content */}
      <div className="relative flex flex-1 flex-col justify-center p-7 md:max-w-[55%]">
        <div className="flex items-center gap-3">
          {project.icon}
          <h3 className="font-display text-[15px] font-medium text-foreground/90">
            {project.title}
          </h3>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground/60">
          {project.description}
        </p>
        <span
          className={`mt-4 inline-block self-start rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${project.tagColor}`}
        >
          {project.tag}
        </span>
      </div>

      {/* right image / animation area */}
      <div
        className="relative w-full md:w-[45%] flex-shrink-0 p-3"
        style={{ perspective: "600px" }}
        ref={imageRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="relative h-48 md:h-full min-h-[180px] overflow-hidden rounded-xl"
          style={{
            transformStyle: "preserve-3d",
            backgroundColor: project.imageBg || "#101014",
          }}
          animate={{
            rotateX: tilt.rotateX,
            rotateY: tilt.rotateY,
            scale: isHovered ? 1.06 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 15,
          }}
        >
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.title} screenshot`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          ) : (
            <ComingSoonCover />
          )}
          {/* vignette overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 30px 10px rgba(16,16,20,0.3)" }}
          />
        </motion.div>
        {/* hover glow */}
        <motion.div
          className="pointer-events-none absolute inset-3 rounded-xl"
          animate={{
            boxShadow: isHovered
              ? "0 25px 50px -12px rgba(255,255,255,0.15), 0 12px 24px -8px rgba(0,0,0,0.5)"
              : "0 0 0 0 transparent",
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );

  if (project.href) {
    return (
      <motion.div variants={cardSlide}>
        <a href={project.href} target="_blank" rel="noopener noreferrer">
          {cardContent}
        </a>
      </motion.div>
    );
  }

  return <motion.div variants={cardSlide}>{cardContent}</motion.div>;
}

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
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Everything starts as a side project.
        </p>
      </motion.div>

      {/* project cards */}
      <div className="flex flex-col gap-5">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </ModalShell>
  );
}
