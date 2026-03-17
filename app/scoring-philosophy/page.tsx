'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAVY = '#0D1B2A'
const BLUE = '#00b5ff'

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

const lenses = [
  {
    num: '01',
    name: 'Scriptural fidelity',
    desc: 'Biblical accuracy and alignment. Flags Word of Faith language, vague universalism, or elevation of personal experience over Scripture. Checks whether lyric fragments are rooted in specific texts or theologically unmoored.',
  },
  {
    num: '02',
    name: 'Theological clarity',
    desc: 'The Radio Test. Could a secular station play this without knowing it is worship? Evaluates whether the object of worship is unmistakably the God of Scripture and whether the theological arc holds across the whole song.',
  },
  {
    num: '03',
    name: 'Congregational singability',
    desc: 'Practical accessibility for untrained voices. Ideal range A3-D5. Notes original key and recommends transposition where needed. Evaluates melody learnability and whether the song rewards congregational participation.',
  },
  {
    num: '04',
    name: 'Poetic and lyrical quality',
    desc: 'Grammar, repetition ratio, cliche density, imagery quality, and congregational voice distribution (individual vs. corporate). Songs that carry theological weight in their words, not just their melody, score highest.',
  },
  {
    num: '05',
    name: 'Defense brief',
    desc: 'How defensible is this song in a real congregation? Addresses 2-3 likely objections with Scripture-based responses, honest concessions, and suggested framing. A high score means a worship leader can stand behind this song with confidence.',
  },
]

const objectionTypes = [
  {
    type: 'Style and tolerance',
    color: BLUE,
    bgColor: 'rgba(0,181,255,0.08)',
    quote: '"The repetition is more than I can assimilate into my worship experience. It taxes my heart."',
    explanation: 'A valid personal experience, not a theological objection. Repetition has deep biblical precedent (Psalm 136 repeats its refrain 26 times; Revelation 4:8 describes heaven singing the same phrase day and night). WorshipLens does not score lower because some people find repetition difficult. The defense brief acknowledges the experience and places responsibility with the worship leader to contextualize for their congregation.',
  },
  {
    type: 'Linguistic register',
    color: '#C47B0E',
    bgColor: 'rgba(196,123,14,0.08)',
    quote: '"As a linguist, this phrasing bothers me. We would never actually say it this way in conversation."',
    explanation: 'An academically trained person applying conversational language standards to liturgical text. Worship language has always operated at a higher register than everyday speech. Person-shifting (third to second person, addressing both God and the congregation in the same breath) is a recognized Psalmic convention found in Psalm 22, 42, and 103. The observation is technically defensible in isolation. The theological conclusion drawn from it usually is not.',
  },
  {
    type: 'Embedded implication',
    color: '#8B3010',
    bgColor: 'rgba(139,48,16,0.08)',
    quote: '"This phrasing implies there is a schedule God is required to meet. That seems theologically off."',
    explanation: 'The objection WorshipLens takes most seriously. A linguistic observation sometimes surfaces a real theological tension underneath. These are examined carefully under Theological Clarity and Scriptural Fidelity. If a phrase genuinely misrepresents the character of God it is noted and scored accordingly. If it is a familiar idiom that functions within its intended meaning, it is acknowledged proportionally and never elevated beyond what it actually is.',
  },
]

export default function ScoringPhilosophyPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [openObj, setOpenObj] = useState<number | null>(null)

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
        .obj-detail {
          max-height: 0; overflow: hidden; opacity: 0;
          transition: max-height 0.35s ease, opacity 0.25s ease;
        }
        .obj-detail.open { max-height: 400px; opacity: 1; }
        @media (max-width: 680px) {
          .desktop-nav-links { display: none !important; }
          .hamburger-btn { display: flex !important; }
          .score-bands-grid { grid-template-columns: 1fr !important; }
          .lenses-grid { grid-template-columns: 1fr !important; }
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
            <Link href="/about" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>About</Link>
            <Link href="/scoring-philosophy" style={{ fontSize: 13, fontWeight: 500, color: '#ffffff', textDecoration: 'none' }}>Scoring Philosophy</Link>
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
            How WorshipLens scores songs
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 16 }}>
            Scoring <span style={{ color: BLUE, fontWeight: 300 }}>Philosophy</span>
          </h1>
          <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 560 }}>
            Every deduction is traceable. Every score means something specific. Here is exactly how WorshipLens evaluates worship songs and why.
          </p>
        </div>
      </section>

      {/* NO PERFECT SONG */}
      <section style={{ padding: '52px 24px', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
            Core conviction
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.03em', marginBottom: 16 }}>No song is a perfect song</h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 16 }}>
            A 10/10 across all five lenses would require a song that is simultaneously beyond theological critique, universally singable, poetically flawless, and in need of zero pastoral defense. That song does not exist. And probably should not.
          </p>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 16 }}>
            A 10 in any individual lens is possible and means beyond reasonable critique in that dimension. An overall 10/10 is unreachable by design because the musical and poetic lenses carry inherent subjectivity. No melody suits every voice. No congregation is universal.
          </p>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 24 }}>
            This is a feature of the framework, not a limitation. A 9.4 from WorshipLens carries more weight than a perfect score from a narrower rubric because it survived more scrutiny. Every deduction is named. Vague reductions are not permitted.
          </p>
          <div style={{ borderLeft: `3px solid ${BLUE}`, paddingLeft: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#0D1B2A', lineHeight: 1.6, letterSpacing: '-0.01em' }}>
              Every worship song was written by an imperfect human being. The question is never whether a song has limitations. The question is whether those limitations disqualify it from doing what congregational worship songs are meant to do: direct the hearts of God's people toward Him.
            </p>
          </div>
        </div>
      </section>

      {/* SCORE BANDS */}
      <section style={{ padding: '52px 24px', background: '#F7F9FC', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
            Score bands
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.03em', marginBottom: 20 }}>What the numbers mean</h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 24 }}>
            Scores are not grades. A 7.2 is not a C. It means the song has genuine value and genuine limitations, both of which are named in the review.
          </p>
          <div className="score-bands-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { range: '8.0 to 10.0', label: 'Recommended', color: '#2A6010', bg: '#DCEFCF', bar: '#4A8B2A', desc: 'Strong across all lenses. Use with confidence. Any deductions are minor and named.' },
              { range: '6.5 to 7.9', label: 'Recommended with notes', color: '#7A5010', bg: '#FEF0CC', bar: '#C47B0E', desc: 'Good theological foundation. Specific areas need pastoral attention before use.' },
              { range: '5.0 to 6.4', label: 'Use with caution', color: '#8B3010', bg: '#FDE0CC', bar: '#C45020', desc: 'Real concerns are present. The defense brief is essential reading before leading this song.' },
              { range: 'Below 5.0', label: 'Not recommended', color: '#8B1010', bg: '#FDDADA', bar: '#C42020', desc: 'Theological or lyrical issues outweigh the song\'s congregational value.' },
            ].map(band => (
              <div key={band.range} style={{ background: '#ffffff', border: '0.5px solid #E2E8F0', borderRadius: 10, padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: band.bar, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: band.color }}>{band.range}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0D1B2A', marginBottom: 6 }}>{band.label}</div>
                <div style={{ fontSize: 12, fontWeight: 300, color: '#7A8A9A', lineHeight: 1.6 }}>{band.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIVE LENSES */}
      <section style={{ padding: '52px 24px', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
            The five lenses
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.03em', marginBottom: 20 }}>What each lens measures</h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 24 }}>
            All five lenses are weighted equally. A song that scores brilliantly on theology but is unsingable by a real congregation is not fully serving its purpose.
          </p>
          <div className="lenses-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {lenses.map(lens => (
              <div key={lens.num} style={{ background: '#F7F9FC', border: '0.5px solid #E2E8F0', borderRadius: 10, padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#9AA4AF', fontWeight: 400 }}>{lens.num}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0D1B2A' }}>{lens.name}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 300, color: '#4A5568', lineHeight: 1.7 }}>{lens.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE OBJECTION TYPES */}
      <section style={{ padding: '52px 24px', background: '#F7F9FC', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
            The defense brief
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.03em', marginBottom: 16 }}>Three types of congregant objections</h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 24 }}>
            Most objections that surface in a real congregation fall into one of three categories. Recognizing which type you are facing changes how you respond.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
            {objectionTypes.map((obj, i) => (
              <div key={i} style={{ background: '#ffffff', border: '0.5px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenObj(prev => prev === i ? null : i)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', width: '100%', background: 'none', border: 'none', textAlign: 'left' as const, fontFamily: "'Sora', sans-serif", cursor: 'pointer' }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: obj.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0D1B2A', flex: 1 }}>{obj.type}</span>
                  <svg style={{ width: 14, height: 14, color: '#9AA4AF', transition: 'transform 0.2s', transform: openObj === i ? 'rotate(180deg)' : 'none', flexShrink: 0 }} viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={`obj-detail${openObj === i ? ' open' : ''}`}>
                  <div style={{ padding: '0 20px 20px' }}>
                    <div style={{ background: obj.bgColor, borderLeft: `3px solid ${obj.color}`, padding: '10px 14px', borderRadius: '0 6px 6px 0', marginBottom: 14 }}>
                      <p style={{ fontSize: 13, fontWeight: 400, color: '#0D1B2A', lineHeight: 1.6, fontStyle: 'italic' }}>{obj.quote}</p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 300, color: '#4A5568', lineHeight: 1.75 }}>{obj.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GRAMMAR PRINCIPLE */}
      <section style={{ padding: '52px 24px', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
            Editorial principle
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.03em', marginBottom: 16 }}>Grammar in context</h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 16 }}>
            Grammatical observations are noted where they exist, but their severity is always evaluated in the context of how the song actually functions in congregational worship, not how it would read under forensic linguistic analysis.
          </p>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 24 }}>
            Person-shifting within a song, such as addressing the soul, then God, then the congregation within the same verse, is not a lyrical flaw. It is a Psalmic convention with three thousand years of liturgical precedent. Psalm 103, Psalm 22, and Psalm 42 all do exactly this. A minor pronoun ambiguity that has never once misdirected worship in practice is a minor pronoun ambiguity and nothing more.
          </p>
          <div style={{ background: '#0D1B2A', borderRadius: 10, padding: '20px 24px' }}>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#ffffff', lineHeight: 1.6, letterSpacing: '-0.01em' }}>
              The goal is equipping worship leaders, not winning a grammar argument.
            </p>
          </div>
        </div>
      </section>

      {/* LYRIC QUOTATION */}
      <section style={{ padding: '52px 24px', background: '#F7F9FC', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
            Lyric quotation
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.03em', marginBottom: 16 }}>How fragments are used in reviews</h2>
          <p style={{ fontSize: 15, fontWeight: 300, color: '#4A5568', lineHeight: 1.75, marginBottom: 24 }}>
            WorshipLens never reproduces full lyrics. Fragments are evidence, not decoration. Each appears only to support a specific theological observation.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
            {[
              { num: '01', title: 'Scripture-origin fragments', desc: 'Quoted freely with immediate biblical citation. These fragments belong to Scripture, not the songwriter. The analysis is pointing through the lyric back to its source.' },
              { num: '02', title: 'Paraphrase fragments', desc: 'The songwriter\'s rendering of a biblical concept. Quoted to show the parallel and evaluate the fidelity of the paraphrase. This is the core of WorshipLens analysis and sits squarely within theological commentary.' },
              { num: '03', title: 'Original lyrical phrases', desc: 'The songwriter\'s own creative expression. Used sparingly and only when the phrase itself is the specific point under examination.' },
            ].map(tier => (
              <div key={tier.num} style={{ background: '#ffffff', border: '0.5px solid #E2E8F0', borderRadius: 10, padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: '#9AA4AF' }}>{tier.num}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0D1B2A' }}>{tier.title}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 300, color: '#4A5568', lineHeight: 1.7 }}>{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WORSHIPLENS IS NOT */}
      <section style={{ padding: '52px 24px', borderBottom: '0.5px solid #E8EDF2' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 20 }}>
            <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
            Scope and perspective
          </div>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.03em', marginBottom: 16 }}>What WorshipLens is not</h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            {[
              'WorshipLens does not tell worship leaders what to sing. It equips them to make informed decisions. A song scoring 6.8 may be exactly right for a specific congregation in a specific season.',
              'WorshipLens does not evaluate musical performance, production quality, or stylistic preference. A song is not penalized for being contemporary, for having a simple chord structure, or for being associated with a particular worship movement.',
              'Reviews reflect a BGCT and Texas Baptists theological perspective. A song scoring lower here may score differently through another tradition\'s lens, and that is appropriate. The perspective is stated, not hidden.',
              'WorshipLens does not condemn songwriters. The analysis never includes the songwriter\'s name in any evaluative context. Songs are examined for what they communicate to a congregation, not for the character or intent of the person who wrote them.',
            ].map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: '#F7F9FC', border: '0.5px solid #E2E8F0', borderRadius: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: BLUE, flexShrink: 0, marginTop: 6 }} />
                <p style={{ fontSize: 14, fontWeight: 300, color: '#4A5568', lineHeight: 1.75 }}>{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '52px 24px', background: NAVY }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: 14 }}>
            See the framework <span style={{ color: BLUE, fontWeight: 300 }}>in action</span>
          </h2>
          <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 28px' }}>
            Browse the song library and see every lens score, deduction, and defense brief applied to real congregational worship songs.
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
