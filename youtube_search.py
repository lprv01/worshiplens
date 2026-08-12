#!/usr/bin/env python3
"""
WorshipLens YouTube Search
Searches YouTube for each song and stores the best matching video URL in Supabase.
Skips songs that already have a youtube_url. Safe to stop and restart.
"""

import os, time, urllib.request, urllib.parse, json
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / '.env.local')

YOUTUBE_KEY = os.environ.get('YOUTUBE_API_KEY')
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')

def search_youtube(query):
    params = urllib.parse.urlencode({
        'part': 'snippet',
        'q': query,
        'type': 'video',
        'maxResults': 1,
        'key': YOUTUBE_KEY
    })
    url = f'https://www.googleapis.com/youtube/v3/search?{params}'
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
    items = data.get('items', [])
    if not items:
        return None
    video_id = items[0]['id']['videoId']
    return f'https://www.youtube.com/watch?v={video_id}'

def main():
    from supabase import create_client
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    print('Fetching songs without YouTube links...')
    result = sb.table('songs').select('id, title, artist').is_('youtube_url', 'null').execute()
    songs = result.data
    print(f'{len(songs)} songs to process\n')

    for i, song in enumerate(songs):
        title = song.get('title', '')
        artist = song.get('artist', '')
        query = f'{title} {artist.split(",")[0].strip()} worship song'
        print(f'[{i+1}/{len(songs)}] {title}')
        try:
            url = search_youtube(query)
            if url:
                sb.table('songs').update({'youtube_url': url}).eq('id', song['id']).execute()
                print(f'  {url}')
            else:
                print(f'  No result found')
            time.sleep(0.5)
        except Exception as e:
            print(f'  ERROR: {e}')
            time.sleep(2)

    print('\nDone!')

if __name__ == '__main__':
    main()
