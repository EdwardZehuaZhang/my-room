import { useEffect, useRef, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import styles from './MobileJoysticks.module.css';

interface MobileJoysticksProps {
  joystickRef: MutableRefObject<{ x: number; y: number }>;
  joystickCamRef: MutableRefObject<{ x: number; y: number }>;
  mobileFlyRef: MutableRefObject<{ up: boolean; down: boolean }>;
}

/**
 * Mobile controls:
 * - Left zone: nipplejs movement joystick
 * - Right zone: fly up / fly down buttons
 * - Camera rotation is handled by dragging on the 3D canvas directly
 */
export default function MobileJoysticks({ joystickRef, joystickCamRef, mobileFlyRef }: MobileJoysticksProps) {
  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      const nip = await import('nipplejs');
      const nipplejs = nip.default || nip;

      if (!leftRef.current) return;

      const moveJoy = nipplejs.create({
        zone: leftRef.current,
        mode: 'static',
        position: { left: '80px', bottom: '80px' },
        color: 'rgba(180,255,80,0.35)',
        size: 120,
      });

      moveJoy.on('move', (_, data) => {
        if (data.vector) {
          joystickRef.current = { x: data.vector.x, y: data.vector.y };
        }
      });
      moveJoy.on('end', () => {
        joystickRef.current = { x: 0, y: 0 };
      });

      // Zero out camera joystick since camera is now drag-based
      joystickCamRef.current = { x: 0, y: 0 };

      cleanup = () => {
        moveJoy.destroy();
      };
    })();

    return () => cleanup?.();
  }, [joystickRef, joystickCamRef]);

  const handleFlyUp = useCallback((pressed: boolean) => {
    mobileFlyRef.current = { ...mobileFlyRef.current, up: pressed };
  }, [mobileFlyRef]);

  const handleFlyDown = useCallback((pressed: boolean) => {
    mobileFlyRef.current = { ...mobileFlyRef.current, down: pressed };
  }, [mobileFlyRef]);

  return (
    <>
      <div ref={leftRef} className={styles.zone} data-side="left" />
      <div className={styles.flyButtons}>
        <button
          className={styles.flyBtn}
          onTouchStart={() => handleFlyUp(true)}
          onTouchEnd={() => handleFlyUp(false)}
          onTouchCancel={() => handleFlyUp(false)}
          aria-label="Fly up"
        >
          <svg viewBox="0 0 24 24" className={styles.flyIcon}>
            <polyline points="6 15 12 9 18 15" />
          </svg>
        </button>
        <button
          className={styles.flyBtn}
          onTouchStart={() => handleFlyDown(true)}
          onTouchEnd={() => handleFlyDown(false)}
          onTouchCancel={() => handleFlyDown(false)}
          aria-label="Fly down"
        >
          <svg viewBox="0 0 24 24" className={styles.flyIcon}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </>
  );
}
