import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function scoreColor(score: number) {
  if (score >= 8.0) return { bar: '#639922', text: '#3B6D11', bg: '#EAF3DE' }
  if (score >= 6.5) return { bar: '#BA7517', text: '#854F0B', bg: '#FAEEDA' }
  if (score >= 5.0) return { bar: '#D85A30', text: '#993C1D', bg: '#FAECE7' }
  return { bar: '#E24B4A', text: '#A32D2D', bg: '#FCEBEB' }
}

function scoreLabel(score: number) {
  if (score >= 8.0) return 'Recommended'
  if (score >= 6.5) return 'Use with care'
  if (score >= 5.0) return 'Use cautiously'
  return 'Not recommended'
}

export default async function SongPage({ params }: { params: { id: string } }) {
  const { data: song } = await supabase.from("songs").select("*").eq("id", params.id).single();
  if (!song) return notFound();

  const { data: review } = await supabase.from("reviews").select("*").eq("song_id", params.id).single();
  const { data: lenses } = await supabase.from("lens_scores").select("*").eq("song_id", params.id);
  const { data: defense } = await supabase.from("defense_brief").select("*").eq("song_id", params.id).single();

  const overall = review?.overall_score ?? 0;
  const overallColor = scoreColor(overall);

  const lensOrder = [
    { key: 'scriptural_fidelity', label: 'Scriptural fidelity' },
    { key: 'theological_clarity', label: 'Theological clarity' },
    { key: 'singability', label: 'Singability' },
    { key: 'poetic_quality', label: 'Poetic quality' },
    { key: 'defense_brief', label: 'Defense brief' },
  ];

  const lensMap: Record<string, any> = {};
  (lenses ?? []).forEach((l: any) => { lensMap[l.lens_name] = l; });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#ffffff', color: '#1a1a1a', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 680px) {
          .song-hero { flex-direction: column !important; align-items: flex-start !important; }
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.10)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="rgba(0,0,0,0.3)" strokeWidth="0.75"/>
            <path d="M8 18 C8 12 11 9 14 9 C17 9 20 12 20 18" stroke="#1a1a1a" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <path d="M10 18 C10 13.5 12 11 14 11 C16 11 18 13.5 18 18" stroke="#555550" strokeWidth="0.75" fill="none" strokeLinecap="round"/>
            <circle cx="14" cy="18" r="1.5" fill="#1a1a1a"/>
          </svg>
          <span style={{ fontFamily: "'Lora', serif", fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em', color: '#1a1a1a' }}>WorshipLens</span>
        </Link>
        <Link href="/songs" style={{ fontSize: 13, color: '#555550', textDecoration: 'none' }}>← All songs</Link>
      </nav>

      <div style={{ borderBottom: '0.5px solid rgba(0,0,0,0.10)', padding: '3rem 2.5rem 2.5rem', maxWidth: 960, margin: '0 auto' }}>
        <div className="song-hero" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '1rem' }}>
              <div style={{ width: 22, height: 1, background: 'rgba(0,0,0,0.20)', marginTop: 7, flexShrink: 0 }} />
              <span style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', fontWeight: 400 }}>Song review</span>
            </div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 38, fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>{song.title}</h1>
            <p style={{ fontSize: 15, color: '#555550', marginBottom: '1rem', fontWeight: 300 }}>{song.artist}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
              {song.ccli_number && <span style={{ fontSize: 11, color: '#999990', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '3px 10px', borderRadius: 8 }}>CCLI #{song.ccli_number}</span>}
              {song.original_key && <span style={{ fontSize: 11, color: '#999990', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '3px 10px', borderRadius: 8 }}>Key of {song.original_key}{song.recommended_key && song.recommended_key !== song.original_key ? ` → ${song.recommended_key}` : ''}</span>}
              {song.tempo_bpm && <span style={{ fontSize: 11, color: '#999990', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '3px 10px', borderRadius: 8 }}>{song.tempo_bpm} BPM</span>}
              {song.time_signature && <span style={{ fontSize: 11, color: '#999990', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '3px 10px', borderRadius: 8 }}>{song.time_signature}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'center' as const, flexShrink: 0 }}>
            <div style={{ width: 88, height: 88, borderRadius: 16, background: overallColor.bg, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <span style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, color: overallColor.text, lineHeight: 1 }}>{overall.toFixed(1)}</span>
              <span style={{ fontSize: 10, color: overallColor.text, opacity: 0.7, marginTop: 2 }}>/10</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: overallColor.text, background: overallColor.bg, padding: '3px 10px', borderRadius: 8 }}>{scoreLabel(overall)}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem' }}>

        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '1.25rem' }}>Five lenses</p>
          <div style={{ border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, overflow: 'hidden' }}>
            {lensOrder.map((l, i) => {
              const lens = lensMap[l.key];
              const score = lens?.score ?? 0;
              const c = scoreColor(score);
              return (
                <div key={l.key} style={{ background: '#fff', borderBottom: i < lensOrder.length - 1 ? '0.5px solid rgba(0,0,0,0.08)' : 'none', padding: '1.125rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: lens?.summary ? '0.75rem' : 0 }}>
                    <span style={{ fontSize: 11, color: '#999990', width: 18, flexShrink: 0 }}>0{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{l.label}</span>
                    <div style={{ width: 120, height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: '100%', borderRadius: 2, width: `${(score / 10) * 100}%`, background: c.bar }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: c.text, width: 28, textAlign: 'right' as const, flexShrink: 0 }}>{score.toFixed(1)}</span>
                  </div>
                  {lens?.deduction_note && <p style={{ fontSize: 12, color: '#999990', fontStyle: 'italic', marginLeft: 34, marginBottom: '0.375rem' }}>− {lens.deduction_note}</p>}
                  {lens?.summary && <p style={{ fontSize: 13, color: '#555550', lineHeight: 1.65, fontWeight: 300, marginLeft: 34 }}>{lens.summary}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {review?.full_review && (
          <div style={{ marginBottom: '3rem' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '1.25rem' }}>Full review</p>
            <div style={{ fontSize: 15, color: '#333', lineHeight: 1.8, fontWeight: 300 }}>
              {review.full_review.split('\n\n').map((para: string, i: number) => (
                <p key={i} style={{ marginBottom: '1.25rem' }}>{para}</p>
              ))}
            </div>
          </div>
        )}

        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <div>
            {song.themes?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '0.875rem' }}>Themes</p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {song.themes.map((t: string) => (
                    <span key={t} style={{ fontSize: 12, color: '#555550', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '4px 10px', borderRadius: 8 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            {song.scripture_connections?.length > 0 && (
              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '0.875rem' }}>Scripture connections</p>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
                  {song.scripture_connections.map((s: string) => (
                    <span key={s} style={{ fontSize: 13, color: '#555550', fontWeight: 300 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            {review?.sermon_fit && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '0.875rem' }}>Sermon fit</p>
                <p style={{ fontSize: 13, color: '#555550', lineHeight: 1.65, fontWeight: 300 }}>{review.sermon_fit}</p>
              </div>
            )}
            {review?.service_placement && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '0.875rem' }}>Service placement</p>
                <p style={{ fontSize: 13, color: '#555550', lineHeight: 1.65, fontWeight: 300 }}>{review.service_placement}</p>
              </div>
            )}
            {song.audience_profile && (
              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '0.875rem' }}>Audience fit</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.06)' }}>
                  {[
                    { k: 'Maturity', v: song.audience_profile.spiritual_maturity },
                    { k: 'Age group', v: song.audience_profile.age_group },
                    { k: 'Service type', v: song.audience_profile.service_type },
                    { k: 'Visitor-friendly', v: song.audience_profile.visitor_friendliness },
                  ].filter(d => d.v).map(d => (
                    <div key={d.k} style={{ background: '#fff', padding: '0.625rem 0.875rem' }}>
                      <p style={{ fontSize: 10, color: '#999990', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 2 }}>{d.k}</p>
                      <p style={{ fontSize: 12, color: '#333' }}>{d.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {defense && (
          <div style={{ marginBottom: '3rem' }}>
            <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '1.25rem' }}>Worship leader defense brief</p>
            <div style={{ border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, overflow: 'hidden' }}>
              {defense.objections?.map((obj: any, i: number) => (
                <div key={i} style={{ padding: '1.25rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: '#fff' }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', marginBottom: '0.5rem' }}>"{obj.objection}"</p>
                  <p style={{ fontSize: 13, color: '#555550', lineHeight: 1.65, fontWeight: 300 }}>{obj.response}</p>
                </div>
              ))}
              {defense.honest_concession && (
                <div style={{ padding: '1.25rem', background: '#f7f6f3', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <p style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#999990', marginBottom: '0.5rem' }}>Honest concession</p>
                  <p style={{ fontSize: 13, color: '#555550', lineHeight: 1.65, fontStyle: 'italic', fontWeight: 300 }}>{defense.honest_concession}</p>
                </div>
              )}
              {defense.suggested_framing && (
                <div style={{ padding: '1.25rem', background: '#fff' }}>
                  <p style={{ fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#999990', marginBottom: '0.5rem' }}>Suggested framing</p>
                  <p style={{ fontSize: 13, color: '#555550', lineHeight: 1.65, fontWeight: 300 }}>{defense.suggested_framing}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(review?.similar_if_like || review?.similar_if_concerned) && (
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '1.25rem' }}>Similar songs</p>
            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {review.similar_if_like && (
                <div style={{ background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '1rem' }}>
                  <p style={{ fontSize: 11, color: '#3B6D11', fontWeight: 500, marginBottom: '0.5rem' }}>If you like this song</p>
                  <p style={{ fontSize: 13, color: '#555550', fontWeight: 300, lineHeight: 1.6 }}>{review.similar_if_like}</p>
                </div>
              )}
              {review.similar_if_concerned && (
                <div style={{ background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '1rem' }}>
                  <p style={{ fontSize: 11, color: '#854F0B', fontWeight: 500, marginBottom: '0.5rem' }}>If this concerns you</p>
                  <p style={{ fontSize: 13, color: '#555550', fontWeight: 300, lineHeight: 1.6 }}>{review.similar_if_concerned}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
