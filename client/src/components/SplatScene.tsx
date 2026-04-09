/**
 * Splat renderer.
 * - Desktop: drei <Splat> via blob URL (Vercel CDN strips Content-Length; blob URL restores it)
 * - Mobile:  drei <Splat> with the direct URL. Content-Length is missing so there's no progress
 *            bar, but the underlying antimatter15 XHR still fires onload and the splat renders.
 *            The blob workaround is skipped because iOS kills large background blob allocations.
 */
import { useEffect, useRef } from 'react';
import { Splat } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import SplatWithBlobUrl from './SplatWithBlobUrl.tsx';

export const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

interface SplatSceneProps {
  splatUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

/** Starts loading the splat in the preview canvas (before the user joins). */
export function SplatPreload({ src }: { src: string }) {
  if (isMobile) {
    // Direct URL — no blob needed; XHR will load without Content-Length
    return <Splat src={src} />;
  }
  return <SplatWithBlobUrl src={src} />;
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
    <group position={position} rotation={rotation} renderOrder={isMobile ? 0 : -1}>
      {isMobile
        ? <Splat src={splatUrl} />
        : <SplatWithBlobUrl src={splatUrl} />
      }
    </group>
  );
}
