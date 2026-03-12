import { useState } from 'react';
import { usePlayerStore } from '../store.ts';
import { AVATAR_MODELS } from '../models.ts';
import ModelPreview from './ModelPreview.tsx';
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
      <div className={styles.card} style={{ maxWidth: '520px' }}>
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
            autoFocus
          />
        </div>

        <div>
          <span className={styles.avatarLabel}>Choose avatar</span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginTop: '8px',
          }}>
            {AVATAR_MODELS.map((model) => (
              <ModelPreview
                key={model.key}
                modelDef={model}
                selected={selectedModel === model.key}
                onClick={() => setSelectedModel(model.key)}
              />
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
