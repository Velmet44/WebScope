import { create } from 'zustand';
import type {
  CrawlSettings,
  CrawlPhase,
  CrawlStats,
  Page,
  Link,
  Comment,
  LogEntry,
  RobotsStatus,
} from '../types';

interface CrawlState {
  phase: CrawlPhase;
  settings: CrawlSettings;
  stats: CrawlStats;
  pages: Page[];
  links: Link[];
  comments: Comment[];
  logs: LogEntry[];
  robotsStatus: RobotsStatus | null;
  selectedPageId: string | null;
  logFilter: string;

  setPhase: (phase: CrawlPhase) => void;
  updateSettings: (partial: Partial<CrawlSettings>) => void;
  updateStats: (partial: Partial<CrawlStats>) => void;
  addPage: (page: Page) => void;
  updatePage: (id: string, partial: Partial<Page>) => void;
  addLink: (link: Link) => void;
  addLinks: (links: Link[]) => void;
  addComment: (comment: Comment) => void;
  updateComment: (id: string, text: string) => void;
  deleteComment: (id: string) => void;
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  setRobotsStatus: (status: RobotsStatus) => void;
  selectPage: (id: string | null) => void;
  setLogFilter: (filter: string) => void;
  reset: () => void;
}

const defaultSettings: CrawlSettings = {
  startUrl: '',
  sameDomainOnly: true,
  sameOriginOnly: false,
  allowExternalLinks: true,
  maxPages: 100,
  maxDepth: 5,
  maxDuration: 300,
  requestTimeout: 10,
  delayBetweenRequests: 0.5,
  maxConcurrent: 4,
  followRedirects: true,
  userAgent: 'WebScope/1.0',
  contentMode: 'metadata',
};

const defaultStats: CrawlStats = {
  pagesCrawled: 0,
  pagesDiscovered: 0,
  pagesRemaining: 0,
  linksDiscovered: 0,
  externalLinks: 0,
  brokenLinks: 0,
  errors: 0,
  skippedByRobots: 0,
  currentDepth: 0,
  elapsedTime: 0,
  averageResponseTime: 0,
  dataCollected: 0,
};

export const useCrawlStore = create<CrawlState>((set) => ({
  phase: 'idle',
  settings: defaultSettings,
  stats: defaultStats,
  pages: [],
  links: [],
  comments: [],
  logs: [],
  robotsStatus: null,
  selectedPageId: null,
  logFilter: 'all',

  setPhase: (phase) => set({ phase }),

  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),

  updateStats: (partial) =>
    set((state) => ({ stats: { ...state.stats, ...partial } })),

  addPage: (page) =>
    set((state) => ({ pages: [...state.pages, page] })),

  updatePage: (id, partial) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id ? { ...p, ...partial } : p
      ),
    })),

  addLink: (link) =>
    set((state) => ({ links: [...state.links, link] })),

  addLinks: (links) =>
    set((state) => ({ links: [...state.links, ...links] })),

  addComment: (comment) =>
    set((state) => ({ comments: [...state.comments, comment] })),

  updateComment: (id, text) =>
    set((state) => ({
      comments: state.comments.map((c) =>
        c.id === id ? { ...c, text, updatedAt: new Date().toISOString() } : c
      ),
    })),

  deleteComment: (id) =>
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id),
    })),

  addLog: (log) =>
    set((state) => ({ logs: [...state.logs, log] })),

  clearLogs: () => set({ logs: [] }),

  setRobotsStatus: (status) => set({ robotsStatus: status }),

  selectPage: (id) => set({ selectedPageId: id }),

  setLogFilter: (filter) => set({ logFilter: filter }),

  reset: () =>
    set({
      phase: 'idle',
      settings: defaultSettings,
      stats: defaultStats,
      pages: [],
      links: [],
      comments: [],
      logs: [],
      robotsStatus: null,
      selectedPageId: null,
      logFilter: 'all',
    }),
}));
