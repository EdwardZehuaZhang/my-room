import styles from './RoomSwitcher.module.css';

export interface RoomDef {
  key: string;
  name: string;
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
  position: [0, 0, 0],
  rotation: [0, 0, 0],
};

export interface RoomSwitcherContentProps {
  activeRoom: string;
  onSwitch: (key: string) => void;
  classNames?: typeof styles;
}

/** Reusable room tabs. Used by both RoomSwitcher and MobileNavBar. */
export function RoomSwitcherContent({ activeRoom, onSwitch, classNames = styles }: RoomSwitcherContentProps) {
  const isGlitched = activeRoom === 'glitched';

  return (
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
  );
}

export default function RoomSwitcher({ activeRoom, onSwitch }: RoomSwitcherContentProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.title}>Room</div>
      <RoomSwitcherContent
        activeRoom={activeRoom}
        onSwitch={onSwitch}
      />
    </div>
  );
}
