import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { usePlayerStore, useRemotePlayersStore } from '../store.ts';
import type { RemotePlayer } from '../store.ts';

const SERVER_URL = import.meta.env.VITE_SERVER_URL as string | undefined;

/**
 * Connects to the Socket.IO server, emits player_join on mount,
 * emits player_move at 10 Hz, and listens for remote player events.
 */
export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Current local position/rotation — written from useFrame, read by interval */
  const localPosRef = useRef<[number, number, number]>([0, 0, 0]);
  const localRotRef = useRef<[number, number, number, number]>([0, 0, 0, 1]);

  const name = usePlayerStore((s) => s.name);
  const avatarColor = usePlayerStore((s) => s.avatarColor);
  const addPlayer = useRemotePlayersStore((s) => s.addPlayer);
  const removePlayer = useRemotePlayersStore((s) => s.removePlayer);
  const updatePlayer = useRemotePlayersStore((s) => s.updatePlayer);
  const setServerFull = useRemotePlayersStore((s) => s.setServerFull);
  const clearPlayers = useRemotePlayersStore((s) => s.clearPlayers);

  useEffect(() => {
    if (!SERVER_URL) return;

    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      // (Re-)emit join on every connect/reconnect
      socket.emit('player_join', { name, avatarColor });
    });

    socket.on('player_joined', (player: RemotePlayer) => {
      addPlayer(player);
    });

    socket.on('player_moved', (data: { id: string; position: [number, number, number]; rotation: [number, number, number, number] }) => {
      updatePlayer(data.id, data.position, data.rotation);
    });

    socket.on('player_left', (data: { id: string }) => {
      removePlayer(data.id);
    });

    socket.on('server_full', () => {
      setServerFull(true);
    });

    // Emit player_move at 10 Hz
    intervalRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('player_move', {
          position: localPosRef.current,
          rotation: localRotRef.current,
        });
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      socket.disconnect();
      socketRef.current = null;
      clearPlayers();
    };
    // name/avatarColor are stable after join; store actions are stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { socketRef, localPosRef, localRotRef };
}
