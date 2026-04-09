/**
 * Non-interactive splat background for the entry screen.
 * Renders the glitched room with a slow 360 auto-pan camera.
 */
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { GLITCHED_BASE } from './RoomSwitcher.tsx';
import SplatWithBlobUrl from './SplatWithBlobUrl.tsx';

const RADIUS = 5;
const HEIGHT = 2.5;
const SPEED = 0.08; // radians per second

function RotatingCamera() {
  const angle = useRef(0);

  useFrame((state, delta) => {
    angle.current += SPEED * delta;
    const x = Math.sin(angle.current) * RADIUS;
    const z = Math.cos(angle.current) * RADIUS;
    state.camera.position.set(x, HEIGHT, z);
    state.camera.lookAt(0, 1, 0);
  });

  return null;
}

export default function SplatPreviewBg() {
  const { splatUrl, position, rotation } = GLITCHED_BASE;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.45,
      }}
    >
      <Canvas
        gl={{ antialias: false }}
        camera={{ fov: 60, near: 0.001, far: 1000 }}
        style={{ width: '100%', height: '100%' }}
      >
        <RotatingCamera />
        <group position={position} rotation={rotation} renderOrder={-1}>
          <SplatWithBlobUrl src={splatUrl} />
        </group>
      </Canvas>
    </div>
  );
}
