import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function scoreColor(score: number) {
  if (score >= 8.0) return { bar: '#639922', text: '#3B6D11', bg: '#EAF3DE', border: '#97C459' }
  if (score >= 6.5) return { bar: '#BA7517', text: '#854F0B', bg: '#FAEEDA', border: '#EF9F27' }
  if (score >= 5.0) return { bar: '#D85A30', text: '#993C1D', bg: '#FAECE7', border: '#F0997B' }
  return { bar: '#E24B4A', text: '#A32D2D', bg: '#FCEBEB', border: '#F09595' }
}

function scoreLabel(score: number) {
  if (score >= 8.0) return 'Recommended'
  if (score >= 6.5) return 'Recommended with notes'
  if (score >= 5.0) return 'Use with caution'
  return 'Not recommended'
}

export default async function SongDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try slug first, then uuid — handles both old and new URLs
  let { data: song } = await supabase
    .from("songs")
    .select("*")
    .eq("slug", id)
    .single();

  if (!song) {
    const { data: byId } = await supabase
      .from("songs")
      .select("*")
      .eq("id", id)
      .single();
    song = byId;
  }

  if (!song) return notFound();

  const overall = song.overall_score ?? 0;
  const oc = scoreColor(overall);

  // All data lives in JSONB columns
  const lenses = song.lenses ?? {};
  const sf = lenses.scriptural_fidelity ?? {};
  const tc = lenses.theological_clarity ?? {};
  const cs = lenses.congregational_singability ?? {};
  const pq = lenses.poetic_lyrical_quality ?? {};
  const db = lenses.defense_brief ?? {};

  const lensOrder = [
    { key: 'scriptural_fidelity',        label: 'Scriptural fidelity',       data: sf },
    { key: 'theological_clarity',         label: 'Theological clarity',        data: tc },
    { key: 'congregational_singability',  label: 'Congregational singability', data: cs },
    { key: 'poetic_lyrical_quality',      label: 'Poetic & lyrical quality',   data: pq },
    { key: 'defense_brief',               label: 'Defense brief',              data: db },
  ];

  const scriptureMap   = song.scripture_map ?? {};
  const story          = song.story_behind_song ?? {};
  const technical      = song.technical ?? {};
  const hymn           = song.hymn_lineage;
  const similar        = song.similar_songs ?? {};
  const nuances        = song.theological_nuances ?? {};
  const analysis       = song.full_analysis?.paragraphs ?? [];
  const voice          = song.voice_analysis ?? {};
  const audienceFit    = technical.audience_fit ?? {};
  const themes         = song.themes ?? technical.themes ?? [];
  const sermonFit      = technical.sermon_series_fit ?? [];
  const objections     = db.objections ?? [];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#ffffff', color: '#1a1a1a', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        details > summary { list-style: none; cursor: pointer; user-select: none; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] .chev { transform: rotate(180deg); }
        .chev { display: inline-block; transition: transform 0.2s; font-size: 10px; color: #999; }
        @media (max-width: 680px) {
          .song-hero { flex-direction: column !important; align-items: flex-start !important; }
          .two-col { grid-template-columns: 1fr !important; }
          .lens-mini-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* Nav */}
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

      {/* Hero */}
      <div style={{ borderBottom: '0.5px solid rgba(0,0,0,0.10)', padding: '3rem 2.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
        <div className="song-hero" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: '1rem' }}>
              <div style={{ width: 22, height: 1, background: 'rgba(0,0,0,0.20)', marginTop: 7, flexShrink: 0 }} />
              <span style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', fontWeight: 400 }}>Song review</span>
            </div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 36, fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>{song.title}</h1>
            <p style={{ fontSize: 15, color: '#555550', marginBottom: '0.75rem', fontWeight: 300 }}>{song.artist}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {song.ccli_number && <span style={{ fontSize: 11, color: '#999990', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '3px 10px', borderRadius: 8 }}>CCLI #{song.ccli_number}</span>}
              {song.key_original && <span style={{ fontSize: 11, color: '#999990', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '3px 10px', borderRadius: 8 }}>Key of {song.key_original}</span>}
              {song.tempo_bpm && <span style={{ fontSize: 11, color: '#999990', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '3px 10px', borderRadius: 8 }}>{song.tempo_bpm} BPM</span>}
              {song.time_signature && <span style={{ fontSize: 11, color: '#999990', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '3px 10px', borderRadius: 8 }}>{song.time_signature}</span>}
              {song.hymn_lineage_badge && <span style={{ fontSize: 11, color: '#27500A', background: '#EAF3DE', border: '0.5px solid #97C459', padding: '3px 10px', borderRadius: 8 }}>♪ {song.hymn_lineage_badge}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'center' as const, flexShrink: 0 }}>
            <div style={{ width: 88, height: 88, borderRadius: 16, background: oc.bg, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', marginBottom: 8, border: `0.5px solid ${oc.border}` }}>
              <span style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 500, color: oc.text, lineHeight: 1 }}>{overall.toFixed(1)}</span>
              <span style={{ fontSize: 10, color: oc.text, opacity: 0.7, marginTop: 2 }}>/10</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: oc.text, background: oc.bg, padding: '3px 10px', borderRadius: 8 }}>{scoreLabel(overall)}</span>
            {song.overall_verdict && <p style={{ fontSize: 11, color: '#888', marginTop: 8, maxWidth: 180, lineHeight: 1.5 }}>{song.overall_verdict}</p>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem' }}>

        {/* Five Lenses */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '1.25rem' }}>Five lenses</p>
          <div style={{ border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, overflow: 'hidden' }}>
            {lensOrder.map(({ label, data }, i) => {
              const score = data?.score ?? 0;
              const c = scoreColor(score);
              const deduction = data?.deduction_line ?? '';
              const summary = data?.summary ?? '';
              const watchpoints = data?.watchpoints ?? [];
              const modifications = data?.lyric_modifications ?? [];
              const grammarNotes = data?.grammar_notes ?? [];

              return (
                <details key={label} style={{ background: '#fff', borderBottom: i < lensOrder.length - 1 ? '0.5px solid rgba(0,0,0,0.08)' : 'none' }}>
                  <summary style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: 11, color: '#999990', width: 18, flexShrink: 0 }}>0{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{label}</span>
                    {deduction && <span style={{ fontSize: 11, color: '#999', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, display: 'none' }} className="deduct-preview">{deduction}</span>}
                    <div style={{ width: 100, height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: '100%', borderRadius: 2, width: `${(score / 10) * 100}%`, background: c.bar }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: c.text, width: 28, textAlign: 'right' as const, flexShrink: 0 }}>{score.toFixed(1)}</span>
                    <span className="chev">▼</span>
                  </summary>
                  <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                    {deduction && (
                      <div style={{ marginTop: '0.875rem', padding: '7px 10px', background: '#f7f6f3', borderLeft: '2px solid rgba(0,0,0,0.15)', fontSize: 12, color: '#666' }}>
                        {deduction}
                      </div>
                    )}
                    {summary && <p style={{ fontSize: 13, color: '#555550', lineHeight: 1.7, fontWeight: 300, marginTop: '0.875rem' }}>{summary}</p>}
                    {watchpoints.length > 0 && watchpoints.map((wp: any, wi: number) => (
                      <div key={wi} style={{ marginTop: '0.75rem', padding: '7px 10px', borderLeft: `2px solid ${wp.type === 'positive' ? '#97C459' : '#EF9F27'}`, background: wp.type === 'positive' ? '#EAF3DE' : '#FAEEDA', fontSize: 12, color: wp.type === 'positive' ? '#27500A' : '#633806' }}>
                        <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 2 }}>{wp.label}</div>
                        {wp.note}
                      </div>
                    ))}
                    {/* Voice distribution (Poetic lens only) */}
                    {label === 'Poetic & lyrical quality' && voice.individual_pct !== undefined && (
                      <div style={{ marginTop: '0.875rem', padding: '10px 12px', background: '#f7f6f3', borderRadius: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#555', marginBottom: 8 }}>Congregational voice</div>
                        {[
                          { label: 'Individual', pct: voice.individual_pct, color: '#378ADD' },
                          { label: 'Corporate', pct: voice.corporate_pct, color: '#639922' },
                        ].map(v => (
                          <div key={v.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                            <span style={{ fontSize: 11, color: '#888', width: 70 }}>{v.label}</span>
                            <div style={{ flex: 1, height: 4, background: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${v.pct}%`, height: '100%', background: v.color, borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 500, color: v.color, width: 32, textAlign: 'right' as const }}>{v.pct}%</span>
                          </div>
                        ))}
                        {voice.note && <p style={{ fontSize: 11, color: '#888', marginTop: 6 }}>{voice.note}</p>}
                      </div>
                    )}
                    {/* Grammar notes */}
                    {grammarNotes.map((gn: any, gi: number) => (
                      <div key={gi} style={{ marginTop: '0.75rem', padding: '10px 12px', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 8, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 500, marginBottom: 4, color: '#333' }}>Grammar note — {gn.issue} ({gn.severity})</div>
                        {gn.explanation}
                        {gn.ccli_modification_suggestion && <div style={{ marginTop: 6, color: '#27500A', fontWeight: 500 }}>CCLI option: {gn.ccli_modification_suggestion}</div>}
                      </div>
                    ))}
                    {/* Lyric modifications */}
                    {modifications.map((mod: any, mi: number) => (
                      <div key={mi} style={{ marginTop: '0.75rem', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ padding: '6px 11px', background: '#f7f6f3', fontSize: 10, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#888' }}>Suggested modification</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(0,0,0,0.06)' }}>
                          <div style={{ padding: '8px 11px', background: '#fff' }}>
                            <div style={{ fontSize: 10, color: '#999', marginBottom: 3 }}>Original</div>
                            <div style={{ fontSize: 13, color: '#555', fontStyle: 'italic' }}>{mod.original_line}</div>
                          </div>
                          <div style={{ padding: '8px 11px', background: '#EAF3DE' }}>
                            <div style={{ fontSize: 10, color: '#3B6D11', marginBottom: 3 }}>Suggested</div>
                            <div style={{ fontSize: 13, color: '#27500A', fontWeight: 500 }}>{mod.suggested_line}</div>
                          </div>
                        </div>
                        <div style={{ padding: '7px 11px', fontSize: 12, color: '#666' }}>{mod.reason} {mod.ccli_permitted && <span style={{ color: '#27500A', fontWeight: 500 }}>✓ Permitted under your CCLI license</span>}</div>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        {/* Full Analysis */}
        {analysis.length > 0 && (
          <details style={{ marginBottom: '2.5rem', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990' }}>Full analysis</p>
              <span className="chev">▼</span>
            </summary>
            <div style={{ padding: '0 1.25rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
              {analysis.map((para: string, i: number) => (
                <p key={i} style={{ fontSize: 14, color: '#333', lineHeight: 1.8, fontWeight: 300, marginTop: '1rem' }}>{para}</p>
              ))}
            </div>
          </details>
        )}

        {/* Defense Brief */}
        {objections.length > 0 && (
          <details style={{ marginBottom: '2.5rem', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990' }}>Defense brief</p>
              <span className="chev">▼</span>
            </summary>
            <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
              {objections.map((obj: any, i: number) => (
                <details key={i} style={{ borderBottom: i < objections.length - 1 ? '0.5px solid rgba(0,0,0,0.08)' : 'none' }}>
                  <summary style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: '#f7f6f3' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>"{obj.objection}"</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {obj.tag && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: '#FAEEDA', color: '#633806' }}>{obj.tag}</span>}
                      <span className="chev">▼</span>
                    </div>
                  </summary>
                  <div style={{ padding: '0.875rem 1.25rem', background: '#fff' }}>
                    {obj.who_raises_it && <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Who raises this: {obj.who_raises_it}</p>}
                    {obj.scripture_response && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#999', marginBottom: 4 }}>Scripture response</div>
                        <p style={{ fontSize: 13, color: '#333', lineHeight: 1.65, fontWeight: 300 }}>{obj.scripture_response}</p>
                      </div>
                    )}
                    {obj.suggested_framing && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#999', marginBottom: 4 }}>Suggested framing</div>
                        <p style={{ fontSize: 13, color: '#333', lineHeight: 1.65, fontWeight: 300 }}>{obj.suggested_framing}</p>
                      </div>
                    )}
                    {obj.honest_concession && (
                      <div style={{ padding: '8px 11px', background: '#E6F1FB', borderLeft: '2px solid #378ADD', fontSize: 12, color: '#0C447C', lineHeight: 1.5 }}>
                        <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 2 }}>Honest concession</div>
                        {obj.honest_concession}
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </details>
        )}

        {/* Scripture Map */}
        {(scriptureMap.primary?.length > 0 || scriptureMap.supporting?.length > 0) && (
          <details style={{ marginBottom: '2.5rem', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990' }}>Scripture map</p>
              <span className="chev">▼</span>
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
              {scriptureMap.primary?.length > 0 && (
                <>
                  <p style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#999', marginTop: '0.875rem', marginBottom: 8 }}>Primary foundations</p>
                  {scriptureMap.primary.map((s: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '7px 10px', background: '#f7f6f3', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 500, whiteSpace: 'nowrap' as const, minWidth: 80 }}>{s.reference}</span>
                      <span style={{ color: '#555', lineHeight: 1.5 }}>{s.connection}</span>
                    </div>
                  ))}
                </>
              )}
              {scriptureMap.supporting?.length > 0 && (
                <>
                  <p style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#999', marginTop: '1rem', marginBottom: 8 }}>Supporting connections</p>
                  {scriptureMap.supporting.map((s: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '7px 10px', background: '#f7f6f3', borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                      <span style={{ fontWeight: 500, whiteSpace: 'nowrap' as const, minWidth: 80 }}>{s.reference}</span>
                      <span style={{ color: '#555', lineHeight: 1.5 }}>{s.connection}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </details>
        )}

        {/* Story Behind the Song */}
        {story.available && story.items?.length > 0 && (
          <details style={{ marginBottom: '2.5rem', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990' }}>Story behind the song</p>
              <span className="chev">▼</span>
            </summary>
            <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
              {story.publisher_note && (
                <div style={{ marginTop: '0.875rem', padding: '8px 11px', background: '#f7f6f3', borderRadius: 8, fontSize: 12, color: '#666', borderLeft: '2px solid rgba(0,0,0,0.12)' }}>
                  <span style={{ fontWeight: 500, color: '#333' }}>Publisher note: </span>{story.publisher_note}
                </div>
              )}
              {story.items.map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 12, paddingTop: '0.875rem', marginTop: '0.875rem', borderTop: i > 0 ? '0.5px solid rgba(0,0,0,0.07)' : 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', flexShrink: 0, marginTop: 7 }} />
                  <div>
                    <p style={{ fontSize: 13, color: '#333', lineHeight: 1.65, fontWeight: 300 }}>{item.text}</p>
                    {item.source && <p style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{item.source}</p>}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Hymn Lineage */}
        {hymn && (
          <details style={{ marginBottom: '2.5rem', border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, overflow: 'hidden' }}>
            <summary style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990' }}>Hymn lineage</p>
              <span className="chev">▼</span>
            </summary>
            <div style={{ padding: '0.875rem 1.25rem 1.25rem', borderTop: '0.5px solid rgba(0,0,0,0.06)', fontSize: 13, color: '#555', lineHeight: 1.7, fontWeight: 300 }}>
              {typeof hymn === 'string' ? hymn : JSON.stringify(hymn)}
            </div>
          </details>
        )}

        {/* Themes + Technical */}
        <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            {themes.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '0.75rem' }}>Themes</p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {themes.map((t: string) => (
                    <span key={t} style={{ fontSize: 12, color: '#555550', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '4px 10px', borderRadius: 8 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            {sermonFit.length > 0 && (
              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '0.75rem' }}>Sermon series fit</p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {sermonFit.map((s: string) => (
                    <span key={s} style={{ fontSize: 12, color: '#555550', background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.10)', padding: '4px 10px', borderRadius: 8 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            {Object.keys(audienceFit).length > 0 && (
              <div>
                <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '0.75rem' }}>Audience fit</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, border: '0.5px solid rgba(0,0,0,0.10)', borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.06)' }}>
                  {[
                    { k: 'Maturity', v: audienceFit.spiritual_maturity },
                    { k: 'Age group', v: audienceFit.age_group },
                    { k: 'Service type', v: audienceFit.service_type },
                    { k: 'Visitor-friendly', v: audienceFit.visitor_friendliness },
                    { k: 'Special contexts', v: audienceFit.special_contexts },
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

        {/* Similar Songs */}
        {(similar.if_you_love_this?.length > 0 || similar.if_this_concerns_you?.length > 0) && (
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase' as const, color: '#999990', marginBottom: '1rem' }}>Similar songs</p>
            <div className="two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {similar.if_you_love_this?.length > 0 && (
                <div style={{ background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '1rem' }}>
                  <p style={{ fontSize: 11, color: '#3B6D11', fontWeight: 500, marginBottom: '0.5rem' }}>If you love this song</p>
                  {similar.if_you_love_this.map((s: any, i: number) => (
                    <p key={i} style={{ fontSize: 13, color: '#555550', fontWeight: 300, lineHeight: 1.6 }}>{s.title} — {s.artist}</p>
                  ))}
                </div>
              )}
              {similar.if_this_concerns_you?.length > 0 && (
                <div style={{ background: '#f7f6f3', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: '1rem' }}>
                  <p style={{ fontSize: 11, color: '#854F0B', fontWeight: 500, marginBottom: '0.5rem' }}>If this concerns you</p>
                  {similar.if_this_concerns_you.map((s: any, i: number) => (
                    <p key={i} style={{ fontSize: 13, color: '#555550', fontWeight: 300, lineHeight: 1.6 }}>{s.title} — {s.artist}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
