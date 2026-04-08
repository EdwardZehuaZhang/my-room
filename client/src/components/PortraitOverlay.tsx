import styles from './PortraitOverlay.module.css';

export default function PortraitOverlay() {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <span className={styles.eyebrow}>{'// rotate device'}</span>
        <svg className={styles.icon} viewBox="0 0 64 64">
          <rect x="18" y="8" width="28" height="48" rx="4" />
          <rect x="22" y="14" width="20" height="36" rx="1" />
          <path d="M10 40 A 24 24 0 0 1 10 24" />
          <polyline points="6 24 10 24 10 28" />
        </svg>
        <p className={styles.message}>
          Please rotate your device<br />to landscape mode
        </p>
      </div>
    </div>
  );
}
