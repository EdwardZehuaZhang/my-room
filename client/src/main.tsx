import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import App from './App.tsx';
import { prefetchSplat } from './hooks/useSplatBlobUrl.ts';
import { ROOMS, GLITCHED_BASE } from './components/RoomSwitcher.tsx';

import { useState } from 'react';

const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

// Start fetching the default splat blob at module load time,
// before React bootstraps or the Canvas mounts.
// Mobile defaults to room1 (Midnight, smallest at 64MB), desktop to glitched.
prefetchSplat(isMobile ? ROOMS.find((r) => r.key === 'room1')!.splatUrl : GLITCHED_BASE.splatUrl);

function MobileGate({ onProceed }: { onProceed: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1.2rem',
      background: 'var(--bg-void)', padding: '2rem', textAlign: 'center',
      zIndex: 9999,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lime)' }}>
        {'// desktop only'}
      </span>
      <h1 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '2rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
        my-room
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.7 }}>
        This experience is <span style={{ color: 'var(--lime)' }}>optimized for desktop</span>. Mobile support is in beta — things might look off or not work perfectly.
      </p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.6 }}>
        For the best experience, open on a laptop or computer.
      </p>
      <button
        onClick={onProceed}
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

function Root() {
  const [proceed, setProceed] = useState(false);

  return (
    <>
      {isMobile && !proceed && <MobileGate onProceed={() => setProceed(true)} />}
      <App />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
