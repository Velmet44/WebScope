import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useCrawlStore } from '../stores/crawlStore';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Bug,
  Filter,
  Trash2,
  Pause,
  Play,
  Copy,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';

const MAX_VISIBLE_LOGS = 500;

const levelConfig = {
  info: {
    icon: Info,
    color: 'text-[var(--color-info)]',
    bg: 'bg-[var(--color-info-muted)]',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-[var(--color-warning)]',
    bg: 'bg-[var(--color-warning-muted)]',
  },
  error: {
    icon: AlertCircle,
    color: 'text-[var(--color-error)]',
    bg: 'bg-[var(--color-error-muted)]',
  },
  success: {
    icon: CheckCircle,
    color: 'text-[var(--color-success)]',
    bg: 'bg-[var(--color-success-muted)]',
  },
  debug: {
    icon: Bug,
    color: 'text-[var(--color-text-muted)]',
    bg: 'bg-[var(--color-bg-hover)]',
  },
};

export function LogPanel() {
  const { logs, logFilter, setLogFilter, clearLogs } = useCrawlStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [userScrolled, setUserScrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'all') return logs;
    return logs.filter((l) => l.level === logFilter);
  }, [logs, logFilter]);

  const visibleLogs = useMemo(() => {
    if (filteredLogs.length <= MAX_VISIBLE_LOGS) return filteredLogs;
    return filteredLogs.slice(-MAX_VISIBLE_LOGS);
  }, [filteredLogs]);

  const hiddenCount = filteredLogs.length - visibleLogs.length;

  const handleCopy = useCallback(async () => {
    const text = filteredLogs
      .map((log) => `[${format(new Date(log.timestamp), 'HH:mm:ss')}] ${log.message}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — fall back to selecting nothing
    }
  }, [filteredLogs]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length, logFilter, autoScroll]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || userScrolled) return;
    const el = scrollRef.current;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (!atBottom && autoScroll) {
      setAutoScroll(false);
      setUserScrolled(true);
    }
  }, [autoScroll, userScrolled]);

  const resumeScroll = () => {
    setAutoScroll(true);
    setUserScrolled(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  return (
    <aside className="w-80 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/50 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Live Logs
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={`p-1 rounded transition-colors ${
              copied
                ? 'text-[var(--color-success)] hover:bg-[var(--color-bg-hover)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]'
            }`}
            title={copied ? 'Copied!' : 'Copy logs'}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            onClick={resumeScroll}
            className={`p-1 rounded hover:bg-[var(--color-bg-hover)] transition-colors ${
              autoScroll
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
            title={autoScroll ? 'Auto-scrolling' : 'Resume auto-scroll'}
          >
            {autoScroll ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <button
            onClick={clearLogs}
            className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--color-border-subtle)]">
        <Filter className="w-3 h-3 text-[var(--color-text-muted)] shrink-0" />
        {(['all', 'info', 'warning', 'error', 'success'] as const).map((level) => (
          <button
            key={level}
            onClick={() => setLogFilter(level)}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              logFilter === level
                ? level === 'all'
                  ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                  : `${levelConfig[level].bg} ${levelConfig[level].color}`
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Filter className="w-6 h-6 text-[var(--color-text-muted)] mb-2" />
            <p className="text-xs text-[var(--color-text-muted)]">
              {logs.length === 0 ? 'Logs will appear here during crawl' : 'No matching logs'}
            </p>
          </div>
        ) : (
          <>
            {hiddenCount > 0 && (
              <div className="px-2 py-1.5 mb-1 rounded bg-[var(--color-bg-hover)] text-[10px] text-[var(--color-text-muted)]">
                Showing last {visibleLogs.length} of {filteredLogs.length} logs ({hiddenCount} hidden)
              </div>
            )}
            {visibleLogs.map((log) => {
            const config = levelConfig[log.level];
            const Icon = config.icon;
            const time = format(new Date(log.timestamp), 'HH:mm:ss');

            return (
              <div
                key={log.id}
                className="flex items-start gap-2 px-2 py-1 rounded hover:bg-[var(--color-bg-hover)] transition-colors group"
              >
                <span className="text-[var(--color-text-muted)] shrink-0 tabular-nums w-[56px]">
                  {time}
                </span>
                <Icon className={`w-3 h-3 shrink-0 mt-0.5 ${config.color}`} />
                <span className="text-[var(--color-text-secondary)] leading-relaxed break-all">
                  {log.message}
                </span>
              </div>
            );
          })}
          </>
        )}
      </div>

      <div className="px-4 py-2 border-t border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-muted)] tabular-nums">
        {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
        {!autoScroll && ' · scrolled'}
      </div>
    </aside>
  );
}