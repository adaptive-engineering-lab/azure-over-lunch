import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentHash } from './canonicalize.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(HERE, '..', '..', '..', 'supabase', 'seed', 'content');

const FILES = ['flashcards.json', 'mcq.json', 'product-id.json'] as const;

export interface QuestionItem {
  id: string;
  type: 'flashcard' | 'mcq' | 'product-id';
  domain: string;
  topic: string;
  difficulty: number;
  source: 'bank' | 'ai-generated';
  reviewer_id?: string;
  reviewed_at?: string;
  tags?: string[];
  content: Record<string, unknown>;
}

export interface LoadedItem extends QuestionItem {
  sourceFile: string;
  content_hash: string;
}

export class DuplicateIdError extends Error {
  readonly exitCode = 11;
}

export async function loadContent(): Promise<LoadedItem[]> {
  const all: LoadedItem[] = [];
  const seen = new Map<string, string>();

  for (const file of FILES) {
    const path = resolve(CONTENT_DIR, file);
    const raw = await readFile(path, 'utf8');
    const parsed = JSON.parse(raw) as QuestionItem[];
    for (const item of parsed) {
      if (seen.has(item.id)) {
        throw new DuplicateIdError(
          `Duplicate id ${item.id}: present in both ${seen.get(item.id)} and ${file}`,
        );
      }
      seen.set(item.id, file);
      all.push({
        ...item,
        sourceFile: file,
        content_hash: contentHash(item.content),
      });
    }
  }

  return all;
}
