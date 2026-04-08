import { Suspense, useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { usePlayerStore } from './store.ts';
import EntryScreen from './components/EntryScreen.tsx';
import LoadingOverlay from './components/LoadingOverlay.tsx';
import SceneContent from './components/SceneContent.tsx';
import ServerFullModal from './components/ServerFullModal.tsx';
import MobileJoysticks from './components/MobileJoysticks.tsx';
import ChatPanel from './components/ChatPanel.tsx';
import ControlsPanel from './components/ControlsPanel.tsx';
import RoomSwitcher, { ROOMS, GLITCHED_BASE, GLITCHED_TOGGLES } from './components/RoomSwitcher.tsx';
import MobileNavBar from './components/MobileNavBar.tsx';
import type { SheetId } from './components/MobileNavBar.tsx';
import PortraitOverlay from './components/PortraitOverlay.tsx';
import SizeSlider from './components/SizeSlider.tsx';

export default function App() {
  const joined = usePlayerStore((s) => s.joined);
  const [activeRoom, setActiveRoom] = useState(ROOMS[0].key);
  const [glitchedToggles, setGlitchedToggles] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Resolve which splat to show
  let splatUrl: string;
  let position: [number, number, number];
  let rotation: [number, number, number];
  let sceneKey: string;

  if (activeRoom === 'glitched') {
    const activeToggle = GLITCHED_TOGGLES.find((t) => glitchedToggles[t.key]);
    splatUrl = activeToggle ? activeToggle.splatUrl : GLITCHED_BASE.splatUrl;
    position = activeToggle ? activeToggle.position : GLITCHED_BASE.position;
    rotation = activeToggle ? activeToggle.rotation : GLITCHED_BASE.rotation;
    sceneKey = activeToggle ? `glitched-${activeToggle.key}` : 'glitched-base';
  } else {
    const room = ROOMS.find((r) => r.key === activeRoom) ?? ROOMS[0];
    splatUrl = room.splatUrl;
    position = room.position;
    rotation = room.rotation;
    sceneKey = room.key;
  }

  const handleRoomSwitch = useCallback((key: string) => {
    setActiveRoom(key);
    setLoaded(false);
    setProgress(0);
  }, []);

  const handleToggleGlitched = useCallback((key: string) => {
    setGlitchedToggles((prev) => {
      // Turn off all others, toggle the clicked one
      const next: Record<string, boolean> = {};
      for (const t of GLITCHED_TOGGLES) {
        next[t.key] = t.key === key ? !prev[t.key] : false;
      }
      return next;
    });
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

  if (!joined) {
    return (
      <>
        <PortraitOverlay />
        <EntryScreen />
      </>
    );
  }

  return (
    <>
      <PortraitOverlay />
      <LoadingOverlay progress={progress} done={loaded} />
      <ServerFullModal />
      <ChatPanel />
      <ControlsPanel />
      <SizeSlider />
      <RoomSwitcher activeRoom={activeRoom} glitchedToggles={glitchedToggles} onSwitch={handleRoomSwitch} onToggleGlitched={handleToggleGlitched} />
      <MobileNavBar
        activeSheet={mobileSheet}
        onToggleSheet={handleToggleSheet}
        activeRoom={activeRoom}
        glitchedToggles={glitchedToggles}
        onSwitch={handleRoomSwitch}
        onToggleGlitched={handleToggleGlitched}
      />
      <MobileJoysticks joystickRef={joystickRef} joystickCamRef={joystickCamRef} mobileFlyRef={mobileFlyRef} />
      <Canvas
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
          userSelect: 'none',
        }}
        gl={{ antialias: false }}
        camera={{ fov: 60, near: 0.001, far: 1000 }}
      >
        <Suspense fallback={null}>
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
        </Suspense>
      </Canvas>
    </>
  );
}


