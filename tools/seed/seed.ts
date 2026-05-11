import { createClient } from '@supabase/supabase-js';
import { loadSeedEnv, EnvError } from './lib/env.js';
import { loadContent, DuplicateIdError } from './lib/load-content.js';
import { upsertQuestions } from './lib/upsert.js';

async function main(): Promise<void> {
  const env = loadSeedEnv();
  const started = Date.now();

  const items = await loadContent();

  if (env.dryRun) {
    console.log(`Dry run: ${items.length} items would be upserted. No writes performed.`);
    return;
  }

  const client = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await upsertQuestions(client, items);
  const elapsed = Date.now() - started;
  console.log(
    `Seed complete: ${result.inserted} inserted, ${result.updated} updated, ${result.unchanged} unchanged. Elapsed: ${elapsed}ms.`,
  );
}

main().catch((err: unknown) => {
  if (err instanceof EnvError) {
    console.error(err.message);
    process.exit(err.exitCode);
  }
  if (err instanceof DuplicateIdError) {
    console.error(err.message);
    process.exit(err.exitCode);
  }
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(12);
});
