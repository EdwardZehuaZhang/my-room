import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { randomUUID } from 'crypto';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
const MAX_USERS = parseInt(process.env['MAX_USERS'] ?? '100', 10);

interface PlayerState {
  id: string;
  name: string;
  avatarColor: string;
  position: [number, number, number];
  rotation: [number, number, number, number];
}

/** In-memory player state — no database, no disk writes */
const players = new Map<string, PlayerState>();

/** Throttle tracking: last emit timestamp per socket */
const lastEmitTime = new Map<string, number>();
const THROTTLE_MS = 100; // 10 Hz

app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

io.on('connection', (socket) => {
  // Enforce MAX_USERS
  if (players.size >= MAX_USERS) {
    socket.emit('server_full');
    socket.disconnect(true);
    return;
  }

  const playerId = randomUUID();
  console.log(`[connect] ${socket.id} → ${playerId}`);

  socket.on('player_join', (data: { name: string; avatarColor: string }) => {
    const player: PlayerState = {
      id: playerId,
      name: data.name,
      avatarColor: data.avatarColor,
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
    };

    players.set(socket.id, player);

    // Send existing players to the new joiner
    for (const [, existing] of players) {
      if (existing.id !== playerId) {
        socket.emit('player_joined', existing);
      }
    }

    // Broadcast new player to everyone else
    socket.broadcast.emit('player_joined', player);
  });

  socket.on('player_move', (data: { position: [number, number, number]; rotation: [number, number, number, number] }) => {
    const now = Date.now();
    const last = lastEmitTime.get(socket.id) ?? 0;

    // Throttle to 10 Hz
    if (now - last < THROTTLE_MS) {
      return;
    }
    lastEmitTime.set(socket.id, now);

    const player = players.get(socket.id);
    if (!player) return;

    player.position = data.position;
    player.rotation = data.rotation;

    // Rebroadcast to all others (NOT sender)
    socket.broadcast.emit('player_moved', {
      id: player.id,
      position: data.position,
      rotation: data.rotation,
    });
  });

  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      socket.broadcast.emit('player_left', { id: player.id });
      players.delete(socket.id);
    }
    lastEmitTime.delete(socket.id);
    console.log(`[disconnect] ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
