#!/usr/bin/env python3
"""
WorshipLens Story Backfill -- Test Script
Re-analyzes a small list of specific songs by finding their .txt files
and upserting the updated review (with story_behind_song) back into Supabase.

Usage:
  python3 worshiplens_backfill_test.py

Place this file at ~/Desktop/worshiplens/worshiplens_backfill_test.py
(same folder as worshiplens_batch_runner.py)
"""

import os
import sys
from pathlib import Path

# ── Point this at your song library folder ────────────────────────────────────
# Update this path to wherever your .txt song files live
SONGS_DIR = Path.home() / 'Desktop' / 'Worship Lens Song Library'

# ── Songs to backfill (partial filename match, case-insensitive) ──────────────
SONGS_TO_BACKFILL = [
    'goodness-of-god',
    'great-things',
    '10000-reasons',
]

# ── Import everything from the main batch runner ──────────────────────────────
sys.path.insert(0, str(Path(__file__).parent))
from worshiplens_batch_runner import (
    parse_chordpro,
    generate_review,
    insert_song,
    score_color,
)

def find_song_file(songs_dir: Path, keyword: str):
    """Find a .txt file whose name contains the keyword."""
    keyword = keyword.lower().replace('-', '')
    for f in songs_dir.glob('*.txt'):
        name = f.stem.lower().replace('-', '').replace(' ', '')
        if keyword.replace('-', '') in name:
            return f
    return None

def main():
    if not SONGS_DIR.exists():
        print(f"ERROR: Songs directory not found: {SONGS_DIR}")
        print("Update the SONGS_DIR variable at the top of this script.")
        sys.exit(1)

    print(f"Songs directory: {SONGS_DIR}")
    print(f"Songs to backfill: {len(SONGS_TO_BACKFILL)}")
    print()

    for keyword in SONGS_TO_BACKFILL:
        filepath = find_song_file(SONGS_DIR, keyword)

        if not filepath:
            print(f"[NOT FOUND] No .txt file matching '{keyword}' in {SONGS_DIR}")
            print(f"  Tip: list your files with: ls '{SONGS_DIR}'")
            continue

        print(f"[FOUND] {filepath.name}")

        MAX_RETRIES = 3
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    text = f.read()

                parsed = parse_chordpro(text)

                if not parsed['title']:
                    print(f"  WARNING: Could not parse title, skipping.")
                    break

                print(f"  Title:  {parsed['title']}")
                print(f"  Artist: {parsed['artist']}")
                if attempt > 1:
                    print(f"  Attempt {attempt} of {MAX_RETRIES}...")
                else:
                    print(f"  Calling Claude API...")

                review = generate_review(parsed)
                story = review.get('story_behind_song', {})

                print(f"  Story available: {story.get('available')}")
                print(f"  Story items:     {len(story.get('items', []))}")

                if story.get('available') and story.get('items'):
                    print(f"  First item preview: {story['items'][0]['text'][:80]}...")
                else:
                    print(f"  WARNING: Story still empty -- check prompt.")

                overall = review.get('overall_score', 0)
                print(f"  Overall score:   {overall} ({score_color(overall)})")
                print(f"  Upserting into Supabase...")

                insert_song(parsed, review)
                print(f"  Done.")
                break

            except Exception as e:
                import time
                print(f"  ERROR (attempt {attempt}): {e}")
                if attempt < MAX_RETRIES:
                    print(f"  Retrying in 3 seconds...")
                    time.sleep(3)
                else:
                    print(f"  Failed after {MAX_RETRIES} attempts, moving on.")

        print()

    print("Backfill test complete.")
    print("Check your Supabase table and the live site to verify story data is showing.")

if __name__ == '__main__':
    main()
