import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const RADIUS = 5;
const HEIGHT = 2.5;
const SPEED = 0.08; // radians per second

/** Auto-rotating camera used on the entry screen before the user joins. */
export default function PreviewCamera() {
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
