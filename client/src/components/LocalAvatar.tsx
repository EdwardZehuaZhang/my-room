import { useRef, useEffect, useMemo } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { usePlayerStore, chatFocusRef } from '../store.ts';
import { getModel } from '../models.ts';

// All avatars will be normalized to this world-unit height
const TARGET_HEIGHT = 0.1;
const CAM_BEHIND = 0.8;
const CAM_ABOVE = 0.35;
const MOVE_SPEED = 0.17;

// Pre-allocated reusable objects
const _camForward = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _mat = new THREE.Matrix4();
const _targetQuat = new THREE.Quaternion();
const _origin = new THREE.Vector3();

interface LocalAvatarProps {
  localPosRef: MutableRefObject<[number, number, number]>;
  localRotRef: MutableRefObject<[number, number, number, number]>;
  joystickRef: MutableRefObject<{ x: number; y: number }>;
  joystickCamRef: MutableRefObject<{ x: number; y: number }>;
  mobileFlyRef: MutableRefObject<{ up: boolean; down: boolean }>;
}

export default function LocalAvatar({ localPosRef, localRotRef, joystickRef, joystickCamRef, mobileFlyRef }: LocalAvatarProps) {
  const name = usePlayerStore((s) => s.name);
  const modelKey = usePlayerStore((s) => s.modelKey);
  const avatarScale = usePlayerStore((s) => s.avatarScale);
  const firstPerson = usePlayerStore((s) => s.firstPerson);
  const modelDef = getModel(modelKey);
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  const { scene, animations } = useGLTF(modelDef.url);
  const clone = useMemo(() => cloneSkeleton(scene) as THREE.Group, [scene]);
  const { actions } = useAnimations(animations, groupRef);

  // Normalize using known heightHint so all models match in-world
  const normalizedScale = (TARGET_HEIGHT / modelDef.heightHint) * avatarScale;
  const scaledHeight = TARGET_HEIGHT * avatarScale;
  const scaledCamBehind = CAM_BEHIND * avatarScale;
  const scaledCamAbove = CAM_ABOVE * avatarScale;

  const keys = useRef<Record<string, boolean>>({});
  const orbitRef = useRef({ theta: Math.PI, phi: 0.3 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const currentAction = useRef<string>('');

  const resolveAnim = (preferred: string, fallbackIndex: number): string | null => {
    if (preferred && actions[preferred]) return preferred;
    const k = Object.keys(actions);
    return k[fallbackIndex] ?? k[0] ?? null;
  };

  useEffect(() => {
    const idleName = resolveAnim(modelDef.idleAnim, 0);
    if (idleName && actions[idleName]) {
      actions[idleName]!.reset().play();
      currentAction.current = idleName;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, modelDef.key]);

  useEffect(() => {
    const gameKeys = new Set([
      'KeyW','KeyA','KeyS','KeyD',
      'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
      'Space','ShiftLeft','ShiftRight','Tab',
    ]);
    const onDown = (e: KeyboardEvent) => {
      if (gameKeys.has(e.code)) e.preventDefault();
      keys.current[e.code] = true;
    };
    const onUp = (e: KeyboardEvent) => {
      if (gameKeys.has(e.code)) e.preventDefault();
      keys.current[e.code] = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, []);

  useEffect(() => {
    const dom = gl.domElement;
    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) { isDragging.current = true; lastMouse.current = { x: e.clientX, y: e.clientY }; }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      orbitRef.current.theta -= (e.clientX - lastMouse.current.x) * 0.005;
      orbitRef.current.phi = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, orbitRef.current.phi + (e.clientY - lastMouse.current.y) * 0.005));
      lastMouse.current = { x: e.clientX, y: e.clientY };
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

    let moveX = 0; let moveZ = 0; let moveY = 0;
    if (!chatFocusRef.current) {
      const k = keys.current;
      if (k['KeyW'] || k['ArrowUp']) moveZ -= 1;
      if (k['KeyS'] || k['ArrowDown']) moveZ += 1;
      if (k['KeyA'] || k['ArrowLeft']) moveX -= 1;
      if (k['KeyD'] || k['ArrowRight']) moveX += 1;
      if (k['Space']) moveY += 1;
      if (k['ShiftLeft'] || k['ShiftRight']) moveY -= 1;
    }
    moveX += joystickRef.current.x;
    moveZ -= joystickRef.current.y;
    if (mobileFlyRef.current.up) moveY += 1;
    if (mobileFlyRef.current.down) moveY -= 1;

    if (Math.abs(joystickCamRef.current.x) > 0.05 || Math.abs(joystickCamRef.current.y) > 0.05) {
      orbitRef.current.theta -= joystickCamRef.current.x * 2.5 * delta;
      orbitRef.current.phi = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, orbitRef.current.phi + joystickCamRef.current.y * 2.5 * delta));
    }

    let fast = false;
    if (!chatFocusRef.current) {
      fast = !!keys.current['Tab'];
    }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    const isMovingH = len > 0.01;
    const isMoving = isMovingH || Math.abs(moveY) > 0.01;
    const speedMul = fast ? 4 : 1;

    _camForward.set(0, 0, -1).applyAxisAngle(_up, orbitRef.current.theta - Math.PI);
    _camRight.crossVectors(_up, _camForward).normalize();

    if (isMovingH) {
      const normX = moveX / Math.max(len, 1);
      const normZ = moveZ / Math.max(len, 1);
      const v = MOVE_SPEED * speedMul * delta;
      group.position.x += (_camRight.x * normX + _camForward.x * normZ) * v;
      group.position.z += (_camRight.z * normX + _camForward.z * normZ) * v;
      _moveDir.set(_camRight.x * normX + _camForward.x * normZ, 0, _camRight.z * normX + _camForward.z * normZ).normalize();
      _targetQuat.setFromRotationMatrix(_mat.lookAt(_origin, _moveDir, _up));
      group.quaternion.slerp(_targetQuat, 0.15);
    }
    group.position.y += moveY * MOVE_SPEED * speedMul * delta;
    group.position.y = Math.max(0, group.position.y);

    const walkName = resolveAnim(modelDef.walkAnim, 1);
    const idleName = resolveAnim(modelDef.idleAnim, 0);
    const nextAction = isMoving ? walkName : idleName;
    if (nextAction && nextAction !== currentAction.current && actions[nextAction]) {
      actions[currentAction.current]?.fadeOut(0.2);
      actions[nextAction]!.reset().fadeIn(0.2).play();
      currentAction.current = nextAction;
    }

    localPosRef.current = [group.position.x, group.position.y, group.position.z];
    localRotRef.current = [group.quaternion.x, group.quaternion.y, group.quaternion.z, group.quaternion.w];

    // Hide model in first-person mode
    if (modelRef.current) modelRef.current.visible = !firstPerson;

    const { theta, phi } = orbitRef.current;
    if (firstPerson) {
      // Eye-level camera; negate phi so dragging up looks up
      const fpPhi = -phi;
      const eyeY = group.position.y + scaledHeight * 0.85;
      camera.position.set(group.position.x, eyeY, group.position.z);
      camera.lookAt(
        group.position.x - Math.sin(theta) * Math.cos(fpPhi),
        eyeY + Math.sin(fpPhi),
        group.position.z - Math.cos(theta) * Math.cos(fpPhi),
      );
    } else {
      camera.position.set(
        group.position.x + scaledCamBehind * Math.sin(theta) * Math.cos(phi),
        group.position.y + scaledCamAbove + scaledCamBehind * Math.sin(phi),
        group.position.z + scaledCamBehind * Math.cos(theta) * Math.cos(phi),
      );
      camera.lookAt(group.position.x, group.position.y + scaledHeight * 0.5, group.position.z);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={modelRef}>
        <primitive object={clone} scale={normalizedScale} rotation={[0, modelDef.rotationY, 0]} />
      </group>
      <Text
        position={[0, scaledHeight * 1.3, 0]}
        fontSize={scaledHeight * 0.6}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={scaledHeight * 0.04}
        outlineColor="black"
      >
        {name}
      </Text>
    </group>
  );
}







