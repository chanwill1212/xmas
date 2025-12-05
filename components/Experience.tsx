import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FoliageParticles } from './FoliageParticles';
import { Ornaments } from './Ornaments';
import { TreeState, CONSTANTS } from '../types';

interface ExperienceProps {
  treeState: TreeState;
}

const TopStar = ({ visible }: { visible: boolean }) => {
    const starRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (!starRef.current) return;
        const t = state.clock.elapsedTime;
        // Spin
        starRef.current.rotation.y = t * 0.5;
        // Pulse scale
        const scalePulse = 1.0 + Math.sin(t * 3) * 0.1;
        starRef.current.scale.setScalar(scalePulse * (visible ? 1 : 0.01));
    });

    return (
        <group ref={starRef} position={[0, CONSTANTS.TREE_HEIGHT/2 + 0.5, 0]}>
             {/* Glowing Core */}
             <mesh>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshBasicMaterial color="#FFD700" />
            </mesh>
            {/* Spikes */}
            <mesh>
                <octahedronGeometry args={[1.2, 0]} />
                <meshStandardMaterial 
                    color="#FFD700" 
                    emissive="#FFD700" 
                    emissiveIntensity={2} 
                    roughness={0.1}
                    metalness={1}
                />
            </mesh>
             {/* Outer Halo Spikes */}
             <mesh rotation={[0, Math.PI/4, 0]} scale={0.6}>
                <octahedronGeometry args={[1.8, 0]} />
                <meshStandardMaterial 
                    color="#D4AF37" 
                    emissive="#D4AF37" 
                    emissiveIntensity={1} 
                    transparent
                    opacity={0.8}
                />
            </mesh>
        </group>
    )
}

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: false, stencil: false, alpha: false }}
      >
        <color attach="background" args={['#020202']} />
        
        {/* Cinematic Camera */}
        <PerspectiveCamera 
            makeDefault 
            position={[0, 4, 25]} 
            fov={45} 
        />
        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.8}
            minDistance={10}
            maxDistance={40}
            autoRotate={treeState === TreeState.TREE_SHAPE}
            autoRotateSpeed={0.5}
            dampingFactor={0.05}
        />

        {/* Lighting Setup */}
        <ambientLight intensity={0.2} color="#001005" />
        <spotLight
          position={[10, 20, 10]}
          angle={0.25}
          penumbra={1}
          intensity={500}
          castShadow
          shadow-bias={-0.0001}
          color="#FFD700"
        />
        <spotLight
          position={[-10, 20, -10]}
          angle={0.25}
          penumbra={1}
          intensity={300}
          color="#ffffff"
        />
        {/* Rim light for the tree shape */}
        <pointLight position={[0, -5, 0]} intensity={50} color="#D4AF37" distance={10} />

        <Suspense fallback={null}>
            {/* Elegant Environment reflection */}
            <Environment preset="lobby" environmentIntensity={0.8} />
            
            <group position={[0, -2, 0]}>
                {/* Core Tree Components */}
                <FoliageParticles treeState={treeState} />
                <Ornaments treeState={treeState} />
                
                {/* The Flashing Star */}
                <TopStar visible={treeState === TreeState.TREE_SHAPE} />

                {/* Gift Sparkles */}
                {treeState === TreeState.TREE_SHAPE && (
                    <Sparkles 
                        count={100}
                        scale={[10, 2, 10]} 
                        position={[0, -CONSTANTS.TREE_HEIGHT/2, 0]} 
                        size={4}
                        speed={0.4}
                        opacity={0.8}
                        color="#FFD700"
                    />
                )}
            </group>
        </Suspense>

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Post Processing for the "High Fidelity" look */}
        <EffectComposer disableNormalPass>
            {/* 
               Bloom: 
               - luminanceThreshold: high to only catch reflections/lights
               - intensity: strong glow
            */}
            <Bloom 
                luminanceThreshold={0.8} 
                mipmapBlur 
                intensity={1.2} 
                radius={0.6}
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

      </Canvas>
    </div>
  );
};