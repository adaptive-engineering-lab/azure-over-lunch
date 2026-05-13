"""
Probe AZ104-ExamPrep-Agent to discover what knowledge data it has and
whether the underlying files are downloadable. This is read-only.

Run from repo root: python3 bank/inspect-agent.py
"""

import json
import sys
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

ENDPOINT = "https://demo-foundary-rag.services.ai.azure.com/api/projects/demo-rag-v"
AGENT_NAME = "AZ104-ExamPrep-Agent"
AGENT_VERSION = "3"

client = AIProjectClient(endpoint=ENDPOINT, credential=DefaultAzureCredential())


def dump(label, obj):
    print(f"\n=== {label} ===")
    try:
        # Best-effort serialize SDK objects
        if hasattr(obj, "as_dict"):
            print(json.dumps(obj.as_dict(), indent=2, default=str)[:4000])
        else:
            print(json.dumps(obj, indent=2, default=str)[:4000])
    except Exception as e:
        print(f"(could not serialize: {e})")
        print(obj)


# ---------- 1. List agents ----------
print("Listing agents in project...")
try:
    agents = list(client.agents.list())
    for a in agents[:10]:
        name = getattr(a, "name", None) or getattr(a, "id", "?")
        print(f"  - {name}")
except AttributeError:
    # 2.x renames; try alternates
    print("  client.agents.list() not available — trying client.agents.list_agents()")
    try:
        agents = list(client.agents.list_agents())
        for a in agents[:10]:
            print(f"  - {getattr(a, 'name', '?')}")
    except Exception as e:
        print(f"  fallback also failed: {e}")
except Exception as e:
    print(f"  list failed: {e}")

# ---------- 2. Get the specific agent definition ----------
print(f"\nFetching {AGENT_NAME} v{AGENT_VERSION}...")
agent_def = None
for fn_name in ("get", "get_version", "get_agent_version", "get_agent"):
    fn = getattr(client.agents, fn_name, None)
    if not fn:
        continue
    try:
        try:
            agent_def = fn(name=AGENT_NAME, version=AGENT_VERSION)
        except TypeError:
            agent_def = fn(AGENT_NAME, AGENT_VERSION)
        print(f"  used {fn_name}()")
        break
    except Exception as e:
        print(f"  {fn_name}() failed: {e}")

if agent_def:
    dump("Agent definition", agent_def)
else:
    print("  Could not fetch the agent definition with any known method.")
    sys.exit(1)

# ---------- 3. Discover knowledge store ----------
# An Azure AI Foundry agent typically references a vector store via
# tool_resources.file_search.vector_store_ids. Try a few attribute paths.
def get_attr(obj, *path):
    cur = obj
    for p in path:
        if cur is None:
            return None
        if isinstance(cur, dict):
            cur = cur.get(p)
        else:
            cur = getattr(cur, p, None)
    return cur

vs_ids = (
    get_attr(agent_def, "tool_resources", "file_search", "vector_store_ids")
    or get_attr(agent_def, "tool_resources", "file_search", "vector_stores")
)
if isinstance(vs_ids, list):
    vs_ids = [
        v if isinstance(v, str) else (v.get("id") if isinstance(v, dict) else getattr(v, "id", None))
        for v in vs_ids
    ]
print(f"\nVector store ids: {vs_ids}")

# Also dump the raw tool_resources for inspection
dump("tool_resources", get_attr(agent_def, "tool_resources"))

# ---------- 4. List files in each vector store ----------
openai_client = client.get_openai_client()

if vs_ids:
    for vs_id in vs_ids:
        if not vs_id:
            continue
        print(f"\nVector store {vs_id} — listing files via OpenAI client...")
        try:
            files = openai_client.vector_stores.files.list(vector_store_id=vs_id)
            for f in files.data[:20]:
                print(f"  - {f.id}  status={getattr(f, 'status', '?')}")
        except Exception as e:
            print(f"  list failed: {e}")

# ---------- 5. List all openai-style files visible to this project ----------
print("\nProject-level files (openai.files.list)...")
try:
    files = openai_client.files.list()
    for f in files.data[:30]:
        purpose = getattr(f, "purpose", "?")
        filename = getattr(f, "filename", "?")
        print(f"  - {f.id}  purpose={purpose}  filename={filename}")
except Exception as e:
    print(f"  list failed: {e}")
