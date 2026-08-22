'use client'

import { useState } from 'react'
import Link from 'next/link'
import { NAVY, BLUE, LogoWhite } from '../lib/review-shared'

const NAVY_DEEP = '#081320'
const BLUE_SOFT = '#7FE3FF'
const GUEST_CODE = 'worshipguest'

export default function InviteClient() {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(GUEST_CODE)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", position: 'relative', minHeight: '100vh', background: `linear-gradient(170deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '38px 22px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes glowDrift { 0%,100% { opacity: .5; transform: translate(0,0) scale(1); } 50% { opacity: .85; transform: translate(-3%,3%) scale(1.08); } }
        @keyframes ctaPulse { 0%,100% { box-shadow: 0 8px 30px -6px rgba(0,181,255,.55); } 50% { box-shadow: 0 10px 40px -4px rgba(0,181,255,.9); } }
        @keyframes barGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .inv-fade { opacity: 0; animation: fadeUp .7s cubic-bezier(.2,.7,.2,1) forwards; }
        .inv-glow { animation: glowDrift 9s ease-in-out infinite; }
        .inv-cta { animation: ctaPulse 3s ease-in-out infinite; transition: transform .2s cubic-bezier(.2,.7,.2,1); }
        .inv-cta:hover { transform: translateY(-2px); }
        .inv-ghost { transition: color .18s ease; }
        .inv-ghost:hover { color: #fff !important; }
        .inv-bar { transform-origin: left center; animation: barGrow .9s cubic-bezier(.2,.7,.2,1) both; }
        .inv-copy { transition: border-color .18s ease, background .18s ease; }
        .inv-copy:hover { border-color: ${BLUE} !important; background: rgba(0,181,255,.12) !important; }
        @media (prefers-reduced-motion: reduce) {
          .inv-fade, .inv-glow, .inv-cta, .inv-bar { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      {/* background layers */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '26px 26px', maskImage: 'radial-gradient(ellipse 75% 60% at 50% 8%, #000 30%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 50% 8%, #000 30%, transparent 78%)', pointerEvents: 'none' }} />
      <div className="inv-glow" aria-hidden style={{ position: 'absolute', top: '-12%', left: '50%', transform: 'translateX(-50%)', width: 520, height: 520, background: `radial-gradient(circle, ${BLUE} 0%, transparent 62%)`, opacity: 0.55, filter: 'blur(70px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460, textAlign: 'center' }}>
        {/* logo */}
        <div className="inv-fade" style={{ animationDelay: '0.02s', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <LogoWhite height={43} />
        </div>

        {/* eyebrow */}
        <div className="inv-fade" style={{ animationDelay: '0.08s', display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 12, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 18, padding: '7px 16px', border: '0.5px solid rgba(0,181,255,0.28)', borderRadius: 100, background: 'rgba(0,181,255,0.07)' }}>
          <span style={{ width: 6, height: 6, background: BLUE, borderRadius: '50%', boxShadow: `0 0 8px ${BLUE}` }} />
          You&rsquo;re invited
        </div>

        {/* headline */}
        <h1 className="inv-fade" style={{ animationDelay: '0.14s', fontSize: 'clamp(32px, 8.5vw, 46px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.045em', marginBottom: 16 }}>
          Know what<br />you{' '}
          <span style={{ position: 'relative', display: 'inline-block', fontWeight: 300, backgroundImage: `linear-gradient(100deg, ${BLUE}, ${BLUE_SOFT})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            sing.
            <svg aria-hidden viewBox="0 0 120 12" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: '-0.12em', width: '100%', height: '0.3em' }}>
              <path d="M2 8 Q 40 2, 78 6 T 118 5" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
            </svg>
          </span>
        </h1>

        {/* subcopy */}
        <p className="inv-fade" style={{ animationDelay: '0.2s', fontSize: 14.5, fontWeight: 400, color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, marginBottom: 22, maxWidth: 400, marginInline: 'auto' }}>
          Theological reviews of worship songs. Five lenses, honest scores, and pastoral framing, built for worship leaders and songwriters.
        </p>

        {/* primary CTA */}
        <div className="inv-fade" style={{ animationDelay: '0.32s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 30 }}>
          <Link className="inv-cta" href="/songs" style={{ display: 'block', width: '100%', maxWidth: 320, fontSize: 15, fontWeight: 600, color: NAVY, background: BLUE, padding: '15px 26px', borderRadius: 12, textDecoration: 'none' }}>
            Explore the songs
          </Link>
          <Link className="inv-ghost" href="/scoring-philosophy" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
            See how the scoring works &rarr;
          </Link>
        </div>

        {/* songwriter card */}
        <div className="inv-fade" style={{ animationDelay: '0.4s', textAlign: 'left', background: 'linear-gradient(180deg, rgba(0,181,255,0.08), rgba(0,181,255,0.03))', border: '0.5px solid rgba(0,181,255,0.25)', borderRadius: 16, padding: '22px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>For songwriters</div>
          <p style={{ fontSize: 17, fontWeight: 300, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, marginBottom: 18 }}>
            Written a song? Run your own lyrics through the five-lens analysis and take home a full review.
          </p>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Access code</div>
          <button onClick={copyCode} className="inv-copy" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: 15, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '13px', cursor: 'pointer', marginBottom: 10 }}>
            {GUEST_CODE}
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 500, color: copied ? '#4ade80' : 'rgba(255,255,255,0.45)' }}>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <Link href="/analyze" style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#fff', border: `0.5px solid ${BLUE}`, background: 'rgba(0,181,255,0.12)', padding: '13px', borderRadius: 10, textDecoration: 'none' }}>
            Open the analyzer &rarr;
          </Link>
        </div>

        {/* footer */}
        <div className="inv-fade" style={{ animationDelay: '0.48s', marginTop: 30, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          worshiplens.com
        </div>
      </div>
    </div>
  )
}
