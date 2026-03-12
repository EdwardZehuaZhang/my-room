import { Suspense, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { usePlayerStore } from './store.ts';
import EntryScreen from './components/EntryScreen.tsx';
import LoadingOverlay from './components/LoadingOverlay.tsx';
import SceneContent from './components/SceneContent.tsx';
import ServerFullModal from './components/ServerFullModal.tsx';

const splatUrl = import.meta.env.VITE_SPLAT_URL as string | undefined;

function MissingUrl() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontFamily: 'var(--font-mono)',
        color: 'var(--lime)',
        fontSize: '0.9rem',
      }}
    >
      // VITE_SPLAT_URL is not defined
    </div>
  );
}

export default function App() {
  const joined = usePlayerStore((s) => s.joined);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Stable callback refs to avoid re-creating the splat instance
  const onProgress = useCallback((pct: number) => setProgress(pct), []);
  const onLoaded = useCallback(() => {
    setProgress(100);
    setLoaded(true);
  }, []);

  if (!joined) {
    return <EntryScreen />;
  }

  if (!splatUrl) {
    return <MissingUrl />;
  }

  return (
    <>
      <LoadingOverlay progress={progress} done={loaded} />
      <ServerFullModal />
      <Canvas
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: false }}
        camera={{ fov: 60, near: 0.1, far: 1000 }}
      >
        <Suspense fallback={null}>
          <SceneContent
            splatUrl={splatUrl}
            onProgress={onProgress}
            onLoaded={onLoaded}
          />
        </Suspense>
      </Canvas>
    </>
  );
}
