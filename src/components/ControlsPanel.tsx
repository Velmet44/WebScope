import { useCrawlStore } from '../stores/crawlStore';
import {
  FileText,
  Link2,
  AlertCircle,
  Clock,
  Layers,
  HardDrive,
  ExternalLink,
  Shield,
  CheckCircle,
} from 'lucide-react';

function StatCard({
  icon: Icon,
  label,
  value,
  color = 'text-[var(--color-text-primary)]',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors group">
      <Icon className={`w-4 h-4 ${color} opacity-60 group-hover:opacity-100 transition-opacity`} strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      </div>
      <span className="text-sm font-semibold text-[var(--color-text-primary)] font-mono tabular-nums">
        {value}
      </span>
    </div>
  );
}

export function ControlsPanel() {
  const { phase, stats, settings, robotsStatus, setPhase } = useCrawlStore();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <aside className="w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/50 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 space-y-5">
        <div>
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-1">
            Crawl Progress
          </h2>
          <div className="space-y-0.5">
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[var(--color-text-tertiary)]">Pages</span>
                <span className="text-xs font-mono text-[var(--color-text-secondary)]">
                  {stats.pagesCrawled}/{settings.maxPages}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-bg-hover)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min((stats.pagesCrawled / settings.maxPages) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-1">
            Statistics
          </h2>
          <div className="space-y-0.5">
            <StatCard icon={FileText} label="Pages crawled" value={stats.pagesCrawled} />
            <StatCard icon={Layers} label="Discovered" value={stats.pagesDiscovered} />
            <StatCard icon={Link2} label="Links found" value={stats.linksDiscovered} />
            <StatCard icon={ExternalLink} label="External links" value={stats.externalLinks} color="text-[var(--color-crawl-external)]" />
            <StatCard icon={AlertCircle} label="Broken links" value={stats.brokenLinks} color="text-[var(--color-error)]" />
            <StatCard icon={AlertCircle} label="Errors" value={stats.errors} color="text-[var(--color-error)]" />
            <StatCard icon={Shield} label="Robots blocked" value={stats.skippedByRobots} color="text-[var(--color-crawl-blocked)]" />
            <StatCard icon={Clock} label="Elapsed" value={formatTime(stats.elapsedTime)} />
            <StatCard icon={Clock} label="Avg response" value={`${stats.averageResponseTime}ms`} />
            <StatCard icon={HardDrive} label="Data" value={formatBytes(stats.dataCollected)} />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 px-1">
            robots.txt
          </h2>
          <div className="mx-1">
            {robotsStatus ? (
              <div className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
                robotsStatus.status === 'found'
                  ? 'bg-[var(--color-success-muted)] text-[var(--color-success)]'
                  : 'bg-[var(--color-warning-muted)] text-[var(--color-warning)]'
              }`}>
                {robotsStatus.status === 'found' ? (
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                )}

                <span>{robotsStatus.message}</span>
              </div>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-[var(--color-bg-hover)] text-xs text-[var(--color-text-muted)]">
                {phase === 'idle' ? 'Waiting to start...' : 'Checking...'}
              </div>
            )}
          </div>
        </div>
      </div>

      {phase === 'idle' && (
        <div className="mt-auto p-4 border-t border-[var(--color-border-subtle)]">
          <button
            onClick={() => setPhase('crawling')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                       bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
                       text-white transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]
                       active:scale-[0.98]"
          >
            <span className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white" />
            Start Crawl
          </button>
        </div>
      )}
    </aside>
  );
}
