interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer select-none group">
      {label && (
        <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
          {label}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-5 w-10 shrink-0 items-center rounded-full
          transition-colors duration-200 outline-none
          focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-secondary)]
          ${checked
            ? 'bg-[var(--color-accent)]'
            : 'bg-[var(--color-bg-hover)] border border-[var(--color-border-default)]'
          }
        `}
      >
        <span
          className={`
            absolute left-[2px] h-4 w-4 rounded-full bg-white shadow-sm
            transition-transform duration-200 ease-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  );
}