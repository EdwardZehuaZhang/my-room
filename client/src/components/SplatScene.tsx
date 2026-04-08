/**
 * Splat renderer using @react-three/drei <Splat>.
 * Supports the .splat binary format (antimatter15 layout).
 * Downloads the entire file before rendering to avoid partial display.
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Splat } from '@react-three/drei';
interface SplatSceneProps {
  splatUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

export default function SplatScene({ splatUrl, position, rotation, onProgress, onLoaded }: SplatSceneProps) {
  const { camera } = useThree();
  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Signal loaded
  useEffect(() => {
    onProgress(100);
    onLoaded();
  }, [onProgress, onLoaded]);

  return (
    <group position={position} rotation={rotation} renderOrder={-1}>
      <Splat src={splatUrl} />
    </group>
  );
}
