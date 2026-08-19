import { useCrawlStore } from '../stores/crawlStore';
import { fetchPageContent } from '../hooks/useCrawler';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  MessageSquare,
  Link2,
  ArrowDownToLine,
  Check,
  Send,
  Trash2,
  Globe,
  FileText,
  Eye,
  Info,
  ChevronRight,
} from 'lucide-react';

function DetailRow({ label, value, mono = false }: { label: string; value?: string | number | null; mono?: boolean }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider w-20 shrink-0 pt-0.5">
        {label}
      </span>
      <span className={`text-xs text-[var(--color-text-secondary)] break-all ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

type ContentTab = 'info' | 'content' | 'links' | 'comments';

export function PageDetailPanel({ crawlerId }: { crawlerId: string | null }) {
  const { selectedPageId, pages, links, comments, selectPage, addComment, deleteComment, updatePage } = useCrawlStore();
  const [activeTab, setActiveTab] = useState<ContentTab>('info');
  const [newComment, setNewComment] = useState('');
  const [copied, setCopied] = useState(false);
  const [contentTab, setContentTab] = useState<'text' | 'html' | 'metadata' | 'preview'>('text');
  const [fetching, setFetching] = useState(false);

  const page = pages.find((p) => p.id === selectedPageId);
  const pageComments = comments.filter((c) => c.pageId === selectedPageId);

  const pageLinks = useMemo(() => {
    if (!selectedPageId) return [];
    return links.filter((l) => l.sourcePageId === selectedPageId);
  }, [links, selectedPageId]);

  const incomingLinks = useMemo(() => {
    if (!selectedPageId || !page) return [];
    return links.filter((l) => l.targetPageId === selectedPageId);
  }, [links, selectedPageId, page]);

  if (!page) return null;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(page.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment({
      id: crypto.randomUUID(),
      pageId: page.id,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setNewComment('');
  };

  const handleFetchContent = async () => {
    if (!crawlerId || !selectedPageId || fetching) return;
    setFetching(true);
    try {
      const content = await fetchPageContent(crawlerId, selectedPageId);
      if (content) {
        updatePage(selectedPageId, { content, contentAvailable: true });
      }
    } finally {
      setFetching(false);
    }
  };

  const extractText = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const statusLabel: Record<string, string> = {
    discovered: 'Discovered',
    queued: 'Queued',
    crawling: 'Crawling',
    success: 'Crawled',
    error: 'Error',
    timeout: 'Timeout',
    blocked_robots: 'Blocked',
    skipped: 'Skipped',
    external: 'External',
  };

  const statusDotColor: Record<string, string> = {
    success: 'bg-[var(--color-crawl-success)]',
    error: 'bg-[var(--color-crawl-error)]',
    timeout: 'bg-[var(--color-crawl-timeout)]',
    blocked_robots: 'bg-[var(--color-crawl-blocked)]',
    crawling: 'bg-[var(--color-crawl-active)] animate-pulse-soft',
    queued: 'bg-[var(--color-crawl-queued)]',
    discovered: 'bg-[var(--color-crawl-queued)]',
    external: 'bg-[var(--color-crawl-external)]',
  };

  const tabs: { id: ContentTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'info', label: 'Info', icon: Info },
    { id: 'content', label: 'Content', icon: Eye },
    { id: 'links', label: 'Links', icon: Link2, count: pageLinks.length + incomingLinks.length },
    { id: 'comments', label: 'Notes', icon: MessageSquare, count: pageComments.length },
  ];

  return (
    <aside className="w-96 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/50 flex flex-col shrink-0 animate-slide-down">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${statusDotColor[page.status] || 'bg-[var(--color-text-muted)]'}`} />
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider truncate">
            {statusLabel[page.status] || page.status}
          </h2>
        </div>
        <button
          onClick={() => selectPage(null)}
          className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-[var(--color-accent)] shrink-0" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {page.title || 'Untitled'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <code className="text-[11px] text-[var(--color-text-tertiary)] font-mono truncate flex-1 select-all">
            {page.url}
          </code>
          <button
            onClick={handleCopyUrl}
            className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors shrink-0"
            title="Copy URL"
          >
            {copied ? <Check className="w-3 h-3 text-[var(--color-success)]" /> : <Copy className="w-3 h-3" />}
          </button>
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors shrink-0"
            title="Open in browser"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="flex border-b border-[var(--color-border-subtle)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-medium transition-colors relative
                ${activeTab === tab.id
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-[9px] bg-[var(--color-bg-hover)] px-1 rounded-full">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[var(--color-accent)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' && (
          <div className="p-4 space-y-4">
            <div className="space-y-0">
              <DetailRow label="Status" value={statusLabel[page.status]} />
              <DetailRow label="HTTP" value={page.statusCode} mono />
              <DetailRow label="Depth" value={page.depth} />
              <DetailRow label="Content" value={page.contentType} mono />
              <DetailRow label="Response" value={page.responseTime ? `${page.responseTime}ms` : null} />
              <DetailRow label="Description" value={page.description} />
            </div>
            <div className="h-px bg-[var(--color-border-subtle)]" />
            <div className="space-y-0">
              <DetailRow
                label="Discovered"
                value={page.discoveredAt ? format(new Date(page.discoveredAt), 'MMM d, HH:mm:ss') : null}
              />
              <DetailRow
                label="Crawled"
                value={page.crawledAt ? format(new Date(page.crawledAt), 'MMM d, HH:mm:ss') : null}
              />
              <DetailRow label="Robots" value={
                page.robotsStatus === 'found' ? 'Respected' :
                page.robotsStatus === 'blocked' ? 'Blocked' :
                page.robotsStatus === 'not_found' ? 'Not found' : undefined
              } />
            </div>
            <div className="h-px bg-[var(--color-border-subtle)]" />
            <div className="space-y-0">
              <DetailRow label="Outgoing" value={pageLinks.length} />
              <DetailRow label="Incoming" value={incomingLinks.length} />
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-1">
                {(['text', 'html', 'preview', 'metadata'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setContentTab(tab)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                      contentTab === tab
                        ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {tab === 'text' ? 'Text' : tab === 'html' ? 'HTML' : tab === 'preview' ? 'Preview' : 'Meta'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              {page.content ? (
                contentTab === 'text' ? (
                  <pre className="text-xs text-[var(--color-text-secondary)] font-mono whitespace-pre-wrap leading-relaxed">
                    {extractText(page.content).slice(0, 5000)}
                  </pre>
                ) : contentTab === 'html' ? (
                  <pre className="text-[11px] text-[var(--color-text-tertiary)] font-mono whitespace-pre-wrap leading-relaxed break-all">
                    {page.content.slice(0, 10000)}
                  </pre>
                ) : contentTab === 'preview' ? (
                  <iframe
                    title={`Preview of ${page.title || page.url}`}
                    srcDoc={page.content}
                    sandbox=""
                    className="w-full h-full min-h-[400px] bg-white rounded-lg border border-[var(--color-border-subtle)]"
                  />
                ) : (
                  <div className="space-y-0">
                    <DetailRow label="Title" value={page.title} />
                    <DetailRow label="Description" value={page.description} />
                    <DetailRow label="Content" value={page.contentType} />
                    <DetailRow label="Status" value={page.statusCode} />
                    <DetailRow label="URL" value={page.url} mono />
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <FileText className="w-8 h-8 text-[var(--color-text-muted)] mb-3" strokeWidth={1} />
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
                    Content not collected
                  </p>
                  <button
                    onClick={handleFetchContent}
                    disabled={fetching}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
                               bg-[var(--color-accent-muted)] text-[var(--color-accent)]
                               hover:bg-[var(--color-accent)]/20 transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowDownToLine className={`w-3.5 h-3.5 ${fetching ? 'animate-pulse' : ''}`} />
                    {fetching ? 'Fetching...' : 'Fetch Content Now'}
                  </button>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                    This will make a fresh request to this page
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="p-3 space-y-4">
            {incomingLinks.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-1">
                  Incoming ({incomingLinks.length})
                </h4>
                <div className="space-y-0.5">
                  {incomingLinks.map((link) => {
                    const sourcePage = pages.find((p) => p.id === link.sourcePageId);
                    return (
                      <button
                        key={link.id}
                        onClick={() => sourcePage && selectPage(sourcePage.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left
                                   hover:bg-[var(--color-bg-hover)] transition-colors group"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-crawl-success)] shrink-0" />
                        <span className="text-[11px] text-[var(--color-text-secondary)] truncate font-mono flex-1">
                          {sourcePage?.title || extractPath(link.sourcePageId)}
                        </span>
                        <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {pageLinks.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-1">
                  Outgoing ({pageLinks.length})
                </h4>
                <div className="space-y-0.5">
                  {pageLinks.map((link) => {
                    const targetPage = pages.find((p) => p.id === link.targetPageId);
                    return (
                      <button
                        key={link.id}
                        onClick={() => targetPage && selectPage(targetPage.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left
                                   hover:bg-[var(--color-bg-hover)] transition-colors group"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          link.isExternal ? 'bg-[var(--color-crawl-external)]' : 'bg-[var(--color-crawl-active)]'
                        }`} />
                        <span className="text-[11px] text-[var(--color-text-secondary)] truncate font-mono flex-1">
                          {targetPage?.title || extractPath(link.targetUrl)}
                        </span>
                        {link.isExternal && (
                          <ExternalLink className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
                        )}
                        <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {pageLinks.length === 0 && incomingLinks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Link2 className="w-8 h-8 text-[var(--color-text-muted)] mb-3" strokeWidth={1} />
                <p className="text-xs text-[var(--color-text-tertiary)]">No links recorded</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="p-4">
            <div className="space-y-2 mb-3">
              {pageComments.length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-4">
                  No comments yet
                </p>
              )}
              {pageComments.map((comment) => (
                <div
                  key={comment.id}
                  className="px-3 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] group"
                >
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {comment.text}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {format(new Date(comment.createdAt), 'MMM d, HH:mm')}
                    </span>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--color-error-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)]
                           text-[var(--color-text-primary)] text-xs placeholder:text-[var(--color-text-muted)]
                           focus:outline-none focus:border-[var(--color-border-focus)] transition-colors"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="p-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
                           text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
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
