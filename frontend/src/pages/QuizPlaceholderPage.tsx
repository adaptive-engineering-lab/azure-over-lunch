import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';

export default function QuizPlaceholderPage() {
  return (
    <section>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Quiz</h1>
        <p className="mt-1 text-fg-muted">Coming soon</p>
      </header>
      <p className="text-fg">
        Four-option multiple choice with full explanations, optional 45-second timer, and a
        per-domain breakdown at the end so you know what to study next.
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
