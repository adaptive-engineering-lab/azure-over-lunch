import type { BankItem } from './staged';
import type { ItemType } from './validators';

export interface ExportInput {
  bank: BankItem[];
  edits: Record<string, BankItem>;
  newItems: Record<string, BankItem>;
  removed: Record<string, true>;
  reviewerId: string;
  now?: Date;
}

const FILENAME_BY_TYPE: Record<ItemType, string> = {
  flashcard: 'flashcards.json',
  mcq: 'mcq.json',
  'product-id': 'product-id.json',
};

export interface ExportFile {
  filename: string;
  items: BankItem[];
}

export function buildExport({ bank, edits, newItems, removed, reviewerId, now }: ExportInput): ExportFile[] {
  const ts = (now ?? new Date()).toISOString();

  // Apply edits + soft-deletes to the bank, then merge in new items.
  const byType: Record<ItemType, BankItem[]> = { flashcard: [], mcq: [], 'product-id': [] };
  for (const original of bank) {
    if (removed[original.id]) continue;
    const edited = edits[original.id];
    const effective = edited
      ? { ...edited, reviewer_id: reviewerId, reviewed_at: ts }
      : original;
    byType[effective.type].push(stripInternalKeys(effective));
  }
  for (const item of Object.values(newItems)) {
    const stamped = { ...item, reviewer_id: reviewerId, reviewed_at: ts };
    byType[item.type].push(stripInternalKeys(stamped));
  }

  return (Object.keys(byType) as ItemType[]).map((type) => ({
    filename: FILENAME_BY_TYPE[type],
    items: byType[type],
  }));
}

function stripInternalKeys(item: BankItem): BankItem {
  // Just ensure we don't serialize anything we accidentally added on the client.
  const { id, type, domain, topic, difficulty, source, reviewer_id, reviewed_at, content } = item;
  const result: BankItem = { id, type, domain, topic, difficulty, source, content };
  if (reviewer_id) result.reviewer_id = reviewer_id;
  if (reviewed_at) result.reviewed_at = reviewed_at;
  return result;
}

/** Trigger a download of the file in the user's browser. */
export function downloadFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
