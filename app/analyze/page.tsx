'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  NAVY, BLUE,
  LogoWhite, smartParse, scoreColor,
  LENS_CONFIG, PROGRESS_STEPS, DetailFields,
  type ParsedSong, type MetaKey, type ReviewResult, type TabKey,
} from '../lib/review-shared'

// Public-facing analyzer at /analyze. Same analysis as the admin page at
// /admin, but it never touches Supabase:
// no Library, no upload, no JSON export. Guests take their review away as a
// PDF instead. The API enforces this too - a guest password is rejected for
// the list and upload actions regardless of what this page requests.
export default function AnalyzePage() {
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  const [pasteRaw, setPasteRaw] = useState('')
  const [edits, setEdits] = useState<Partial<Record<MetaKey, string>>>({})

  const [analyzing, setAnalyzing] = useState(false)
  const [progressIdx, setProgressIdx] = useState(0)
  const [review, setReview] = useState<ReviewResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('scores')
  const [chosenTitle, setChosenTitle] = useState('')
  const [pdfBusy, setPdfBusy] = useState(false)
  const [pdfError, setPdfError] = useState('')

  const auto = useMemo(() => smartParse(pasteRaw), [pasteRaw])
  const fieldValue = (k: MetaKey) => (edits[k] !== undefined ? edits[k]! : auto[k])
  const isAutoFilled = (k: MetaKey) => edits[k] === undefined && !!auto[k]
  const setField = (k: MetaKey, v: string) => setEdits(e => ({ ...e, [k]: v }))


  // Generate helpers (title / meter) - callable before the full analysis
  const [generating, setGenerating] = useState<'title' | 'meter' | 'themes' | null>(null)
  const [titleOptions, setTitleOptions] = useState<string[]>([])
  const [meterNote, setMeterNote] = useState('')
  const [genError, setGenError] = useState('')

  async function handleGenerate(kind: 'title' | 'meter' | 'themes') {
    const d = getSongData()
    if (!d.lyrics) { setGenError('Paste the lyrics first.'); return }
    setGenerating(kind); setGenError('')
    if (kind === 'title') setTitleOptions([])
    if (kind === 'meter') setMeterNote('')
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest', kind, password: pwInput.trim(), songData: d }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((data as any)?.error || `Request failed (${r.status})`)
      const res = (data as any).result || {}
      if (kind === 'title') {
        const titles = Array.isArray(res.titles) ? res.titles.filter(Boolean) : []
        if (!titles.length) throw new Error('No titles came back. Try again.')
        setTitleOptions(titles)
      } else if (kind === 'themes') {
        const themes = Array.isArray(res.themes) ? res.themes.filter(Boolean) : []
        const scriptures = Array.isArray(res.scriptures) ? res.scriptures.filter(Boolean) : []
        if (!themes.length && !scriptures.length) throw new Error('Nothing came back. Try again.')
        setField('themes', [...themes, ...scriptures].join(', '))
      } else {
        if (res.time_signature) setField('timeSignature', res.time_signature)
        const bits = [res.meter_pattern, res.meter_name, res.poetic_foot].filter(Boolean).join(' · ')
        setMeterNote([bits, res.reasoning].filter(Boolean).join('\n'))
      }
    } catch (e: any) {
      setGenError(e.message || 'Could not generate that.')
    } finally {
      setGenerating(null)
    }
  }

  function clearGenerated(kind: 'meter' | 'themes') {
    if (kind === 'meter') {
      setField('timeSignature', '')
      setMeterNote('')
    } else {
      setField('themes', '')
    }
    setGenError('')
  }

  function getSongData(): ParsedSong {
    return {
      title: fieldValue('title').trim(),
      artist: fieldValue('artist').trim(),
      ccli: fieldValue('ccli').trim(),
      key: fieldValue('key').trim(),
      album: fieldValue('album').trim(),
      timeSignature: fieldValue('timeSignature').trim(),
      themes: fieldValue('themes').trim(),
      email: fieldValue('email').trim(),
      lyrics: auto.lyrics,
    }
  }
  const canAnalyze = () => !!getSongData().lyrics

  const displayTitle =
    chosenTitle || review?.meta?.title || review?._formData?.title || 'Untitled song'

  async function handleUnlock() {
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', password: pwInput.trim() }),
      })
      if (r.ok) { setUnlocked(true); setPwError(false) } else { setPwError(true) }
    } catch { setPwError(true) }
  }

  async function handleAnalyze() {
    const d = getSongData()
    setAnalyzing(true); setAnalyzeError(''); setReview(null); setProgressIdx(0)
    const interval = setInterval(() => {
      setProgressIdx(i => Math.min(i + 1, PROGRESS_STEPS.length - 1))
    }, 3500)
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', password: pwInput.trim(), songData: d, mode: 'lyrics_only' }),
      })
      clearInterval(interval)
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((data as any)?.error || `API error ${r.status}`)
      const result = data.result
      result._formData = d
      setReview(result)
      setActiveTab('scores')
    } catch (e: any) {
      clearInterval(interval)
      setAnalyzeError(e.message || 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleDownloadPdf() {
    if (!review) return
    setPdfBusy(true); setPdfError('')
    try {
      const { buildReviewPdf, pdfFilename } = await import('../lib/review-pdf')
      const doc = await buildReviewPdf(review, displayTitle)
      doc.save(pdfFilename(displayTitle))
    } catch (e: any) {
      setPdfError(e?.message || 'Could not build the PDF.')
    } finally {
      setPdfBusy(false)
    }
  }

  // Sharing to the library. Consent is the gate: without the box ticked the
  // lyrics never leave the browser, and the API refuses the request anyway.
  const [consent, setConsent] = useState(false)
  const [submitterName, setSubmitterName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const submitEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue('email').trim())

  async function handleSubmitToLibrary() {
    if (!review || !consent || !submitEmailValid || submitting) return
    setSubmitting(true); setSubmitMsg(null)
    const d = getSongData()
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          password: pwInput.trim(),
          submission: {
            consent: true,
            title: displayTitle,
            artist: d.artist || review.meta?.artist || '',
            lyrics: d.lyrics,
            themes: d.themes,
            key: d.key,
            timeSignature: d.timeSignature || review.meta?.time_signature || '',
            overall_score: review.overall_score,
            review,
            submitterName: submitterName.trim(),
            submitterEmail: d.email,
          },
        }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((data as any)?.error || `Submission failed (${r.status})`)
      setSubmitMsg({ type: 'ok', text: 'Thank you. Your song has been sent for review and will appear in the library once approved.' })
    } catch (e: any) {
      setSubmitMsg({ type: 'err', text: e.message || 'Could not submit.' })
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setReview(null); setPasteRaw(''); setEdits({})
    setAnalyzeError(''); setChosenTitle(''); setPdfError('')
    setConsent(false); setSubmitterName(''); setSubmitMsg(null)
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .az-tab { padding: 9px 16px; background: none; border: none; border-bottom: 2px solid transparent; font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.04em; color: rgba(255,255,255,0.35); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .az-tab:hover { color: rgba(255,255,255,0.6); }
    .az-tab.active { border-bottom-color: ${BLUE}; color: #fff; }
    .az-lens-card { border-radius: 8px; padding: 14px 16px; margin-bottom: 8px; border-left: 3px solid; }
    .az-input { width: 100%; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 10px 14px; font-size: 13px; font-family: 'Sora', sans-serif; color: #fff; outline: none; transition: border-color 0.2s; }
    .az-input::placeholder { color: rgba(255,255,255,0.25); }
    .az-input:focus { border-color: rgba(255,255,255,0.3); }
    .az-btn { width: 100%; padding: 13px; border: none; border-radius: 8px; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .az-btn:disabled { opacity: 0.35; cursor: default; }
    .az-gen-btn { font-family: 'Sora', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.03em; text-transform: none; padding: 3px 9px; border-radius: 20px; border: 0.5px solid rgba(0,181,255,0.35); background: rgba(0,181,255,0.08); color: ${BLUE}; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .az-gen-btn:hover:not(:disabled) { background: rgba(0,181,255,0.18); border-color: ${BLUE}; }
    .az-gen-btn:disabled { opacity: 0.35; cursor: default; }
    .az-clear-btn { font-family: 'Sora', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.03em; text-transform: none; padding: 3px 9px; border-radius: 20px; border: 0.5px solid rgba(255,255,255,0.18); background: none; color: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .az-clear-btn:hover { border-color: rgba(255,255,255,0.4); color: rgba(255,255,255,0.7); }
    .az-details { border: 0.5px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 14px; background: rgba(255,255,255,0.02); }
    .az-summary { cursor: pointer; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; color: ${BLUE}; list-style: none; user-select: none; }
    .az-summary::-webkit-details-marker { display: none; }
    .az-summary::before { content: '+ '; font-weight: 700; }
    .az-details[open] .az-summary::before { content: '- '; }
    .az-title-chip { font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 20px; border: 0.5px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.65); cursor: pointer; transition: all 0.15s; }
    .az-title-chip:hover { border-color: rgba(0,181,255,0.5); color: #fff; }
    .az-title-chip.active { background: ${BLUE}; border-color: ${BLUE}; color: ${NAVY}; font-weight: 600; }
    .az-auto-chip { font-size: 8px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${BLUE}; background: rgba(0,181,255,0.12); border: 0.5px solid rgba(0,181,255,0.3); border-radius: 3px; padding: 1px 5px; }
    .scripture-row { display: flex; gap: 12px; padding: 10px 0; border-bottom: 0.5px solid rgba(255,255,255,0.08); font-size: 13px; }
    .story-item { padding: 14px 0; border-bottom: 0.5px solid rgba(255,255,255,0.08); }
    @media (max-width: 680px) {
      .desktop-nav-links { display: none !important; }
      .az-grid2 { grid-template-columns: 1fr !important; }
      .az-grid3 { grid-template-columns: 1fr 1fr !important; }
      .az-detail-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .az-detail-grid > div { grid-column: span 2 !important; }
      .az-detail-grid > .az-field-key,
      .az-detail-grid > .az-field-timeSignature { grid-column: span 1 !important; }
    }
  `

  if (!unlocked) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: NAVY, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <style>{styles}</style>
        <nav style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}><LogoWhite height={44} /></Link>
        </nav>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>Songwriter Access</div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em' }}>Song Analyzer</h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>Enter the access password you were given.</p>
            </div>
            <input
              type="password" className="az-input" placeholder="Password"
              value={pwInput} onChange={e => setPwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              style={{ marginBottom: 10, textAlign: 'center', fontSize: 16, letterSpacing: '0.1em' }}
            />
            {pwError && <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginBottom: 10 }}>Incorrect password.</div>}
            <button className="az-btn" onClick={handleUnlock} style={{ background: BLUE, color: NAVY }}>Unlock</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: NAVY, color: '#fff', minHeight: '100vh' }}>
      <style>{styles}</style>

      <nav style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 50, background: NAVY }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 68, maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}><LogoWhite height={44} /></Link>
          <div className="desktop-nav-links" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/songs" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Songs</Link>
            <Link href="/about" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>About</Link>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: BLUE, border: `0.5px solid ${BLUE}`, padding: '3px 10px', borderRadius: 20 }}>Analyzer</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px 80px' }}>

        {!review && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 8 }}>Songwriter Access</div>
              <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em' }}>Song Analyzer</h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Paste a song export or just the lyrics. Everything else is optional - anything you leave blank gets detected or inferred. Download the finished review as a PDF.</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Add Song Lyrics *</label>
              <textarea
                className="az-input" rows={14}
                placeholder={'Paste anything here - a SongSelect export, a WorshipTools dump, or just the raw lyrics.\n\nFor example:\n\nTurn Your Eyes\n\nAuthors\nAndrew Holt | Bernie Herms\n\nDefault Key\nC\n\nVerse 1\nO soul are you weary...\n\nCCLI Song # 7158162'}
                value={pasteRaw} onChange={e => setPasteRaw(e.target.value)}
                style={{ resize: 'vertical' }}
              />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Lyrics are used for analysis only. Never stored or displayed.</div>
            </div>

                        <DetailFields
              fieldValue={fieldValue}
              isAutoFilled={isAutoFilled}
              setField={setField}
              onReset={() => setEdits({})}
              hasEdits={Object.keys(edits).length > 0}
              onGenerate={handleGenerate}
              generating={generating}
              canGenerate={!!auto.lyrics}
              titleOptions={titleOptions}
              onPickTitle={(t) => { setField('title', t); setTitleOptions([]) }}
              meterNote={meterNote}
              onClear={clearGenerated}
              genError={genError}
            />

            {auto.lyrics && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Lyrics detected - {auto.lyrics.split('\n').filter(Boolean).length} lines
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                  {auto.lyrics.split('\n').filter(Boolean).slice(0, 3).join(' / ')}
                </div>
              </div>
            )}

            <button className="az-btn" disabled={!canAnalyze() || analyzing} onClick={handleAnalyze}
              style={{ background: canAnalyze() && !analyzing ? '#fff' : 'rgba(255,255,255,0.08)', color: canAnalyze() && !analyzing ? NAVY : 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
              {analyzing ? PROGRESS_STEPS[progressIdx] : 'Analyze Song'}
            </button>

            {analyzing && (
              <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', background: BLUE, borderRadius: 2, transition: 'width 0.4s ease', width: `${((progressIdx + 1) / PROGRESS_STEPS.length) * 90}%` }} />
              </div>
            )}

            {analyzeError && (
              <div style={{ padding: '10px 14px', background: '#1a0505', border: '0.5px solid #f87171', borderRadius: 8, fontSize: 12, color: '#f87171' }}>{analyzeError}</div>
            )}
          </>
        )}

        {review && (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 20, borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 4 }}>{displayTitle}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                  {review.meta?.artist || review._formData?.artist || 'Artist unknown'}
                  {review.meta?.identified_from_lyrics && <span className="az-auto-chip" style={{ marginLeft: 8 }}>Identified from lyrics</span>}
                </div>
                {(review.meta?.ccli_number || review._formData?.ccli) && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>CCLI #{review.meta?.ccli_number || review._formData?.ccli}</div>
                )}

                {(review.meta?.suggested_titles || []).length > 0 && (
                  <div style={{ marginTop: 12, maxWidth: 480 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 7 }}>
                      {chosenTitle ? 'Title chosen - pick another to change it' : 'No title given - pick one'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {review.meta.suggested_titles.map((t: string) => (
                        <button key={t} onClick={() => setChosenTitle(chosenTitle === t ? '' : t)} className={`az-title-chip${chosenTitle === t ? ' active' : ''}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                )}

                {review.overall_verdict && (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginTop: 8, lineHeight: 1.6, maxWidth: 480 }}>{review.overall_verdict}</div>
                )}
              </div>
              <div style={{ textAlign: 'right', marginLeft: 20, flexShrink: 0 }}>
                <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.04em', color: scoreColor(review.overall_score) }}>{(review.overall_score || 0).toFixed(1)}</div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{review.recommendation}</div>
                <button onClick={handleReset} style={{ marginTop: 10, padding: '5px 12px', border: '0.5px solid rgba(255,255,255,0.15)', background: 'none', color: 'rgba(255,255,255,0.4)', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>New song</button>
              </div>
            </div>

            <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.1)', marginBottom: 24, overflowX: 'auto' }}>
              {(['scores', 'review', 'defense', 'technical', 'story'] as TabKey[]).map(t => (
                <button key={t} className={`az-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'scores' && (
              <div>
                {LENS_CONFIG.map(l => {
                  const d = review.lenses?.[l.key] || {}
                  // Singability needs a melody. On a lyrics-only review there
                  // isn't one, so it is shown as not scored rather than guessed.
                  const excluded = d.excluded === true || d.score === null || d.score === undefined
                  if (excluded) {
                    return (
                      <div key={l.key} className="az-lens-card" style={{ background: 'rgba(255,255,255,0.03)', borderLeftColor: 'rgba(255,255,255,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, gap: 10 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{l.label}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>Not scored</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
                          {d.summary || 'Melodic criteria are not evaluated in a lyrics-only review. Singability depends on melody, range and key, none of which a lyric sheet provides, so this lens is left out of the score rather than guessed at.'}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={l.key} className="az-lens-card" style={{ background: l.bg, borderLeftColor: l.color }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: l.color }}>{l.label}</span>
                        <span style={{ fontSize: 22, fontWeight: 600, color: l.color }}>{(d.score || 0).toFixed(1)}</span>
                      </div>
                      {d.deduction_line && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: 6 }}>{d.deduction_line}</div>}
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{d.summary}</div>
                    </div>
                  )
                })}

                <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', fontSize: 11.5, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>
                  This score reflects four lenses. Congregational Singability is a melodic judgement and is not applied to a lyrics-only review, so it is excluded from the average rather than scored on assumptions.
                </div>
                {review.technical?.themes?.length > 0 && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 20, marginBottom: 8 }}>Themes</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {review.technical.themes.map((t: string) => <span key={t} style={{ fontSize: 11, padding: '3px 12px', borderRadius: 20, background: '#1e1035', color: '#a78bfa' }}>{t}</span>)}
                    </div>
                  </>
                )}
                {[...(review.scripture_map?.primary || []), ...(review.scripture_map?.supporting || [])].length > 0 && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 20, marginBottom: 8 }}>Scripture Map</div>
                    {[...(review.scripture_map?.primary || []), ...(review.scripture_map?.supporting || [])].map((r: any, i: number) => (
                      <div key={i} className="scripture-row">
                        <div style={{ fontWeight: 700, color: '#22c55e', minWidth: 120 }}>{r.reference}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{r.connection}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {activeTab === 'review' && (
              <div>
                <div style={{ lineHeight: 1.85 }}>
                  {(review.full_analysis?.paragraphs || []).filter(Boolean).map((p: string, i: number) => (
                    <p key={i} style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 16, fontStyle: 'italic' }}>{p}</p>
                  ))}
                </div>
                {(review.theological_nuances?.affirmed?.length > 0 || review.theological_nuances?.flagged?.length > 0) && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 24, marginBottom: 12 }}>Theological Nuances</div>
                    {(review.theological_nuances?.affirmed || []).map((n: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 8px', borderRadius: 4, background: '#052e16', color: '#22c55e', height: 'fit-content', marginTop: 2, whiteSpace: 'nowrap' }}>AFFIRMED</span>
                        <div><div style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{n.note}</div></div>
                      </div>
                    ))}
                    {(review.theological_nuances?.flagged || []).map((n: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 8px', borderRadius: 4, background: '#1a0505', color: '#f87171', height: 'fit-content', marginTop: 2, whiteSpace: 'nowrap' }}>FLAGGED</span>
                        <div><div style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{n.note}</div></div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {activeTab === 'defense' && (
              <div>
                {review.lenses?.defense_brief?.summary && (
                  <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 16 }}>
                    {review.lenses.defense_brief.summary}
                  </div>
                )}
                {(review.lenses?.defense_brief?.objections || []).map((o: any, i: number) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '14px 16px', marginBottom: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f87171', marginBottom: 6 }}>{o.tag || 'Objection'}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{o.objection}</div>
                    {o.who_raises_it && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginBottom: 8 }}>Raised by: {o.who_raises_it}</div>}
                    {o.suggested_framing && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 6 }}>{o.suggested_framing}</div>}
                    {o.scripture_response && <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{o.scripture_response}</div>}
                    {o.honest_concession && <div style={{ fontSize: 12, color: '#fb923c', fontStyle: 'italic', marginTop: 6 }}>Concession: {o.honest_concession}</div>}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'technical' && (
              <div>
                <div className="az-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                  {[
                    ['Original Key', review.lenses?.congregational_singability?.key_original || review.meta?.key_original],
                    ['Rec. Key', review.lenses?.congregational_singability?.key_recommended || review.meta?.key_recommended],
                    ['Original Range', review.lenses?.congregational_singability?.range_original],
                    ['Rec. Range', review.lenses?.congregational_singability?.range_recommended],
                    ['Time Signature', review.meta?.time_signature],
                    ['Tempo', review.meta?.tempo_bpm ? `${review.meta.tempo_bpm} BPM` : null],
                    ['Radio Test', review.lenses?.theological_clarity?.radio_test_result],
                    ['Genre', review.meta?.genre],
                    ['Release', review.meta?.release_year],
                    ['Album', review.meta?.album],
                  ].filter(([, v]) => v).map(([label, val]) => (
                    <div key={label as string} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{val as string}</div>
                    </div>
                  ))}
                </div>

                {(review.meta?.time_signature_reasoning || review.meta?.meter_pattern || review.meta?.meter_name) && (
                  <div style={{ background: 'rgba(0,181,255,0.05)', border: '0.5px solid rgba(0,181,255,0.25)', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: BLUE }}>Meter Analysis</span>
                      <span className="az-auto-chip">{review.meta?.time_signature_source === 'provided' ? 'You supplied this' : 'Recommended'}</span>
                    </div>
                    <div className="az-grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                      {[
                        ['Signature', review.meta?.time_signature],
                        ['Syllable Pattern', review.meta?.meter_pattern],
                        ['Hymn Meter', review.meta?.meter_name],
                        ['Poetic Foot', review.meta?.poetic_foot],
                      ].filter(([, v]) => v).map(([label, val]) => (
                        <div key={label as string} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 12px' }}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, textTransform: label === 'Poetic Foot' ? 'capitalize' : 'none' }}>{val as string}</div>
                        </div>
                      ))}
                    </div>
                    {review.meta?.time_signature_reasoning && (
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{review.meta.time_signature_reasoning}</div>
                    )}
                  </div>
                )}

                {review.technical?.audience_fit && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>Audience Fit</div>
                    <div className="az-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[['Spiritual Maturity', review.technical.audience_fit.spiritual_maturity], ['Age Group', review.technical.audience_fit.age_group], ['Service Type', review.technical.audience_fit.service_type], ['Visitor-Friendly', review.technical.audience_fit.visitor_friendliness], ['Special Contexts', review.technical.audience_fit.special_contexts]].filter(([, v]) => v).map(([l, v]) => (
                        <div key={l as string} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px' }}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{l}</div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{v as string}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'story' && (
              <div>
                {review.story_behind_song?.publisher_note && (
                  <div style={{ padding: '12px 14px', background: '#2a1f00', border: '0.5px solid #fbbf24', borderRadius: 8, fontSize: 13, color: '#fbbf24', marginBottom: 16 }}>
                    {review.story_behind_song.publisher_note}
                  </div>
                )}
                {(review.story_behind_song?.items || []).filter((i: any) => i.text).map((item: any, idx: number) => (
                  <div key={idx} className="story-item">
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{item.text}</div>
                    {item.source && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', marginTop: 4 }}>Source: {item.source}</div>}
                  </div>
                ))}
                {!(review.story_behind_song?.items || []).some((i: any) => i.text) && (
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No verified background is available for this song.</div>
                )}
              </div>
            )}

            {/* SAVE - guests take the review with them, nothing is written back */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Save This Analysis</div>
              <button className="az-btn" onClick={handleDownloadPdf} disabled={pdfBusy}
                style={{ background: pdfBusy ? 'rgba(255,255,255,0.08)' : BLUE, color: pdfBusy ? 'rgba(255,255,255,0.35)' : NAVY }}>
                {pdfBusy ? 'Building PDF...' : 'Download Song Analysis (PDF)'}
              </button>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 8, textAlign: 'center' }}>
                Saves the full review - scores, Scripture map, defense brief, and technical notes.
              </div>
              {pdfError && (
                <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, fontSize: 12, background: '#1a0505', border: '0.5px solid #f87171', color: '#f87171' }}>{pdfError}</div>
              )}
            </div>

            {/* SHARE TO LIBRARY */}
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
                Share This Song <span style={{ color: 'rgba(255,255,255,0.2)' }}>- optional</span>
              </div>

              {submitMsg?.type === 'ok' ? (
                <>
                  <div style={{ padding: '14px 16px', borderRadius: 8, fontSize: 13, lineHeight: 1.7, background: '#052e16', border: '0.5px solid #22c55e', color: '#22c55e' }}>
                    {submitMsg.text}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => { handleReset(); if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      style={{ flex: '1 1 200px', padding: '13px', border: 'none', borderRadius: 8, fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#fff', color: NAVY }}
                    >
                      Analyze more Lyrics
                    </button>
                    <Link
                      href="/songs"
                      style={{ flex: '1 1 200px', padding: '13px', borderRadius: 8, fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', textAlign: 'center' }}
                    >
                      Song Library
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 12 }}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={e => { setConsent(e.target.checked); setSubmitMsg(null) }}
                      style={{ marginTop: 3, width: 15, height: 15, accentColor: BLUE, cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                      I&rsquo;d like to share my song lyrics on the WorshipLens library
                    </span>
                  </label>

                  {consent && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                        Email <span style={{ color: '#f87171', textTransform: 'none', letterSpacing: 0 }}>(required to submit for approval)</span>
                      </label>
                      <input
                        className="az-input"
                        type="email"
                        placeholder="you@example.com"
                        value={fieldValue('email')}
                        onChange={e => setField('email', e.target.value)}
                        style={fieldValue('email').trim() && !submitEmailValid ? { borderColor: 'rgba(248,113,113,0.6)' } : undefined}
                      />
                      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.28)', marginTop: 5 }}>
                        We only use this to reach you about your song. Never shared or published.
                      </div>
                    </div>
                  )}

                  <button
                    className="az-btn"
                    disabled={!consent || !submitEmailValid || submitting}
                    onClick={handleSubmitToLibrary}
                    title={consent && !submitEmailValid ? 'Enter your email above to submit' : undefined}
                    style={{
                      background: consent && submitEmailValid && !submitting ? '#052e16' : 'rgba(255,255,255,0.05)',
                      border: `0.5px solid ${consent && submitEmailValid && !submitting ? '#22c55e' : 'rgba(255,255,255,0.12)'}`,
                      color: consent && submitEmailValid && !submitting ? '#22c55e' : 'rgba(255,255,255,0.25)',
                    }}
                  >
                    {submitting ? 'Sending...' : 'Submit my song for approval in the library'}
                  </button>

                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 10, lineHeight: 1.65 }}>
                    Your song lyrics are never stored or posted without your permission. Nothing is saved unless you tick the box above, and submitted songs are reviewed before they appear in the library.
                  </div>

                  {submitMsg?.type === 'err' && (
                    <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, fontSize: 12, background: '#1a0505', border: '0.5px solid #f87171', color: '#f87171' }}>
                      {submitMsg.text}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* COMING SOON */}
            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ background: 'rgba(0,181,255,0.05)', border: '0.5px solid rgba(0,181,255,0.2)', borderRadius: 8, padding: '16px 18px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 6 }}>Coming Soon</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Song Demos Forum for Songwriters</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                  Post a demo recording and get the full five-lens review, melodic analysis included. Congregational Singability needs a melody to judge - range, key, and how the tune sits in a room - so once you can submit audio, that fifth lens comes back and the score covers the whole song rather than the words alone. A place to trade feedback with other writers and workshop a song before it reaches a congregation.
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <footer style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', padding: '40px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <LogoWhite height={44} />
            <div style={{ display: 'flex', gap: 20 }}>
              <Link href="/songs" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Songs</Link>
              <Link href="/about" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>About</Link>
            </div>
          </div>

          {/* Same wording as the PDF notice block, so guests see the terms
              before they download rather than only after. */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.06)', fontSize: 9, lineHeight: 1.6, color: 'rgba(255,255,255,0.24)' }}>
            <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.34)', marginBottom: 6 }}>
              Analysis by WorshipLens - worshiplens.com
            </p>
            <p style={{ marginBottom: 7 }}>
              The WorshipLens five-lens review framework, scoring criteria, and evaluative language were created and written by Ludwingk Rios. Copyright 2026 Ludwingk Rios. All rights reserved.
            </p>
            <p style={{ marginBottom: 7 }}>
              Song lyrics are not reproduced in this report. Brief excerpts appear only as needed for commentary and criticism. All songs remain the property of their respective copyright holders; reproducing or projecting lyrics requires a valid CCLI or publisher license.
            </p>
            <p>
              Scores and commentary are editorial opinion offered to support pastoral discernment, not statements of fact about any songwriter, publisher, or congregation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
