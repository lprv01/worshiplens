#!/usr/bin/env python3
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

PROJECT = Path.home() / "Desktop" / "worshiplens"
load_dotenv(PROJECT / ".env.local")

YOUTUBE_KEY = os.environ.get("YOUTUBE_API_KEY")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")


def search_youtube(query):
    params = urllib.parse.urlencode({
        "part": "snippet", "q": query, "type": "video",
        "maxResults": 1, "key": YOUTUBE_KEY,
    })
    url = f"https://www.googleapis.com/youtube/v3/search?{params}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
    items = data.get("items", [])
    if not items:
        return None
    return f"https://www.youtube.com/watch?v={items[0]['id']['videoId']}"


def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Fetching songs...")
    res = sb.table("songs").select(
        "id, title, artist, ccli_number, is_top_song, score_color, created_at, youtube_url"
    ).execute()
    songs = res.data
    by_id = {s["id"]: s for s in songs}
    print(f"  {len(songs)} total songs")

    ccli_top = json.loads((PROJECT / "data" / "ccli-top-100.json").read_text())
    ccli_order = {}
    for i, entry in enumerate(ccli_top):
        num = entry.get("song", {}).get("ccli_number")
        if num and num != "Not available":
            ccli_order[num] = i

    all_list = sorted(songs, key=lambda s: s.get("created_at") or "", reverse=True)[:25]
    top_list = [s for s in songs if s.get("is_top_song")]
    top_list = sorted(top_list, key=lambda s: s.get("created_at") or "", reverse=True)[:25]
    ccli_list = [s for s in songs if s.get("ccli_number") in ccli_order]
    ccli_list = sorted(ccli_list, key=lambda s: ccli_order[s["ccli_number"]])[:25]
    green_list = [s for s in songs if s.get("score_color") == "green"]
    green_list = sorted(green_list, key=lambda s: s.get("created_at") or "", reverse=True)[:25]

    print(f"  All (first 25): {len(all_list)}")
    print(f"  Top Songs This Month (first 25): {len(top_list)}")
    print(f"  CCLI Top Songs (first 25): {len(ccli_list)}")
    print(f"  Green (first 25): {len(green_list)}")

    priority_ids = []
    seen = set()
    for group in (all_list, top_list, ccli_list, green_list):
        for s in group:
            if s["id"] not in seen:
                seen.add(s["id"])
                priority_ids.append(s["id"])

    missing = [by_id[sid] for sid in priority_ids if not by_id[sid].get("youtube_url")]
    already = len(priority_ids) - len(missing)
    print(f"\n  {len(priority_ids)} unique songs across all 4 lists")
    print(f"  {already} already have a link, {len(missing)} need one")

    if not missing:
        print("\nNothing to do, all priority songs already have links.")
        return

    print(f"\nSearching YouTube for {len(missing)} songs...\n")
    updated, quota_hit = 0, False
    for i, song in enumerate(missing, 1):
        title = song.get("title", "")
        artist = (song.get("artist") or "").split(",")[0].strip()
        query = f"{title} {artist} worship song"
        print(f"[{i}/{len(missing)}] {title}")
        try:
            url = search_youtube(query)
            if url:
                sb.table("songs").update({"youtube_url": url}).eq("id", song["id"]).execute()
                print(f"  {url}")
                updated += 1
            else:
                print("  No result found")
            time.sleep(0.5)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print("  QUOTA HIT (429) - stopping here, safe to re-run tomorrow")
                quota_hit = True
                break
            print(f"  ERROR: {e}")
            time.sleep(2)
        except Exception as e:
            print(f"  ERROR: {e}")
            time.sleep(2)

    print(f"\nDone. Updated {updated} of {len(missing)}.")
    if quota_hit:
        print("Stopped early due to daily quota. Re-run this script tomorrow to pick up the rest.")


if __name__ == "__main__":
    main()
