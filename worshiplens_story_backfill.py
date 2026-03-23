#!/usr/bin/env python3
"""
WorshipLens Story Backfill -- Full Library
Pulls all songs from Supabase where story_behind_song.available = false,
finds their .txt files, re-analyzes via Claude, and upserts back.

Saves progress after every song so you can safely interrupt and restart.

Usage:
  python3 worshiplens_story_backfill.py

Place this file at ~/Desktop/worshiplens/
"""

import os
import sys
import json
import time
from pathlib import Path

# ── Point this at your song library folder ────────────────────────────────────
SONGS_DIR = Path(os.environ.get('SONGS_DIR', str(Path.home() / 'Desktop' / 'Worship Lens Song Library')))

# ── Progress file (safe to delete to restart from scratch) ────────────────────
PROGRESS_FILE = Path(__file__).parent / '.story_backfill_progress.json'

# ── Import everything from the main batch runner ──────────────────────────────
sys.path.insert(0, str(Path(__file__).parent))
from worshiplens_batch_runner import (
    parse_chordpro,
    generate_review,
    insert_song,
    score_color,
    SUPABASE_URL,
    SUPABASE_KEY,
)

# ── Progress helpers ──────────────────────────────────────────────────────────

def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {}

def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

# ── Fetch songs needing backfill from Supabase ────────────────────────────────

def fetch_songs_needing_story():
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Fetch all songs, filter in Python for story_behind_song.available = false
    result = supabase.table('songs').select('slug, title, ccli_number, story_behind_song').execute()
    needs_story = []
    for row in result.data:
        story = row.get('story_behind_song') or {}
        if not story.get('available', False):
            needs_story.append(row)
    return needs_story

# ── File finder ───────────────────────────────────────────────────────────────

def normalize(s):
    """Strip punctuation and lowercase for fuzzy matching."""
    import re
    return re.sub(r'[^a-z0-9]', '', s.lower())

def find_song_file(songs_dir, title, ccli_number=None):
    """Try CCLI number match first, then normalized title match."""
    all_files = list(songs_dir.glob('*.txt'))

    # Try CCLI match first (most reliable)
    if ccli_number:
        ccli_str = str(ccli_number).strip()
        for f in all_files:
            if ccli_str in f.name:
                return f

    # Fall back to normalized title match
    norm_title = normalize(title)
    for f in all_files:
        if normalize(f.stem).startswith(norm_title[:12]):
            return f

    # Broader search -- title words contained in filename
    words = [w for w in normalize(title).split() if len(w) > 3]
    if words:
        for f in all_files:
            fname = normalize(f.stem)
            if all(w in fname for w in words[:2]):
                return f

    return None

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not SONGS_DIR.exists():
        print(f"ERROR: Songs directory not found: {SONGS_DIR}")
        print("Set SONGS_DIR environment variable or update the path at the top of this script.")
        sys.exit(1)

    print(f"Songs directory: {SONGS_DIR}")
    print()
    print("Fetching songs needing story backfill from Supabase...")

    songs = fetch_songs_needing_story()
    print(f"Found {len(songs)} songs with story_behind_song.available = false")
    print()

    progress = load_progress()
    already_done = [s for s, v in progress.items() if v == 'done']
    print(f"Already backfilled this session: {len(already_done)}")
    remaining = [s for s in songs if s['slug'] not in progress or progress[s['slug']] != 'done']
    print(f"Remaining: {len(remaining)}")
    print()

    not_found = []
    failed = []

    for i, song in enumerate(remaining):
        slug = song['slug']
        title = song['title']
        ccli = song.get('ccli_number', '')

        print(f"[{i+1}/{len(remaining)}] {title}")

        filepath = find_song_file(SONGS_DIR, title, ccli)
        if not filepath:
            print(f"  NOT FOUND -- no matching .txt file, skipping")
            not_found.append(title)
            progress[slug] = 'not_found'
            save_progress(progress)
            continue

        print(f"  File: {filepath.name}")

        MAX_RETRIES = 3
        success = False
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    text = f.read()

                parsed = parse_chordpro(text)

                if not parsed['title']:
                    print(f"  WARNING: Could not parse title, skipping.")
                    break

                if attempt > 1:
                    print(f"  Attempt {attempt} of {MAX_RETRIES}...")
                else:
                    print(f"  Calling Claude API...")

                review = generate_review(parsed)
                story = review.get('story_behind_song', {})

                print(f"  Story available: {story.get('available')}  |  Items: {len(story.get('items', []))}")

                if story.get('available') and story.get('items'):
                    print(f"  Preview: {story['items'][0]['text'][:80]}...")

                overall = review.get('overall_score', 0)
                print(f"  Score: {overall} ({score_color(overall)})  |  Upserting...")

                insert_song(parsed, review)
                print(f"  Done.")
                progress[slug] = 'done'
                save_progress(progress)
                success = True
                break

            except Exception as e:
                print(f"  ERROR (attempt {attempt}): {e}")
                if attempt < MAX_RETRIES:
                    print(f"  Retrying in 4 seconds...")
                    time.sleep(4)
                else:
                    print(f"  Failed after {MAX_RETRIES} attempts.")
                    failed.append(title)
                    progress[slug] = 'failed'
                    save_progress(progress)

        # Rate limit buffer between songs
        if success and i < len(remaining) - 1:
            time.sleep(2)

        print()

    # ── Final summary ─────────────────────────────────────────────────────────
    progress = load_progress()
    done_count    = len([v for v in progress.values() if v == 'done'])
    failed_count  = len([v for v in progress.values() if v == 'failed'])
    missing_count = len([v for v in progress.values() if v == 'not_found'])

    print("=" * 50)
    print("BACKFILL COMPLETE")
    print(f"  Successful:  {done_count}")
    print(f"  Failed:      {failed_count}")
    print(f"  Not found:   {missing_count}")
    print()

    if not_found:
        print("Songs with no matching .txt file:")
        for t in not_found:
            print(f"  {t}")
        print()

    if failed:
        print("Songs that failed after retries (re-run script to retry):")
        for t in failed:
            print(f"  {t}")
        print()

    if failed_count > 0:
        print("Re-run this script to retry failed songs.")
    else:
        print("All done. Check worshiplens.com to verify story sections are showing.")

if __name__ == '__main__':
    main()
