import { useRef, useEffect, useMemo } from 'react';
import type { MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { usePlayerStore, chatFocusRef } from '../store.ts';
import { getModel } from '../models.ts';

// All avatars will be normalized to this world-unit height
const TARGET_HEIGHT = 0.012;
const CAM_BEHIND = 0.12;
const CAM_ABOVE = 0.06;
const MOVE_SPEED = 0.05;

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
}

export default function LocalAvatar({ localPosRef, localRotRef, joystickRef, joystickCamRef }: LocalAvatarProps) {
  const name = usePlayerStore((s) => s.name);
  const modelKey = usePlayerStore((s) => s.modelKey);
  const modelDef = getModel(modelKey);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  const { scene, animations } = useGLTF(modelDef.url);
  const clone = useMemo(() => cloneSkeleton(scene) as THREE.Group, [scene]);
  const { actions } = useAnimations(animations, groupRef);

  // Normalize using known heightHint so all models match in-world
  const normalizedScale = TARGET_HEIGHT / modelDef.heightHint;

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
    const onDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const onUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
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

    let moveX = 0; let moveZ = 0;
    let sprint = false;
    if (!chatFocusRef.current) {
      const k = keys.current;
      sprint = !!k['shift'];
      if (k['w'] || k['arrowup']) moveZ -= 1;
      if (k['s'] || k['arrowdown']) moveZ += 1;
      if (k['a'] || k['arrowleft']) moveX -= 1;
      if (k['d'] || k['arrowright']) moveX += 1;
    }
    moveX += joystickRef.current.x;
    moveZ -= joystickRef.current.y;

    if (Math.abs(joystickCamRef.current.x) > 0.05 || Math.abs(joystickCamRef.current.y) > 0.05) {
      orbitRef.current.theta -= joystickCamRef.current.x * 2.5 * delta;
      orbitRef.current.phi = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, orbitRef.current.phi + joystickCamRef.current.y * 2.5 * delta));
    }

    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    const isMoving = len > 0.01;

    _camForward.set(0, 0, -1).applyAxisAngle(_up, orbitRef.current.theta - Math.PI);
    _camRight.crossVectors(_camForward, _up).normalize();

    if (isMoving) {
      const normX = moveX / Math.max(len, 1);
      const normZ = moveZ / Math.max(len, 1);
      const v = MOVE_SPEED * (sprint ? 5 : 1) * delta;
      group.position.x += (_camRight.x * normX + _camForward.x * normZ) * v;
      group.position.z += (_camRight.z * normX + _camForward.z * normZ) * v;
      _moveDir.set(_camRight.x * normX + _camForward.x * normZ, 0, _camRight.z * normX + _camForward.z * normZ).normalize();
      _targetQuat.setFromRotationMatrix(_mat.lookAt(_origin, _moveDir, _up));
      group.quaternion.slerp(_targetQuat, 0.15);
    }
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

    const { theta, phi } = orbitRef.current;
    camera.position.set(
      group.position.x + CAM_BEHIND * Math.sin(theta) * Math.cos(phi),
      group.position.y + CAM_ABOVE + CAM_BEHIND * Math.sin(phi),
      group.position.z + CAM_BEHIND * Math.cos(theta) * Math.cos(phi),
    );
    camera.lookAt(group.position.x, group.position.y + TARGET_HEIGHT * 0.5, group.position.z);
  });

  return (
    <group ref={groupRef}>
      <primitive object={clone} scale={normalizedScale} rotation={[0, modelDef.rotationY, 0]} />
      <Text
        position={[0, TARGET_HEIGHT * 1.3, 0]}
        fontSize={TARGET_HEIGHT * 0.6}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={TARGET_HEIGHT * 0.04}
        outlineColor="black"
      >
        {name}
      </Text>
    </group>
  );
}






