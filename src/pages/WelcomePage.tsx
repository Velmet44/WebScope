import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrawlStore } from '../stores/crawlStore';
import { ImportModal } from '../components/ImportModal';
import { Globe, Upload, ArrowRight, Search, Network, Shield, Sparkles, AlertCircle } from 'lucide-react';
import type { CrawlProject } from '../types';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.14c0 .3.21.66.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function WelcomePage() {
  const navigate = useNavigate();
  const { updateSettings, addPage, addLink, addComment, addLog, setPhase } = useCrawlStore();
  const [showImport, setShowImport] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleImport = (project: CrawlProject) => {
    try {
      updateSettings(project.settings);
      setPhase('completed');
      for (const page of project.pages) {
        addPage(page);
      }
      for (const link of project.links) {
        addLink(link);
      }
      for (const comment of project.comments) {
        addComment(comment);
      }
      for (const log of project.logs) {
        addLog(log);
      }
      navigate('/workspace');
    } catch {
      setImportError('Failed to load the project data.');
    }
  };

  return (
    <div className="h-screen relative overflow-hidden bg-[var(--color-bg-primary)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-250px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[var(--color-accent)] opacity-[0.05] blur-[130px] animate-aurora-1" />
        <div className="absolute bottom-[-200px] left-[10%] w-[500px] h-[500px] rounded-full bg-[var(--color-info)] opacity-[0.04] blur-[120px] animate-aurora-2" />
        <div className="absolute top-[30%] right-[-150px] w-[450px] h-[450px] rounded-full bg-[var(--color-accent-strong)] opacity-[0.04] blur-[120px] animate-aurora-3" />
        <div className="absolute inset-0 bg-grid animate-grid" />
        <div className="absolute top-[22%] left-[18%] w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]/50 animate-node-float" />
        <div className="absolute top-[65%] left-[12%] w-1 h-1 rounded-full bg-[var(--color-info)]/50 animate-node-float" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-[30%] right-[16%] w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]/40 animate-node-float" style={{ animationDelay: '2.1s' }} />
        <div className="absolute bottom-[20%] right-[22%] w-1 h-1 rounded-full bg-[var(--color-info)]/40 animate-node-float" style={{ animationDelay: '0.8s' }} />
        <div className="absolute top-[55%] right-[28%] w-2 h-2 rounded-full bg-[var(--color-success)]/30 animate-node-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-2xl mx-auto animate-fade-in">
        <div className="mb-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">Visual web crawler for modern sites</span>
        </div>

        <div className="mb-10 relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--color-accent)]/20 to-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.15)]">
            <Globe className="w-12 h-12 text-[var(--color-accent)]" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-accent)] animate-pulse-soft" />
        </div>

        <h1 className="text-6xl font-bold tracking-tight mb-5 bg-gradient-to-b from-[var(--color-text-primary)] to-[var(--color-text-secondary)] bg-clip-text text-transparent">
          WebScope
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] mb-12 leading-relaxed max-w-lg">
          Discover, map, and inspect website structures — live, from your local machine.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          <button
            onClick={() => navigate('/configure')}
            className="group flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl
                       bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
                       text-white font-medium text-sm transition-all duration-200
                       hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            New Crawl
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={() => setShowImport(true)}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl
                       bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-elevated)]
                       border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)]
                       text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
                       font-medium text-sm transition-all duration-200 active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            Import Project
          </button>
        </div>

        {importError && (
          <div className="mt-5 flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-error-muted)] animate-slide-up">
            <AlertCircle className="w-4 h-4 text-[var(--color-error)]" />
            <span className="text-sm text-[var(--color-error)]">{importError}</span>
          </div>
        )}

        <div className="mt-16 flex items-center gap-10">
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-success-muted)] border border-[var(--color-success)]/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-[var(--color-success)]" strokeWidth={1.5} />
            </div>
            <span className="text-[13px] text-[var(--color-text-tertiary)]">Local-first</span>
          </div>
          <div className="w-px h-14 bg-[var(--color-border-subtle)]" />
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-info-muted)] border border-[var(--color-info)]/10 flex items-center justify-center">
              <Network className="w-6 h-6 text-[var(--color-info)]" strokeWidth={1.5} />
            </div>
            <span className="text-[13px] text-[var(--color-text-tertiary)]">Visual Map</span>
          </div>
          <div className="w-px h-14 bg-[var(--color-border-subtle)]" />
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-muted)] border border-[var(--color-accent)]/10 flex items-center justify-center">
              <Search className="w-6 h-6 text-[var(--color-accent)]" strokeWidth={1.5} />
            </div>
            <span className="text-[13px] text-[var(--color-text-tertiary)]">Deep Inspect</span>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-6 inset-x-0 z-10 flex items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
        <a
          href="https://github.com/Velmet44/WebScope"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-[var(--color-text-secondary)] transition-colors"
        >
          <GithubIcon className="w-4 h-4" />
          Open Source · MIT
        </a>
        <span className="w-px h-3 bg-[var(--color-border-default)]" />
        <span>v1.0.2</span>
      </footer>

      {showImport && (
        <ImportModal
          onClose={() => {
            setShowImport(false);
            setImportError(null);
          }}
          onImport={handleImport}
        />
      )}
    </div>
  );
}