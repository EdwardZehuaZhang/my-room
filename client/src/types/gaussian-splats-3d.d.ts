declare module '@mkkellogg/gaussian-splats-3d' {
  import { Group } from 'three';

  export enum SceneRevealMode {
    Default = 0,
    Gradual = 1,
    Instant = 2,
  }

  export interface DropInViewerOptions {
    gpuAcceleratedSort?: boolean;
    sceneRevealMode?: SceneRevealMode;
    sharedMemoryForWorkers?: boolean;
  }

  export interface AddSplatSceneOptions {
    progressiveLoad?: boolean;
    showLoadingUI?: boolean;
    position?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    splatAlphaRemovalThreshold?: number;
    onProgress?: (percent: number, label: string, status: number) => void;
  }

  export class DropInViewer extends Group {
    constructor(options?: DropInViewerOptions);
    addSplatScene(path: string, options?: AddSplatSceneOptions): Promise<void>;
    dispose(): void;
  }
}
