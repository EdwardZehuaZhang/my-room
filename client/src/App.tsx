import { Suspense, useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { usePlayerStore } from './store.ts';
import EntryScreen from './components/EntryScreen.tsx';
import LoadingOverlay from './components/LoadingOverlay.tsx';
import SceneContent from './components/SceneContent.tsx';
import PreviewCamera from './components/PreviewCamera.tsx';
import SplatWithBlobUrl from './components/SplatWithBlobUrl.tsx';
import MobileSplat from './components/MobileSplat.tsx';
import { isMobile } from './components/SplatScene.tsx';
import ServerFullModal from './components/ServerFullModal.tsx';
import MobileJoysticks from './components/MobileJoysticks.tsx';
import ChatPanel from './components/ChatPanel.tsx';
import ControlsPanel from './components/ControlsPanel.tsx';
import RoomSwitcher, { ROOMS, GLITCHED_BASE } from './components/RoomSwitcher.tsx';
import MobileNavBar from './components/MobileNavBar.tsx';
import type { SheetId } from './components/MobileNavBar.tsx';
import PortraitOverlay from './components/PortraitOverlay.tsx';
import SizeSlider from './components/SizeSlider.tsx';

export default function App() {
  const joined = usePlayerStore((s) => s.joined);
  const [activeRoom, setActiveRoom] = useState(isMobile ? 'room1' : 'glitched');
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Resolve which splat to show
  let splatUrl: string;
  let position: [number, number, number];
  let rotation: [number, number, number];

  if (activeRoom === 'glitched') {
    splatUrl = GLITCHED_BASE.splatUrl;
    position = GLITCHED_BASE.position;
    rotation = GLITCHED_BASE.rotation;
  } else {
    const room = ROOMS.find((r) => r.key === activeRoom) ?? ROOMS[0];
    splatUrl = room.splatUrl;
    position = room.position;
    rotation = room.rotation;
  }

  const handleRoomSwitch = useCallback((key: string) => {
    setActiveRoom(key);
    setLoaded(false);
    setProgress(0);
  }, []);

  // Mobile bottom-sheet state
  const [mobileSheet, setMobileSheet] = useState<SheetId | null>(null);
  const handleToggleSheet = useCallback((sheet: SheetId) => {
    setMobileSheet((prev) => (prev === sheet ? null : sheet));
  }, []);

  // Shared joystick refs: written by MobileJoysticks (HTML), read by LocalAvatar (R3F)
  const joystickRef = useRef({ x: 0, y: 0 });
  const joystickCamRef = useRef({ x: 0, y: 0 });
  const mobileFlyRef = useRef({ up: false, down: false });

  // Stable callback refs to avoid re-creating the splat instance
  const onProgress = useCallback((pct: number) => setProgress(pct), []);
  const onLoaded = useCallback(() => {
    setProgress(100);
    setLoaded(true);
  }, []);

  return (
    <>
      <PortraitOverlay />

      {/* Canvas is always mounted so the splat starts loading immediately */}
      <Canvas
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none',
          userSelect: 'none',
        }}
        gl={{ antialias: false }}
        camera={{ fov: 60, near: 0.001, far: 1000 }}
      >
        <Suspense fallback={null}>
          {joined ? (
            <SceneContent
              splatUrl={splatUrl}
              position={position}
              rotation={rotation}
              onProgress={onProgress}
              onLoaded={onLoaded}
              joystickRef={joystickRef}
              joystickCamRef={joystickCamRef}
              mobileFlyRef={mobileFlyRef}
            />
          ) : (
            <>
              <PreviewCamera />
              <ambientLight intensity={0.6} />
              <group position={position} rotation={rotation} renderOrder={-1}>
                {isMobile
                  ? <MobileSplat src={splatUrl} />
                  : <SplatWithBlobUrl src={splatUrl} />
                }
              </group>
            </>
          )}
        </Suspense>
      </Canvas>

      {joined ? (
        <>
          <LoadingOverlay progress={progress} done={loaded} />
          <ServerFullModal />
          <ChatPanel />
          <ControlsPanel />
          <SizeSlider />
          <RoomSwitcher activeRoom={activeRoom} onSwitch={handleRoomSwitch} />
          <MobileNavBar
            activeSheet={mobileSheet}
            onToggleSheet={handleToggleSheet}
            activeRoom={activeRoom}
            onSwitch={handleRoomSwitch}
          />
          <MobileJoysticks joystickRef={joystickRef} joystickCamRef={joystickCamRef} mobileFlyRef={mobileFlyRef} />
        </>
      ) : (
        <EntryScreen />
      )}
    </>
  );
}
