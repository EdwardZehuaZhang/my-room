import { ChatContent } from './ChatPanel.tsx';
import { RoomSwitcherContent } from './RoomSwitcher.tsx';
import styles from './MobileNavBar.module.css';
import chatStyles from './ChatPanel.module.css';
import roomStyles from './RoomSwitcher.module.css';

export type SheetId = 'chat' | 'room' | 'controls';

interface MobileNavBarProps {
  activeSheet: SheetId | null;
  onToggleSheet: (sheet: SheetId) => void;
  activeRoom: string;
  glitchedToggles: Record<string, boolean>;
  onSwitch: (key: string) => void;
  onToggleGlitched: (key: string) => void;
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

function ControlsIcon() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

/* ── Sheet titles ── */

const SHEET_TITLES: Record<SheetId, string> = {
  chat: '// chat',
  room: '// room',
  controls: '// controls',
};

/* ── Controls sheet content ── */

function ControlsSheet() {
  return (
    <ul className={styles.controlsList}>
      <li className={styles.controlRow}>
        <div className={styles.controlIcon}>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
        <div>
          <div className={styles.controlLabel}>Left Joystick</div>
          <div className={styles.controlDesc}>Move around the room</div>
        </div>
      </li>
      <li className={styles.controlRow}>
        <div className={styles.controlIcon}>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <polyline points="8 12 12 8 16 12" />
          </svg>
        </div>
        <div>
          <div className={styles.controlLabel}>Right Joystick</div>
          <div className={styles.controlDesc}>Rotate the camera</div>
        </div>
      </li>
      <li className={styles.controlRow}>
        <div className={styles.controlIcon}>
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <line x1="12" y1="7" x2="12" y2="17" />
            <polyline points="8 13 12 17 16 13" />
          </svg>
        </div>
        <div>
          <div className={styles.controlLabel}>Tap &amp; Drag</div>
          <div className={styles.controlDesc}>Orbit camera on the 3D scene</div>
        </div>
      </li>
    </ul>
  );
}

/* ── Main component ── */

export default function MobileNavBar({
  activeSheet,
  onToggleSheet,
  activeRoom,
  glitchedToggles,
  onSwitch,
  onToggleGlitched,
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
                    glitchedToggles={glitchedToggles}
                    onSwitch={onSwitch}
                    onToggleGlitched={onToggleGlitched}
                    classNames={roomStyles}
                  />
                </div>
              )}
              {activeSheet === 'controls' && <ControlsSheet />}
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
          className={`${styles.navBtn} ${activeSheet === 'controls' ? styles.navBtnActive : ''}`}
          onClick={() => onToggleSheet('controls')}
          aria-label="Controls"
        >
          <ControlsIcon />
        </button>
      </div>
    </>
  );
}
