import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const scoreColors: Record<string, string> = {
  green: "#4CAF7C", amber: "#C4963C", orange: "#D4703C", red: "#C44C4C",
};

export default async function SongsPage() {
  const { data: songs } = await supabase
    .from("songs")
    .select("id, slug, title, artist, ccli_number, key_original, tempo_bpm, themes, overall_score, score_color, recommendation")
    .order("title");

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
            <p className="text-[#8A8070]">Analysis pipeline is running — check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-px bg-[#2A2820]">
            {songs.map((song: any) => {
              const color = song.score_color ?? "green";
              const scoreVal = song.overall_score ?? 0;
              // Use slug for URL, fall back to id if slug missing
              const href = "/songs/" + (song.slug || song.id);
              return (
                <Link key={song.id} href={href}
                  className="bg-[#0F0E0A] hover:bg-[#151310] transition-colors p-6 flex items-center justify-between group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-medium group-hover:text-[#C4963C] transition-colors truncate">{song.title}</h2>
                      {song.ccli_number && <span className="text-xs text-[#4A4438] flex-shrink-0">#{song.ccli_number}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#6A6050]">
                      <span>{song.artist}</span>
                      {song.key_original && <span>Key of {song.key_original}</span>}
                      {song.tempo_bpm && <span>{song.tempo_bpm} BPM</span>}
                    </div>
                    {song.themes?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {song.themes.slice(0, 3).map((t: string) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded border border-[#2A2820] text-[#6A6050]">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-6 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-serif font-medium" style={{ color: scoreColors[color] ?? scoreColors.green }}>
                        {scoreVal.toFixed(1)}
                      </div>
                      <div className="text-xs text-[#6A6050]">/10</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
