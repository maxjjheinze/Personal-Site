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

      {/* Gradient blobs */}
      <motion.div
        className="absolute -left-[10%] top-[15%] h-[500px] w-[500px] rounded-full bg-accent/[0.04] blur-[120px]"
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[5%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-accent-purple/[0.03] blur-[100px]"
        animate={{ x: [0, -50, 40, 0], y: [0, 60, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[40%] top-[60%] h-[350px] w-[350px] rounded-full bg-accent/[0.025] blur-[90px]"
        animate={{ x: [0, 40, -60, 0], y: [0, -50, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
