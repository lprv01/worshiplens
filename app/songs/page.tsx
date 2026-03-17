'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NAVY = '#0D1B2A'
const BLUE = '#00b5ff'

type Song = {
  id: string
  slug: string
  title: string
  artist: string
  ccli_number: string | null
  overall_score: number
  score_color: string
  recommendation: string
  created_at: string
}

const scoreStyles: Record<string, { color: string; bg: string; bar: string }> = {
  green:  { color: '#2A6010', bg: '#DCEFCF', bar: '#4A8B2A' },
  amber:  { color: '#7A5010', bg: '#FEF0CC', bar: '#C47B0E' },
  orange: { color: '#8B3010', bg: '#FDE0CC', bar: '#C45020' },
  red:    { color: '#8B1010', bg: '#FDDADA', bar: '#C42020' },
}

const recLabel: Record<string, string> = {
  green:  'Use freely',
  amber:  'Use with care',
  orange: 'Note concerns',
  red:    'Avoid',
}

const CCLI_ORDER: Record<string, number> = {
  '7065764': 1, '7089918': 2, '7047788': 3, '7026382': 4,
  '7093989': 5, '7202827': 6, '4556538': 7, '7019427': 8,
}

type SortKey = 'newest' | 'alpha_az' | 'alpha_za' | 'score_desc' | 'artist' | 'ccli'

// Logo 01 — white + blue wordmark
function LogoWhite({ height = 22 }: { height?: number }) {
  const w = height * (672.16 / 174.63)
  return (
    <svg width={w} height={height} viewBox="0 0 672.16 174.63" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <g>
        <path fill="#fff" d="M154.42,72.27c9.08,0,16.46,7.38,16.46,16.46s-7.38,16.46-16.46,16.46-16.46-7.38-16.46-16.46,7.38-16.46,16.46-16.46M154.42,61.17c-15.22,0-27.56,12.34-27.56,27.56s12.34,27.56,27.56,27.56,27.56-12.34,27.56-27.56-12.34-27.56-27.56-27.56h0Z"/>
        <circle fill="#fff" cx="160.71" cy="80.39" r="8.22"/>
        <circle fill="#fff" cx="165.05" cy="91.63" r="1.95"/>
      </g>
      <path fill="#fff" d="M78.49,61.5l-14.02,53.49h-13.59L30.11,42.47h14.24l14.13,55.88,15-55.88h10.11l15,55.88,14.02-55.88h14.24l-20.66,72.52h-13.59l-14.13-53.49Z"/>
      <path fill="#fff" d="M192.96,62.47h11.42v7.72c3.91-5,10.22-8.92,17.07-8.92v11.31c-.98-.22-2.17-.33-3.59-.33-4.78,0-11.2,3.26-13.48,6.96v35.77h-11.42v-52.51Z"/>
      <path fill="#fff" d="M231.34,99.87c3.7,3.81,10.98,7.39,17.83,7.39s10.33-2.5,10.33-6.42c0-4.57-5.54-6.2-11.96-7.61-9.02-1.96-19.79-4.35-19.79-16.09,0-8.59,7.39-15.98,20.66-15.98,8.92,0,15.66,3.15,20.44,7.39l-4.78,8.04c-3.15-3.59-9.02-6.31-15.55-6.31-5.98,0-9.78,2.17-9.78,5.87,0,4.02,5.22,5.44,11.42,6.85,9.13,1.96,20.33,4.57,20.33,16.96,0,9.24-7.72,16.31-21.85,16.31-8.91,0-17.07-2.83-22.5-8.15l5.22-8.26Z"/>
      <path fill="#fff" d="M317.54,81.93c0-8.15-4.24-10.65-10.66-10.65-5.76,0-10.76,3.48-13.48,7.07v36.64h-11.42V42.47h11.42v27.18c3.48-4.13,10.33-8.48,18.59-8.48,11.31,0,16.96,5.87,16.96,16.63v37.18h-11.42v-33.05Z"/>
      <path fill="#fff" d="M342.33,46.71c0-3.91,3.26-7.07,7.07-7.07s7.07,3.15,7.07,7.07-3.15,7.07-7.07,7.07-7.07-3.15-7.07-7.07ZM343.74,62.47h11.42v52.51h-11.42v-52.51Z"/>
      <path fill="#fff" d="M369.94,134.99V62.47h11.42v7.17c3.91-5.22,10-8.48,16.85-8.48,13.59,0,23.27,10.22,23.27,27.51s-9.68,27.61-23.27,27.61c-6.63,0-12.61-2.94-16.85-8.59v27.29h-11.42ZM394.84,71.28c-5.33,0-10.98,3.15-13.48,7.07v20.77c2.5,3.81,8.15,7.07,13.48,7.07,9.02,0,14.79-7.28,14.79-17.5s-5.76-17.4-14.79-17.4Z"/>
      <path fill="#00b5ff" d="M434.62,42.47h6.2v66.86h35.12v5.65h-41.31V42.47Z"/>
      <path fill="#00b5ff" d="M508.66,61.17c15.98,0,24.79,12.72,24.79,27.83v1.52h-43.92c.54,11.42,8.15,20.87,20.55,20.87,6.63,0,12.72-2.5,17.18-7.28l2.94,3.7c-5.22,5.44-11.85,8.48-20.55,8.48-15.33,0-26.31-11.42-26.31-27.61,0-15.22,10.76-27.51,25.33-27.51ZM489.53,86.07h38.16c-.11-8.92-5.98-20-19.13-20-12.39,0-18.59,10.87-19.03,20Z"/>
      <path fill="#00b5ff" d="M583.45,79.43c0-10.11-5.11-13.16-12.72-13.16-6.74,0-13.7,4.24-17.07,9.02v39.68h-5.65v-52.51h5.65v7.94c3.8-4.57,11.31-9.24,18.92-9.24,10.65,0,16.53,5.22,16.53,17.07v36.75h-5.65v-35.55Z"/>
      <path fill="#00b5ff" d="M605.52,103.79c3.37,4.24,9.57,7.72,16.96,7.72,8.81,0,14.02-4.35,14.02-10.44,0-6.74-7.17-8.7-14.68-10.65-8.81-2.17-18.48-4.46-18.48-14.68,0-8.05,6.85-14.57,18.7-14.57,9.02,0,15,3.48,18.81,7.72l-3.15,4.02c-3.04-4.13-8.7-6.96-15.66-6.96-8.15,0-13.16,4.02-13.16,9.46,0,5.98,6.74,7.61,14.02,9.46,9.02,2.28,19.13,4.78,19.13,15.98,0,8.48-6.52,15.44-19.68,15.44-8.48,0-15-2.5-20.22-8.26l3.37-4.24Z"/>
    </svg>
  )
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('songs')
        .select('id, slug, title, artist, ccli_number, overall_score, score_color, recommendation, created_at')
      if (data) setSongs(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    let list = [...songs]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
    }
    if (filter !== 'all') list = list.filter(s => s.score_color === filter)
    list.sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === 'alpha_az') return a.title.localeCompare(b.title)
      if (sort === 'alpha_za') return b.title.localeCompare(a.title)
      if (sort === 'score_desc') return (b.overall_score ?? 0) - (a.overall_score ?? 0)
      if (sort === 'artist') return a.artist.localeCompare(b.artist)
      if (sort === 'ccli') {
        const aR = a.ccli_number ? (CCLI_ORDER[a.ccli_number] ?? 999) : 999
        const bR = b.ccli_number ? (CCLI_ORDER[b.ccli_number] ?? 999) : 999
        return aR - bR
      }
      return 0
    })
    return list
  }, [songs, search, filter, sort])

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: '#ffffff', color: '#0D1B2A', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ham-line {
          display: block; width: 22px; height: 1.5px;
          background: #ffffff; border-radius: 2px; position: absolute;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease;
        }
        .ham-line-1 { transform: translateY(-5px); }
        .ham-line-3 { transform: translateY(5px); }
        .ham-open .ham-line-1 { transform: translateY(0) rotate(45deg); }
        .ham-open .ham-line-2 { opacity: 0; transform: scaleX(0); }
        .ham-open .ham-line-3 { transform: translateY(0) rotate(-45deg); }
        .mobile-menu {
          max-height: 0; overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1);
          background: ${NAVY}; border-top: 0.5px solid rgba(255,255,255,0.08);
        }
        .mobile-menu.open { max-height: 280px; }
        .song-row { transition: background 0.12s ease; }
        .song-row:hover { background: #F7FAFD; }
        .filters-scroll { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
        .filters-scroll::-webkit-scrollbar { display: none; }
        input::placeholder { color: rgba(255,255,255,0.35); }
        input:focus { outline: none; }
        select:focus { outline: none; }
        @media (max-width: 680px) {
          .desktop-nav-links { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .desktop-search { display: none !important; }
          .mobile-search { display: flex !important; }
          .desktop-controls { flex-direction: column !important; gap: 10px !important; }
        }
        @media (min-width: 681px) {
          .hamburger-btn { display: none !important; }
          .mobile-menu { display: none !important; }
          .mobile-search { display: none !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ background: NAVY, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LogoWhite height={22} />
          </Link>
          <div className="desktop-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <Link href="/songs" style={{ fontSize: 13, fontWeight: 500, color: '#ffffff', textDecoration: 'none' }}>Songs</Link>
            <Link href="/about" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>About</Link>
            <Link href="/scoring-philosophy" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Scoring Philosophy</Link>
          </div>
          <button
            className={`hamburger-btn${menuOpen ? ' ham-open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}
          >
            <span className="ham-line ham-line-1" />
            <span className="ham-line ham-line-2" />
            <span className="ham-line ham-line-3" />
          </button>
        </div>
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <div style={{ padding: '8px 0 16px' }}>
            {[{ href: '/songs', label: 'Songs' }, { href: '/about', label: 'About' }, { href: '/scoring-philosophy', label: 'Scoring Philosophy' }].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '13px 24px', fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
                {item.label}
              </Link>
            ))}
            <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', margin: '8px 24px' }} />
            <span style={{ display: 'block', padding: '10px 24px', fontSize: 12, color: BLUE }}>CCLI #365971</span>
          </div>
        </div>
      </nav>

      {/* LIBRARY HEADER */}
      <div style={{ background: NAVY, padding: '24px 24px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' as const, gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.03em' }}>Song Library</h1>
              <p style={{ fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                {loading ? 'Loading...' : `${songs.length} songs reviewed`}
              </p>
            </div>
            <div className="desktop-search" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '9px 14px', gap: 8, width: 260 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.4, flexShrink: 0 }}>
                <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or artist..."
                style={{ flex: 1, background: 'none', border: 'none', fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 300, color: '#ffffff' }} />
            </div>
          </div>
          <div className="mobile-search" style={{ display: 'none', alignItems: 'center', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 14px', gap: 8, marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.4, flexShrink: 0 }}>
              <circle cx="6.5" cy="6.5" r="5" stroke="white" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or artist..."
              style={{ flex: 1, background: 'none', border: 'none', fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 300, color: '#ffffff' }} />
          </div>
          <div className="desktop-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div className="filters-scroll">
              {[['all', 'All'], ['green', 'Green'], ['amber', 'Amber'], ['orange', 'Orange'], ['red', 'Red']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  style={{ fontSize: 11, fontWeight: filter === val ? 500 : 400, padding: '6px 14px', borderRadius: 20, border: 'none', background: filter === val ? BLUE : 'rgba(255,255,255,0.08)', color: filter === val ? NAVY : 'rgba(255,255,255,0.45)', cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, fontFamily: "'Sora', sans-serif", transition: 'background 0.15s, color 0.15s' }}>
                  {label}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
              style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '7px 28px 7px 10px', flexShrink: 0, cursor: 'pointer', appearance: 'none' as const, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat' as const, backgroundPosition: 'right 8px center' }}>
              <option value="newest">Newest reviews</option>
              <option value="alpha_az">Alphabetical A to Z</option>
              <option value="alpha_za">Alphabetical Z to A</option>
              <option value="score_desc">Score: high to low</option>
              <option value="artist">By artist</option>
              <option value="ccli">CCLI Top Songs</option>
            </select>
          </div>
        </div>
      </div>

      {/* SONG LIST */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {loading ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' as const, color: '#9AA4AF', fontSize: 14, fontWeight: 300 }}>Loading songs...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' as const }}>
            <p style={{ fontSize: 14, fontWeight: 300, color: '#9AA4AF' }}>No songs found.</p>
            <button onClick={() => { setSearch(''); setFilter('all') }} style={{ marginTop: 12, fontSize: 13, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>Clear filters</button>
          </div>
        ) : (
          filtered.map(song => {
            const s = scoreStyles[song.score_color] ?? scoreStyles.green
            const href = '/songs/' + (song.slug || song.id)
            return (
              <Link key={song.id} href={href} style={{ textDecoration: 'none' }}>
                <div className="song-row" style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: '0.5px solid #F0F4F8', gap: 12, cursor: 'pointer' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: s.color, width: 40, textAlign: 'center' as const, flexShrink: 0 }}>
                    {(song.overall_score ?? 0).toFixed(1)}
                  </span>
                  <div style={{ width: 3, height: 40, borderRadius: 2, background: s.bar, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#0D1B2A', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{song.title}</div>
                    <div style={{ fontSize: 12, fontWeight: 300, color: '#7A8A9A', marginTop: 2 }}>{song.artist}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color, flexShrink: 0, whiteSpace: 'nowrap' as const }}>
                    {recLabel[song.score_color] ?? 'Review'}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: '#C8D4DE', flexShrink: 0 }}>
                    <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            )
          })
        )}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '20px 24px', textAlign: 'center' as const }}>
            <span style={{ fontSize: 12, fontWeight: 300, color: '#9AA4AF' }}>{filtered.length} of {songs.length} songs</span>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: NAVY, padding: '32px 24px', marginTop: 40 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 16 }}>
          <LogoWhite height={18} />
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/songs" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Songs</Link>
            <Link href="/about" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>About</Link>
            <Link href="/scoring-philosophy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Scoring Philosophy</Link>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>CCLI #365971</span>
        </div>
      </footer>
    </div>
  )
}
