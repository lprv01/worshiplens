'use client'

import { useState } from 'react'

const lenses = [
  { id: 'sf', num: '01', name: 'Scriptural fidelity', tag: 'Biblical accuracy & alignment', desc: 'Evaluates whether lyrics align with Scripture. Flags Word of Faith language, vague universalism, or elevation of personal experience over biblical truth.', meta: [{ k: 'Watchpoints', v: 'Word of Faith, universalism' }, { k: 'Score range', v: '0-10' }] },
  { id: 'tc', num: '02', name: 'Theological clarity', tag: 'The Radio Test', desc: 'Applies the Radio Test — could a secular station play this without knowing it is worship? Strong songs are unmistakably Christ-centred.', meta: [{ k: 'Watchpoints', v: 'Vague spirituality' }, { k: 'Score range', v: '0-10' }] },
  { id: 'sg', num: '03', name: 'Singability', tag: 'Range, key, congregational fit', desc: 'Ideal congregational range is A3-D5. Notes original key, recommends a congregation-friendly key, and evaluates melody accessibility for untrained singers.', meta: [{ k: 'Ideal range', v: 'A3-D5' }, { k: 'Score range', v: '0-10' }] },
  { id: 'pq', num: '04', name: 'Poetic quality', tag: 'Imagery, grammar, lyric depth', desc: 'Evaluates grammar, repetition ratio, cliche density, and imagery quality. Songs that carry weight in their words, not just their melody, score highest.', meta: [{ k: 'Watchpoints', v: 'Cliches, filler repetition' }, { k: 'Score range', v: '0-10' }] },
  { id: 'db', num: '05', name: 'Defense brief', tag: 'Objections & Scripture responses', desc: '2-3 likely congregant objections with Scripture-based responses, an honest concession, and suggested framing. Equips leaders to defend song choices pastorally.', meta: [{ k: 'Includes', v: 'Objections, concession, framing' }, { k: 'Score range', v: '0-10' }] },
]

const cardLenses = [
  { label: 'Scriptural fidelity', score: '9.0', pct: '90%', color: 'green' },
  { label: 'Theological clarity', score: '8.5', pct: '85%', color: 'green' },
  { label: 'Singability', score: '7.0', pct: '70%', color: 'amber' },
  { label: 'Poetic quality', score: '8.0', pct: '80%', color: 'green' },
  { label: 'Defense brief', score: '9.0', pct: '90%', color: 'green' },
]

export default function HomePage() {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [hoveredFw, setHoveredFw] = useState<string | null>(null)
  const [activeFw, setActiveFw] = useState<string | null>(null)

  function toggleSection(id: string) {
    setOpenSection(prev => prev === id ? null : id)
  }

  function handleFwEnter(id: string) {
    setHoveredFw(id)
    setActiveFw(id)
  }

  function handleFwLeave() {
    setHoveredFw(null)
    setTimeout(() => { setActiveFw(null) }, 400)
  }

  function toggleFw(id: string) {
    setActiveFw(prev => prev === id ? null : id)
  }

  const openFw = hoveredFw ?? activeFw

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#ffffff', color: '#1a1a1a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fw-trigger:hover { background: #f7f6f3; }
        .acc-trigger:hover { background: #f7f6f3; }
        @media (max-width: 680px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .card-wrap { justify-content: flex-start !important; }
          .hero-card { width: 100% !important; }
          .headline { font-size: 36px !important; }
          .fw-tag { display: none; }
          .fw-detail { flex-direction: column !important; }
        }
      `}</style>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="rgba(0,0,0,0.3)" strokeWidth="0.75"/>
            <path d="M8 18 C8 12 11 9 14 9 C17 9 20 12 20 18" stroke="#1a1a1a" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <path d="M10 18 C10 13.5 12 11 14 11 C16 11 18 13.5 18 18" stroke="#555550" strokeWidth="0.75" fill="none" strokeLinecap="round"/>
            <circle cx="14" cy="18" r="1.5" fill="#1a1a1a"/>
          </svg>
          <span style={{ fontFamily: "'Lora', serif", fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>WorshipLens</span>
        </div>
        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          <a href="/songs" style={{ fontSize: 13, color: '#555550', textDecoration: 'none' }}>Browse songs</a>
          <a href="/about" style={{ fontSize: 13, color: '#555550', textDecoration: 'none' }}>About</a>
          <a href="/signin" style={{ fontSize: 12, fontWeight: 500, border: '0.5px solid rgba(0,0,0,0.30)', padding: '6px 14px', borderRadius: 8, textDecoration: 'none', color: '#1a1a1a' }}>Sign in</a>
        </div>
      </nav>

      <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '4.5rem 2.5rem 4rem', maxWidth: 960, margin: '0 auto', alignItems: 'center', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '1.5rem' }}>
            <div style={{ width: 22, height: 1, background: 'rgba(0,0,0,0.20)', marginTop: 7, flexShrink: 0 }} />
            <span style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', fontWeight: 400, lineHeight: 1.6 }}>
              Biblical analysis for the<br />songs of the Church
            </span>
          </div>
          <h1 className="headline" style={{ fontFamily: "'Lora', serif", fontSize: 46, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Know what<br />you <em>sing.</em>
          </h1>
          <p style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.6, maxWidth: 340, marginBottom: '2.25rem' }}>
            Equipping the Church with Biblical clarity for the songs we sing. Because what we sing shapes what we believe.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="/songs" style={{ fontSize: 13, fontWeight: 500, color: '#fff', background: '#1a1a1a', padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>Browse the library</a>
            <a href="/about" style={{ fontSize: 13, color: '#555550', textDecoration: 'none' }}>How it works</a>
          </div>
        </div>
        <div className="card-wrap" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className="hero-card" style={{ background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, padding: '1.25rem', width: 280 }}>
            <p style={{ fontFamily: "'Lora', serif", fontSize: 15, fontWeight: 500, marginBottom: 2 }}>Holy Forever</p>
            <p style={{ fontSize: 12, color: '#999990', marginBottom: '1rem' }}>Chris Tomlin · CCLI #7202827</p>
            {cardLenses.map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#555550', width: 110, flexShrink: 0 }}>{l.label}</span>
                <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.10)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, width: l.pct, background: l.color === 'green' ? '#639922' : '#BA7517' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, width: 22, textAlign: 'right' as const, color: l.color === 'green' ? '#3B6D11' : '#854F0B' }}>{l.score}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'rgba(0,0,0,0.10)', margin: '0.875rem 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 11, color: '#999990', marginBottom: 2 }}>Overall</p>
                <span style={{ fontSize: 10, fontWeight: 500, background: '#EAF3DE', color: '#3B6D11', padding: '3px 8px', borderRadius: 8 }}>Recommended</span>
              </div>
              <span style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 500, color: '#3B6D11' }}>8.3</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 2.5rem', borderTop: '0.5px solid rgba(0,0,0,0.10)', background: '#f7f6f3' }}>
        <span style={{ fontSize: 13, color: '#999990' }}>⌕</span>
        <input placeholder="Search by song, artist, or theme..." style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none', color: '#1a1a1a' }} />
        {['Praise & Worship', 'Advent', 'Communion'].map(tag => (
          <span key={tag} style={{ fontSize: 11, color: '#999990', background: '#fff', border: '0.5px solid rgba(0,0,0,0.10)', padding: '3px 8px', borderRadius: 8 }}>{tag}</span>
        ))}
      </div>

      <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.10)', padding: '4rem 2.5rem', textAlign: 'center' as const }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <p style={{ fontSize: 19, fontWeight: 300, lineHeight: 1.65, letterSpacing: '-0.01em' }}>
            If you want to know what a church believes, listen to what it sings. What the Church sings today will shape what the Church believes tomorrow.
          </p>
          <div style={{ width: 28, height: 1, background: 'rgba(0,0,0,0.20)', margin: '1.75rem auto 0' }} />
        </div>
      </div>

      <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.10)' }}>
        {[
          { id: 'does', title: 'What WorshipLens Does', subtitle: 'Learn how WorshipLens evaluates songs', body: ['WorshipLens evaluates the theology and lyrical quality of worship songs through a biblical lens. Each song is reviewed for scriptural fidelity, theological clarity, singability, and poetic strength, with a written defense explaining the evaluation. The goal is simple: to help worship leaders and churches choose songs that faithfully reflect the truth of Scripture.'] },
          { id: 'exists', title: 'Why WorshipLens Exists', subtitle: 'Read the introduction', body: ['Worship leaders have long wrestled with the tension created by the ever-changing styles and expectations of worship within the church. Over time, however, many have come to recognize that when our focus shifts away from style and back toward truth, worship begins to take its rightful place.', 'Too often congregations find themselves divided by preferences and stylistic debates. When worship becomes framed primarily through the lens of style, those preferences can quietly distract us from the deeper purpose of worship itself. Questions about musical style are nothing new to the church, and repetition itself is deeply biblical.', 'For those concerned about theological error in modern worship music, it is worth remembering that every worship song has been written by imperfect people. Yet Scripture calls us to sing a new song to the Lord. Many of the songs we sing carry the testimony of redeemed lives.', 'And at the center of it all is a simple reminder: worship is not ultimately about us. It is about Him. Sing to the audience of One.'] },
        ].map(({ id, title, subtitle, body }) => (
          <div key={id} style={{ borderBottom: '0.5px solid rgba(0,0,0,0.10)' }}>
            <button className="acc-trigger" onClick={() => toggleSection(id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.375rem 2.5rem', cursor: 'pointer', width: '100%', background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.15s' }}>
              <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{title}</span>
                <span style={{ fontSize: 12, color: '#999990', fontWeight: 300 }}>{subtitle}</span>
              </div>
              <svg style={{ width: 16, height: 16, color: '#999990', transition: 'transform 0.25s', transform: openSection === id ? 'rotate(180deg)' : 'rotate(0deg)' }} viewBox="0 0 16 16" fill="none">
                <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div style={{ maxHeight: openSection === id ? 600 : 0, overflow: 'hidden', opacity: openSection === id ? 1 : 0, transition: 'max-height 0.4s ease, opacity 0.3s ease' }}>
              <div style={{ padding: '0.25rem 2.5rem 2rem', maxWidth: 600, margin: '0 auto' }}>
                {body.map((p, i) => <p key={i} style={{ fontSize: 14, color: '#555550', lineHeight: 1.75, fontWeight: 300, textAlign: 'center' as const, marginBottom: i < body.length - 1 ? '1rem' : 0 }}>{p}</p>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.10)', padding: '2.5rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto 1.25rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990' }}>The evaluation framework</span>
          <span style={{ fontSize: 12, color: '#999990', fontWeight: 300 }}>Select a lens to learn more</span>
        </div>
        <div style={{ maxWidth: 960, margin: '0 auto', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, overflow: 'hidden' }}>
          {lenses.map((lens, i) => (
            <div key={lens.id} style={{ background: '#fff', borderBottom: i < lenses.length - 1 ? '0.5px solid rgba(0,0,0,0.10)' : 'none' }}>
              <button className="fw-trigger" onMouseEnter={() => handleFwEnter(lens.id)} onMouseLeave={handleFwLeave} onClick={() => toggleFw(lens.id)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', width: '100%', background: 'none', border: 'none', textAlign: 'left' as const, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'background 0.15s' }}>
                <span style={{ fontSize: 11, color: '#999990', width: 18, flexShrink: 0 }}>{lens.num}</span>
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{lens.name}</span>
                <span className="fw-tag" style={{ fontSize: 11, color: '#999990', fontWeight: 300 }}>{lens.tag}</span>
                <svg style={{ width: 14, height: 14, color: '#999990', transition: 'transform 0.2s', transform: openFw === lens.id ? 'rotate(180deg)' : 'rotate(0deg)' }} viewBox="0 0 16 16" fill="none">
                  <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div style={{ maxHeight: openFw === lens.id ? 200 : 0, overflow: 'hidden', opacity: openFw === lens.id ? 1 : 0, transition: 'max-height 0.35s ease, opacity 0.25s ease' }}>
                <div className="fw-detail" style={{ padding: '0 1.25rem 1rem 2.75rem', display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                  <p style={{ fontSize: 13, color: '#555550', lineHeight: 1.7, fontWeight: 300, maxWidth: 480 }}>{lens.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5, flexShrink: 0 }}>
                    {lens.meta.map(m => (
                      <div key={m.k} style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 11, color: '#999990', width: 72, flexShrink: 0 }}>{m.k}</span>
                        <span style={{ fontSize: 11, color: '#555550' }}>{m.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
