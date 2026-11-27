"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initClientAnalytics, initClientAppCheck } from "@/lib/firebase";

gsap.registerPlugin(ScrollTrigger);

function SmoothScrollAndTriggers() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isAdminRoute) return;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    if (reducedMotionQuery.matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      autoResize: true,
    });

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onLenisScroll);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.body);

    const onLoad = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      resizeObserver.disconnect();
      gsap.ticker.remove(onTick);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
    };
  }, [isAdminRoute]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    initClientAppCheck();
    void initClientAnalytics();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Suspense fallback={null}>
        <SmoothScrollAndTriggers />
      </Suspense>
      {children}
    </MotionConfig>
  );
}
