import { useState } from 'react';
import { usePlayerStore } from '../store.ts';
import { AVATAR_MODELS } from '../models.ts';
import styles from './EntryScreen.module.css';

export default function EntryScreen() {
  const [name, setName] = useState('');
  const [selectedModel, setSelectedModel] = useState('robot');
  const setPlayer = usePlayerStore((s) => s.setPlayer);

  const canJoin = name.trim().length > 0;

  const handleJoin = () => {
    if (canJoin) setPlayer(name.trim(), selectedModel);
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <span className={styles.eyebrow}>{'// enter the room'}</span>
        <h1 className={styles.title}>my-room</h1>
        <p className={styles.subtitle}>A shared space. Up to 100 visitors at once.</p>

        <div>
          <label className={styles.fieldLabel}>Your name</label>
          <input
            className={styles.nameInput}
            type="text"
            maxLength={20}
            placeholder="Enter name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
        </div>

        <div>
          <span className={styles.avatarLabel}>Choose avatar</span>
          <div className={styles.avatarRow}>
            {AVATAR_MODELS.map((model) => (
              <div key={model.key}>
                <button
                  type="button"
                  className={`${styles.capsule} ${selectedModel === model.key ? styles.capsuleSelected : ''}`}
                  onClick={() => setSelectedModel(model.key)}
                  aria-label={model.name}
                  title={model.name}
                >
                  {selectedModel === model.key && <span className={styles.check}>&#10003;</span>}
                </button>
                <span className={styles.capsuleName}>{model.name}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={styles.joinBtn}
          disabled={!canJoin}
          onClick={handleJoin}
        >
          Enter space &#8594;
        </button>
      </div>
    </div>
  );
}
