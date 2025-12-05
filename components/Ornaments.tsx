import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONSTANTS, TreeState, DualPosition } from '../types';

interface OrnamentProps {
  treeState: TreeState;
}

// Tiffany Blue Hex
const TIFFANY_BLUE = '#81D8D0';

export const Ornaments: React.FC<OrnamentProps> = ({ treeState }) => {
  const baubleRef = useRef<THREE.InstancedMesh>(null);
  const giftRef = useRef<THREE.InstancedMesh>(null);

  // Generate data for Baubles (Spheres)
  const baublesData = useMemo(() => {
    const data: DualPosition[] = [];
    const count = CONSTANTS.ORNAMENT_COUNT;
    const h = CONSTANTS.TREE_HEIGHT;

    for (let i = 0; i < count; i++) {
      // Tree position: On the surface of the cone usually
      const y = (Math.random() * h) - (h / 2);
      const progressUp = (y + h / 2) / h;
      const radiusAtHeight = CONSTANTS.TREE_RADIUS * (1.0 - progressUp);
      
      // Push slightly outward to sit on leaves
      const r = radiusAtHeight * 0.9 + Math.random() * 0.5;
      const angle = Math.random() * Math.PI * 2;
      
      const treePos: [number, number, number] = [
        r * Math.cos(angle),
        y,
        r * Math.sin(angle)
      ];

      // Scatter position
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const scatterR = 15 + Math.random() * 20;
      const scatterPos: [number, number, number] = [
        scatterR * Math.sin(phi) * Math.cos(theta),
        scatterR * Math.sin(phi) * Math.sin(theta),
        scatterR * Math.cos(phi)
      ];

      // Color Palette including Tiffany Blue
      const rand = Math.random();
      let color = '#D4AF37'; // Gold
      if (rand > 0.75) color = TIFFANY_BLUE; // Tiffany
      else if (rand > 0.5) color = '#C0C0C0'; // Silver
      else if (rand > 0.35) color = '#B22222'; // Red

      data.push({
        tree: treePos,
        scatter: scatterPos,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: 0.2 + Math.random() * 0.3,
        color: color
      });
    }
    return data;
  }, []);

  // Generate data for Gifts (Boxes) - Heavier elements
  const giftsData = useMemo(() => {
    const data: DualPosition[] = [];
    const count = CONSTANTS.GIFT_COUNT;

    for (let i = 0; i < count; i++) {
      // Tree position: mostly at the bottom
      const y = -CONSTANTS.TREE_HEIGHT / 2 + Math.random() * 2.5; // Bottom area
      const r = Math.random() * (CONSTANTS.TREE_RADIUS + 3); // Spread out base
      const angle = Math.random() * Math.PI * 2;

      const treePos: [number, number, number] = [
        r * Math.cos(angle),
        y - 0.8, // Sit on floor
        r * Math.sin(angle)
      ];

      const scatterR = 25 + Math.random() * 10;
      const scatterPos: [number, number, number] = [
        (Math.random() - 0.5) * scatterR,
        (Math.random() - 0.5) * scatterR,
        (Math.random() - 0.5) * scatterR,
      ];

      // Gift Wrapping Colors
      const rand = Math.random();
      let color = '#8B0000'; // Deep Red
      if (rand > 0.7) color = TIFFANY_BLUE;
      else if (rand > 0.4) color = '#D4AF37'; // Gold
      else if (rand > 0.2) color = '#FFFFFF'; // White/Silver

      data.push({
        tree: treePos,
        scatter: scatterPos,
        rotation: [0, Math.random() * Math.PI, 0],
        scale: 0.5 + Math.random() * 0.6,
        color: color
      });
    }
    return data;
  }, []);

  // Temporary objects for calculations
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const progressRef = useRef(0);

  // Set initial colors
  useLayoutEffect(() => {
    // Baubles Colors
    if (baubleRef.current) {
      baublesData.forEach((d, i) => {
        tempColor.set(d.color || '#D4AF37');
        baubleRef.current!.setColorAt(i, tempColor);
      });
      baubleRef.current.instanceColor!.needsUpdate = true;
    }

    // Gifts Colors (Wrapping Paper)
    if (giftRef.current) {
        giftsData.forEach((d, i) => {
            tempColor.set(d.color || '#FFFFFF');
            giftRef.current!.setColorAt(i, tempColor);
        });
        giftRef.current.instanceColor!.needsUpdate = true;
    }
  }, [baublesData, giftsData, tempColor]);

  useFrame((state, delta) => {
    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    // Smooth lerp for the global progress
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, delta * CONSTANTS.TRANSITION_SPEED);
    
    const t = progressRef.current;
    // Non-linear ease for visual punch
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Update Baubles
    if (baubleRef.current) {
      baublesData.forEach((data, i) => {
        const x = THREE.MathUtils.lerp(data.scatter[0], data.tree[0], easeT);
        const y = THREE.MathUtils.lerp(data.scatter[1], data.tree[1], easeT);
        const z = THREE.MathUtils.lerp(data.scatter[2], data.tree[2], easeT);
        
        // Add floating motion when scattered, stable when tree
        const floatFactor = (1 - easeT);
        const time = state.clock.elapsedTime;
        const floatY = Math.sin(time + i) * 0.5 * floatFactor;
        const floatRot = time * 0.5 * floatFactor;

        tempObj.position.set(x, y + floatY, z);
        tempObj.rotation.set(
            data.rotation[0] + floatRot, 
            data.rotation[1] + floatRot, 
            data.rotation[2]
        );
        tempObj.scale.setScalar(data.scale);
        tempObj.updateMatrix();
        baubleRef.current!.setMatrixAt(i, tempObj.matrix);
      });
      baubleRef.current.instanceMatrix.needsUpdate = true;
    }

    // Update Gifts
    if (giftRef.current) {
      giftsData.forEach((data, i) => {
        const x = THREE.MathUtils.lerp(data.scatter[0], data.tree[0], easeT);
        const y = THREE.MathUtils.lerp(data.scatter[1], data.tree[1], easeT);
        const z = THREE.MathUtils.lerp(data.scatter[2], data.tree[2], easeT);

        // Gifts tumble when scattering
        const tumble = (1 - easeT) * state.clock.elapsedTime;

        tempObj.position.set(x, y, z);
        tempObj.rotation.set(
             data.rotation[0] + tumble,
             data.rotation[1] + tumble,
             data.rotation[2]
        );
        tempObj.scale.setScalar(data.scale);
        tempObj.updateMatrix();
        giftRef.current!.setMatrixAt(i, tempObj.matrix);
      });
      giftRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Baubles */}
      <instancedMesh
        ref={baubleRef}
        args={[undefined, undefined, CONSTANTS.ORNAMENT_COUNT]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
            roughness={0.15} 
            metalness={0.9} 
            envMapIntensity={2.0}
        />
      </instancedMesh>

      {/* Gifts - Multi-colored Wrapping */}
      <instancedMesh
        ref={giftRef}
        args={[undefined, undefined, CONSTANTS.GIFT_COUNT]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        {/* White base color allows instanceColor to tint it correctly */}
        <meshStandardMaterial 
            color="#ffffff"
            roughness={0.2} 
            metalness={0.6} 
            envMapIntensity={1.5}
        />
      </instancedMesh>
    </group>
  );
};