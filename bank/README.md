# bank/ — AI-assisted question authoring

Tools and source notes for generating AZ-104 question items via the
**AZ104-ExamPrep-Agent** (Azure AI Foundry) and feeding them into the
Supabase question bank.

## Layout

```text
bank/
├── agent.py                       # Minimal probe — confirms agent is reachable
├── generate.py                    # Main authoring CLI (see below)
├── test_generate.py               # Pure-helper unit tests (no Azure deps)
├── inspect-agent.py               # Ad-hoc agent introspection
├── download.py                    # Pull learning-path content (one-off)
├── question-authoring-prompt.md   # Prompt template (rendered by generate.py)
└── knowledge/                     # Source-of-truth .md notes per module
    ├── lp1-module1-azure-cloud-shell.md
    ├── …
    └── lp6-modules1-3-backup-and-monitor.md
```

## End-to-end pipeline

```text
knowledge/*.md  ──▶  generate.py  ──▶  supabase/seed/content/_drafts/<ts>.json
                                                │
                                                ▼  (human review against checklist)
                                       supabase/seed/content/{flashcards,mcq,product-id}.json
                                                │
                                                ▼  pnpm seed   (upsert by id)
                                       public.questions in Supabase
```

The draft folder is gitignored. The canonical seed files **are** committed —
they remain the source of truth for the live bank, so a fresh checkout can
reproduce the question set with `pnpm seed`.

## Setup (first time)

```bash
pip install azure-ai-projects>=2.1.0 azure-identity
az login   # or: az login --service-principal --tenant <…>
```

The agent endpoint is hard-coded in `generate.py` (and matches `agent.py`).
Update both if the Foundry project moves.

## Usage

```bash
# 1. Dry-run: render the prompt without spending agent quota
python3 bank/generate.py \
  --domain networking --topics nsg firewall \
  --modes mcq flashcard --difficulties 1 2 --count 5 --dry-run

# 2. Live run: calls the agent, validates, writes a draft
python3 bank/generate.py \
  --domain networking --topics nsg firewall \
  --modes mcq flashcard --difficulties 1 2 --count 5
# → supabase/seed/content/_drafts/<UTC-timestamp>_networking_nsg-firewall.json

# 3. Replay a saved response (no Azure call) — handy for debugging the parser
python3 bank/generate.py \
  --domain networking --topics nsg --modes mcq \
  --from-file /tmp/last-agent-response.txt
```

### Allowed parameter values

| Flag             | Allowed values                                                     |
|------------------|--------------------------------------------------------------------|
| `--domain`       | `identity-governance`, `storage`, `compute`, `networking`, `monitoring` |
| `--topics`       | Topic slugs belonging to the chosen domain (see `generate.py` `ALLOWED_TOPICS`) |
| `--modes`        | `flashcard`, `mcq`, `product-id` (one or more)                     |
| `--difficulties` | `1`, `2`, `3` (one or more)                                        |
| `--count`        | Items per mode (approximate — the agent decides the final split)   |

## Review checklist (before promoting drafts)

The agent's output goes through automatic validation in `generate.py` —
items with the wrong shape, slugs, or duplicate ids are rejected to stderr
and never reach the draft file. Everything that does land in `_drafts/`
still needs **human** review:

- [ ] Every fact appears in the source `.md` file (no hallucinations)
- [ ] MCQ: all four options plausible; correct answer unambiguous
- [ ] MCQ: explanation covers BOTH why correct is right AND why the
      top distractor is wrong
- [ ] Flashcard: clean question, clean answer
- [ ] Product-ID: `common_confusions` lists real services a learner could mix up
- [ ] Difficulty feels right for the level
- [ ] No markdown in `back`, `explanation`, `description`
- [ ] Not a near-duplicate of an existing bank item

Move good items from `_drafts/<ts>.json` into the matching canonical seed file
(`supabase/seed/content/flashcards.json`, `mcq.json`, or `product-id.json`),
then:

```bash
pnpm seed
git commit -m "seed: add 10 networking items (reviewed: XY)"
```

## Testing the tooling

```bash
python3 bank/test_generate.py
```

18 tests, no Azure deps. Covers knowledge-file mapping, JSON-array extraction
(plain / fenced / with trailing summary), every validation rule, and
placeholder substitution in the rendered prompt.

## Why this design

1. **Git is the audit trail.** Each batch is a reviewable PR diff before it
   touches the DB. No service-role key in the loop.
2. **Drafts isolate failures.** A bad batch lands in a gitignored folder —
   `pnpm seed` only reads the canonical files, so a half-reviewed run
   cannot corrupt the bank.
3. **The seed CLI already handles upsert.** Re-running is idempotent; the
   `content_hash` derived from the canonical JSON form catches near-duplicates.
4. **Pure helpers are unit-tested.** The only impure step (`call_agent`)
   is one function; everything else is deterministic and tested in CI.
