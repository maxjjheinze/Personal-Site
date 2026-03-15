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
    const dateStr = now
      ? now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }).toUpperCase()
      : "";
    const timeStr = now
      ? now.toLocaleTimeString("en-US", { hour12: false })
      : "";
    return [
      "BUILDING IN PUBLIC \u00B7 MELBOURNE, AU",
      `${dateStr} \u00B7 ${timeStr}`,
      "@MAXINPROGRESS \u00B7 ON X",
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
          className="font-display text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground"
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
      {/* Title */}
      <motion.h1
        data-intro-title
        className="font-display text-3xl font-bold tracking-tighter sm:text-4xl lg:text-[46px] xl:text-[5.75rem]"
        style={{ marginLeft: "-0.07em", lineHeight: 1.1 }}
        variants={itemVariants}
      >
        <span className="block">MAX IN</span>
        <span data-intro-progress className="block bg-gradient-to-r from-[#4F7BF7] to-[#8B5CF6] bg-clip-text pr-[0.05em] text-transparent">
          PROGRESS
        </span>
      </motion.h1>

      {/* Activity Ticker */}
      <motion.div data-intro-ticker variants={itemVariants}>
        <ActivityTicker />
      </motion.div>
    </motion.div>
  );
}
