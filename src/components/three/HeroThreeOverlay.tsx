"use client";

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

interface FloatingPlateProps {
  url?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number];
  phase: number;
  reducedMotion: boolean;
}

function TexturedFloatingPlate({
  url,
  position,
  rotation,
  scale,
  phase,
  reducedMotion,
}: FloatingPlateProps & { url: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture(url);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y =
      position[1] + Math.sin(t * 0.55 + phase) * 0.14;
    groupRef.current.rotation.y =
      rotation[1] + Math.sin(t * 0.35 + phase) * 0.06;
    groupRef.current.rotation.x =
      rotation[0] + Math.cos(t * 0.3 + phase) * 0.03;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[scale[0] + 0.08, scale[1] + 0.08, 0.03]} />
        <meshStandardMaterial
          color="#C6A46A"
          metalness={0.75}
          roughness={0.35}
          transparent
          opacity={0.75}
        />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[scale[0] + 0.04, scale[1] + 0.04, 0.02]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={scale} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function EmptyGlassFrame({
  position,
  rotation,
  scale,
  phase,
  reducedMotion,
}: FloatingPlateProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y =
      position[1] + Math.sin(t * 0.5 + phase) * 0.14;
    groupRef.current.rotation.y =
      rotation[1] + Math.sin(t * 0.3 + phase) * 0.06;
    groupRef.current.rotation.x =
      rotation[0] + Math.cos(t * 0.25 + phase) * 0.03;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[scale[0] + 0.08, scale[1] + 0.08, 0.03]} />
        <meshStandardMaterial
          color="#C6A46A"
          metalness={0.8}
          roughness={0.3}
          transparent
          opacity={0.65}
        />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={scale} />
        <meshStandardMaterial
          color="#121212"
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0.78}
        />
      </mesh>
    </group>
  );
}

function GoldDustParticles({
  count,
  reducedMotion,
}: {
  count: number;
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const seed = (i + 1) * 12.9898;
      const rx = ((Math.sin(seed) * 43758.5453) % 1 + 1) % 1;
      const ry = ((Math.sin(seed * 1.7) * 23421.631) % 1 + 1) % 1;
      const rz = ((Math.sin(seed * 2.3) * 19283.112) % 1 + 1) % 1;
      arr[i * 3] = (rx - 0.5) * 14;
      arr[i * 3 + 1] = (ry - 0.5) * 7.5;
      arr[i * 3 + 2] = (rz - 0.5) * 5 - 1;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.025;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#C6A46A"
        size={0.034}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
      />
    </points>
  );
}

function CameraParallaxRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera, pointer } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (reducedMotion) return;
    target.set(pointer.x * 0.42, pointer.y * 0.24, 6.2);
    camera.position.lerp(target, 0.04);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function HeroThreeOverlay({ images }: { images: string[] }) {
  const { supported, isMobile, reducedMotion } = useWebGLSupport();
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (entry) setActive(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!supported) {
    return null;
  }

  const slotConfigs = isMobile
    ? [
        {
          position: [1.35, 1.45, -0.4] as [number, number, number],
          rotation: [0.05, -0.25, 0.04] as [number, number, number],
          scale: [1.15, 1.48] as [number, number],
          phase: 0.2,
        },
      ]
    : [
        {
          position: [2.55, 1.05, -0.3] as [number, number, number],
          rotation: [0.06, -0.32, 0.03] as [number, number, number],
          scale: [1.55, 2.05] as [number, number],
          phase: 0.4,
        },
        {
          position: [4.2, -0.85, -1.2] as [number, number, number],
          rotation: [-0.04, -0.42, -0.05] as [number, number, number],
          scale: [1.35, 1.75] as [number, number],
          phase: 1.9,
        },
        {
          position: [1.4, -1.45, -1.6] as [number, number, number],
          rotation: [0.08, -0.18, 0.04] as [number, number, number],
          scale: [1.6, 1.15] as [number, number],
          phase: 3.1,
        },
      ];

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
    >
      <Canvas
        frameloop={active ? "always" : "demand"}
        dpr={isMobile ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 5]} intensity={1.4} color="#f5e2ba" />
        <pointLight position={[-4, -2, 3]} intensity={0.6} color="#C6A46A" />

        <Suspense fallback={null}>
          {slotConfigs.map((slot, idx) => {
            const url = images[idx];
            return url ? (
              <TexturedFloatingPlate
                key={`${url}-${idx}`}
                url={url}
                {...slot}
                reducedMotion={reducedMotion}
              />
            ) : (
              <EmptyGlassFrame
                key={`glass-frame-${idx}`}
                {...slot}
                reducedMotion={reducedMotion}
              />
            );
          })}
        </Suspense>

        <GoldDustParticles
          count={isMobile ? 40 : 110}
          reducedMotion={reducedMotion}
        />
        <CameraParallaxRig reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
