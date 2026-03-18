export const dynamic = "force-dynamic"

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

function scoreColor(score: number) {
  if (score >= 8.0) return { bar: '#4A8B2A', text: '#2A6010', bg: '#DCEFCF', border: '#97C459', recBg: '#DCEFCF' }
  if (score >= 6.5) return { bar: '#C47B0E', text: '#7A5010', bg: '#FEF0CC', border: '#EF9F27', recBg: '#FEF0CC' }
  if (score >= 5.0) return { bar: '#C45020', text: '#8B3010', bg: '#FDE0CC', border: '#F0997B', recBg: '#FDE0CC' }
  return { bar: '#C42020', text: '#8B1010', bg: '#FDDADA', border: '#F09595', recBg: '#FDDADA' }
}

function scoreLabel(score: number) {
  if (score >= 8.0) return 'Use freely'
  if (score >= 6.5) return 'Use with care'
  if (score >= 5.0) return 'Note concerns'
  return 'Avoid'
}

export default async function SongDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let { data: song } = await supabase.from("songs").select("*").eq("slug", id).single()
  if (!song) {
    const { data: byId } = await supabase.from("songs").select("*").eq("id", id).single()
    song = byId
  }
  if (!song) return notFound()

  const overall = song.overall_score ?? 0
  const oc = scoreColor(overall)

  const lenses = song.lenses ?? {}
  const sf = lenses.scriptural_fidelity ?? {}
  const tc = lenses.theological_clarity ?? {}
  const cs = lenses.congregational_singability ?? {}
  const pq = lenses.poetic_lyrical_quality ?? {}
  const db = lenses.defense_brief ?? {}

  const lensOrder = [
    { key: 'scriptural_fidelity', label: 'Scriptural fidelity', data: sf },
    { key: 'theological_clarity', label: 'Theological clarity', data: tc },
    { key: 'congregational_singability', label: 'Congregational singability', data: cs },
    { key: 'poetic_lyrical_quality', label: 'Poetic and lyrical quality', data: pq },
    { key: 'defense_brief', label: 'Defense brief', data: db },
  ]

  const scriptureMap = song.scripture_map ?? {}
  const story = song.story_behind_song ?? {}
  const technical = song.technical ?? {}
  const hymn = song.hymn_lineage
  const similar = song.similar_songs ?? {}
  const analysis = song.full_analysis?.paragraphs ?? []
  const voice = song.voice_analysis ?? {}
  const audienceFit = technical.audience_fit ?? {}
  const themes = song.themes ?? technical.themes ?? []
  const sermonFit = technical.sermon_series_fit ?? []
  const objections = db.objections ?? []

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: '#ffffff', color: '#0D1B2A', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        details > summary { list-style: none; cursor: pointer; user-select: none; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] .chev { transform: rotate(180deg); }
        .chev { display: inline-block; transition: transform 0.2s; color: #9AA4AF; }
        .song-row-btn:hover { background: #F7FAFD; }
        @media (max-width: 680px) {
          .song-hero { flex-direction: column !important; align-items: flex-start !important; }
          .two-col { grid-template-columns: 1fr !important; }
          .detail-pad { padding: 1.5rem 16px !important; }
          .hero-pad { padding: 28px 16px 24px !important; }
          .nav-pad { padding: 0 16px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ background: NAVY, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="nav-pad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LogoWhite height={22} />
          </Link>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <Link href="/songs" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>
              ← Song Library
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: NAVY, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div className="hero-pad" style={{ padding: '36px 24px 32px', maxWidth: 1100, margin: '0 auto' }}>
          <div className="song-hero" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: BLUE, marginBottom: 12 }}>
                <span style={{ width: 5, height: 5, background: BLUE, borderRadius: '50%', display: 'inline-block' }} />
                Song review
              </div>
              <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 600, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 8 }}>{song.title}</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontWeight: 300 }}>{song.artist}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                {song.ccli_number && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 20 }}>CCLI #{song.ccli_number}</span>}
                {song.key_original && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 20 }}>Key of {song.key_original}</span>}
                {song.tempo_bpm && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 20 }}>{song.tempo_bpm} BPM</span>}
                {song.time_signature && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 20 }}>{song.time_signature}</span>}
                {song.hymn_lineage_badge && <span style={{ fontSize: 11, color: '#2A6010', background: '#DCEFCF', border: '0.5px solid #97C459', padding: '3px 10px', borderRadius: 20 }}>Hymn lineage: {song.hymn_lineage_badge}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'center' as const, flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, borderRadius: 14, background: oc.bg, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', marginBottom: 8, border: `0.5px solid ${oc.border}` }}>
                <span style={{ fontSize: 28, fontWeight: 600, color: oc.text, lineHeight: 1, letterSpacing: '-0.03em' }}>{overall.toFixed(1)}</span>
                <span style={{ fontSize: 10, color: oc.text, opacity: 0.6, marginTop: 2 }}>/10</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: oc.text, background: oc.recBg, padding: '4px 12px', borderRadius: 20 }}>{scoreLabel(overall)}</span>
              {song.overall_verdict && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 8, maxWidth: 180, lineHeight: 1.5 }}>{song.overall_verdict}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-pad" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* FIVE LENSES */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#9AA4AF', marginBottom: 12 }}>Five lenses</p>
          <div style={{ border: '0.5px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            {lensOrder.map(({ label, data }, i) => {
              const score = data?.score ?? 0
              const c = scoreColor(score)
              const deduction = data?.deduction_line ?? ''
              const summary = data?.summary ?? ''
              const watchpoints = data?.watchpoints ?? []
              const modifications = data?.lyric_modifications ?? []
              const grammarNotes = data?.grammar_notes ?? []

              return (
                <details key={label} style={{ background: '#fff', borderBottom: i < lensOrder.length - 1 ? '0.5px solid #F0F4F8' : 'none' }}>
                  <summary style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: '#9AA4AF', width: 20, flexShrink: 0 }}>0{i + 1}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, flex: 1, color: '#0D1B2A' }}>{label}</span>
                    <div style={{ width: 80, height: 3, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: '100%', borderRadius: 2, width: `${(score / 10) * 100}%`, background: c.bar }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: c.text, width: 32, textAlign: 'right' as const, flexShrink: 0, letterSpacing: '-0.02em' }}>{score.toFixed(1)}</span>
                    <svg className="chev" style={{ width: 14, height: 14, transition: 'transform 0.2s', flexShrink: 0 }} viewBox="0 0 16 16" fill="none">
                      <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <div style={{ padding: '0 20px 16px', borderTop: '0.5px solid #F0F4F8' }}>
                    {deduction && (
                      <div style={{ marginTop: 12, padding: '8px 12px', background: '#F7F9FC', borderLeft: `2px solid ${c.bar}`, fontSize: 12, color: '#4A5568', lineHeight: 1.6 }}>
                        {deduction}
                      </div>
                    )}
                    {summary && <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, fontWeight: 300, marginTop: 12 }}>{summary}</p>}
                    {watchpoints.length > 0 && watchpoints.map((wp: any, wi: number) => (
                      <div key={wi} style={{ marginTop: 10, padding: '8px 12px', borderLeft: `2px solid ${wp.type === 'positive' ? '#4A8B2A' : '#C47B0E'}`, background: wp.type === 'positive' ? '#DCEFCF' : '#FEF0CC', fontSize: 12, color: wp.type === 'positive' ? '#2A6010' : '#7A5010', lineHeight: 1.6, borderRadius: '0 6px 6px 0' }}>
                        <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 3 }}>{wp.label}</div>
                        {wp.note}
                      </div>
                    ))}
                    {label === 'Poetic and lyrical quality' && voice.individual_pct !== undefined && (
                      <div style={{ marginTop: 12, padding: '12px 14px', background: '#F7F9FC', borderRadius: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#4A5568', marginBottom: 10 }}>Congregational voice distribution</div>
                        {[
                          { label: 'Individual', pct: voice.individual_pct, color: BLUE },
                          { label: 'Corporate', pct: voice.corporate_pct, color: '#4A8B2A' },
                        ].map(v => (
                          <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span style={{ fontSize: 11, color: '#7A8A9A', width: 70 }}>{v.label}</span>
                            <div style={{ flex: 1, height: 3, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${v.pct}%`, height: '100%', background: v.color, borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: v.color, width: 36, textAlign: 'right' as const }}>{v.pct}%</span>
                          </div>
                        ))}
                        {voice.note && <p style={{ fontSize: 11, color: '#7A8A9A', marginTop: 6 }}>{voice.note}</p>}
                      </div>
                    )}
                    {grammarNotes.map((gn: any, gi: number) => (
                      <div key={gi} style={{ marginTop: 10, padding: '10px 12px', border: '0.5px solid #E2E8F0', borderRadius: 8, fontSize: 12, color: '#4A5568', lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 500, marginBottom: 4, color: '#0D1B2A' }}>Grammar note: {gn.issue} ({gn.severity})</div>
                        {gn.explanation}
                        {gn.ccli_modification_suggestion && <div style={{ marginTop: 6, color: '#2A6010', fontWeight: 500 }}>CCLI option: {gn.ccli_modification_suggestion}</div>}
                      </div>
                    ))}
                    {modifications.map((mod: any, mi: number) => (
                      <div key={mi} style={{ marginTop: 10, border: '0.5px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ padding: '6px 12px', background: '#F7F9FC', fontSize: 10, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#9AA4AF' }}>Suggested modification</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#E2E8F0' }}>
                          <div style={{ padding: '8px 12px', background: '#fff' }}>
                            <div style={{ fontSize: 10, color: '#9AA4AF', marginBottom: 3 }}>Original</div>
                            <div style={{ fontSize: 13, color: '#4A5568', fontStyle: 'italic' }}>{mod.original_line}</div>
                          </div>
                          <div style={{ padding: '8px 12px', background: '#DCEFCF' }}>
                            <div style={{ fontSize: 10, color: '#2A6010', marginBottom: 3 }}>Suggested</div>
                            <div style={{ fontSize: 13, color: '#2A6010', fontWeight: 500 }}>{mod.suggested_line}</div>
                          </div>
                        </div>
                        <div style={{ padding: '8px 12px', fontSize: 12, color: '#4A5568' }}>
                          {mod.reason} {mod.ccli_permitted && <span style={{ color: '#2A6010', fontWeight: 500 }}>Permitted under your CCLI license</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )
            })}
          </div>
          <div style={{ marginTop: 10, textAlign: 'right' as const }}>
            <Link href="/scoring-philosophy" style={{ fontSize: 12, color: BLUE, textDecoration: 'none' }}>How scores are calculated →</Link>
          </div>
        </div>

        {/* FULL ANALYSIS */}
        {analysis.length > 0 && (
          <details style={{ marginBottom: '1.5rem', border: '0.5px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', cursor: 'pointer' }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF' }}>Full analysis</p>
              <svg className="chev" style={{ width: 14, height: 14, transition: 'transform 0.2s' }} viewBox="0 0 16 16" fill="none">
                <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div style={{ padding: '0 20px 20px', borderTop: '0.5px solid #F0F4F8' }}>
              {analysis.map((para: string, i: number) => (
                <p key={i} style={{ fontSize: 14, color: '#4A5568', lineHeight: 1.8, fontWeight: 300, marginTop: 14 }}>{para}</p>
              ))}
            </div>
          </details>
        )}

        {/* DEFENSE BRIEF */}
        {objections.length > 0 && (
          <details style={{ marginBottom: '1.5rem', border: '0.5px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', cursor: 'pointer' }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF' }}>Defense brief</p>
              <svg className="chev" style={{ width: 14, height: 14, transition: 'transform 0.2s' }} viewBox="0 0 16 16" fill="none">
                <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div style={{ borderTop: '0.5px solid #F0F4F8' }}>
              {objections.map((obj: any, i: number) => (
                <details key={i} style={{ borderBottom: i < objections.length - 1 ? '0.5px solid #F0F4F8' : 'none' }}>
                  <summary style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: '#F7F9FC', cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: '#0D1B2A' }}>"{obj.objection}"</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {obj.tag && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#FEF0CC', color: '#7A5010' }}>{obj.tag}</span>}
                      <svg className="chev" style={{ width: 14, height: 14, transition: 'transform 0.2s', flexShrink: 0 }} viewBox="0 0 16 16" fill="none">
                        <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </summary>
                  <div style={{ padding: '14px 20px', background: '#fff' }}>
                    {obj.who_raises_it && <p style={{ fontSize: 12, color: '#7A8A9A', marginBottom: 10 }}>Who raises this: {obj.who_raises_it}</p>}
                    {obj.scripture_response && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#9AA4AF', marginBottom: 5 }}>Scripture response</div>
                        <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, fontWeight: 300 }}>{obj.scripture_response}</p>
                      </div>
                    )}
                    {obj.suggested_framing && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#9AA4AF', marginBottom: 5 }}>Suggested framing</div>
                        <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, fontWeight: 300 }}>{obj.suggested_framing}</p>
                      </div>
                    )}
                    {obj.honest_concession && (
                      <div style={{ padding: '10px 12px', background: 'rgba(0,181,255,0.08)', borderLeft: `2px solid ${BLUE}`, fontSize: 12, color: '#0D1B2A', lineHeight: 1.6 }}>
                        <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 3, color: BLUE }}>Honest concession</div>
                        {obj.honest_concession}
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </details>
        )}

        {/* SCRIPTURE MAP */}
        {(scriptureMap.primary?.length > 0 || scriptureMap.supporting?.length > 0) && (
          <details style={{ marginBottom: '1.5rem', border: '0.5px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', cursor: 'pointer' }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF' }}>Scripture map</p>
              <svg className="chev" style={{ width: 14, height: 14, transition: 'transform 0.2s' }} viewBox="0 0 16 16" fill="none">
                <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div style={{ padding: '0 20px 20px', borderTop: '0.5px solid #F0F4F8' }}>
              {scriptureMap.primary?.length > 0 && (
                <>
                  <p style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#9AA4AF', marginTop: 14, marginBottom: 8 }}>Primary foundations</p>
                  {scriptureMap.primary.map((s: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 12px', background: '#F7F9FC', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap' as const, minWidth: 80, color: '#0D1B2A' }}>{s.reference}</span>
                      <span style={{ color: '#4A5568', lineHeight: 1.5, fontWeight: 300 }}>{s.connection}</span>
                    </div>
                  ))}
                </>
              )}
              {scriptureMap.supporting?.length > 0 && (
                <>
                  <p style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#9AA4AF', marginTop: 14, marginBottom: 8 }}>Supporting connections</p>
                  {scriptureMap.supporting.map((s: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 12px', background: '#F7F9FC', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap' as const, minWidth: 80, color: '#0D1B2A' }}>{s.reference}</span>
                      <span style={{ color: '#4A5568', lineHeight: 1.5, fontWeight: 300 }}>{s.connection}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </details>
        )}

        {/* STORY BEHIND THE SONG */}
        {story.available && story.items?.length > 0 && (
          <details style={{ marginBottom: '1.5rem', border: '0.5px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', cursor: 'pointer' }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF' }}>Story behind the song</p>
              <svg className="chev" style={{ width: 14, height: 14, transition: 'transform 0.2s' }} viewBox="0 0 16 16" fill="none">
                <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div style={{ padding: '0 20px 20px', borderTop: '0.5px solid #F0F4F8' }}>
              {story.publisher_note && (
                <div style={{ marginTop: 14, padding: '8px 12px', background: '#F7F9FC', borderRadius: 8, fontSize: 12, color: '#4A5568', borderLeft: '2px solid #E2E8F0' }}>
                  <span style={{ fontWeight: 500, color: '#0D1B2A' }}>Publisher note: </span>{story.publisher_note}
                </div>
              )}
              {story.items.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 12, paddingTop: 14, marginTop: 14, borderTop: i > 0 ? '0.5px solid #F0F4F8' : 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8D4DE', flexShrink: 0, marginTop: 7 }} />
                  <div>
                    <p style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.7, fontWeight: 300 }}>{item.text}</p>
                    {item.source && <p style={{ fontSize: 11, color: '#9AA4AF', marginTop: 4 }}>{item.source}</p>}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* HYMN LINEAGE */}
        {hymn && (
          <details style={{ marginBottom: '1.5rem', border: '0.5px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', cursor: 'pointer' }}>
              <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF' }}>Hymn lineage</p>
              <svg className="chev" style={{ width: 14, height: 14, transition: 'transform 0.2s' }} viewBox="0 0 16 16" fill="none">
                <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div style={{ padding: '14px 20px 20px', borderTop: '0.5px solid #F0F4F8', fontSize: 13, color: '#4A5568', lineHeight: 1.7, fontWeight: 300 }}>
              {typeof hymn === 'string' ? hymn : JSON.stringify(hymn)}
            </div>
          </details>
        )}

        {/* THEMES + AUDIENCE */}
        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            {themes.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF', marginBottom: 10 }}>Themes</p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {themes.map((t: string) => (
                    <span key={t} style={{ fontSize: 12, color: '#4A5568', background: '#F7F9FC', border: '0.5px solid #E2E8F0', padding: '4px 10px', borderRadius: 20 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            {sermonFit.length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF', marginBottom: 10 }}>Sermon series fit</p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {sermonFit.map((s: string) => (
                    <span key={s} style={{ fontSize: 12, color: '#4A5568', background: '#F7F9FC', border: '0.5px solid #E2E8F0', padding: '4px 10px', borderRadius: 20 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            {Object.keys(audienceFit).length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF', marginBottom: 10 }}>Audience fit</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, border: '0.5px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', background: '#E2E8F0' }}>
                  {[
                    { k: 'Maturity', v: audienceFit.spiritual_maturity },
                    { k: 'Age group', v: audienceFit.age_group },
                    { k: 'Service type', v: audienceFit.service_type },
                    { k: 'Visitor-friendly', v: audienceFit.visitor_friendliness },
                    { k: 'Special contexts', v: audienceFit.special_contexts },
                  ].filter(d => d.v).map(d => (
                    <div key={d.k} style={{ background: '#fff', padding: '10px 12px' }}>
                      <p style={{ fontSize: 10, color: '#9AA4AF', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>{d.k}</p>
                      <p style={{ fontSize: 12, color: '#0D1B2A', fontWeight: 400 }}>{d.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIMILAR SONGS */}
        {(similar.if_you_love_this?.length > 0 || similar.if_this_concerns_you?.length > 0) && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9AA4AF', marginBottom: 12 }}>Similar songs</p>
            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {similar.if_you_love_this?.length > 0 && (
                <div style={{ background: '#DCEFCF', border: '0.5px solid #97C459', borderRadius: 10, padding: '14px' }}>
                  <p style={{ fontSize: 11, color: '#2A6010', fontWeight: 500, marginBottom: 8 }}>If you love this song</p>
                  {similar.if_you_love_this.map((s: any, i: number) => (
                    <p key={i} style={{ fontSize: 13, color: '#2A6010', fontWeight: 300, lineHeight: 1.6 }}>{s.title} — {s.artist}</p>
                  ))}
                </div>
              )}
              {similar.if_this_concerns_you?.length > 0 && (
                <div style={{ background: '#FEF0CC', border: '0.5px solid #EF9F27', borderRadius: 10, padding: '14px' }}>
                  <p style={{ fontSize: 11, color: '#7A5010', fontWeight: 500, marginBottom: 8 }}>If this concerns you</p>
                  {similar.if_this_concerns_you.map((s: any, i: number) => (
                    <p key={i} style={{ fontSize: 13, color: '#7A5010', fontWeight: 300, lineHeight: 1.6 }}>{s.title} — {s.artist}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer style={{ background: NAVY, padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 16 }}>
          <LogoWhite height={18} />
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
