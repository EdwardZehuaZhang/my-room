import { Suspense, useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { usePlayerStore } from './store.ts';
import EntryScreen from './components/EntryScreen.tsx';
import LoadingOverlay from './components/LoadingOverlay.tsx';
import SceneContent from './components/SceneContent.tsx';
import ServerFullModal from './components/ServerFullModal.tsx';
import MobileJoysticks from './components/MobileJoysticks.tsx';
import ChatPanel from './components/ChatPanel.tsx';

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

  // Shared joystick refs: written by MobileJoysticks (HTML), read by LocalAvatar (R3F)
  const joystickRef = useRef({ x: 0, y: 0 });
  const joystickCamRef = useRef({ x: 0, y: 0 });

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
      <ChatPanel />
      <MobileJoysticks joystickRef={joystickRef} joystickCamRef={joystickCamRef} />
      <Canvas
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
          userSelect: 'none',
        }}
        gl={{ antialias: false }}
        camera={{ fov: 60, near: 0.1, far: 1000 }}
      >
        <Suspense fallback={null}>
          <SceneContent
            splatUrl={splatUrl}
            onProgress={onProgress}
            onLoaded={onLoaded}
            joystickRef={joystickRef}
            joystickCamRef={joystickCamRef}
          />
        </Suspense>
      </Canvas>
    </>
  );
}


