import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONSTANTS, TreeState } from '../types';

// Custom Shader Material for the Foliage
const FoliageShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }, // 0 = Scattered, 1 = Tree
    uColorBase: { value: new THREE.Color('#004020') }, // Deep Emerald
    uColorTip: { value: new THREE.Color('#D4AF37') }, // Gold
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying float vAlpha;
    varying vec2 vUv;
    varying float vRandom;

    // Cubic easing for smoother transition
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      vUv = uv;
      vRandom = aRandom;

      // Ease the progress
      float t = easeInOutCubic(uProgress);

      // Mix positions
      vec3 pos = mix(aScatterPos, aTreePos, t);

      // Add "Breathing" / Wind effect based on position
      float wind = sin(uTime * 1.5 + pos.y * 0.5 + pos.x) * 0.1;
      pos.x += wind * (1.0 - t * 0.5); // More movement when scattered
      
      // Add slight noise/jitter
      pos += vec3(sin(uTime * 2.0 + aRandom * 100.0) * 0.05);

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      gl_PointSize = (4.0 * aRandom + 2.0) * (30.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorBase;
    uniform vec3 uColorTip;
    varying float vRandom;
    
    void main() {
      // Circular particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      if(length(coord) > 0.5) discard;

      // Gradient color based on randomness (simulating depth/tips)
      vec3 color = mix(uColorBase, uColorTip, vRandom * 0.3);

      // Add a hot center/glow
      float glow = 1.0 - length(coord) * 2.0;
      glow = pow(glow, 2.0);

      gl_FragColor = vec4(color + vec3(0.1) * glow, 1.0);
    }
  `
};

interface Props {
  treeState: TreeState;
}

export const FoliageParticles: React.FC<Props> = ({ treeState }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Logic to generate the positions
  const { positions, treePositions, scatterPositions, randoms } = useMemo(() => {
    const count = CONSTANTS.FOLIAGE_COUNT;
    const pos = new Float32Array(count * 3);
    const treePos = new Float32Array(count * 3);
    const scatterPos = new Float32Array(count * 3);
    const rands = new Float32Array(count);

    const tempVec = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      // 1. Tree Position (Cone)
      // Height from -H/2 to H/2
      const h = CONSTANTS.TREE_HEIGHT;
      const y = (Math.random() * h) - (h / 2); 
      // Radius decreases as we go up
      const progressUp = (y + h / 2) / h; 
      const radiusAtHeight = CONSTANTS.TREE_RADIUS * (1.0 - progressUp);
      
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radiusAtHeight; // Fill the volume
      
      const tx = r * Math.cos(angle);
      const tz = r * Math.sin(angle);
      
      treePos[i * 3] = tx;
      treePos[i * 3 + 1] = y;
      treePos[i * 3 + 2] = tz;

      // 2. Scatter Position (Random Sphere/Cloud)
      // Large cloud around the center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const scatterR = 20 + Math.random() * 15; // Wide scatter radius

      scatterPos[i * 3] = scatterR * Math.sin(phi) * Math.cos(theta);
      scatterPos[i * 3 + 1] = scatterR * Math.sin(phi) * Math.sin(theta);
      scatterPos[i * 3 + 2] = scatterR * Math.cos(phi);

      // 3. Randoms
      rands[i] = Math.random();
    }

    return { positions: treePos, treePositions: treePos, scatterPositions: scatterPos, randoms: rands };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Interpolate progress
      const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
      materialRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uProgress.value,
        target,
        delta * CONSTANTS.TRANSITION_SPEED
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions} // Initial position doesn't strictly matter as shader overrides, but good for bounding box
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        args={[FoliageShaderMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};