import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRemotePlayersStore } from '../store.ts';
import type { RemotePlayer } from '../store.ts';

const LERP_FACTOR = 0.15;

const capsuleGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 8, 16);

function RemoteAvatar({ player }: { player: RemotePlayer }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = useRef(new THREE.Vector3(...player.position));
  const targetQuat = useRef(new THREE.Quaternion(...player.rotation));

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
  });

  return (
    <mesh
      ref={meshRef}
      geometry={capsuleGeometry}
      position={player.position}
    >
      <meshStandardMaterial color={player.avatarColor} />
    </mesh>
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
