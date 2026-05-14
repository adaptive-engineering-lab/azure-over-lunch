import { ROUTES } from '../lib/routes';
import { ModeCard } from '../components/ModeCard';

export default function LearnIndexPage() {
  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Pick a mode</h1>
        <p className="mt-1 text-fg-muted">
          Three ways to study. Start with whatever you have time for.
        </p>
      </header>

      <div className="grid gap-3">
        <ModeCard
          to={ROUTES.flashcards}
          title="Flashcards"
          description="Concept and term recall with self-rating. Short, focused sessions."
        />
        <ModeCard
          to={ROUTES.quiz}
          title="Quiz"
          description="Multiple-choice questions with explanations. Optional 45-second timer."
        />
        <ModeCard
          to={ROUTES.productId}
          title="Product ID"
          description="Match Azure service names to their categories."
        />
      </div>
    </section>
  );
}
