import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import App from './App.tsx';

const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

function MobileBlock() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem',
      background: 'var(--bg-void)', padding: '2rem', textAlign: 'center',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lime)' }}>
        {'// desktop only'}
      </span>
      <h1 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '2rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
        my-room
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.6 }}>
        This experience is designed for desktop.<br />Please open it on your laptop or computer.
      </p>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isMobile ? <MobileBlock /> : <App />}
  </StrictMode>,
);
