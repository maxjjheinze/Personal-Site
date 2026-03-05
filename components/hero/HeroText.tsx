"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIntroComplete } from "@/components/intro/PixelIntro";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function LiveDateTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });

  return (
    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
      {dateStr} &nbsp;&middot;&nbsp; {timeStr}
    </p>
  );
}

export function HeroText() {
  const introComplete = useIntroComplete();

  return (
    <motion.div
      className="flex-1"
      variants={containerVariants}
      initial="hidden"
      animate={introComplete ? "visible" : "hidden"}
    >
      {/* Label */}
      <motion.p

        className="mb-6 text-[10px] font-medium uppercase tracking-[0.35em] text-accent sm:text-xs"
        variants={itemVariants}
      >
        Portfolio / 2026
      </motion.p>

      {/* Title */}
      <motion.h1

        className="font-display text-5xl font-bold leading-[0.9] tracking-tighter sm:text-6xl lg:text-7xl xl:text-[9rem]"
        variants={itemVariants}
      >
        MAX IN
      </motion.h1>

      <motion.h1

        className="font-display text-5xl font-bold leading-[0.9] tracking-tighter sm:text-6xl lg:text-7xl xl:text-[9rem]"
        variants={itemVariants}
      >
        <span className="bg-gradient-to-r from-[#4F7BF7] to-[#8B5CF6] bg-clip-text text-transparent">
          PROGRESS
        </span>
      </motion.h1>

      {/* Tagline */}
      <motion.p

        className="mt-8 text-base text-muted-foreground sm:text-lg lg:text-xl"
        variants={itemVariants}
      >
        Vibe Coder Who Loves Crypto and Trading.
      </motion.p>

      {/* Date & Time */}
      <motion.div variants={itemVariants}>
        <LiveDateTime />
      </motion.div>
    </motion.div>
  );
}
