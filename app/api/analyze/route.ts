import { NextRequest, NextResponse } from 'next/server'

const ANALYZE_PASSWORD = process.env.ANALYZE_PASSWORD
const GUEST_PASSWORD = process.env.GUEST_PASSWORD
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL
// onboarding@resend.dev works with no domain setup but only delivers to the
// Resend account owner. Swap to a worshiplens.com sender once verified.
const RESEND_FROM = process.env.RESEND_FROM || 'WorshipLens <onboarding@resend.dev>'

// The public site origin, resolved from the incoming request. On Vercel the
// browser fetch carries an Origin header; fall back to the forwarded host.
function siteOrigin(req: NextRequest): string {
  const origin = req.headers.get('origin')
  if (origin) return origin
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (host) return `${proto}://${host}`
  try { return new URL(req.url).origin } catch { return '' }
}

function makeSlug(title: string): string {
  return String(title || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim()
}

// Rebuilds the public `songs` row from a stored submission review. Mirrors the
// admin analyzer's upload row exactly so an approved submission lands in the
// library identical to an admin-uploaded song.
function buildSongRowFromReview(review: any): any {
  const meta = review?.meta || {}
  const score = review?.overall_score || 0
  const lenses = review?.lenses || {}
  const lens_scores = {
    scriptural_fidelity: lenses.scriptural_fidelity?.score || 0,
    theological_clarity: lenses.theological_clarity?.score || 0,
    congregational_singability: lenses.congregational_singability?.score || 0,
    poetic_lyrical_quality: lenses.poetic_lyrical_quality?.score || 0,
    defense_brief: lenses.defense_brief?.score || 0,
  }
  const colorStr = score >= 8 ? 'green' : score >= 6.5 ? 'amber' : score >= 5 ? 'orange' : 'red'
  const effectiveTitle = meta.title || ''
  const slug = makeSlug(effectiveTitle) || meta.slug || `untitled-${score.toFixed(1).replace('.', '')}`
  return {
    title: effectiveTitle || 'Untitled song',
    artist: meta.artist || 'Unknown',
    ccli_number: meta.ccli_number || null,
    slug,
    overall_score: score,
    score_color: colorStr,
    recommendation: review?.recommendation || '',
    overall_verdict: review?.overall_verdict || '',
    lens_scores,
    key_original: meta.key_original || '',
    key_recommended: meta.key_recommended || '',
    time_signature: meta.time_signature || '',
    tempo_bpm: meta.tempo_bpm || null,
    copyright: meta.copyright || '',
    release_year: meta.release_year || '',
    album: meta.album || '',
    genre: meta.genre || '',
    hymn_lineage_badge: meta.hymn_lineage_badge || null,
    lenses: review?.lenses || {},
    full_analysis: review?.full_analysis || {},
    scripture_map: review?.scripture_map || {},
    theological_nuances: review?.theological_nuances || {},
    hymn_lineage: review?.hymn_lineage || null,
    story_behind_song: review?.story_behind_song || {},
    technical: review?.technical || {},
    set_intelligence: review?.set_intelligence || {},
    similar_songs: review?.similar_songs || {},
    themes: review?.technical?.themes || [],
    seasonal_tags: review?.technical?.seasonal_tags || [],
  }
}

function escapeHtml(s: string): string {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

// Branded welcome email sent to a requester when their Song Analyzer access is
// granted. Inline styles only, and images referenced by absolute URL so they
// resolve in mail clients. Matches the site's navy/blue branding.
function accessWelcomeHtml(origin: string, name: string): string {
  const hi = name ? `Hi ${escapeHtml(name)},` : 'Hi there,'
  return `<div style="margin:0;padding:0;background:#eef2f7;">
  <div style="max-width:480px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="background:#0D1B2A;padding:22px 24px;text-align:center;">
        <img src="${origin}/wordmark.png" alt="WorshipLens" height="26" style="height:26px;display:inline-block;border:0;" />
      </div>
      <div style="padding:26px 24px;color:#1a2432;">
        <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">${hi}</p>
        <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Thank you for requesting access to the WorshipLens Song Analyzer.</p>
        <p style="font-size:15px;line-height:1.7;color:#42505f;margin:0 0 22px;">What the Church sings shapes what it believes. WorshipLens exists on a simple conviction: to understand the songs we sing through a biblical lens, so leaders and songwriters can choose and write songs that faithfully reflect the truth of Scripture.</p>
        <div style="background:#f4f7fb;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center;margin:0 0 20px;">
          <div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7a8a9a;margin-bottom:6px;">Your access code</div>
          <div style="font-family:'Courier New',monospace;font-size:20px;font-weight:bold;color:#0D1B2A;">worshipguest</div>
        </div>
        <div style="text-align:center;margin:0 0 26px;">
          <a href="${origin}/analyze" style="display:inline-block;background:#00b5ff;color:#0D1B2A;font-size:14px;font-weight:bold;text-decoration:none;padding:13px 26px;border-radius:10px;">Open the Song Analyzer &rarr;</a>
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid #eef2f7;padding-top:18px;width:100%;"><tr>
          <td style="padding:18px 12px 0 0;width:44px;vertical-align:middle;"><img src="${origin}/headshot-email.jpg" alt="Ludwingk Rios" width="44" height="44" style="width:44px;height:44px;border-radius:50%;display:block;border:0;" /></td>
          <td style="padding-top:18px;vertical-align:middle;"><div style="font-size:14px;font-weight:bold;color:#0D1B2A;">Ludwingk Rios</div><div style="font-size:12px;color:#7a8a9a;">Worship Leader, Musician, Editor</div></td>
        </tr></table>
      </div>
      <div style="background:#0D1B2A;padding:14px 24px;text-align:center;">
        <a href="${origin}" style="font-size:12px;color:#8aa0b4;text-decoration:none;">worshiplens.com</a>
      </div>
    </div>
  </div>
</div>`
}

function buildPrompt(p: any, mode: 'full' | 'lyrics_only' = 'full'): string {
  const supplied = (v: any) => (v && String(v).trim() ? String(v).trim() : 'not provided')

  // A songwriter submitting their own unrecorded lyrics has no melody, key or
  // range to evaluate. Scoring singability there would be scoring an invented
  // tune, and it would drag the overall average with it.
  const lyricsOnlyBlock = mode === 'lyrics_only' ? `
LYRICS-ONLY REVIEW - THIS IS IMPORTANT:
- This submission is a lyric sheet from a writer. There is no melody, no recording, no established key, and no congregation has sung it.
- Do NOT score congregational_singability. Set its "score" to null and its "excluded" to true.
- In its "summary" put exactly one sentence explaining that melodic criteria are not evaluated in a lyrics-only review. Leave its deduction_line, key_original, key_recommended, range_original, range_recommended, ceiling_note and melody_accessibility as empty strings.
- Calculate overall_score from the remaining FOUR lenses only (scriptural_fidelity, theological_clarity, poetic_lyrical_quality, defense_brief). Do not average in a zero or a placeholder for the excluded lens.
- Leave meta.key_original, meta.key_recommended, meta.range_original, meta.range_recommended empty, and meta.tempo_bpm at 0. Do not guess a key or tempo from a lyric.
- Set meta.scoring_mode to "lyrics_only".
- You may still analyse meter and recommend a time signature, because those come from the prosody of the words rather than from a tune.
- Judge poetic_lyrical_quality on the writing itself. Where line lengths are uneven, note it as something the melody will need to carry rather than as a fault in the lyric.
` : `
- Set meta.scoring_mode to "full".
`

  return `You are WorshipLens, a theological review assistant for Baptist worship leaders in the BGCT/Texas Baptists tradition. Your tone is pastoral, equipping, and honest.
${lyricsOnlyBlock}

SONG DATA (any field marked "not provided" is genuinely unknown):
Title: ${supplied(p.title)}
Artist: ${supplied(p.artist)}
CCLI #: ${supplied(p.ccli)}
Key: ${supplied(p.key)}
Album: ${supplied(p.album)}
Time signature: ${supplied(p.timeSignature)}
Themes or Scriptures the submitter flagged: ${supplied(p.themes)}

LYRICS (PRIVATE - for analysis only, never reproduced):
${p.lyrics}

SUBMITTER-FLAGGED THEMES:
- Anything listed above under "Themes or Scriptures the submitter flagged" is a claim to check, not a fact to accept. Treat it as a pointer to look at, then judge it against the lyric itself.
- Where the lyric genuinely supports it, include it in scripture_map or technical.themes as you normally would.
- Where the lyric does not support it, leave it out and say plainly in full_analysis that the connection was suggested but the text does not carry it. Do not stretch the reading to make a submitted reference fit.

MISSING METADATA:
- The lyrics are the only guaranteed input. Never refuse or shorten the analysis because metadata is missing.
- When title or artist is "not provided" but you confidently recognize the song from the lyrics, fill meta.title and meta.artist with your identification and set meta.identified_from_lyrics to true.
- When you do not recognize it, set meta.identified_from_lyrics to false, leave meta.title and meta.artist as empty strings, and analyze the lyrics on their own terms. Do not invent a title from a lyric line.
- When key is "not provided" and you cannot identify the song, leave key_original empty and base key_recommended on the melodic range implied by the lyric, still targeting A3-D5.
- Confidence-dependent sections (story_behind_song, hymn_lineage, release_year, copyright, genre) must stay empty or null when the song is unidentified. Do not guess.

SUGGESTED TITLES:
- When a title was provided, or you identified the song, set meta.suggested_titles to [].
- Otherwise populate meta.suggested_titles with exactly 3 candidate titles, best first.
- Build each one hook-line style, the way worship songs are actually titled: lift the most memorable repeated or emphatic phrase from the lyric rather than inventing an abstract theme. Think "Goodness of God", "Way Maker", "Which Way Is Up" - short, concrete, drawn from words the congregation will already be singing.
- 2 to 5 words each. Title Case. No quotation marks, no trailing punctuation, no subtitles.
- Make the three genuinely different from each other, drawing on different parts of the lyric. Do not offer three rewordings of one phrase.

TIME SIGNATURE:
- If a time signature was provided above, copy it verbatim into meta.time_signature and set meta.time_signature_source to "provided". Still complete the meter analysis fields below so the reasoning is visible.
- If it was not provided, recommend one and set meta.time_signature_source to "recommended".
- Derive it from the lyric meter, in this order:
  1. Count syllables per line across a representative stanza and record the numeric pattern in meta.meter_pattern, for example "8.6.8.6", "8.8.8.8", "6.6.8.6", "8.7.8.7".
  2. Name the classic hymn meter in meta.meter_name when the pattern matches: 8.6.8.6 is Common Meter (CM), 8.8.8.8 is Long Meter (LM), 6.6.8.6 is Short Meter (SM). A stanza that runs the pattern twice takes the doubled label: CMD, LMD, SMD. Any other regular pattern keeps its numeric form only and meta.meter_name stays an empty string.
  3. Identify the dominant poetic foot in meta.poetic_foot: "iambic" (da-DUM), "trochaic" (DUM-da), "dactylic" (DUM-da-da), "anapestic" (da-da-DUM), or "irregular". CM, LM and SM are normally iambic. 8.7.8.7 is normally trochaic.
  4. Map foot to signature: iambic or trochaic maps to 4/4, using 2/2 only when the lyric clearly carries a fast two-beat feel. Dactylic or anapestic maps to 6/8, or to 3/4 when the stress lands on a slower triple pulse.
  5. Modern non-metrical lyrics with irregular line lengths and no consistent foot default to 4/4 with meta.poetic_foot set to "irregular" and meta.meter_pattern left empty.
- meta.time_signature_reasoning: 2 to 3 sentences naming the syllable pattern, the hymn meter label if one applies, the poetic foot, and why that maps to this signature. Write it so a worship leader without music theory training can follow it.

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

{"meta":{"title":"","artist":"","identified_from_lyrics":false,"suggested_titles":[],"submitted_themes_note":"","scoring_mode":"full","ccli_number":"","slug":"","key_original":"","key_recommended":"","range_original":"","range_recommended":"","time_signature":"","time_signature_source":"recommended","time_signature_reasoning":"","meter_pattern":"","meter_name":"","poetic_foot":"","tempo_bpm":0,"copyright":"","release_year":"","album":"","genre":"","hymn_lineage_badge":null},"overall_score":0.0,"overall_verdict":"","recommendation":"Recommended","lenses":{"scriptural_fidelity":{"score":0.0,"deduction_line":"","summary":"","watchpoints":[],"lyric_examples":[]},"theological_clarity":{"score":0.0,"deduction_line":"","summary":"","radio_test_result":"Passes","radio_test_note":"","theological_arc":"","watchpoints":[]},"congregational_singability":{"score":0.0,"excluded":false,"deduction_line":"","summary":"","key_original":"","key_recommended":"","range_original":"","range_recommended":"","ceiling_note":"","melody_accessibility":""},"poetic_lyrical_quality":{"score":0.0,"deduction_line":"","summary":"","repetition_ratio_pct":0,"cliche_density":"low","imagery_quality":"","voice_distribution":{"individual_pct":0,"corporate_pct":0,"flag":null,"note":""},"grammar_notes":[],"lyric_modifications":[],"watchpoints":[]},"defense_brief":{"score":0.0,"summary":"","objections":[{"objection":"","who_raises_it":"","tag":"Theological","scripture_response":"","suggested_framing":"","ccli_modification_note":"","honest_concession":""}]}},"full_analysis":{"paragraphs":["","","",""]},"scripture_map":{"primary":[{"reference":"","connection":""}],"supporting":[{"reference":"","connection":""}]},"theological_nuances":{"affirmed":[{"label":"","note":""}],"flagged":[]},"hymn_lineage":null,"story_behind_song":{"available":true,"publisher_note":null,"items":[{"text":"","source":""}]},"technical":{"themes":[],"sermon_series_fit":[],"seasonal_tags":[],"audience_fit":{"spiritual_maturity":"","age_group":"","service_type":"","visitor_friendliness":"","special_contexts":""}},"set_intelligence":{"available_at_500_songs":true,"pairs_well_with":[],"avoid_pairing_with":[],"set_arc":null},"similar_songs":{"if_you_love_this":[],"if_this_concerns_you":[]}}`
}

type Role = 'admin' | 'guest'

// Guests get their own password so it can be shared and rotated without
// handing out admin access. Role is derived from which secret matched, never
// from anything the client sends.
function roleFor(password: unknown): Role | null {
  const p = typeof password === 'string' ? password : ''
  if (!p) return null
  if (ANALYZE_PASSWORD && p === ANALYZE_PASSWORD) return 'admin'
  if (GUEST_PASSWORD && p === GUEST_PASSWORD) return 'guest'
  return null
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, password } = body

  // A visitor without a password asking for Song Analyzer access. Public and
  // stateless: the request is encoded into a grant link emailed to the admin,
  // so no database table is required.
  if (action === 'access_request') {
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    }
    if (RESEND_API_KEY && NOTIFY_EMAIL) {
      try {
        const token = Buffer.from(JSON.stringify({ n: name, e: email })).toString('base64url')
        const link = `${siteOrigin(req)}/admin/access-requests?g=${encodeURIComponent(token)}`
        const lines = [
          'Someone requested access to the WorshipLens Song Analyzer.',
          '',
          `Name:  ${name || 'not given'}`,
          `Email: ${email}`,
          '',
          `Grant access: ${link}`,
        ]
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({ from: RESEND_FROM, to: [NOTIFY_EMAIL], subject: `WorshipLens access request: ${name || email}`, text: lines.join('\n') }),
        })
      } catch (mailErr) {
        console.error('[access_request] notify failed', mailErr)
      }
    }
    return NextResponse.json({ ok: true })
  }

  const role = roleFor(password)
  if (!role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Anything that reads or writes the database is admin-only. A guest
  // password can analyze lyrics and nothing else.
  const ADMIN_ONLY = ['upload', 'list', 'submission_list', 'submission_get', 'submission_approve', 'submission_decline', 'access_grant']
  if (ADMIN_ONLY.includes(action) && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (action === 'verify') {
    return NextResponse.json({ ok: true, role })
  }

  if (action === 'analyze') {
    const { songData, mode } = body
    const scoringMode: 'full' | 'lyrics_only' = mode === 'lyrics_only' ? 'lyrics_only' : 'full'
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured on server' }, { status: 500 })
    }
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5',
          max_tokens: 16000,
          system: 'You are WorshipLens, a theological review assistant for Baptist worship leaders. Analyze worship songs for biblical accuracy, theological clarity, congregational singability, poetic quality, and pastoral defensibility. Use lyrics for analysis only. Never reproduce full lyrics. Never use em dashes.',
          messages: [{ role: 'user', content: buildPrompt(songData, scoringMode) }],
        }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        return NextResponse.json({ error: (err as any)?.error?.message || `API error ${r.status}` }, { status: 502 })
      }
      const data = await r.json()
      let txt = ''
      for (const b of (data.content || [])) { if (b.type === 'text') txt += b.text }
      txt = txt.replace(/```json/g, '').replace(/```/g, '').trim()
      const js = txt.indexOf('{'), je = txt.lastIndexOf('}')
      if (js >= 0 && je > js) txt = txt.slice(js, je + 1)

      let result: any
      try {
        result = JSON.parse(txt)
      } catch (parseErr: any) {
        // Surface enough context to actually diagnose a malformed response
        // instead of guessing at it: where it broke, why, and whether the
        // model simply ran out of room mid-object.
        const m = /position (\d+)/.exec(parseErr.message || '')
        const pos = m ? parseInt(m[1], 10) : -1
        const snippet = pos >= 0
          ? txt.slice(Math.max(0, pos - 250), pos + 250)
          : txt.slice(0, 500)
        console.error('[analyze] JSON parse failed', {
          stop_reason: data.stop_reason,
          usage: data.usage,
          length: txt.length,
          position: pos,
          snippet,
        })
        return NextResponse.json({
          error: `JSON parse failed: ${parseErr.message}`,
          debug: {
            stop_reason: data.stop_reason,
            output_tokens: data.usage?.output_tokens,
            text_length: txt.length,
            position: pos,
            snippet,
          },
        }, { status: 502 })
      }
      return NextResponse.json({ result })
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Analysis failed' }, { status: 500 })
    }
  }

  // A guest opting to share their song. This is the only path that stores
  // lyrics, and it only runs when the submitter ticks the consent box.
  if (action === 'submit') {
    const { submission } = body
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase env vars not configured on server' }, { status: 500 })
    }
    if (!submission?.consent) {
      return NextResponse.json({ error: 'Consent is required to store lyrics.' }, { status: 400 })
    }
    if (!String(submission?.lyrics || '').trim()) {
      return NextResponse.json({ error: 'No lyrics to submit.' }, { status: 400 })
    }

    const row = {
      title: submission.title || 'Untitled song',
      artist: submission.artist || null,
      lyrics: submission.lyrics,
      themes: submission.themes || null,
      song_key: submission.key || null,
      time_signature: submission.timeSignature || null,
      overall_score: typeof submission.overall_score === 'number' ? submission.overall_score : null,
      review: submission.review || null,
      submitter_name: submission.submitterName || null,
      submitter_email: submission.submitterEmail || null,
      status: 'pending',
      submitted_by_role: role,
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/song_submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(row),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        return NextResponse.json({ error: errText || `Supabase error ${res.status}` }, { status: 502 })
      }
      const saved = await res.json().catch(() => null)
      const savedId = Array.isArray(saved) && saved[0]?.id ? saved[0].id : null

      // Notify out of band. The submitter never learns whether this worked -
      // a mail outage must not look like a failed submission.
      if (RESEND_API_KEY && NOTIFY_EMAIL) {
        try {
          const lines = [
            `A song was submitted to the WorshipLens library.`,
            ``,
            `Title:   ${row.title}`,
            `Author:  ${row.artist || 'not given'}`,
            `Score:   ${row.overall_score ?? 'n/a'}`,
            `Key:     ${row.song_key || 'not given'}`,
            `Meter:   ${row.time_signature || 'not given'}`,
            `Themes:  ${row.themes || 'not given'}`,
            ``,
            `From:    ${row.submitter_name || 'anonymous'}${row.submitter_email ? ` <${row.submitter_email}>` : ''}`,
            `Status:  pending your approval`,
            ``,
            savedId
              ? `Review and approve: ${siteOrigin(req)}/admin/submissions/${savedId}`
              : `Review it in the submissions queue: ${siteOrigin(req)}/admin/submissions`,
            ``,
            `--- LYRICS ---`,
            row.lyrics,
          ]
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: RESEND_FROM,
              to: [NOTIFY_EMAIL],
              subject: `WorshipLens submission: ${row.title}`,
              text: lines.join('\n'),
            }),
          })
        } catch (mailErr) {
          console.error('[submit] notification email failed', mailErr)
        }
      }

      return NextResponse.json({ ok: true, id: savedId })
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Submission failed' }, { status: 500 })
    }
  }

  // Small, fast helpers the form can call before committing to a full review.
  if (action === 'suggest') {
    const { kind, songData } = body
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured on server' }, { status: 500 })
    }
    const lyrics = String(songData?.lyrics || '').trim()
    if (!lyrics) {
      return NextResponse.json({ error: 'Paste the lyrics first.' }, { status: 400 })
    }

    const prompts: Record<string, string> = {
      title: `Read these worship song lyrics and propose 3 candidate titles.

LYRICS:
${lyrics}

RULES:
- Hook-line style, the way worship songs are actually titled: lift the most memorable repeated or emphatic phrase from the lyric rather than inventing an abstract theme. Think "Goodness of God", "Way Maker".
- 2 to 5 words each. Title Case. No quotation marks, no trailing punctuation, no subtitles.
- Make the three genuinely different, drawing on different parts of the lyric. Not three rewordings of one phrase.
- If you recognise the song and know its real published title, return that as the first entry and set recognised to true.

Reply with one JSON object and nothing else:
{"recognised":false,"titles":["","",""]}`,

      meter: `Analyse the meter of these worship song lyrics and recommend a time signature.

LYRICS:
${lyrics}

METHOD:
1. Count syllables per line across a representative stanza; record the numeric pattern, for example "8.6.8.6".
2. Name the classic hymn meter if it matches: 8.6.8.6 is Common Meter (CM), 8.8.8.8 is Long Meter (LM), 6.6.8.6 is Short Meter (SM). Doubled stanzas take CMD, LMD, SMD. Otherwise leave meter_name empty.
3. Identify the dominant poetic foot: iambic, trochaic, dactylic, anapestic, or irregular.
4. Map foot to signature: iambic or trochaic to 4/4 (2/2 only for a clearly fast two-beat feel); dactylic or anapestic to 6/8, or 3/4 on a slower triple pulse.
5. Irregular modern lyrics with no consistent foot default to 4/4, meter_pattern empty.
6. If you recognise the song and its established tune contradicts the pattern, follow the tune and explain why in the reasoning.

reasoning: 2 to 3 sentences a worship leader without music theory training can follow. No em dashes.

Reply with one JSON object and nothing else:
{"time_signature":"","meter_pattern":"","meter_name":"","poetic_foot":"","reasoning":""}`,

      themes: `Read these worship song lyrics and identify their key themes and the Scripture they most clearly echo.

LYRICS:
${lyrics}

RULES:
- 3 to 5 themes, each 1 to 3 words, drawn from what the lyric actually says rather than what a worship song usually says.
- 1 or 2 Scripture references the lyric genuinely echoes, formatted Book Chapter:Verse.
- Only include a reference where the connection is plain in the words. A shared word like "grace" or "light" is not an echo on its own.
- If nothing rises to that bar, return an empty scriptures list. Do not invent a reference to fill the slot.

Reply with one JSON object and nothing else:
{"themes":["",""],"scriptures":[""]}`,
    }

    const prompt = prompts[kind as string]
    if (!prompt) {
      return NextResponse.json({ error: 'Unknown suggestion type' }, { status: 400 })
    }

    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        return NextResponse.json({ error: (err as any)?.error?.message || `API error ${r.status}` }, { status: 502 })
      }
      const data = await r.json()
      let txt = ''
      for (const b of (data.content || [])) { if (b.type === 'text') txt += b.text }
      txt = txt.replace(/```json/g, '').replace(/```/g, '').trim()
      const js = txt.indexOf('{'), je = txt.lastIndexOf('}')
      if (js >= 0 && je > js) txt = txt.slice(js, je + 1)
      return NextResponse.json({ result: JSON.parse(txt) })
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Suggestion failed' }, { status: 500 })
    }
  }

  if (action === 'list') {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase env vars not configured on server' }, { status: 500 })
    }
    try {
      const cols = 'id,slug,title,artist,ccli_number,overall_score,recommendation,created_at'
      // Supabase caps a single response (1000 rows by default), so page through
      // with Range headers rather than silently returning a truncated library.
      const PAGE = 1000
      const MAX = 10000
      const rows: any[] = []
      let total: number | null = null

      for (let offset = 0; offset < MAX; offset += PAGE) {
        const res: Response = await fetch(
          `${SUPABASE_URL}/rest/v1/songs?select=${cols}&order=created_at.desc`,
          {
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY!,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              Range: `${offset}-${offset + PAGE - 1}`,
              Prefer: 'count=exact',
            },
          },
        )
        if (!res.ok && res.status !== 206) {
          const errText = await res.text().catch(() => '')
          return NextResponse.json({ error: errText || `Supabase error ${res.status}` }, { status: 502 })
        }
        // Content-Range looks like "0-999/4231"
        const cr = res.headers.get('content-range') || ''
        const slash = cr.lastIndexOf('/')
        if (total === null && slash >= 0) {
          const parsed = parseInt(cr.slice(slash + 1), 10)
          if (!Number.isNaN(parsed)) total = parsed
        }
        const batch = await res.json()
        if (!Array.isArray(batch) || batch.length === 0) break
        rows.push(...batch)
        if (batch.length < PAGE) break
        if (total !== null && rows.length >= total) break
      }

      return NextResponse.json({ rows, total: total ?? rows.length, truncated: rows.length < (total ?? rows.length) })
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'List failed' }, { status: 500 })
    }
  }

  if (action === 'upload') {
    const { row, force } = body
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase env vars not configured on server' }, { status: 500 })
    }

    const sbHeaders = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    }

    try {
      // A song's identity is its CCLI number when it has one. Slug is only a
      // fallback, and it is what let duplicates through before: two uploads of
      // the same hymn with different artist credits both slugged to the same
      // string but were inserted as separate rows.
      const matchedOn = row.ccli_number ? 'ccli_number' : 'slug'
      const filter = row.ccli_number
        ? `ccli_number=eq.${encodeURIComponent(String(row.ccli_number))}`
        : `slug=eq.${encodeURIComponent(String(row.slug || ''))}`

      let existing: any[] = []
      if (row.ccli_number || row.slug) {
        const lookup = await fetch(
          `${SUPABASE_URL}/rest/v1/songs?${filter}&select=id,title,artist,slug,ccli_number,overall_score,created_at&order=created_at.desc`,
          { headers: sbHeaders },
        )
        if (lookup.ok) {
          const found = await lookup.json()
          if (Array.isArray(found)) existing = found
        }
      }

      // Never silently add a second copy. Hand the decision back instead.
      if (existing.length > 0 && !force) {
        return NextResponse.json({
          error: 'This song is already in the library.',
          duplicate: {
            matchedOn,
            count: existing.length,
            rows: existing.slice(0, 3).map(r => ({
              id: r.id,
              title: r.title,
              artist: r.artist,
              ccli_number: r.ccli_number,
              overall_score: r.overall_score,
              created_at: r.created_at,
            })),
          },
        }, { status: 409 })
      }

      // Replacing: update the newest existing row in place rather than adding
      // another one, so the row id and any inbound links survive.
      if (existing.length > 0 && force) {
        const target = existing[0]
        const res = await fetch(`${SUPABASE_URL}/rest/v1/songs?id=eq.${encodeURIComponent(target.id)}`, {
          method: 'PATCH',
          headers: sbHeaders,
          body: JSON.stringify(row),
        })
        if (!res.ok) {
          const errText = await res.text().catch(() => '')
          return NextResponse.json({ error: errText || `Supabase error ${res.status}` }, { status: 502 })
        }
        return NextResponse.json({
          ok: true,
          mode: 'updated',
          replaced: target.id,
          alsoPresent: existing.length - 1,
        })
      }

      const res = await fetch(`${SUPABASE_URL}/rest/v1/songs`, {
        method: 'POST',
        headers: { ...sbHeaders, Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify(row),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        return NextResponse.json({ error: errText || `Supabase error ${res.status}` }, { status: 502 })
      }
      return NextResponse.json({ ok: true, mode: 'inserted' })
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
    }
  }

  // ── Submission approval queue (admin only) ───────────────────────────────
  if (action === 'submission_list' || action === 'submission_get' || action === 'submission_approve' || action === 'submission_decline') {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase env vars not configured on server' }, { status: 500 })
    }
    const sb = {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    }
    const base = `${SUPABASE_URL}/rest/v1/song_submissions`
    const listCols = 'id,title,artist,overall_score,submitter_name,submitter_email,status,created_at'

    try {
      if (action === 'submission_list') {
        const status = typeof body.status === 'string' && body.status ? body.status : 'pending'
        const qs = status === 'all'
          ? `select=${listCols}&order=created_at.desc`
          : `status=eq.${encodeURIComponent(status)}&select=${listCols}&order=created_at.desc`
        const res = await fetch(`${base}?${qs}`, { headers: sb })
        if (!res.ok) return NextResponse.json({ error: (await res.text().catch(() => '')) || `Supabase ${res.status}` }, { status: 502 })
        const rows = await res.json().catch(() => [])
        return NextResponse.json({ rows: Array.isArray(rows) ? rows : [] })
      }

      const id = String(body.id || '')
      if (!id) return NextResponse.json({ error: 'Missing submission id.' }, { status: 400 })

      if (action === 'submission_get') {
        const res = await fetch(`${base}?id=eq.${encodeURIComponent(id)}&limit=1`, { headers: sb })
        if (!res.ok) return NextResponse.json({ error: (await res.text().catch(() => '')) || `Supabase ${res.status}` }, { status: 502 })
        const rows = await res.json().catch(() => [])
        const sub = Array.isArray(rows) && rows[0] ? rows[0] : null
        if (!sub) return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
        return NextResponse.json({ submission: sub })
      }

      if (action === 'submission_decline') {
        const res = await fetch(`${base}?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { ...sb, Prefer: 'return=representation' },
          body: JSON.stringify({ status: 'declined' }),
        })
        if (!res.ok) return NextResponse.json({ error: (await res.text().catch(() => '')) || `Supabase ${res.status}` }, { status: 502 })
        return NextResponse.json({ ok: true, status: 'declined' })
      }

      // submission_approve: rebuild the songs row from the stored review, insert
      // it into the library, then mark the submission approved.
      const getRes = await fetch(`${base}?id=eq.${encodeURIComponent(id)}&limit=1`, { headers: sb })
      if (!getRes.ok) return NextResponse.json({ error: (await getRes.text().catch(() => '')) || `Supabase ${getRes.status}` }, { status: 502 })
      const found = await getRes.json().catch(() => [])
      const sub = Array.isArray(found) && found[0] ? found[0] : null
      if (!sub) return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
      if (sub.status === 'approved') return NextResponse.json({ error: 'This submission is already approved.' }, { status: 409 })
      if (!sub.review) return NextResponse.json({ error: 'This submission has no stored analysis to publish.' }, { status: 422 })

      const row = buildSongRowFromReview(sub.review)

      // Never publish a duplicate. Match on CCLI number when present, else slug.
      const dupFilter = row.ccli_number
        ? `ccli_number=eq.${encodeURIComponent(String(row.ccli_number))}`
        : `slug=eq.${encodeURIComponent(String(row.slug || ''))}`
      if (row.ccli_number || row.slug) {
        const look = await fetch(`${SUPABASE_URL}/rest/v1/songs?${dupFilter}&select=id,title&limit=1`, { headers: sb })
        if (look.ok) {
          const ex = await look.json().catch(() => [])
          if (Array.isArray(ex) && ex.length > 0) {
            return NextResponse.json({ error: 'A song with this identity is already in the library.', duplicate: true }, { status: 409 })
          }
        }
      }

      const ins = await fetch(`${SUPABASE_URL}/rest/v1/songs`, {
        method: 'POST',
        headers: { ...sb, Prefer: 'return=representation' },
        body: JSON.stringify(row),
      })
      if (!ins.ok) return NextResponse.json({ error: (await ins.text().catch(() => '')) || `Supabase ${ins.status}` }, { status: 502 })
      const inserted = await ins.json().catch(() => null)
      const songId = Array.isArray(inserted) && inserted[0]?.id ? inserted[0].id : null

      await fetch(`${base}?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: sb,
        body: JSON.stringify({ status: 'approved' }),
      })

      return NextResponse.json({ ok: true, status: 'approved', songId, slug: row.slug })
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Submission action failed' }, { status: 500 })
    }
  }

  // ── Grant Song Analyzer access (admin only) ──────────────────────────────
  // Stateless: takes the requester's name/email (decoded from the grant link)
  // and sends the branded welcome email. No database involved.
  if (action === 'access_grant') {
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
    }
    let emailed = false
    let emailError: string | null = null
    if (RESEND_API_KEY) {
      try {
        const r = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [email],
            subject: "You're in - WorshipLens Song Analyzer access",
            html: accessWelcomeHtml(siteOrigin(req), name),
          }),
        })
        emailed = r.ok
        if (!r.ok) emailError = (await r.text().catch(() => '')) || `Resend ${r.status}`
      } catch (e: any) {
        emailError = e.message || 'send failed'
      }
    } else {
      emailError = 'Email not configured (RESEND_API_KEY).'
    }
    return NextResponse.json({ ok: true, emailed, emailError })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
