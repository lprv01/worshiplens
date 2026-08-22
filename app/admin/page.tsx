'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  NAVY, BLUE,
  LogoWhite, smartParse, scoreColor, makeSlug,
  LENS_CONFIG, PROGRESS_STEPS, DetailFields,
  type ParsedSong, type MetaKey, type ReviewResult, type TabKey,
} from '../lib/review-shared'

// Library rows are specific to the admin page; everything else the two
// analyzers share lives in ../lib/review-shared.
type LibrarySong = {
  id: string
  slug: string
  title: string
  artist: string
  ccli_number: string | null
  overall_score: number | null
  recommendation: string | null
  created_at: string
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  // Auth
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState('')

  // Single input: one paste box, plus optional detail overrides.
  // Anything the parser finds pre-fills a detail field; typing in a field
  // pins it so a later re-parse cannot overwrite what you entered.
  const [pasteRaw, setPasteRaw] = useState('')
  const [edits, setEdits] = useState<Partial<Record<MetaKey, string>>>({})

  const auto = useMemo(() => smartParse(pasteRaw), [pasteRaw])

  const fieldValue = (k: MetaKey) => (edits[k] !== undefined ? edits[k]! : auto[k])
  const isAutoFilled = (k: MetaKey) => edits[k] === undefined && !!auto[k]
  const setField = (k: MetaKey, v: string) => setEdits(e => ({ ...e, [k]: v }))

  // Analysis
  const [analyzing, setAnalyzing] = useState(false)
  const [progressIdx, setProgressIdx] = useState(0)
  const [review, setReview] = useState<ReviewResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('scores')

  // Upload
  const [uploadMsg, setUploadMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dupe, setDupe] = useState<{ matchedOn: string; count: number; rows: any[] } | null>(null)

  // Title chosen from the model's suggestions (only offered when we had none)
  const [chosenTitle, setChosenTitle] = useState('')

  // Library
  const [view, setView] = useState<'analyze' | 'library'>('analyze')
  const [libRows, setLibRows] = useState<LibrarySong[] | null>(null)
  const [libLoading, setLibLoading] = useState(false)
  const [libError, setLibError] = useState('')
  const [libQuery, setLibQuery] = useState('')
  const [libTotal, setLibTotal] = useState<number | null>(null)

  async function loadLibrary(force = false) {
    if (libLoading) return
    if (libRows && !force) return
    setLibLoading(true)
    setLibError('')
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list', password: pwInput.trim() }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error((data as any)?.error || `Failed to load library (${r.status})`)
      setLibRows((data as any).rows || [])
      setLibTotal(typeof (data as any).total === 'number' ? (data as any).total : null)
    } catch (e: any) {
      setLibError(e.message || 'Failed to load library')
    } finally {
      setLibLoading(false)
    }
  }

  const filteredLib = useMemo(() => {
    if (!libRows) return []
    const q = libQuery.trim().toLowerCase()
    if (!q) return libRows
    return libRows.filter(s =>
      (s.title || '').toLowerCase().includes(q) ||
      (s.artist || '').toLowerCase().includes(q) ||
      (s.ccli_number || '').toString().includes(q)
    )
  }, [libRows, libQuery])

  // ── Password gate ──
  // The API already refuses guest passwords for list and upload, but the admin
  // page itself must not open either - a guest getting this far saw the
  // Library tab and a Forbidden error instead of a closed door.
  async function handleUnlock() {
    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', password: pwInput.trim() }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) { setPwError('Incorrect password.'); return }
      if ((data as any).role !== 'admin') {
        setPwError('guest')
        return
      }
      setUnlocked(true)
      setPwError('')
    } catch {
      setPwError('Could not reach the server.')
    }
  }


  // Generate helpers (title / meter) - callable before the full analysis
  const [generating, setGenerating] = useState<'title' | 'meter' | null>(null)
  const [titleOptions, setTitleOptions] = useState<string[]>([])
  const [meterNote, setMeterNote] = useState('')
  const [genError, setGenError] = useState('')

  async function handleGenerate(kind: 'title' | 'meter') {
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
      } else {
        if (res.time_signature) setField('timeSignature', res.time_signature)
        const bits = [res.meter_pattern, res.meter_name, res.poetic_foot].filter(Boolean).join(' · ')
        setMeterNote([bits, res.reasoning].filter(Boolean).join(' — '))
      }
    } catch (e: any) {
      setGenError(e.message || 'Could not generate that.')
    } finally {
      setGenerating(null)
    }
  }

  // ── Get active song data ──
  // Lyrics are the only requirement. Everything else is a hint: supplied by
  // you, recovered by the parser, or left for the model to infer.
  function getSongData(): ParsedSong {
    return {
      title: fieldValue('title').trim(),
      artist: fieldValue('artist').trim(),
      ccli: fieldValue('ccli').trim(),
      key: fieldValue('key').trim(),
      album: fieldValue('album').trim(),
      timeSignature: fieldValue('timeSignature').trim(),
      themes: fieldValue('themes').trim(),
      lyrics: auto.lyrics,
    }
  }

  function canAnalyze() {
    return !!getSongData().lyrics
  }

  // ── Analyze ──
  async function handleAnalyze() {
    const d = getSongData()

    setAnalyzing(true)
    setAnalyzeError('')
    setReview(null)
    setProgressIdx(0)

    const interval = setInterval(() => {
      setProgressIdx(i => Math.min(i + 1, PROGRESS_STEPS.length - 1))
    }, 3500)

    try {
      const r = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', password: pwInput.trim(), songData: d }),
      })

      clearInterval(interval)
      const data = await r.json().catch(() => ({}))
      if (!r.ok) {
        const dbg = (data as any)?.debug
        if (dbg) console.error('[analyze] server debug', dbg)
        const detail = dbg
          ? ` | stop_reason=${dbg.stop_reason} tokens=${dbg.output_tokens} len=${dbg.text_length} pos=${dbg.position}\n...${dbg.snippet}...`
          : ''
        throw new Error(((data as any)?.error || `API error ${r.status}`) + detail)
      }

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

  // ── Upload to Supabase ──
  async function handleUpload(force = false) {
    if (!review || uploading) return
    setUploading(true)
    if (!force) setDupe(null)
    const meta = review.meta || {}
    const fd = review._formData || {}
    const score = review.overall_score || 0
    const lenses = review.lenses || {}
    const lens_scores = {
      scriptural_fidelity: lenses.scriptural_fidelity?.score || 0,
      theological_clarity: lenses.theological_clarity?.score || 0,
      congregational_singability: lenses.congregational_singability?.score || 0,
      poetic_lyrical_quality: lenses.poetic_lyrical_quality?.score || 0,
      defense_brief: lenses.defense_brief?.score || 0,
    }
    const colorStr = score >= 8 ? 'green' : score >= 6.5 ? 'amber' : score >= 5 ? 'orange' : 'red'
    const effectiveTitle = chosenTitle || meta.title || fd.title || ''
    const slug = makeSlug(effectiveTitle) || meta.slug || `untitled-${(review.overall_score || 0).toFixed(1).replace('.', '')}`

    const row = {
      title: effectiveTitle || 'Untitled song',
      artist: meta.artist || fd.artist || 'Unknown',
      ccli_number: meta.ccli_number || fd.ccli || null,
      slug,
      overall_score: score,
      score_color: colorStr,
      recommendation: review.recommendation || '',
      overall_verdict: review.overall_verdict || '',
      lens_scores,
      key_original: fd.key || meta.key_original || '',
      key_recommended: meta.key_recommended || '',
      time_signature: fd.timeSignature || meta.time_signature || '',
      tempo_bpm: meta.tempo_bpm || null,
      copyright: meta.copyright || '',
      release_year: meta.release_year || '',
      album: meta.album || fd.album || '',
      genre: meta.genre || '',
      hymn_lineage_badge: meta.hymn_lineage_badge || null,
      lenses: review.lenses || {},
      full_analysis: review.full_analysis || {},
      scripture_map: review.scripture_map || {},
      theological_nuances: review.theological_nuances || {},
      hymn_lineage: review.hymn_lineage || null,
      story_behind_song: review.story_behind_song || {},
      technical: review.technical || {},
      set_intelligence: review.set_intelligence || {},
      similar_songs: review.similar_songs || {},
      themes: review.technical?.themes || [],
      seasonal_tags: review.technical?.seasonal_tags || [],
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upload', password: pwInput.trim(), row, force }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 409 && (data as any).duplicate) {
        setDupe((data as any).duplicate)
        setUploadMsg(null)
        return
      }
      if (!res.ok) {
        throw new Error((data as any).error || `Upload failed ${res.status}`)
      }

      setDupe(null)
      const mode = (data as any).mode
      const also = (data as any).alsoPresent || 0
      setUploadMsg({
        type: 'ok',
        text: mode === 'updated'
          ? `"${row.title}" replaced the existing entry.${also > 0 ? ` Note: ${also} other row${also > 1 ? 's' : ''} still match and were left alone.` : ''}`
          : `"${row.title}" uploaded to Supabase successfully.`,
      })
      loadLibrary(true)   // keep the Library tab honest after a write
    } catch (e: any) {
      setUploadMsg({ type: 'err', text: e.message })
    } finally {
      setUploading(false)
    }
  }

  function handleReset() {
    setReview(null)
    setPasteRaw('')
    setEdits({})
    setAnalyzeError('')
    setUploadMsg(null)
    setChosenTitle('')
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .ham-line { display: block; width: 22px; height: 1.5px; background: #fff; border-radius: 2px; position: absolute; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease; }
    .ham-line-1 { transform: translateY(-5px); }
    .ham-line-3 { transform: translateY(5px); }
    .az-tab { padding: 9px 16px; background: none; border: none; border-bottom: 2px solid transparent; font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.04em; color: rgba(255,255,255,0.35); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .az-tab:hover { color: rgba(255,255,255,0.6); }
    .az-tab.active { border-bottom-color: ${BLUE}; color: #fff; }
    .az-lens-card { border-radius: 8px; padding: 14px 16px; margin-bottom: 8px; border-left: 3px solid; }
    .az-gen-btn { font-family: 'Sora', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.03em; text-transform: none; padding: 3px 9px; border-radius: 20px; border: 0.5px solid rgba(0,181,255,0.35); background: rgba(0,181,255,0.08); color: ${BLUE}; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
    .az-gen-btn:hover:not(:disabled) { background: rgba(0,181,255,0.18); border-color: ${BLUE}; }
    .az-gen-btn:disabled { opacity: 0.35; cursor: default; }
    .az-details { border: 0.5px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 14px; background: rgba(255,255,255,0.02); }
    .az-summary { cursor: pointer; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; color: ${BLUE}; list-style: none; user-select: none; }
    .az-summary::-webkit-details-marker { display: none; }
    .az-summary::before { content: '+ '; font-weight: 700; }
    .az-details[open] .az-summary::before { content: '- '; }
    .az-title-chip { font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 20px; border: 0.5px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.65); cursor: pointer; transition: all 0.15s; }
    .az-title-chip:hover { border-color: rgba(0,181,255,0.5); color: #fff; }
    .az-title-chip.active { background: ${BLUE}; border-color: ${BLUE}; color: ${NAVY}; font-weight: 600; }
    .az-lib-row { display: flex; align-items: center; padding: 12px 14px; margin-bottom: 6px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 0.5px solid rgba(255,255,255,0.08); text-decoration: none; transition: all 0.15s; }
    .az-lib-row:hover { background: rgba(255,255,255,0.07); border-color: rgba(0,181,255,0.35); }
    .az-auto-chip { font-size: 8px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${BLUE}; background: rgba(0,181,255,0.12); border: 0.5px solid rgba(0,181,255,0.3); border-radius: 3px; padding: 1px 5px; }
    .az-input { width: 100%; background: rgba(255,255,255,0.05); border: 0.5px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 10px 14px; font-size: 13px; font-family: 'Sora', sans-serif; color: #fff; outline: none; transition: border-color 0.2s; }
    .az-input::placeholder { color: rgba(255,255,255,0.25); }
    .az-input:focus { border-color: rgba(255,255,255,0.3); }
    .az-btn { width: 100%; padding: 13px; border: none; border-radius: 8px; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .az-btn:disabled { opacity: 0.35; cursor: default; }
    .az-upload-btn { flex: 1; padding: 11px; border-radius: 8px; font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .scripture-row { display: flex; gap: 12px; padding: 10px 0; border-bottom: 0.5px solid rgba(255,255,255,0.08); font-size: 13px; }
    .story-item { padding: 14px 0; border-bottom: 0.5px solid rgba(255,255,255,0.08); }
    @media (max-width: 680px) {
      .desktop-nav-links { display: none !important; }
      .az-grid2 { grid-template-columns: 1fr !important; }
      .az-grid3 { grid-template-columns: 1fr 1fr !important; }
      .az-detail-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .az-detail-grid > div { grid-column: span 2 !important; }
    }
  `

  // ── Password gate ──────────────────────────────────────────────────────────
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
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>Internal Tool</div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', letterSpacing: '-0.03em' }}>Song Analyzer</h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>Enter the access password to continue.</p>
            </div>
            <input
              type="password"
              className="az-input"
              placeholder="Password"
              value={pwInput}
              onChange={e => setPwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              style={{ marginBottom: 10, textAlign: 'center', fontSize: 16, letterSpacing: '0.1em' }}
            />
            {pwError === 'guest' ? (
              <div style={{ fontSize: 12, color: '#fbbf24', textAlign: 'center', marginBottom: 10, lineHeight: 1.6 }}>
                That is the songwriter password. It belongs on{' '}
                <Link href="/analyze" style={{ color: BLUE }}>the song analyzer</Link>.
              </div>
            ) : pwError ? (
              <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginBottom: 10 }}>{pwError}</div>
            ) : null}
            <button className="az-btn" onClick={handleUnlock} style={{ background: BLUE, color: NAVY }}>
              Unlock
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main analyzer ──────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: NAVY, color: '#fff', minHeight: '100vh' }}>
      <style>{styles}</style>

      {/* NAV */}
      <nav style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 50, background: NAVY }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 68, maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LogoWhite height={44} />
          </Link>
          <div className="desktop-nav-links" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/songs" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Songs</Link>
            <Link href="/about" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>About</Link>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: BLUE, border: `0.5px solid ${BLUE}`, padding: '3px 10px', borderRadius: 20 }}>Admin</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* VIEW TOGGLE */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
          {([['analyze', 'Analyzer'], ['library', 'Library']] as const).map(([v, label]) => (
            <button
              key={v}
              className={`az-tab${view === v ? ' active' : ''}`}
              onClick={() => { setView(v); if (v === 'library') loadLibrary() }}
            >
              {label}
              {v === 'library' && libRows && (
                <span style={{ marginLeft: 6, opacity: 0.5 }}>{libTotal ?? libRows.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* LIBRARY */}
        {view === 'library' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <input
                className="az-input"
                placeholder="Search by title, artist, or CCLI #"
                value={libQuery}
                onChange={e => setLibQuery(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                onClick={() => loadLibrary(true)}
                disabled={libLoading}
                style={{ padding: '10px 16px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.15)', background: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', fontFamily: "'Sora', sans-serif", whiteSpace: 'nowrap' }}
              >
                {libLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {libError && (
              <div style={{ padding: '10px 14px', background: '#1a0505', border: '0.5px solid #f87171', borderRadius: 8, fontSize: 12, color: '#f87171', marginBottom: 12 }}>
                {libError}
              </div>
            )}

            {libLoading && !libRows && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', padding: '20px 0' }}>Loading uploaded songs...</div>
            )}

            {libRows && filteredLib.length === 0 && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', padding: '20px 0' }}>
                {libQuery ? `No songs match "${libQuery}".` : 'No songs uploaded yet.'}
              </div>
            )}

            {filteredLib.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
                  {libQuery
                    ? `${filteredLib.length} of ${libRows!.length} loaded`
                    : `${libRows!.length} songs${libTotal && libTotal > libRows!.length ? ` of ${libTotal}` : ''}`}
                </div>
                {filteredLib.map(s => (
                  <Link key={s.id} href={`/songs/${s.slug}`} className="az-lib-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title || 'Untitled song'}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.artist || 'Artist unknown'}
                        {s.ccli_number ? ` · CCLI #${s.ccli_number}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 14 }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color: scoreColor(s.overall_score || 0) }}>
                        {(s.overall_score ?? 0).toFixed(1)}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        )}

        {/* INPUT FORM */}
        {view === 'analyze' && !review && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 8 }}>Internal Tool</div>
              <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em' }}>Song Analyzer</h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Paste a song export or just the lyrics. Everything else is optional - anything you leave blank gets detected or inferred.</p>
            </div>

            {/* PASTE BOX */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                Add Song Lyrics *
              </label>
              <textarea
                className="az-input"
                rows={14}
                placeholder={'Paste anything here - a SongSelect export, a WorshipTools dump, or just the raw lyrics.\n\nFor example:\n\nTurn Your Eyes\n\nAuthors\nAndrew Holt | Bernie Herms\n\nDefault Key\nC\n\nVerse 1\nO soul are you weary...\n\nCCLI Song # 7158162'}
                value={pasteRaw}
                onChange={e => setPasteRaw(e.target.value)}
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

            {/* ANALYZE BUTTON */}
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
              <div style={{ padding: '10px 14px', background: '#1a0505', border: '0.5px solid #f87171', borderRadius: 8, fontSize: 12, color: '#f87171' }}>
                {analyzeError}
              </div>
            )}
          </>
        )}

        {/* RESULTS */}
        {view === 'analyze' && review && (
          <>
            {/* RESULT HEADER */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 20, borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 4, color: chosenTitle ? '#fff' : undefined }}>
                  {chosenTitle || review.meta?.title || review._formData?.title || 'Untitled song'}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                  {review.meta?.artist || review._formData?.artist || 'Artist unknown'}
                  {review.meta?.identified_from_lyrics && (
                    <span className="az-auto-chip" style={{ marginLeft: 8 }}>Identified from lyrics</span>
                  )}
                </div>
                {(review.meta?.ccli_number || review._formData?.ccli) && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>CCLI #{review.meta?.ccli_number || review._formData?.ccli}</div>
                )}
                {/* TITLE SUGGESTIONS - only offered when we arrived with no title */}
                {(review.meta?.suggested_titles || []).length > 0 && (
                  <div style={{ marginTop: 12, maxWidth: 480 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 7 }}>
                      {chosenTitle ? 'Title chosen - pick another to change it' : 'No title given - pick one'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {review.meta.suggested_titles.map((t: string) => (
                        <button
                          key={t}
                          onClick={() => setChosenTitle(chosenTitle === t ? '' : t)}
                          className={`az-title-chip${chosenTitle === t ? ' active' : ''}`}
                        >
                          {t}
                        </button>
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

            {/* TABS */}
            <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.1)', marginBottom: 24, overflowX: 'auto' }}>
              {(['scores', 'review', 'defense', 'technical', 'story', 'similar'] as TabKey[]).map(t => (
                <button key={t} className={`az-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* SCORES TAB */}
            {activeTab === 'scores' && (
              <div>
                {LENS_CONFIG.map(l => {
                  const d = review.lenses?.[l.key] || {}
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
                {/* Tags */}
                {review.technical?.themes?.length > 0 && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 20, marginBottom: 8 }}>Themes</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {review.technical.themes.map((t: string) => <span key={t} style={{ fontSize: 11, padding: '3px 12px', borderRadius: 20, background: '#1e1035', color: '#a78bfa' }}>{t}</span>)}
                    </div>
                  </>
                )}
                {/* Scripture */}
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

            {/* REVIEW TAB */}
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

            {/* DEFENSE TAB */}
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

            {/* TECHNICAL TAB */}
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
                {/* METER / TIME SIGNATURE REASONING */}
                {(review.meta?.time_signature_reasoning || review.meta?.meter_pattern || review.meta?.meter_name) && (
                  <div style={{ background: 'rgba(0,181,255,0.05)', border: '0.5px solid rgba(0,181,255,0.25)', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: BLUE }}>Meter Analysis</span>
                      <span className="az-auto-chip">
                        {review.meta?.time_signature_source === 'provided' ? 'You supplied this' : 'Recommended'}
                      </span>
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
                {review.lenses?.poetic_lyrical_quality?.voice_distribution && (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 16, marginBottom: 10 }}>Voice Distribution</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Individual</div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>{review.lenses.poetic_lyrical_quality.voice_distribution.individual_pct}%</div>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Corporate</div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>{review.lenses.poetic_lyrical_quality.voice_distribution.corporate_pct}%</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STORY TAB */}
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
              </div>
            )}

            {/* SIMILAR TAB */}
            {activeTab === 'similar' && (
              <div style={{ display: 'flex', gap: 20 }}>
                {[['if_you_love_this', 'If You Love This Song', BLUE], ['if_this_concerns_you', 'If This Concerns You', '#fbbf24']].map(([field, label, color]) => (
                  <div key={field as string} style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: color as string, paddingBottom: 8, marginBottom: 10, borderBottom: `2px solid ${color}` }}>{label}</div>
                    {(review.similar_songs?.[field as string] || []).length > 0
                      ? (review.similar_songs[field as string]).map((s: any, i: number) => (
                        <div key={i} style={{ padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.artist}</div>
                          {s.reason && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginTop: 3 }}>{s.reason}</div>}
                        </div>
                      ))
                      : <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', paddingTop: 8 }}>Run similarity backfill to populate.</div>
                    }
                  </div>
                ))}
              </div>
            )}

            {/* UPLOAD */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Upload to WorshipLens</div>
              {/* Already-in-library warning. Uploading twice was how the
                  duplicate Amazing Grace rows happened; this makes the second
                  one a deliberate choice. */}
              {dupe && (
                <div style={{ background: '#2a1f00', border: '0.5px solid #fbbf24', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24', marginBottom: 8 }}>
                    Already in the library - matched on {dupe.matchedOn === 'ccli_number' ? 'CCLI number' : 'slug'}
                    {dupe.count > 1 ? ` (${dupe.count} existing rows)` : ''}
                  </div>
                  {dupe.rows.map((r: any) => (
                    <div key={r.id} style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>
                      {r.title || 'Untitled'} - {r.artist || 'Artist unknown'}
                      {r.ccli_number ? ` · CCLI #${r.ccli_number}` : ''}
                      {typeof r.overall_score === 'number' ? ` · ${r.overall_score.toFixed(1)}` : ''}
                      {r.created_at ? ` · added ${new Date(r.created_at).toLocaleDateString()}` : ''}
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="az-upload-btn" disabled={uploading} onClick={() => handleUpload(true)}
                      style={{ background: '#2a1f00', border: '0.5px solid #fbbf24', color: '#fbbf24', flex: 'none', padding: '8px 14px' }}>
                      {uploading ? 'Replacing...' : 'Replace existing'}
                    </button>
                    <button className="az-upload-btn" onClick={() => setDupe(null)}
                      style={{ background: 'none', border: '0.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', flex: 'none', padding: '8px 14px' }}>
                      Cancel
                    </button>
                  </div>
                  {dupe.count > 1 && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 10, lineHeight: 1.6 }}>
                      Replacing updates the newest row only. The older duplicates stay until you remove them in Supabase.
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="az-upload-btn" disabled={uploading} onClick={() => handleUpload(false)}
                  style={{ background: '#052e16', border: '0.5px solid #22c55e', color: '#22c55e' }}>
                  {uploading && !dupe ? 'Uploading...' : 'Upload to Supabase'}
                </button>
                <button className="az-upload-btn" onClick={() => { const c = { ...review }; delete c._formData; navigator.clipboard.writeText(JSON.stringify(c, null, 2)).then(() => setUploadMsg({ type: 'ok', text: 'JSON copied to clipboard.' })) }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                  Copy JSON
                </button>
              </div>
              {uploadMsg && (
                <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, fontSize: 12,
                  background: uploadMsg.type === 'ok' ? '#052e16' : '#1a0505',
                  border: `0.5px solid ${uploadMsg.type === 'ok' ? '#22c55e' : '#f87171'}`,
                  color: uploadMsg.type === 'ok' ? '#22c55e' : '#f87171' }}>
                  {uploadMsg.text}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <LogoWhite height={44} />
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/songs" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Songs</Link>
            <Link href="/about" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
