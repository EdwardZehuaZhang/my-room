import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useRemotePlayersStore } from '../store.ts';
import type { RemotePlayer } from '../store.ts';
import styles from './Nametag.module.css';

const LERP_FACTOR = 0.15;
const FADE_NEAR = 0.1;
const FADE_FAR = 0.2;
const AVATAR_SCALE = 0.003;
const MODEL_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

useGLTF.preload(MODEL_URL);

function RemoteAvatar({ player }: { player: RemotePlayer }) {
  const groupRef = useRef<THREE.Group>(null);
  const nametagRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef(new THREE.Vector3(...player.position));
  const targetQuat = useRef(new THREE.Quaternion(...player.rotation));
  const { camera } = useThree();

  const { scene, animations } = useGLTF(MODEL_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const { actions } = useAnimations(animations, groupRef);

  // Tint to player color
  useMemo(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if ((mat as THREE.MeshStandardMaterial).color) {
            (mat as THREE.MeshStandardMaterial).color.set(player.avatarColor);
          }
        });
      }
    });
  }, [clone, player.avatarColor]);

  // Start idle
  useMemo(() => { actions['Idle']?.play(); }, [actions]);

  useFrame(() => {
    if (!groupRef.current) return;

    const current = useRemotePlayersStore.getState().players.get(player.id);
    if (current) {
      targetPos.current.set(...current.position);
      targetQuat.current.set(...current.rotation);
    }

    const prevPos = groupRef.current.position.clone();
    groupRef.current.position.lerp(targetPos.current, LERP_FACTOR);
    groupRef.current.quaternion.slerp(targetQuat.current, LERP_FACTOR);

    const moved = groupRef.current.position.distanceTo(prevPos) > 0.00001;
    const nextAction = moved ? 'Walking' : 'Idle';
    if (actions[nextAction] && !actions[nextAction]!.isRunning()) {
      Object.values(actions).forEach((a) => a?.fadeOut(0.2));
      actions[nextAction]?.reset().fadeIn(0.2).play();
    }

    if (nametagRef.current) {
      const dist = camera.position.distanceTo(groupRef.current.position);
      const opacity = dist <= FADE_NEAR ? 1 : dist >= FADE_FAR ? 0 : 1 - (dist - FADE_NEAR) / (FADE_FAR - FADE_NEAR);
      nametagRef.current.style.opacity = String(opacity);
    }
  });

  return (
    <group ref={groupRef} position={player.position}>
      <primitive object={clone} scale={AVATAR_SCALE} />
      <Html center distanceFactor={0.08} position={[0, 0.015, 0]} style={{ pointerEvents: 'none' }} zIndexRange={[0, 0]}>
        <div ref={nametagRef} className={styles.nametag}>{player.name}</div>
      </Html>
    </group>
  );
}

export default function RemoteAvatars() {
  const players = useRemotePlayersStore((s) => s.players);
  return (
    <>
      {Array.from(players.values()).map((player) => (
        <RemoteAvatar key={player.id} player={player} />
      ))}
    </>
  );
}
