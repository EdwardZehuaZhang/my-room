import styles from './ControlsPanel.module.css';

const CONTROLS = [
  { key: 'W A S D', label: 'Move' },
  { key: 'Space', label: 'Fly up' },
  { key: 'Shift', label: 'Fly down' },
  { key: 'Tab', label: 'Speed boost' },
  { key: 'Mouse', label: 'Rotate camera' },
];

export default function ControlsPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.title}>Controls</div>
      <ul className={styles.list}>
        {CONTROLS.map((c) => (
          <li key={c.key} className={styles.row}>
            <span className={styles.key}>{c.key}</span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
