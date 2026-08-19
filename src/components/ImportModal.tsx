import { useState, useRef } from 'react';
import { importProject } from '../lib/export';
import {
  X,
  Upload,
  AlertCircle,
} from 'lucide-react';
import type { CrawlProject } from '../types';

interface ImportModalProps {
  onClose: () => void;
  onImport: (project: CrawlProject) => void;
}

export function ImportModal({ onClose, onImport }: ImportModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const result = importProject(text);

      if (!result.success) {
        setError(result.error || 'Failed to import project');
        return;
      }

      if (result.data) {
        onImport(result.data);
        onClose();
      }
    } catch {
      setError('An unexpected error occurred while reading the file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div
        className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl w-full max-w-md mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center">
              <Upload className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Import Project</h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">Load a previous WebScope project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--color-border-default)] hover:border-[var(--color-accent)]
                       rounded-xl p-8 text-center cursor-pointer transition-colors
                       bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-elevated)]"
          >
            <Upload className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" strokeWidth={1} />
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">
              {loading ? 'Reading file...' : 'Drop a file here or click to browse'}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Supports .webscope and .json files
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".webscope,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />

          {error && (
            <div className="mt-4 flex items-start gap-3 px-4 py-3 rounded-lg bg-[var(--color-error-muted)] border border-[var(--color-error)]/20 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-[var(--color-error)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--color-error)]">Import failed</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-[var(--color-border-subtle)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)]
                       hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
