#!/usr/bin/env python3
import html
import os
import re
import sys
from pathlib import Path

try:
    import requests
    from dotenv import load_dotenv
    from supabase import create_client
except ImportError as e:
    print(f"Missing package: {e.name}")
    print("Run: pip3 install supabase requests python-dotenv")
    sys.exit(1)

PROJECT = Path.home() / "Desktop" / "worshiplens"
load_dotenv(PROJECT / ".env.local")

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Supabase credentials not found in .env.local")
    sys.exit(1)

INDEX_URL = "https://www.thebereantest.com/song-review-index"


def normalize(t):
    t = html.unescape(t)
    t = t.replace("\u2019", "'").replace("\u2018", "'")
    t = t.replace("\u201c", '"').replace("\u201d", '"')
    t = t.replace("\u2013", "-").replace("\u2014", "-")
    t = t.lower().strip()
    t = re.sub(r"\(feat\.?.*?\)", "", t)
    t = re.sub(r"\(featuring.*?\)", "", t)
    t = re.sub(r"\bfeat\.?\s+.*$", "", t)
    t = re.sub(r"^the\s+", "", t)
    t = re.sub(r"[^a-z0-9 ]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def fetch_worshiplens():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    rows, page = [], 0
    while True:
        res = (
            sb.table("songs")
            .select("title, artist, slug")
            .range(page * 1000, (page + 1) * 1000 - 1)
            .execute()
        )
        if not res.data:
            break
        rows.extend(res.data)
        if len(res.data) < 1000:
            break
        page += 1
    return rows


def fetch_berean():
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
    }
    r = requests.get(INDEX_URL, headers=headers, timeout=30)
    r.raise_for_status()
    html_text = r.text

    titles = []
    for m in re.finditer(
        r"<td[^>]*>.*?<a [^>]*>\s*([^<]{2,120}?)\s*</a>",
        html_text,
        re.S,
    ):
        titles.append(m.group(1).strip())

    if len(titles) < 50:
        titles = []
        for m in re.finditer(
            r'<a [^>]*href="[^"]*/(?:blog|post|reviews?)/[^"]*"[^>]*>\s*([^<]{3,120}?)\s*</a>',
            html_text,
        ):
            t = m.group(1).strip()
            if t.lower() not in ("read more", "continue reading"):
                titles.append(t)

    seen, out = set(), []
    for t in titles:
        key = normalize(t)
        if key and key not in seen:
            seen.add(key)
            out.append(html.unescape(t))
    return out, html_text


def main():
    print("Reading WorshipLens library...")
    wl = fetch_worshiplens()
    wl_norm = {normalize(s.get("title") or "") for s in wl}
    wl_norm.discard("")
    print(f"  {len(wl)} songs in Supabase")

    print("Fetching Berean Test index...")
    try:
        bt, html_text = fetch_berean()
    except Exception as e:
        print(f"  Could not fetch the index: {e}")
        sys.exit(1)
    print(f"  {len(bt)} titles parsed from the index")

    if len(bt) < 50:
        debug = PROJECT / "berean_index_raw.html"
        debug.write_text(html_text)
        print()
        print("  That looks too low. Saved the raw page to", debug.name)
        sys.exit(1)

    missing = sorted({t for t in bt if normalize(t) not in wl_norm})

    lines = [
        "# Berean Test to WorshipLens Gap Report",
        "",
        f"- Berean Test titles on the index: {len(bt)}",
        f"- Songs in WorshipLens: {len(wl)}",
        f"- Missing from WorshipLens: {len(missing)}",
        "",
        "---",
        "",
    ]
    for t in missing:
        lines.append(f"- {t}")

    out = PROJECT / "berean_gap_report.md"
    out.write_text("\n".join(lines))

    print()
    print(f"  Missing from WorshipLens: {len(missing)}")
    print(f"  Report written to {out.name}")


if __name__ == "__main__":
    main()
