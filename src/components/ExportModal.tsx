import { useState } from 'react';
import { useCrawlStore } from '../stores/crawlStore';
import { exportProject, downloadFile } from '../lib/export';
import {
  X,
  Download,
  FileText,
  Link2,
  MessageSquare,
  Settings,
  ScrollText,
  Code2,
  FileCode,
  AlertTriangle,
  Check,
} from 'lucide-react';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const { settings, pages, links, comments, logs } = useCrawlStore();
  const [options, setOptions] = useState({
    includeMetadata: true,
    includeRelationships: true,
    includeComments: true,
    includeSettings: true,
    includeLogs: false,
    includeContent: false,
    includeRawHtml: false,
  });
  const [exported, setExported] = useState(false);

  const estimateSize = () => {
    let size = 0;
    if (options.includeMetadata) size += pages.length * 200;
    if (options.includeRelationships) size += links.length * 100;
    if (options.includeComments) size += comments.length * 50;
    if (options.includeLogs) size += logs.length * 100;
    if (options.includeRawHtml) {
      size += pages.reduce((acc, p) => acc + (p.content?.length || 0), 0);
    }
    return size;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleExport = (format: 'webscope' | 'json') => {
    const content = exportProject(settings, pages, links, comments, logs, options);
    const ext = format === 'webscope' ? '.webscope' : '.json';
    const filename = `webscope-export${ext}`;
    downloadFile(content, filename, 'application/json');
    setExported(true);
    setTimeout(() => {
      setExported(false);
      onClose();
    }, 1500);
  };

  const toggles = [
    { key: 'includeMetadata', label: 'Page metadata', icon: FileText, count: pages.length },
    { key: 'includeRelationships', label: 'Page relationships', icon: Link2, count: links.length },
    { key: 'includeComments', label: 'Comments', icon: MessageSquare, count: comments.length },
    { key: 'includeSettings', label: 'Crawl settings', icon: Settings },
    { key: 'includeLogs', label: 'Crawl logs', icon: ScrollText, count: logs.length },
    { key: 'includeContent', label: 'Extracted content', icon: FileCode },
    { key: 'includeRawHtml', label: 'Raw HTML', icon: Code2 },
  ] as const;

  const rawHtmlSize = pages.reduce((acc, p) => acc + (p.content?.length || 0), 0);
  const estimated = estimateSize();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div
        className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl w-full max-w-lg mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center">
              <Download className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Export Project</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Save your crawl data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {toggles.map((toggle) => {
            const Icon = toggle.icon;
            const toggleCount = 'count' in toggle ? toggle.count : undefined;
            return (
              <label
                key={toggle.key}
                className={`flex items-center justify-between py-1.5 cursor-pointer group`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors" strokeWidth={1.5} />
                  <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                    {toggle.label}
                  </span>
                  {toggleCount !== undefined && (
                    <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-hover)] px-1.5 py-0.5 rounded">
                      {toggleCount}
                    </span>
                  )}
                </div>
                <button
                  role="switch"
                  aria-checked={options[toggle.key]}
                  onClick={() => setOptions({ ...options, [toggle.key]: !options[toggle.key] })}
                  className={`
                    relative w-10 h-[22px] rounded-full transition-colors duration-200
                    ${options[toggle.key]
                      ? 'bg-[var(--color-accent)]'
                      : 'bg-[var(--color-bg-hover)] border border-[var(--color-border-default)]'
                    }
                  `}
                >
                  <span
                    className={`
                      absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform duration-200
                      ${options[toggle.key] ? 'translate-x-[21px]' : 'translate-x-[3px]'}
                    `}
                  />
                </button>
              </label>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-[var(--color-border-subtle)]">
          {options.includeRawHtml && rawHtmlSize > 1024 * 1024 && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--color-warning-muted)] border border-[var(--color-warning)]/20 mb-3">
              <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--color-warning)]">
                Including raw HTML will produce a large file ({formatSize(rawHtmlSize)}).
              </p>
            </div>
          )}
          <p className="text-xs text-[var(--color-text-muted)]">
            Estimated size: <span className="font-mono text-[var(--color-text-secondary)]">{formatSize(estimated)}</span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border-subtle)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)]
                       hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleExport('webscope')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white
                       bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            {exported ? (
              <>
                <Check className="w-4 h-4" />
                Exported!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export .webscope
              </>
            )}
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       bg-[var(--color-bg-hover)] hover:bg-[var(--color-bg-elevated)]
                       text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                       border border-[var(--color-border-default)] transition-colors"
          >
            <FileCode className="w-4 h-4" />
            Export .json
          </button>
        </div>
      </div>
    </div>
  );
}
