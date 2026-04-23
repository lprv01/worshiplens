#!/usr/bin/env python3
"""
WorshipLens - WorshipTools Import Runner
Reads 97 songs exported from WorshipTools (Firestore format),
generates reviews via Claude API, and upserts into Supabase.

Usage:
  python3 worshiplens_wt_import.py

Place this file at ~/Desktop/worshiplens/worshiplens_wt_import.py
Requires: pip3 install anthropic supabase python-dotenv
"""

import os
import re
import json
import time
import sys
from pathlib import Path
from collections import Counter
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Load environment
# ---------------------------------------------------------------------------

load_dotenv(Path(__file__).parent / '.env.local')

ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
SUPABASE_URL      = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY      = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
PROGRESS_FILE     = Path(__file__).parent / '.wt_import_progress.json'

# This file will be created in the same folder by the setup step below
WT_SONGS_FILE     = Path(__file__).parent / 'wt_songs.json'

if not all([ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    print("ERROR: Missing environment variables. Check .env.local")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Voice Analysis (identical to batch_runner.py)
# ---------------------------------------------------------------------------

INDIVIDUAL_PATTERNS = [
    r'\bI\b', r"\bI\'ll\b", r"\bI\'ve\b", r"\bI\'m\b", r"\bI\'d\b",
    r'\bmy\b', r'\bme\b', r'\bmine\b', r'\bmyself\b',
    r'\blet me\b', r'\bmy soul\b', r'\bmy heart\b', r'\bmy life\b',
    r'\bmy strength\b', r'\bmy lips\b', r'\bmy hands\b', r'\bmy voice\b',
    r'\bmy time\b', r'\bmy days\b', r'\bmy name\b',
]

def classify_line(line):
    line_l = line.lower()
    corp_override = bool(re.search(r'\bwe\b|\bour\b|\bus\b|\btogether\b', line_l))
    if corp_override:
        return 'corporate'
    ind = any(re.search(p, line_l) for p in INDIVIDUAL_PATTERNS)
    return 'individual' if ind else 'corporate'

def analyze_voice(sections):
    counts = Counter({'individual': 0, 'corporate': 0})
    total = 0
    for s in sections:
        if 'instrumental' in s['section'].lower():
            continue
        for line in s['lines']:
            if len(line.strip()) < 4:
                continue
            counts[classify_line(line)] += 1
            total += 1
    if total == 0:
        return None
    ind_pct  = round(counts['individual'] / total * 100)
    corp_pct = 100 - ind_pct
    if ind_pct >= 70:
        flag = 'high_individual'
        note = (f"Predominantly individual voice ({ind_pct}% I/my). "
                f"Reads more as personal devotion than congregational declaration. "
                f"Consider pairing with a more corporate song in the same set.")
    elif ind_pct >= 55:
        flag = 'individual_leaning'
        note = (f"Individual-leaning ({ind_pct}% I/my). "
                f"Functional for personal response moments; "
                f"worth balancing across a full set.")
    else:
        flag = None
        note = "Primarily corporate in voice. No congregational concern."
    return {
        'individual_pct': ind_pct,
        'corporate_pct': corp_pct,
        'total_lines_analyzed': total,
        'flag': flag,
        'note': note
    }

# ---------------------------------------------------------------------------
# Parse WorshipTools song data into the same shape as parse_chordpro()
# ---------------------------------------------------------------------------

def parse_wt_song(song):
    """
    Convert a WorshipTools song dict (from wt_songs.json) into the
    same parsed structure that build_prompt() and insert_song() expect.
    """
    title     = song.get('title', '').strip()
    authors   = song.get('authors', '').strip()
    copyright = song.get('copyright', '').strip()
    ccli_raw  = song.get('ccli', '').strip()
    ccli      = ccli_raw.replace('CCLI #', '').strip()
    key_raw   = song.get('key', '').strip()
    key       = key_raw.replace('Default Key:', '').strip()
    slides    = song.get('slides', [])

    # Build sections list
    sections = []
    for slide in slides:
        sec_title   = (slide.get('slide_title') or '').strip()
        sec_content = (slide.get('slide_content') or '').strip()
        if not sec_title and not sec_content:
            continue
        lines = [l.strip() for l in sec_content.splitlines() if l.strip()]
        if lines:
            sections.append({'section': sec_title, 'lines': lines})

    # Unique sections (first occurrence of each type)
    unique_sections = {}
    for s in sections:
        base = re.sub(r'\s*\d+[ab]?$', '', s['section']).lower().strip()
        if base not in unique_sections and base != 'instrumental':
            unique_sections[base] = s['lines']

    # Stats
    all_lines = [l for s in sections
                 for l in s['lines']
                 if 'instrumental' not in s['section'].lower()]
    chorus_lines = [l for s in sections
                    if 'chorus' in s['section'].lower()
                    for l in s['lines']]
    rep_ratio = round(len(chorus_lines) / max(len(all_lines), 1) * 100)

    voice = analyze_voice(sections)

    return {
        'title':           title,
        'artist':          authors,
        'ccli_number':     ccli,
        'ccli_license':    '',
        'key_original':    key or 'Unknown',
        'time_signature':  '',
        'tempo_bpm':       '',
        'copyright':       copyright,
        'sections':        sections,
        'unique_sections': unique_sections,
        'stats': {
            'total_lyric_lines':          len(all_lines),
            'chorus_lines':               len(chorus_lines),
            'chorus_repetition_ratio_pct': rep_ratio,
            'section_count':              len(sections),
            'unique_section_types':       list(unique_sections.keys()),
        },
        'voice_analysis': voice,
    }

# ---------------------------------------------------------------------------
# Prompt Builder (identical logic to batch_runner.py)
# ---------------------------------------------------------------------------

def build_prompt(parsed):
    sections_text = ''
    for name, lines in parsed['unique_sections'].items():
        sections_text += f'\n[{name.upper()}] (first 2 lines only):\n'
        for l in lines[:2]:
            sections_text += f'  {l}\n'

    v = parsed.get('voice_analysis') or {}
    voice_summary = (
        f"Individual {v.get('individual_pct', 0)}% / "
        f"Corporate {v.get('corporate_pct', 0)}% -- {v.get('note', '')}"
        if v else 'Not calculated'
    )

    return f"""You are WorshipLens, a theological review assistant for Baptist worship leaders in the BGCT/Texas Baptists tradition. Your tone is pastoral, equipping, and honest. You are not a music critic and not a theological watchdog. You equip worship leaders to use songs well.

SONG DATA:
Title: {parsed['title']}
Artist: {parsed['artist']}
CCLI #: {parsed['ccli_number']}
Key (confirmed from church database): {parsed['key_original']} | Time: {parsed['time_signature']} | Tempo: {parsed['tempo_bpm']} BPM
Copyright: {parsed['copyright']}
Chorus repetition ratio: {parsed['stats']['chorus_repetition_ratio_pct']}%
Voice distribution (pre-calculated): {voice_summary}

SONG STRUCTURE (section types present in this song):
{sections_text}
Use your existing knowledge of this song for all lyric-level analysis.
Do not reproduce lyrics. Analyze from knowledge and the metadata provided above.

RULES:

LYRIC QUOTATION, three tiers, use judgment not word counts:
1. Scripture-origin fragments: quote freely, then immediately cite the biblical source. The point is the identification of the origin. These fragments belong to Scripture, not the songwriter.
2. Paraphrase fragments: the songwriter's rendering of a biblical concept. Quote the fragment, show the Scripture parallel, analyze fidelity of the paraphrase. This is core WorshipLens analysis and sits squarely in fair use as theological commentary.
3. Purely original lyrical phrases: the songwriter's own creative expression with no direct Scripture parallel. Use sparingly, only when the phrase itself is the point. Keep short.

VOICE AND AUTHORSHIP:
- Never refer to the songwriter by name in any analysis field (lenses, full_analysis, scripture_map, theological_nuances). The analysis is about the SONG and its theology, not the person who wrote it.
- Say "the lyric," "the song," "this line," "the verse" -- never "Redman says" or "the author writes."
- The songwriter's name appears ONLY in meta fields and story_behind_song items where the origin story specifically requires it.

GRAMMAR AND LINGUISTIC OBSERVATIONS:
- Grammatical observations are noted ONLY when they exist as genuine, specific issues, never invented for completeness.
- Severity must always be evaluated against how the song actually functions in congregational worship, not how it reads under forensic linguistic analysis.
- A minor pronoun ambiguity that has never misdirected worship in practice is a minor pronoun ambiguity. Nothing more. Do not elevate it to a theological concern.
- Person-shifting (third to second person when addressing God) is a recognized Psalmic convention present in Psalm 22, 42, 103, and throughout Hebrew poetry. Never flag this as a flaw unless it creates genuine theological confusion in context.
- The defense brief may include grammar-based objections when they are likely to surface from academically trained congregants (linguists, translators, English teachers). Frame these as minor observations with Psalmic precedent, not doctrinal problems.
- The goal is equipping worship leaders, not winning a grammar argument.

INLINE FRAGMENTS:
- Embed short lyric fragments directly within analysis sentences, in quotation marks.
- Every fragment must be immediately followed by the theological observation it supports.
- Fragments are evidence, not decoration. If the fragment does not serve a specific point, cut it.

SCORING PHILOSOPHY:
- Each lens is scored 0-10. A 10 in any lens means beyond reasonable critique in that dimension.
- Overall 10/10 is unreachable by design -- the musical and poetic lenses carry inherent subjectivity. No congregation is universal, no melody suits every voice, no lyric pleases every poet.
- Score reductions must always be traceable to a specific, nameable reason, never vague.
- A 9.4 overall is a strong endorsement. Do not inflate scores to be encouraging. Honest scoring is what makes WorshipLens trustworthy.
- The deduction_line for each lens must state the reason first, not the number. Write: "One phrase risks ambiguity without context, reads relational rather than doxological" -- not: "0.5 deduction, a phrase in verse 2"

OTHER:
- grammar_notes and lyric_modifications must be [] if no genuine issues exist, no filler
- hymn_lineage must be null if no genuine historic hymn connection exists
- publisher_note must be null if no theological distinctives relevant to Baptist/BGCT concerns
- story_behind_song: populate available: true and items with 2-4 entries whenever you have reasonable knowledge of the song's origin, writing context, or cultural moment -- this applies to the vast majority of well-known CCLI songs. Only set available: false for obscure songs you have no background on. Each item must have a "text" field (1-3 sentences of narrative) and a "source" field (e.g. "Artist interview, Worship Together, 2018" or "Album liner notes" -- omit source if unknown, do not fabricate a source URL). Items should cover: how/why the song was written, the album or ministry context it emerged from, any notable personal or theological catalyst, and its reception or legacy in the worship community.
- set_intelligence fields: populate structure but mark available_at_500_songs: true, leave lists empty
- key_original: use EXACTLY the key provided above in SONG DATA - do not change it or look it up
- key_recommended: calculate from key_original by transposing to keep melody within A3-D5 congregational range. If key_original already fits well, recommend the same key or one semitone adjustment at most. Base this on music theory, not web search.
- voice_distribution: use pre-calculated values exactly as provided
- Never use em dashes in any output field. Use a regular hyphen (-) or rewrite the sentence to avoid the construction entirely. This applies to every text field in the JSON without exception: summaries, deduction lines, analysis paragraphs, story items, objections, watchpoints, and all other string fields.

Generate a complete WorshipLens review as a single valid JSON object. No text outside the JSON. No markdown fences.

{{
  "meta": {{
    "title": "",
    "artist": "",
    "ccli_number": "",
    "slug": "",
    "key_original": "",
    "key_recommended": "",
    "range_original": "",
    "range_recommended": "",
    "time_signature": "",
    "tempo_bpm": 0,
    "copyright": "",
    "release_year": "",
    "album": "",
    "genre": "",
    "hymn_lineage_badge": null
  }},
  "overall_score": 0.0,
  "overall_verdict": "",
  "recommendation": "Recommended|Recommended with notes|Use with caution|Not recommended",
  "lenses": {{
    "scriptural_fidelity": {{
      "score": 0.0,
      "deduction_line": "",
      "summary": "",
      "watchpoints": [],
      "lyric_examples": []
    }},
    "theological_clarity": {{
      "score": 0.0,
      "deduction_line": "",
      "summary": "",
      "radio_test_result": "Passes|Borderline|Fails",
      "radio_test_note": "",
      "theological_arc": "",
      "watchpoints": []
    }},
    "congregational_singability": {{
      "score": 0.0,
      "deduction_line": "",
      "summary": "",
      "key_original": "",
      "key_recommended": "",
      "range_original": "",
      "range_recommended": "",
      "ceiling_note": "",
      "melody_accessibility": ""
    }},
    "poetic_lyrical_quality": {{
      "score": 0.0,
      "deduction_line": "",
      "summary": "",
      "repetition_ratio_pct": 0,
      "cliche_density": "none|low|moderate|high",
      "imagery_quality": "",
      "voice_distribution": {{
        "individual_pct": 0,
        "corporate_pct": 0,
        "flag": null,
        "note": ""
      }},
      "grammar_notes": [],
      "lyric_modifications": [],
      "watchpoints": []
    }},
    "defense_brief": {{
      "score": 0.0,
      "summary": "",
      "objections": [{{
        "objection": "",
        "who_raises_it": "",
        "tag": "Theological|Grammar/Academic|Liturgical|Cultural|Musical",
        "scripture_response": "",
        "suggested_framing": "",
        "ccli_modification_note": "",
        "honest_concession": ""
      }}]
    }}
  }},
  "full_analysis": {{
    "paragraphs": ["", "", "", ""]
  }},
  "scripture_map": {{
    "primary": [{{"reference": "", "connection": ""}}],
    "supporting": [{{"reference": "", "connection": ""}}]
  }},
  "theological_nuances": {{
    "affirmed": [{{"label": "", "note": ""}}],
    "flagged": []
  }},
  "hymn_lineage": null,
  "story_behind_song": {{
    "available": true,
    "publisher_note": null,
    "items": [
      {{"text": "Narrative sentence about the song's origin or writing context.", "source": "Source name if known, otherwise omit this field"}},
      {{"text": "Second item covering album context, theological catalyst, or cultural moment.", "source": ""}},
      {{"text": "Optional third item on reception, legacy, or ministry impact.", "source": ""}}
    ]
  }},
  "technical": {{
    "themes": [],
    "sermon_series_fit": [],
    "seasonal_tags": [],
    "audience_fit": {{
      "spiritual_maturity": "",
      "age_group": "",
      "service_type": "",
      "visitor_friendliness": "",
      "special_contexts": ""
    }}
  }},
  "set_intelligence": {{
    "available_at_500_songs": true,
    "pairs_well_with": [],
    "avoid_pairing_with": [],
    "set_arc": null
  }},
  "similar_songs": {{
    "if_you_love_this": [],
    "if_this_concerns_you": []
  }}
}}"""

# ---------------------------------------------------------------------------
# Helpers (identical to batch_runner.py)
# ---------------------------------------------------------------------------

def make_slug(title):
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s]', '', slug)
    slug = re.sub(r'\s+', '-', slug.strip())
    return slug

def score_color(score):
    if score >= 8.0: return 'green'
    if score >= 6.5: return 'amber'
    if score >= 5.0: return 'orange'
    return 'red'

def strip_em_dashes(obj):
    if isinstance(obj, str):
        return obj.replace('\u2014', '-').replace('\u2013', '-')
    elif isinstance(obj, dict):
        return {k: strip_em_dashes(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [strip_em_dashes(i) for i in obj]
    return obj

# ---------------------------------------------------------------------------
# Tempo lookup via Claude web search
# ---------------------------------------------------------------------------

def fetch_tempo(title, artist):
    """Search the web for a song BPM using Claude with web_search tool."""
    import anthropic
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    first_artist = artist.split(',')[0].strip() if artist else ''
    try:
        message = client.messages.create(
            model='claude-sonnet-4-5',
            max_tokens=200,
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[{
                'role': 'user',
                'content': (
                    f'What is the BPM (beats per minute) of the worship song "{title}" by {first_artist}? '
                    f'Search multitracks.com, praisecharts.com, or songbpm.com. '
                    f'Reply with ONLY the integer BPM number. If not found, reply: null'
                )
            }]
        )
        result_text = ''.join(
            block.text.strip() for block in message.content if hasattr(block, 'text')
        ).strip()
        if result_text.lower() == 'null' or not result_text:
            return None
        match = re.search(r'\b(\d{2,3})\b', result_text)
        if match:
            bpm = int(match.group(1))
            if 40 <= bpm <= 220:
                return bpm
        return None
    except Exception as e:
        print(f'    Tempo lookup failed: {e}')
        return None


# ---------------------------------------------------------------------------
# Claude API
# ---------------------------------------------------------------------------

def generate_review(parsed):
    import anthropic
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    prompt = build_prompt(parsed)

    system_prompt = (
        "You are WorshipLens, a theological review assistant for Baptist worship leaders. "
        "You are analyzing worship songs for biblical accuracy, theological clarity, "
        "congregational singability, poetic quality, and pastoral defensibility. "
        "Song lyrics and fragments are provided solely for theological analysis and commentary "
        "under fair use for educational and critical review purposes. "
        "You will analyze short lyric excerpts to identify scriptural connections, "
        "theological themes, and provide pastoral guidance for worship leaders. "
        "Never reproduce full lyrics. Use fragments only as evidence for specific observations."
    )

    message = client.messages.create(
        model='claude-sonnet-4-5',
        max_tokens=8000,
        system=system_prompt,
        messages=[{'role': 'user', 'content': prompt}]
    )

    raw = message.content[0].text.strip()
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'^```\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)
    review = json.loads(raw)
    return review

# ---------------------------------------------------------------------------
# Supabase insertion (identical to batch_runner.py)
# ---------------------------------------------------------------------------

def insert_song(parsed, review):
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    meta         = review.get('meta', {})
    lenses       = review.get('lenses', {})
    overall_score = review.get('overall_score', 0.0)

    lens_scores = {
        'scriptural_fidelity':        lenses.get('scriptural_fidelity', {}).get('score', 0),
        'theological_clarity':        lenses.get('theological_clarity', {}).get('score', 0),
        'congregational_singability': lenses.get('congregational_singability', {}).get('score', 0),
        'poetic_lyrical_quality':     lenses.get('poetic_lyrical_quality', {}).get('score', 0),
        'defense_brief':              lenses.get('defense_brief', {}).get('score', 0),
    }

    slug = meta.get('slug') or make_slug(meta.get('title') or parsed['title'])

    row = {
        'title':        meta.get('title') or parsed['title'],
        'artist':       meta.get('artist') or parsed['artist'],
        'ccli_number':  meta.get('ccli_number') or parsed['ccli_number'],
        'slug':         slug,
        'overall_score': overall_score,
        'score_color':   score_color(overall_score),
        'recommendation': review.get('recommendation', ''),
        'overall_verdict': review.get('overall_verdict', ''),
        'lens_scores':   lens_scores,
        'key_original':      parsed['key_original'] or meta.get('key_original', ''),  # always trust WorshipTools key
        'key_recommended':   meta.get('key_recommended', ''),
        'time_signature':    meta.get('time_signature') or parsed['time_signature'],
        'tempo_bpm':         (lambda t: int(t) if t and str(t).strip().isdigit() else (t if isinstance(t, int) else None))(meta.get('tempo_bpm') or parsed.get('tempo_bpm')),
        'copyright':         meta.get('copyright') or parsed['copyright'],
        'release_year':      meta.get('release_year', ''),
        'album':             meta.get('album', ''),
        'genre':             meta.get('genre', ''),
        'hymn_lineage_badge': meta.get('hymn_lineage_badge'),
        'voice_analysis':    parsed.get('voice_analysis'),
        'lenses':              lenses,
        'full_analysis':       review.get('full_analysis', {}),
        'scripture_map':       review.get('scripture_map', {}),
        'theological_nuances': review.get('theological_nuances', {}),
        'hymn_lineage':        review.get('hymn_lineage'),
        'story_behind_song':   review.get('story_behind_song', {}),
        'technical':           review.get('technical', {}),
        'set_intelligence':    review.get('set_intelligence', {}),
        'similar_songs':       review.get('similar_songs', {}),
        'themes':        review.get('technical', {}).get('themes', []),
        'seasonal_tags': review.get('technical', {}).get('seasonal_tags', []),
    }

    result = supabase.table('songs').upsert(row, on_conflict='slug').execute()
    return result

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
# Existing CCLI check
# ---------------------------------------------------------------------------

def get_existing_ccli_numbers():
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    result = supabase.table('songs').select('ccli_number').execute()
    existing = set()
    for row in result.data:
        if row.get('ccli_number'):
            existing.add(str(row['ccli_number']).strip())
    return existing

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if not WT_SONGS_FILE.exists():
        print(f"ERROR: {WT_SONGS_FILE} not found.")
        print("Run the browser step first to generate wt_songs.json")
        sys.exit(1)

    with open(WT_SONGS_FILE, 'r', encoding='utf-8') as f:
        wt_songs = json.load(f)

    print(f"Loaded {len(wt_songs)} songs from wt_songs.json")

    print("Checking existing songs in Supabase...")
    existing_ccli = get_existing_ccli_numbers()
    print(f"Found {len(existing_ccli)} songs already in database")

    progress = load_progress()
    completed = [k for k, v in progress.items() if v == 'done']
    failed    = [k for k, v in progress.items() if v == 'failed']
    print(f"Already completed this run: {len(completed)}")
    print(f"Previously failed: {len(failed)}")
    print()

    for i, song in enumerate(wt_songs):
        song_key = song.get('ccli') or song.get('title', f'song_{i}')

        if progress.get(song_key) == 'done':
            print(f"[{i+1}/{len(wt_songs)}] SKIP (already done): {song.get('title')}")
            continue

        print(f"[{i+1}/{len(wt_songs)}] Processing: {song.get('title')}")

        try:
            parsed = parse_wt_song(song)

            if not parsed['title']:
                print(f"  WARNING: No title found, skipping")
                progress[song_key] = 'failed'
                save_progress(progress)
                continue

            # Skip if already in Supabase
            ccli = str(parsed.get('ccli_number', '')).strip()
            if ccli and ccli in existing_ccli:
                print(f"  SKIP (already in Supabase, CCLI #{ccli}): {parsed['title']}")
                progress[song_key] = 'done'
                save_progress(progress)
                continue

            print(f"  Artist: {parsed['artist']}")
            va = parsed.get('voice_analysis') or {}
            if va:
                print(f"  Voice: {va.get('individual_pct')}% individual / {va.get('corporate_pct')}% corporate")

            # Look up tempo via web search
            tempo_from_web = fetch_tempo(parsed['title'], parsed['artist'])
            if tempo_from_web:
                parsed['tempo_bpm'] = tempo_from_web
                print(f'  Tempo: {tempo_from_web} BPM (web)')
            else:
                parsed['tempo_bpm'] = None
                print(f'  Tempo: not found')

            print(f"  Calling Claude API...")
            review = generate_review(parsed)
            review = strip_em_dashes(review)
            overall = review.get('overall_score', 0)
            print(f"  Score: {overall} ({score_color(overall)}) - {review.get('recommendation','')}")

            print(f"  Inserting into Supabase...")
            insert_song(parsed, review)
            print(f"  Done.")

            progress[song_key] = 'done'
            save_progress(progress)

            if i < len(wt_songs) - 1:
                time.sleep(2)

        except json.JSONDecodeError as e:
            print(f"  ERROR: Claude returned invalid JSON - {e}")
            progress[song_key] = 'failed'
            save_progress(progress)
            time.sleep(3)

        except Exception as e:
            print(f"  ERROR: {e}")
            progress[song_key] = 'failed'
            save_progress(progress)
            time.sleep(3)

    progress = load_progress()
    done   = len([v for v in progress.values() if v == 'done'])
    failed = len([v for v in progress.values() if v == 'failed'])
    print(f"\nBatch complete.")
    print(f"  Successful: {done}")
    print(f"  Failed:     {failed}")
    if failed > 0:
        print(f"\nFailed songs (re-run the script to retry):")
        for k, v in progress.items():
            if v == 'failed':
                print(f"  {k}")

if __name__ == '__main__':
    main()
