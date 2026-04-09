/**
 * Mobile splat renderer using @mkkellogg/gaussian-splats-3d.
 * Progressively loads and renders .splat files — shows partial data as it downloads.
 */
import { useEffect, useRef } from 'react';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

interface MobileSplatProps {
  src: string;
}

export default function MobileSplat({ src }: MobileSplatProps) {
  const viewerRef = useRef<GaussianSplats3D.DropInViewer | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    let disposed = false;

    try {
      const instance = new GaussianSplats3D.DropInViewer({
        gpuAcceleratedSort: false,
        sharedMemoryForWorkers: false,
        sceneRevealMode: GaussianSplats3D.SceneRevealMode.Instant,
      });

      viewerRef.current = instance;

      if (groupRef.current) {
        groupRef.current.add(instance);
      }

      instance.addSplatScene(src, {
        progressiveLoad: true,
        showLoadingUI: false,
        splatAlphaRemovalThreshold: 5,
      }).catch((err: unknown) => {
        console.error('[MobileSplat] addSplatScene failed:', err);
      });
    } catch (err) {
      console.error('[MobileSplat] DropInViewer init failed:', err);
    }

    return () => {
      disposed = true;
      if (viewerRef.current) {
        try {
          if (groupRef.current) {
            groupRef.current.remove(viewerRef.current);
          }
          viewerRef.current.dispose();
        } catch (e) {
          // dispose may throw if already cleaned up
        }
        viewerRef.current = null;
      }
    };
  }, [src]);

  return <group ref={groupRef} />;
}
