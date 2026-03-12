/**
 * Splat renderer: @lumaai/luma-web (LumaSplatsThree)
 * Chosen for native Three.js Mesh integration, onProgress callback,
 * and streaming .splat/.ply support without extra bundling.
 */
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { LumaSplatsThree } from '@lumaai/luma-web';

interface SplatSceneProps {
  splatUrl: string;
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

export default function SplatScene({ splatUrl, onProgress, onLoaded }: SplatSceneProps) {
  const { camera } = useThree();
  const splatRef = useRef<LumaSplatsThree | null>(null);
  const [splat, setSplat] = useState<LumaSplatsThree | null>(null);

  // Set initial camera position: ~4 units behind and ~2 units above origin
  useEffect(() => {
    camera.position.set(0, 2, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    const instance = new LumaSplatsThree({
      source: splatUrl,
      enableThreeShaderIntegration: true,
    });

    instance.onProgress = (e) => {
      onProgress(Math.round(e.progress * 100));
    };

    instance.onLoad = () => {
      onLoaded();
    };

    splatRef.current = instance;
    setSplat(instance);

    return () => {
      instance.dispose();
      splatRef.current = null;
    };
    // splatUrl is stable from env; callbacks are stable refs via parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splatUrl]);

  if (!splat) return null;

  const yOffset = parseFloat((import.meta.env.VITE_SPLAT_Y_OFFSET as string) ?? '0');

  return (
    <group position={[0, yOffset, 0]}>
      <primitive object={splat} />
    </group>
  );
}

