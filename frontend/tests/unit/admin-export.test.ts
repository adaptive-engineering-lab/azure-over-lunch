import { describe, it, expect } from 'vitest';
import { buildExport } from '../../src/lib/admin/export';
import type { BankItem } from '../../src/lib/admin/staged';

const FIXED_DATE = new Date('2026-05-11T12:00:00Z');

function fc(id: string, front = 'q', back = 'a'): BankItem {
  return {
    id,
    type: 'flashcard',
    domain: 'storage',
    topic: 'blob',
    difficulty: 1,
    source: 'bank',
    content: { front, back },
  };
}

function mcq(id: string): BankItem {
  return {
    id,
    type: 'mcq',
    domain: 'networking',
    topic: 'nsg',
    difficulty: 2,
    source: 'bank',
    content: {
      question: 'q',
      options: { A: 'a', B: 'b', C: 'c', D: 'd' },
      correct: 'A',
      explanation: 'e',
    },
  };
}

describe('Admin export (feature 013)', () => {
  it('returns three files even when the bank is empty', () => {
    const files = buildExport({ bank: [], edits: {}, newItems: {}, removed: {}, reviewerId: 'la', now: FIXED_DATE });
    expect(files.map((f) => f.filename).sort()).toEqual(['flashcards.json', 'mcq.json', 'product-id.json']);
    expect(files.every((f) => f.items.length === 0)).toBe(true);
  });

  it('preserves untouched items verbatim', () => {
    const item = fc('00000000-0000-4000-8000-000000000001');
    const files = buildExport({ bank: [item], edits: {}, newItems: {}, removed: {}, reviewerId: 'la', now: FIXED_DATE });
    const flashcards = files.find((f) => f.filename === 'flashcards.json')!;
    expect(flashcards.items).toHaveLength(1);
    expect(flashcards.items[0]!.content).toEqual({ front: 'q', back: 'a' });
    // Untouched items keep their original reviewer/timestamp (in this case, none)
    expect(flashcards.items[0]!.reviewer_id).toBeUndefined();
  });

  it('stamps edited items with reviewer_id + reviewed_at', () => {
    const original = fc('00000000-0000-4000-8000-000000000002', 'orig-front', 'orig-back');
    const edited: BankItem = { ...original, content: { front: 'new-front', back: 'orig-back' } };
    const files = buildExport({
      bank: [original],
      edits: { [original.id]: edited },
      newItems: {},
      removed: {},
      reviewerId: 'la',
      now: FIXED_DATE,
    });
    const out = files.find((f) => f.filename === 'flashcards.json')!.items[0]!;
    expect((out.content as { front: string }).front).toBe('new-front');
    expect(out.reviewer_id).toBe('la');
    expect(out.reviewed_at).toBe(FIXED_DATE.toISOString());
  });

  it('omits soft-deleted items from the export', () => {
    const a = fc('00000000-0000-4000-8000-000000000003', 'a');
    const b = fc('00000000-0000-4000-8000-000000000004', 'b');
    const files = buildExport({
      bank: [a, b],
      edits: {},
      newItems: {},
      removed: { [a.id]: true },
      reviewerId: 'la',
      now: FIXED_DATE,
    });
    const out = files.find((f) => f.filename === 'flashcards.json')!;
    expect(out.items).toHaveLength(1);
    expect(out.items[0]!.id).toBe(b.id);
  });

  it('appends new items to the matching file with stamps', () => {
    const fresh = mcq('00000000-0000-4000-8000-000000000005');
    const files = buildExport({
      bank: [],
      edits: {},
      newItems: { [fresh.id]: fresh },
      removed: {},
      reviewerId: 'la',
      now: FIXED_DATE,
    });
    const out = files.find((f) => f.filename === 'mcq.json')!;
    expect(out.items).toHaveLength(1);
    expect(out.items[0]!.reviewer_id).toBe('la');
    expect(out.items[0]!.reviewed_at).toBe(FIXED_DATE.toISOString());
  });

  it('places items in the file that matches their type', () => {
    const f = fc('00000000-0000-4000-8000-000000000006');
    const m = mcq('00000000-0000-4000-8000-000000000007');
    const files = buildExport({
      bank: [f, m],
      edits: {},
      newItems: {},
      removed: {},
      reviewerId: 'la',
      now: FIXED_DATE,
    });
    expect(files.find((x) => x.filename === 'flashcards.json')!.items).toHaveLength(1);
    expect(files.find((x) => x.filename === 'mcq.json')!.items).toHaveLength(1);
    expect(files.find((x) => x.filename === 'product-id.json')!.items).toHaveLength(0);
  });
});
