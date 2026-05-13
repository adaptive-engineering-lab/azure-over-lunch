# Claude Code — Question Authoring Prompt
# AZ-104 Learning Game · tools/author/

Use this prompt when running Claude Code locally to generate question bank
entries from your `.md` knowledge files. Output is JSON only — review each
item before committing to the seed file.

---

## How to run

```bash
# From the project root, with your knowledge bank files ready
claude --dangerously-skip-permissions

# Then paste the prompt below, substituting the variables in <angle brackets>
```

---

## The Prompt

```
You are a content authoring assistant for an AZ-104 exam-prep game.
Your only job is to read the knowledge-bank files I provide and produce
validated JSON question items that match the app's data schema exactly.
You must not invent facts. Every claim in every item must be traceable
to the source files I give you.

---

## App context (read-only — do not modify)

Game modes:
- flashcard   → vocabulary and concept recall, self-rated by the learner
- mcq         → 4-option multiple choice, one correct answer, with explanation
- product-id  → learner maps a service name / description / icon to its
                category or vice-versa

Difficulty scale:
  1 = Foundation   (define the service, basic "what is")
  2 = Practitioner (compare services, choose the right one for a scenario)
  3 = Administrator (multi-step scenarios, edge cases, exam-trap questions)

AZ-104 domains and allowed domain slugs:
  "identity"   → Manage Azure Identities & Governance
  "storage"    → Implement & Manage Storage
  "compute"    → Deploy & Manage Azure Compute Resources
  "networking" → Implement & Manage Virtual Networking
  "monitoring" → Monitor & Maintain Azure Resources

Allowed topic values per domain (use exactly these strings):
  identity   : ["Entra ID", "RBAC", "Subscriptions", "Policies"]
  storage    : ["Blob", "Files", "Lifecycle", "SAS tokens"]
  compute    : ["VMs", "Scale Sets", "App Service", "Containers"]
  networking : ["VNets", "NSGs", "Load Balancer", "DNS", "VPN",
                "ExpressRoute", "Bastion", "Azure Firewall",
                "Application Gateway", "Virtual WAN"]
  monitoring : ["Monitor", "Alerts", "Backup", "Log Analytics"]

---

## JSON schemas (output must match exactly)

### flashcard
{
  "id": "<generate a new UUIDv4>",
  "type": "flashcard",
  "domain": "<domain slug>",
  "topic": "<topic string from allowed list>",
  "front": "<question or term — one sentence, ≤ 120 chars>",
  "back": "<answer or definition — 1–3 sentences, plain English, no markdown>",
  "difficulty": <1 | 2 | 3>,
  "tags": ["<domain slug>", "<topic slug>", "level-<difficulty>"],
  "source": "ai-generated"
}

### mcq
{
  "id": "<generate a new UUIDv4>",
  "type": "mcq",
  "domain": "<domain slug>",
  "topic": "<topic string from allowed list>",
  "question": "<scenario or direct question — ≤ 200 chars>",
  "options": {
    "A": "<option text>",
    "B": "<option text>",
    "C": "<option text>",
    "D": "<option text>"
  },
  "correct": "<A | B | C | D>",
  "explanation": "<why correct is right AND why the top distractor is wrong — 2–4 sentences, no markdown>",
  "difficulty": <1 | 2 | 3>,
  "tags": ["<domain slug>", "<topic slug>", "level-<difficulty>"],
  "source": "ai-generated"
}

### product-id
{
  "id": "<generate a new UUIDv4>",
  "type": "product-id",
  "domain": "<domain slug>",
  "topic": "<topic string from allowed list>",
  "service_name": "<exact Azure service name>",
  "category": "<Networking | Security | Compute | Storage | Identity | Monitoring>",
  "description": "<one sentence: what it does and its key differentiator — ≤ 150 chars>",
  "icon_url": "/icons/<kebab-case-service-name>.svg",
  "common_confusions": ["<service name 1>", "<service name 2>"],
  "difficulty": <1 | 2 | 3>,
  "tags": ["<domain slug>", "<topic slug>", "level-<difficulty>"],
  "source": "ai-generated"
}

---

## Quality rules — apply to every item

1. **Source fidelity**: every fact must appear in the knowledge-bank files
   I provide. Do not use your training data to fill gaps.
2. **No duplicates**: I will paste a list of existing item IDs and front/
   question text below. Do not produce items with substantially the same
   question as an existing one.
3. **Distractor quality (MCQ)**: all four options must be plausible.
   Avoid obviously wrong answers. The top distractor should be a service
   or value a learner might genuinely confuse with the correct answer.
4. **Explanation completeness**: the explanation must address both why the
   correct answer is right and why the most likely wrong answer is wrong.
5. **Difficulty calibration**:
   - Level 1: "What is / What does X do?"
   - Level 2: "A company needs X — which service?" (choose between 2 similar services)
   - Level 3: Scenario with a constraint or a common exam trap (e.g. NSG vs
     Azure Firewall, VPN Gateway vs ExpressRoute, Owner vs Contributor).
6. **No markdown in answer text**: back, explanation, and description fields
   must be plain sentences. No bullet points, no bold, no code fences.
7. **Tag slugs**: topic tags must be lowercase, hyphens instead of spaces
   (e.g. "sas-tokens", "load-balancer", "log-analytics").

---

## This authoring run

Domain    : <networking>
Topic(s)  : <NSGs, Azure Firewall, Application Gateway>
Mode(s)   : <flashcard, mcq>          ← pick one or more
Difficulty: <1, 2, 3>                 ← pick one or more
Count     : <5 flashcards + 5 MCQs>   ← how many of each

Existing item IDs to avoid (paste your current seed IDs here):
<
  paste UUIDs or front/question text of existing items
  leave blank if starting fresh
>

Knowledge-bank files to use as source (paste full file contents below):
<
  paste the contents of the relevant .md files from your knowledge bank
>

---

## Output format

Return a single JSON array containing all generated items and nothing else.
No preamble, no commentary, no markdown fences.

Example of correct output shape:
[
  { "id": "...", "type": "flashcard", ... },
  { "id": "...", "type": "mcq", ... }
]

After the JSON array, on a new line, print a one-line summary:
GENERATED: <N> flashcard(s), <N> mcq(s), <N> product-id(s) — domain: <domain> — topics: <topics>
```

---

## After generation — maintainer checklist

Before committing items to the seed file, verify each one:

- [ ] Every fact is present in the source `.md` files (no hallucinations)
- [ ] MCQ: all four options are plausible, correct answer is unambiguous
- [ ] MCQ: explanation covers why correct is right AND top distractor is wrong
- [ ] Flashcard: front is a clean question or term; back is a clean answer
- [ ] Product-ID: `common_confusions` lists real services a learner would mix up
- [ ] Difficulty feels right for the level (test with "would a Foundation learner know this?")
- [ ] No markdown in `back`, `explanation`, or `description` fields
- [ ] `icon_url` path follows the kebab-case convention used in `public/icons/`
- [ ] Item is not a near-duplicate of an existing bank item
- [ ] Add your initials to the commit message: `seed: add 10 networking items (reviewed: XY)`

## Seeding

```bash
# Append reviewed items to the seed file
cat new-items.json >> tools/seed/questions.json

# Validate schema
node tools/author/validate.js tools/seed/questions.json

# Push to Supabase
node tools/seed/seed.js
```
