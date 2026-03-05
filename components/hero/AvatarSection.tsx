"use client";

import { motion, useSpring } from "framer-motion";
import Image from "next/image";
import { useIntroComplete } from "@/components/intro/PixelIntro";

interface AvatarSectionProps {
  mouseX?: number;
  mouseY?: number;
}

const dots = [
  { top: "10%", right: "-5%", size: 6, delay: 0, duration: 5 },
  { top: "50%", right: "-10%", size: 4, delay: 1.5, duration: 7 },
  { bottom: "15%", right: "5%", size: 5, delay: 0.8, duration: 6 },
  { top: "5%", left: "10%", size: 3, delay: 2, duration: 8 },
];

export function AvatarSection({ mouseX = 0, mouseY = 0 }: AvatarSectionProps) {
  const introComplete = useIntroComplete();
  const avatarX = useSpring(mouseX * 0.02, { stiffness: 100, damping: 30 });
  const avatarY = useSpring(mouseY * 0.02, { stiffness: 100, damping: 30 });

  return (
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

      {/* Outer ring 2 */}
      <motion.div
        className="absolute -inset-10 rounded-full border border-foreground/[0.04]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />

      {/* Outer ring 1 */}
      <motion.div
        className="absolute -inset-5 rounded-full border border-foreground/[0.08]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />

      {/* Avatar container with hover */}
      <motion.div
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

      {/* Floating dots */}
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-accent"
          style={{
            width: dot.size,
            height: dot.size,
            top: dot.top,
            right: dot.right,
            bottom: dot.bottom,
            left: dot.left,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            y: [0, -15, 0],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay + 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}
