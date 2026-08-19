import type { Express } from 'express';
import { CrawlerEngine } from './crawler.js';
import type { CrawlSettings } from '../src/types/index.js';

const activeCrawlers = new Map<string, CrawlerEngine>();

export function getCrawler(id: string): CrawlerEngine | undefined {
  return activeCrawlers.get(id);
}

export function setupRoutes(app: Express) {
  app.post('/api/crawl/start', (req, res) => {
    const settings: CrawlSettings = req.body;

    if (!settings.startUrl) {
      res.status(400).json({ error: 'startUrl is required' });
      return;
    }

    try {
      new URL(settings.startUrl);
    } catch {
      res.status(400).json({ error: 'Invalid URL' });
      return;
    }

    const id = crypto.randomUUID();
    const crawler = new CrawlerEngine(id, settings);
    activeCrawlers.set(id, crawler);

    crawler.start();

    res.json({ id, status: 'started' });
  });

  app.post('/api/crawl/:id/stop', (req, res) => {
    const crawler = activeCrawlers.get(req.params.id);
    if (!crawler) {
      res.status(404).json({ error: 'Crawler not found' });
      return;
    }
    crawler.stop();
    res.json({ status: 'stopped' });
  });

  app.post('/api/crawl/:id/pause', (req, res) => {
    const crawler = activeCrawlers.get(req.params.id);
    if (!crawler) {
      res.status(404).json({ error: 'Crawler not found' });
      return;
    }
    crawler.pause();
    res.json({ status: 'paused' });
  });

  app.post('/api/crawl/:id/resume', (req, res) => {
    const crawler = activeCrawlers.get(req.params.id);
    if (!crawler) {
      res.status(404).json({ error: 'Crawler not found' });
      return;
    }
    crawler.resume();
    res.json({ status: 'resumed' });
  });

  app.get('/api/crawl/:id/status', (req, res) => {
    const crawler = activeCrawlers.get(req.params.id);
    if (!crawler) {
      res.status(404).json({ error: 'Crawler not found' });
      return;
    }
    res.json(crawler.getState());
  });

  app.post('/api/crawl/:id/fetch-content', (req, res) => {
    const crawler = activeCrawlers.get(req.params.id);
    if (!crawler) {
      res.status(404).json({ error: 'Crawler not found' });
      return;
    }
    const { pageId } = req.body;
    crawler.fetchPageContent(pageId).then((content) => {
      res.json({ content });
    }).catch((err) => {
      res.status(500).json({ error: String(err) });
    });
  });
}
