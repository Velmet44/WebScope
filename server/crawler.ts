import type { CrawlSettings, Page, Link, LogEntry, CrawlStats } from '../src/types/index.js';
import { extractLinks, extractMetadata } from './parser.js';
import { fetchRobotsTxt, isUrlBlocked, type RobotsData } from './robots.js';
import { broadcastToCrawler } from './websocket.js';

export class CrawlerEngine {
  private id: string;
  private settings: CrawlSettings;
  private pages: Map<string, Page> = new Map();
  private links: Link[] = [];
  private logs: LogEntry[] = [];
  private queue: { url: string; parentId?: string; depth: number }[] = [];
  private visited: Set<string> = new Set();
  private robotsData: RobotsData | null = null;
  private running = false;
  private paused = false;
  private aborted = false;
  private activeRequests = 0;
  private startTime = 0;
  private totalResponseTime = 0;
  private crawledCount = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private crawlTimer: ReturnType<typeof setTimeout> | null = null;
  private linkBuffer: Link[] = [];
  private linkFlushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(id: string, settings: CrawlSettings) {
    this.id = id;
    this.settings = settings;
  }

  getState() {
    return {
      pages: Array.from(this.pages.values()),
      links: this.links,
      logs: this.logs,
      stats: this.getStats(),
      running: this.running,
      paused: this.paused,
    };
  }

  getStats(): CrawlStats {
    const pagesArray = Array.from(this.pages.values());
    return {
      pagesCrawled: pagesArray.filter((p) => p.status === 'success' || p.status === 'error').length,
      pagesDiscovered: pagesArray.length,
      pagesRemaining: this.queue.length,
      linksDiscovered: this.links.length,
      externalLinks: this.links.filter((l) => l.isExternal).length,
      brokenLinks: pagesArray.filter((p) => p.status === 'error').length,
      errors: pagesArray.filter((p) => p.status === 'error' || p.status === 'timeout').length,
      skippedByRobots: pagesArray.filter((p) => p.status === 'blocked_robots').length,
      currentDepth: this.getCurrentDepth(),
      elapsedTime: Math.floor((Date.now() - this.startTime) / 1000),
      averageResponseTime: this.crawledCount > 0 ? Math.round(this.totalResponseTime / this.crawledCount) : 0,
      dataCollected: this.estimateDataSize(),
    };
  }

  private getCurrentDepth(): number {
    let max = 0;
    for (const page of this.pages.values()) {
      if (page.depth > max) max = page.depth;
    }
    return max;
  }

  private estimateDataSize(): number {
    let size = 0;
    for (const page of this.pages.values()) {
      size += page.url.length * 2;
      if (page.title) size += page.title.length * 2;
      if (page.description) size += page.description.length * 2;
      if (page.content) size += page.content.length * 2;
    }
    return size;
  }

  private emit(event: string, data: Record<string, unknown>) {
    broadcastToCrawler(this.id, { type: event, ...data });
  }

  private addLog(level: LogEntry['level'], message: string, pageUrl?: string) {
    const log: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      message,
      pageUrl,
    };
    this.logs.push(log);
    this.emit('log', { log });
  }

  private updateStats() {
    this.emit('stats', { stats: this.getStats() });
  }

  private addPage(page: Page) {
    this.pages.set(page.id, page);
    this.emit('page', { page });
  }

  private updatePage(id: string, partial: Partial<Page>) {
    const page = this.pages.get(id);
    if (page) {
      Object.assign(page, partial);
      this.emit('pageUpdate', { page: { ...page } });
    }
  }

  private addLink(link: Link) {
    this.links.push(link);
    this.linkBuffer.push(link);
    if (this.linkBuffer.length >= 50) {
      this.flushLinks();
    }
  }

  private flushLinks() {
    if (this.linkBuffer.length === 0) return;
    const batch = this.linkBuffer;
    this.linkBuffer = [];
    this.emit('links', { links: batch });
  }

  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      parsed.hash = '';
      if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
        parsed.pathname = parsed.pathname.slice(0, -1);
      }
      return parsed.href;
    } catch {
      return url;
    }
  }

  private isSameDomain(url: string): boolean {
    try {
      const start = new URL(this.settings.startUrl);
      const target = new URL(url);
      return start.hostname === target.hostname;
    } catch {
      return false;
    }
  }

  private isSameOrigin(url: string): boolean {
    try {
      const start = new URL(this.settings.startUrl);
      const target = new URL(url);
      return start.origin === target.origin;
    } catch {
      return false;
    }
  }

  async start() {
    this.running = true;
    this.startTime = Date.now();

    this.addLog('info', `Starting crawl of ${this.settings.startUrl}`);

    this.addLog('info', 'Checking robots.txt...');
    const robotsResult = await fetchRobotsTxt(this.settings.startUrl, this.settings.userAgent);
    this.robotsData = robotsResult.data;

    this.emit('robotsStatus', { status: robotsResult.status, message: robotsResult.message });
    this.addLog('info', `robots.txt: ${robotsResult.message}`);

    const rootId = crypto.randomUUID();
    this.addPage({
      id: rootId,
      url: this.normalizeUrl(this.settings.startUrl),
      depth: 0,
      discoveredAt: new Date().toISOString(),
      contentAvailable: false,
      metadata: {},
      status: 'queued',
    });

    this.queue.push({ url: this.settings.startUrl, depth: 0 });

    this.timer = setInterval(() => {
      this.updateStats();
    }, 1000);

    this.linkFlushTimer = setInterval(() => {
      this.flushLinks();
    }, 120);

    if (this.settings.maxDuration > 0) {
      this.crawlTimer = setTimeout(() => {
        this.addLog('warning', `Maximum crawl duration reached (${this.settings.maxDuration}s)`);
        this.stop();
      }, this.settings.maxDuration * 1000);
    }

    this.processQueue();
  }

  stop() {
    this.aborted = true;
    this.running = false;
    if (this.timer) clearInterval(this.timer);
    if (this.crawlTimer) clearTimeout(this.crawlTimer);
    if (this.linkFlushTimer) clearInterval(this.linkFlushTimer);
    this.flushLinks();
    this.addLog('info', 'Crawl stopped');
    this.emit('completed', { stats: this.getStats() });
  }

  pause() {
    this.paused = true;
    this.addLog('info', 'Crawl paused');
  }

  resume() {
    this.paused = false;
    this.addLog('info', 'Crawl resumed');
    this.processQueue();
  }

  async fetchPageContent(pageId: string): Promise<string | null> {
    const page = this.pages.get(pageId);
    if (!page) return null;

    const response = await fetch(page.url, {
      headers: { 'User-Agent': this.settings.userAgent },
      signal: AbortSignal.timeout(this.settings.requestTimeout * 1000),
    });

    return await response.text();
  }

  private async processQueue() {
    while (this.running && !this.paused && !this.aborted) {
      if (this.activeRequests >= this.settings.maxConcurrent) {
        await this.sleep(100);
        continue;
      }

      const pagesCrawled = Array.from(this.pages.values()).filter(
        (p) => p.status === 'success' || p.status === 'error'
      ).length;

      if (pagesCrawled + this.activeRequests >= this.settings.maxPages) {
        this.addLog('info', `Maximum pages limit reached (${this.settings.maxPages})`);
        this.stop();
        return;
      }

      const item = this.queue.shift();
      if (!item) {
        if (this.activeRequests === 0) {
          this.addLog('success', 'Crawl complete — no more pages to process');
          this.stop();
        }
        return;
      }

      const normalized = this.normalizeUrl(item.url);
      if (this.visited.has(normalized)) continue;
      if (item.depth > this.settings.maxDepth) continue;

      this.visited.add(normalized);
      this.crawlUrl(item.url, item.parentId, item.depth);
    }
  }

  private async crawlUrl(url: string, parentId: string | undefined, depth: number) {
    this.activeRequests++;

    const pageId = crypto.randomUUID();
    const normalized = this.normalizeUrl(url);
    const existing = Array.from(this.pages.values()).find((p) => this.normalizeUrl(p.url) === normalized);

    if (!existing) {
      this.addPage({
        id: pageId,
        url: normalized,
        depth,
        parentId,
        discoveredAt: new Date().toISOString(),
        contentAvailable: false,
        metadata: {},
        status: 'crawling',
      });
    } else {
      this.updatePage(existing.id, { status: 'crawling' });
    }

    const targetId = existing?.id || pageId;

    this.addLog('info', `Crawling ${this.extractPath(normalized)}`, normalized);

    if (this.robotsData && isUrlBlocked(normalized, this.robotsData, this.settings.userAgent)) {
      this.updatePage(targetId, {
        status: 'blocked_robots',
        robotsStatus: 'blocked',
        crawledAt: new Date().toISOString(),
      });
      this.addLog('warning', `Blocked by robots.txt: ${this.extractPath(normalized)}`, normalized);
      this.activeRequests--;
      this.updateStats();
      this.processQueue();
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.settings.requestTimeout * 1000);
      const start = Date.now();

      const response = await fetch(normalized, {
        headers: {
          'User-Agent': this.settings.userAgent,
          'Accept': 'text/html,application/xhtml+xml,*/*',
        },
        redirect: this.settings.followRedirects ? 'follow' : 'manual',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const responseTime = Date.now() - start;
      this.totalResponseTime += responseTime;
      this.crawledCount++;

      const contentType = response.headers.get('content-type') || '';
      const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml');

      if (!isHtml) {
        this.updatePage(targetId, {
          status: 'success',
          statusCode: response.status,
          contentType,
          responseTime,
          crawledAt: new Date().toISOString(),
          robotsStatus: 'found',
        });
        this.activeRequests--;
        this.updateStats();
        this.processQueue();
        return;
      }

      const html = await response.text();
      const meta = extractMetadata(html);

      const finalUrl = response.url || normalized;

      this.updatePage(targetId, {
        url: finalUrl,
        title: meta.title || undefined,
        description: meta.description || undefined,
        statusCode: response.status,
        contentType: meta.contentType,
        responseTime,
        crawledAt: new Date().toISOString(),
        robotsStatus: this.robotsData ? 'found' : 'not_found',
        content: this.settings.contentMode === 'full' ? html : undefined,
        contentAvailable: true,
        status: response.status >= 400 ? 'error' : 'success',
      });

      const isErrorStatus = response.status >= 400;
      if (isErrorStatus) {
        this.addLog('warning', `${response.status} ${this.extractPath(finalUrl)}`, finalUrl);
        this.activeRequests--;
        this.updateStats();
        this.processQueue();
        return;
      }

      this.addLog('success', `Crawled ${this.extractPath(finalUrl)} (${response.status}) — ${meta.title || 'No title'}`, finalUrl);

      if (this.aborted) {
        this.activeRequests--;
        this.updateStats();
        return;
      }

      const extractedLinks = extractLinks(html, finalUrl);
      let externalCount = 0;
      const externalSamples: string[] = [];

      for (const link of extractedLinks) {
        const isExternal = !this.isSameDomain(link.url);
        const linkId = crypto.randomUUID();

        this.addLink({
          id: linkId,
          sourcePageId: targetId,
          targetUrl: link.url,
          isExternal,
          discoveredAt: new Date().toISOString(),
          relationship: link.relationship,
        });

        if (!isExternal) {
          const shouldCrawl = this.settings.sameOriginOnly
            ? this.isSameOrigin(link.url)
            : this.isSameDomain(link.url);

          if (shouldCrawl) {
            const linkNormalized = this.normalizeUrl(link.url);
            if (!this.visited.has(linkNormalized)) {
              this.queue.push({ url: link.url, parentId: targetId, depth: depth + 1 });
            }
          }
        } else if (this.settings.allowExternalLinks) {
          externalCount++;
          if (externalSamples.length < 5) {
            externalSamples.push(this.describeLink(link.url));
          }
        }
      }

      if (externalCount > 0) {
        const suffix = externalCount > externalSamples.length
          ? ` (+${externalCount - externalSamples.length} more)`
          : '';
        this.addLog(
          'debug',
          `External links on ${this.extractPath(finalUrl)}: ${externalSamples.join(', ')}${suffix} (${externalCount} total)`,
          finalUrl
        );
      }

      this.addLog('info', `Found ${extractedLinks.length} links on ${this.extractPath(finalUrl)}`, finalUrl);

    } catch (err) {
      const isTimeout = err instanceof Error && (
        err.name === 'AbortError' || err.message.includes('abort')
      );

      this.updatePage(targetId, {
        status: isTimeout ? 'timeout' : 'error',
        crawledAt: new Date().toISOString(),
      });

      this.addLog(
        isTimeout ? 'warning' : 'error',
        `${isTimeout ? 'Timeout' : 'Error'}: ${this.extractPath(normalized)} — ${err instanceof Error ? err.message : 'Unknown'}`,
        normalized
      );
    }

    this.activeRequests--;
    this.updateStats();

    if (!this.paused && !this.aborted) {
      const delay = this.settings.delayBetweenRequests * 1000;
      if (delay > 0) {
        await this.sleep(delay);
      }
      this.processQueue();
    }
  }

  private extractPath(url: string): string {
    try {
      const u = new URL(url);
      return u.pathname === '/' ? u.hostname : u.pathname;
    } catch {
      return url;
    }
  }

  private describeLink(url: string): string {
    try {
      const u = new URL(url);
      const path = u.pathname === '/' ? '' : u.pathname.slice(0, 40) + (u.pathname.length > 40 ? '…' : '');
      return path ? `${u.hostname}${path}` : u.hostname;
    } catch {
      return url;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
