import { ChatContent } from './ChatPanel.tsx';
import { RoomSwitcherContent } from './RoomSwitcher.tsx';
import styles from './MobileNavBar.module.css';
import chatStyles from './ChatPanel.module.css';
import roomStyles from './RoomSwitcher.module.css';

export type SheetId = 'chat' | 'room';

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

/* ── Sheet titles ── */

const SHEET_TITLES: Record<SheetId, string> = {
  chat: '// chat',
  room: '// room',
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
      </div>
    </>
  );
}
