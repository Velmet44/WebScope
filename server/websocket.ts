import type { WebSocketServer, WebSocket } from 'ws';
import { getCrawler } from './routes.js';

const clients = new Map<string, Set<WebSocket>>();
const crawlerClients = new Map<WebSocket, string>();

export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'subscribe' && msg.crawlerId) {
          const crawlerId = msg.crawlerId as string;
          crawlerClients.set(ws, crawlerId);

          if (!clients.has(crawlerId)) {
            clients.set(crawlerId, new Set());
          }
          clients.get(crawlerId)!.add(ws);

          const crawler = getCrawler(crawlerId);
          if (crawler) {
            ws.send(JSON.stringify({ type: 'state', state: crawler.getSnapshot() }));
          } else {
            ws.send(JSON.stringify({ type: 'crawlerNotFound', crawlerId }));
          }
        }
      } catch {
        // ignore
      }
    });

    ws.on('close', () => {
      const crawlerId = crawlerClients.get(ws);
      if (crawlerId) {
        clients.get(crawlerId)?.delete(ws);
        crawlerClients.delete(ws);
      }
    });
  });
}

export function broadcastToCrawler(crawlerId: string, event: Record<string, unknown>) {
  const set = clients.get(crawlerId);
  if (!set) return;

  const data = JSON.stringify(event);
  for (const ws of set) {
    if (ws.readyState === 1) {
      ws.send(data);
    }
  }
}
