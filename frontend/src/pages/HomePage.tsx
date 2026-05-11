import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { StreakBadge } from '../components/StreakBadge';
import { XpBadge } from '../components/XpBadge';
import { useAppStore } from '../lib/store';
import { findDueQuestionIds } from '../lib/dashboard/due';

export default function HomePage() {
  const progress = useAppStore((s) => s.progress);
  const dueCount = findDueQuestionIds(progress).length;

  return (
    <section>
      <header className="mb-6">
        <p className="text-sm font-medium text-accent">AZ-104 Study</p>
        <h1 className="mt-1 text-3xl font-bold leading-tight">
          Mobile-first prep for the Azure Administrator exam.
        </h1>
        <p className="mt-3 text-fg-muted">
          Flashcards, quizzes, and product-ID drills across all five exam domains. Study in short
          sessions; come back tomorrow.
        </p>
      </header>

      <div className="grid gap-3">
        <StreakBadge />
        <XpBadge />
      </div>

      {dueCount > 0 && (
        <Link
          to={ROUTES.dailyReview}
          className="mt-6 block rounded-lg bg-accent/15 p-4 ring-1 ring-accent"
        >
          <p className="text-sm font-semibold text-accent">Daily review</p>
          <p className="mt-1 text-lg font-bold">{dueCount} due today</p>
          <p className="mt-1 text-sm text-fg-muted">
            Tap to review the cards that spaced repetition surfaced for today.
          </p>
        </Link>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <Link
          to={ROUTES.learn}
          className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-base font-semibold text-accent-fg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Start studying →
        </Link>
        <Link
          to={ROUTES.progress}
          className="inline-flex items-center justify-center rounded-md bg-bg-elevated px-5 py-3 text-base font-medium text-fg"
        >
          View progress
        </Link>
      </div>
    </section>
  );
}
