import type { jsPDF as JsPDFType } from 'jspdf'
import { WORDMARK_PNG, WORDMARK_ASPECT, MARK_PNG } from './logo-data'

type RGB = [number, number, number]

const INK: RGB = [26, 32, 44]
const MUTED: RGB = [110, 120, 135]
const RULE: RGB = [205, 212, 222]
const ACCENT: RGB = [0, 122, 175]

const LENSES = [
  { key: 'scriptural_fidelity', label: 'Scriptural Fidelity' },
  { key: 'theological_clarity', label: 'Theological Clarity' },
  { key: 'congregational_singability', label: 'Congregational Singability' },
  { key: 'poetic_lyrical_quality', label: 'Poetic and Lyrical Quality' },
  { key: 'defense_brief', label: 'Defense Brief' },
]

const BLUE: RGB = [0, 181, 255]
const TRACK: RGB = [226, 232, 240]
const CARD_BG: RGB = [244, 247, 251]

function scoreRgb(s: number): RGB {
  if (s >= 8.0) return [42, 96, 16]
  if (s >= 6.5) return [122, 80, 16]
  if (s >= 5.0) return [139, 48, 16]
  return [139, 16, 16]
}

// Brighter fills for the score meters, matching the site's bar colors. Kept
// separate from scoreRgb, which stays dark so printed numerals read cleanly.
function barRgb(s: number): RGB {
  if (s >= 8.0) return [74, 139, 42]
  if (s >= 6.5) return [196, 123, 14]
  if (s >= 5.0) return [196, 80, 32]
  return [196, 32, 32]
}

const SHORT_LABEL: Record<string, string> = {
  scriptural_fidelity: 'Scriptural fidelity',
  theological_clarity: 'Theological clarity',
  congregational_singability: 'Singability',
  poetic_lyrical_quality: 'Poetic quality',
  defense_brief: 'Defense brief',
}

/**
 * Typesets the review from its data rather than screenshotting the page, so
 * the PDF has real selectable text, proper page breaks, and stays legible
 * printed in black and white.
 */
export async function buildReviewPdf(review: any, displayTitle: string) {
  const { jsPDF } = await import('jspdf')
  const doc: JsPDFType = new jsPDF({ unit: 'pt', format: 'letter', compress: true })

  const PW = doc.internal.pageSize.getWidth()
  const PH = doc.internal.pageSize.getHeight()
  const M = 56
  const CW = PW - M * 2
  let y = M

  const meta = review?.meta || {}
  const fd = review?._formData || {}

  function room(need: number) {
    if (y + need > PH - M - 28) {
      doc.addPage()
      y = M
      return true
    }
    return false
  }

  function write(
    str: string,
    opts: { size?: number; style?: 'normal' | 'bold' | 'italic'; color?: RGB; indent?: number; gap?: number; lead?: number } = {},
  ) {
    if (!str) return
    const { size = 10, style = 'normal', color = INK, indent = 0, gap = 6, lead = 1.42 } = opts
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
    doc.setTextColor(color[0], color[1], color[2])
    const lines = doc.splitTextToSize(String(str), CW - indent) as string[]
    for (const line of lines) {
      room(size * lead)
      doc.text(line, M + indent, y)
      y += size * lead
    }
    y += gap
  }

  function heading(label: string) {
    room(40)
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2])
    doc.text(label.toUpperCase(), M, y)
    y += 8
    doc.setDrawColor(RULE[0], RULE[1], RULE[2])
    doc.setLineWidth(0.5)
    doc.line(M, y, M + CW, y)
    y += 16
  }

  function keyValue(label: string, value: string) {
    if (!value) return
    room(20)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
    doc.text(label, M, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(INK[0], INK[1], INK[2])
    const lines = doc.splitTextToSize(String(value), CW - 150) as string[]
    lines.forEach((line, i) => {
      if (i > 0) { room(14); y += 14 }
      doc.text(line, M + 150, y)
    })
    y += 18
  }

  // ---- Branded header -----------------------------------------------------
  const top = M

  // Brand wordmark: the official logo, embedded as a raster so it prints and
  // renders identically everywhere. Falls back to a typeset wordmark if the
  // image cannot be added.
  // Tight-cropped wordmark: its left edge is the "W", so placing it at M lines
  // the logo up exactly with the body text margin.
  const logoH = 25.3
  const logoW = logoH * WORDMARK_ASPECT
  try {
    doc.addImage(WORDMARK_PNG, 'PNG', M, top - 2, logoW, logoH)
  } catch {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.setTextColor(BLUE[0], BLUE[1], BLUE[2])
    doc.text('Worship', M, top + 20)
    const wWorship = doc.getTextWidth('Worship')
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
    doc.text('Lens', M + wWorship, top + 20)
  }

  // Overall score + verdict label, flush right
  const score = Number(review?.overall_score || 0)
  const sc = scoreRgb(score)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(34)
  doc.setTextColor(sc[0], sc[1], sc[2])
  doc.text(score.toFixed(1), PW - M, top + 24, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(sc[0], sc[1], sc[2])
  doc.text(String(review?.recommendation || '').toUpperCase(), PW - M, top + 40, { align: 'right' })

  // Mini score meters: one bar per scored lens. Excluded lenses (e.g. melodic
  // Singability on a lyrics-only review) are dropped, matching the site card.
  const meters = LENSES
    .map(l => ({ l, d: review?.lenses?.[l.key] }))
    .filter(({ d }) => d && !(d.excluded === true || d.score === null || d.score === undefined))
    .map(({ l, d }) => ({ short: SHORT_LABEL[l.key] || l.label, score: Number(d.score || 0) }))

  const cardW = 250
  const cardX = PW - M - cardW
  const cardY = top + 54
  const rowH = 16
  const cardH = meters.length ? 12 + meters.length * rowH + 8 : 0
  if (meters.length) {
    doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2])
    doc.roundedRect(cardX, cardY, cardW, cardH, 6, 6, 'F')
    const trackX = cardX + 108
    const trackW = cardW - 108 - 34
    meters.forEach((m, i) => {
      const cy = cardY + 12 + i * rowH + 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
      doc.text(m.short, cardX + 12, cy + 2)
      doc.setFillColor(TRACK[0], TRACK[1], TRACK[2])
      doc.roundedRect(trackX, cy - 1, trackW, 3, 1.5, 1.5, 'F')
      const b = barRgb(m.score)
      doc.setFillColor(b[0], b[1], b[2])
      doc.roundedRect(trackX, cy - 1, Math.max(2, trackW * Math.min(1, m.score / 10)), 3, 1.5, 1.5, 'F')
      const nc = scoreRgb(m.score)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(nc[0], nc[1], nc[2])
      doc.text(m.score.toFixed(1), cardX + cardW - 12, cy + 2, { align: 'right' })
    })
  }

  // Title block on the left, below the wordmark, kept clear of the meter card
  const leftColW = cardX - M - 20
  let ly = top + 64
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(BLUE[0], BLUE[1], BLUE[2])
  doc.text('SONG REVIEW', M, ly)
  ly += 22
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(INK[0], INK[1], INK[2])
  const titleLines = doc.splitTextToSize(displayTitle || 'Untitled song', leftColW) as string[]
  for (const line of titleLines) {
    doc.text(line, M, ly)
    ly += 26
  }
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
  doc.text(meta.artist || fd.artist || 'Artist unknown', M, ly)

  // Continue below whichever column is taller
  y = Math.max(ly, meters.length ? cardY + cardH : 0) + 24
  doc.setDrawColor(RULE[0], RULE[1], RULE[2])
  doc.setLineWidth(0.5)
  doc.line(M, y, M + CW, y)
  y += 20

  if (review?.overall_verdict) {
    write(review.overall_verdict, { size: 11, style: 'italic', color: [70, 80, 95], gap: 10 })
  }

  if (meta.scoring_mode === 'lyrics_only') {
    write(
      'Lyrics-only review. This score reflects four lenses. Congregational Singability is a melodic judgement and is not applied to a lyric sheet, so it is excluded from the average rather than scored on assumptions.',
      { size: 8.5, color: MUTED, lead: 1.4, gap: 8 },
    )
  }

  // ---- Lens scores --------------------------------------------------------
  heading('Scores')
  for (const l of LENSES) {
    const d = review?.lenses?.[l.key]
    if (!d) continue

    // A lyrics-only review has no melody to judge, so this lens prints as not
    // scored rather than carrying a number that was never earned.
    const excluded = d.excluded === true || d.score === null || d.score === undefined
    if (excluded) {
      room(48)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
      doc.text(l.label, M, y)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text('NOT SCORED', PW - M, y, { align: 'right' })
      y += 15
      write(
        d.summary || 'Melodic criteria are not evaluated in a lyrics-only review.',
        { size: 9.5, style: 'italic', color: MUTED, gap: 12 },
      )
      continue
    }

    room(56)
    const ls = Number(d.score || 0)
    const lc = scoreRgb(ls)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(INK[0], INK[1], INK[2])
    doc.text(l.label, M, y)
    doc.setTextColor(lc[0], lc[1], lc[2])
    doc.text(ls.toFixed(1), PW - M, y, { align: 'right' })
    y += 15
    if (d.deduction_line) write(d.deduction_line, { size: 9, style: 'italic', color: MUTED, gap: 3 })
    if (d.summary) write(d.summary, { size: 10, gap: 12 })
  }

  // ---- Full analysis ------------------------------------------------------
  const paras = (review?.full_analysis?.paragraphs || []).filter(Boolean)
  if (paras.length) {
    heading('Full Review')
    for (const p of paras) write(p, { size: 10.5, gap: 10 })
  }

  // ---- Scripture ----------------------------------------------------------
  const scripture = [
    ...(review?.scripture_map?.primary || []),
    ...(review?.scripture_map?.supporting || []),
  ].filter((r: any) => r?.reference)
  if (scripture.length) {
    heading('Scripture Map')
    for (const r of scripture) {
      room(30)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(INK[0], INK[1], INK[2])
      doc.text(r.reference, M, y)
      y += 13
      write(r.connection || '', { size: 9.5, color: [70, 80, 95], indent: 14, gap: 8 })
    }
  }

  // ---- Theological nuances ------------------------------------------------
  const affirmed = review?.theological_nuances?.affirmed || []
  const flagged = review?.theological_nuances?.flagged || []
  if (affirmed.length || flagged.length) {
    heading('Theological Nuances')
    for (const n of affirmed) {
      write(`Affirmed - ${n.label}`, { size: 10, style: 'bold', gap: 2 })
      write(n.note || '', { size: 9.5, color: [70, 80, 95], indent: 14, gap: 8 })
    }
    for (const n of flagged) {
      write(`Flagged - ${n.label}`, { size: 10, style: 'bold', gap: 2 })
      write(n.note || '', { size: 9.5, color: [70, 80, 95], indent: 14, gap: 8 })
    }
  }

  // ---- Defense brief ------------------------------------------------------
  const objections = review?.lenses?.defense_brief?.objections || []
  if (objections.length) {
    heading('Defense Brief')
    if (review?.lenses?.defense_brief?.summary) {
      write(review.lenses.defense_brief.summary, { size: 10, style: 'italic', color: [70, 80, 95], gap: 12 })
    }
    for (const o of objections) {
      if (!o?.objection) continue
      write(o.objection, { size: 10.5, style: 'bold', gap: 3 })
      if (o.who_raises_it) write(`Raised by: ${o.who_raises_it}`, { size: 9, style: 'italic', color: MUTED, gap: 4 })
      if (o.suggested_framing) write(o.suggested_framing, { size: 10, gap: 4 })
      if (o.scripture_response) write(o.scripture_response, { size: 9.5, color: [42, 96, 16], gap: 4 })
      if (o.honest_concession) write(`Concession: ${o.honest_concession}`, { size: 9.5, style: 'italic', color: [139, 48, 16], gap: 12 })
    }
  }

  // ---- Technical ----------------------------------------------------------
  heading('Technical')
  const sing = review?.lenses?.congregational_singability || {}
  keyValue('Original key', sing.key_original || meta.key_original || fd.key || '')
  keyValue('Recommended key', sing.key_recommended || meta.key_recommended || '')
  keyValue('Original range', sing.range_original || '')
  keyValue('Recommended range', sing.range_recommended || '')
  keyValue('Time signature', meta.time_signature || '')
  keyValue('Tempo', meta.tempo_bpm ? `${meta.tempo_bpm} BPM` : '')
  keyValue('Syllable pattern', meta.meter_pattern || '')
  keyValue('Hymn meter', meta.meter_name || '')
  keyValue('Poetic foot', meta.poetic_foot || '')
  keyValue('Genre', meta.genre || '')
  keyValue('Album', meta.album || fd.album || '')
  keyValue('CCLI #', meta.ccli_number || fd.ccli || '')

  if (meta.time_signature_reasoning) {
    y += 4
    write('Meter analysis', { size: 10, style: 'bold', gap: 3 })
    write(meta.time_signature_reasoning, { size: 9.5, color: [70, 80, 95], gap: 10 })
  }

  const themes = review?.technical?.themes || []
  if (themes.length) keyValue('Themes', themes.join(', '))

  const fit = review?.technical?.audience_fit
  if (fit) {
    y += 4
    write('Audience fit', { size: 10, style: 'bold', gap: 5 })
    keyValue('Spiritual maturity', fit.spiritual_maturity || '')
    keyValue('Age group', fit.age_group || '')
    keyValue('Service type', fit.service_type || '')
    keyValue('Visitor friendliness', fit.visitor_friendliness || '')
    keyValue('Special contexts', fit.special_contexts || '')
  }

  // ---- Story --------------------------------------------------------------
  const story = (review?.story_behind_song?.items || []).filter((i: any) => i?.text)
  if (story.length) {
    heading('Story Behind the Song')
    for (const item of story) {
      write(item.text, { size: 10, gap: 3 })
      if (item.source) write(`Source: ${item.source}`, { size: 8.5, style: 'italic', color: MUTED, gap: 10 })
    }
  }

  // ---- Notice -------------------------------------------------------------
  // Kept as one block at the end so it travels with the document wherever it
  // gets forwarded, rather than only living on the page it was made from.
  room(96)
  y += 12
  doc.setDrawColor(RULE[0], RULE[1], RULE[2])
  doc.setLineWidth(0.5)
  doc.line(M, y, M + CW, y)
  y += 12

  write('Analysis by WorshipLens - worshiplens.com', { size: 7, style: 'bold', color: MUTED, gap: 2 })
  write(
    'The WorshipLens five-lens review framework, scoring criteria, and evaluative language were created and written by Ludwingk Rios. Copyright 2026 Ludwingk Rios. All rights reserved.',
    { size: 6.5, color: MUTED, lead: 1.3, gap: 5 },
  )
  write(
    'Song lyrics are not reproduced in this report. Brief excerpts appear only as needed for commentary and criticism. All songs remain the property of their respective copyright holders; reproducing or projecting lyrics requires a valid CCLI or publisher license.',
    { size: 6.5, color: MUTED, lead: 1.3, gap: 5 },
  )
  write(
    'Scores and commentary are editorial opinion offered to support pastoral discernment, not statements of fact about any songwriter, publisher, or congregation.',
    { size: 6.5, color: MUTED, lead: 1.3, gap: 2 },
  )

  // ---- Page furniture -----------------------------------------------------
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setDrawColor(RULE[0], RULE[1], RULE[2])
    doc.setLineWidth(0.5)
    doc.line(M, PH - M + 12, PW - M, PH - M + 12)
    // Official brand mark
    const markS = 11
    try {
      doc.addImage(MARK_PNG, 'PNG', M, PH - M + 16, markS, markS)
    } catch {
      doc.setFillColor(BLUE[0], BLUE[1], BLUE[2])
      doc.circle(M + 5, PH - M + 21, 4, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2])
    doc.text('worshiplens.com', M + markS + 6, PH - M + 25)
    doc.text(`Page ${i} of ${pages}`, PW - M, PH - M + 25, { align: 'right' })
  }

  return doc
}

export function pdfFilename(title: string) {
  const base = (title || 'worshiplens-review')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'worshiplens-review'
  return `${base}-worshiplens.pdf`
}
