import { useCrawlStore } from '../stores/crawlStore';
import { format } from 'date-fns';
import {
  X,
  ExternalLink,
  Copy,
  MessageSquare,
  Clock,
  Link2,
  ArrowDownToLine,
  Check,
  Send,
  Trash2,
  Globe,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

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

export function PageDetailPanel() {
  const { selectedPageId, pages, comments, selectPage, addComment, deleteComment } = useCrawlStore();
  const [newComment, setNewComment] = useState('');
  const [copied, setCopied] = useState(false);

  const page = pages.find((p) => p.id === selectedPageId);
  const pageComments = comments.filter((c) => c.pageId === selectedPageId);

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

  const statusLabel: Record<string, string> = {
    discovered: 'Discovered',
    queued: 'Queued',
    crawling: 'Crawling',
    success: 'Success',
    error: 'Error',
    timeout: 'Timeout',
    blocked_robots: 'Blocked by robots.txt',
    skipped: 'Skipped',
    external: 'External',
  };

  return (
    <aside className="w-80 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/50 flex flex-col shrink-0 animate-slide-down">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Page Details
        </h2>
        <button
          onClick={() => selectPage(null)}
          className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-[var(--color-accent)]" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                {page.title || 'Untitled'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-[11px] text-[var(--color-text-tertiary)] font-mono truncate flex-1">
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

          <div className="h-px bg-[var(--color-border-subtle)]" />

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <FileText className="w-3.5 h-3.5 text-[var(--color-text-muted)]" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Information
              </span>
            </div>
            <div className="space-y-0">
              <DetailRow label="Status" value={statusLabel[page.status]} />
              <DetailRow label="Status code" value={page.statusCode} mono />
              <DetailRow label="Depth" value={page.depth} />
              <DetailRow label="Content" value={page.contentType} mono />
              <DetailRow label="Response" value={page.responseTime ? `${page.responseTime}ms` : null} />
              <DetailRow label="Description" value={page.description} />
            </div>
          </div>

          <div className="h-px bg-[var(--color-border-subtle)]" />

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Timing
              </span>
            </div>
            <div className="space-y-0">
              <DetailRow
                label="Discovered"
                value={page.discoveredAt ? format(new Date(page.discoveredAt), 'MMM d, HH:mm:ss') : null}
              />
              <DetailRow
                label="Crawled"
                value={page.crawledAt ? format(new Date(page.crawledAt), 'MMM d, HH:mm:ss') : null}
              />
            </div>
          </div>

          <div className="h-px bg-[var(--color-border-subtle)]" />

          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Link2 className="w-3.5 h-3.5 text-[var(--color-text-muted)]" strokeWidth={1.5} />
              <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Content
              </span>
            </div>
            <button
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                         bg-[var(--color-bg-hover)] hover:bg-[var(--color-bg-elevated)]
                         text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                         border border-[var(--color-border-default)] transition-colors"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              Fetch Content
            </button>
          </div>
        </div>

        <div className="h-px bg-[var(--color-border-subtle)] mx-4" />

        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--color-text-muted)]" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Comments
            </span>
          </div>

          <div className="space-y-2 mb-3">
            {pageComments.map((comment) => (
              <div
                key={comment.id}
                className="px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-subtle)] group"
              >
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {comment.text}
                </p>
                <div className="flex items-center justify-between mt-1.5">
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
              placeholder="Add a comment..."
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
      </div>
    </aside>
  );
}
