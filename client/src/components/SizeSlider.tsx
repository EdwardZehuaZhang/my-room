import { usePlayerStore } from '../store.ts';
import styles from './SizeSlider.module.css';

export default function SizeSlider() {
  const scale = usePlayerStore((s) => s.avatarScale);
  const setScale = usePlayerStore((s) => s.setAvatarScale);
  const firstPerson = usePlayerStore((s) => s.firstPerson);
  const toggleFirstPerson = usePlayerStore((s) => s.toggleFirstPerson);

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <span className={styles.label}>Camera</span>
        <div className={styles.toggleGroup}>
          <button
            className={`${styles.toggleBtn} ${!firstPerson ? styles.toggleBtnActive : ''}`}
            onClick={() => firstPerson && toggleFirstPerson()}
          >
            3rd
          </button>
          <button
            className={`${styles.toggleBtn} ${firstPerson ? styles.toggleBtnActive : ''}`}
            onClick={() => !firstPerson && toggleFirstPerson()}
          >
            1st
          </button>
        </div>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Size</span>
        <button className={styles.btn} disabled={scale <= 1} onClick={() => setScale(scale - 1)}>
          &minus;
        </button>
        <span className={styles.value}>{scale}</span>
        <button className={styles.btn} disabled={scale >= 10} onClick={() => setScale(scale + 1)}>
          +
        </button>
      </div>
    </div>
  );
}
