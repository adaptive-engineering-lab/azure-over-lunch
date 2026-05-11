import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';

export default function ProductIdPlaceholderPage() {
  return (
    <section>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Product ID</h1>
        <p className="mt-1 text-fg-muted">Coming soon</p>
      </header>
      <p className="text-fg">
        Match Azure service names to their categories. A separate Memory Match sub-mode shows pairs
        you have to flip and align.
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
