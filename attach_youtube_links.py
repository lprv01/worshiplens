#!/usr/bin/env python3
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path.home() / "Desktop" / "worshiplens" / ".env.local")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
sb = create_client(SUPABASE_URL, SUPABASE_KEY)

updates = {
    "The Chorus": "https://www.youtube.com/watch?v=_f25QVhN9co",
    "Nothing But The Blood": "https://www.youtube.com/watch?v=ZFvk7d-tBSc",
    "There Is No One": "https://www.youtube.com/watch?v=FqhxqZvdr-c",
    "He Who Is To Come": "https://www.youtube.com/watch?v=iPVPB4Cj9go",
    "Desperate": "https://www.youtube.com/watch?v=G2zI1GbWqeg",
    "Let Me See Jesus": "https://www.youtube.com/watch?v=I_Yda_PEkjQ",
    "One More Day": "https://www.youtube.com/watch?v=5s64d5QIdjw",
    "You Have Made Me Glad": "https://www.youtube.com/watch?v=3fZDS_5Jv5E",
}

print(f"Attaching {len(updates)} YouTube links...\n")
found, missing, multiple = [], [], []

for title, url in updates.items():
    res = sb.table("songs").select("id, title, artist").eq("title", title).execute()
    rows = res.data
    if len(rows) == 0:
        print(f"  NOT FOUND: {title!r}")
        missing.append(title)
    elif len(rows) > 1:
        print(f"  MULTIPLE MATCHES ({len(rows)}), skipping: {title!r}")
        for r in rows:
            print(f"      -> {r['title']} by {r['artist']}")
        multiple.append(title)
    else:
        row = rows[0]
        sb.table("songs").update({"youtube_url": url}).eq("id", row["id"]).execute()
        print(f"  OK: {title} ({row['artist']})")
        found.append(title)

print(f"\nDone. Updated: {len(found)}  Not found: {len(missing)}  Skipped (multiple): {len(multiple)}")
if missing:
    print("Missing titles, check exact spelling in Supabase:", missing)
if multiple:
    print("Ambiguous titles needing manual review:", multiple)
