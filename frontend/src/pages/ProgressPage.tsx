import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ROUTES } from '../lib/routes';
import { supabase } from '../lib/supabase';
import type { Domain } from '../lib/questions/types';
import { DOMAIN_LABELS } from '../lib/questions/types';
import { computeDomainStats, computeActivityCalendar } from '../lib/dashboard/aggregate';
import { RadarChart } from '../components/RadarChart';
import { StreakCalendar } from '../components/StreakCalendar';

export default function ProgressPage() {
  const progress = useAppStore((s) => s.progress);
  const sessions = useAppStore((s) => s.sessions);
  const profile = useAppStore((s) => s.profile);

  const [questionDomains, setQuestionDomains] = useState<Record<string, Domain>>({});

  useEffect(() => {
    let cancelled = false;
    supabase()
      .from('questions')
      .select('id, domain')
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map: Record<string, Domain> = {};
        for (const row of data) map[row.id] = row.domain;
        setQuestionDomains(map);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalQuestions = Object.keys(progress).length;
  const totalSessions = sessions.length;

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

  const domainStats = computeDomainStats(progress, questionDomains);
  const calendar = computeActivityCalendar(sessions);
  const totalSeen = domainStats.reduce((a, s) => a + s.answered, 0);
  const totalCorrect = domainStats.reduce((a, s) => a + s.correct, 0);
  const overallPct = totalSeen === 0 ? 0 : Math.round((totalCorrect / totalSeen) * 100);
  const weakAreas = domainStats.filter((s) => s.weak);

  return (
    <section>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Your progress</h1>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label="Streak" value={profile.streakDays} suffix="d" />
        <Tile label="XP" value={profile.xp} />
        <Tile label="Level" value={profile.level} />
        <Tile label="Accuracy" value={overallPct} suffix="%" />
      </div>

      <div className="mt-6 rounded-lg bg-bg-elevated p-4">
        <h2 className="text-sm font-semibold">By domain</h2>
        <div className="mt-4 flex justify-center">
          <RadarChart stats={domainStats} />
        </div>
      </div>

      {weakAreas.length > 0 && (
        <div className="mt-6 rounded-lg bg-warning/10 p-4">
          <h2 className="text-sm font-semibold text-warning">Focus areas</h2>
          <ul className="mt-3 space-y-2">
            {weakAreas.map((w) => (
              <li key={w.domain} className="flex items-center justify-between text-sm">
                <span>
                  {DOMAIN_LABELS[w.domain]} — {w.pct}%
                </span>
                <Link
                  to={`${ROUTES.flashcards}/session?domain=${w.domain}&length=10`}
                  className="rounded-md bg-bg-elevated px-3 py-1 text-xs font-medium text-fg"
                >
                  Review
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-lg bg-bg-elevated p-4">
        <h2 className="text-sm font-semibold">Activity (12 weeks)</h2>
        <div className="mt-3">
          <StreakCalendar cells={calendar} />
        </div>
        <p className="mt-3 text-xs text-fg-muted">
          {totalSessions} session{totalSessions === 1 ? '' : 's'} total.
        </p>
      </div>
    </section>
  );
}

function Tile({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-lg bg-bg-elevated p-3 text-center">
      <p className="text-xs uppercase tracking-wider text-fg-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">
        {value}
        {suffix && <span className="ml-0.5 text-base text-fg-muted">{suffix}</span>}
      </p>
    </div>
  );
}
