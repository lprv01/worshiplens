'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAVY = '#0D1B2A'
const BLUE = '#00b5ff'
const ANALYZE_PASSWORD = process.env.NEXT_PUBLIC_ANALYZE_PASSWORD || 'worshiplens'

// ── Logo (copied from existing pages) ───────────────────────────────────────
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

// ── Types ────────────────────────────────────────────────────────────────────
type ParsedSong = { title: string; artist: string; ccli: string; key: string; album: string; lyrics: string }
type ReviewResult = Record<string, any>
type TabKey = 'scores' | 'review' | 'defense' | 'technical' | 'story' | 'similar'

const LENS_CONFIG = [
  { key: 'scriptural_fidelity', label: 'Scriptural Fidelity', color: '#22c55e', bg: '#052e16' },
  { key: 'theological_clarity', label: 'Theological Clarity', color: '#a78bfa', bg: '#1e1035' },
  { key: 'congregational_singability', label: 'Singability', color: '#60a5fa', bg: '#0f1e3a' },
  { key: 'poetic_lyrical_quality', label: 'Poetic Quality', color: '#fb923c', bg: '#2a0f00' },
  { key: 'defense_brief', label: 'Defense Brief', color: '#f472b6', bg: '#2a0f1a' },
]

const PROGRESS_STEPS = [
  'Reading through the lyrics...',
  'Checking Scripture references...',
  'Evaluating theological clarity...',
  'Analyzing singability and range...',
  'Assessing poetic quality...',
  'Preparing the defense brief...',
  'Building the full review...',
  'Finalizing scores...',
]

// ── Smart Parser ─────────────────────────────────────────────────────────────
function smartParse(raw: string): ParsedSong {
  const lines = raw.split('\n').map(l => l.trim())
  let title = '', artist = '', ccli = '', key = '', album = '', lyrics = ''

  const ccliMatch = raw.match(/CCLI\s*(?:Song\s*)?#\s*(\d{5,8})/i) ||
    raw.match(/Song\s+Number\s*\n\s*(\d{5,8})/i)
  if (ccliMatch) ccli = ccliMatch[1]

  const keyMatch = raw.match(/Default\s+Key\s*[:\n]\s*([A-Ga-g][#bB]?[Mm]?)/i) ||
    raw.match(/\bKey\s*[:\n]\s*([A-Ga-g][#bB]?[Mm]?)/i)
  if (keyMatch) key = keyMatch[1].trim()

  const pipeLine = lines.find(l => l.includes(' | ') && !l.includes('ccli.com') && !l.startsWith('©'))
  if (pipeLine) {
    artist = pipeLine.split('|').map(a => a.trim()).join(', ')
  }
  if (!artist) {
    const authIdx = lines.findIndex(l => /^authors?$/i.test(l))
    if (authIdx >= 0) {
      const nameLines: string[] = []
      for (let i = authIdx + 1; i < Math.min(authIdx + 6, lines.length); i++) {
        const l = lines[i]
        if (!l || /^(song number|default key|ccli|verse|chorus|bridge|pre|tag|add to)/i.test(l)) break
        nameLines.push(l)
      }
      if (nameLines.length) {
        artist = nameLines.join(' ').replace(/([a-z])([A-Z])/g, '$1, $2').trim()
      }
    }
  }

  const skipWords = /^(authors?|song number|default key|key|ccli|add to|verse|chorus|bridge|pre-chorus|tag|ending|interlude|for use|planning by|©)/i
  for (const line of lines) {
    if (line && !skipWords.test(line) && line.length > 1 && line.length < 80 && !/^\d+$/.test(line)) {
      title = line
      break
    }
  }

  const sectionPattern = /^(verse|chorus|bridge|pre-?chorus|tag|ending|interlude|refrain|hook)/i
  const footerPattern = /^(ccli song|for use solely|planning by|©|last edited|delete|clone|busy|apple and|build|media player)/i
  const lyricsLines: string[] = []
  let inLyrics = false
  for (const line of lines) {
    if (sectionPattern.test(line)) inLyrics = true
    if (inLyrics && footerPattern.test(line)) break
    if (inLyrics) lyricsLines.push(line)
  }
  lyrics = lyricsLines.join('\n').trim()

  if (!lyrics) {
    let pastHeader = false
    const rawLyrics: string[] = []
    for (const line of lines) {
      if (!pastHeader && line === title) { pastHeader = true; continue }
      if (!pastHeader) continue
      if (footerPattern.test(line)) break
      if (/^(authors?|song number|default key|add to worshiptools)/i.test(line)) continue
      rawLyrics.push(line)
    }
    lyrics = rawLyrics.join('\n').trim()
  }

  return { title, artist, ccli, key, album, lyrics }
}

// ── Prompt builder ───────────────────────────────────────────────────────────
function buildPrompt(p: ParsedSong): string {
  return `You are WorshipLens, a theological review assistant for Baptist worship leaders in the BGCT/Texas Baptists tradition. Your tone is pastoral, equipping, and honest.

SONG DATA:
Title: ${p.title}
Artist: ${p.artist}
CCLI #: ${p.ccli || 'not provided'}
Key: ${p.key || 'not provided'}
Album: ${p.album || 'not provided'}

LYRICS (PRIVATE - for analysis only, never reproduced):
${p.lyrics}

RULES:
- NEVER reproduce the full lyrics. Quote only short fragments (under 10 words) directly relevant to analysis.
- Never refer to the songwriter by name in analysis fields. Say "the lyric", "the song", "this line".
- Never use em dashes in any output field. Use a regular hyphen (-) or rewrite the sentence.
- Score reductions must always trace to a specific, nameable reason.
- grammar_notes and lyric_modifications must be [] if no genuine issues exist.
- hymn_lineage must be null if no genuine historic hymn connection exists.
- story_behind_song: populate with 2-4 items whenever you have reasonable knowledge of the song's origin.
- voice_distribution: analyze from the lyrics provided.
- key_recommended: calculate from key provided, targeting A3-D5 congregational range.

SCORING: Each lens scored 0-10. Overall 10/10 is unreachable by design. Deduction lines must state the reason first.

Generate a complete WorshipLens review as a single valid JSON object. No text outside the JSON. No markdown fences.

{"meta":{"title":"","artist":"","ccli_number":"","slug":"","key_original":"","key_recommended":"","range_original":"","range_recommended":"","time_signature":"","tempo_bpm":0,"copyright":"","release_year":"","album":"","genre":"","hymn_lineage_badge":null},"overall_score":0.0,"overall_verdict":"","recommendation":"Recommended","lenses":{"scriptural_fidelity":{"score":0.0,"deduction_line":"","summary":"","watchpoints":[],"lyric_examples":[]},"theological_clarity":{"score":0.0,"deduction_line":"","summary":"","radio_test_result":"Passes","radio_test_note":"","theological_arc":"","watchpoints":[]},"congregational_singability":{"score":0.0,"deduction_line":"","summary":"","key_original":"","key_recommended":"","range_original":"","range_recommended":"","ceiling_note":"","melody_accessibility":""},"poetic_lyrical_quality":{"score":0.0,"deduction_line":"","summary":"","repetition_ratio_pct":0,"cliche_density":"low","imagery_quality":"","voice_distribution":{"individual_pct":0,"corporate_pct":0,"flag":null,"note":""},"grammar_notes":[],"lyric_modifications":[],"watchpoints":[]},"defense_brief":{"score":0.0,"summary":"","objections":[{"objection":"","who_raises_it":"","tag":"Theological","scripture_response":"","suggested_framing":"","ccli_modification_note":"","honest_concession":""}]}},"full_analysis":{"paragraphs":["","","",""]},"scripture_map":{"primary":[{"reference":"","connection":""}],"supporting":[{"reference":"","connection":""}]},"theological_nuances":{"affirmed":[{"label":"","note":""}],"flagged":[]},"hymn_lineage":null,"story_behind_song":{"available":true,"publisher_note":null,"items":[{"text":"","source":""}]},"technical":{"themes":[],"sermon_series_fit":[],"seasonal_tags":[],"audience_fit":{"spiritual_maturity":"","age_group":"","service_type":"","visitor_friendliness":"","special_contexts":""}},"set_intelligence":{"available_at_500_songs":true,"pairs_well_with":[],"avoid_pairing_with":[],"set_arc":null},"similar_songs":{"if_you_love_this":[],"if_this_concerns_you":[]}}`
}

function scoreColor(s: number) {
  if (s >= 8.0) return '#2A6010'
  if (s >= 6.5) return '#7A5010'
  if (s >= 5.0) return '#8B3010'
  return '#8B1010'
}
function scoreBg(s: number) {
  if (s >= 8.0) return '#DCEFCF'
  if (s >= 6.5) return '#FEF0CC'
  if (s >= 5.0) return '#FDE0CC'
  return '#FDDADA'
}
function makeSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim()
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AnalyzePage() {
  // Auth
  const [unlocked, setUnlocked] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  // Mode
  const [mode, setMode] = useState<'paste' | 'manual'>('paste')
  const [pasteRaw, setPasteRaw] = useState('')
  const [parsed, setParsed] = useState<ParsedSong | null>(null)
  const [parseMsg, setParseMsg] = useState<{ type: 'ok' | 'warn'; text: string } | null>(null)

  // Manual fields
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [ccli, setCcli] = useState('')
  const [key, setKey] = useState('')
  const [album, setAlbum] = useState('')
  const [lyrics, setLyrics] = useState('')

  // Analysis
  const [analyzing, setAnalyzing] = useState(false)
  const [progressIdx, setProgressIdx] = useState(0)
  const [review, setReview] = useState<ReviewResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('scores')

  // Upload
  const [uploadMsg, setUploadMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // ── Password gate ──
  function handleUnlock() {
    if (pwInput.trim() === ANALYZE_PASSWORD) {
      setUnlocked(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  // ── Parse ──
  function handleParse() {
    const p = smartParse(pasteRaw)
    setParsed(p)
    const missing = []
    if (!p.title) missing.push('title')
    if (!p.artist) missing.push('artist')
    if (!p.lyrics) missing.push('lyrics')
    if (missing.length === 0) {
      setParseMsg({ type: 'ok', text: 'Parsed successfully. Ready to analyze.' })
    } else {
      setParseMsg({ type: 'warn', text: `Could not find: ${missing.join(', ')}. Switch to Manual Fields to fix.` })
    }
  }

  // ── Get active song data ──
  function getSongData(): ParsedSong {
    if (mode === 'paste' && parsed) return parsed
    return { title, artist, ccli, key, album, lyrics }
  }

  function canAnalyze() {
    const d = getSongData()
    return !!(d.title && d.artist && d.lyrics)
  }

  // ── Analyze ──
  async function handleAnalyze() {
    const d = getSongData()
    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    if (!apiKey) { setAnalyzeError('NEXT_PUBLIC_ANTHROPIC_API_KEY not set in environment variables.'); return }

    setAnalyzing(true)
    setAnalyzeError('')
    setReview(null)
    setProgressIdx(0)

    const interval = setInterval(() => {
      setProgressIdx(i => Math.min(i + 1, PROGRESS_STEPS.length - 1))
    }, 3500)

    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          system: 'You are WorshipLens, a theological review assistant for Baptist worship leaders. Analyze worship songs for biblical accuracy, theological clarity, congregational singability, poetic quality, and pastoral defensibility. Use lyrics for analysis only. Never reproduce full lyrics. Never use em dashes.',
          messages: [{ role: 'user', content: buildPrompt(d) }],
        }),
      })

      clearInterval(interval)
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error((err as any)?.error?.message || `API error ${r.status}`)
      }

      const data = await r.json()
      let txt = ''
      for (const b of (data.content || [])) { if (b.type === 'text') txt += b.text }
      txt = txt.replace(/```json/g, '').replace(/```/g, '').trim()
      const js = txt.indexOf('{'), je = txt.lastIndexOf('}')
      if (js >= 0 && je > js) txt = txt.slice(js, je + 1)

      const result = JSON.parse(txt)
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
  async function handleUpload() {
    if (!review) return
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) { setUploadMsg({ type: 'err', text: 'Supabase env vars not configured.' }); return }

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
    const slug = meta.slug || makeSlug(meta.title || fd.title || '')

    const row = {
      title: meta.title || fd.title,
      artist: meta.artist || fd.artist,
      ccli_number: meta.ccli_number || fd.ccli || null,
      slug,
      overall_score: score,
      score_color: colorStr,
      recommendation: review.recommendation || '',
      overall_verdict: review.overall_verdict || '',
      lens_scores,
      key_original: fd.key || meta.key_original || '',
      key_recommended: meta.key_recommended || '',
      time_signature: meta.time_signature || '',
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
      const res = await fetch(`${url}/rest/v1/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(row),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as any).message || `Upload failed ${res.status}`)
      }
      setUploadMsg({ type: 'ok', text: `"${row.title}" uploaded to Supabase successfully.` })
    } catch (e: any) {
      setUploadMsg({ type: 'err', text: e.message })
    }
  }

  function handleReset() {
    setReview(null)
    setParsed(null)
    setParseMsg(null)
    setPasteRaw('')
    setTitle(''); setArtist(''); setCcli(''); setKey(''); setAlbum(''); setLyrics('')
    setAnalyzeError('')
    setUploadMsg(null)
    setMode('paste')
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
    .az-mode-btn { flex: 1; padding: 10px; border: none; font-family: 'Sora', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; cursor: pointer; transition: all 0.15s; }
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
    }
  `

  // ── Password gate ──────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div style={{ fontFamily: "'Sora', sans-serif", background: NAVY, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <style>{styles}</style>
        <nav style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}><LogoWhite height={22} /></Link>
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
            {pwError && (
              <div style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginBottom: 10 }}>Incorrect password.</div>
            )}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 56, maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <LogoWhite height={22} />
          </Link>
          <div className="desktop-nav-links" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Link href="/songs" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Songs</Link>
            <Link href="/about" style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>About</Link>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: BLUE, border: `0.5px solid ${BLUE}`, padding: '3px 10px', borderRadius: 20 }}>Analyzer</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px 80px' }}>

        {/* INPUT FORM */}
        {!review && (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 8 }}>Internal Tool</div>
              <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em' }}>Song Analyzer</h1>
              <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Paste a song export to generate a full WorshipLens review and upload to Supabase.</p>
            </div>

            {/* MODE TOGGLE */}
            <div style={{ display: 'flex', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
              <button className="az-mode-btn" onClick={() => setMode('paste')}
                style={{ background: mode === 'paste' ? 'rgba(255,255,255,0.08)' : 'none', color: mode === 'paste' ? '#fff' : 'rgba(255,255,255,0.35)', borderRight: '0.5px solid rgba(255,255,255,0.12)' }}>
                PASTE ALL
              </button>
              <button className="az-mode-btn" onClick={() => setMode('manual')}
                style={{ background: mode === 'manual' ? 'rgba(255,255,255,0.08)' : 'none', color: mode === 'manual' ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                MANUAL FIELDS
              </button>
            </div>

            {/* PASTE MODE */}
            {mode === 'paste' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                  Paste Song Export
                </label>
                <textarea
                  className="az-input"
                  rows={14}
                  placeholder={'Paste everything here — SongSelect export, WorshipTools dump, or raw copy/paste.\n\nFor example:\n\nTurn Your Eyes\n\nAuthors\nAndrew Holt | Bernie Herms\n\nDefault Key\nC\n\nVerse 1\nO soul are you weary...\n\nCCLI Song # 7158162'}
                  value={pasteRaw}
                  onChange={e => { setPasteRaw(e.target.value); setParsed(null); setParseMsg(null) }}
                  style={{ resize: 'vertical' }}
                />
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Lyrics are used for analysis only. Never stored or displayed.</div>

                <button
                  className="az-btn"
                  style={{ marginTop: 12, marginBottom: 10, background: pasteRaw.trim() ? BLUE : 'rgba(255,255,255,0.08)', color: pasteRaw.trim() ? NAVY : 'rgba(255,255,255,0.25)' }}
                  disabled={!pasteRaw.trim()}
                  onClick={handleParse}
                >
                  Parse Song Data
                </button>

                {parseMsg && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 8,
                    background: parseMsg.type === 'ok' ? '#052e16' : '#2a1f00',
                    border: `0.5px solid ${parseMsg.type === 'ok' ? '#22c55e' : '#fbbf24'}`,
                    color: parseMsg.type === 'ok' ? '#22c55e' : '#fbbf24' }}>
                    {parseMsg.text}
                  </div>
                )}

                {parsed && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>Parsed Fields</div>
                    <div className="az-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[['Title', parsed.title], ['Artist', parsed.artist], ['CCLI #', parsed.ccli], ['Key', parsed.key]].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: val ? 500 : 300, color: val ? '#fff' : 'rgba(255,255,255,0.25)' }}>{val || 'not found'}</div>
                        </div>
                      ))}
                      <div style={{ gridColumn: '1/-1' }}>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Lyrics preview</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{parsed.lyrics.split('\n').slice(0, 3).join(' / ')}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 10 }}>
                      Not right?{' '}
                      <button onClick={() => setMode('manual')} style={{ background: 'none', border: 'none', color: BLUE, fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>
                        Switch to Manual Fields
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MANUAL MODE */}
            {mode === 'manual' && (
              <div style={{ marginBottom: 20 }}>
                <div className="az-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Song Title *</label>
                    <input className="az-input" placeholder="Goodness of God" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Artist / Authors *</label>
                    <input className="az-input" placeholder="Bethel Music, Jenn Johnson" value={artist} onChange={e => setArtist(e.target.value)} />
                  </div>
                </div>
                <div className="az-grid3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>CCLI #</label>
                    <input className="az-input" placeholder="7117726" value={ccli} onChange={e => setCcli(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Default Key</label>
                    <input className="az-input" placeholder="Eb" value={key} onChange={e => setKey(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Album</label>
                    <input className="az-input" placeholder="Victory" value={album} onChange={e => setAlbum(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Lyrics *</label>
                  <textarea className="az-input" rows={12} placeholder="Paste full lyrics here with section labels (Verse 1, Chorus, Bridge...)" value={lyrics} onChange={e => setLyrics(e.target.value)} style={{ resize: 'vertical' }} />
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Lyrics are used for analysis only. Never stored or displayed.</div>
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
        {review && (
          <>
            {/* RESULT HEADER */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingBottom: 20, borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 4 }}>
                  {review.meta?.title || review._formData?.title}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{review.meta?.artist || review._formData?.artist}</div>
                {(review.meta?.ccli_number || review._formData?.ccli) && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>CCLI #{review.meta?.ccli_number || review._formData?.ccli}</div>
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
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="az-upload-btn" onClick={handleUpload}
                  style={{ background: '#052e16', border: '0.5px solid #22c55e', color: '#22c55e' }}>
                  Upload to Supabase
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
      <footer style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <LogoWhite height={18} />
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/songs" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Songs</Link>
            <Link href="/about" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>About</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
