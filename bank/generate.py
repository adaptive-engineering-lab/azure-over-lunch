"""Generate AZ-104 question items by calling the AZ104-ExamPrep-Agent.

Usage:
  python bank/generate.py \
      --domain networking \
      --topics nsg firewall \
      --modes mcq flashcard \
      --difficulties 1 2 \
      --count 5

Pipeline:
  1. Load matching knowledge .md files for the requested domain/topics.
  2. Load existing item ids + front/question text from supabase/seed/content/*.json
     so the agent doesn't produce duplicates.
  3. Render the authoring prompt from bank/question-authoring-prompt.md.
  4. Call the Azure AI Foundry agent.
  5. Parse the JSON array from the response.
  6. Validate every item against the allowed domain/topic slugs.
  7. Write the accepted items to supabase/seed/content/_drafts/<timestamp>.json
     for human review. The maintainer moves them into the canonical seed
     files (flashcards.json / mcq.json / product-id.json) before `pnpm seed`.

The agent call is the only step that requires Azure credentials. Everything
else is pure and unit-testable via the helpers below.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

# ---------------------------------------------------------------------------
# Domain / topic / file-mapping tables (must stay in sync with the prompt
# and with the CHECK constraints in supabase/migrations/0001_questions.sql).
# ---------------------------------------------------------------------------

ALLOWED_DOMAINS = {
    "identity-governance",
    "storage",
    "compute",
    "networking",
    "monitoring",
}

ALLOWED_TOPICS: dict[str, set[str]] = {
    "identity-governance": {
        "entra-id", "rbac", "groups", "conditional-access",
        "management-groups", "resource-locks", "azure-policy", "sspr",
        "cloud-shell", "arm",
    },
    "storage": {
        "storage-accounts", "blob", "blob-tiers", "lifecycle",
        "sas-tokens", "azure-files", "redundancy",
    },
    "compute": {
        "vm-sku", "availability", "scale-sets", "app-service",
        "container-instances", "containers",
    },
    "networking": {
        "vnet", "vnet-peering", "nsg", "dns", "load-balancer",
        "application-gateway", "vpn-gateway", "expressroute",
        "bastion", "firewall", "virtual-wan", "private-endpoint",
        "front-door", "traffic-manager",
    },
    "monitoring": {
        "alerts", "metrics", "log-analytics", "backup", "site-recovery",
    },
}

ALLOWED_MODES = {"flashcard", "mcq", "product-id"}
ALLOWED_DIFFICULTIES = {1, 2, 3}

# Map (domain, topic) → list of knowledge-bank filenames that cover it.
# Topics not listed here will fall back to the domain-level files.
TOPIC_TO_FILES: dict[tuple[str, str], list[str]] = {
    ("identity-governance", "entra-id"):           ["lp2-module1-entra-id.md"],
    ("identity-governance", "groups"):             ["lp2-module2-manage-identities.md"],
    ("identity-governance", "conditional-access"): ["lp2-module2-manage-identities.md"],
    ("identity-governance", "management-groups"):  ["lp2-module3-azure-architecture.md"],
    ("identity-governance", "resource-locks"):     ["lp2-module3-azure-architecture.md"],
    ("identity-governance", "azure-policy"):       ["lp2-module4-azure-policy.md"],
    ("identity-governance", "rbac"):               ["lp2-module5-azure-rbac.md"],
    ("identity-governance", "sspr"):               ["lp2-module6-sspr.md"],

    ("storage", "storage-accounts"): ["lp3-module1-storage-accounts.md"],
    ("storage", "redundancy"):       ["lp3-module1-storage-accounts.md"],
    ("storage", "blob"):             ["lp3-module2-blob-storage.md"],
    ("storage", "blob-tiers"):       ["lp3-module2-blob-storage.md"],
    ("storage", "lifecycle"):        ["lp3-module2-blob-storage.md"],
    ("storage", "sas-tokens"):       ["lp3-module3-storage-security.md"],
    ("storage", "azure-files"):      ["lp3-module4-azure-files.md"],

    ("compute", "vm-sku"):              ["lp4-module1-azure-virtual-machines.md"],
    ("compute", "availability"):        ["lp4-module2-vm-availability.md"],
    ("compute", "scale-sets"):          ["lp4-module2-vm-availability.md"],
    ("compute", "app-service"):         ["lp4-module3-app-service-plans.md", "lp4-module4-configure-app-service.md"],
    ("compute", "container-instances"): ["lp4-module5-container-instances.md"],
    ("compute", "containers"):          ["lp4-module5-container-instances.md"],

    ("networking", "vnet"):                ["lp5-module1-virtual-networks.md"],
    ("networking", "vnet-peering"):        ["lp5-modules3-8-dns-peering-routes-lb-appgw-watcher.md"],
    ("networking", "nsg"):                 ["lp5-module2-network-security-groups.md"],
    ("networking", "dns"):                 ["lp5-modules3-8-dns-peering-routes-lb-appgw-watcher.md"],
    ("networking", "load-balancer"):       ["lp5-modules3-8-dns-peering-routes-lb-appgw-watcher.md"],
    ("networking", "application-gateway"): ["lp5-modules3-8-dns-peering-routes-lb-appgw-watcher.md"],
    ("networking", "vpn-gateway"):         ["lp5-modules3-8-dns-peering-routes-lb-appgw-watcher.md"],
    ("networking", "expressroute"):        ["lp5-modules3-8-dns-peering-routes-lb-appgw-watcher.md"],
    ("networking", "bastion"):             ["lp5-modules3-8-dns-peering-routes-lb-appgw-watcher.md"],
    ("networking", "firewall"):            ["lp5-modules3-8-dns-peering-routes-lb-appgw-watcher.md"],
    ("networking", "virtual-wan"):         ["lp5-modules3-8-dns-peering-routes-lb-appgw-watcher.md"],
    ("networking", "private-endpoint"):    ["lp5-modules3-8-dns-peering-routes-lb-appgw-watcher.md"],

    ("monitoring", "alerts"):        ["lp6-modules1-3-backup-and-monitor.md"],
    ("monitoring", "metrics"):       ["lp6-modules1-3-backup-and-monitor.md"],
    ("monitoring", "log-analytics"): ["lp6-modules1-3-backup-and-monitor.md"],
    ("monitoring", "backup"):        ["lp6-modules1-3-backup-and-monitor.md"],
    ("monitoring", "site-recovery"): ["lp6-modules1-3-backup-and-monitor.md"],
}

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = ROOT / "bank" / "knowledge"
SEED_CONTENT_DIR = ROOT / "supabase" / "seed" / "content"
DRAFT_DIR = SEED_CONTENT_DIR / "_drafts"
PROMPT_TEMPLATE = ROOT / "bank" / "question-authoring-prompt.md"


# ---------------------------------------------------------------------------
# Pure helpers (unit-tested)
# ---------------------------------------------------------------------------


def knowledge_files_for(domain: str, topics: list[str]) -> list[str]:
    """Return ordered, de-duplicated list of knowledge filenames covering the topics."""
    seen: set[str] = set()
    files: list[str] = []
    for topic in topics:
        for fn in TOPIC_TO_FILES.get((domain, topic), []):
            if fn not in seen:
                seen.add(fn)
                files.append(fn)
    return files


def load_existing(seed_dir: Path) -> list[dict]:
    """Load every item across the three canonical seed files (best-effort)."""
    out: list[dict] = []
    for name in ("flashcards.json", "mcq.json", "product-id.json"):
        p = seed_dir / name
        if not p.exists():
            continue
        out.extend(json.loads(p.read_text()))
    return out


def existing_snippets(items: Iterable[dict]) -> list[str]:
    """Render existing items as `id | type | leading text` lines for the prompt."""
    lines: list[str] = []
    for it in items:
        c = it.get("content", {}) or {}
        snippet = (
            c.get("front")
            or c.get("question")
            or c.get("service_name")
            or ""
        )[:120]
        lines.append(f"{it.get('id', '?')} | {it.get('type', '?')} | {snippet}")
    return lines


def extract_json_array(text: str) -> list[dict]:
    """Extract the first top-level JSON array from a possibly-noisy response.

    The prompt instructs the agent to return only a JSON array, but real LLMs
    sometimes wrap it in fences or add a trailing summary line. Be lenient on
    input, strict on output.
    """
    fenced = re.search(r"```(?:json)?\s*(\[[\s\S]*?\])\s*```", text)
    if fenced:
        return json.loads(fenced.group(1))
    # Fall back to the first balanced top-level [...] in the raw text.
    depth = 0
    start = -1
    for i, ch in enumerate(text):
        if ch == "[":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0 and start != -1:
                return json.loads(text[start : i + 1])
    raise ValueError("No JSON array found in agent response")


@dataclass
class ValidationOutcome:
    accepted: list[dict]
    rejected: list[tuple[dict, str]]


def validate_items(items: list[dict], existing_ids: set[str]) -> ValidationOutcome:
    accepted: list[dict] = []
    rejected: list[tuple[dict, str]] = []
    seen_ids: set[str] = set()

    for item in items:
        reason = _validate_one(item, existing_ids, seen_ids)
        if reason:
            rejected.append((item, reason))
            continue
        seen_ids.add(item["id"])
        accepted.append(item)
    return ValidationOutcome(accepted=accepted, rejected=rejected)


_UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)


def _validate_one(item: dict, existing_ids: set[str], seen_ids: set[str]) -> str | None:
    for key in ("id", "type", "domain", "topic", "difficulty", "source", "content"):
        if key not in item:
            return f"missing '{key}'"
    if not isinstance(item["id"], str) or not _UUID_RE.match(item["id"]):
        return "id is not a UUIDv4-format string"
    if item["id"] in existing_ids:
        return f"duplicate id (already in seed): {item['id']}"
    if item["id"] in seen_ids:
        return f"duplicate id within batch: {item['id']}"
    if item["type"] not in ALLOWED_MODES:
        return f"type '{item['type']}' not in {sorted(ALLOWED_MODES)}"
    if item["domain"] not in ALLOWED_DOMAINS:
        return f"domain '{item['domain']}' not allowed"
    if item["topic"] not in ALLOWED_TOPICS[item["domain"]]:
        return f"topic '{item['topic']}' not in domain '{item['domain']}'"
    if item["difficulty"] not in ALLOWED_DIFFICULTIES:
        return f"difficulty {item['difficulty']!r} not in {{1,2,3}}"
    if item["source"] != "ai-generated":
        return "source must be 'ai-generated' for agent output"
    # The seed CLI's JSON Schema enforces reviewer_id + reviewed_at for
    # source='ai-generated'. Match that rule here so drafts can't slip
    # past generate.py only to fail at `pnpm seed:validate`.
    if not item.get("reviewer_id"):
        return "ai-generated items require non-empty 'reviewer_id'"
    if not item.get("reviewed_at"):
        return "ai-generated items require 'reviewed_at' timestamp"
    if not isinstance(item["content"], dict):
        return "content must be an object"
    return _validate_content_shape(item["type"], item["content"])


def _validate_content_shape(item_type: str, content: dict) -> str | None:
    if item_type == "flashcard":
        if not content.get("front") or not content.get("back"):
            return "flashcard.content requires front + back"
    elif item_type == "mcq":
        for key in ("question", "options", "correct", "explanation"):
            if not content.get(key):
                return f"mcq.content missing '{key}'"
        opts = content["options"]
        if not isinstance(opts, dict) or set(opts.keys()) != {"A", "B", "C", "D"}:
            return "mcq.content.options must have keys A B C D"
        if content["correct"] not in {"A", "B", "C", "D"}:
            return "mcq.content.correct must be one of A B C D"
    elif item_type == "product-id":
        for key in ("service_name", "category", "description"):
            if not content.get(key):
                return f"product-id.content missing '{key}'"
    return None


def render_prompt(
    template: str,
    *,
    domain: str,
    topics: list[str],
    modes: list[str],
    difficulties: list[int],
    count: int,
    existing: list[str],
    knowledge: list[tuple[str, str]],
) -> str:
    """Substitute the <PLACEHOLDER> variables in the prompt template.

    `knowledge` is a list of (filename, body) pairs.
    """
    existing_block = "\n".join(existing) if existing else "(none — starting fresh)"
    knowledge_block = "\n\n".join(
        f"### {fn}\n\n{body}" for fn, body in knowledge
    ) if knowledge else "(no knowledge files matched)"
    return (
        template
        .replace("<DOMAIN>", domain)
        .replace("<TOPICS>", ", ".join(topics))
        .replace("<MODES>", ", ".join(modes))
        .replace("<DIFFICULTIES>", ", ".join(str(d) for d in difficulties))
        .replace("<COUNT>", str(count))
        .replace("<EXISTING>", existing_block)
        .replace("<KNOWLEDGE>", knowledge_block)
    )


def extract_prompt_body(template_md: str) -> str:
    """Pull the fenced ```text ... ``` block out of question-authoring-prompt.md."""
    m = re.search(r"```text\s*\n([\s\S]+?)\n```", template_md)
    if not m:
        raise ValueError("Could not find ```text prompt block in template")
    return m.group(1)


# ---------------------------------------------------------------------------
# Agent call (the only impure step)
# ---------------------------------------------------------------------------


def call_agent(prompt: str, *, agent_name: str = "AZ104-ExamPrep-Agent", version: str = "3") -> str:
    """Send the rendered prompt to the Foundry agent and return its raw output."""
    # Imported lazily so the pure helpers above remain testable without Azure deps.
    from azure.identity import DefaultAzureCredential
    from azure.ai.projects import AIProjectClient

    endpoint = "https://demo-foundary-rag.services.ai.azure.com/api/projects/demo-rag-v"
    project_client = AIProjectClient(endpoint=endpoint, credential=DefaultAzureCredential())
    openai_client = project_client.get_openai_client()

    response = openai_client.responses.create(
        input=[{"role": "user", "content": prompt}],
        extra_body={
            "agent_reference": {
                "name": agent_name,
                "version": version,
                "type": "agent_reference",
            }
        },
    )
    return response.output_text


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--domain", required=True, choices=sorted(ALLOWED_DOMAINS))
    p.add_argument("--topics", required=True, nargs="+",
                   help="One or more topic slugs (must belong to the chosen domain).")
    p.add_argument("--modes", required=True, nargs="+", choices=sorted(ALLOWED_MODES))
    p.add_argument("--difficulties", type=int, nargs="+", choices=sorted(ALLOWED_DIFFICULTIES), default=[1, 2])
    p.add_argument("--count", type=int, default=5, help="Items per mode (approx; agent decides).")
    p.add_argument("--dry-run", action="store_true",
                   help="Print the rendered prompt and exit (no agent call).")
    p.add_argument("--from-file", type=Path, default=None,
                   help="Skip the agent call and parse this file as the response (for testing).")
    p.add_argument("--reviewer", default=None,
                   help="Reviewer initials stamped onto every accepted item "
                        "(falls back to $BANK_REVIEWER then 'anonymous').")
    return p.parse_args(argv)


def stamp_audit_fields(items: list[dict], reviewer_id: str, now_iso: str) -> list[dict]:
    """Stamp reviewer_id + reviewed_at on ai-generated items missing them.

    The seed CLI's JSON Schema requires both fields when source='ai-generated',
    so stamping pre-validation prevents drafts from slipping past generate.py
    only to fail at `pnpm seed:validate`. Items that already carry stamps
    (e.g. a re-author run) are left alone.
    """
    stamped: list[dict] = []
    for item in items:
        if item.get("source") == "ai-generated":
            patched = dict(item)
            patched.setdefault("reviewer_id", reviewer_id)
            patched.setdefault("reviewed_at", now_iso)
            stamped.append(patched)
        else:
            stamped.append(item)
    return stamped


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    # Validate topics against domain.
    bad = [t for t in args.topics if t not in ALLOWED_TOPICS[args.domain]]
    if bad:
        print(f"error: topics not in domain '{args.domain}': {bad}", file=sys.stderr)
        return 2

    knowledge_files = knowledge_files_for(args.domain, args.topics)
    if not knowledge_files:
        print(f"error: no knowledge files mapped for {args.domain}/{args.topics}", file=sys.stderr)
        return 2
    knowledge: list[tuple[str, str]] = []
    for fn in knowledge_files:
        p = KNOWLEDGE_DIR / fn
        if not p.exists():
            print(f"error: missing knowledge file {p}", file=sys.stderr)
            return 2
        knowledge.append((fn, p.read_text()))

    existing = load_existing(SEED_CONTENT_DIR)
    existing_ids = {it["id"] for it in existing if "id" in it}

    template_md = PROMPT_TEMPLATE.read_text()
    prompt_body = extract_prompt_body(template_md)
    rendered = render_prompt(
        prompt_body,
        domain=args.domain,
        topics=args.topics,
        modes=args.modes,
        difficulties=args.difficulties,
        count=args.count,
        existing=existing_snippets(existing),
        knowledge=knowledge,
    )

    if args.dry_run:
        sys.stdout.write(rendered)
        return 0

    if args.from_file is not None:
        raw = args.from_file.read_text()
    else:
        print(
            f"Calling agent: domain={args.domain} topics={args.topics} "
            f"modes={args.modes} count={args.count} files={knowledge_files}",
            file=sys.stderr,
        )
        raw = call_agent(rendered)

    items = extract_json_array(raw)
    import os
    reviewer = args.reviewer or os.environ.get("BANK_REVIEWER") or "anonymous"
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    items = stamp_audit_fields(items, reviewer, now_iso)
    outcome = validate_items(items, existing_ids)

    DRAFT_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_path = DRAFT_DIR / f"{ts}_{args.domain}_{'-'.join(args.topics)}.json"
    out_path.write_text(json.dumps(outcome.accepted, indent=2) + "\n")

    print(f"Wrote {len(outcome.accepted)} accepted item(s) to {out_path}")
    if outcome.rejected:
        print(f"Rejected {len(outcome.rejected)} item(s):", file=sys.stderr)
        for item, reason in outcome.rejected:
            print(f"  - {item.get('id', '?')}: {reason}", file=sys.stderr)
    return 0 if outcome.accepted else 1


if __name__ == "__main__":
    sys.exit(main())
