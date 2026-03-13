import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const scoreColors: Record<string, string> = {
  green: "#4CAF7C", amber: "#C4963C", orange: "#D4703C", red: "#C44C4C",
};
const scoreBg: Record<string, string> = {
  green: "bg-[#1A2E22]", amber: "bg-[#2E2210]", orange: "bg-[#2E1A10]", red: "bg-[#2E1010]",
};

export default async function SongPage({ params }: { params: { id: string } }) {
  const { data: song } = await supabase.from("songs").select("*").eq("id", params.id).single();
  if (!song) return notFound();
  const { data: review } = await supabase.from("reviews").select("*").eq("song_id", params.id).single();
  const { data: lenses } = await supabase.from("lens_scores").select("*").eq("song_id", params.id);
  const { data: defense } = await supabase.from("defense_brief").select("*").eq("song_id", params.id).single();
  const color = review?.overall_score_color ?? "green";

  return (
    <main className="min-h-screen bg-[#0F0E0A] text-[#F5F0E8]">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#2A2820]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <span className="font-serif text-xl tracking-tight">WorshipLens</span>
        </Link>
        <Link href="/songs" className="text-sm text-[#8A8070] hover:text-[#F5F0E8] transition-colors">← All Songs</Link>
      </nav>
      <div className="px-8 py-12 max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-8 gap-6">
          <div className="flex-1">
            <h1 className="font-serif text-4xl mb-2">{song.title}</h1>
            <p className="text-[#8A8070] text-lg mb-1">{song.artist}</p>
            <div className="flex flex-wrap gap-4 text-xs text-[#5A5448]">
              {song.ccli_number && <span>CCLI #{song.ccli_number}</span>}
              {song.original_key && <span>Key of {song.original_key} → {song.recommended_key}</span>}
              {song.tempo_bpm && <span>{song.tempo_bpm} BPM</span>}
              {song.time_signature && <span>{song.time_signature}</span>}
            </div>
          </div>
          {review && (
            <div className={"flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center " + scoreBg[color]}>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: scoreColors[color] }}>{review.overall_score}</div>
                <div className="text-xs" style={{ color: scoreColors[color] }}>/10</div>
              </div>
            </div>
          )}
        </div>

        {song.themes?.length > 0 && (
          <div className="mb-8">
            <p className="text-xs text-[#8A8070] uppercase tracking-widest mb-3">Themes</p>
            <div className="flex flex-wrap gap-2">
              {song.themes.map((t: string) => (
                <span key={t} className="text-xs px-3 py-1 rounded-full bg-[#1A1814] border border-[#2A2820] text-[#A09080]">{t}</span>
              ))}
            </div>
          </div>
        )}

        {song.scripture_connections?.length > 0 && (
          <div className="mb-8">
            <p className="text-xs text-[#8A8070] uppercase tracking-widest mb-3">Scripture Connections</p>
            <div className="flex flex-wrap gap-2">
              {song.scripture_connections.map((s: string) => (
                <span key={s} className="text-xs px-3 py-1 rounded-full bg-[#1A1C14] border border-[#2A2C20] text-[#7A9070]">{s}</span>
              ))}
            </div>
          </div>
        )}

        {lenses && lenses.length > 0 && (
          <div className="mb-8">
            <p className="text-xs text-[#8A8070] uppercase tracking-widest mb-4">Five Lens Review</p>
            <div className="grid gap-px bg-[#2A2820]">
              {lenses.map((lens: any) => (
                <div key={lens.id} className="bg-[#0F0E0A] p-5 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{lens.lens_name}</p>
                    <p className="text-sm text-[#8A8070] mb-2">{lens.summary}</p>
                    {lens.deduction_line && lens.deduction_line !== "No deductions" && (
                      <p className="text-xs text-[#C44C4C] italic">{lens.deduction_line}</p>
                    )}
                  </div>
                  <div className={"flex-shrink-0 w-12 h-12 rounded flex items-center justify-center " + (scoreBg[lens.score_color] || scoreBg.green)}>
                    <span className="text-lg font-bold" style={{ color: scoreColors[lens.score_color] || scoreColors.green }}>{lens.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {review?.full_review_text && (
          <div className="mb-8">
            <p className="text-xs text-[#8A8070] uppercase tracking-widest mb-4">Full Review</p>
            <div className="bg-[#131210] border border-[#2A2820] rounded p-6 text-[#A09080] leading-relaxed text-sm space-y-4">
              {review.full_review_text.split("\n\n").map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {defense && (
          <div className="mb-8">
            <p className="text-xs text-[#8A8070] uppercase tracking-widest mb-4">Worship Leader Defense Brief</p>
            <div className="space-y-3">
              {defense.objections?.map((obj: any, i: number) => (
                <div key={i} className="bg-[#131210] border border-[#2A2820] rounded p-5">
                  <p className="text-sm font-medium mb-2">"{obj.objection}"</p>
                  <p className="text-sm text-[#7A9070] mb-2">{obj.scripture_response}</p>
                  <p className="text-xs text-[#5A5448] italic">{obj.suggested_framing}</p>
                </div>
              ))}
              {defense.honest_concession && (
                <div className="bg-[#1A1814] border border-[#C4963C]/20 rounded p-5">
                  <p className="text-xs text-[#C4963C] uppercase tracking-widest mb-2">Honest Concession</p>
                  <p className="text-sm text-[#A09080]">{defense.honest_concession}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {song.audience_profile && (
          <div className="mb-8">
            <p className="text-xs text-[#8A8070] uppercase tracking-widest mb-4">Audience Fit</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#2A2820]">
              {[
                { label: "Maturity", value: song.audience_profile.spiritual_maturity },
                { label: "Age Group", value: song.audience_profile.age_group },
                { label: "Service Type", value: song.audience_profile.service_type },
                { label: "Visitor-Friendly", value: song.audience_profile.visitor_friendliness },
              ].filter(d => d.value).map(d => (
                <div key={d.label} className="bg-[#0F0E0A] p-4">
                  <div className="text-xs text-[#5A5448] mb-1">{d.label}</div>
                  <div className="text-sm">{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
