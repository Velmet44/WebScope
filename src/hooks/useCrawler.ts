import { useEffect, useRef, useCallback } from 'react';
import { useCrawlStore } from '../stores/crawlStore';
import type { Page, Link, LogEntry, CrawlStats, RobotsStatus, CrawlSettings } from '../types';

type WsEvent =
  | { type: 'log'; log: LogEntry }
  | { type: 'stats'; stats: CrawlStats }
  | { type: 'page'; page: Page }
  | { type: 'pageUpdate'; page: Page }
  | { type: 'link'; link: Link }
  | { type: 'robotsStatus'; status: RobotsStatus['status']; message: string }
  | { type: 'completed'; stats: CrawlStats };

export function useCrawlerWs(crawlerId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const store = useCrawlStore;
  const connectRef = useRef<(() => void) | null>(null);

  const connect = useCallback(() => {
    if (!crawlerId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isDev = import.meta.env.DEV;
    const wsUrl = isDev
      ? `${protocol}//${window.location.hostname}:3001/ws`
      : `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', crawlerId }));
    };

    ws.onmessage = (event) => {
      try {
        const data: WsEvent = JSON.parse(event.data);
        const state = store.getState();

        switch (data.type) {
          case 'log':
            state.addLog(data.log);
            break;
          case 'stats':
            state.updateStats(data.stats);
            break;
          case 'page':
            state.addPage(data.page);
            break;
          case 'pageUpdate':
            state.updatePage(data.page.id, data.page);
            break;
          case 'link':
            state.addLink(data.link);
            break;
          case 'robotsStatus':
            state.setRobotsStatus({ status: data.status, message: data.message });
            break;
          case 'completed':
            state.updateStats(data.stats);
            state.setPhase('completed');
            break;
        }
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      if (crawlerId) {
        reconnectRef.current = setTimeout(() => {
          connectRef.current?.();
        }, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [crawlerId, store]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  return wsRef;
}

export async function startCrawl(settings: CrawlSettings): Promise<string> {
  const res = await fetch('/api/crawl/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to start crawl');
  }

  const data = await res.json();
  return data.id;
}

export async function stopCrawl(crawlerId: string): Promise<void> {
  await fetch(`/api/crawl/${crawlerId}/stop`, { method: 'POST' });
}

export async function pauseCrawl(crawlerId: string): Promise<void> {
  await fetch(`/api/crawl/${crawlerId}/pause`, { method: 'POST' });
}

export async function resumeCrawl(crawlerId: string): Promise<void> {
  await fetch(`/api/crawl/${crawlerId}/resume`, { method: 'POST' });
}

export async function fetchPageContent(crawlerId: string, pageId: string): Promise<string | null> {
  const res = await fetch(`/api/crawl/${crawlerId}/fetch-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pageId }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.content;
}