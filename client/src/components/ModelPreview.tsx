import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three';
import { useMemo } from 'react';
import type { ModelDef } from '../models.ts';

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

  // Compute normalized scale to fit in a 1.6-unit tall box
  const normalizedScale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clone);
    const height = box.max.y - box.min.y;
    return height > 0 ? 1.6 / height : 1;
  }, [clone]);

  // Slow auto-rotate
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.6;
  });

  const box = useMemo(() => {
    const b = new THREE.Box3().setFromObject(clone);
    return b;
  }, [clone]);

  const centerY = (box.min.y + box.max.y) / 2 * normalizedScale;

  return (
    <group ref={groupRef} position={[0, -centerY, 0]}>
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
        {selected ? '✓ ' : ''}{modelDef.name}
      </div>
    </div>
  );
}
