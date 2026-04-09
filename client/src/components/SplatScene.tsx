/**
 * Splat renderer.
 * - Desktop: @react-three/drei <Splat> via blob URL (works around Vercel CDN stripping Content-Length)
 * - Mobile:  LumaSplatsThree streams directly from the URL (no Content-Length needed, no large blob in memory)
 */
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { LumaSplatsThree } from '@lumaai/luma-web';
import SplatWithBlobUrl from './SplatWithBlobUrl.tsx';

const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

interface SplatSceneProps {
  splatUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

function MobileSplat({ splatUrl, onProgress, onLoaded }: Pick<SplatSceneProps, 'splatUrl' | 'onProgress' | 'onLoaded'>) {
  const [splat, setSplat] = useState<LumaSplatsThree | null>(null);

  useEffect(() => {
    const instance = new LumaSplatsThree({
      source: splatUrl,
      enableThreeShaderIntegration: true,
    });

    instance.onProgress = (e) => onProgress(Math.round(e.progress * 100));
    instance.onLoad = () => onLoaded();

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

  useEffect(() => {
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Desktop: let the user in immediately, splat streams in background
  const onProgressRef = useRef(onProgress);
  const onLoadedRef = useRef(onLoaded);
  onProgressRef.current = onProgress;
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    if (!isMobile) {
      onProgressRef.current(100);
      onLoadedRef.current();
    }
  }, []);

  return (
    <group position={position} rotation={rotation} renderOrder={-1}>
      {isMobile
        ? <MobileSplat splatUrl={splatUrl} onProgress={onProgress} onLoaded={onLoaded} />
        : <SplatWithBlobUrl src={splatUrl} />
      }
    </group>
  );
}
