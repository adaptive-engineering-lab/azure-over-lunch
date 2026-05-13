"""
Download every AZ-104 knowledge-base file from the project the
AZ104-ExamPrep-Agent uses. Filters out AI-103 / Foundry-agent course
material — keeps only the lp*-module*.md files that map to AZ-104
learning paths.

Run from repo root: python3 bank/download.py
Outputs to: bank/knowledge/<filename>
"""

import re
import os
from pathlib import Path
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

ENDPOINT = "https://demo-foundary-rag.services.ai.azure.com/api/projects/demo-rag-v"
OUT_DIR = Path(__file__).resolve().parent / "knowledge"
OUT_DIR.mkdir(exist_ok=True)

# AZ-104 module notes follow this naming convention.
AZ104_FILENAME = re.compile(r"^lp\d+-modules?\d.*\.md$", re.IGNORECASE)

client = AIProjectClient(endpoint=ENDPOINT, credential=DefaultAzureCredential())
openai_client = client.get_openai_client()

files = list(openai_client.files.list().data)
az104_files = [f for f in files if AZ104_FILENAME.match(f.filename or "")]

print(f"Project has {len(files)} files; {len(az104_files)} match AZ-104 naming convention.")
print(f"Downloading to {OUT_DIR}\n")

downloaded = 0
skipped = 0
for f in sorted(az104_files, key=lambda x: x.filename or ""):
    out_path = OUT_DIR / f.filename
    if out_path.exists() and out_path.stat().st_size > 0:
        print(f"  skip (already exists)  {f.filename}")
        skipped += 1
        continue
    try:
        content = openai_client.files.content(f.id)
        # The OpenAI client returns a HTTPX-ish response; read bytes.
        if hasattr(content, "read"):
            data = content.read()
        else:
            data = content.content
        out_path.write_bytes(data)
        size_kb = len(data) / 1024
        print(f"  ok  {f.filename}  ({size_kb:.1f} KB)")
        downloaded += 1
    except Exception as e:
        print(f"  FAIL  {f.filename}: {e}")

print(f"\nDone. Downloaded {downloaded}, skipped {skipped}.")
