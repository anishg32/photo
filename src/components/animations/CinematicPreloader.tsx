"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function CinematicPreloader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const seen = sessionStorage.getItem("mj_preloader_seen");
    if (reduced || seen) return;

    setVisible(true);
    sessionStorage.setItem("mj_preloader_seen", "1");
    const timer = window.setTimeout(() => setVisible(false), 780);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080808] pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.34em" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="text-center"
          >
            <p className="font-editorial text-2xl sm:text-3xl tracking-[0.34em] text-white uppercase">
              MJ PHOTOGRAPHY
            </p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-4 h-px w-36 origin-center bg-[#C6A46A]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

