/* eslint-disable react/refs, react/purity, react/immutability */
import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { useCrawlStore } from '../stores/crawlStore';

export interface GraphControls {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: () => void;
}

interface GraphNode {
  id: string;
  label: string;
  url: string;
  status: string;
  degree: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  id: string;
  source: string;
  target: string;
}

const STATUS_VAR: Record<string, string> = {
  discovered: '--color-crawl-queued',
  queued: '--color-crawl-queued',
  crawling: '--color-crawl-active',
  success: '--color-crawl-success',
  error: '--color-crawl-error',
  timeout: '--color-crawl-timeout',
  blocked_robots: '--color-crawl-blocked',
  skipped: '--color-crawl-queued',
  external: '--color-crawl-external',
};

const STATUS_FALLBACK: Record<string, string> = {
  discovered: '#9494a8',
  queued: '#9494a8',
  crawling: '#6366f1',
  success: '#22c55e',
  error: '#ef4444',
  timeout: '#f59e0b',
  blocked_robots: '#a855f7',
  skipped: '#9494a8',
  external: '#64748b',
};

const colorCache = new Map<string, string>();

function statusColor(status: string): string {
  const cached = colorCache.get(status);
  if (cached) return cached;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(STATUS_VAR[status] ?? '')
    .trim();
  const color = v || STATUS_FALLBACK[status] || '#9494a8';
  colorCache.set(status, color);
  return color;
}

function extractPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === '/' ? u.hostname : u.pathname;
  } catch {
    return url;
  }
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.href;
  } catch {
    return url;
  }
}

export function GraphPanel({
  controlsRef,
}: {
  controlsRef: React.MutableRefObject<GraphControls | null>;
}) {
  const { pages, links, selectedPageId, selectPage } = useCrawlStore();
  const graphRef = useRef<ForceGraphMethods<any> | undefined>(undefined);
  const nodeStore = useRef(new Map<string, GraphNode>());
  const linkStore = useRef(new Map<string, GraphLink>());
  const popStore = useRef(new Map<string, number>());
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    controlsRef.current = {
      zoomIn: () => {
        const fg = graphRef.current;
        if (!fg) return;
        const scale = fg.zoom() ?? 1;
        fg.zoom(scale * 1.2, 250);
      },
      zoomOut: () => {
        const fg = graphRef.current;
        if (!fg) return;
        const scale = fg.zoom() ?? 1;
        fg.zoom(scale / 1.2, 250);
      },
      fitToView: () => {
        graphRef.current?.zoomToFit(400, 60);
      },
    };
  }, [controlsRef]);

  useEffect(() => {
    const fg = graphRef.current as
      | (ForceGraphMethods<any> & {
          d3Force?: (name: string) => { distance?: (v: number) => unknown; strength?: (v: number) => unknown } | undefined;
        })
      | undefined;
    fg?.d3Force?.('link')?.distance?.(55);
    fg?.d3Force?.('charge')?.strength?.(-35);
  }, []);

  const dampSimulation = () => {
    const fg = graphRef.current as
      | (ForceGraphMethods<any> & { d3AlphaDecay?: (v: number) => void; d3VelocityDecay?: (v: number) => void })
      | undefined;
    fg?.d3AlphaDecay?.(0.35);
    fg?.d3VelocityDecay?.(0.85);
  };

  useEffect(() => {
    const t = setTimeout(dampSimulation, 3500);
    return () => clearTimeout(t);
  }, []);

  const graphData = useMemo(() => {
    const urlToId = new Map<string, string>();
    for (const p of pages) {
      urlToId.set(normalizeUrl(p.url), p.id);
      if (p.canonicalUrl) urlToId.set(normalizeUrl(p.canonicalUrl), p.id);
    }

    for (const n of nodeStore.current.values()) n.degree = 0;

    const seenPages = new Set<string>();
    const nodes: GraphNode[] = [];
    for (const p of pages) {
      seenPages.add(p.id);
      let n = nodeStore.current.get(p.id);
      if (!n) {
        n = { id: p.id, label: p.title || extractPath(p.url), url: p.url, status: p.status, degree: 0 };
        nodeStore.current.set(p.id, n);
        popStore.current.set(p.id, performance.now());
      } else {
        n.label = p.title || extractPath(p.url);
        n.url = p.url;
        n.status = p.status;
      }
      nodes.push(n);
    }
    for (const id of [...nodeStore.current.keys()]) {
      if (!seenPages.has(id)) nodeStore.current.delete(id);
    }

    const seenLinks = new Set<string>();
    const edges: GraphLink[] = [];
    for (const link of links) {
      const targetId = link.targetPageId ?? urlToId.get(normalizeUrl(link.targetUrl));
      if (!targetId) continue;
      const src = nodeStore.current.get(link.sourcePageId);
      const tgt = nodeStore.current.get(targetId);
      if (!src || !tgt) continue;
      seenLinks.add(link.id);
      let l = linkStore.current.get(link.id);
      if (!l) {
        l = { id: link.id, source: link.sourcePageId, target: targetId };
        linkStore.current.set(link.id, l);
      } else {
        l.source = link.sourcePageId;
        l.target = targetId;
      }
      edges.push(l);
      src.degree++;
      tgt.degree++;
    }
    for (const id of [...linkStore.current.keys()]) {
      if (!seenLinks.has(id)) linkStore.current.delete(id);
    }

    return { nodes, links: edges };
  }, [pages, links]);

  useEffect(() => {
    const t = setTimeout(() => {
      for (const [id, start] of popStore.current) {
        if (performance.now() - start > 600) popStore.current.delete(id);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [graphData]);

  const activeNode =
    hoveredNode ??
    (selectedPageId ? graphData.nodes.find((n) => n.id === selectedPageId) ?? null : null);

  const showAllLabels = graphData.nodes.length <= 25;

  return (
    <div className="flex-1 relative overflow-hidden">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeId="id"
        dagMode="radialout"
        dagLevelDistance={65}
        onDagError={() => {}}
        d3AlphaMin={0.001}
        cooldownTicks={150}
        nodeCanvasObjectMode={() => 'replace'}
        nodeCanvasObject={(node, ctx, globalScale) => {
          if (node.x === undefined || node.y === undefined) return;
          const r = Math.max(3, Math.min(4 + node.degree * 0.12, 8.5));
          const isSelected = node.id === selectedPageId;
          const isHovered = hoveredNode?.id === node.id;
          const showLabel = isSelected || isHovered || showAllLabels;

          const popStart = popStore.current.get(node.id);
          if (popStart !== undefined) {
            const t = (performance.now() - popStart) / 600;
            if (t < 1) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + t * 20, 0, 2 * Math.PI);
              ctx.strokeStyle = `rgba(129,140,248,${0.5 * (1 - t)})`;
              ctx.lineWidth = 1.5 / globalScale;
              ctx.stroke();
            } else {
              popStore.current.delete(node.id);
            }
          }

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = statusColor(node.status);
          ctx.globalAlpha = isSelected ? 1 : 0.85;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = 'rgba(8,8,12,0.4)';
          ctx.lineWidth = 1 / globalScale;
          ctx.stroke();

          if (isSelected || isHovered) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, r + 2.5 / globalScale, 0, 2 * Math.PI);
            ctx.strokeStyle = '#818cf8';
            ctx.lineWidth = 1.5 / globalScale;
            ctx.stroke();
          }

          if (showLabel) {
            const fontSize = 9.5 / globalScale;
            ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
            const text = node.label.slice(0, 22);
            const w = ctx.measureText(text).width;
            const pad = 4 / globalScale;
            const pillH = fontSize + 6 / globalScale;
            const pillY = node.y - r - 5 / globalScale - pillH;
            ctx.fillStyle = 'rgba(10,10,15,0.82)';
            ctx.beginPath();
            ctx.roundRect(node.x - w / 2 - pad, pillY, w + pad * 2, pillH, 3 / globalScale);
            ctx.fill();
            ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(232,232,239,0.92)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, node.x, pillY + pillH / 2);
          }
        }}
        linkColor={() => 'rgba(99,102,241,0.18)'}
        linkWidth={1}
        backgroundColor="transparent"
        onNodeClick={(node) => selectPage(node.id)}
        onNodeHover={(node) => setHoveredNode(node ? node : null)}
        onEngineStop={dampSimulation}
      />
      {activeNode && (
        <div className="absolute top-3 left-3 max-w-xs px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)]/95 backdrop-blur border border-[var(--color-border-default)] text-xs pointer-events-none z-10">
          <p className="font-medium text-[var(--color-text-primary)] truncate">{activeNode.label}</p>
          <p className="text-[var(--color-text-muted)] truncate font-mono">{activeNode.url}</p>
        </div>
      )}
    </div>
  );
}