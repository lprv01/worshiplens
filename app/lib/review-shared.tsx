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
  lyrics: string
}
export type MetaKey = 'title' | 'artist' | 'ccli' | 'key' | 'album' | 'timeSignature'
export type ReviewResult = Record<string, any>
export type TabKey = 'scores' | 'review' | 'defense' | 'technical' | 'story' | 'similar'

export const META_FIELDS: { key: MetaKey; label: string; placeholder: string; span?: number }[] = [
  { key: 'title', label: 'Song Title', placeholder: 'Goodness of God', span: 3 },
  { key: 'artist', label: 'Artist / Authors', placeholder: 'Bethel Music, Jenn Johnson', span: 3 },
  { key: 'ccli', label: 'CCLI #', placeholder: '7117726', span: 2 },
  { key: 'key', label: 'Default Key', placeholder: 'Eb', span: 2 },
  { key: 'album', label: 'Album', placeholder: 'Victory', span: 2 },
  { key: 'timeSignature', label: 'Time Signature', placeholder: 'Leave blank to recommend', span: 2 },
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
export const EMPTY_PARSE: ParsedSong = { title: '', artist: '', ccli: '', key: '', album: '', timeSignature: '', lyrics: '' }

export function smartParse(raw: string): ParsedSong {
  if (!raw.trim()) return EMPTY_PARSE

  const lines = raw.split('\n').map(l => l.trim())
  let title = '', artist = '', ccli = '', key = '', album = '', timeSignature = '', lyrics = ''

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

  return { title, artist, ccli, key, album, timeSignature, lyrics }
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

