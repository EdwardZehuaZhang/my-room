import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { useRemotePlayersStore } from '../store.ts';
import type { RemotePlayer } from '../store.ts';
import { getModel } from '../models.ts';

const LERP_FACTOR = 0.15;
const FADE_NEAR = 0.3;
const FADE_FAR = 0.6;

// Pre-allocated reusable objects
const _prevPos = new THREE.Vector3();

function RemoteAvatar({ player }: { player: RemotePlayer }) {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const targetPos = useRef(new THREE.Vector3(...player.position));
  const targetQuat = useRef(new THREE.Quaternion(...player.rotation));
  const { camera } = useThree();
  const modelDef = getModel(player.modelKey);

  const { scene, animations } = useGLTF(modelDef.url);
  const clone = useMemo(() => cloneSkeleton(scene) as THREE.Group, [scene]);
  const { actions } = useAnimations(animations, groupRef);
  const currentAction = useRef('');

  useMemo(() => {
    setTimeout(() => {
      const animKeys = Object.keys(actions);
      const idleName = (modelDef.idleAnim && actions[modelDef.idleAnim]) ? modelDef.idleAnim : animKeys[0];
      if (idleName && actions[idleName]) {
        actions[idleName]!.reset().play();
        currentAction.current = idleName;
      }
    }, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  useFrame(() => {
    if (!groupRef.current) return;
    const current = useRemotePlayersStore.getState().players.get(player.id);
    if (current) { targetPos.current.set(...current.position); targetQuat.current.set(...current.rotation); }

    _prevPos.copy(groupRef.current.position);
    groupRef.current.position.lerp(targetPos.current, LERP_FACTOR);
    groupRef.current.quaternion.slerp(targetQuat.current, LERP_FACTOR);

    const moved = groupRef.current.position.distanceTo(_prevPos) > 0.00001;
    const animKeys = Object.keys(actions);
    const walkName = (modelDef.walkAnim && actions[modelDef.walkAnim]) ? modelDef.walkAnim : (animKeys[1] ?? animKeys[0]);
    const idleName = (modelDef.idleAnim && actions[modelDef.idleAnim]) ? modelDef.idleAnim : animKeys[0];
    const nextAction = moved ? walkName : idleName;
    if (nextAction && nextAction !== currentAction.current && actions[nextAction]) {
      actions[currentAction.current]?.fadeOut(0.2);
      actions[nextAction]!.reset().fadeIn(0.2).play();
      currentAction.current = nextAction;
    }

    // Fade nametag by distance
    if (textRef.current) {
      const dist = camera.position.distanceTo(groupRef.current.position);
      const opacity = dist <= FADE_NEAR ? 1 : dist >= FADE_FAR ? 0 : 1 - (dist - FADE_NEAR) / (FADE_FAR - FADE_NEAR);
      (textRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <group ref={groupRef} position={player.position}>
      <primitive object={clone} scale={modelDef.scale} rotation={[0, modelDef.rotationY, 0]} />
      <Text
        ref={textRef}
        position={[0, modelDef.scale * 2.4, 0]}
        fontSize={modelDef.scale * 1.2}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={modelDef.scale * 0.08}
        outlineColor="black"
        material-transparent
        material-opacity={1}
      >
        {player.name}
      </Text>
    </group>
  );
}

export default function RemoteAvatars() {
  const players = useRemotePlayersStore((s) => s.players);
  return (
    <>{Array.from(players.values()).map((player) => <RemoteAvatar key={player.id} player={player} />)}</>
  );
}
