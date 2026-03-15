"use client";

import { motion, useSpring } from "framer-motion";

interface AnimatedGridProps {
  mouseX?: number;
  mouseY?: number;
}

export function AnimatedGrid({ mouseX = 0, mouseY = 0 }: AnimatedGridProps) {
  const x = useSpring(mouseX * -0.02, { stiffness: 50, damping: 30 });
  const y = useSpring(mouseY * -0.02, { stiffness: 50, damping: 30 });

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Line grid with radial fade toward center */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 65% 50%, transparent 20%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,1) 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 65% 50%, transparent 20%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,1) 80%)",
          x,
          y,
        }}
      />

      {/* Aurora bands — slow-flowing color waves */}
      <motion.div
        className="absolute -left-[20%] top-[10%] h-[200px] w-[140%] rounded-full blur-[100px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(79,123,247,0.06) 30%, rgba(139,92,246,0.04) 60%, transparent 100%)",
        }}
        animate={{
          x: ["-10%", "15%", "-5%", "-10%"],
          y: [0, 30, -20, 0],
          scaleX: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-[10%] top-[40%] h-[150px] w-[130%] rounded-full blur-[80px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.05) 25%, rgba(79,123,247,0.04) 55%, rgba(139,92,246,0.03) 80%, transparent 100%)",
        }}
        animate={{
          x: ["5%", "-15%", "10%", "5%"],
          y: [0, -25, 40, 0],
          scaleX: [1, 0.9, 1.15, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-[15%] bottom-[15%] h-[180px] w-[135%] rounded-full blur-[90px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(79,123,247,0.04) 20%, rgba(56,189,248,0.03) 50%, rgba(139,92,246,0.05) 75%, transparent 100%)",
        }}
        animate={{
          x: ["-5%", "20%", "-10%", "-5%"],
          y: [0, 20, -30, 0],
          scaleX: [1, 1.05, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
