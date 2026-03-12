import { useState } from 'react';
import { usePlayerStore } from '../store.ts';
import styles from './EntryScreen.module.css';

const AVATARS = [
  { color: '#FF6B6B', label: 'Coral' },
  { color: '#4ECDC4', label: 'Teal' },
  { color: '#45B7D1', label: 'Sky' },
  { color: '#96CEB4', label: 'Sage' },
] as const;

export default function EntryScreen() {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const setPlayer = usePlayerStore((s) => s.setPlayer);

  const canJoin = name.trim().length > 0 && selectedColor !== '';

  const handleJoin = () => {
    if (canJoin) {
      setPlayer(name.trim(), selectedColor);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <span className={styles.eyebrow}>{'// enter the room'}</span>
        <h1 className={styles.title}>my-room</h1>
        <p className={styles.subtitle}>
          A shared space. Up to 100 visitors at once.
        </p>

        {/* Name input */}
        <div>
          <label className={styles.fieldLabel}>Your name</label>
          <input
            className={styles.nameInput}
            type="text"
            maxLength={20}
            placeholder="Enter name…"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Avatar picker */}
        <div>
          <span className={styles.avatarLabel}>Choose avatar</span>
          <div className={styles.avatarRow}>
            {AVATARS.map(({ color, label }) => (
              <div key={color}>
                <button
                  type="button"
                  className={`${styles.capsule} ${selectedColor === color ? styles.capsuleSelected : ''}`}
                  style={{ '--av-color': color } as React.CSSProperties}
                  onClick={() => setSelectedColor(color)}
                  aria-label={label}
                >
                  {selectedColor === color && (
                    <span className={styles.check}>✓</span>
                  )}
                </button>
                <span className={styles.capsuleName}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Join button */}
        <button
          type="button"
          className={styles.joinBtn}
          disabled={!canJoin}
          onClick={handleJoin}
        >
          Enter space →
        </button>
      </div>
    </div>
  );
}
