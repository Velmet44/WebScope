import express from 'express';
import { createServer } from 'http';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { setupRoutes } from './routes.js';
import { setupWebSocket } from './websocket.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const app = express();
const server = createServer(app);

app.use(express.json({ limit: '50mb' }));

setupRoutes(app);

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distPath = resolve(__dirname, '../dist');

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api|\/ws).*/, (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
  console.log('Serving frontend from dist/');
}

const wss = new WebSocketServer({ server, path: '/ws' });
setupWebSocket(wss);

server.listen(PORT, () => {
  console.log(`WebScope server running on http://localhost:${PORT}`);
});
