/**
 * Splat renderer.
 * - Desktop: @react-three/drei <Splat> via blob URL (works around Vercel CDN stripping Content-Length)
 * - Mobile:  LumaSplatsThree streams progressively from the URL (no full download needed before rendering)
 */
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { LumaSplatsThree } from '@lumaai/luma-web';
import SplatWithBlobUrl from './SplatWithBlobUrl.tsx';

export const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

interface SplatSceneProps {
  splatUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

/** Used in the preview canvas (before joining) to kick off the LumaSplats download early. */
export function MobileSplatPreload({ src }: { src: string }) {
  const [splat] = useState(() => new LumaSplatsThree({
    source: src,
    enableThreeShaderIntegration: true,
  }));
  useEffect(() => () => splat.dispose(), [splat]);
  return <primitive object={splat} />;
}

function MobileSplat({ splatUrl }: { splatUrl: string }) {
  const [splat, setSplat] = useState<LumaSplatsThree | null>(null);

  useEffect(() => {
    const instance = new LumaSplatsThree({
      source: splatUrl,
      enableThreeShaderIntegration: true,
    });
    setSplat(instance);
    return () => {
      instance.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splatUrl]);

  if (!splat) return null;
  return <primitive object={splat} />;
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
        ? <MobileSplat splatUrl={splatUrl} />
        : <SplatWithBlobUrl src={splatUrl} />
      }
    </group>
  );
}
