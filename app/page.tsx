'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const NAVY = '#0D1B2A'
const BLUE = '#00b5ff'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const lenses = [
  { id: 'sf', num: '01', name: 'Scriptural fidelity', tag: 'Biblical accuracy and alignment', desc: 'Evaluates whether lyrics align with Scripture. Flags Word of Faith language, vague universalism, or elevation of personal experience over biblical truth.', meta: [{ k: 'Watchpoints', v: 'Word of Faith, universalism' }, { k: 'Score range', v: '0-10' }] },
  { id: 'tc', num: '02', name: 'Theological clarity', tag: 'The Radio Test', desc: 'Applies the Radio Test: could a secular station play this without knowing it is worship? Strong songs are unmistakably Christ-centred.', meta: [{ k: 'Watchpoints', v: 'Vague spirituality' }, { k: 'Score range', v: '0-10' }] },
  { id: 'sg', num: '03', name: 'Singability', tag: 'Range, key, congregational fit', desc: 'Ideal congregational range is A3-D5. Notes original key, recommends a congregation-friendly key, and evaluates melody accessibility for untrained singers.', meta: [{ k: 'Ideal range', v: 'A3-D5' }, { k: 'Score range', v: '0-10' }] },
  { id: 'pq', num: '04', name: 'Poetic quality', tag: 'Imagery, grammar, lyric depth', desc: 'Evaluates grammar, repetition ratio, cliche density, and imagery quality. Songs that carry weight in their words, not just their melody, score highest.', meta: [{ k: 'Watchpoints', v: 'Cliches, filler repetition' }, { k: 'Score range', v: '0-10' }] },
  { id: 'db', num: '05', name: 'Defense brief', tag: 'Objections and Scripture responses', desc: '2-3 likely congregant objections with Scripture-based responses, an honest concession, and suggested framing. Equips leaders to defend song choices pastorally.', meta: [{ k: 'Includes', v: 'Objections, concession, framing' }, { k: 'Score range', v: '0-10' }] },
]

const cardLenses = [
  { label: 'Scriptural fidelity', score: '9.0', pct: '90%', color: 'green' },
  { label: 'Theological clarity', score: '8.5', pct: '85%', color: 'green' },
  { label: 'Singability', score: '7.0', pct: '70%', color: 'amber' },
  { label: 'Poetic quality', score: '8.0', pct: '80%', color: 'green' },
  { label: 'Defense brief', score: '9.0', pct: '90%', color: 'green' },
]

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

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openLens, setOpenLens] = useState<string | null>(null)
  const [songCount, setSongCount] = useState<number | null>(null)

  useEffect(() => {
    supabase
      .from('songs')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        if (count !== null) setSongCount(count)
      })
  }, [])

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: '#ffffff', color: '#0D1B2A' }}>
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
          background: ${NAVY};
          border-top: 0.5px solid rgba(255,255,255,0.08);
        }
        .mobile-menu.open { max-height: 280px; }
        .lens-detail {
          max-height: 0; overflow: hidden; opacity: 0;
          transition: max-height 0.35s ease, opacity 0.25s ease;
        }
        .lens-detail.open { max-height: 200px; opacity: 1; }
        .lens-row-btn:hover { background: #F7FAFD; }
        .recently-scroll::-webkit-scrollbar { display: none; }
        @media (max-width: 680px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-card-wrap { display: none !important; }
          .desktop-nav-links { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .lens-tag { display: none; }
        }
        @media (min-width: 681px) {
          .hamburger-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ background: NAVY, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 68, maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LogoWhite height={44} />
          </Link>
          <div className="desktop-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <Link href="/songs" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Songs</Link>
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
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: NAVY, padding: '52px 24px 48px' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 1000, margin: '0 auto', gap: '2.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 16 }}>
              <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
              Biblical clarity for song selection
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 16 }}>
              Know what<br />you <span style={{ color: BLUE, fontWeight: 300 }}>sing.</span>
            </h1>
            <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 380, marginBottom: 24 }}>
              Theological review of congregational worship songs for worship leaders. Five lenses. Honest scores. Pastoral framing.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' as const }}>
              <Link href="/songs" style={{ fontSize: 13, fontWeight: 500, color: NAVY, background: BLUE, padding: '11px 22px', borderRadius: 8, textDecoration: 'none' }}>
                Browse Songs
              </Link>
              <Link href="/scoring-philosophy" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>
                How scoring works →
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 28, marginTop: 32, paddingTop: 24, borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
              {[
                [songCount !== null ? String(songCount) : '...', 'Songs reviewed'],
                ['5', 'Theological lenses'],
                ['Biblical', 'Every review'],
              ].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 22, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.03em' }}>{num}</div>
                  <div style={{ fontSize: 10, fontWeight: 300, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* HERO CARD */}
          <div className="hero-card-wrap" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: '#F4F7FB', border: '0.5px solid #E2E8F0', borderRadius: 12, padding: '16px', width: 280 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#0D1B2A', letterSpacing: '-0.01em', marginBottom: 2 }}>Holy Forever</p>
              <p style={{ fontSize: 11, fontWeight: 300, color: '#7A8A9A', marginBottom: 12 }}>Chris Tomlin · CCLI #7202827</p>
              {cardLenses.map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 10, color: '#7A8A9A', width: 100, flexShrink: 0 }}>{l.label}</span>
                  <div style={{ flex: 1, height: 3, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, width: l.pct, background: l.color === 'green' ? '#4A8B2A' : '#C47B0E' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, width: 24, textAlign: 'right' as const, color: l.color === 'green' ? '#2A6010' : '#7A5010' }}>{l.score}</span>
                </div>
              ))}
              <div style={{ height: '0.5px', background: '#E2E8F0', margin: '12px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 10, color: '#9AA4AF', marginBottom: 4 }}>Overall score</p>
                  <span style={{ fontSize: 11, fontWeight: 500, background: '#DCEFCF', color: '#2A6010', padding: '3px 10px', borderRadius: 20 }}>Use freely</span>
                </div>
                <span style={{ fontSize: 26, fontWeight: 600, color: '#2A6010', letterSpacing: '-0.03em' }}>8.3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY REVIEWED */}
      <section style={{ background: '#ffffff', padding: '32px 24px', borderBottom: '0.5px solid #F0F4F8' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF' }}>Recently reviewed</span>
            <Link href="/songs" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>See all →</Link>
          </div>
          <div className="recently-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto' as const, paddingBottom: 4, scrollbarWidth: 'none' as const }}>
            {[
              { title: 'Cornerstone', artist: 'Hillsong Worship', score: '8.4', color: 'green', bars: [90, 85, 80, 88, 75] },
              { title: 'Reckless Love', artist: 'Cory Asbury', score: '6.7', color: 'amber', bars: [62, 58, 80, 76, 65] },
              { title: 'Good Good Father', artist: 'Chris Tomlin', score: '5.2', color: 'orange', bars: [50, 48, 70, 65, 42] },
              { title: 'How Great Is Our God', artist: 'Chris Tomlin', score: '8.1', color: 'green', bars: [88, 82, 75, 80, 84] },
            ].map(song => {
              const scoreColor = song.color === 'green' ? '#2A6010' : song.color === 'amber' ? '#7A5010' : '#8B3010'
              const scoreBg = song.color === 'green' ? '#DCEFCF' : song.color === 'amber' ? '#FEF0CC' : '#FDE0CC'
              const barColor = song.color === 'green' ? '#4A8B2A' : song.color === 'amber' ? '#C47B0E' : '#C45020'
              return (
                <div key={song.title} style={{ background: '#F4F7FB', border: '0.5px solid #E2E8F0', borderRadius: 12, padding: '14px', flexShrink: 0, width: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, background: scoreBg, color: scoreColor, padding: '2px 8px', borderRadius: 6 }}>{song.score}</span>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: barColor, display: 'inline-block' }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1B2A', marginBottom: 2 }}>{song.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 300, color: '#7A8A9A', marginBottom: 10 }}>{song.artist}</div>
                  <div style={{ display: 'flex', gap: 3, paddingTop: 10, borderTop: '0.5px solid #E2E8F0' }}>
                    {song.bars.map((w, i) => (
                      <div key={i} style={{ flex: 1, height: 3, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${w}%`, background: barColor, borderRadius: 2 }} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* PULL QUOTE */}
      <section style={{ background: '#F7F9FC', padding: '52px 24px', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' as const }}>
          <p style={{ fontSize: 'clamp(17px, 2.5vw, 22px)', fontWeight: 300, lineHeight: 1.65, letterSpacing: '-0.01em', color: '#0D1B2A' }}>
            If you want to know what a church believes, listen to what it sings. What the Church sings today will shape what the Church believes tomorrow.
          </p>
          <div style={{ width: 28, height: 2, background: BLUE, borderRadius: 1, margin: '24px auto 0' }} />
        </div>
      </section>

      {/* FIVE LENSES */}
      <section style={{ padding: '48px 24px', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#9AA4AF' }}>The evaluation framework</span>
            <span style={{ fontSize: 12, fontWeight: 300, color: '#9AA4AF' }}>Select a lens to learn more</span>
          </div>
          <div style={{ border: '0.5px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            {lenses.map((lens, i) => (
              <div key={lens.id} style={{ background: '#ffffff', borderBottom: i < lenses.length - 1 ? '0.5px solid #F0F4F8' : 'none' }}>
                <button
                  className="lens-row-btn"
                  onClick={() => setOpenLens(prev => prev === lens.id ? null : lens.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', width: '100%', background: 'none', border: 'none', textAlign: 'left' as const, fontFamily: "'Sora', sans-serif", cursor: 'pointer', transition: 'background 0.15s' }}
                >
                  <span style={{ fontSize: 11, color: '#9AA4AF', width: 20, flexShrink: 0 }}>{lens.num}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: '#0D1B2A' }}>{lens.name}</span>
                  <span className="lens-tag" style={{ fontSize: 11, color: '#9AA4AF', fontWeight: 300 }}>{lens.tag}</span>
                  <svg style={{ width: 14, height: 14, color: '#9AA4AF', transition: 'transform 0.2s', transform: openLens === lens.id ? 'rotate(180deg)' : 'none', flexShrink: 0 }} viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={`lens-detail${openLens === lens.id ? ' open' : ''}`}>
                  <div style={{ padding: '0 20px 16px 54px', display: 'flex', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' as const }}>
                    <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, fontWeight: 300, maxWidth: 480 }}>{lens.desc}</p>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5, flexShrink: 0 }}>
                      {lens.meta.map(m => (
                        <div key={m.k} style={{ display: 'flex', gap: 8 }}>
                          <span style={{ fontSize: 11, color: '#9AA4AF', width: 80, flexShrink: 0 }}>{m.k}</span>
                          <span style={{ fontSize: 11, color: '#4A5568' }}>{m.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, textAlign: 'center' as const }}>
            <Link href="/scoring-philosophy" style={{ fontSize: 13, fontWeight: 400, color: BLUE, textDecoration: 'none' }}>
              Read the full scoring philosophy →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: NAVY, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 16 }}>
          <LogoWhite height={28} />
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/songs" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Songs</Link>
            <Link href="/about" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>About</Link>
            <Link href="/scoring-philosophy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Scoring Philosophy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
