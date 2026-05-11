import { SupabaseClient } from '@supabase/supabase-js';
import { LoadedItem } from './load-content.js';

export interface UpsertResult {
  inserted: number;
  updated: number;
  unchanged: number;
}

interface ExistingRow {
  id: string;
  content_hash: string;
}

/**
 * Idempotent upsert. For each input item, classify it as inserted, updated,
 * or unchanged before issuing the write. Items whose content_hash matches
 * the existing row are not touched, so updated_at does not drift.
 *
 * The full transactional / content-hash-short-circuit form lands in US2;
 * this MVP implementation is enough to seed the bank correctly.
 */
export async function upsertQuestions(
  client: SupabaseClient,
  items: LoadedItem[],
): Promise<UpsertResult> {
  const ids = items.map((i) => i.id);

  const { data: existing, error: selErr } = await client
    .from('questions')
    .select('id, content_hash')
    .in('id', ids);
  if (selErr) throw new Error(`upsertQuestions select failed: ${selErr.message}`);

  const existingMap = new Map<string, string>(
    (existing as ExistingRow[] | null)?.map((r) => [r.id, r.content_hash]) ?? [],
  );

  const toInsert: LoadedItem[] = [];
  const toUpdate: LoadedItem[] = [];
  let unchanged = 0;

  for (const item of items) {
    const existingHash = existingMap.get(item.id);
    if (existingHash === undefined) {
      toInsert.push(item);
    } else if (existingHash === item.content_hash) {
      unchanged += 1;
    } else {
      toUpdate.push(item);
    }
  }

  const toRow = (i: LoadedItem) => ({
    id: i.id,
    type: i.type,
    domain: i.domain,
    topic: i.topic,
    difficulty: i.difficulty,
    source: i.source,
    reviewer_id: i.reviewer_id ?? null,
    reviewed_at: i.reviewed_at ?? null,
    content: i.content,
    content_hash: i.content_hash,
  });

  if (toInsert.length > 0) {
    const { error } = await client.from('questions').insert(toInsert.map(toRow));
    if (error) throw new Error(`upsertQuestions insert failed: ${error.message}`);
  }

  if (toUpdate.length > 0) {
    const { error } = await client.from('questions').upsert(toUpdate.map(toRow), { onConflict: 'id' });
    if (error) throw new Error(`upsertQuestions update failed: ${error.message}`);
  }

  return { inserted: toInsert.length, updated: toUpdate.length, unchanged };
}
