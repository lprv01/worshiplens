'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
const NAVY = '#0D1B2A'
const NAVY_DEEP = '#081320'
const BLUE = '#00b5ff'
const BLUE_SOFT = '#7FE3FF'
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
type RecentSong = {
  id: string; slug: string; title: string; artist: string
  overall_score: number; score_color: string; lenses: any
}
type HeroSong = {
  id: string; slug: string; title: string; artist: string
  overall_score: number; score_color: string; lenses: any; created_at: string
  youtube_url?: string | null
}
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openLens, setOpenLens] = useState<string | null>(null)
  const [songCount, setSongCount] = useState<number | null>(null)
  const [recentSongs, setRecentSongs] = useState<RecentSong[]>([])
  const [heroSongs, setHeroSongs] = useState<HeroSong[]>([])
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroVisible, setHeroVisible] = useState(true)
  const heroTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    supabase.from('songs').select('id', { count: 'exact', head: true }).then(({ count }) => { if (count !== null) setSongCount(count) })
    supabase.from('songs').select('id, slug, title, artist, overall_score, score_color, lenses').order('created_at', { ascending: false }).limit(12).then(({ data }) => {
      if (!data) return
      const clean = data.filter((s: RecentSong) => s.title && s.title.toLowerCase() !== 'default title' && s.title.trim() !== '')
      const green = clean.filter((s: RecentSong) => s.score_color === 'green')
      const amber = clean.filter((s: RecentSong) => s.score_color === 'amber')
      const orange = clean.filter((s: RecentSong) => s.score_color === 'orange')
      const red = clean.filter((s: RecentSong) => s.score_color === 'red')
      const mixed: RecentSong[] = []
      const pick = (arr: RecentSong[]) => { if (arr.length) mixed.push(arr.shift()!) }
      pick(green); pick(amber); pick(green); pick(orange.length ? orange : amber); pick(green); pick(red.length ? red : amber)
      setRecentSongs(mixed.length >= 4 ? mixed.slice(0, 6) : clean.slice(0, 6))
    })
    // Hero: newest reviews, deduped by base title (strip parentheticals)
    supabase.from('songs').select('id, slug, title, artist, overall_score, score_color, lenses, created_at, youtube_url').not('overall_score', 'is', null).not('lenses', 'is', null).not('title', 'in', '("1,000 Names","A Thousand Thank Yous","All I Need Is You","Anthem")').order('created_at', { ascending: false }).limit(9).then(({ data }) => {
      if (!data) return
      const baseTitle = (t: string) => t.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim()
      const seen = new Set<string>()
      const valid: HeroSong[] = []
      for (const s of data) {
        if (!s.title || s.title.toLowerCase() === 'default title') continue
        if (!s.lenses?.scriptural_fidelity?.score || !s.lenses?.theological_clarity?.score || !s.lenses?.congregational_singability?.score || !s.lenses?.poetic_lyrical_quality?.score || !s.lenses?.defense_brief?.score) continue
        const base = baseTitle(s.title)
        if (seen.has(base)) continue
        seen.add(base)
        valid.push(s)
        if (valid.length >= 10) break
      }
      setHeroSongs(valid)
    })
  }, [])
  useEffect(() => {
    if (heroSongs.length < 2) return
    heroTimerRef.current = setTimeout(() => {
      setHeroVisible(false)
      setTimeout(() => { setHeroIndex(i => (i + 1) % heroSongs.length); setHeroVisible(true) }, 400)
    }, 4000)
    return () => { if (heroTimerRef.current) clearTimeout(heroTimerRef.current) }
  }, [heroIndex, heroSongs])
  useEffect(() => {
    const els = document.querySelectorAll('.reveal-on-scroll')
    const io = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }) }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [recentSongs])
  const currentHero = heroSongs[heroIndex]
  const heroLenses = currentHero ? [
    { label: 'Scriptural fidelity', score: currentHero.lenses?.scriptural_fidelity?.score ?? 0 },
    { label: 'Theological clarity', score: currentHero.lenses?.theological_clarity?.score ?? 0 },
    { label: 'Singability', score: currentHero.lenses?.congregational_singability?.score ?? 0 },
    { label: 'Poetic quality', score: currentHero.lenses?.poetic_lyrical_quality?.score ?? 0 },
    { label: 'Defense brief', score: currentHero.lenses?.defense_brief?.score ?? 0 },
  ] : []
  const scoreLabel = (s: number) => s >= 8 ? 'Use freely' : s >= 6.5 ? 'Recommended with notes' : s >= 5 ? 'Use with caution' : 'Not recommended'
  const scoreColors = (sc: string) => ({ text: sc === 'green' ? '#2A6010' : sc === 'amber' ? '#7A5010' : sc === 'orange' ? '#8B3010' : '#8B1010', bg: sc === 'green' ? '#DCEFCF' : sc === 'amber' ? '#FEF0CC' : sc === 'orange' ? '#FDE0CC' : '#FDDADA', bar: sc === 'green' ? 'linear-gradient(90deg,#5AA02F,#4A8B2A)' : sc === 'amber' ? 'linear-gradient(90deg,#D68C1A,#C47B0E)' : 'linear-gradient(90deg,#C45020,#A03010)' })
  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: '#ffffff', color: '#0D1B2A' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        @keyframes growBar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes floatCard { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes glowDrift { 0%, 100% { opacity: 0.55; transform: translate(0, 0) scale(1); } 50% { opacity: 0.8; transform: translate(-3%, 3%) scale(1.06); } }
        .fade-up { opacity: 0; animation: fadeUp 0.7s cubic-bezier(0.2,0.7,0.2,1) forwards; }
        .reveal-on-scroll { opacity: 0; transform: translateY(26px); transition: opacity 0.7s cubic-bezier(0.2,0.7,0.2,1), transform 0.7s cubic-bezier(0.2,0.7,0.2,1); }
        .reveal-on-scroll.in { opacity: 1; transform: none; }
        .nav-link { transition: color 0.18s ease; }
        .nav-link:hover { color: rgba(255,255,255,0.95) !important; }
        .cta-primary { position: relative; transition: transform 0.2s cubic-bezier(0.2,0.7,0.2,1), box-shadow 0.2s ease; box-shadow: 0 6px 24px -6px rgba(0,181,255,0.55); }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 34px -6px rgba(0,181,255,0.75); }
        .cta-ghost { transition: color 0.18s ease; }
        .cta-ghost:hover { color: rgba(255,255,255,0.9) !important; }
        .hero-card { animation: floatCard 7s ease-in-out infinite; box-shadow: 0 30px 60px -24px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.6) inset; }
        .hero-glow { animation: glowDrift 9s ease-in-out infinite; }
        .bar-fill { transform-origin: left center; animation: growBar 0.9s cubic-bezier(0.2,0.7,0.2,1) both; }
        .hero-card-inner { transition: opacity 0.4s ease; }
        .ham-line { display: block; width: 22px; height: 1.5px; background: #ffffff; border-radius: 2px; position: absolute; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease; }
        .ham-line-1 { transform: translateY(-5px); }
        .ham-line-3 { transform: translateY(5px); }
        .ham-open .ham-line-1 { transform: translateY(0) rotate(45deg); }
        .ham-open .ham-line-2 { opacity: 0; transform: scaleX(0); }
        .ham-open .ham-line-3 { transform: translateY(0) rotate(-45deg); }
        .mobile-menu { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1); background: ${NAVY}; border-top: 0.5px solid rgba(255,255,255,0.08); }
        .mobile-menu.open { max-height: 280px; }
        .lens-detail { max-height: 0; overflow: hidden; opacity: 0; transition: max-height 0.35s ease, opacity 0.25s ease; }
        .lens-detail.open { max-height: 220px; opacity: 1; }
        .lens-row-btn { transition: background 0.18s ease; }
        .lens-row-btn:hover { background: #F5F9FD; }
        .lens-row-btn:hover .lens-num { background: ${BLUE}; color: ${NAVY}; border-color: ${BLUE}; }
        .lens-num { transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease; }
        .song-card { transition: transform 0.2s cubic-bezier(0.2,0.7,0.2,1), box-shadow 0.2s ease, border-color 0.2s ease; }
        .song-card:hover { transform: translateY(-5px); border-color: #C8D4DE !important; box-shadow: 0 18px 30px -18px rgba(13,27,42,0.35); }
        .recently-scroll::-webkit-scrollbar { display: none; }
        .hero-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); border: none; padding: 0; cursor: pointer; transition: background 0.2s, transform 0.2s; }
        .hero-dot.active { background: ${BLUE}; transform: scale(1.3); }
        @media (prefers-reduced-motion: reduce) {
          .fade-up, .bar-fill, .hero-card, .hero-glow { animation: none !important; }
          .reveal-on-scroll { opacity: 1 !important; transform: none !important; }
          .fade-up { opacity: 1 !important; }
        }
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
      <nav style={{ background: NAVY, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 68, maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}><LogoWhite height={44} /></Link>
          <div className="desktop-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <Link className="nav-link" href="/songs" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Songs</Link>
            <Link className="nav-link" href="/about" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>About</Link>
            <Link className="nav-link" href="/scoring-philosophy" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Scoring Philosophy</Link>
            <Link className="cta-primary" href="/songs" style={{ fontSize: 12.5, fontWeight: 500, color: NAVY, background: BLUE, padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>Browse Songs</Link>
          </div>
          <button className={`hamburger-btn${menuOpen ? ' ham-open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label="Menu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <span className="ham-line ham-line-1" /><span className="ham-line ham-line-2" /><span className="ham-line ham-line-3" />
          </button>
        </div>
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <div style={{ padding: '8px 0 16px' }}>
            {[{ href: '/songs', label: 'Songs' }, { href: '/about', label: 'About' }, { href: '/scoring-philosophy', label: 'Scoring Philosophy' }].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '13px 24px', fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{item.label}</Link>
            ))}
          </div>
        </div>
      </nav>
      <section style={{ position: 'relative', background: `linear-gradient(170deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, padding: '72px 24px 76px', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '26px 26px', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%, #000 30%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 0%, #000 30%, transparent 78%)', pointerEvents: 'none' }} />
        <div className="hero-glow" aria-hidden style={{ position: 'absolute', top: '-14%', right: '4%', width: 620, height: 620, background: `radial-gradient(circle, ${BLUE} 0%, transparent 62%)`, opacity: 0.6, filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: '-30%', left: '-8%', width: 460, height: 460, background: 'radial-gradient(circle, rgba(0,181,255,0.18) 0%, transparent 65%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div className="hero-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.05fr 1fr', maxWidth: 1000, margin: '0 auto', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div className="fade-up" style={{ animationDelay: '0.02s', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 22, padding: '6px 12px', border: '0.5px solid rgba(0,181,255,0.28)', borderRadius: 100, background: 'rgba(0,181,255,0.07)' }}>
              <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 8px ${BLUE}` }} />
              Biblical clarity for song selection
            </div>
            <h1 className="fade-up" style={{ animationDelay: '0.08s', fontSize: 'clamp(38px, 5.6vw, 60px)', fontWeight: 600, color: '#ffffff', lineHeight: 1.04, letterSpacing: '-0.045em', marginBottom: 20 }}>
              Know what<br />you{' '}
              <span style={{ fontWeight: 600, backgroundImage: `linear-gradient(100deg, ${BLUE}, ${BLUE_SOFT})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>sing.</span>
            </h1>
            <p className="fade-up" style={{ animationDelay: '0.14s', fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.58)', lineHeight: 1.7, maxWidth: 400, marginBottom: 30 }}>
              Theological review of congregational worship songs for worship leaders. Five lenses. Honest scores. Pastoral framing.
            </p>
            <div className="fade-up" style={{ animationDelay: '0.2s', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' as const }}>
              <Link className="cta-primary" href="/songs" style={{ fontSize: 13.5, fontWeight: 500, color: NAVY, background: BLUE, padding: '13px 26px', borderRadius: 10, textDecoration: 'none' }}>Browse Songs</Link>
              <Link className="cta-ghost" href="/scoring-philosophy" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 400, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>How scoring works →</Link>
            </div>
            <div className="fade-up" style={{ animationDelay: '0.28s', display: 'flex', gap: 36, marginTop: 40, paddingTop: 26, borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
              {[[songCount !== null ? String(songCount) : '1,000+', 'Songs reviewed'], ['5', 'Theological lenses'], ['Biblical', 'Every review']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#ffffff', letterSpacing: '-0.03em' }}>{num}</div>
                  <div style={{ fontSize: 10, fontWeight: 300, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.03em', marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-card-wrap fade-up" style={{ animationDelay: '0.24s', display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 14 }}>
            {currentHero ? (
              <Link href={'/songs/' + (currentHero.slug || currentHero.id)} style={{ textDecoration: 'none', width: 300 }}>
                <div className="hero-card" style={{ position: 'relative', background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F6FB 100%)', borderRadius: 16, padding: '20px', width: 300 }}>
                  <div aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 16, padding: 1, background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(0,181,255,0.15))', WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none' }} />
                  <div className="hero-card-inner" style={{ opacity: heroVisible ? 1 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.01em', marginBottom: 3, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{currentHero.title}</p>
                        <p style={{ fontSize: 11, fontWeight: 300, color: '#7A8A9A', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{currentHero.artist}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {currentHero.youtube_url && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(currentHero.youtube_url!, '_blank', 'noopener,noreferrer') }}
                            aria-label={`Watch ${currentHero.title} on YouTube`}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: '#FF0000', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#ffffff"><path d="M8 5v14l11-7z" /></svg>
                          </button>
                        )}
                        <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: BLUE, padding: '4px 8px', background: 'rgba(0,181,255,0.1)', borderRadius: 6 }}>Live</span>
                      </div>
                    </div>
                    {heroLenses.map((l, i) => {
                      const pct = `${(l.score / 10) * 100}%`
                      const isAmber = l.score < 7.5
                      return (
                        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                          <span style={{ fontSize: 10, color: '#7A8A9A', width: 104, flexShrink: 0 }}>{l.label}</span>
                          <div style={{ flex: 1, height: 4, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                            <div className="bar-fill" style={{ height: '100%', borderRadius: 3, width: pct, animationDelay: `${0.5 + i * 0.09}s`, background: isAmber ? 'linear-gradient(90deg,#D68C1A,#C47B0E)' : 'linear-gradient(90deg,#5AA02F,#4A8B2A)' }} />
                          </div>
                          <span style={{ fontSize: 11.5, fontWeight: 600, width: 26, textAlign: 'right' as const, color: isAmber ? '#7A5010' : '#2A6010' }}>{l.score.toFixed(1)}</span>
                        </div>
                      )
                    })}
                    <div style={{ height: '0.5px', background: '#E2E8F0', margin: '14px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: 10, color: '#9AA4AF', marginBottom: 5 }}>Overall score</p>
                        <span style={{ fontSize: 11, fontWeight: 500, background: scoreColors(currentHero.score_color).bg, color: scoreColors(currentHero.score_color).text, padding: '3px 10px', borderRadius: 20 }}>{scoreLabel(currentHero.overall_score)}</span>
                      </div>
                      <span style={{ fontSize: 30, fontWeight: 600, color: scoreColors(currentHero.score_color).text, letterSpacing: '-0.03em' }}>{currentHero.overall_score.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="hero-card" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F6FB 100%)', borderRadius: 16, padding: '20px', width: 300, minHeight: 280 }} />
            )}
            {heroSongs.length > 1 && (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', width: 300 }}>
                {heroSongs.map((_, i) => (
                  <button key={i} className={`hero-dot${i === heroIndex ? ' active' : ''}`} onClick={() => { setHeroVisible(false); setTimeout(() => { setHeroIndex(i); setHeroVisible(true) }, 400) }} aria-label={`Song ${i + 1}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="reveal-on-scroll" style={{ background: '#ffffff', padding: '44px 24px', borderBottom: '0.5px solid #F0F4F8' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF' }}>Recently reviewed</span>
            <Link className="cta-ghost" href="/songs" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>See all →</Link>
          </div>
          <div className="recently-scroll" style={{ display: 'flex', gap: 14, overflowX: 'auto' as const, paddingBottom: 8, scrollbarWidth: 'none' as const }}>
            {recentSongs.map(song => {
              const sc = song.score_color || 'green'
              const scoreColor = sc === 'green' ? '#2A6010' : sc === 'amber' ? '#7A5010' : sc === 'orange' ? '#8B3010' : '#8B1010'
              const scoreBg = sc === 'green' ? '#DCEFCF' : sc === 'amber' ? '#FEF0CC' : sc === 'orange' ? '#FDE0CC' : '#FDDADA'
              const barColor = sc === 'green' ? '#4A8B2A' : sc === 'amber' ? '#C47B0E' : sc === 'orange' ? '#C45020' : '#C42020'
              const lenses = song.lenses ?? {}
              const bars = [lenses.scriptural_fidelity?.score ?? 0, lenses.theological_clarity?.score ?? 0, lenses.congregational_singability?.score ?? 0, lenses.poetic_lyrical_quality?.score ?? 0, lenses.defense_brief?.score ?? 0]
              const href = '/songs/' + (song.slug || song.id)
              return (
                <Link key={song.id} href={href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <div className="song-card" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F7FB 100%)', border: '0.5px solid #E2E8F0', borderRadius: 14, padding: '16px', width: 206, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, background: scoreBg, color: scoreColor, padding: '2px 8px', borderRadius: 6 }}>{(song.overall_score ?? 0).toFixed(1)}</span>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: barColor, display: 'inline-block' }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1B2A', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{song.title}</div>
                    <div style={{ fontSize: 11, fontWeight: 300, color: '#7A8A9A', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{song.artist}</div>
                    <div style={{ display: 'flex', gap: 3, paddingTop: 10, borderTop: '0.5px solid #E2E8F0' }}>
                      {bars.map((w, i) => (
                        <div key={i} style={{ flex: 1, height: 3, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(w / 10) * 100}%`, background: barColor, borderRadius: 2 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
      <section className="reveal-on-scroll" style={{ position: 'relative', background: `linear-gradient(180deg, #F7F9FC 0%, #EEF3F9 100%)`, padding: '76px 24px', borderBottom: '0.5px solid #E8EDF2', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 160, lineHeight: 1, fontWeight: 700, color: BLUE, opacity: 0.08, fontFamily: 'Georgia, serif', pointerEvents: 'none' }}>"</div>
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' as const }}>
          <p style={{ fontSize: 'clamp(19px, 2.7vw, 26px)', fontWeight: 300, lineHeight: 1.6, letterSpacing: '-0.015em', color: '#0D1B2A' }}>
            If you want to know what a church believes, listen to what it sings. What the Church sings today will shape what the Church believes tomorrow.
          </p>
          <div style={{ width: 32, height: 2.5, background: `linear-gradient(90deg, ${BLUE}, ${BLUE_SOFT})`, borderRadius: 2, margin: '28px auto 20px' }} />
          <Link href="/about" style={{ fontSize: 13, fontWeight: 400, color: '#7A8A9A', textDecoration: 'none' }}>
            Ludwingk Rios, Worship Leader and Editor →
          </Link>
        </div>
      </section>
      <section className="reveal-on-scroll" style={{ padding: '64px 24px', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE }}>The evaluation framework</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginTop: 8, flexWrap: 'wrap' as const }}>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.03em', lineHeight: 1.15 }}>Five lenses on every song</h2>
              <span style={{ fontSize: 12, fontWeight: 300, color: '#9AA4AF', paddingBottom: 4 }}>Select a lens to learn more</span>
            </div>
          </div>
          <div style={{ border: '0.5px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 30px -22px rgba(13,27,42,0.3)' }}>
            {lenses.map((lens, i) => (
              <div key={lens.id} style={{ background: '#ffffff', borderBottom: i < lenses.length - 1 ? '0.5px solid #F0F4F8' : 'none' }}>
                <button className="lens-row-btn" onClick={() => setOpenLens(prev => prev === lens.id ? null : lens.id)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px', width: '100%', background: 'none', border: 'none', textAlign: 'left' as const, fontFamily: "'Sora', sans-serif", cursor: 'pointer' }}>
                  <span className="lens-num" style={{ fontSize: 11, fontWeight: 500, color: '#9AA4AF', width: 30, height: 30, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '0.5px solid #E2E8F0', borderRadius: '50%' }}>{lens.num}</span>
                  <span style={{ fontSize: 14.5, fontWeight: 500, flex: 1, color: '#0D1B2A' }}>{lens.name}</span>
                  <span className="lens-tag" style={{ fontSize: 11, color: '#9AA4AF', fontWeight: 300 }}>{lens.tag}</span>
                  <svg style={{ width: 14, height: 14, color: '#9AA4AF', transition: 'transform 0.2s', transform: openLens === lens.id ? 'rotate(180deg)' : 'none', flexShrink: 0 }} viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={`lens-detail${openLens === lens.id ? ' open' : ''}`}>
                  <div style={{ padding: '0 22px 18px 68px', display: 'flex', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' as const }}>
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
          <div style={{ marginTop: 20, textAlign: 'center' as const }}>
            <Link className="cta-ghost" href="/scoring-philosophy" style={{ fontSize: 13, fontWeight: 400, color: BLUE, textDecoration: 'none' }}>Read the full scoring philosophy →</Link>
          </div>
        </div>
      </section>
      <footer style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 16 }}>
          <LogoWhite height={44} />
          <div style={{ display: 'flex', gap: 24 }}>
            <Link className="nav-link" href="/songs" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Songs</Link>
            <Link className="nav-link" href="/about" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>About</Link>
            <Link className="nav-link" href="/scoring-philosophy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Scoring Philosophy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
