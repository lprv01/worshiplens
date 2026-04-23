#!/usr/bin/env python3
"""
WorshipLens - Similar Songs Backfill
Pulls all songs from Supabase, then for each song asks Claude to suggest
5 similar songs ("if you love this") and 5 contrasting songs ("if this
concerns you") from the actual library.

Usage:
  python3 worshiplens_similarity_backfill.py

Place in ~/Desktop/worshiplens/ alongside worshiplens_wt_import.py
Requires: pip3 install anthropic supabase python-dotenv
"""

import os
import re
import json
import time
import sys
from pathlib import Path
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Load environment
# ---------------------------------------------------------------------------

load_dotenv(Path(__file__).parent / '.env.local')

ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
SUPABASE_URL      = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY      = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
PROGRESS_FILE     = Path(__file__).parent / '.similarity_backfill_progress.json'

if not all([ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    print("ERROR: Missing environment variables. Check .env.local")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def get_all_songs():
    """Pull all songs from Supabase - title, artist, slug, themes, score."""
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    all_songs = []
    page_size = 1000
    offset = 0

    while True:
        result = supabase.table('songs') \
            .select('id, title, artist, slug, overall_score, score_color, themes, technical, lenses') \
            .range(offset, offset + page_size - 1) \
            .execute()
        batch = result.data or []
        all_songs.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size

    return all_songs


def update_similar_songs(slug, similar_songs):
    """Update the similar_songs field for a song by slug."""
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    result = supabase.table('songs') \
        .update({'similar_songs': similar_songs}) \
        .eq('slug', slug) \
        .execute()
    return result

# ---------------------------------------------------------------------------
# Build library index for Claude
# ---------------------------------------------------------------------------

def build_library_summary(all_songs, exclude_slug):
    """
    Build a compact text summary of all songs except the current one.
    Gives Claude enough context to make good similarity matches.
    """
    lines = []
    for s in all_songs:
        if s['slug'] == exclude_slug:
            continue
        title  = s.get('title', '')
        artist = s.get('artist', '')
        score  = s.get('overall_score', 0)
        color  = s.get('score_color', '')
        themes = []

        # Try to get themes from technical field
        tech = s.get('technical') or {}
        if isinstance(tech, dict):
            themes = tech.get('themes', [])
        if not themes:
            themes = s.get('themes', [])

        # Get theological clarity note if available
        lenses = s.get('lenses') or {}
        theo_arc = ''
        if isinstance(lenses, dict):
            theo_arc = lenses.get('theological_clarity', {}).get('theological_arc', '')

        theme_str = ', '.join(themes[:4]) if themes else 'no themes listed'
        line = f'- "{title}" by {artist} | Score: {score} ({color}) | Themes: {theme_str}'
        if theo_arc:
            line += f' | Arc: {theo_arc[:80]}'
        lines.append(line)

    return '\n'.join(lines)

# ---------------------------------------------------------------------------
# Claude API call
# ---------------------------------------------------------------------------

def generate_similar_songs(song, library_summary):
    """Ask Claude to suggest similar and contrasting songs from the library."""
    import anthropic
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    title  = song.get('title', '')
    artist = song.get('artist', '')
    score  = song.get('overall_score', 0)
    themes = []

    tech = song.get('technical') or {}
    if isinstance(tech, dict):
        themes = tech.get('themes', [])
    if not themes:
        themes = song.get('themes', [])

    lenses = song.get('lenses') or {}
    theo_arc = ''
    watchpoints = []
    if isinstance(lenses, dict):
        theo_arc = lenses.get('theological_clarity', {}).get('theological_arc', '')
        watchpoints = lenses.get('scriptural_fidelity', {}).get('watchpoints', [])

    prompt = f"""You are WorshipLens, a theological review assistant for Baptist worship leaders.

CURRENT SONG:
Title: "{title}"
Artist: {artist}
Score: {score}
Themes: {', '.join(themes) if themes else 'not listed'}
Theological arc: {theo_arc or 'not available'}
Watchpoints: {'; '.join(watchpoints) if watchpoints else 'none'}

FULL SONG LIBRARY ({len(library_summary.splitlines())} songs):
{library_summary}

TASK:
From the library above, select the best matches for two lists:

1. "if_you_love_this" - 5 songs a worship leader should also consider if they love "{title}".
   These should share similar themes, theological weight, emotional tone, or congregational function.
   Prioritize green-scored songs. Include a brief reason for each.

2. "if_this_concerns_you" - 5 songs to use INSTEAD if something about "{title}" concerns the worship leader.
   These should address the same themes but in a way that resolves the concern (more corporate voice,
   clearer theology, stronger scriptural grounding, simpler singability, etc).
   Include a brief reason explaining what concern it addresses.

RULES:
- Only suggest songs that appear EXACTLY in the library list above. Do not invent titles.
- Each entry needs: "title" (exact match from library), "artist" (exact match), "reason" (1 sentence, no em dashes)
- Keep reasons concise and pastoral, not academic
- Never use em dashes in any field

Respond with ONLY a valid JSON object, no markdown fences:
{{
  "if_you_love_this": [
    {{"title": "", "artist": "", "reason": ""}},
    {{"title": "", "artist": "", "reason": ""}},
    {{"title": "", "artist": "", "reason": ""}},
    {{"title": "", "artist": "", "reason": ""}},
    {{"title": "", "artist": "", "reason": ""}}
  ],
  "if_this_concerns_you": [
    {{"title": "", "artist": "", "reason": ""}},
    {{"title": "", "artist": "", "reason": ""}},
    {{"title": "", "artist": "", "reason": ""}},
    {{"title": "", "artist": "", "reason": ""}},
    {{"title": "", "artist": "", "reason": ""}}
  ]
}}"""

    message = client.messages.create(
        model='claude-sonnet-4-5',
        max_tokens=1500,
        messages=[{'role': 'user', 'content': prompt}]
    )

    raw = message.content[0].text.strip()
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'^```\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)
    result = json.loads(raw)

    # Strip any em dashes that sneak through
    def strip_em(obj):
        if isinstance(obj, str):
            return obj.replace('\u2014', '-').replace('\u2013', '-')
        elif isinstance(obj, dict):
            return {k: strip_em(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [strip_em(i) for i in obj]
        return obj

    return strip_em(result)

# ---------------------------------------------------------------------------
# Progress tracking
# ---------------------------------------------------------------------------

def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {}

def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("Fetching all songs from Supabase...")
    all_songs = get_all_songs()
    print(f"Found {len(all_songs)} songs in library\n")

    if len(all_songs) < 10:
        print("ERROR: Not enough songs in library to generate meaningful similarity matches.")
        sys.exit(1)

    progress = load_progress()
    completed = [k for k, v in progress.items() if v == 'done']
    failed    = [k for k, v in progress.items() if v == 'failed']
    print(f"Already completed: {len(completed)}")
    print(f"Previously failed: {len(failed)}")
    print()

    for i, song in enumerate(all_songs):
        slug  = song.get('slug', '')
        title = song.get('title', '')

        if not slug:
            print(f"[{i+1}/{len(all_songs)}] SKIP (no slug): {title}")
            continue

        if progress.get(slug) == 'done':
            print(f"[{i+1}/{len(all_songs)}] SKIP (already done): {title}")
            continue

        print(f"[{i+1}/{len(all_songs)}] Processing: {title}")

        try:
            library_summary = build_library_summary(all_songs, exclude_slug=slug)
            similar = generate_similar_songs(song, library_summary)

            print(f"  if_you_love_this:     {len(similar.get('if_you_love_this', []))} songs")
            print(f"  if_this_concerns_you: {len(similar.get('if_this_concerns_you', []))} songs")

            update_similar_songs(slug, similar)
            print(f"  Updated in Supabase.")

            progress[slug] = 'done'
            save_progress(progress)

            # Polite delay to avoid rate limiting
            if i < len(all_songs) - 1:
                time.sleep(2)

        except json.JSONDecodeError as e:
            print(f"  ERROR: Claude returned invalid JSON - {e}")
            progress[slug] = 'failed'
            save_progress(progress)
            time.sleep(3)

        except Exception as e:
            print(f"  ERROR: {e}")
            progress[slug] = 'failed'
            save_progress(progress)
            time.sleep(3)

    progress = load_progress()
    done   = len([v for v in progress.values() if v == 'done'])
    failed = len([v for v in progress.values() if v == 'failed'])
    print(f"\nBackfill complete.")
    print(f"  Successful: {done}")
    print(f"  Failed:     {failed}")
    if failed > 0:
        print(f"\nFailed slugs (re-run to retry):")
        for k, v in progress.items():
            if v == 'failed':
                print(f"  {k}")

if __name__ == '__main__':
    main()
