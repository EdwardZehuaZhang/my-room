/**
 * Splat renderer using @react-three/drei <Splat>.
 * Supports the .splat binary format (antimatter15 layout).
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import SplatWithBlobUrl from './SplatWithBlobUrl.tsx';

interface SplatSceneProps {
  splatUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

export default function SplatScene({ splatUrl, position, rotation, onProgress, onLoaded }: SplatSceneProps) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Let the user into the scene immediately; splat loads progressively in background
  useEffect(() => {
    onProgress(100);
    onLoaded();
  }, [onProgress, onLoaded]);

  return (
    <group position={position} rotation={rotation} renderOrder={-1}>
      <SplatWithBlobUrl src={splatUrl} />
    </group>
  );
}
