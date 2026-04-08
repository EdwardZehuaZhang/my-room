import styles from './RoomSwitcher.module.css';

export interface RoomDef {
  key: string;
  name: string;
  splatUrl: string;
  position: [number, number, number]; // [x, y, z]
  rotation: [number, number, number]; // [x, y, z] in radians
}

export interface GlitchedToggle {
  key: string;
  label: string;
  splatUrl: string;
  position: [number, number, number]; // [x, y, z]
  rotation: [number, number, number]; // [x, y, z] in radians
}

const BLOB_BASE = import.meta.env.DEV
  ? '/splat-proxy'
  : 'https://jslyit1chyjxlulc.public.blob.vercel-storage.com';

export const ROOMS: RoomDef[] = [
  { key: 'room1', name: 'Midnight', splatUrl: `${BLOB_BASE}/PS_Room1.splat`, position: [0, 0.9, 0], rotation: [0, 0, 0] },
  { key: 'room2', name: 'Morning', splatUrl: `${BLOB_BASE}/PS_Room2.splat`, position: [0, 0.9, 0], rotation: [0, 0, 0] },
  { key: 'room3', name: 'Afternoon', splatUrl: `${BLOB_BASE}/PS_Room3.splat`, position: [0, 0.9, 0], rotation: [0, 0, 0] },
  { key: 'room4', name: 'Evening', splatUrl: `${BLOB_BASE}/PS_Room4.splat`, position: [0, 0.9, 0], rotation: [0, 0, 0] },
];

export const GLITCHED_BASE: RoomDef = {
  key: 'glitched',
  name: 'Glitched',
  splatUrl: `${BLOB_BASE}/PS_Room5.splat`,
  position: [0, 0.9, 0],
  rotation: [0, 0, 0],
};

export const GLITCHED_TOGGLES: GlitchedToggle[] = [
  { key: 'drawer', label: 'Drawer', splatUrl: `${BLOB_BASE}/PS_Room5_Drawer.splat`, position: [1.4, -1, -5], rotation: [-0.14, 1.3, 0.13] },
];

export interface RoomSwitcherContentProps {
  activeRoom: string;
  glitchedToggles: Record<string, boolean>;
  onSwitch: (key: string) => void;
  onToggleGlitched: (key: string) => void;
  classNames?: typeof styles;
}

/** Reusable room tabs + toggles. Used by both RoomSwitcher and MobileNavBar. */
export function RoomSwitcherContent({ activeRoom, glitchedToggles, onSwitch, onToggleGlitched, classNames = styles }: RoomSwitcherContentProps) {
  const isGlitched = activeRoom === 'glitched';

  return (
    <>
      <div className={classNames.tabs}>
        {ROOMS.map((room) => (
          <button
            key={room.key}
            className={`${classNames.tab} ${activeRoom === room.key ? classNames.tabActive : ''}`}
            onClick={() => onSwitch(room.key)}
          >
            {room.name}
          </button>
        ))}
        <button
          className={`${classNames.tab} ${classNames.tabGlitched} ${isGlitched ? classNames.tabGlitchedActive : ''}`}
          onClick={() => onSwitch('glitched')}
        >
          Glitched
        </button>
      </div>

      {isGlitched && (
        <div className={classNames.toggleSection}>
          <div className={classNames.toggleTitle}>Layers</div>
          {GLITCHED_TOGGLES.map((t) => (
            <label key={t.key} className={classNames.toggleRow}>
              <span className={classNames.toggleLabel}>{t.label}</span>
              <button
                className={`${classNames.toggle} ${glitchedToggles[t.key] ? classNames.toggleOn : ''}`}
                onClick={() => onToggleGlitched(t.key)}
              >
                <span className={classNames.toggleKnob} />
              </button>
            </label>
          ))}
        </div>
      )}
    </>
  );
}

export default function RoomSwitcher({ activeRoom, glitchedToggles, onSwitch, onToggleGlitched }: RoomSwitcherContentProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.title}>Room</div>
      <RoomSwitcherContent
        activeRoom={activeRoom}
        glitchedToggles={glitchedToggles}
        onSwitch={onSwitch}
        onToggleGlitched={onToggleGlitched}
      />
    </div>
  );
}
