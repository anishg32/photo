"use client";

import { useEffect, useState } from "react";

export interface WebGLCapabilities {
  supported: boolean;
  isMobile: boolean;
  isTablet: boolean;
  reducedMotion: boolean;
  checked: boolean;
}

export function useWebGLSupport(): WebGLCapabilities {
  const [caps, setCaps] = useState<WebGLCapabilities>({
    supported: true,
    isMobile: false,
    isTablet: false,
    reducedMotion: false,
    checked: false,
  });

  useEffect(() => {
    let supported = false;
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
        canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });
      supported = Boolean(gl);
    } catch {
      supported = false;
    }

    const width = window.innerWidth;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    setCaps({
      supported,
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      reducedMotion,
      checked: true,
    });

    const onResize = () => {
      const w = window.innerWidth;
      setCaps((prev) => ({
        ...prev,
        isMobile: w < 640,
        isTablet: w >= 640 && w < 1024,
      }));
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return caps;
}

