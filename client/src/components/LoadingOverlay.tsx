import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  progress: number;
  done: boolean;
}

export default function LoadingOverlay({ progress, done }: LoadingOverlayProps) {
  return (
    <div className={styles.overlay} data-done={done || undefined}>
      <div className={styles.content}>
        <span className={styles.label}>// scanning room…</span>
        <div className={styles.track}>
          <div
            className={styles.bar}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className={styles.pct}>{progress}%</span>
      </div>
    </div>
  );
}
