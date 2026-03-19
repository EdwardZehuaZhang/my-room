/**
 * Splat renderer using @react-three/drei <Splat>.
 * Supports the .splat binary format (antimatter15 layout).
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Splat } from '@react-three/drei';

interface SplatSceneProps {
  splatUrl: string;
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

export default function SplatScene({ splatUrl, onProgress, onLoaded }: SplatSceneProps) {
  const { camera } = useThree();

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // drei Splat doesn't expose granular progress, so signal loaded once mounted
  useEffect(() => {
    onProgress(100);
    onLoaded();
  }, [onProgress, onLoaded]);

  const yOffset = parseFloat((import.meta.env.VITE_SPLAT_Y_OFFSET as string) ?? '0');

  return (
    <group position={[0, yOffset, 0]} renderOrder={-1}>
      <Splat src={splatUrl} />
    </group>
  );
}
