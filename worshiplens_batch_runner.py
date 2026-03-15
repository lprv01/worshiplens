#!/usr/bin/env python3
"""
WorshipLens Batch Runner v1
Parses all ChordPro .txt files, generates reviews via Claude API,
and inserts into Supabase songs table.

Usage:
  python3 worshiplens_batch_runner.py

Place this file at ~/Desktop/worshiplens/worshiplens_batch_runner.py
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

# ─── Load environment ─────────────────────────────────────────────────────────

load_dotenv(Path(__file__).parent / '.env.local')

ANTHROPIC_API_KEY   = os.environ.get('ANTHROPIC_API_KEY')
SUPABASE_URL        = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY        = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
SONGS_DIR           = Path(__file__).parent / 'songs'
PROGRESS_FILE       = Path(__file__).parent / '.batch_progress.json'

if not all([ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    print("ERROR: Missing environment variables. Check .env.local")
    sys.exit(1)

# ─── Voice Analysis ───────────────────────────────────────────────────────────

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
    if ind:
        return 'individual'
    return 'corporate'

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
    ind_pct = round(counts['individual'] / total * 100)
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

# ─── ChordPro Parser ──────────────────────────────────────────────────────────

def parse_chordpro(text):
    meta = {}
    for m in re.finditer(r'^\{(\w+):\s*(.+?)\}', text, re.MULTILINE):
        meta[m.group(1).strip()] = m.group(2).strip()

    footer_kw = ['CCLI Song', 'CCLI License', 'For use solely', '©', 'www.ccli']
    sections = []
    current_section = None
    current_lines = []

    for line in text.splitlines():
        line = line.strip()
        if any(kw in line for kw in footer_kw):
            continue
        comment_match = re.match(r'^\{comment:\s*(.+?)\}$', line)
        if comment_match:
            if current_section and current_lines:
                clean = [re.sub(r'\[[\w/#|]+\]', '', l).replace('- ', '').strip()
                         for l in current_lines]
                clean = [l for l in clean if l and not l.startswith('{')]
                if clean:
                    sections.append({'section': current_section, 'lines': clean})
            current_section = comment_match.group(1)
            current_lines = []
        elif line and not line.startswith('{') and current_section:
            if not re.match(r'^(\[[\w/#|]+\]\s*)+$', line):
                current_lines.append(line)

    if current_section and current_lines:
        clean = [re.sub(r'\[[\w/#|]+\]', '', l).replace('- ', '').strip()
                 for l in current_lines]
        clean = [l for l in clean if l and not l.startswith('{')]
        if clean:
            sections.append({'section': current_section, 'lines': clean})

    unique_lyrics = {}
    for s in sections:
        base = re.sub(r'\s*\d+[ab]?$', '', s['section']).lower().strip()
        if base not in unique_lyrics and base != 'instrumental':
            unique_lyrics[base] = s['lines']

    all_lines = [l for s in sections
                 for l in s['lines']
                 if 'instrumental' not in s['section'].lower()]
    chorus_lines = [l for s in sections
                    if 'chorus' in s['section'].lower()
                    for l in s['lines']]
    rep_ratio = round(len(chorus_lines) / max(len(all_lines), 1) * 100)
    voice = analyze_voice(sections)

    return {
        'title': meta.get('title', ''),
        'artist': meta.get('artist', ''),
        'ccli_number': meta.get('ccli', ''),
        'ccli_license': meta.get('ccli_license', ''),
        'key_original': meta.get('key', 'Unknown'),
        'time_signature': meta.get('time', ''),
        'tempo_bpm': (int(meta.get('tempo'))
                      if meta.get('tempo', '').isdigit()
                      else meta.get('tempo', '')),
        'copyright': meta.get('copyright', ''),
        'sections': sections,
        'unique_sections': unique_lyrics,
        'stats': {
            'total_lyric_lines': len(all_lines),
            'chorus_lines': len(chorus_lines),
            'chorus_repetition_ratio_pct': rep_ratio,
            'section_count': len(sections),
            'unique_section_types': list(unique_lyrics.keys()),
        },
        'voice_analysis': voice,
    }

# ─── Prompt Builder ───────────────────────────────────────────────────────────

def build_prompt(parsed):
    sections_text = ''
    for name, lines in parsed['unique_sections'].items():
        sections_text += f'\n[{name.upper()}] (first 2 lines only):\n'
        for l in lines[:2]:
            sections_text += f'  {l}\n'

    v = parsed.get('voice_analysis', {})
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
Key: {parsed['key_original']} | Time: {parsed['time_signature']} | Tempo: {parsed['tempo_bpm']} BPM
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
- story_behind_song.items must be [] if no verified sourced information is available
- set_intelligence fields: populate structure but mark available_at_500_songs: true, leave lists empty
- voice_distribution: use pre-calculated values exactly as provided

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
    "available": false,
    "publisher_note": null,
    "items": []
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

# ─── Slug generator ───────────────────────────────────────────────────────────

def make_slug(title):
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s]', '', slug)
    slug = re.sub(r'\s+', '-', slug.strip())
    return slug

# ─── Score color ──────────────────────────────────────────────────────────────

def score_color(score):
    if score >= 8.0: return 'green'
    if score >= 6.5: return 'amber'
    if score >= 5.0: return 'orange'
    return 'red'

# ─── Claude API call ──────────────────────────────────────────────────────────

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
    # Strip any accidental markdown fences
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'^```\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)

    review = json.loads(raw)
    return review

# ─── Supabase insertion ───────────────────────────────────────────────────────

def insert_song(parsed, review):
    from supabase import create_client
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    meta = review.get('meta', {})
    lenses = review.get('lenses', {})
    overall_score = review.get('overall_score', 0.0)

    # Build flat lens scores for quick access
    lens_scores = {
        'scriptural_fidelity':       lenses.get('scriptural_fidelity', {}).get('score', 0),
        'theological_clarity':       lenses.get('theological_clarity', {}).get('score', 0),
        'congregational_singability':lenses.get('congregational_singability', {}).get('score', 0),
        'poetic_lyrical_quality':    lenses.get('poetic_lyrical_quality', {}).get('score', 0),
        'defense_brief':             lenses.get('defense_brief', {}).get('score', 0),
    }

    slug = meta.get('slug') or make_slug(meta.get('title') or parsed['title'])

    row = {
        # Identity
        'title':        meta.get('title') or parsed['title'],
        'artist':       meta.get('artist') or parsed['artist'],
        'ccli_number':  meta.get('ccli_number') or parsed['ccli_number'],
        'slug':         slug,

        # Scores
        'overall_score': overall_score,
        'score_color':   score_color(overall_score),
        'recommendation': review.get('recommendation', ''),
        'overall_verdict': review.get('overall_verdict', ''),
        'lens_scores':   lens_scores,

        # Technical metadata
        'key_original':      meta.get('key_original') or parsed['key_original'],
        'key_recommended':   meta.get('key_recommended', ''),
        'time_signature':    meta.get('time_signature') or parsed['time_signature'],
        'tempo_bpm':         meta.get('tempo_bpm') or parsed['tempo_bpm'],
        'copyright':         meta.get('copyright') or parsed['copyright'],
        'release_year':      meta.get('release_year', ''),
        'album':             meta.get('album', ''),
        'genre':             meta.get('genre', ''),
        'hymn_lineage_badge': meta.get('hymn_lineage_badge'),

        # Voice analysis
        'voice_analysis': parsed.get('voice_analysis'),

        # Full review JSONB
        'lenses':              lenses,
        'full_analysis':       review.get('full_analysis', {}),
        'scripture_map':       review.get('scripture_map', {}),
        'theological_nuances': review.get('theological_nuances', {}),
        'hymn_lineage':        review.get('hymn_lineage'),
        'story_behind_song':   review.get('story_behind_song', {}),
        'technical':           review.get('technical', {}),
        'set_intelligence':    review.get('set_intelligence', {}),
        'similar_songs':       review.get('similar_songs', {}),

        # Themes and tags (extracted flat for filtering)
        'themes':        review.get('technical', {}).get('themes', []),
        'seasonal_tags': review.get('technical', {}).get('seasonal_tags', []),
    }

    # Upsert on slug so re-runs don't create duplicates
    result = supabase.table('songs').upsert(row, on_conflict='slug').execute()
    return result

# ─── Progress tracking ────────────────────────────────────────────────────────

def load_progress():
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE) as f:
            return json.load(f)
    return {}

def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    # Get all txt files, deduplicate by base name (skip files with (1) etc)
    all_files = sorted(SONGS_DIR.glob('*.txt'))
    seen_bases = set()
    files = []
    for f in all_files:
        # Strip duplicate markers like (1), (2) from filename
        base = re.sub(r'\(\d+\)', '', f.stem).strip()
        if base not in seen_bases:
            seen_bases.add(base)
            files.append(f)

    print(f"Found {len(files)} unique song files")
    print(f"Songs directory: {SONGS_DIR}")

    progress = load_progress()
    completed = [k for k, v in progress.items() if v == 'done']
    failed    = [k for k, v in progress.items() if v == 'failed']

    print(f"Already completed: {len(completed)}")
    print(f"Previously failed: {len(failed)}")
    print(f"Remaining: {len(files) - len(completed)}")
    print()

    for i, filepath in enumerate(files):
        filename = filepath.name

        if progress.get(filename) == 'done':
            print(f"[{i+1}/{len(files)}] SKIP (already done): {filename}")
            continue

        print(f"[{i+1}/{len(files)}] Processing: {filename}")

        try:
            # Parse
            with open(filepath, 'r', encoding='utf-8') as f:
                text = f.read()
            parsed = parse_chordpro(text)

            if not parsed['title']:
                print(f"  WARNING: No title found, skipping")
                progress[filename] = 'failed'
                save_progress(progress)
                continue

            print(f"  Title: {parsed['title']}")
            print(f"  Artist: {parsed['artist']}")
            print(f"  Voice: {parsed['voice_analysis']['individual_pct']}% individual / {parsed['voice_analysis']['corporate_pct']}% corporate")

            # Generate review via Claude
            print(f"  Calling Claude API...")
            review = generate_review(parsed)
            overall = review.get('overall_score', 0)
            print(f"  Overall score: {overall} ({score_color(overall)})")

            # Insert into Supabase
            print(f"  Inserting into Supabase...")
            insert_song(parsed, review)
            print(f"  Done.")

            progress[filename] = 'done'
            save_progress(progress)

            # Rate limiting -- be respectful to the API
            if i < len(files) - 1:
                time.sleep(2)

        except json.JSONDecodeError as e:
            print(f"  ERROR: Claude returned invalid JSON -- {e}")
            progress[filename] = 'failed'
            save_progress(progress)
            time.sleep(3)

        except Exception as e:
            print(f"  ERROR: {e}")
            progress[filename] = 'failed'
            save_progress(progress)
            time.sleep(3)

    # Final summary
    progress = load_progress()
    done    = len([v for v in progress.values() if v == 'done'])
    failed  = len([v for v in progress.values() if v == 'failed'])
    print(f"\nBatch complete.")
    print(f"  Successful: {done}")
    print(f"  Failed:     {failed}")

    if failed > 0:
        print(f"\nFailed files (re-run the script to retry):")
        for k, v in progress.items():
            if v == 'failed':
                print(f"  {k}")

if __name__ == '__main__':
    main()
