import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';

export default function FlashcardsPlaceholderPage() {
  return (
    <section>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Flashcards</h1>
        <p className="mt-1 text-fg-muted">Coming soon</p>
      </header>
      <p className="text-fg">
        Pick a topic, choose a session length, flip cards, and rate your recall. Your ratings feed
        spaced repetition so the hardest cards come back tomorrow and the easy ones rest.
      </p>
      <Link
        to={ROUTES.learn}
        className="mt-6 inline-flex rounded-md bg-bg-elevated px-4 py-2 text-sm font-medium"
      >
        ← Back to modes
      </Link>
    </section>
  );
}
