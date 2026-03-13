// Run with: node setup_pages.mjs
// This creates all the WorshipLens website pages
import fs from "fs";
import path from "path";

const files = {

"app/page.tsx": `import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F0E0A] text-[#F5F0E8]">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#2A2820]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <span className="font-serif text-xl tracking-tight">WorshipLens</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#8A8070]">
          <Link href="/songs" className="hover:text-[#F5F0E8] transition-colors">Browse Songs</Link>
          <span className="text-xs px-2 py-1 rounded bg-[#1E1C16] border border-[#2A2820]">CCLI #365971</span>
        </div>
      </nav>

      <section className="px-8 pt-24 pb-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs text-[#8A8070] border border-[#2A2820] rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C4963C] animate-pulse"></span>
          Theological Review Platform for Worship Leaders
        </div>
        <h1 className="font-serif text-6xl md:text-7xl leading-[1.05] tracking-tight mb-6">
          Every song deserves<br />
          <span className="text-[#C4963C]">careful examination.</span>
        </h1>
        <p className="text-[#8A8070] text-xl max-w-2xl leading-relaxed mb-12">
          AI-powered theological reviews through five pastoral lenses — helping Baptist worship leaders choose songs with confidence, scripture, and integrity.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/songs" className="bg-[#C4963C] text-[#0F0E0A] px-8 py-3.5 rounded font-medium hover:bg-[#D4A64C] transition-colors text-sm">
            Browse Song Reviews
          </Link>
        </div>
      </section>

      <section className="px-8 py-20 border-t border-[#2A2820]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-[#8A8070] uppercase tracking-widest mb-10">The Five Lenses</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-[#2A2820]">
            {[
              { num: "01", name: "Scriptural Fidelity", desc: "Biblical accuracy & Word of Faith watchpoints" },
              { num: "02", name: "Theological Clarity", desc: "The Radio Test — distinctly Christian?" },
              { num: "03", name: "Congregational Singability", desc: "Range A3–D5, key recommendations" },
              { num: "04", name: "Poetic & Lyrical Quality", desc: "Grammar, imagery, repetition ratio" },
              { num: "05", name: "Defense Brief", desc: "Objections, scripture responses, honest concession" },
            ].map((lens) => (
              <div key={lens.num} className="bg-[#0F0E0A] p-6">
                <div className="text-[#C4963C] text-xs font-mono mb-3">{lens.num}</div>
                <div className="text-sm font-medium mb-2">{lens.name}</div>
                <div className="text-xs text-[#5A5448] leading-relaxed">{lens.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-16 border-t border-[#2A2820]">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-3">
          <p className="text-xs text-[#8A8070] uppercase tracking-widest w-full mb-3">Score Guide</p>
          {[
            { color: "#4CAF7C", range: "≥ 8.0 Green", desc: "Recommended" },
            { color: "#C4963C", range: "≥ 6.5 Amber", desc: "Use with context" },
            { color: "#D4703C", range: "≥ 5.0 Orange", desc: "Use with caution" },
            { color: "#C44C4C", range: "< 5.0 Red", desc: "Significant concerns" },
          ].map((s) => (
            <div key={s.range} className="flex items-center gap-3 bg-[#1A1814] border border-[#2A2820] rounded px-4 py-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></div>
              <div>
                <div className="text-sm">{s.range}</div>
                <div className="text-xs text-[#5A5448]">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-8 py-8 border-t border-[#2A2820] flex items-center justify-between text-xs text-[#4A4438]">
        <span>WorshipLens — First Baptist Church, Cedar Hill TX</span>
        <span>CCLI License #365971</span>
      </footer>
    </main>
  );
}
`,

"app/songs/page.tsx": `import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const scoreColors: Record<string, string> = {
  green: "#4CAF7C",
  amber: "#C4963C",
  orange: "#D4703C",
  red: "#C44C4C",
};

const scoreBg: Record<string, string> = {
  green: "bg-[#1A2E22]",
  amber: "bg-[#2E2210]",
  orange: "bg-[#2E1A10]",
  red: "bg-[#2E1010]",
};

export default async function SongsPage() {
  const { data: songs, error } = await supabase
    .from("songs")
    .select(\`
      id, title, artist, ccli_number, original_key, tempo_bpm, themes,
      reviews (overall_score, overall_score_color)
    \`)
    .order("title");

  if (error) {
    return (
      <main className="min-h-screen bg-[#0F0E0A] text-[#F5F0E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8A8070] mb-2">Database not connected yet.</p>
          <p className="text-xs text-[#4A4438]">Run the import script to populate songs.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F0E0A] text-[#F5F0E8]">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#2A2820]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <span className="font-serif text-xl tracking-tight">WorshipLens</span>
        </Link>
        <span className="text-xs text-[#8A8070]">{songs?.length ?? 0} songs reviewed</span>
      </nav>

      <div className="px-8 py-12 max-w-5xl mx-auto">
        <h1 className="font-serif text-4xl mb-2">Song Reviews</h1>
        <p className="text-[#8A8070] mb-10">Browse all analyzed songs with theological scores across five lenses.</p>

        {!songs || songs.length === 0 ? (
          <div className="text-center py-24 border border-[#2A2820] rounded">
            <p className="text-[#8A8070]">No songs yet — analysis pipeline is running.</p>
            <p className="text-xs text-[#4A4438] mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-px bg-[#2A2820]">
            {songs.map((song: any) => {
              const review = Array.isArray(song.reviews) ? song.reviews[0] : song.reviews;
              const score = review?.overall_score;
              const color = review?.overall_score_color ?? "green";
              return (
                <Link key={song.id} href={\`/songs/\${song.id}\`}
                  className="bg-[#0F0E0A] hover:bg-[#151310] transition-colors p-6 flex items-center justify-between group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-medium text-[#F5F0E8] group-hover:text-[#C4963C] transition-colors truncate">
                        {song.title}
                      </h2>
                      {song.ccli_number && (
                        <span className="text-xs text-[#4A4438] flex-shrink-0">#{song.ccli_number}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#5A5448]">
                      <span>{song.artist}</span>
                      {song.original_key && <span>Key of {song.original_key}</span>}
                      {song.tempo_bpm && <span>{song.tempo_bpm} BPM</span>}
                    </div>
                    {song.themes && song.themes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {song.themes.slice(0, 3).map((theme: string) => (
                          <span key={theme} className="text-xs px-2 py-0.5 rounded-full bg-[#1A1814] border border-[#2A2820] text-[#5A5448]">
                            {theme}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {score && (
                    <div className={\`flex-shrink-0 ml-6 w-14 h-14 rounded flex items-center justify-center \${scoreBg[color]}\`}>
                      <div className="text-center">
                        <div className="text-lg font-bold" style={{ color: scoreColors[color] }}>{score}</div>
                        <div className="text-xs" style={{ color: scoreColors[color] }}>/ 10</div>
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
`,

"app/songs/[id]/page.tsx": `import { createClient } from "@supabase/supabase-js";
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
  const { data: song } = await supabase
    .from("songs")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!song) return notFound();

  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("song_id", params.id)
    .single();

  const { data: lenses } = await supabase
    .from("lens_scores")
    .select("*")
    .eq("song_id", params.id)
    .order("lens_key");

  const { data: defense } = await supabase
    .from("defense_brief")
    .select("*")
    .eq("song_id", params.id)
    .single();

  const color = review?.overall_score_color ?? "green";

  return (
    <main className="min-h-screen bg-[#0F0E0A] text-[#F5F0E8]">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#2A2820]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <span className="font-serif text-xl tracking-tight">WorshipLens</span>
        </Link>
        <Link href="/songs" className="text-sm text-[#8A8070] hover:text-[#F5F0E8] transition-colors">
          ← All Songs
        </Link>
      </nav>

      <div className="px-8 py-12 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-6">
          <div className="flex-1">
            <h1 className="font-serif text-4xl mb-2">{song.title}</h1>
            <p className="text-[#8A8070] text-lg mb-1">{song.artist}</p>
            <div className="flex flex-wrap gap-4 text-xs text-[#5A5448]">
              {song.ccli_number && <span>CCLI #{song.ccli_number}</span>}
              {song.original_key && <span>Key of {song.original_key} → Recommended: {song.recommended_key}</span>}
              {song.tempo_bpm && <span>{song.tempo_bpm} BPM</span>}
              {song.time_signature && <span>{song.time_signature}</span>}
            </div>
          </div>
          {review && (
            <div className={\`flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center \${scoreBg[color]}\`}>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: scoreColors[color] }}>{review.overall_score}</div>
                <div className="text-xs" style={{ color: scoreColors[color] }}>/ 10</div>
              </div>
            </div>
          )}
        </div>

        {/* Technical data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#2A2820] mb-8">
          {[
            { label: "Original Key", value: song.original_key },
            { label: "Recommended Key", value: song.recommended_key },
            { label: "Vocal Range", value: song.vocal_range_recommended },
            { label: "Tempo", value: song.tempo_bpm ? \`\${song.tempo_bpm} BPM\` : null },
          ].filter(d => d.value).map(d => (
            <div key={d.label} className="bg-[#0F0E0A] px-5 py-4">
              <div className="text-xs text-[#5A5448] mb-1">{d.label}</div>
              <div className="text-sm font-medium">{d.value}</div>
            </div>
          ))}
        </div>

        {/* Themes & Scripture */}
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

        {/* Service info */}
        {(song.service_placement || song.sermon_fit) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#2A2820] mb-8">
            {song.service_placement && (
              <div className="bg-[#0F0E0A] p-5">
                <p className="text-xs text-[#5A5448] mb-1">Service Placement</p>
                <p className="text-sm text-[#A09080]">{song.service_placement}</p>
              </div>
            )}
            {song.sermon_fit && (
              <div className="bg-[#0F0E0A] p-5">
                <p className="text-xs text-[#5A5448] mb-1">Sermon Fit</p>
                <p className="text-sm text-[#A09080]">{song.sermon_fit}</p>
              </div>
            )}
          </div>
        )}

        {/* Five Lens Scores */}
        {lenses && lenses.length > 0 && (
          <div className="mb-8">
            <p className="text-xs text-[#8A8070] uppercase tracking-widest mb-4">Five Lens Review</p>
            <div className="grid gap-px bg-[#2A2820]">
              {lenses.map((lens: any) => (
                <div key={lens.id} className="bg-[#0F0E0A] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{lens.lens_name}</span>
                        {lens.radio_test_result && (
                          <span className="text-xs text-[#5A5448] border border-[#2A2820] px-2 py-0.5 rounded">
                            Radio Test: {lens.radio_test_result}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#8A8070] mb-2">{lens.summary}</p>
                      {lens.deduction_line && lens.deduction_line !== "No deductions" && (
                        <p className="text-xs text-[#C44C4C] italic">{lens.deduction_line}</p>
                      )}
                    </div>
                    <div className={\`flex-shrink-0 w-12 h-12 rounded flex items-center justify-center \${scoreBg[lens.score_color]}\`}>
                      <span className="text-lg font-bold" style={{ color: scoreColors[lens.score_color] }}>{lens.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full Review */}
        {review?.full_review_text && (
          <div className="mb-8">
            <p className="text-xs text-[#8A8070] uppercase tracking-widest mb-4">Full Review</p>
            <div className="bg-[#131210] border border-[#2A2820] rounded p-6 text-[#A09080] leading-relaxed text-sm space-y-4">
              {review.full_review_text.split("\\n\\n").map((para: string, i: number) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Defense Brief */}
        {defense && (
          <div className="mb-8">
            <p className="text-xs text-[#8A8070] uppercase tracking-widest mb-4">Worship Leader Defense Brief</p>
            <div className="space-y-3">
              {defense.objections?.map((obj: any, i: number) => (
                <div key={i} className="bg-[#131210] border border-[#2A2820] rounded p-5">
                  <p className="text-sm font-medium text-[#F5F0E8] mb-2">"{obj.objection}"</p>
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

        {/* Audience Profile */}
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
            {song.audience_profile.notes && (
              <p className="text-xs text-[#5A5448] mt-3 italic">{song.audience_profile.notes}</p>
            )}
          </div>
        )}

        {/* Similar Songs */}
        {(song.similar_songs_if_you_like?.length > 0 || song.similar_songs_if_concerned?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {song.similar_songs_if_you_like?.length > 0 && (
              <div className="bg-[#0F0E0A] border border-[#2A2820] rounded p-5">
                <p className="text-xs text-[#4CAF7C] uppercase tracking-widest mb-3">If You Like This</p>
                <ul className="space-y-1">
                  {song.similar_songs_if_you_like.map((s: string) => (
                    <li key={s} className="text-sm text-[#8A8070]">{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {song.similar_songs_if_concerned?.length > 0 && (
              <div className="bg-[#0F0E0A] border border-[#2A2820] rounded p-5">
                <p className="text-xs text-[#C4963C] uppercase tracking-widest mb-3">If This Concerns You</p>
                <ul className="space-y-1">
                  {song.similar_songs_if_concerned.map((s: string) => (
                    <li key={s} className="text-sm text-[#8A8070]">{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
`,

"app/layout.tsx": `import type { Metadata } from "next";
import { Playfair_Display, Crimson_Pro } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const crimson = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorshipLens — Theological Song Reviews",
  description: "AI-powered worship song theological review platform for Baptist worship leaders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={\`\${playfair.variable} \${crimson.variable}\`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
`,

"app/globals.css": `@import "tailwindcss";

:root {
  --font-serif: var(--font-serif);
  --font-body: var(--font-body);
}

body {
  font-family: var(--font-body), Georgia, serif;
}

.font-serif {
  font-family: var(--font-serif), "Playfair Display", Georgia, serif;
}

.font-body {
  font-family: var(--font-body), Georgia, serif;
}
`,

};

let count = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = filePath;
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log(\`✅ Created \${filePath}\`);
  count++;
}

console.log(\`\\n🎉 Done! \${count} files created. Your site is ready.\`);
console.log(\`\\nOpen http://localhost:3000 to see it!\`);
