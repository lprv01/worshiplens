'use client'

// Shared presentation pieces used by both the admin analyzer (/analyze) and
// the guest analyzer (/guest). Kept in one place so the two pages cannot
// drift apart visually or in how they read a pasted song.

export const NAVY = '#0D1B2A'
export const BLUE = '#00b5ff'

export type ParsedSong = {
  title: string
  artist: string
  ccli: string
  key: string
  album: string
  timeSignature: string
  themes: string
  email: string
  lyrics: string
}
export type MetaKey = 'title' | 'artist' | 'ccli' | 'key' | 'album' | 'timeSignature' | 'themes' | 'email'
export type ReviewResult = Record<string, any>
export type TabKey = 'scores' | 'review' | 'defense' | 'technical' | 'story' | 'similar'

// CCLI and album no longer have inputs, but the parser still recovers them
// from a pasted export and the analysis still returns them - dropping the
// fields only removes the manual entry, not the data.
export const META_FIELDS: {
  key: MetaKey
  label: string
  placeholder: string
  span?: number
  generate?: 'title' | 'meter' | 'themes'
  note?: string
}[] = [
  { key: 'title', label: 'Song Title', placeholder: 'Goodness of God', span: 3, generate: 'title' },
  { key: 'artist', label: 'Name or Author(s)', placeholder: 'Bethel Music, Jenn Johnson', span: 3 },
  { key: 'key', label: 'Key (optional)', placeholder: 'Eb', span: 3 },
  { key: 'timeSignature', label: 'Time Signature (optional)', placeholder: 'Leave blank to recommend', span: 3, generate: 'meter' },
  { key: 'themes', label: 'Key Themes / Scriptures (optional)', placeholder: 'Matthew 5:6, mercy, hunger for righteousness', span: 3, generate: 'themes' },
  { key: 'email', label: 'Your Email (optional)', placeholder: 'you@example.com', span: 3, note: 'Never shared or published. Used only to reach you about your song.' },
]

export const LENS_CONFIG = [
  { key: 'scriptural_fidelity', label: 'Scriptural Fidelity', color: '#22c55e', bg: '#052e16' },
  { key: 'theological_clarity', label: 'Theological Clarity', color: '#a78bfa', bg: '#1e1035' },
  { key: 'congregational_singability', label: 'Singability', color: '#60a5fa', bg: '#0f1e3a' },
  { key: 'poetic_lyrical_quality', label: 'Poetic Quality', color: '#fb923c', bg: '#2a0f00' },
  { key: 'defense_brief', label: 'Defense Brief', color: '#f472b6', bg: '#2a0f1a' },
]

export const PROGRESS_STEPS = [
  'Reading through the lyrics...',
  'Checking Scripture references...',
  'Evaluating theological clarity...',
  'Analyzing singability and range...',
  'Assessing poetic quality...',
  'Preparing the defense brief...',
  'Building the full review...',
  'Finalizing scores...',
]

// ── Logo (copied from existing pages) ───────────────────────────────────────
export function LogoWhite({ height = 22 }: { height?: number }) {
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

// ── Smart Parser ─────────────────────────────────────────────────────────────
// Only claims a title when the paste shows real export structure (an Authors
// header, a pipe-separated credit line, a CCLI number, or a Default Key). A
// bare lyric dump gets no invented title - the first line of a chorus is not
// a song title, and guessing one poisons the analysis downstream.
export const EMPTY_PARSE: ParsedSong = { title: '', artist: '', ccli: '', key: '', album: '', timeSignature: '', themes: '', email: '', lyrics: '' }

export function smartParse(raw: string): ParsedSong {
  if (!raw.trim()) return EMPTY_PARSE

  const lines = raw.split('\n').map(l => l.trim())
  let title = '', artist = '', ccli = '', key = '', album = '', timeSignature = '', lyrics = ''
  const themes = ''   // author-supplied only; never inferred from the paste
  const email = ''    // contact detail, never parsed out of a lyric sheet

  const ccliMatch = raw.match(/CCLI\s*(?:Song\s*)?#\s*(\d{5,8})/i) ||
    raw.match(/Song\s+Number\s*\n\s*(\d{5,8})/i)
  if (ccliMatch) ccli = ccliMatch[1]

  const keyMatch = raw.match(/Default\s+Key\s*[:\n]\s*([A-Ga-g][#bB]?[Mm]?)\b/i) ||
    raw.match(/^\s*Key\s*[:\n]\s*([A-Ga-g][#bB]?[Mm]?)\b/im)
  if (keyMatch) key = keyMatch[1].trim()

  const albumMatch = raw.match(/^\s*Album\s*[:\n]\s*(.+)$/im)
  if (albumMatch) album = albumMatch[1].trim()

  const timeMatch = raw.match(/(?:Time\s*Sig(?:nature)?|Meter)\s*[:\n]\s*(\d{1,2}\s*\/\s*\d{1,2})/i)
  if (timeMatch) timeSignature = timeMatch[1].replace(/\s+/g, '')

  const pipeLine = lines.find(l => l.includes(' | ') && !l.includes('ccli.com') && !l.startsWith('©'))
  if (pipeLine) {
    artist = pipeLine.split('|').map(a => a.trim()).filter(Boolean).join(', ')
  }

  const authIdx = lines.findIndex(l => /^authors?$/i.test(l))
  if (!artist && authIdx >= 0) {
    const nameLines: string[] = []
    for (let i = authIdx + 1; i < Math.min(authIdx + 6, lines.length); i++) {
      const l = lines[i]
      if (!l || /^(song number|default key|album|time sig|meter|ccli|verse|chorus|bridge|pre|tag|add to)/i.test(l)) break
      nameLines.push(l)
    }
    if (nameLines.length) {
      artist = nameLines.join(' ').replace(/([a-z])([A-Z])/g, '$1, $2').trim()
    }
  }

  // Structural evidence that this is an export and not a bare lyric dump.
  const structured = !!(ccli || key || album || pipeLine || authIdx >= 0)

  const skipWords = /^(authors?|song number|default key|album|time sig|meter|key|ccli|add to|verse|chorus|bridge|pre-?chorus|tag|ending|interlude|refrain|hook|for use|planning by|©)/i
  if (structured) {
    for (const line of lines) {
      if (line && !skipWords.test(line) && line.length > 1 && line.length < 80 && !/^\d+$/.test(line)) {
        title = line
        break
      }
    }
  }

  const sectionPattern = /^(verse|chorus|bridge|pre-?chorus|tag|ending|interlude|refrain|hook)\b/i
  const footerPattern = /^(ccli song|for use solely|planning by|©|last edited|delete|clone|busy|apple and|build|media player)/i

  if (structured) {
    // An export has a metadata header to skip past. Start at the first section
    // label, stop at the footer.
    const lyricsLines: string[] = []
    let inLyrics = false
    for (const line of lines) {
      if (sectionPattern.test(line)) inLyrics = true
      if (inLyrics && footerPattern.test(line)) break
      if (inLyrics) lyricsLines.push(line)
    }
    lyrics = lyricsLines.join('\n').trim()

    // No section labels in the export: take everything after the title line.
    if (!lyrics) {
      let pastHeader = false
      const rawLyrics: string[] = []
      for (const line of lines) {
        if (!pastHeader && title && line === title) { pastHeader = true; continue }
        if (!pastHeader) continue
        if (footerPattern.test(line)) break
        if (/^(authors?|song number|default key|album|time sig|meter|add to worshiptools)/i.test(line)) continue
        rawLyrics.push(line)
      }
      lyrics = rawLyrics.join('\n').trim()
    }
  }

  // Unstructured paste: there is no header to skip, so the whole thing is the
  // lyric. Section-scanning here would silently eat any verse that appears
  // before the first section label.
  if (!lyrics) {
    lyrics = lines
      .filter(l => !footerPattern.test(l))
      .join('\n')
      .trim()
  }

  return { title, artist, ccli, key, album, timeSignature, themes, email, lyrics }
}

export function scoreColor(s: number) {
  if (s >= 8.0) return '#2A6010'
  if (s >= 6.5) return '#7A5010'
  if (s >= 5.0) return '#8B3010'
  return '#8B1010'
}
export function scoreBg(s: number) {
  if (s >= 8.0) return '#DCEFCF'
  if (s >= 6.5) return '#FEF0CC'
  if (s >= 5.0) return '#FDE0CC'
  return '#FDDADA'
}
export function makeSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim()
}


// ── Meter explainer ──────────────────────────────────────────────────────────
// Collapsed by default. Explains how a syllable pattern plus a stress pattern
// implies a time signature, which is otherwise opaque to anyone who has not
// worked with hymn meter.
export const METER_PATTERNS = [
  { pattern: '8.6.8.6', name: 'Common Meter (CM)', foot: 'iambic', sig: '4/4', example: 'Amazing Grace; O God Our Help in Ages Past' },
  { pattern: '8.8.8.8', name: 'Long Meter (LM)', foot: 'iambic', sig: '4/4', example: 'When I Survey the Wondrous Cross' },
  { pattern: '6.6.8.6', name: 'Short Meter (SM)', foot: 'iambic', sig: '4/4', example: 'Blest Be the Tie That Binds' },
  { pattern: '8.7.8.7', name: 'no classic name', foot: 'trochaic', sig: '4/4', example: 'Come Thou Fount of Every Blessing' },
  { pattern: '11.11.11.11', name: 'no classic name', foot: 'anapestic', sig: '6/8 or 3/4', example: 'How Firm a Foundation' },
  { pattern: 'irregular', name: 'non-metrical', foot: 'irregular', sig: '4/4', example: 'most contemporary worship writing' },
]

export function MeterHelp() {
  return (
    <details className="az-details">
      <summary className="az-summary">How is a time signature calculated?</summary>
      <div style={{ paddingTop: 12, fontSize: 12, lineHeight: 1.75, color: 'rgba(255,255,255,0.45)' }}>
        <p style={{ marginBottom: 12 }}>
          Two things about a lyric decide how it wants to be counted: how many syllables each line has, and where the stresses fall inside them.
        </p>

        <p style={{ marginBottom: 6, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Step one - count syllables per line.</p>
        <p style={{ marginBottom: 12 }}>
          Write the count for each line of one stanza. Amazing Grace gives 8, 6, 8, 6:
        </p>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '10px 14px', marginBottom: 12, fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>
          A-maz-ing grace how sweet the sound &nbsp;<span style={{ color: BLUE }}>8</span><br />
          That saved a wretch like me &nbsp;<span style={{ color: BLUE }}>6</span><br />
          I once was lost but now am found &nbsp;<span style={{ color: BLUE }}>8</span><br />
          Was blind but now I see &nbsp;<span style={{ color: BLUE }}>6</span>
        </div>
        <p style={{ marginBottom: 12 }}>
          That 8.6.8.6 pattern is so common in English hymnody it has a name: Common Meter. It is why any Common Meter text can be sung to any Common Meter tune, which is how House of the Rising Sun and Amazing Grace trade melodies.
        </p>

        <p style={{ marginBottom: 6, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Step two - find the stress pattern.</p>
        <p style={{ marginBottom: 12 }}>
          Say a line aloud and listen for the beat. <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Iambic</strong> is da-DUM (a-MAZ-ing GRACE how SWEET the SOUND). <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Trochaic</strong> is the reverse, DUM-da (COME thou FOUNT of EV-ery BLESS-ing). <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Dactylic</strong> and <strong style={{ color: 'rgba(255,255,255,0.6)' }}>anapestic</strong> feet carry three syllables instead of two, which is what gives a lyric its lilt or waltz feel.
        </p>

        <p style={{ marginBottom: 6, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Step three - map the foot to a signature.</p>
        <p style={{ marginBottom: 12 }}>
          Two-syllable feet (iambic, trochaic) sit naturally in a duple count, so they default to 4/4. Three-syllable feet (dactylic, anapestic) push toward a triple count, so 6/8 or 3/4.
        </p>

        <div style={{ overflowX: 'auto', marginBottom: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 460 }}>
            <thead>
              <tr style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px 6px 0', fontWeight: 600 }}>Syllables</th>
                <th style={{ padding: '6px 8px', fontWeight: 600 }}>Meter</th>
                <th style={{ padding: '6px 8px', fontWeight: 600 }}>Foot</th>
                <th style={{ padding: '6px 8px', fontWeight: 600 }}>Signature</th>
              </tr>
            </thead>
            <tbody>
              {METER_PATTERNS.map(m => (
                <tr key={m.pattern} style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
                  <td style={{ padding: '7px 8px 7px 0', fontFamily: 'ui-monospace, monospace', color: 'rgba(255,255,255,0.6)' }}>{m.pattern}</td>
                  <td style={{ padding: '7px 8px' }}>{m.name}</td>
                  <td style={{ padding: '7px 8px', textTransform: 'capitalize' }}>{m.foot}</td>
                  <td style={{ padding: '7px 8px', color: BLUE, fontWeight: 600 }}>{m.sig}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)' }}>
          The table is a starting point, not a rule. Amazing Grace scans as iambic Common Meter, which points to 4/4, but almost every congregation sings it in 3/4 because the New Britain tune carries a triple pulse. Where a well-known tune disagrees with the pattern, the tune wins - and the analysis will say so in its reasoning.
        </p>
      </div>
    </details>
  )
}

// ── Detail fields block ──────────────────────────────────────────────────────
// Shared by both analyzers so the two forms cannot drift.
export function DetailFields(props: {
  fieldValue: (k: MetaKey) => string
  isAutoFilled: (k: MetaKey) => boolean
  setField: (k: MetaKey, v: string) => void
  onReset: () => void
  hasEdits: boolean
  onGenerate: (kind: 'title' | 'meter' | 'themes') => void
  generating: 'title' | 'meter' | 'themes' | null
  canGenerate: boolean
  titleOptions: string[]
  onPickTitle: (t: string) => void
  meterNote: string
  onClear: (kind: 'meter' | 'themes') => void
  genError: string
}) {
  const {
    fieldValue, isAutoFilled, setField, onReset, hasEdits,
    onGenerate, generating, canGenerate, titleOptions, onPickTitle, meterNote, onClear, genError,
  } = props

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
          Details <span style={{ color: 'rgba(255,255,255,0.25)' }}>- all optional</span>
        </div>
      </div>

      <div className="az-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {META_FIELDS.map(f => (
          <div key={f.key} style={{ gridColumn: `span ${f.span || 2}` }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6, minHeight: 18 }}>
              <span>{f.label}</span>
              {isAutoFilled(f.key) && <span className="az-auto-chip">Detected</span>}
              {f.generate && (
                <button
                  type="button"
                  className="az-gen-btn"
                  disabled={!canGenerate || generating !== null}
                  title={canGenerate ? undefined : 'Paste the lyrics first'}
                  onClick={() => onGenerate(f.generate!)}
                >
                  {generating === f.generate
                    ? 'Working...'
                    : f.generate === 'title'
                      ? 'Generate Song Title'
                      : f.generate === 'meter'
                        ? 'Suggest from poetic rhythm'
                        : 'Suggest from song lyrics'}
                </button>
              )}
              {(f.generate === 'meter' || f.generate === 'themes')
                && generating === null
                && (fieldValue(f.key) || (f.generate === 'meter' && meterNote)) && (
                <button type="button" className="az-clear-btn" onClick={() => onClear(f.generate as 'meter' | 'themes')}>
                  Clear
                </button>
              )}
            </label>
            <input
              className="az-input"
              placeholder={f.placeholder}
              value={fieldValue(f.key)}
              onChange={e => setField(f.key, e.target.value)}
              style={isAutoFilled(f.key) ? { borderColor: 'rgba(0,181,255,0.35)' } : undefined}
            />

            {f.key === 'title' && titleOptions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {titleOptions.map(t => (
                  <button key={t} type="button" className="az-title-chip" onClick={() => onPickTitle(t)}>{t}</button>
                ))}
              </div>
            )}

            {f.note && (
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.28)', marginTop: 5, lineHeight: 1.55 }}>
                {f.note}
              </div>
            )}

            {f.key === 'timeSignature' && meterNote && (
              <div style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.45)', background: 'rgba(0,181,255,0.05)', border: '0.5px solid rgba(0,181,255,0.2)', borderRadius: 6, padding: '9px 12px', whiteSpace: 'pre-line' }}>
                {meterNote}
              </div>
            )}
          </div>
        ))}
      </div>

      {genError && (
        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 6, fontSize: 12, background: '#1a0505', border: '0.5px solid #f87171', color: '#f87171' }}>
          {genError}
        </div>
      )}

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 12, lineHeight: 1.6 }}>
        Leave it blank and WorshipLens recommends one from the lyric meter, with its reasoning in the Technical tab.
      </div>
      <div style={{ marginTop: 8 }}>
        <MeterHelp />
      </div>
    </div>
  )
}
