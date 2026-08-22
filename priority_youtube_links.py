#!/usr/bin/env python3
"""
WorshipLens - daily YouTube linker.

Fills youtube_url for priority songs. One search call returns several
candidates for the same quota cost, so we rank them instead of trusting the
first hit, and we leave a song blank rather than attach a cover or a karaoke
track. A wrong link is worse than a missing one: the script skips anything
that already has a URL, so a bad guess never gets revisited.
"""
import json
import os
import re
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

# Video titles that almost never represent the song as recorded.
BAD_WORDS = [
    "karaoke", "instrumental", "backing track", "cover by", "reaction",
    "tutorial", "lesson", "how to play", "chords", "piano tutorial",
    "sped up", "slowed", "8d audio", "loop", "1 hour", "one hour",
    "compilation", "mashup", "remix",
]
GOOD_WORDS = ["official", "live", "lyric", "audio", "music video"]

MIN_SCORE = 3   # below this we record it for review instead of writing it


def norm(s):
    return re.sub(r"[^a-z0-9 ]", " ", (s or "").lower())


def tokens(s):
    return {t for t in norm(s).split() if len(t) > 2}


def search_youtube(query, want=6):
    params = urllib.parse.urlencode({
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": want,
        "videoCategoryId": "10",     # Music - filters out sermons and vlogs
        "videoEmbeddable": "true",   # must actually play on the site
        "key": YOUTUBE_KEY,
    })
    url = f"https://www.googleapis.com/youtube/v3/search?{params}"
    with urllib.request.urlopen(urllib.request.Request(url), timeout=15) as resp:
        data = json.loads(resp.read())
    out = []
    for item in data.get("items", []):
        sn = item.get("snippet", {})
        vid = (item.get("id") or {}).get("videoId")
        if not vid:
            continue
        out.append({
            "id": vid,
            "title": sn.get("title", ""),
            "channel": sn.get("channelTitle", ""),
        })
    return out


def score(cand, song_title, artist):
    """How confident are we this video IS the song, not about the song."""
    vt, ch = cand["title"], cand["channel"]
    vt_l, ch_l = norm(vt), norm(ch)
    s = 0

    title_tok = tokens(song_title)
    if title_tok:
        hit = len(title_tok & tokens(vt)) / len(title_tok)
        s += round(hit * 4)                    # up to 4 for title overlap

    if artist:
        art_tok = tokens(artist)
        if art_tok:
            if art_tok & tokens(ch):
                s += 3                          # artist owns the channel
            elif art_tok & tokens(vt):
                s += 2                          # artist named in the title

    if "topic" in ch_l:
        s += 2                                  # auto-generated official audio
    if any(w in vt_l for w in GOOD_WORDS):
        s += 1
    if any(w in vt_l for w in BAD_WORDS):
        s -= 5                                  # decisive, not a nudge
    return s


def main():
    if not (YOUTUBE_KEY and SUPABASE_URL and SUPABASE_KEY):
        print("Missing YOUTUBE_API_KEY or Supabase vars in .env.local")
        return

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Fetching songs...")
    songs = sb.table("songs").select(
        "id, title, artist, ccli_number, is_top_song, score_color, overall_score, created_at, youtube_url"
    ).execute().data
    by_id = {s["id"]: s for s in songs}
    print(f"  {len(songs)} total songs")

    ccli_top = json.loads((PROJECT / "data" / "ccli-top-100.json").read_text())
    ccli_order = {}
    for i, entry in enumerate(ccli_top):
        num = entry.get("song", {}).get("ccli_number")
        if num and num != "Not available":
            ccli_order[num] = i

    all_list = sorted(songs, key=lambda s: s.get("created_at") or "", reverse=True)[:25]
    top_list = sorted([s for s in songs if s.get("is_top_song")],
                      key=lambda s: s.get("created_at") or "", reverse=True)[:25]
    ccli_list = sorted([s for s in songs if s.get("ccli_number") in ccli_order],
                       key=lambda s: ccli_order[s["ccli_number"]])[:25]
    green_list = sorted([s for s in songs if s.get("score_color") == "green"],
                        key=lambda s: s.get("created_at") or "", reverse=True)[:25]

    priority_ids, seen = [], set()
    for group in (all_list, top_list, ccli_list, green_list):
        for s in group:
            if s["id"] not in seen:
                seen.add(s["id"])
                priority_ids.append(s["id"])

    priority_missing = [by_id[i] for i in priority_ids if not by_id[i].get("youtube_url")]

    # Once the priority lists are exhausted, keep going through the rest of the
    # library rather than reporting "nothing to do" while 900 songs sit unlinked.
    rest = [s for s in songs
            if s["id"] not in seen and not s.get("youtube_url")]
    rest.sort(key=lambda s: (-(s.get("overall_score") or 0), s.get("title") or ""))

    queue = priority_missing + rest
    total_unlinked = len(queue)

    if not queue:
        print("\n  Every song in the library has a link.")
        return

    budget = int(os.environ.get("YT_DAILY_LIMIT", "95"))
    queue = queue[:budget]

    print(f"  {len(priority_missing)} priority need links, {len(rest)} others unlinked")
    print(f"  {total_unlinked} unlinked in total - doing {len(queue)} today (quota limit)\n")

    updated, low_conf, quota_hit = 0, [], False

    for i, song in enumerate(queue, 1):
        title = song.get("title", "")
        artist = (song.get("artist") or "").split(",")[0].strip()
        query = f"{title} {artist}".strip()
        print(f"[{i}/{len(queue)}] {title} - {artist or 'unknown artist'}")
        try:
            cands = search_youtube(query)
            if not cands:
                print("   no results")
                low_conf.append((title, artist, "no results", ""))
                time.sleep(0.4)
                continue

            ranked = sorted(cands, key=lambda c: score(c, title, artist), reverse=True)
            best = ranked[0]
            best_score = score(best, title, artist)
            url = f"https://www.youtube.com/watch?v={best['id']}"

            if best_score < MIN_SCORE:
                print(f"   LOW CONFIDENCE ({best_score}) - left blank: {best['title'][:55]}")
                low_conf.append((title, artist, best["title"], url))
            else:
                sb.table("songs").update({"youtube_url": url}).eq("id", song["id"]).execute()
                print(f"   [{best_score}] {best['channel']} - {best['title'][:50]}")
                updated += 1
            time.sleep(0.4)

        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                print("   QUOTA HIT - stopping. Safe to re-run tomorrow.")
                quota_hit = True
                break
            print(f"   ERROR: {e}")
            time.sleep(2)
        except Exception as e:
            print(f"   ERROR: {e}")
            time.sleep(2)

    still_left = total_unlinked - updated
    print(f"\nDone. Linked {updated}. Left blank for review: {len(low_conf)}.")
    print(f"{still_left} songs still unlinked - run again tomorrow.")
    if quota_hit:
        print("Stopped early on daily quota.")

    if low_conf:
        report = PROJECT / "youtube_needs_review.txt"
        with open(report, "a") as f:
            f.write(f"\n--- run of {time.strftime('%Y-%m-%d %H:%M')} ---\n")
            for t, a, vt, u in low_conf:
                f.write(f"{t}  ({a or 'unknown'})\n   best guess: {vt}\n   {u}\n\n")
        print(f"Review list appended to {report}")


if __name__ == "__main__":
    main()
