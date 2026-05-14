"""Pure-helper tests for bank/generate.py — no Azure deps required.

Run with:  python -m pytest bank/test_generate.py -q
   or:     python bank/test_generate.py   (built-in mini runner below)
"""

from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from bank.generate import (  # noqa: E402
    extract_json_array,
    extract_prompt_body,
    knowledge_files_for,
    existing_snippets,
    render_prompt,
    validate_items,
)


VALID_FLASHCARD = {
    "id": "a1000000-fc00-4000-8000-000000000099",
    "type": "flashcard",
    "domain": "networking",
    "topic": "nsg",
    "difficulty": 1,
    "source": "ai-generated",
    "content": {"front": "What is an NSG?", "back": "A stateful packet filter at the subnet/NIC level."},
}

VALID_MCQ = {
    "id": "b2000000-dc00-4000-8000-000000000099",
    "type": "mcq",
    "domain": "networking",
    "topic": "nsg",
    "difficulty": 2,
    "source": "ai-generated",
    "content": {
        "question": "Which best filters east-west VM traffic?",
        "options": {"A": "NSG", "B": "DNS", "C": "Bastion", "D": "App Gateway"},
        "correct": "A",
        "explanation": "NSGs filter at subnet/NIC; Bastion is for RDP/SSH.",
    },
}


class KnowledgeMapping(unittest.TestCase):
    def test_nsg_maps_to_module2(self):
        files = knowledge_files_for("networking", ["nsg"])
        self.assertEqual(files, ["lp5-module2-network-security-groups.md"])

    def test_multiple_topics_dedupe(self):
        files = knowledge_files_for("networking", ["nsg", "vnet"])
        self.assertIn("lp5-module2-network-security-groups.md", files)
        self.assertIn("lp5-module1-virtual-networks.md", files)
        self.assertEqual(len(files), len(set(files)))

    def test_unknown_topic_returns_empty(self):
        self.assertEqual(knowledge_files_for("networking", ["does-not-exist"]), [])


class JsonExtraction(unittest.TestCase):
    def test_plain_array(self):
        items = extract_json_array(json.dumps([VALID_FLASHCARD]))
        self.assertEqual(items, [VALID_FLASHCARD])

    def test_fenced_array(self):
        wrapped = "preamble\n```json\n" + json.dumps([VALID_FLASHCARD]) + "\n```\nGENERATED: 1 flashcard(s)"
        self.assertEqual(extract_json_array(wrapped), [VALID_FLASHCARD])

    def test_array_with_trailing_summary(self):
        text = json.dumps([VALID_FLASHCARD]) + "\nGENERATED: 1 flashcard(s) — domain: networking — topics: nsg"
        self.assertEqual(extract_json_array(text), [VALID_FLASHCARD])

    def test_nested_objects_dont_confuse_balance(self):
        items = [VALID_MCQ]
        self.assertEqual(extract_json_array(json.dumps(items)), items)

    def test_no_array_raises(self):
        with self.assertRaises(ValueError):
            extract_json_array("the agent forgot to emit JSON")


class Validation(unittest.TestCase):
    def test_accepts_valid_items(self):
        out = validate_items([VALID_FLASHCARD, VALID_MCQ], existing_ids=set())
        self.assertEqual(len(out.accepted), 2)
        self.assertEqual(out.rejected, [])

    def test_rejects_duplicate_id_in_existing(self):
        out = validate_items([VALID_FLASHCARD], existing_ids={VALID_FLASHCARD["id"]})
        self.assertEqual(out.accepted, [])
        self.assertIn("duplicate", out.rejected[0][1])

    def test_rejects_duplicate_within_batch(self):
        out = validate_items([VALID_FLASHCARD, VALID_FLASHCARD], existing_ids=set())
        self.assertEqual(len(out.accepted), 1)
        self.assertEqual(len(out.rejected), 1)

    def test_rejects_disallowed_topic(self):
        bad = {**VALID_FLASHCARD, "topic": "totally-made-up"}
        out = validate_items([bad], existing_ids=set())
        self.assertEqual(out.accepted, [])
        self.assertIn("topic", out.rejected[0][1])

    def test_rejects_mcq_with_wrong_options_keys(self):
        bad = {
            **VALID_MCQ,
            "content": {**VALID_MCQ["content"], "options": {"A": "x", "B": "y", "C": "z"}},
        }
        out = validate_items([bad], existing_ids=set())
        self.assertEqual(out.accepted, [])
        self.assertIn("options", out.rejected[0][1])

    def test_rejects_flat_legacy_shape(self):
        # The OLD prompt shape (front/back at top level) must be rejected.
        legacy = {
            "id": VALID_FLASHCARD["id"],
            "type": "flashcard",
            "domain": "networking",
            "topic": "nsg",
            "difficulty": 1,
            "source": "ai-generated",
            "front": "old shape",
            "back": "should fail",
        }
        out = validate_items([legacy], existing_ids=set())
        self.assertEqual(out.accepted, [])
        self.assertIn("content", out.rejected[0][1])

    def test_rejects_wrong_source(self):
        bad = {**VALID_FLASHCARD, "source": "bank"}
        out = validate_items([bad], existing_ids=set())
        self.assertEqual(out.accepted, [])
        self.assertIn("source", out.rejected[0][1])


class Prompt(unittest.TestCase):
    def test_extract_prompt_body_from_template(self):
        template = (ROOT / "bank" / "question-authoring-prompt.md").read_text()
        body = extract_prompt_body(template)
        self.assertIn("<DOMAIN>", body)
        self.assertIn("<KNOWLEDGE>", body)
        self.assertIn("GENERATED:", body)

    def test_render_substitutes_all_placeholders(self):
        tpl = (
            "Domain: <DOMAIN>\nTopics: <TOPICS>\nModes: <MODES>\n"
            "Difficulties: <DIFFICULTIES>\nCount: <COUNT>\n"
            "Existing:\n<EXISTING>\nKnowledge:\n<KNOWLEDGE>\n"
        )
        out = render_prompt(
            tpl,
            domain="networking",
            topics=["nsg", "firewall"],
            modes=["mcq"],
            difficulties=[1, 2],
            count=5,
            existing=["id1 | mcq | What is X?"],
            knowledge=[("a.md", "body-A"), ("b.md", "body-B")],
        )
        self.assertNotIn("<", out)  # no placeholder leftovers
        self.assertIn("nsg, firewall", out)
        self.assertIn("body-A", out)
        self.assertIn("body-B", out)
        self.assertIn("id1 | mcq | What is X?", out)


class Snippets(unittest.TestCase):
    def test_truncates_long_text(self):
        long_q = "x" * 500
        items = [
            {"id": "i1", "type": "flashcard", "content": {"front": long_q, "back": "b"}},
            {"id": "i2", "type": "mcq", "content": {"question": "q?", "options": {}, "correct": "A", "explanation": "e"}},
            {"id": "i3", "type": "product-id", "content": {"service_name": "Azure Bastion"}},
        ]
        out = existing_snippets(items)
        self.assertEqual(len(out), 3)
        self.assertTrue(out[0].endswith("x" * 10))  # cropped to 120
        self.assertLessEqual(len(out[0]), 200)
        self.assertIn("Azure Bastion", out[2])


if __name__ == "__main__":
    unittest.main(verbosity=2)
