import { Link } from 'react-router-dom';
import { DOMAINS, DOMAIN_LABELS, type Domain } from '../lib/questions/types';
import { useDomainCounts } from '../lib/dashboard/useDomainCounts';
import { ROUTES } from '../lib/routes';

const DOMAIN_ACCENT: Record<Domain, { ring: string; glow: string; emoji: string }> = {
  'identity-governance': { ring: 'ring-violet-500/40', glow: 'from-violet-500/20', emoji: '🛡️' },
  storage: { ring: 'ring-amber-500/40', glow: 'from-amber-500/20', emoji: '🗄️' },
  compute: { ring: 'ring-emerald-500/40', glow: 'from-emerald-500/20', emoji: '⚙️' },
  networking: { ring: 'ring-sky-500/40', glow: 'from-sky-500/20', emoji: '🌐' },
  monitoring: { ring: 'ring-rose-500/40', glow: 'from-rose-500/20', emoji: '📊' },
};

export function DomainCoverage() {
  const { byDomain, loading } = useDomainCounts();

  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg-muted">Domains</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {DOMAINS.map((d) => {
          const accent = DOMAIN_ACCENT[d];
          const count = byDomain[d];
          return (
            <Link
              key={d}
              to={`${ROUTES.quiz}?domain=${d}`}
              aria-label={`Start a ${DOMAIN_LABELS[d]} quiz`}
              className={[
                'group relative overflow-hidden rounded-xl bg-bg-elevated p-4 ring-1',
                accent.ring,
                'transition-transform hover:-translate-y-0.5',
              ].join(' ')}
            >
              <div
                aria-hidden
                className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${accent.glow} to-transparent blur-2xl`}
              />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none" aria-hidden>{accent.emoji}</span>
                  <span className="whitespace-nowrap text-xs font-medium text-fg-muted">
                    {loading ? '…' : `${count} question${count === 1 ? '' : 's'}`}
                  </span>
                </div>
                <p className="mt-3 text-base font-semibold leading-tight">{DOMAIN_LABELS[d]}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
