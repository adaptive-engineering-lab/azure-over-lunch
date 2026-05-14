import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { DOMAINS, type Domain } from '../questions/types';

export interface DomainCounts {
  byDomain: Record<Domain, number>;
  total: number;
  loading: boolean;
  error: string | null;
}

const EMPTY: Record<Domain, number> = {
  'identity-governance': 0,
  storage: 0,
  compute: 0,
  networking: 0,
  monitoring: 0,
};

/**
 * Fetches the question bank's domain × count breakdown in a single
 * lightweight query (id + domain only, ~6 KB for ~100 rows). Tallies
 * client-side so callers can render five domain cards without firing
 * five separate count requests.
 */
export function useDomainCounts(): DomainCounts {
  const [byDomain, setByDomain] = useState<Record<Domain, number>>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase()
      .from('questions')
      .select('domain')
      .then(({ data, error: e }) => {
        if (cancelled) return;
        if (e) {
          setError(e.message);
          setLoading(false);
          return;
        }
        const tally: Record<Domain, number> = { ...EMPTY };
        for (const row of (data ?? []) as { domain: Domain }[]) {
          if (DOMAINS.includes(row.domain)) tally[row.domain] += 1;
        }
        setByDomain(tally);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const total = DOMAINS.reduce((sum, d) => sum + byDomain[d], 0);
  return { byDomain, total, loading, error };
}
