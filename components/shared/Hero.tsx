"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Basketball() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 32, 32]}>
        <MeshDistortMaterial
          color="#ff6600"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0}
          emissive="#ff3300"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
}

export default function Hero() {
  return (
    <div className="w-full h-[400px] relative overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]} // Performance optimization: cap pixel ratio
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff6600" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <Basketball />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none" />
    </div>
  );
}
