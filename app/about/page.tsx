'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const NAVY = '#0D1B2A'
const BLUE = '#00b5ff'

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

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false)

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
          background: ${NAVY}; border-top: 0.5px solid rgba(255,255,255,0.08);
        }
        .mobile-menu.open { max-height: 280px; }
        @media (max-width: 680px) {
          .desktop-nav-links { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @media (min-width: 681px) {
          .hamburger-btn { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ background: NAVY, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LogoWhite height={22} />
          </Link>
          <div className="desktop-nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <Link href="/songs" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Songs</Link>
            <Link href="/about" style={{ fontSize: 13, fontWeight: 500, color: '#ffffff', textDecoration: 'none' }}>About</Link>
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

      {/* HERO */}
      <section style={{ background: NAVY, padding: '52px 24px 48px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 16 }}>
            <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
            About WorshipLens
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 16 }}>
            A tool built for the<br />leaders <span style={{ color: BLUE, fontWeight: 300 }}>in the room.</span>
          </h1>
          <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 560 }}>
            WorshipLens is a theological worship song review platform built for Baptist worship leaders in the BGCT tradition.
          </p>
        </div>
      </section>

      {/* WHAT IT DOES */}
      <section style={{ padding: '52px 24px', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
            What WorshipLens does
          </div>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 16 }}>
            WorshipLens evaluates the theology and lyrical quality of worship songs through a biblical lens. Each song is reviewed for scriptural fidelity, theological clarity, singability, and poetic strength, with a written defense explaining the evaluation.
          </p>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 24 }}>
            The goal is simple: to help worship leaders and churches choose songs that faithfully reflect the truth of Scripture.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { num: '01', name: 'Scriptural fidelity', desc: 'Does it align with Scripture?' },
              { num: '02', name: 'Theological clarity', desc: 'The Radio Test' },
              { num: '03', name: 'Singability', desc: 'Range A3-D5, congregational fit' },
              { num: '04', name: 'Poetic quality', desc: 'Imagery, grammar, lyric depth' },
              { num: '05', name: 'Defense brief', desc: 'Objections and Scripture responses' },
            ].map(l => (
              <div key={l.num} style={{ background: '#F7F9FC', border: '0.5px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: '#9AA4AF', marginBottom: 4 }}>{l.num}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1B2A', marginBottom: 3 }}>{l.name}</div>
                <div style={{ fontSize: 12, fontWeight: 300, color: '#7A8A9A' }}>{l.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <Link href="/scoring-philosophy" style={{ fontSize: 13, color: BLUE, textDecoration: 'none' }}>
              Read the full scoring philosophy →
            </Link>
          </div>
        </div>
      </section>

      {/* WHY IT EXISTS */}
      <section style={{ padding: '52px 24px', background: '#F7F9FC', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
            Why WorshipLens exists
          </div>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 16 }}>
            Worship leaders have long wrestled with the tension created by the ever-changing styles and expectations of worship within the church. Over time, however, many have come to recognize that when our focus shifts away from style and back toward truth, worship begins to take its rightful place.
          </p>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 16 }}>
            Too often congregations find themselves divided by preferences and stylistic debates. When worship becomes framed primarily through the lens of style, those preferences can quietly distract us from the deeper purpose of worship itself.
          </p>
          <div style={{ borderLeft: `3px solid ${BLUE}`, paddingLeft: 20, margin: '28px 0' }}>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#0D1B2A', lineHeight: 1.6, letterSpacing: '-0.01em' }}>
              "What we sing shapes what we believe. WorshipLens exists to make that conviction actionable."
            </p>
          </div>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 16 }}>
            This tool was built from the inside, by a working music minister, for working music ministers. Every review is written with a pastoral posture: not to condemn songs or their writers, but to equip leaders with the clarity and language to make confident, defensible decisions.
          </p>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75 }}>
            And at the center of it all is a simple reminder: worship is not ultimately about us. It is about Him. Sing to the audience of One.
          </p>
        </div>
      </section>

      {/* AUTHOR */}
      <section style={{ padding: '52px 24px', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #E2E8F0', background: '#1B3050' }}>
              <Image src="/headshot.png" alt="Ludwingk Rios" width={64} height={64}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.01em', marginBottom: 2 }}>Ludwingk Rios</div>
              <div style={{ fontSize: 12, fontWeight: 400, color: '#7A8A9A', marginBottom: 14 }}>Built by a worship leader, for worship leaders</div>
              <p style={{ fontSize: 14, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, maxWidth: 540 }}>
                Ludwingk has served as Minister of Music at First Baptist Church Cedar Hill, Texas for over four years. He leads with a commitment to multi-generational worship, music that connects every age in the room to the same God. His wife Kellee teaches Bible study to pre-teens, and both of their children, Elizabeth and Ethan, came to faith in this church. This is not a project built from the outside looking in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '52px 24px', background: NAVY }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: 14 }}>
            Ready to review your <span style={{ color: BLUE, fontWeight: 300 }}>song list?</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 28px' }}>
            107 songs reviewed and ready. Search by title, filter by score, or browse the full library.
          </p>
          <Link href="/songs" style={{ display: 'inline-block', fontSize: 13, fontWeight: 500, color: NAVY, background: BLUE, padding: '12px 28px', borderRadius: 8, textDecoration: 'none' }}>
            Browse the Library
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: NAVY, padding: '32px 24px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
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
