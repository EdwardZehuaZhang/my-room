import { useRef, useEffect, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStore } from '../store.ts';
import { chatFocusRef } from '../store.ts';

const MOVE_SPEED = 5;
const CAM_BEHIND = 4;
const CAM_ABOVE = 2;
const BOB_IDLE_AMP = 0.06;
const BOB_IDLE_FREQ = 1.1;
const BOB_WALK_AMP = 0.1;
const BOB_WALK_FREQ = 2.4;
const LEAN_ANGLE = 0.08; // radians

const capsuleGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 8, 16);

interface LocalAvatarProps {
  localPosRef: MutableRefObject<[number, number, number]>;
  localRotRef: MutableRefObject<[number, number, number, number]>;
  /** Mobile joystick movement vector (x, y) normalised -1..1 */
  joystickRef: MutableRefObject<{ x: number; y: number }>;
  /** Mobile joystick camera vector (x, y) normalised -1..1 */
  joystickCamRef: MutableRefObject<{ x: number; y: number }>;
}

export default function LocalAvatar({
  localPosRef,
  localRotRef,
  joystickRef,
  joystickCamRef,
}: LocalAvatarProps) {
  const avatarColor = usePlayerStore((s) => s.avatarColor);
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();

  // WASD key state
  const keys = useRef<Record<string, boolean>>({});

  // Camera orbit angles (spherical around avatar)
  const orbitRef = useRef({ theta: Math.PI, phi: 0.4 }); // behind + above
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  // Keyboard listeners
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const onUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Mouse orbit listeners (on the canvas dom element)
  useEffect(() => {
    const dom = gl.domElement;
    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      orbitRef.current.theta -= dx * 0.005;
      orbitRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, orbitRef.current.phi + dy * 0.005),
      );
    };
    const onPointerUp = () => {
      isDragging.current = false;
    };
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('pointerleave', onPointerUp);
    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointerleave', onPointerUp);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    timeRef.current += delta;

    // ---- Movement input ----
    let moveX = 0;
    let moveZ = 0;

    // WASD (skip when chat focused)
    if (!chatFocusRef.current) {
      const k = keys.current;
      if (k['w'] || k['arrowup']) moveZ -= 1;
      if (k['s'] || k['arrowdown']) moveZ += 1;
      if (k['a'] || k['arrowleft']) moveX -= 1;
      if (k['d'] || k['arrowright']) moveX += 1;
    }

    // Mobile joystick input
    moveX += joystickRef.current.x;
    moveZ -= joystickRef.current.y; // joystick up = -z (forward)

    // Mobile camera joystick
    if (Math.abs(joystickCamRef.current.x) > 0.05 || Math.abs(joystickCamRef.current.y) > 0.05) {
      orbitRef.current.theta -= joystickCamRef.current.x * 2.5 * delta;
      orbitRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2 - 0.05, orbitRef.current.phi + joystickCamRef.current.y * 2.5 * delta),
      );
    }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    const isMoving = len > 0.01;

    // Movement relative to camera orientation (Y-axis ignored)
    const camForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      orbitRef.current.theta - Math.PI,
    );
    const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();

    if (isMoving) {
      const normX = moveX / Math.max(len, 1);
      const normZ = moveZ / Math.max(len, 1);
      const velocity = MOVE_SPEED * delta;

      mesh.position.x += (camRight.x * normX + camForward.x * normZ) * velocity;
      mesh.position.z += (camRight.z * normX + camForward.z * normZ) * velocity;

      // Face movement direction
      const moveDir = new THREE.Vector3(
        camRight.x * normX + camForward.x * normZ,
        0,
        camRight.z * normX + camForward.z * normZ,
      ).normalize();
      const targetQuat = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(new THREE.Vector3(), moveDir, new THREE.Vector3(0, 1, 0)),
      );
      mesh.quaternion.slerp(targetQuat, 0.15);
    }

    // Y clamp
    mesh.position.y = Math.max(0, mesh.position.y);

    // ---- Procedural animations ----
    const t = timeRef.current;
    if (isMoving) {
      // Walk: faster bob + slight forward lean
      mesh.position.y = Math.max(0, Math.sin(t * BOB_WALK_FREQ * Math.PI * 2) * BOB_WALK_AMP);
      mesh.rotation.x = LEAN_ANGLE;
    } else {
      // Idle: gentle bob
      mesh.position.y = Math.max(0, Math.sin(t * BOB_IDLE_FREQ * Math.PI * 2) * BOB_IDLE_AMP);
      mesh.rotation.x = 0;
    }

    // ---- Sync to network refs ----
    localPosRef.current = [mesh.position.x, mesh.position.y, mesh.position.z];
    localRotRef.current = [
      mesh.quaternion.x,
      mesh.quaternion.y,
      mesh.quaternion.z,
      mesh.quaternion.w,
    ];

    // ---- Camera follow ----
    const { theta, phi } = orbitRef.current;
    const camX = mesh.position.x + CAM_BEHIND * Math.sin(theta) * Math.cos(phi);
    const camY = mesh.position.y + CAM_ABOVE + CAM_BEHIND * Math.sin(phi);
    const camZ = mesh.position.z + CAM_BEHIND * Math.cos(theta) * Math.cos(phi);
    camera.position.set(camX, camY, camZ);
    camera.lookAt(mesh.position.x, mesh.position.y + 0.5, mesh.position.z);
  });

  return (
    <mesh ref={meshRef} geometry={capsuleGeometry}>
      <meshStandardMaterial color={avatarColor} />
    </mesh>
  );
}
