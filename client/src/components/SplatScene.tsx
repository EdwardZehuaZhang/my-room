/**
 * Splat renderer using @react-three/drei <Splat>.
 * Supports the .splat binary format (antimatter15 layout).
 *
 * Stream-preloads the file into the browser HTTP cache (without buffering in JS memory),
 * then renders <Splat> which loads instantly from cache — so the full scene appears at once.
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Splat } from '@react-three/drei';
import { useSplatPreload } from '../hooks/useSplatPreload';

interface SplatSceneProps {
  splatUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

export default function SplatScene({ splatUrl, position, rotation, onProgress, onLoaded }: SplatSceneProps) {
  const { camera } = useThree();
  const { ready, progress } = useSplatPreload(splatUrl);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Forward preload progress
  useEffect(() => {
    onProgress(progress);
  }, [progress, onProgress]);

  // Signal loaded once cache is warm
  useEffect(() => {
    if (ready) onLoaded();
  }, [ready, onLoaded]);

  if (!ready) return null;

  return (
    <group position={position} rotation={rotation} renderOrder={-1}>
      <Splat src={splatUrl} />
    </group>
  );
}
