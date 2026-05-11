import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOMAINS, DOMAIN_LABELS, type Domain } from '../lib/questions/types';
import { ROUTES } from '../lib/routes';

const COUNTS = [5, 10, 20] as const;
const DIFFS = [1, 2, 3] as const;

export default function QuizSelectPage() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState<Domain>('identity-governance');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [count, setCount] = useState<5 | 10 | 20>(10);
  const [timer, setTimer] = useState(false);

  function start() {
    const p = new URLSearchParams({
      domain,
      difficulty: String(difficulty),
      count: String(count),
      timer: timer ? '1' : '0',
    });
    navigate(`${ROUTES.quiz}/session?${p.toString()}`);
  }

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Quiz</h1>
        <p className="mt-1 text-fg-muted">Multiple choice with explanations. Pick your settings.</p>
      </header>

      <Fieldset legend="Domain">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {DOMAINS.map((d) => (
            <Pill key={d} active={domain === d} onClick={() => setDomain(d)}>
              {DOMAIN_LABELS[d]}
            </Pill>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Difficulty">
        <div className="flex gap-2">
          {DIFFS.map((d) => (
            <Pill key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
              {d === 1 ? 'Easy' : d === 2 ? 'Medium' : 'Hard'}
            </Pill>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Number of questions">
        <div className="flex gap-2">
          {COUNTS.map((n) => (
            <Pill key={n} active={count === n} onClick={() => setCount(n)}>
              {n}
            </Pill>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Timer (45s per question)">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={timer}
            onChange={(e) => setTimer(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          <span>Enable timer (AZ-104 exam pace)</span>
        </label>
      </Fieldset>

      <button
        type="button"
        onClick={start}
        className="mt-6 w-full rounded-md bg-accent px-4 py-3 text-base font-semibold text-accent-fg"
      >
        Start quiz
      </button>
    </section>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-4 rounded-lg bg-bg-elevated p-4">
      <legend className="px-1 text-sm font-semibold text-fg-muted">{legend}</legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'flex-1 rounded-md px-3 py-2 text-sm font-medium',
        active ? 'bg-accent text-accent-fg' : 'bg-bg text-fg',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
