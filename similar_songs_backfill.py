#!/usr/bin/env python3
import os, re, json, time, sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / '.env.local')

ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
SUPABASE_URL      = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY      = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

if not all([ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_KEY]):
    print("ERROR: Missing environment variables. Check .env.local")
    sys.exit(1)

def get_all_songs(sb):
    result = sb.table('songs').select('id, slug, title, artist, overall_score, score_color, themes, similar_songs').execute()
    return result.data

def build_library_index(songs):
    lines = []
    for s in songs:
        themes = ', '.join(s.get('themes') or [])
        lines.append(f"- {s['title']} | {s.get('artist','')} | score: {s.get('overall_score',0)} | color: {s.get('score_color','')} | themes: {themes}")
    return '\n'.join(lines)

def generate_similar(song, library_index):
    import anthropic
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    prompt = f"""You are a worship music curator helping worship leaders find related songs.

CURRENT SONG: {song['title']} by {song.get('artist','')}
Score: {song.get('overall_score',0)} ({song.get('score_color','')})
Themes: {', '.join(song.get('themes') or [])}

AVAILABLE SONGS IN THE LIBRARY (title | artist | score | color | themes):
{library_index}

Choose from the library above only. Never include the current song. Return exact titles as shown. No em dashes.

Return ONLY valid JSON:
{{"if_you_love_this": ["Title 1", "Title 2", "Title 3", "Title 4"], "if_this_concerns_you": ["Title A", "Title B", "Title C", "Title D"]}}"""

    message = client.messages.create(model='claude-sonnet-4-5', max_tokens=500, messages=[{'role': 'user', 'content': prompt}])
    raw = message.content[0].text.strip()
    raw = re.sub(r'^```json\s*', '', raw); raw = re.sub(r'^```\s*', '', raw); raw = re.sub(r'\s*```$', '', raw)
    return json.loads(raw)

def main():
    from supabase import create_client
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Fetching all songs...")
    songs = get_all_songs(sb)
    print(f"Found {len(songs)} songs")
    library_index = build_library_index(songs)
    to_process = [s for s in songs if not (s.get('similar_songs') and s['similar_songs'].get('if_you_love_this') and len(s['similar_songs']['if_you_love_this']) > 0)]
    print(f"{len(to_process)} songs need similar songs generated\n")
    for i, song in enumerate(to_process):
        print(f"[{i+1}/{len(to_process)}] {song['title']}")
        try:
            similar = generate_similar(song, library_index)
            sb.table('songs').update({'similar_songs': similar}).eq('id', song['id']).execute()
            print(f"  love: {similar.get('if_you_love_this', [])}")
            print(f"  concern: {similar.get('if_this_concerns_you', [])}")
            time.sleep(1)
        except Exception as e:
            print(f"  ERROR: {e}")
            time.sleep(2)
    print("\nBackfill complete!")

if __name__ == '__main__':
    main()
