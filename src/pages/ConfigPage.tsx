import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrawlStore } from '../stores/crawlStore';
import { Toggle } from '../components/Toggle';
import {
  ArrowLeft,
  Globe,
  Settings,
  Shield,
  Zap,
  FileText,
  AlertTriangle,
  ChevronDown,
  Info,
} from 'lucide-react';

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--color-border-subtle)]">
        <Icon className="w-4 h-4 text-[var(--color-accent)]" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
        {label}
      </label>
      {hint && (
        <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
      )}
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  suffix,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)]
                   text-[var(--color-text-primary)] text-sm placeholder:text-[var(--color-text-muted)]
                   focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]
                   transition-colors"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3.5 py-2.5 pr-10 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)]
                   text-[var(--color-text-primary)] text-sm
                   focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]
                   transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
  float = false,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
  float?: boolean;
}) {
  const [text, setText] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);
  const [focused, setFocused] = useState(false);

  if (!focused && prevValue !== value) {
    setPrevValue(value);
    setText(String(value));
  }

  const parse = (raw: string): number | null => {
    const n = float ? parseFloat(raw) : parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  };

  const commit = () => {
    const n = parse(text);
    if (n === null) {
      setText(String(value));
      return;
    }
    const clamped = Math.min(Math.max(n, min), max);
    setText(String(clamped));
    onChange(clamped);
  };

  return (
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit();
        }}
        onChange={(e) => {
          setText(e.target.value);
          const n = parse(e.target.value);
          if (n !== null) onChange(Math.min(Math.max(n, min), max));
        }}
        className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)]
                   text-[var(--color-text-primary)] text-sm placeholder:text-[var(--color-text-muted)]
                   focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]
                   transition-colors"
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)]">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function ConfigPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useCrawlStore();
  const [showWarning, setShowWarning] = useState(false);
  const [urlError, setUrlError] = useState('');

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setUrlError('Please enter a URL');
      return false;
    }
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setUrlError('URL must start with http:// or https://');
        return false;
      }
      setUrlError('');
      return true;
    } catch {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };

  const handleStart = () => {
    if (!validateUrl(settings.startUrl)) return;
    setShowWarning(true);
  };

  const isLarge = settings.maxPages > 200 || settings.maxDepth > 8;

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <header className="shrink-0 flex items-center gap-4 px-8 py-4 border-b border-[var(--color-border-subtle)]">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="Back to start"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Configure Crawl</h1>
          <p className="text-xs text-[var(--color-text-tertiary)]">Set up your crawl parameters</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center">
          <div className="w-full max-w-2xl px-8 py-10 space-y-6 animate-slide-up">
          <Section title="Target" icon={Globe}>
            <Field label="Starting URL" hint="Enter the URL where the crawl begins">
              <Input
                value={settings.startUrl}
                onChange={(v) => {
                  updateSettings({ startUrl: v });
                  if (urlError) validateUrl(v);
                }}
                placeholder="https://example.com"
              />
              {urlError && (
                <p className="text-xs text-[var(--color-error)] mt-1">{urlError}</p>
              )}
            </Field>
          </Section>

          <Section title="Scope" icon={Shield}>
            <div className="space-y-4">
              <Toggle
                checked={settings.sameDomainOnly}
                onChange={(v) => updateSettings({ sameDomainOnly: v })}
                label="Same-domain only"
              />
              <Toggle
                checked={settings.sameOriginOnly}
                onChange={(v) => updateSettings({ sameOriginOnly: v })}
                label="Same-origin only"
              />
              <Toggle
                checked={settings.allowExternalLinks}
                onChange={(v) => updateSettings({ allowExternalLinks: v })}
                label="Record external links (without crawling)"
              />
            </div>
          </Section>

          <Section title="Limits" icon={Settings}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Maximum pages">
                <NumberInput
                  value={settings.maxPages}
                  onChange={(v) => updateSettings({ maxPages: v })}
                  min={1}
                  max={10000}
                  suffix="pages"
                />
              </Field>
              <Field label="Maximum depth">
                <NumberInput
                  value={settings.maxDepth}
                  onChange={(v) => updateSettings({ maxDepth: v })}
                  min={0}
                  max={30}
                  suffix="levels"
                />
              </Field>
              <Field label="Maximum duration">
                <NumberInput
                  value={settings.maxDuration}
                  onChange={(v) => updateSettings({ maxDuration: v })}
                  min={0}
                  max={3600}
                  suffix="seconds"
                />
              </Field>
              <Field label="Request timeout">
                <NumberInput
                  value={settings.requestTimeout}
                  onChange={(v) => updateSettings({ requestTimeout: v })}
                  min={0}
                  max={3600}
                  suffix="seconds"
                />
              </Field>
            </div>
          </Section>

          <Section title="Network" icon={Zap}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Delay between requests">
                <NumberInput
                  value={settings.delayBetweenRequests}
                  onChange={(v) => updateSettings({ delayBetweenRequests: v })}
                  min={0}
                  max={60}
                  float
                  suffix="seconds"
                />
              </Field>
              <Field label="Max concurrent requests">
                <NumberInput
                  value={settings.maxConcurrent}
                  onChange={(v) => updateSettings({ maxConcurrent: v })}
                  min={0}
                  max={50}
                  suffix="requests"
                />
              </Field>
            </div>
            <Toggle
              checked={settings.followRedirects}
              onChange={(v) => updateSettings({ followRedirects: v })}
              label="Follow redirects"
            />
            <Field label="User agent">
              <Input
                value={settings.userAgent}
                onChange={(v) => updateSettings({ userAgent: v })}
                placeholder="WebScope/1.0"
              />
            </Field>
          </Section>

          <Section title="Content" icon={FileText}>
            <Field
              label="Content mode"
              hint="Metadata-only is faster and uses less storage"
            >
              <Select
                value={settings.contentMode}
                onChange={(v) => updateSettings({ contentMode: v as 'metadata' | 'full' })}
                options={[
                  { label: 'Metadata / Titles Only (fast)', value: 'metadata' },
                  { label: 'Full Content (slower, more data)', value: 'full' },
                ]}
              />
            </Field>
            {settings.contentMode === 'full' && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[var(--color-warning-muted)] border border-[var(--color-warning)]/20">
                <Info className="w-4 h-4 text-[var(--color-warning)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-warning)]">
                  Storing full page content can significantly increase project file size.
                </p>
              </div>
            )}
          </Section>

          {isLarge && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--color-warning-muted)] border border-[var(--color-warning)]/20 animate-slide-up">
              <AlertTriangle className="w-5 h-5 text-[var(--color-warning)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[var(--color-warning)]">Large crawl detected</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  With {settings.maxPages} pages at depth {settings.maxDepth}, this may take a while and produce a large project file.
                </p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      <footer className="shrink-0 flex items-center justify-end gap-3 px-8 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/80 backdrop-blur-sm">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)]
                     hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]
                     border border-[var(--color-border-default)] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleStart}
          className="group px-6 py-2.5 rounded-lg text-sm font-medium text-white
                     bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
                     transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]
                     active:scale-[0.98] flex items-center gap-2"
        >
          Start Crawl
          <Zap className="w-4 h-4 transition-transform group-hover:scale-110" />
        </button>
      </footer>

      {showWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-2xl p-6 max-w-md mx-4 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-warning-muted)] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Responsible Use</h3>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Before starting this crawl, please confirm:
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-accent)] mt-0.5">1.</span>
                  <span>You have the right and permission to crawl this target.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-accent)] mt-0.5">2.</span>
                  <span>You will use this tool responsibly and respectfully.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-accent)] mt-0.5">3.</span>
                  <span>You understand that robots.txt provides crawler instructions but is not a universal legal permission system.</span>
                </li>
              </ul>
              {isLarge && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--color-warning-muted)] border border-[var(--color-warning)]/20">
                  <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--color-warning)]">
                    This is a large crawl ({settings.maxPages} pages at depth {settings.maxDepth}). It may take a while.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)]
                           hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowWarning(false);
                  navigate('/workspace');
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white
                           bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                I Understand, Start Crawl
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
