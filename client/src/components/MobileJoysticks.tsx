import { useEffect, useRef, MutableRefObject } from 'react';
import styles from './MobileJoysticks.module.css';

interface MobileJoysticksProps {
  joystickRef: MutableRefObject<{ x: number; y: number }>;
  joystickCamRef: MutableRefObject<{ x: number; y: number }>;
}

/**
 * Renders left (movement) and right (camera) joystick zones for mobile.
 * nipplejs is dynamically imported to avoid SSR/window issues.
 */
export default function MobileJoysticks({ joystickRef, joystickCamRef }: MobileJoysticksProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      // Dynamic import — nipplejs accesses window at module level
      const nipplejs = await import('nipplejs');

      if (!leftRef.current || !rightRef.current) return;

      const moveJoy = nipplejs.create({
        zone: leftRef.current,
        mode: 'static',
        position: { left: '80px', bottom: '80px' },
        color: 'rgba(180,255,80,0.35)',
        size: 120,
      });

      const camJoy = nipplejs.create({
        zone: rightRef.current,
        mode: 'static',
        position: { right: '80px', bottom: '80px' },
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

      camJoy.on('move', (_, data) => {
        if (data.vector) {
          joystickCamRef.current = { x: data.vector.x, y: data.vector.y };
        }
      });
      camJoy.on('end', () => {
        joystickCamRef.current = { x: 0, y: 0 };
      });

      cleanup = () => {
        moveJoy.destroy();
        camJoy.destroy();
      };
    })();

    return () => cleanup?.();
  }, [joystickRef, joystickCamRef]);

  return (
    <>
      <div ref={leftRef} className={styles.zone} data-side="left" />
      <div ref={rightRef} className={styles.zone} data-side="right" />
    </>
  );
}
