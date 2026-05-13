import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth/AuthProvider';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { buildMigrationPlan, migrationIsEmpty } from '../lib/migration/plan';
import { executeMigration, type MigrationResult } from '../lib/migration/execute';
import { hydrateStoreFromServer } from '../lib/migration/hydrate';

type State =
  | { kind: 'idle' }
  | { kind: 'hydrating' }
  | { kind: 'prompt'; counts: { progress: number; sessions: number } }
  | { kind: 'working' }
  | { kind: 'done'; result: MigrationResult }
  | { kind: 'error'; message: string };

export function MigrationPrompt() {
  const { user } = useAuth();
  const progress = useAppStore((s) => s.progress);
  const sessions = useAppStore((s) => s.sessions);
  const reset = useAppStore((s) => s.reset);
  const setTheme = useAppStore((s) => s.setTheme);
  const theme = useAppStore((s) => s.preferences.theme);
  const sessionLength = useAppStore((s) => s.preferences.defaultSessionLength);
  const setLength = useAppStore((s) => s.setDefaultSessionLength);

  const [state, setState] = useState<State>({ kind: 'idle' });

  useEffect(() => {
    if (!user) {
      // Reset on sign-out so re-login triggers hydration again.
      if (state.kind !== 'idle') setState({ kind: 'idle' });
      return;
    }
    if (state.kind !== 'idle') return;
    const plan = buildMigrationPlan({ progress, sessions });
    if (migrationIsEmpty(plan)) {
      // Nothing to migrate — pull server state so this device sees existing progress.
      setState({ kind: 'hydrating' });
      hydrateStoreFromServer(supabase(), user.id)
        .then(() =>
          setState({
            kind: 'done',
            result: { progressInserted: 0, progressMerged: 0, sessionsInserted: 0 },
          }),
        )
        .catch((err) =>
          setState({ kind: 'error', message: err instanceof Error ? err.message : 'Hydration failed.' }),
        );
      return;
    }
    setState({ kind: 'prompt', counts: { progress: plan.progressCount, sessions: plan.sessionCount } });
  }, [user, progress, sessions, state.kind]);

  if (!user || state.kind === 'idle' || state.kind === 'hydrating') return null;

  async function onAccept() {
    if (!user) return;
    setState({ kind: 'working' });
    const plan = buildMigrationPlan({ progress, sessions });
    try {
      const result = await executeMigration(supabase(), user.id, plan);
      // Preserve preferences (theme, session length); replace progress/sessions with server truth.
      reset();
      setTheme(theme);
      setLength(sessionLength);
      await hydrateStoreFromServer(supabase(), user.id);
      setState({ kind: 'done', result });
    } catch (err) {
      setState({ kind: 'error', message: err instanceof Error ? err.message : 'Migration failed.' });
    }
  }

  function onDecline() {
    setState({ kind: 'done', result: { progressInserted: 0, progressMerged: 0, sessionsInserted: 0 } });
  }

  return (
    <div
      role="dialog"
      aria-labelledby="migration-title"
      className="fixed inset-x-2 bottom-20 z-40 mx-auto max-w-screen-md rounded-lg bg-bg-elevated p-4 shadow-lg ring-1 ring-divider"
    >
      {state.kind === 'prompt' && (
        <>
          <h2 id="migration-title" className="text-lg font-bold">
            Save your progress to your account?
          </h2>
          <p className="mt-2 text-sm text-fg-muted">
            You have {state.counts.progress} question{state.counts.progress === 1 ? '' : 's'} reviewed
            and {state.counts.sessions} session{state.counts.sessions === 1 ? '' : 's'} on this
            browser. We can copy them to your account so you can study across devices.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onAccept}
              className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg"
            >
              Save to account
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="flex-1 rounded-md bg-bg px-4 py-2 text-sm font-medium text-fg"
            >
              Not now
            </button>
          </div>
        </>
      )}
      {state.kind === 'working' && <p className="text-fg-muted">Migrating your progress…</p>}
      {state.kind === 'done' && state.result.progressInserted + state.result.progressMerged > 0 && (
        <p className="text-sm">
          Migrated {state.result.progressInserted} new + {state.result.progressMerged} merged
          questions and {state.result.sessionsInserted} sessions.
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setState({ kind: 'idle' })}
          >
            Dismiss
          </button>
        </p>
      )}
      {state.kind === 'error' && (
        <p className="text-sm text-error">
          {state.message}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setState({ kind: 'idle' })}
          >
            Dismiss
          </button>
        </p>
      )}
    </div>
  );
}
