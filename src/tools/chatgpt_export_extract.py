#!/usr/bin/env python3
"""
Extract a single conversation object from a ChatGPT data export JSON file.

Typical workflow:
1) Export data from ChatGPT (Settings -> Data Controls -> Export data).
2) Unzip the export.
3) Locate the chat history JSON file (often named `conversations.json`).
4) Extract one conversation by `conversation_id` into `conversation_export.json`.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Iterable


def _iter_conversations(obj: Any) -> Iterable[dict[str, Any]]:
    if isinstance(obj, list):
        for item in obj:
            if isinstance(item, dict):
                yield item
        return

    if isinstance(obj, dict):
        # Common wrappers
        for key in ("conversations", "items", "data"):
            val = obj.get(key)
            if isinstance(val, list):
                for item in val:
                    if isinstance(item, dict):
                        yield item
                return

        # Sometimes the export is already a single conversation object.
        if "conversation_id" in obj and isinstance(obj.get("mapping"), dict):
            yield obj
        return


def _find_by_id(conversations: Iterable[dict[str, Any]], conversation_id: str) -> dict[str, Any] | None:
    for c in conversations:
        if c.get("conversation_id") == conversation_id:
            return c
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="Path to export JSON (e.g. conversations.json)")
    ap.add_argument("--conversation-id", required=True, help="conversation_id to extract")
    ap.add_argument(
        "--output",
        required=True,
        help="Output path for extracted JSON (e.g. conversation_export.json)",
    )
    args = ap.parse_args()

    in_path = Path(args.input)
    out_path = Path(args.output)

    if not in_path.exists():
        print(f"Input file not found: {in_path}", file=sys.stderr)
        return 2

    with in_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    conversations = list(_iter_conversations(data))
    found = _find_by_id(conversations, args.conversation_id)
    if not found:
        print(
            "Conversation not found. "
            "Tip: open the export JSON and confirm the conversation_id value.",
            file=sys.stderr,
        )
        return 3

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(found, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Wrote: {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

