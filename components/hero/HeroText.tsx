"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

function ActivityTicker() {
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    setNow(new Date());
    const clockId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockId);
  }, []);

  const getMessages = useCallback(() => {
    const timeStr = now
      ? now.toLocaleTimeString("en-US", { hour12: false })
      : "";
    return [
      "BUILDING IN PUBLIC \u00B7 MELBOURNE, AU",
      `CURRENTLY CODING \u00B7 ${timeStr}`,
      "TRADING CRYPTO \u00B7 LIVE",
    ];
  }, [now]);

  useEffect(() => {
    const id = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % 3;
      setIndex(indexRef.current);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const messages = getMessages();

  return (
    <div className="mt-4 h-6 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          className="font-mono text-sm uppercase tracking-[0.25em] text-muted-foreground/60"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function HeroText() {
  const introComplete = useIntroComplete();

  return (
    <motion.div
      className="overflow-visible"
      variants={containerVariants}
      initial="hidden"
      animate={introComplete ? "visible" : "hidden"}
    >
      {/* Label */}
      <motion.p
        className="mb-6 flex items-center gap-3 font-mono text-[12px] font-medium uppercase tracking-[0.4em] text-accent sm:text-[14px]"
        variants={itemVariants}
      >
        <span className="h-4 w-[3px] shrink-0 animate-blink rounded-full bg-foreground" />
        Portfolio / 2026
      </motion.p>

      {/* Title — single h1 with block spans */}
      <motion.h1
        className="font-display text-4xl font-bold leading-[0.9] tracking-tighter sm:text-5xl lg:text-[58px] xl:text-[7.2rem]"
        variants={itemVariants}
      >
        <span className="block">MAX IN</span>
        <span className="inline-block bg-gradient-to-r from-[#4F7BF7] to-[#8B5CF6] bg-clip-text pr-[0.05em] text-transparent">
          PROGRESS
        </span>
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="mt-8 font-mono text-sm text-muted-foreground sm:text-base lg:text-lg"
        variants={itemVariants}
      >
        Vibe Coder Who Loves Crypto and Trading.
      </motion.p>

      {/* Activity Ticker */}
      <motion.div variants={itemVariants}>
        <ActivityTicker />
      </motion.div>
    </motion.div>
  );
}
