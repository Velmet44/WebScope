import { useCrawlStore } from '../stores/crawlStore';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Page } from '../types';

function TreeNode({
  page,
  pages,
  selectedPageId,
  onSelect,
  depth = 0,
}: {
  page: Page;
  pages: Page[];
  selectedPageId: string | null;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const children = useMemo(
    () => pages.filter((p) => p.parentId === page.id),
    [pages, page.id]
  );
  const hasChildren = children.length > 0;

  const statusColor: Record<string, string> = {
    discovered: 'bg-[var(--color-crawl-queued)]',
    queued: 'bg-[var(--color-crawl-queued)]',
    crawling: 'bg-[var(--color-crawl-active)]',
    success: 'bg-[var(--color-crawl-success)]',
    error: 'bg-[var(--color-crawl-error)]',
    timeout: 'bg-[var(--color-crawl-timeout)]',
    blocked_robots: 'bg-[var(--color-crawl-blocked)]',
    skipped: 'bg-[var(--color-crawl-queued)]',
    external: 'bg-[var(--color-crawl-external)]',
  };

  const statusPulse: Record<string, string> = {
    crawling: 'animate-pulse-soft',
  };

  return (
    <div>
      <div
        onClick={() => onSelect(page.id)}
        className={`
          group flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer
          transition-colors duration-150 text-sm
          ${selectedPageId === page.id
            ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
          }
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded(!expanded);
          }}
          className={`w-4 h-4 flex items-center justify-center shrink-0 ${
            hasChildren ? 'text-[var(--color-text-muted)]' : 'text-transparent'
          }`}
        >
          {hasChildren &&
            (expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            ))}
        </button>

        <div
          className={`w-2 h-2 rounded-full shrink-0 ${statusColor[page.status] || 'bg-[var(--color-text-muted)]'} ${statusPulse[page.status] || ''}`}
        />

        <span className="truncate font-mono text-xs">
          {page.title || extractPath(page.url)}
        </span>
      </div>

      {expanded &&
        children
          .sort((a, b) => a.depth - b.depth)
          .map((child) => (
            <TreeNode
              key={child.id}
              page={child}
              pages={pages}
              selectedPageId={selectedPageId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
    </div>
  );
}

function extractPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === '/' ? u.hostname : u.pathname;
  } catch {
    return url;
  }
}

function StatusLegend() {
  const items = [
    { color: 'bg-[var(--color-crawl-success)]', label: 'Crawled' },
    { color: 'bg-[var(--color-crawl-active)]', label: 'Active' },
    { color: 'bg-[var(--color-crawl-queued)]', label: 'Queued' },
    { color: 'bg-[var(--color-crawl-error)]', label: 'Error' },
    { color: 'bg-[var(--color-crawl-blocked)]', label: 'Blocked' },
    { color: 'bg-[var(--color-crawl-external)]', label: 'External' },
  ];

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-t border-[var(--color-border-subtle)]">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
          <span className="text-[10px] text-[var(--color-text-muted)]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function MapPanel() {
  const { pages, selectedPageId, selectPage, phase } = useCrawlStore();
  const rootPages = useMemo(
    () => pages.filter((p) => !p.parentId),
    [pages]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-bg-primary)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Website Map
        </h2>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-[var(--color-border-default)] mx-1" />
          <button className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-[var(--color-text-muted)]" strokeWidth={1} />
            </div>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-1">
              {phase === 'idle'
                ? 'Start a crawl to see the website map'
                : 'Discovering pages...'}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {phase === 'idle'
                ? 'Click "Start Crawl" in the controls panel'
                : 'Pages will appear here as they are found'}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {rootPages.map((page) => (
              <TreeNode
                key={page.id}
                page={page}
                pages={pages}
                selectedPageId={selectedPageId}
                onSelect={selectPage}
              />
            ))}
          </div>
        )}
      </div>

      <StatusLegend />
    </div>
  );
}
