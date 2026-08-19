import { useNavigate } from 'react-router-dom';
import { useCrawlStore } from '../stores/crawlStore';
import {
  Globe,
  ArrowLeft,
  Play,
  Pause,
  Square,
  Download,
  RotateCcw,
} from 'lucide-react';

export function TopBar() {
  const navigate = useNavigate();
  const { phase, setPhase, reset, settings } = useCrawlStore();

  const handleNewCrawl = () => {
    reset();
    navigate('/configure');
  };

  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[var(--color-accent)]" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">WebScope</span>
        </div>
        <div className="w-px h-4 bg-[var(--color-border-default)]" />
        <span className="text-xs text-[var(--color-text-tertiary)] font-mono truncate max-w-xs">
          {settings.startUrl || 'No URL'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {phase === 'crawling' && (
          <>
            <button
              onClick={() => setPhase('paused')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-[var(--color-warning-muted)] text-[var(--color-warning)]
                         hover:bg-[var(--color-warning)]/20 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>
            <button
              onClick={() => setPhase('completed')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-[var(--color-error-muted)] text-[var(--color-error)]
                         hover:bg-[var(--color-error)]/20 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </button>
          </>
        )}

        {phase === 'paused' && (
          <button
            onClick={() => setPhase('crawling')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       bg-[var(--color-success-muted)] text-[var(--color-success)]
                       hover:bg-[var(--color-success)]/20 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Resume
          </button>
        )}

        {phase === 'completed' && (
          <>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]
                         hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]
                         border border-[var(--color-border-default)] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              onClick={handleNewCrawl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-[var(--color-accent-muted)] text-[var(--color-accent)]
                         hover:bg-[var(--color-accent)]/20 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Crawl
            </button>
          </>
        )}
      </div>
    </header>
  );
}
