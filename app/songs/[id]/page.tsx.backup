import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

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

export default async function SongsPage() {
  const { data: songs } = await supabase
    .from("songs")
    .select("id, title, artist, ccli_number, original_key, tempo_bpm, themes, reviews(overall_score, overall_score_color)")
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
              const review = Array.isArray(song.reviews) ? song.reviews[0] : song.reviews;
              const color = review?.overall_score_color ?? "green";
              return (
                <Link key={song.id} href={"/songs/" + song.id}
                  className="bg-[#0F0E0A] hover:bg-[#151310] transition-colors p-6 flex items-center justify-between group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-medium group-hover:text-[#C4963C] transition-colors truncate">{song.title}</h2>
                      {song.ccli_number && <span className="text-xs text-[#4A4438] flex-shrink-0">#{song.ccli_number}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#5A5448]">
                      <span>{song.artist}</span>
                      {song.original_key && <span>Key of {song.original_key}</span>}
                      {song.tempo_bpm && <span>{song.tempo_bpm} BPM</span>}
                    </div>
                  </div>
                  {review?.overall_score && (
                    <div className={"flex-shrink-0 ml-6 w-14 h-14 rounded flex items-center justify-center " + scoreBg[color]}>
                      <div className="text-center">
                        <div className="text-lg font-bold" style={{ color: scoreColors[color] }}>{review.overall_score}</div>
                        <div className="text-xs" style={{ color: scoreColors[color] }}>/10</div>
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
