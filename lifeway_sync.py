#!/usr/bin/env python3
import os, re, sys, urllib.request
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
LIFEWAY_URL = "https://worship.lifeway.com/n/popularsongs"

def fetch_lifeway_titles():
    req = urllib.request.Request(LIFEWAY_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode("utf-8")
    titles = re.findall(r'searchString=[^"]+">([^<]+)</a>', html)
    return [t.strip() for t in titles if t.strip()]

def normalize(title):
    t = title.lower()
    t = re.sub(r'\(.*?\)', '', t)
    t = re.sub(r'[^a-z0-9 ]', '', t)
    return t.strip()

def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Fetching Lifeway Top 100...")
    lifeway_titles = fetch_lifeway_titles()
    lifeway_norm = {normalize(t) for t in lifeway_titles}
    print(f"  Found {len(lifeway_titles)} songs on Lifeway")
    result = sb.from_("songs").select("id, title").execute()
    all_songs = result.data
    print(f"  Found {len(all_songs)} songs in database")
    matches = [s["id"] for s in all_songs if normalize(s["title"]) in lifeway_norm]
    no_matches = [s["id"] for s in all_songs if normalize(s["title"]) not in lifeway_norm]
    if matches:
        sb.from_("songs").update({"is_top_song": True}).in_("id", matches).execute()
    if no_matches:
        sb.from_("songs").update({"is_top_song": False}).in_("id", no_matches).execute()
    print(f"  Tagged {len(matches)} songs as Lifeway Top 100")
    print("Sync complete!")

if __name__ == "__main__":
    main()
