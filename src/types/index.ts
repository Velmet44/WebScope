export type PageStatus = 'discovered' | 'queued' | 'crawling' | 'success' | 'error' | 'timeout' | 'blocked_robots' | 'skipped' | 'external';

export interface Page {
  id: string;
  url: string;
  canonicalUrl?: string;
  title?: string;
  description?: string;
  statusCode?: number;
  contentType?: string;
  depth: number;
  parentId?: string;
  discoveredAt: string;
  crawledAt?: string;
  responseTime?: number;
  robotsStatus?: 'found' | 'not_found' | 'error' | 'blocked';
  content?: string;
  contentAvailable: boolean;
  metadata: Record<string, string>;
  status: PageStatus;
}

export interface Link {
  id: string;
  sourcePageId: string;
  targetUrl: string;
  targetPageId?: string;
  isExternal: boolean;
  discoveredAt: string;
  relationship: 'navigation' | 'content' | 'resource';
}

export interface Comment {
  id: string;
  pageId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrawlSettings {
  startUrl: string;
  sameDomainOnly: boolean;
  sameOriginOnly: boolean;
  allowExternalLinks: boolean;
  maxPages: number;
  maxDepth: number;
  maxDuration: number;
  requestTimeout: number;
  delayBetweenRequests: number;
  maxConcurrent: number;
  followRedirects: boolean;
  userAgent: string;
  contentMode: 'metadata' | 'full';
}

export interface CrawlStats {
  pagesCrawled: number;
  pagesDiscovered: number;
  pagesRemaining: number;
  linksDiscovered: number;
  externalLinks: number;
  brokenLinks: number;
  errors: number;
  skippedByRobots: number;
  currentDepth: number;
  elapsedTime: number;
  averageResponseTime: number;
  dataCollected: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success' | 'debug';
  message: string;
  pageUrl?: string;
}

export type RobotsStatus = {
  status: 'found' | 'not_found' | 'error';
  message: string;
};

export interface CrawlProject {
  format: 'webscope';
  version: number;
  project: {
    name: string;
    startUrl: string;
    createdAt: string;
  };
  settings: CrawlSettings;
  pages: Page[];
  links: Link[];
  comments: Comment[];
  logs: LogEntry[];
  metadata: Record<string, unknown>;
}

export type CrawlPhase = 'idle' | 'configuring' | 'confirming' | 'crawling' | 'paused' | 'completed' | 'error';
