import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrawlStore } from '../stores/crawlStore';
import { ExportModal } from './ExportModal';
import {
  Globe,
  ArrowLeft,
  Pause,
  Square,
  Download,
  RotateCcw,
  Play,
} from 'lucide-react';

interface TopBarProps {
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

export function TopBar({ onStop, onPause, onResume }: TopBarProps) {
  const navigate = useNavigate();
  const { phase, reset, settings } = useCrawlStore();
  const [showExport, setShowExport] = useState(false);

  const handleNewCrawl = () => {
    reset();
    navigate('/configure');
  };

  return (
    <>
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
                onClick={onPause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                           bg-[var(--color-warning-muted)] text-[var(--color-warning)]
                           hover:bg-[var(--color-warning)]/20 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                Pause
              </button>
              <button
                onClick={onStop}
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
            <>
              <button
                onClick={onResume}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                           bg-[var(--color-success-muted)] text-[var(--color-success)]
                           hover:bg-[var(--color-success)]/20 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Resume
              </button>
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                           bg-[var(--color-error-muted)] text-[var(--color-error)]
                           hover:bg-[var(--color-error)]/20 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                Stop
              </button>
            </>
          )}

          {(phase === 'completed' || phase === 'error' || phase === 'idle') && (
            <>
              <button
                onClick={() => setShowExport(true)}
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

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </>
  );
}
