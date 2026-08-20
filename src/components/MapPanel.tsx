import { useCrawlStore } from '../stores/crawlStore';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ChevronDown,
  Globe,
  Expand,
  Shrink,
  Link2,
  GitBranch,
  Network,
} from 'lucide-react';
import { useState, useMemo, useRef, useCallback, useEffect, lazy, Suspense, memo } from 'react';
import type { GraphControls } from './GraphPanel';
import type { Page } from '../types';

const GraphPanel = lazy(() =>
  import('./GraphPanel').then((m) => ({ default: m.GraphPanel }))
);

interface CrossLink {
  url: string;
  title: string;
}

const EMPTY_CROSS_LINKS: CrossLink[] = [];

const TreeNode = memo(function TreeNode({
  page,
  pages,
  crossLinks,
  crossLinkMap,
  selectedPageId,
  onSelect,
  depth = 0,
  expandEpoch,
  collapseEpoch,
}: {
  page: Page;
  pages: Page[];
  crossLinks: CrossLink[];
  crossLinkMap: Map<string, CrossLink[]>;
  selectedPageId: string | null;
  onSelect: (id: string) => void;
  depth?: number;
  expandEpoch: number;
  collapseEpoch: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [seenExpandEpoch, setSeenExpandEpoch] = useState(expandEpoch);
  const [seenCollapseEpoch, setSeenCollapseEpoch] = useState(collapseEpoch);

  if (expandEpoch !== seenExpandEpoch) {
    setSeenExpandEpoch(expandEpoch);
    setExpanded(true);
  }

  if (collapseEpoch !== seenCollapseEpoch) {
    setSeenCollapseEpoch(collapseEpoch);
    setExpanded(false);
  }

  const children = useMemo(
    () => pages.filter((p) => p.parentId === page.id),
    [pages, page.id]
  );
  const hasChildren = children.length > 0;

  const statusConfig: Record<string, { dot: string; bg: string }> = {
    discovered: { dot: 'bg-[var(--color-crawl-queued)]', bg: '' },
    queued: { dot: 'bg-[var(--color-crawl-queued)]', bg: '' },
    crawling: { dot: 'bg-[var(--color-crawl-active)]', bg: 'bg-[var(--color-accent-muted)]' },
    success: { dot: 'bg-[var(--color-crawl-success)]', bg: '' },
    error: { dot: 'bg-[var(--color-crawl-error)]', bg: 'bg-[var(--color-error-muted)]' },
    timeout: { dot: 'bg-[var(--color-crawl-timeout)]', bg: 'bg-[var(--color-warning-muted)]' },
    blocked_robots: { dot: 'bg-[var(--color-crawl-blocked)]', bg: 'bg-[var(--color-accent-muted)]' },
    skipped: { dot: 'bg-[var(--color-crawl-queued)]', bg: '' },
    external: { dot: 'bg-[var(--color-crawl-external)]', bg: '' },
  };

  const cfg = statusConfig[page.status] || statusConfig.discovered;
  const isSelected = selectedPageId === page.id;

  return (
    <div>
      <div
        onClick={() => onSelect(page.id)}
        className={`
          group flex items-center gap-1.5 px-2 py-[5px] rounded-md cursor-pointer
          transition-all duration-150 text-sm
          ${isSelected
            ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30'
            : page.status === 'crawling'
              ? `${cfg.bg} text-[var(--color-text-primary)]`
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
          }
        `}
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded(!expanded);
          }}
          className={`w-4 h-4 flex items-center justify-center shrink-0 transition-colors ${
            hasChildren
              ? 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              : 'text-transparent'
          }`}
        >
          {hasChildren &&
            (expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            ))}
        </button>

        <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot} ${
          page.status === 'crawling' ? 'animate-pulse-soft' : ''
        }`} />

        <span className="truncate font-mono text-xs leading-tight">
          {page.title || extractPath(page.url)}
        </span>

        {crossLinks.length > 0 && (
          <Link2 className="w-3 h-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        )}

        {page.depth > 0 && (
          <span className="text-[10px] text-[var(--color-text-muted)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            d{page.depth}
          </span>
        )}
      </div>

      {expanded &&
        children
          .sort((a, b) => {
            const order = ['crawling', 'queued', 'discovered', 'success', 'error', 'timeout', 'blocked_robots'];
            return order.indexOf(a.status) - order.indexOf(b.status);
          })
          .map((child) => (
            <TreeNode
              key={child.id}
              page={child}
              pages={pages}
              crossLinks={crossLinkMap.get(child.id) || EMPTY_CROSS_LINKS}
              crossLinkMap={crossLinkMap}
              selectedPageId={selectedPageId}
              onSelect={onSelect}
              depth={depth + 1}
              expandEpoch={expandEpoch}
              collapseEpoch={collapseEpoch}
            />
          ))}
    </div>
  );
});

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
  const { pages, links, selectedPageId, selectPage, phase } = useCrawlStore();
  const rootPages = useMemo(
    () => pages.filter((p) => !p.parentId),
    [pages]
  );

  const crossLinkMap = useMemo(() => {
    const pageById = new Map(pages.map((p) => [p.id, p]));
    const map = new Map<string, CrossLink[]>();
    for (const link of links) {
      if (!link.targetPageId) continue;
      const target = pageById.get(link.targetPageId);
      if (!target) continue;
      const entry: CrossLink = { url: link.targetUrl, title: target.title || extractPath(link.targetUrl) };
      const arr = map.get(link.sourcePageId);
      if (arr) {
        if (arr.length < 3) arr.push(entry);
      } else {
        map.set(link.sourcePageId, [entry]);
      }
    }
    return map;
  }, [links, pages]);

  const [expandEpoch, setExpandEpoch] = useState(0);
  const [collapseEpoch, setCollapseEpoch] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [view, setView] = useState<'tree' | 'graph'>('tree');
  const scrollRef = useRef<HTMLDivElement>(null);
  const graphControlsRef = useRef<GraphControls | null>(null);

  const handleZoomIn = useCallback(() => {
    if (view === 'graph') {
      graphControlsRef.current?.zoomIn();
      return;
    }
    setZoom((z) => Math.min(z + 0.1, 2));
  }, [view]);

  const handleZoomOut = useCallback(() => {
    if (view === 'graph') {
      graphControlsRef.current?.zoomOut();
      return;
    }
    setZoom((z) => Math.max(z - 0.1, 0.5));
  }, [view]);

  const handleFitToView = useCallback(() => {
    if (view === 'graph') {
      graphControlsRef.current?.fitToView();
      return;
    }
    setZoom(1);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [view]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setZoom((z) => Math.min(z + 0.05, 2));
        } else {
          setZoom((z) => Math.max(z - 0.05, 0.5));
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--color-bg-primary)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Website Map
          </h2>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
            {pages.length} page{pages.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)]">
            <button
              onClick={() => setView('tree')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                view === 'tree'
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              Tree
            </button>
            <button
              onClick={() => setView('graph')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                view === 'graph'
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Graph
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {view === 'tree' && (
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono w-10 text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
          )}
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-[var(--color-border-default)] mx-1" />
          {view === 'tree' && (
            <>
              <button
                onClick={() => setExpandEpoch((n) => n + 1)}
                className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                title="Expand all"
              >
                <Expand className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCollapseEpoch((n) => n + 1)}
                className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                title="Collapse all"
              >
                <Shrink className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3 bg-[var(--color-border-default)] mx-1" />
            </>
          )}
          <button
            onClick={handleFitToView}
            className="p-1.5 rounded-md hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
            title="Fit to view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-2"
        style={{ cursor: 'grab' }}
      >
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
        ) : view === 'graph' ? (
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                Loading graph...
              </div>
            }
          >
            <GraphPanel controlsRef={graphControlsRef} />
          </Suspense>
        ) : (
          <div
            className="origin-top-left transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            {rootPages.map((page) => (
              <TreeNode
                key={page.id}
                page={page}
                pages={pages}
                crossLinks={crossLinkMap.get(page.id) || EMPTY_CROSS_LINKS}
                crossLinkMap={crossLinkMap}
                selectedPageId={selectedPageId}
                onSelect={selectPage}
                expandEpoch={expandEpoch}
                collapseEpoch={collapseEpoch}
              />
            ))}
          </div>
        )}
      </div>

      <StatusLegend />
    </div>
  );
}
