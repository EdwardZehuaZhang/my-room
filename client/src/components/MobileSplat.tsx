/**
 * Mobile splat renderer using @mkkellogg/gaussian-splats-3d.
 * Progressively loads and renders .splat files — shows partial data as it downloads.
 */
import { useEffect, useState } from 'react';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

interface MobileSplatProps {
  src: string;
}

export default function MobileSplat({ src }: MobileSplatProps) {
  const [viewer, setViewer] = useState<GaussianSplats3D.DropInViewer | null>(null);

  useEffect(() => {
    const instance = new GaussianSplats3D.DropInViewer({
      gpuAcceleratedSort: true,
      sceneRevealMode: GaussianSplats3D.SceneRevealMode.Instant,
      sharedMemoryForWorkers: false,
    });

    instance.addSplatScene(src, {
      progressiveLoad: true,
      showLoadingUI: false,
      splatAlphaRemovalThreshold: 5,
    });

    setViewer(instance);

    return () => {
      instance.dispose();
    };
  }, [src]);

  if (!viewer) return null;
  return <primitive object={viewer} />;
}
