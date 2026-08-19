import { useMemo, useRef, useEffect } from 'react';
import { useCrawlStore } from '../stores/crawlStore';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Bug,
  Filter,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';

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
  const { logs, logFilter, setLogFilter } = useCrawlStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'all') return logs;
    return logs.filter((l) => l.level === logFilter);
  }, [logs, logFilter]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs.length]);

  return (
    <aside className="w-80 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/50 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border-subtle)]">
        <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
          Live Logs
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLogFilter('all')}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              logFilter === 'all'
                ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            All
          </button>
          {(['info', 'warning', 'error', 'success'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setLogFilter(level)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                logFilter === level
                  ? `${levelConfig[level].bg} ${levelConfig[level].color}`
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
          <button className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] transition-colors ml-1">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Filter className="w-6 h-6 text-[var(--color-text-muted)] mb-2" />
            <p className="text-xs text-[var(--color-text-muted)]">
              {logs.length === 0 ? 'Logs will appear here during crawl' : 'No matching logs'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
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
          })
        )}
      </div>

      <div className="px-4 py-2 border-t border-[var(--color-border-subtle)] text-[10px] text-[var(--color-text-muted)] tabular-nums">
        {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
      </div>
    </aside>
  );
}
