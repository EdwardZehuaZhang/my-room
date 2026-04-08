/**
 * Splat renderer using @react-three/drei <Splat>.
 * Supports the .splat binary format (antimatter15 layout).
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Splat } from '@react-three/drei';
import { useSplatBlobUrl } from '../hooks/useSplatBlobUrl';

interface SplatSceneProps {
  splatUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

export default function SplatScene({ splatUrl, position, rotation, onProgress, onLoaded }: SplatSceneProps) {
  const { camera } = useThree();
  const { blobUrl } = useSplatBlobUrl(splatUrl);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Signal loaded once the blob URL is ready
  useEffect(() => {
    if (blobUrl) {
      onProgress(100);
      onLoaded();
    }
  }, [blobUrl, onProgress, onLoaded]);

  if (!blobUrl) return null;

  return (
    <group position={position} rotation={rotation} renderOrder={-1}>
      <Splat src={blobUrl} />
    </group>
  );
}
