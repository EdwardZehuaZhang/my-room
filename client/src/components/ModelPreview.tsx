import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three';
import type { ModelDef } from '../models.ts';

const PREVIEW_TARGET_HEIGHT = 1.024;

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
      style={{
        cursor: 'pointer',
        border: selected ? '2px solid #B4FF4F' : '2px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        transition: 'border-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', height: '120px' }}>
        <Canvas
          camera={{ position: [0, 0, 2.8], fov: 40 }}
          gl={{ antialias: false, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[2, 4, 3]} intensity={1.5} />
          <directionalLight position={[-2, 1, -2]} intensity={0.4} />
          <PreviewModel modelDef={modelDef} />
        </Canvas>
      </div>
      <div style={{
        padding: '6px 0 8px',
        fontFamily: 'monospace',
        fontSize: '0.72rem',
        color: selected ? '#B4FF4F' : 'rgba(255,255,255,0.6)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        {selected ? 'âœ?' : ''}{modelDef.name}
      </div>
    </div>
  );
}
