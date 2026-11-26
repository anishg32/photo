"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  MeshReflectorMaterial,
  OrbitControls,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Expand,
  Eye,
  RotateCcw,
  Upload,
} from "lucide-react";
import type { GalleryImage } from "@/types";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { LightboxDialog } from "@/components/gallery/LightboxDialog";

interface FrameNodeProps {
  item: GalleryImage;
  index: number;
  position: [number, number, number];
  rotationY: number;
  isSelected: boolean;
  isHovered: boolean;
  reducedMotion: boolean;
  onHover: (idx: number | null) => void;
  onSelect: (idx: number) => void;
}

function ExhibitionFrame({
  item,
  index,
  position,
  rotationY,
  isSelected,
  isHovered,
  reducedMotion,
  onHover,
  onSelect,
}: FrameNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture(item.thumbnailUrl || item.imageUrl);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  const aspect =
    item.width && item.height ? item.width / item.height : 4 / 3;
  const frameHeight = 2.15;
  const frameWidth = Math.min(3.1, Math.max(1.5, frameHeight * aspect));

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const bob = reducedMotion ? 0 : Math.sin(t * 0.7 + index * 1.1) * 0.045;
    groupRef.current.position.y = position[1] + bob;

    const targetScale = isSelected || isHovered ? 1.045 : 1;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(index);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(index);
      }}
    >
      <mesh position={[0, -frameHeight / 2 - 0.14, 0]}>
        <boxGeometry args={[frameWidth + 0.16, 0.04, 0.24]} />
        <meshStandardMaterial
          color={isSelected || isHovered ? "#C6A46A" : "#222222"}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0, -0.04]} castShadow>
        <boxGeometry args={[frameWidth + 0.18, frameHeight + 0.18, 0.07]} />
        <meshStandardMaterial
          color={isSelected || isHovered ? "#C6A46A" : "#1c1a17"}
          metalness={0.75}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[frameWidth + 0.08, frameHeight + 0.08, 0.03]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

function PlaceholderMuseumFrame({
  index,
  position,
  rotationY,
  isSelected,
  reducedMotion,
  onSelect,
}: {
  index: number;
  position: [number, number, number];
  rotationY: number;
  isSelected: boolean;
  reducedMotion: boolean;
  onSelect: (idx: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const frameHeight = 2.05;
  const frameWidth = 1.65;

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y =
      position[1] + Math.sin(t * 0.65 + index * 1.1) * 0.04;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(index);
      }}
    >
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[frameWidth + 0.16, frameHeight + 0.16, 0.07]} />
        <meshStandardMaterial
          color={isSelected ? "#C6A46A" : "#2b251c"}
          metalness={0.75}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshStandardMaterial color="#0c0c0c" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
}

function GuidedCameraController({
  targetPosition,
  targetLookAt,
  guidedMode,
  reducedMotion,
}: {
  targetPosition: [number, number, number];
  targetLookAt: [number, number, number];
  guidedMode: boolean;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const desiredPos = useMemo(() => new THREE.Vector3(), []);
  const desiredLook = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!guidedMode) return;
    desiredPos.set(...targetPosition);
    desiredLook.set(...targetLookAt);
    const alpha = reducedMotion ? 1 : 0.055;
    camera.position.lerp(desiredPos, alpha);
    camera.lookAt(desiredLook);
  });

  return null;
}

function MuseumFloor({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#070707" metalness={0.4} roughness={0.65} />
      </mesh>
    );
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
      <planeGeometry args={[36, 36]} />
      <MeshReflectorMaterial
        blur={[260, 80]}
        resolution={512}
        mixBlur={0.9}
        mixStrength={22}
        roughness={0.85}
        depthScale={1.05}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#080808"
        metalness={0.55}
        mirror={0.35}
      />
    </mesh>
  );
}

export function MuseumExhibition3D({
  images,
  fullViewport = false,
}: {
  images: GalleryImage[];
  fullViewport?: boolean;
}) {
  const { supported, isMobile, isTablet, reducedMotion } = useWebGLSupport();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [guidedMode, setGuidedMode] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const exhibitionFrames = useMemo(
    () => images.slice(0, isMobile ? 5 : 7),
    [images, isMobile]
  );

  const slotCount =
    exhibitionFrames.length > 0 ? exhibitionFrames.length : isMobile ? 3 : 5;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleVisibilityChange = (event: Event) => {
      const skipped = (event as Event & { skipped?: boolean }).skipped;
      setIsVisible(!skipped);
    };
    el.addEventListener("contentvisibilityautostatechange", handleVisibilityChange);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (entry) setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "150px" }
    );
    observer.observe(el);

    return () => {
      el.removeEventListener(
        "contentvisibilityautostatechange",
        handleVisibilityChange
      );
      observer.disconnect();
    };
  }, []);

  const frameLayout = useMemo(() => {
    const radius = isMobile ? 5.2 : 6.4;
    const spread = Math.PI * 0.78;
    return Array.from({ length: slotCount }, (_, i) => {
      const t = slotCount === 1 ? 0.5 : i / (slotCount - 1);
      const angle = (t - 0.5) * spread;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius + 2.4;
      const y = (i % 2 === 0 ? 0.15 : -0.1) + 0.15;
      return {
        position: [x, y, z] as [number, number, number],
        rotationY: -angle,
      };
    });
  }, [slotCount, isMobile]);

  const currentFrameLayout = useMemo(
    () =>
      frameLayout[activeSlide] ?? {
        position: [0, 0.2, -3] as [number, number, number],
        rotationY: 0,
      },
    [frameLayout, activeSlide]
  );

  const cameraTargetPos = useMemo<[number, number, number]>(() => {
    const [fx, fy, fz] = currentFrameLayout.position;
    const ry = currentFrameLayout.rotationY;
    const dist = isMobile ? 4.3 : 3.9;
    return [fx + Math.sin(ry) * dist, fy + 0.15, fz + Math.cos(ry) * dist];
  }, [currentFrameLayout, isMobile]);

  const currentArt =
    exhibitionFrames[hoveredIdx ?? activeSlide] ?? exhibitionFrames[0];

  const handleStep = useCallback(
    (dir: -1 | 1) => {
      setGuidedMode(true);
      setActiveSlide((prev) => (prev + dir + slotCount) % slotCount);
    },
    [slotCount]
  );

  const handleSelectFrame = useCallback((idx: number) => {
    setActiveSlide(idx);
    setLightboxIndex(idx);
  }, []);

  if (!supported) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-[#C6A46A]/25 bg-[#111111] p-6 sm:p-8">
          <p className="text-xs tracking-[0.2em] uppercase text-[#C6A46A] mb-4">
            Architectural Exhibition Mode (WebGL Unavailable)
          </p>
          {exhibitionFrames.length === 0 ? (
            <div className="py-10 text-center space-y-4">
              <p className="font-editorial text-2xl text-white">
                Exhibition Frames Ready for Upload
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-6 py-3 text-xs uppercase tracking-[0.16em]"
              >
                <Upload aria-hidden="true" className="h-4 w-4" />
                <span>Upload Featured Photographs</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exhibitionFrames.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="group text-left rounded-lg overflow-hidden border border-white/10 bg-[#080808] hover:border-[#C6A46A]/60 transition-colors"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.thumbnailUrl || item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-editorial text-xl text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#A0A0A0] mt-1">
                      {item.location}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <LightboxDialog
          images={exhibitionFrames}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#050505] ${
          fullViewport
            ? "h-[76dvh] min-h-[540px]"
            : "h-[66dvh] min-h-[480px] max-h-[720px]"
        }`}
      >
        <Canvas
          frameloop={isVisible ? "always" : "demand"}
          dpr={isMobile || isTablet ? [1, 1.35] : [1, 1.75]}
          camera={{ position: [0, 0.35, 3.8], fov: isMobile ? 54 : 45 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#050505"]} />
          <fog attach="fog" args={["#050505", 7, 19]} />

          <ambientLight intensity={0.45} />
          <spotLight
            position={[0, 6.5, 3]}
            angle={0.75}
            penumbra={0.8}
            intensity={2.2}
            color="#fff1d6"
          />
          <pointLight position={[-5, 2, 1]} intensity={0.9} color="#C6A46A" />
          <pointLight position={[5, 2, 1]} intensity={0.7} color="#d6c29f" />

          <Suspense fallback={null}>
            {exhibitionFrames.length > 0
              ? exhibitionFrames.map((item, idx) => (
                  <ExhibitionFrame
                    key={item.id}
                    item={item}
                    index={idx}
                    position={frameLayout[idx].position}
                    rotationY={frameLayout[idx].rotationY}
                    isSelected={idx === activeSlide}
                    isHovered={idx === hoveredIdx}
                    reducedMotion={reducedMotion}
                    onHover={setHoveredIdx}
                    onSelect={handleSelectFrame}
                  />
                ))
              : frameLayout.map((layout, idx) => (
                  <PlaceholderMuseumFrame
                    key={`empty-frame-${idx}`}
                    index={idx}
                    position={layout.position}
                    rotationY={layout.rotationY}
                    isSelected={idx === activeSlide}
                    reducedMotion={reducedMotion}
                    onSelect={setActiveSlide}
                  />
                ))}
          </Suspense>

          <MuseumFloor isMobile={isMobile} />

          <GuidedCameraController
            targetPosition={cameraTargetPos}
            targetLookAt={currentFrameLayout.position}
            guidedMode={guidedMode}
            reducedMotion={reducedMotion}
          />

          {!guidedMode && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={2.5}
              maxDistance={9}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
              target={currentFrameLayout.position}
            />
          )}
        </Canvas>

        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="liquid-glass pointer-events-auto rounded-full px-4 py-2 text-[11px] font-mono tracking-[0.18em] uppercase text-[#C6A46A] flex items-center gap-2">
            <Eye aria-hidden="true" className="h-3.5 w-3.5" />
            <span>
              3D Exhibition · Frame {String(activeSlide + 1).padStart(2, "0")} /{" "}
              {String(slotCount).padStart(2, "0")}
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGuidedMode((g) => !g)}
              className="liquid-glass rounded-full px-4 py-2 text-xs tracking-[0.14em] uppercase text-white hover:text-[#C6A46A] transition-colors inline-flex items-center gap-2 min-h-[40px]"
            >
              {guidedMode ? (
                <>
                  <Compass aria-hidden="true" className="h-3.5 w-3.5 text-[#C6A46A]" />
                  <span>Free Orbit</span>
                </>
              ) : (
                <>
                  <RotateCcw aria-hidden="true" className="h-3.5 w-3.5 text-[#C6A46A]" />
                  <span>Guided Tour</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 inset-x-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-4 pointer-events-none">
          {currentArt ? (
            <div className="liquid-glass pointer-events-auto rounded-xl px-5 py-4 max-w-md">
              <p className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#C6A46A]">
                {currentArt.categoryName || "Exhibition Plate"} ·{" "}
                {currentArt.location}
              </p>
              <h3 className="font-editorial text-2xl text-white mt-1">
                {currentArt.title}
              </h3>
              <button
                type="button"
                onClick={() => setLightboxIndex(hoveredIdx ?? activeSlide)}
                className="mt-3 inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-[#C6A46A] hover:text-white transition-colors min-h-[36px]"
              >
                <Expand aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Inspect Full Resolution</span>
              </button>
            </div>
          ) : (
            <div className="liquid-glass pointer-events-auto rounded-xl px-5 py-4 max-w-md">
              <p className="text-[10px] font-mono tracking-[0.22em] uppercase text-[#C6A46A]">
                3D Gallery Ready · Empty Frame{" "}
                {String(activeSlide + 1).padStart(2, "0")}
              </p>
              <h3 className="font-editorial text-2xl text-white mt-1">
                Awaiting Your Photographs
              </h3>
              <Link
                href="/admin"
                className="mt-3 inline-flex items-center gap-2 text-xs tracking-[0.16em] uppercase text-[#C6A46A] hover:text-white transition-colors min-h-[36px]"
              >
                <Upload aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Upload Featured Plates in Admin</span>
              </Link>
            </div>
          )}

          <div className="pointer-events-auto flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              aria-label="Previous exhibition frame"
              className="liquid-glass inline-flex items-center justify-center rounded-full min-h-[48px] min-w-[48px] text-white hover:text-[#C6A46A] transition-colors"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleStep(1)}
              aria-label="Next exhibition frame"
              className="liquid-glass inline-flex items-center justify-center rounded-full min-h-[48px] min-w-[48px] text-white hover:text-[#C6A46A] transition-colors"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {exhibitionFrames.length > 0 && (
        <ul
          aria-label="Exhibition Artwork Index"
          className="mt-4 flex flex-wrap gap-2 list-none p-0 m-0"
        >
          {exhibitionFrames.map((item, idx) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setGuidedMode(true);
                  setActiveSlide(idx);
                }}
                aria-current={idx === activeSlide ? "true" : undefined}
                className={`px-3.5 py-2 rounded-full text-xs tracking-[0.12em] uppercase transition-colors border min-h-[40px] ${
                  idx === activeSlide
                    ? "border-[#C6A46A] bg-[#C6A46A]/15 text-[#C6A46A]"
                    : "border-white/10 bg-[#111111] text-[#A0A0A0] hover:text-white"
                }`}
              >
                {String(idx + 1).padStart(2, "0")}. {item.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      <LightboxDialog
        images={exhibitionFrames}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </>
  );
}
