import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import App from './App.tsx';

import { useState } from 'react';

const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

function Root() {
  const [proceed, setProceed] = useState(false);

  if (isMobile && !proceed) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.2rem',
        background: 'var(--bg-void)', padding: '2rem', textAlign: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lime)' }}>
          {'// heads up'}
        </span>
        <h1 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '2rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
          my-room
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.7 }}>
          This experience is optimized for desktop. Mobile support is in beta — things might look off or not work perfectly.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>
          For the best experience, open on a laptop or computer.
        </p>
        <button
          onClick={() => setProceed(true)}
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem 1.8rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-btn)',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Proceed anyway
        </button>
      </div>
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
