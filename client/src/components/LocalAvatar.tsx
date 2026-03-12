import { useRef, useEffect, useMemo } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { usePlayerStore } from '../store.ts';
import styles from './Nametag.module.css';
import { chatFocusRef } from '../store.ts';

const MOVE_SPEED = 0.05;
const CAM_BEHIND = 0.12;
const CAM_ABOVE = 0.06;
const AVATAR_SCALE = 0.006;
const MODEL_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

useGLTF.preload(MODEL_URL);

interface LocalAvatarProps {
  localPosRef: MutableRefObject<[number, number, number]>;
  localRotRef: MutableRefObject<[number, number, number, number]>;
  joystickRef: MutableRefObject<{ x: number; y: number }>;
  joystickCamRef: MutableRefObject<{ x: number; y: number }>;
}

export default function LocalAvatar({
  localPosRef,
  localRotRef,
  joystickRef,
  joystickCamRef,
}: LocalAvatarProps) {
  const avatarColor = usePlayerStore((s) => s.avatarColor);
  const name = usePlayerStore((s) => s.name);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  const { scene, animations } = useGLTF(MODEL_URL);
  const clone = useMemo(() => cloneSkeleton(scene) as THREE.Group, [scene]);

  // useAnimations must target the groupRef that wraps the primitive
  const { actions } = useAnimations(animations, groupRef);

  const keys = useRef<Record<string, boolean>>({});
  const orbitRef = useRef({ theta: Math.PI, phi: 0.3 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const currentAction = useRef<string>('Idle');

  // Tint avatar color
  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          const m = mat as THREE.MeshStandardMaterial;
          if (m.color) m.color.set(avatarColor);
        });
      }
    });
  }, [avatarColor, clone]);

  // Start idle animation
  useEffect(() => {
    if (actions['Idle']) {
      actions['Idle'].reset().play();
      currentAction.current = 'Idle';
    }
  }, [actions]);

  // Keyboard listeners
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const onUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Mouse orbit
  useEffect(() => {
    const dom = gl.domElement;
    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      orbitRef.current.theta -= dx * 0.005;
      orbitRef.current.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, orbitRef.current.phi + dy * 0.005));
    };
    const onPointerUp = () => { isDragging.current = false; };
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
    if (!groupRef.current) return;
    const group = groupRef.current;

    let moveX = 0;
    let moveZ = 0;

    if (!chatFocusRef.current) {
      const k = keys.current;
      if (k['w'] || k['arrowup']) moveZ -= 1;
      if (k['s'] || k['arrowdown']) moveZ += 1;
      if (k['a'] || k['arrowleft']) moveX -= 1;
      if (k['d'] || k['arrowright']) moveX += 1;
    }

    moveX += joystickRef.current.x;
    moveZ -= joystickRef.current.y;

    if (Math.abs(joystickCamRef.current.x) > 0.05 || Math.abs(joystickCamRef.current.y) > 0.05) {
      orbitRef.current.theta -= joystickCamRef.current.x * 2.5 * delta;
      orbitRef.current.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, orbitRef.current.phi + joystickCamRef.current.y * 2.5 * delta));
    }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    const isMoving = len > 0.01;

    const camForward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitRef.current.theta - Math.PI);
    const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();

    if (isMoving) {
      const normX = moveX / Math.max(len, 1);
      const normZ = moveZ / Math.max(len, 1);
      const velocity = MOVE_SPEED * delta;
      group.position.x += (camRight.x * normX + camForward.x * normZ) * velocity;
      group.position.z += (camRight.z * normX + camForward.z * normZ) * velocity;

      const moveDir = new THREE.Vector3(
        camRight.x * normX + camForward.x * normZ, 0,
        camRight.z * normX + camForward.z * normZ
      ).normalize();
      const targetQuat = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().lookAt(new THREE.Vector3(), moveDir, new THREE.Vector3(0, 1, 0))
      );
      group.quaternion.slerp(targetQuat, 0.15);
    }

    group.position.y = Math.max(0, group.position.y);

    // Switch animation
    const nextAction = isMoving ? 'Walking' : 'Idle';
    if (nextAction !== currentAction.current && actions[nextAction]) {
      actions[currentAction.current]?.fadeOut(0.2);
      actions[nextAction]!.reset().fadeIn(0.2).play();
      currentAction.current = nextAction;
    }

    localPosRef.current = [group.position.x, group.position.y, group.position.z];
    localRotRef.current = [group.quaternion.x, group.quaternion.y, group.quaternion.z, group.quaternion.w];

    const { theta, phi } = orbitRef.current;
    const camX = group.position.x + CAM_BEHIND * Math.sin(theta) * Math.cos(phi);
    const camY = group.position.y + CAM_ABOVE + CAM_BEHIND * Math.sin(phi);
    const camZ = group.position.z + CAM_BEHIND * Math.cos(theta) * Math.cos(phi);
    camera.position.set(camX, camY, camZ);
    camera.lookAt(group.position.x, group.position.y + AVATAR_SCALE * 0.8, group.position.z);
  });

  return (
    <group ref={groupRef}>
      <primitive object={clone} scale={AVATAR_SCALE} />
      <Html center distanceFactor={0.15} position={[0, AVATAR_SCALE * 2.2, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[0, 0]}>
        <div className={styles.nametag}>{name}</div>
      </Html>
    </group>
  );
}

