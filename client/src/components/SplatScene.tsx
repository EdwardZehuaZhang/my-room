/**
 * Splat renderer.
 * - Desktop: SplatWithBlobUrl (blob URL workaround for Vercel CDN stripping Content-Length)
 * - Mobile:  <Splat src={url}> directly — worked at 6bd5504, no blob buffering needed
 */
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Splat } from '@react-three/drei';
import SplatWithBlobUrl from './SplatWithBlobUrl.tsx';

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

  useEffect(() => {
    onProgressRef.current(100);
    onLoadedRef.current();
  }, []);

  return (
    <group position={position} rotation={rotation} renderOrder={-1}>
      {isMobile
        ? <Splat src={splatUrl} />
        : <SplatWithBlobUrl src={splatUrl} />
      }
    </group>
  );
}
