import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrawlStore } from '../stores/crawlStore';
import { ImportModal } from '../components/ImportModal';
import { Globe, Upload, ArrowRight, Search, Network, Shield, AlertCircle } from 'lucide-react';
import type { CrawlProject } from '../types';

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
    <div className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[var(--color-accent)] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-[-100px] left-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-accent)] opacity-[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto px-6 animate-fade-in">
        <div className="mb-8 relative">
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] flex items-center justify-center">
            <Globe className="w-10 h-10 text-[var(--color-accent)]" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-accent)] animate-pulse-soft" />
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-3 bg-gradient-to-b from-[var(--color-text-primary)] to-[var(--color-text-secondary)] bg-clip-text text-transparent">
          WebScope
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] mb-12 text-center leading-relaxed">
          Visual web crawler. Discover, map, and inspect<br />
          website structures from your local machine.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => navigate('/configure')}
            className="group flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl
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
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl
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
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-error-muted)] animate-slide-up">
            <AlertCircle className="w-4 h-4 text-[var(--color-error)]" />
            <span className="text-sm text-[var(--color-error)]">{importError}</span>
          </div>
        )}

        <div className="mt-16 grid grid-cols-3 gap-8 text-center max-w-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-success-muted)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[var(--color-success)]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[var(--color-text-tertiary)]">Local-first</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-info-muted)] flex items-center justify-center">
              <Network className="w-5 h-5 text-[var(--color-info)]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[var(--color-text-tertiary)]">Visual Map</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center">
              <Search className="w-5 h-5 text-[var(--color-accent)]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[var(--color-text-tertiary)]">Deep Inspect</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 text-xs text-[var(--color-text-muted)]">
        v1.0
      </div>

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
