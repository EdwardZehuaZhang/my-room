import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three';
import type { ModelDef } from '../models.ts';
import styles from './ModelPreview.module.css';

const PREVIEW_TARGET_HEIGHT = 1.6;

function PreviewModel({ modelDef }: { modelDef: ModelDef }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelDef.url);
  const clone = useMemo(() => cloneSkeleton(scene) as THREE.Group, [scene]);
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    const k = Object.keys(actions);
    const idleName = (modelDef.idleAnim && actions[modelDef.idleAnim]) ? modelDef.idleAnim : k[0];
    if (idleName && actions[idleName]) actions[idleName]!.reset().play();
  }, [actions, modelDef]);

  const normalizedScale = PREVIEW_TARGET_HEIGHT / modelDef.heightHint;
  // Center the model vertically
  const offsetY = -(modelDef.heightHint / 2) * normalizedScale;

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.6;
  });

  return (
    <group ref={groupRef} position={[0, offsetY, 0]}>
      <primitive object={clone} scale={normalizedScale} rotation={[0, modelDef.rotationY, 0]} />
    </group>
  );
}

interface Props {
  modelDef: ModelDef;
  selected: boolean;
  onClick: () => void;
}

export default function ModelPreview({ modelDef, selected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
    >
      <div className={styles.canvasWrap}>
        <Canvas
          camera={{ position: [0, 0, 4.44], fov: 40 }}
          gl={{ antialias: false, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[2, 4, 3]} intensity={1.5} />
          <directionalLight position={[-2, 1, -2]} intensity={0.4} />
          <PreviewModel modelDef={modelDef} />
        </Canvas>
      </div>
      <div className={`${styles.label} ${selected ? styles.labelSelected : ''}`}>
        {selected ? '\u2713' : ''}{modelDef.name}
      </div>
    </div>
  );
}
