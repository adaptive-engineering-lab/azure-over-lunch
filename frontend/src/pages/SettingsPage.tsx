import { useAppStore, type Theme, type SessionLength } from '../lib/store';

const SESSION_LENGTHS: SessionLength[] = [10, 20, 30];
const THEMES: Theme[] = ['dark', 'light'];

export default function SettingsPage() {
  const prefs = useAppStore((s) => s.preferences);
  const setTheme = useAppStore((s) => s.setTheme);
  const setLength = useAppStore((s) => s.setDefaultSessionLength);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <fieldset className="rounded-lg bg-bg-elevated p-4">
        <legend className="px-1 text-sm font-semibold text-fg-muted">Theme</legend>
        <div className="mt-2 flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              aria-pressed={prefs.theme === t}
              className={[
                'flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors',
                prefs.theme === t ? 'bg-accent text-accent-fg' : 'bg-bg text-fg',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4 rounded-lg bg-bg-elevated p-4">
        <legend className="px-1 text-sm font-semibold text-fg-muted">
          Default session length
        </legend>
        <div className="mt-2 flex gap-2">
          {SESSION_LENGTHS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setLength(n)}
              aria-pressed={prefs.defaultSessionLength === n}
              className={[
                'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                prefs.defaultSessionLength === n
                  ? 'bg-accent text-accent-fg'
                  : 'bg-bg text-fg',
              ].join(' ')}
            >
              {n} cards
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4 rounded-lg bg-bg-elevated p-4">
        <legend className="px-1 text-sm font-semibold text-fg-muted">Motion</legend>
        <label className="mt-2 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={prefs.reducedMotion === true}
            onChange={(e) => setReducedMotion(e.target.checked ? true : 'system')}
            className="h-4 w-4 accent-accent"
          />
          <span>Reduce motion (otherwise follow system setting)</span>
        </label>
      </fieldset>
    </section>
  );
}
