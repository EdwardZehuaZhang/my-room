/**
 * Splat renderer.
 * - Desktop: @react-three/drei <Splat> via blob URL (works around Vercel CDN stripping Content-Length)
 * - Mobile:  @mkkellogg/gaussian-splats-3d with progressive loading (renders chunks as they download)
 */
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import SplatWithBlobUrl from './SplatWithBlobUrl.tsx';
import MobileSplat from './MobileSplat.tsx';

export const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

interface SplatSceneProps {
  splatUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

export default function SplatScene({ splatUrl, position, rotation, onProgress, onLoaded }: SplatSceneProps) {
  const { camera } = useThree();
  const onProgressRef = useRef(onProgress);
  const onLoadedRef = useRef(onLoaded);
  onProgressRef.current = onProgress;
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Let the user into the scene immediately; splat loads progressively in background
  useEffect(() => {
    onProgressRef.current(100);
    onLoadedRef.current();
  }, []);

  return (
    <group position={position} rotation={rotation} renderOrder={-1}>
      {isMobile
        ? <MobileSplat src={splatUrl} />
        : <SplatWithBlobUrl src={splatUrl} />
      }
    </group>
  );
}
