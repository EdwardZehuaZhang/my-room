import { usePlayerStore, useRemotePlayersStore } from '../store.ts';
import styles from './ServerFullModal.module.css';

export default function ServerFullModal() {
  const serverFull = useRemotePlayersStore((s) => s.serverFull);
  const resetJoined = usePlayerStore((s) => s.resetJoined);
  const setServerFull = useRemotePlayersStore((s) => s.setServerFull);

  if (!serverFull) return null;

  const handleReturn = () => {
    setServerFull(false);
    resetJoined();
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>// connection error</p>
        <h2 className={styles.title}>Server is full</h2>
        <p className={styles.message}>Server is full (100/100). Try again later.</p>
        <button className={styles.returnBtn} onClick={handleReturn}>
          Return to lobby
        </button>
      </div>
    </div>
  );
}
