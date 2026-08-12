#!/usr/bin/env python3
import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

try:
    import anthropic
    from dotenv import load_dotenv
    from supabase import create_client
except ImportError as e:
    print(f"Missing package: {e.name}")
    print("Run: pip3 install anthropic supabase python-dotenv")
    sys.exit(1)

PROJECT = Path.home() / "Desktop" / "worshiplens"
load_dotenv(PROJECT / ".env.local")

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

if not all([ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    print("ERROR: Missing ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, or a Supabase key in .env.local")
    sys.exit(1)

REVIEW_TEXT_CANDIDATES = [
    "defense_brief", "scriptural_fidelity_notes", "theological_clarity_notes",
    "singability_notes", "poetic_quality_notes", "overall_review",
    "review_summary", "summary", "notes",
]


def build_review_context(row):
    parts = []
    for col in REVIEW_TEXT_CANDIDATES:
        val = row.get(col)
        if isinstance(val, str) and val.strip():
            parts.append(val.strip())
        elif isinstance(val, dict):
            text = val.get("text") or val.get("notes") or val.get("summary")
            if isinstance(text, str) and text.strip():
                parts.append(text.strip())
    return "\n\n".join(parts)[:3000]


def get_untagged_songs(sb):
    rows, page = [], 0
    while True:
        res = sb.table("songs").select("*").range(page * 1000, (page + 1) * 1000 - 1).execute()
        if not res.data:
            break
        rows.extend(res.data)
        if len(res.data) < 1000:
            break
        page += 1
    return [r for r in rows if not r.get("themes") or (isinstance(r.get("themes"), list) and len(r["themes"]) == 0)]


def extract_themes(client, row):
    title = row.get("title", "")
    artist = row.get("artist", "")
    context = build_review_context(row) or "(No review text on file for this song.)"

    prompt = f"""You are tagging a worship song with theological and thematic tags for a
worship song review platform. Based on the song title, artist, and any review
notes below, return 3 to 6 short theme tags a worship leader would use to find
similar songs by topic (e.g. "grace", "identity in Christ", "lament",
"communion", "the cross", "God's names", "trust", "resurrection").

Lowercase, no em dashes, no punctuation beyond the words themselves.

SONG: {title} by {artist}

NOTES:
{context}

Return ONLY valid JSON: {{"themes": ["tag one", "tag two", "tag three"]}}"""

    message = client.messages.create(model="claude-sonnet-4-5", max_tokens=200, messages=[{"role": "user", "content": prompt}])
    raw = message.content[0].text.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    data = json.loads(raw)
    return [t.strip().lower() for t in data.get("themes", []) if isinstance(t, str) and t.strip()]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--limit", type=int, default=None)
    args = ap.parse_args()

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    print("Finding songs with no themes...")
    untagged = get_untagged_songs(sb)
    print(f"  {len(untagged)} songs have no themes")
    if not untagged:
        print("Nothing to do.")
        return

    if not args.write:
        preview_n = args.limit or 5
        print(f"\n  DRY RUN: showing what {preview_n} of {len(untagged)} songs would get tagged.")
        print("  No writes will happen. Re-run with --write to actually update Supabase.")
        print(f"  Estimated cost for all {len(untagged)} songs: roughly ${len(untagged) * 0.0015:.2f}\n")
        untagged = untagged[:preview_n]
    elif args.limit:
        untagged = untagged[: args.limit]

    updated, failed = 0, []
    for i, row in enumerate(untagged, 1):
        title, artist = row.get("title", "?"), row.get("artist", "")
        print(f"[{i}/{len(untagged)}] {title} - {artist}")
        try:
            themes = extract_themes(client, row)
            if not themes:
                print("    No themes returned, skipping.")
                failed.append(title)
                continue
            print(f"    themes: {', '.join(themes)}")
            if args.write:
                sb.table("songs").update({"themes": themes}).eq("id", row["id"]).execute()
                updated += 1
            time.sleep(0.3)
        except Exception as e:
            print(f"    FAILED: {e}")
            failed.append(title)

    print()
    print(f"Updated {updated} songs." if args.write else "Dry run complete. Re-run with --write to save these to Supabase.")
    if failed:
        print(f"Failed or skipped: {len(failed)}")
        for t in failed:
            print(f"  - {t}")


if __name__ == "__main__":
    main()
