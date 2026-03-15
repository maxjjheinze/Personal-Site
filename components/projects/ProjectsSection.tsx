"use client";

import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export function ProjectsSection() {
  return (
    <section id="projects" className="relative px-6 py-32 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Section header */}
          <motion.div className="mb-16" variants={cardVariants}>
            <p className="mb-4 font-mono text-[12px] font-medium uppercase tracking-[0.4em] text-accent sm:text-[14px]">
              Projects
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tighter sm:text-4xl lg:text-5xl">
              What I&apos;m Building
            </h2>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Featured card — spans 2 cols */}
            <motion.div
              className="group relative col-span-1 row-span-1 overflow-hidden rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 transition-all duration-300 hover:border-foreground/[0.12] md:col-span-2"
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex min-h-[200px] flex-col justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
                      In Progress
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold">
                    Coming Soon
                  </h3>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Projects are on the way. Building in public means you&apos;ll see them here first.
                  </p>
                </div>
                <div className="mt-6 font-mono text-xs uppercase tracking-wider text-muted-foreground/40">
                  Stay tuned
                </div>
              </div>
            </motion.div>

            {/* Small card 1 */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 transition-all duration-300 hover:border-foreground/[0.12]"
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex min-h-[200px] flex-col justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-purple/20 bg-accent-purple/5 px-3 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent-purple" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-accent-purple">
                      Planned
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold">
                    Algo Trading
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Automated crypto trading strategies.
                  </p>
                </div>
                <div className="mt-6 font-mono text-xs uppercase tracking-wider text-muted-foreground/40">
                  Soon
                </div>
              </div>
            </motion.div>

            {/* Small card 2 */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 transition-all duration-300 hover:border-foreground/[0.12]"
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex min-h-[200px] flex-col justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Idea
                    </span>
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold">
                    More to Come
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Always building something new.
                  </p>
                </div>
                <div className="mt-6 font-mono text-xs uppercase tracking-wider text-muted-foreground/40">
                  TBD
                </div>
              </div>
            </motion.div>

            {/* Small card 3 */}
            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 transition-all duration-300 hover:border-foreground/[0.12] md:col-span-2"
              variants={cardVariants}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex min-h-[120px] items-center justify-center">
                <p className="font-mono text-sm text-muted-foreground/50">
                  Follow{" "}
                  <a
                    href="https://x.com/MaxInProgress"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent transition-colors hover:text-accent/80"
                  >
                    @MaxInProgress
                  </a>{" "}
                  for updates
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
