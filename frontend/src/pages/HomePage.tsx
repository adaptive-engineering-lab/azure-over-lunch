import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { StreakBadge } from '../components/StreakBadge';
import { XpBadge } from '../components/XpBadge';

export default function HomePage() {
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

      <div className="mt-8 flex flex-col gap-3">
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
