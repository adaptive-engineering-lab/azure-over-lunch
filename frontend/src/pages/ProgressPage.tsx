import { Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ROUTES } from '../lib/routes';

export default function ProgressPage() {
  const totalSessions = useAppStore((s) => s.sessions.length);
  const totalQuestions = useAppStore((s) => Object.keys(s.progress).length);

  if (totalSessions === 0 && totalQuestions === 0) {
    return (
      <section>
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Your progress</h1>
        </header>
        <div className="rounded-lg bg-bg-elevated p-6 text-center">
          <p className="text-fg-muted">No study activity yet.</p>
          <Link
            to={ROUTES.learn}
            className="mt-4 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg"
          >
            Start a session
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Your progress</h1>
        <p className="mt-1 text-fg-muted">
          The full dashboard — streak calendar, domain radar, weak areas — lands in a future update.
        </p>
      </header>
      <div className="grid gap-3">
        <div className="rounded-lg bg-bg-elevated p-4">
          <p className="text-sm text-fg-muted">Sessions completed</p>
          <p className="mt-1 text-2xl font-bold">{totalSessions}</p>
        </div>
        <div className="rounded-lg bg-bg-elevated p-4">
          <p className="text-sm text-fg-muted">Questions reviewed</p>
          <p className="mt-1 text-2xl font-bold">{totalQuestions}</p>
        </div>
      </div>
    </section>
  );
}
