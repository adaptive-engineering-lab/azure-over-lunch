# Quickstart: Supabase Schema & Seed

How to bring up the schema, seed the 50-item starter bank, and run the test suite from a fresh checkout.

---

## Prerequisites

- Node.js 20+ and `pnpm` (or npm/yarn — examples use pnpm).
- Docker Desktop running (the Supabase CLI uses it for the local stack).
- Supabase CLI installed: `brew install supabase/tap/supabase` or [docs](https://supabase.com/docs/guides/cli).
- A Supabase project provisioned for the remote `staging` environment (production wiring is later).

---

## 1. Bring up the local stack

```bash
supabase start
```

Outputs a local URL, anon key, and service-role key. Copy them into `tools/.env.local`:

```ini
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
```

Migrations under `supabase/migrations/` are applied automatically on `supabase start`. To re-apply after edits:

```bash
supabase db reset
```

---

## 2. Validate seed content

```bash
cd tools
pnpm install
pnpm seed:validate
```

Expected: `Validation complete: 50 items OK.`

If any item is rejected, the command exits with code 10 and prints one `[INVALID]` line per offender. Fix the JSON and re-run.

---

## 3. Apply the seed

```bash
pnpm seed
```

Expected on a fresh database:

```
Seed complete: 50 inserted, 0 updated, 0 unchanged. Elapsed: 412ms.
```

Run it again to confirm idempotency:

```bash
pnpm seed
```

Expected:

```
Seed complete: 0 inserted, 0 updated, 50 unchanged. Elapsed: 88ms.
```

If any row reports `updated`, either the source JSON changed or the content-hash short-circuit is broken — `tests/contract/seed-idempotency.test.ts` will fail in CI.

---

## 4. Smoke check from psql

```bash
supabase db psql
```

```sql
-- Domain coverage: every (domain, type) pair has at least one row
SELECT domain, type, count(*)
FROM public.questions
GROUP BY domain, type
ORDER BY domain, type;

-- AI-author audit invariant works
INSERT INTO public.questions (id, type, domain, topic, difficulty, source, content, content_hash)
VALUES (gen_random_uuid(), 'flashcard', 'storage', 'blob', 1, 'ai-generated',
        '{"front":"x","back":"y"}'::jsonb, 'fakehash');
-- Expected: ERROR — questions_ai_audit_chk
```

---

## 5. Run the test suite

```bash
cd tools
pnpm test
```

What runs:

- **Contract** — schema validation, idempotency, domain coverage.
- **Integration** — RLS isolation between two test users, profile auto-provision trigger, public question reads without auth.

All tests run against the local Supabase stack. CI runs the same commands against a per-PR Supabase preview branch.

---

## 6. Push to a remote environment (staging)

```bash
supabase link --project-ref <staging-ref>
supabase db push                       # apply migrations
SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<staging-sr-key> \
pnpm seed                              # apply seed
```

> The service-role key MUST come from a secret store (1Password, GitHub Actions secrets) — never from a checked-in file. Frontend code never uses this key.

---

## Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| `seed` reports `N updated` on an unchanged re-run | `content_hash` computation is non-deterministic (e.g., key order changes) | Ensure `canonicalize(content)` sorts keys before hashing. |
| RLS test sees user A's rows when querying as user B | RLS policy missing or `auth.uid()` not bound | Verify policy exists for the offending command (SELECT/INSERT/UPDATE/DELETE). |
| `profiles` row missing after sign-up | Trigger function lost `SECURITY DEFINER` or `search_path` | Re-apply migration `0006_profile_trigger.sql`. |
| Seed exits 12 mid-batch | Service-role key wrong or network down | Re-check env vars; the transaction will have rolled back, so the database is unchanged. |
