import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRemotePlayersStore } from '../store.ts';
import type { RemotePlayer } from '../store.ts';
import styles from './Nametag.module.css';

const LERP_FACTOR = 0.15;
const FADE_NEAR = 0.1;
const FADE_FAR = 0.2;

const capsuleGeometry = new THREE.CapsuleGeometry(0.003, 0.008, 8, 16);

function RemoteAvatar({ player }: { player: RemotePlayer }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const nametagRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef(new THREE.Vector3(...player.position));
  const targetQuat = useRef(new THREE.Quaternion(...player.rotation));
  const { camera } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;

    // Update targets from store (latest network data)
    const current = useRemotePlayersStore.getState().players.get(player.id);
    if (current) {
      targetPos.current.set(...current.position);
      targetQuat.current.set(...current.rotation);
    }

    // Lerp position for smooth movement
    meshRef.current.position.lerp(targetPos.current, LERP_FACTOR);
    meshRef.current.quaternion.slerp(targetQuat.current, LERP_FACTOR);

    // Distance fade for nametag
    if (nametagRef.current) {
      const dist = camera.position.distanceTo(meshRef.current.position);
      const opacity = dist <= FADE_NEAR ? 1 : dist >= FADE_FAR ? 0 : 1 - (dist - FADE_NEAR) / (FADE_FAR - FADE_NEAR);
      nametagRef.current.style.opacity = String(opacity);
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={capsuleGeometry}
        position={player.position}
      >
        <meshStandardMaterial color={player.avatarColor} />
        <Html
          center
          distanceFactor={8}
          position={[0, 0.015, 0]}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[0, 0]}
        >
          <div ref={nametagRef} className={styles.nametag}>
            {player.name}
          </div>
        </Html>
      </mesh>
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

