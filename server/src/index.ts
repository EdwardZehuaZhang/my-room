import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[disconnect] ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
