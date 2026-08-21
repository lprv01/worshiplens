import { NextRequest, NextResponse } from 'next/server'

const ANALYZE_PASSWORD = process.env.ANALYZE_PASSWORD
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function buildPrompt(p: any): string {
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

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, password } = body

  if (!ANALYZE_PASSWORD || password !== ANALYZE_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (action === 'verify') {
    return NextResponse.json({ ok: true })
  }

  if (action === 'analyze') {
    const { songData } = body
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
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          system: 'You are WorshipLens, a theological review assistant for Baptist worship leaders. Analyze worship songs for biblical accuracy, theological clarity, congregational singability, poetic quality, and pastoral defensibility. Use lyrics for analysis only. Never reproduce full lyrics. Never use em dashes.',
          messages: [{ role: 'user', content: buildPrompt(songData) }],
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
      const result = JSON.parse(txt)
      return NextResponse.json({ result })
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Analysis failed' }, { status: 500 })
    }
  }

  if (action === 'upload') {
    const { row } = body
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase env vars not configured on server' }, { status: 500 })
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(row),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        return NextResponse.json({ error: errText || `Supabase error ${res.status}` }, { status: 502 })
      }
      return NextResponse.json({ ok: true })
    } catch (e: any) {
      return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
