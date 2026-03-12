import SplatScene from './SplatScene.tsx';
import RemoteAvatars from './RemoteAvatars.tsx';
import { useSocket } from '../hooks/useSocket.ts';

interface SceneContentProps {
  splatUrl: string;
  onProgress: (pct: number) => void;
  onLoaded: () => void;
}

/**
 * Groups all 3D scene content inside the Canvas.
 * Owns the socket connection and exposes refs for local position updates.
 */
export default function SceneContent({ splatUrl, onProgress, onLoaded }: SceneContentProps) {
  // useSocket connects and emits player_move at 10 Hz
  useSocket();

  return (
    <>
      <ambientLight intensity={0.6} />
      <SplatScene splatUrl={splatUrl} onProgress={onProgress} onLoaded={onLoaded} />
      <RemoteAvatars />
    </>
  );
}
