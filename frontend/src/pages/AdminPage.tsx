import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth/AuthProvider';
import { useIsAdmin } from '../lib/admin/useIsAdmin';
import { useAdminStore, type BankItem } from '../lib/admin/staged';
import { validateItem, type ItemType } from '../lib/admin/validators';
import { buildExport, downloadFile } from '../lib/admin/export';
import { supabase } from '../lib/supabase';
import { ROUTES } from '../lib/routes';
import { DOMAINS, DOMAIN_LABELS, type Domain } from '../lib/questions/types';

export default function AdminPage() {
  const { user } = useAuth();
  const adminStatus = useIsAdmin();
  const [bank, setBank] = useState<BankItem[] | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<ItemType | 'all'>('all');
  const [filterDomain, setFilterDomain] = useState<Domain | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [addingType, setAddingType] = useState<ItemType | null>(null);

  const edits = useAdminStore((s) => s.edits);
  const newItems = useAdminStore((s) => s.newItems);
  const removed = useAdminStore((s) => s.removed);
  const stageEdit = useAdminStore((s) => s.stageEdit);
  const revertEdit = useAdminStore((s) => s.revertEdit);
  const addNew = useAdminStore((s) => s.addNew);
  const removeNew = useAdminStore((s) => s.removeNew);
  const markRemoved = useAdminStore((s) => s.markRemoved);
  const unmarkRemoved = useAdminStore((s) => s.unmarkRemoved);
  const discardAll = useAdminStore((s) => s.discardAll);

  useEffect(() => {
    let cancelled = false;
    supabase()
      .from('questions')
      .select('id, type, domain, topic, difficulty, source, reviewer_id, reviewed_at, content')
      .then(({ data }) => {
        if (cancelled) return;
        setBank((data ?? []) as BankItem[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (adminStatus === 'loading') return <p className="text-fg-muted">Checking access…</p>;
  if (!user || adminStatus === 'no') {
    return (
      <section>
        <h1 className="text-2xl font-bold">Not authorized</h1>
        <p className="mt-3 text-fg-muted">This area is restricted to maintainers.</p>
        <Link to={ROUTES.home} className="mt-4 inline-flex rounded-md bg-bg-elevated px-4 py-2 text-sm">
          ← Home
        </Link>
      </section>
    );
  }
  if (!bank) return <p className="text-fg-muted">Loading bank…</p>;

  const reviewerId = user.email ?? user.id;
  const stagedCount = Object.keys(edits).length + Object.keys(newItems).length + Object.keys(removed).length;

  const visibleItems = bank
    .filter((it) => (filterType === 'all' ? true : it.type === filterType))
    .filter((it) => (filterDomain === 'all' ? true : it.domain === filterDomain))
    .filter((it) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        it.topic.toLowerCase().includes(q) ||
        JSON.stringify(it.content).toLowerCase().includes(q) ||
        it.id.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.type.localeCompare(b.type) || a.topic.localeCompare(b.topic));

  function onExport() {
    const files = buildExport({ bank: bank!, edits, newItems, removed, reviewerId });
    for (const f of files) downloadFile(f.filename, JSON.stringify(f.items, null, 2) + '\n');
  }

  function onDiscard() {
    if (confirm('Discard ALL staged edits, additions, and soft-deletes?')) discardAll();
  }

  return (
    <section>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Edits stage in your browser. Export downloads JSON files you commit through git. No live DB writes here.
        </p>
      </header>

      <div className="rounded-lg bg-warning/10 p-3 text-xs">
        Workflow: edit / add / remove → <strong>Export</strong> → drop files into
        <code className="mx-1 rounded bg-bg-elevated px-1">supabase/seed/content/</code> → <code className="mx-1 rounded bg-bg-elevated px-1">pnpm seed</code> → commit.
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Search by topic, content, or id…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border border-divider bg-bg px-3 py-2 text-sm"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ItemType | 'all')}
          className="rounded-md border border-divider bg-bg px-2 py-2 text-sm"
        >
          <option value="all">All types</option>
          <option value="flashcard">Flashcard</option>
          <option value="mcq">MCQ</option>
          <option value="product-id">Product-ID</option>
        </select>
        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value as Domain | 'all')}
          className="rounded-md border border-divider bg-bg px-2 py-2 text-sm"
        >
          <option value="all">All domains</option>
          {DOMAINS.map((d) => (
            <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          disabled={stagedCount === 0}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg disabled:opacity-50"
        >
          Export ({stagedCount})
        </button>
        {stagedCount > 0 && (
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-md bg-bg-elevated px-4 py-2 text-sm text-error"
          >
            Discard staged
          </button>
        )}
        <div className="ml-auto flex gap-2 text-xs">
          <button type="button" onClick={() => setAddingType('flashcard')} className="rounded-md bg-bg-elevated px-3 py-2">+ Flashcard</button>
          <button type="button" onClick={() => setAddingType('mcq')} className="rounded-md bg-bg-elevated px-3 py-2">+ MCQ</button>
          <button type="button" onClick={() => setAddingType('product-id')} className="rounded-md bg-bg-elevated px-3 py-2">+ Product-ID</button>
        </div>
      </div>

      {addingType && (
        <NewItemForm
          type={addingType}
          onSave={(item) => {
            addNew(item);
            setAddingType(null);
          }}
          onCancel={() => setAddingType(null)}
        />
      )}

      <ul className="mt-4 space-y-2">
        {Object.values(newItems).map((it) => (
          <li key={it.id} className="rounded-lg bg-success/10 p-3 ring-1 ring-success">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-success">NEW · {it.type} · {it.domain} · {it.topic}</p>
              <button type="button" onClick={() => removeNew(it.id)} className="text-xs text-error">Discard</button>
            </div>
            <p className="mt-2 text-sm">{summary(it)}</p>
          </li>
        ))}
        {visibleItems.map((original) => {
          const edited = edits[original.id];
          const effective = edited ?? original;
          const isRemoved = !!removed[original.id];
          const isOpen = openId === original.id;
          return (
            <li
              key={original.id}
              className={[
                'rounded-lg bg-bg-elevated p-3',
                isRemoved ? 'opacity-50 line-through' : '',
                edited ? 'ring-1 ring-warning' : '',
              ].join(' ')}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : original.id)}
                className="flex w-full items-baseline justify-between gap-2 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-fg-muted">
                    {effective.type} · {DOMAIN_LABELS[effective.domain as Domain] ?? effective.domain} · {effective.topic} · L{effective.difficulty}
                    {edited && <span className="ml-2 text-warning">edited</span>}
                    {isRemoved && <span className="ml-2 text-error">removing</span>}
                  </p>
                  <p className="mt-1 truncate text-sm">{summary(effective)}</p>
                </div>
                <span className="text-xs text-fg-muted">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <EditPanel
                  original={original}
                  draft={edited ?? original}
                  isRemoved={isRemoved}
                  onChange={(next) => stageEdit(next)}
                  onRevert={() => revertEdit(original.id)}
                  onToggleRemove={() => (isRemoved ? unmarkRemoved(original.id) : markRemoved(original.id))}
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function summary(it: BankItem): string {
  if (it.type === 'flashcard') return (it.content.front as string) ?? '';
  if (it.type === 'mcq') return (it.content.question as string) ?? '';
  if (it.type === 'product-id') return (it.content.service_name as string) ?? '';
  return '';
}

function EditPanel({
  original,
  draft,
  isRemoved,
  onChange,
  onRevert,
  onToggleRemove,
}: {
  original: BankItem;
  draft: BankItem;
  isRemoved: boolean;
  onChange: (next: BankItem) => void;
  onRevert: () => void;
  onToggleRemove: () => void;
}) {
  function setContentField(key: string, value: unknown) {
    onChange({ ...draft, content: { ...draft.content, [key]: value } });
  }

  const validation = validateItem(draft.type, { ...draft });
  const errors = validation.valid ? [] : validation.errors;
  const isEdited = JSON.stringify(original) !== JSON.stringify(draft);

  return (
    <div className="mt-3 space-y-3 border-t border-divider pt-3">
      <p className="text-xs text-fg-muted">id: <code>{original.id}</code></p>

      {draft.type === 'flashcard' && (
        <>
          <Field label="Front" value={draft.content.front as string} onChange={(v) => setContentField('front', v)} multiline />
          <Field label="Back" value={draft.content.back as string} onChange={(v) => setContentField('back', v)} multiline />
        </>
      )}

      {draft.type === 'mcq' && (
        <>
          <Field label="Question" value={draft.content.question as string} onChange={(v) => setContentField('question', v)} multiline />
          {(['A', 'B', 'C', 'D'] as const).map((letter) => (
            <Field
              key={letter}
              label={`Option ${letter}`}
              value={(draft.content.options as Record<string, string>)[letter]}
              onChange={(v) =>
                setContentField('options', { ...(draft.content.options as Record<string, string>), [letter]: v })
              }
            />
          ))}
          <Field label="Correct (A/B/C/D)" value={draft.content.correct as string} onChange={(v) => setContentField('correct', v.toUpperCase())} />
          <Field label="Explanation" value={draft.content.explanation as string} onChange={(v) => setContentField('explanation', v)} multiline />
        </>
      )}

      {draft.type === 'product-id' && (
        <>
          <Field label="Service name" value={draft.content.service_name as string} onChange={(v) => setContentField('service_name', v)} />
          <Field label="Category" value={draft.content.category as string} onChange={(v) => setContentField('category', v)} />
          <Field label="Description" value={draft.content.description as string} onChange={(v) => setContentField('description', v)} multiline />
        </>
      )}

      <Field label="Topic" value={draft.topic} onChange={(v) => onChange({ ...draft, topic: v })} />
      <Field
        label="Difficulty (1/2/3)"
        value={String(draft.difficulty)}
        onChange={(v) => onChange({ ...draft, difficulty: (Number(v) || 1) as 1 | 2 | 3 } as never)}
      />

      {errors.length > 0 && (
        <ul className="rounded-md bg-error/10 p-2 text-xs text-error">
          {errors.map((e, i) => (
            <li key={i}>
              {e.field}: {e.reason}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {isEdited && (
          <button type="button" onClick={onRevert} className="rounded-md bg-bg px-3 py-1.5 text-xs">
            Revert
          </button>
        )}
        <button
          type="button"
          onClick={onToggleRemove}
          className={`rounded-md px-3 py-1.5 text-xs ${isRemoved ? 'bg-bg' : 'bg-error/15 text-error'}`}
        >
          {isRemoved ? 'Keep' : 'Remove on export'}
        </button>
      </div>
    </div>
  );
}

function NewItemForm({
  type,
  onSave,
  onCancel,
}: {
  type: ItemType;
  onSave: (item: BankItem) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<BankItem>(() => makeBlank(type));
  const validation = validateItem(type, draft);
  const errors = validation.valid ? [] : validation.errors;
  return (
    <div className="mt-4 rounded-lg bg-success/10 p-4 ring-1 ring-success">
      <h2 className="text-base font-bold">New {type}</h2>
      <EditPanel
        original={draft}
        draft={draft}
        isRemoved={false}
        onChange={setDraft}
        onRevert={() => setDraft(makeBlank(type))}
        onToggleRemove={() => {}}
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={errors.length > 0}
          onClick={() => onSave(draft)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg disabled:opacity-50"
        >
          Stage new item
        </button>
        <button type="button" onClick={onCancel} className="rounded-md bg-bg-elevated px-4 py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="block font-medium text-fg-muted">{label}</span>
      {multiline ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-divider bg-bg px-3 py-2 text-fg"
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-divider bg-bg px-3 py-2 text-fg"
        />
      )}
    </label>
  );
}

function makeBlank(type: ItemType): BankItem {
  const id = crypto.randomUUID();
  if (type === 'flashcard') {
    return {
      id,
      type: 'flashcard',
      domain: 'storage',
      topic: '',
      difficulty: 1,
      source: 'bank',
      content: { front: '', back: '' },
    };
  }
  if (type === 'mcq') {
    return {
      id,
      type: 'mcq',
      domain: 'storage',
      topic: '',
      difficulty: 1,
      source: 'bank',
      content: { question: '', options: { A: '', B: '', C: '', D: '' }, correct: 'A', explanation: '' },
    };
  }
  return {
    id,
    type: 'product-id',
    domain: 'storage',
    topic: '',
    difficulty: 1,
    source: 'bank',
    content: { service_name: '', category: 'Storage', description: '' },
  };
}
