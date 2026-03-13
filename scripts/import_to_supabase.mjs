import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const [key, ...vals] = line.split("=");
    if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const INPUT_FILE = path.join(__dirname, "../worshiplens_top100.json");

async function importAll() {
  console.log("\n🚀 WorshipLens Supabase Import\n" + "=".repeat(50));
  if (!fs.existsSync(INPUT_FILE)) {
    console.error("worshiplens_top100.json not found. Run parse_and_analyze.mjs first.");
    process.exit(1);
  }
  const records = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  console.log(`  📂 ${records.length} songs to import\n`);
  let imported = 0;
  const errors = [];
  for (const record of records) {
    const { song, review, lens_scores, defense_brief } = record;
    console.log(`  📥 "${song.title}" — ${song.artist}`);
    try {
      const { data: songData, error: songErr } = await supabase
        .from("songs").upsert(song, { onConflict: "ccli_number" }).select("id").single();
      if (songErr) throw new Error(`songs: ${songErr.message}`);
      const songId = songData.id;

      const { error: reviewErr } = await supabase
        .from("reviews").upsert({ ...review, song_id: songId }, { onConflict: "song_id" });
      if (reviewErr) throw new Error(`reviews: ${reviewErr.message}`);

      await supabase.from("lens_scores").delete().eq("song_id", songId);
      const { error: lensErr } = await supabase
        .from("lens_scores").insert(lens_scores.map(ls => ({ ...ls, song_id: songId })));
      if (lensErr) throw new Error(`lens_scores: ${lensErr.message}`);

      const { error: defenseErr } = await supabase.from("defense_brief").upsert(
        { song_id: songId, honest_concession: defense_brief.honest_concession, objections: defense_brief.objections },
        { onConflict: "song_id" }
      );
      if (defenseErr) throw new Error(`defense_brief: ${defenseErr.message}`);

      console.log(`      ✅ Done`);
      imported++;
    } catch (err) {
      console.log(`      ❌ ${err.message}`);
      errors.push({ song: song.title, error: err.message });
    }
  }
  console.log(`\n✅ ${imported} songs imported`);
  if (errors.length) errors.forEach(e => console.log(`   - ${e.song}: ${e.error}`));
}

importAll().catch(err => { console.error("Fatal:", err); process.exit(1); });
