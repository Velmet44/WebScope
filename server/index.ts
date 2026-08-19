import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { setupRoutes } from './routes.js';
import { setupWebSocket } from './websocket.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const app = express();
const server = createServer(app);

app.use(express.json({ limit: '50mb' }));

setupRoutes(app);

const wss = new WebSocketServer({ server, path: '/ws' });
setupWebSocket(wss);

server.listen(PORT, () => {
  console.log(`WebScope server running on http://localhost:${PORT}`);
});
