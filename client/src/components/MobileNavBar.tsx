import { usePlayerStore } from '../store.ts';
import { ChatContent } from './ChatPanel.tsx';
import { RoomSwitcherContent } from './RoomSwitcher.tsx';
import styles from './MobileNavBar.module.css';
import chatStyles from './ChatPanel.module.css';
import roomStyles from './RoomSwitcher.module.css';

export type SheetId = 'chat' | 'room' | 'avatar';

interface MobileNavBarProps {
  activeSheet: SheetId | null;
  onToggleSheet: (sheet: SheetId) => void;
  activeRoom: string;
  onSwitch: (key: string) => void;
}

/* ── SVG Icons ── */

function ChatIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function RoomIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function AvatarIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
      <path d="M19 11l2 2-2 2" />
    </svg>
  );
}

function AvatarSheetContent() {
  const scale = usePlayerStore((s) => s.avatarScale);
  const setScale = usePlayerStore((s) => s.setAvatarScale);
  const firstPerson = usePlayerStore((s) => s.firstPerson);
  const toggleFP = usePlayerStore((s) => s.toggleFirstPerson);

  return (
    <div className={styles.avatarContent}>
      <div className={styles.avatarRow}>
        <span className={styles.avatarLabel}>Camera</span>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleBtn} ${!firstPerson ? styles.toggleBtnActive : ''}`}
            onClick={() => firstPerson && toggleFP()}
          >
            3rd
          </button>
          <button
            className={`${styles.toggleBtn} ${firstPerson ? styles.toggleBtnActive : ''}`}
            onClick={() => !firstPerson && toggleFP()}
          >
            1st
          </button>
        </div>
      </div>
      <div className={styles.avatarRow}>
        <span className={styles.avatarLabel}>Size</span>
        <button className={styles.sizeBtn} disabled={scale <= 1} onClick={() => setScale(scale - 1)}>
          &minus;
        </button>
        <span className={styles.sizeValue}>{scale}</span>
        <button className={styles.sizeBtn} disabled={scale >= 10} onClick={() => setScale(scale + 1)}>
          +
        </button>
      </div>
    </div>
  );
}

/* ── Sheet titles ── */

const SHEET_TITLES: Record<SheetId, string> = {
  chat: '// chat',
  room: '// room',
  avatar: '// avatar',
};

/* ── Main component ── */

export default function MobileNavBar({
  activeSheet,
  onToggleSheet,
  activeRoom,
  onSwitch,
}: MobileNavBarProps) {
  const isOpen = activeSheet !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={() => activeSheet && onToggleSheet(activeSheet)}
      />

      {/* Bottom sheet */}
      <div className={`${styles.sheet} ${isOpen ? styles.sheetOpen : ''}`}>
        {activeSheet && (
          <>
            <div className={styles.sheetHeader}>
              <span>{SHEET_TITLES[activeSheet]}</span>
              <button
                className={styles.closeBtn}
                onClick={() => onToggleSheet(activeSheet)}
                aria-label="Close panel"
              >
                &#215;
              </button>
            </div>
            <div className={styles.sheetBody}>
              {activeSheet === 'chat' && <ChatContent classNames={chatStyles} />}
              {activeSheet === 'room' && (
                <div className={styles.roomContent}>
                  <RoomSwitcherContent
                    activeRoom={activeRoom}
                    onSwitch={onSwitch}
                    classNames={roomStyles}
                  />
                </div>
              )}
              {activeSheet === 'avatar' && <AvatarSheetContent />}
            </div>
          </>
        )}
      </div>

      {/* Nav bar */}
      <div className={styles.navBar}>
        <button
          className={`${styles.navBtn} ${activeSheet === 'chat' ? styles.navBtnActive : ''}`}
          onClick={() => onToggleSheet('chat')}
          aria-label="Chat"
        >
          <ChatIcon />
        </button>
        <button
          className={`${styles.navBtn} ${activeSheet === 'room' ? styles.navBtnActive : ''}`}
          onClick={() => onToggleSheet('room')}
          aria-label="Rooms"
        >
          <RoomIcon />
        </button>
        <button
          className={`${styles.navBtn} ${activeSheet === 'avatar' ? styles.navBtnActive : ''}`}
          onClick={() => onToggleSheet('avatar')}
          aria-label="Avatar"
        >
          <AvatarIcon />
        </button>
      </div>
    </>
  );
}
