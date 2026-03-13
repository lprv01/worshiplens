#!/usr/bin/env node
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SONGS_DIR   = process.env.SONGS_DIR || path.join(__dirname, "../songs");
const OUTPUT_FILE = path.join(__dirname, "../worshiplens_top100.json");
const PROGRESS_FILE = path.join(__dirname, "../.analysis_progress.json");
const MODEL = "claude-sonnet-4-20250514";
const DELAY_MS = 1200;
const client = new Anthropic();

function parseChordPro(filepath) {
  const raw = fs.readFileSync(filepath, "utf8");
  const getTag = (tag) => {
    const m = raw.match(new RegExp(`\\{${tag}:\\s*(.+?)\\}`, "i"));
    return m ? m[1].trim() : null;
  };
  const title     = getTag("title");
  const artist    = getTag("artist");
  const key       = getTag("key");
  const timeSig   = getTag("time");
  const tempo     = getTag("tempo");
  const ccli      = getTag("ccli");
  const copyright = getTag("copyright");
  const sections = {};
  let currentSection = "intro";
  let currentLines = [];
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const commentMatch = line.match(/\{comment:\s*(.+?)\}/i);
    if (commentMatch) {
      if (currentLines.length) sections[currentSection] = currentLines.join("\n");
      currentSection = commentMatch[1].trim();
      currentLines = [];
      continue;
    }
    if (line.startsWith("{") || line.startsWith("CCLI") ||
        line.startsWith("©") || line.startsWith("For use")) continue;
    const clean = line.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
    if (clean) currentLines.push(clean);
  }
  if (currentLines.length) sections[currentSection] = currentLines.join("\n");
  const allLyricLines = lines
    .filter(l => !l.startsWith("{") && !l.startsWith("CCLI") &&
                 !l.startsWith("©") && !l.startsWith("For use"))
    .map(l => l.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const unique = new Set(allLyricLines.map(l => l.toLowerCase()));
  const repetitionRatio = allLyricLines.length > 0
    ? parseFloat((1 - unique.size / allLyricLines.length).toFixed(2)) : 0;
  return { title, artist, original_key: key, time_signature: timeSig,
    tempo_bpm: tempo ? parseInt(tempo, 10) || null : null,
    ccli_number: ccli, copyright, sections,
    lyrics_text: allLyricLines.join("\n"),
    repetition_ratio: repetitionRatio, source_file: path.basename(filepath) };
}

const SYSTEM_PROMPT = `You are WorshipLens, an expert theological review system for Baptist worship leaders (BGCT/Texas Baptists).
You analyze worship songs through five lenses and produce structured JSON reviews.
RULES:
- NEVER reproduce full lyrics — short fragments (3-5 words max) only as examples
- Pastoral tone — equip worship leaders, don't condemn songs
- Always include an Honest Concession
- Theological watchpoints framed as Scripture-based observations, not denominational critiques
- Scores are 0-10 (decimals allowed, e.g. 8.5)
- Score color: Green >=8.0 / Amber >=6.5 / Orange >=5.0 / Red <5.0
- Congregational vocal ideal: A3-D5
- Radio Test for Theological Clarity: could a secular station play this without knowing it's Christian worship?
Respond ONLY with valid JSON. No preamble, no markdown fences, no commentary.`;

function buildUserPrompt(song) {
  return `Analyze this worship song for WorshipLens and return a complete JSON review object.
SONG DATA:
Title: ${song.title}
Artist: ${song.artist}
CCLI #: ${song.ccli_number}
Original Key: ${song.original_key}
Time Signature: ${song.time_signature}
Tempo: ${song.tempo_bpm} BPM
Repetition Ratio: ${song.repetition_ratio}
LYRICS (clean, chords removed):
${song.lyrics_text.slice(0, 3000)}
Return EXACTLY this JSON structure:
{
  "recommended_key": "string",
  "vocal_range_original": "string (e.g. G3-E5)",
  "vocal_range_recommended": "string",
  "overall_score": number,
  "themes": ["string"],
  "scripture_connections": ["string"],
  "service_placement": "string",
  "sermon_fit": "string",
  "audience_profile": {
    "spiritual_maturity": "string (New Believer | Growing | Mature | All Levels)",
    "age_group": "string",
    "service_type": "string",
    "visitor_friendliness": "string (High | Medium | Low)",
    "notes": "string"
  },
  "lenses": {
    "scriptural_fidelity": { "score": number, "deduction_line": "string", "summary": "string" },
    "theological_clarity": { "score": number, "deduction_line": "string", "summary": "string", "radio_test_result": "string (Would Fail | Borderline | Would Pass)" },
    "congregational_singability": { "score": number, "deduction_line": "string", "summary": "string" },
    "poetic_lyrical_quality": { "score": number, "deduction_line": "string", "summary": "string" },
    "worship_leader_defense_brief": {
      "score": number, "deduction_line": "string", "summary": "string",
      "objections": [{ "objection": "string", "scripture_response": "string", "suggested_framing": "string" }],
      "honest_concession": "string"
    }
  },
  "full_review": "string (3-5 paragraphs, pastoral tone)",
  "similar_songs_if_you_like": ["string (title - artist)"],
  "similar_songs_if_concerned": ["string (title - artist)"]
}`;
}

async function analyzeSong(song) {
  const response = await client.messages.create({
    model: MODEL, max_tokens: 4000, system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(song) }],
  });
  let raw = response.content[0].text.trim();
  raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
  return JSON.parse(raw);
}

function scoreColor(score) {
  if (score >= 8.0) return "green";
  if (score >= 6.5) return "amber";
  if (score >= 5.0) return "orange";
  return "red";
}

function buildRecord(parsed, analysis) {
  const lenses = analysis.lenses || {};
  const lensKeys = ["scriptural_fidelity","theological_clarity","congregational_singability","poetic_lyrical_quality","worship_leader_defense_brief"];
  const lensScores = lensKeys.map(k => lenses[k]?.score || 0);
  const computedOverall = parseFloat((lensScores.reduce((a, b) => a + b, 0) / lensScores.length).toFixed(1));
  const defense = lenses.worship_leader_defense_brief || {};
  return {
    song: {
      title: parsed.title, artist: parsed.artist, ccli_number: parsed.ccli_number,
      copyright: parsed.copyright, original_key: parsed.original_key,
      recommended_key: analysis.recommended_key, vocal_range_original: analysis.vocal_range_original,
      vocal_range_recommended: analysis.vocal_range_recommended, tempo_bpm: parsed.tempo_bpm,
      time_signature: parsed.time_signature, themes: analysis.themes || [],
      scripture_connections: analysis.scripture_connections || [],
      service_placement: analysis.service_placement, sermon_fit: analysis.sermon_fit,
      audience_profile: analysis.audience_profile || {},
      similar_songs_if_you_like: analysis.similar_songs_if_you_like || [],
      similar_songs_if_concerned: analysis.similar_songs_if_concerned || [],
    },
    review: {
      full_review_text: analysis.full_review, overall_score: computedOverall,
      overall_score_color: scoreColor(computedOverall), repetition_ratio: parsed.repetition_ratio,
      analyzed_at: new Date().toISOString(),
    },
    lens_scores: [
      { lens_name: "Scriptural Fidelity", lens_key: "scriptural_fidelity", score: lenses.scriptural_fidelity?.score, score_color: scoreColor(lenses.scriptural_fidelity?.score || 0), deduction_line: lenses.scriptural_fidelity?.deduction_line, summary: lenses.scriptural_fidelity?.summary },
      { lens_name: "Theological Clarity", lens_key: "theological_clarity", score: lenses.theological_clarity?.score, score_color: scoreColor(lenses.theological_clarity?.score || 0), deduction_line: lenses.theological_clarity?.deduction_line, summary: lenses.theological_clarity?.summary, radio_test_result: lenses.theological_clarity?.radio_test_result },
      { lens_name: "Congregational Singability", lens_key: "congregational_singability", score: lenses.congregational_singability?.score, score_color: scoreColor(lenses.congregational_singability?.score || 0), deduction_line: lenses.congregational_singability?.deduction_line, summary: lenses.congregational_singability?.summary },
      { lens_name: "Poetic & Lyrical Quality", lens_key: "poetic_lyrical_quality", score: lenses.poetic_lyrical_quality?.score, score_color: scoreColor(lenses.poetic_lyrical_quality?.score || 0), deduction_line: lenses.poetic_lyrical_quality?.deduction_line, summary: lenses.poetic_lyrical_quality?.summary },
      { lens_name: "Worship Leader Defense Brief", lens_key: "worship_leader_defense_brief", score: defense.score, score_color: scoreColor(defense.score || 0), deduction_line: defense.deduction_line, summary: defense.summary },
    ],
    defense_brief: { objections: defense.objections || [], honest_concession: defense.honest_concession },
  };
}

function getUniqueFiles(dir) {
  const all = fs.readdirSync(dir).filter(f => f.endsWith(".txt"));
  return all.filter(fname => {
    const base = fname.replace(/\(\d+\)\.txt$/, ".txt");
    if (base !== fname && all.includes(base)) { console.log(`  Skipping duplicate: ${fname}`); return false; }
    return true;
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log("\n🎵 WorshipLens Analysis Pipeline\n" + "=".repeat(50));
  if (!process.env.ANTHROPIC_API_KEY) { console.error("ANTHROPIC_API_KEY not set"); process.exit(1); }
  if (!fs.existsSync(SONGS_DIR)) { console.error(`Songs directory not found: ${SONGS_DIR}`); process.exit(1); }
  let completed = {};
  if (fs.existsSync(PROGRESS_FILE)) {
    completed = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
    console.log(`  Resuming - ${Object.keys(completed).length} songs already done\n`);
  }
  let results = [];
  if (fs.existsSync(OUTPUT_FILE) && Object.keys(completed).length > 0) {
    results = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
  }
  const files = getUniqueFiles(SONGS_DIR);
  console.log(`  📂 ${files.length} unique songs to process\n`);
  const errors = [];
  for (let i = 0; i < files.length; i++) {
    const fname = files[i];
    const filepath = path.join(SONGS_DIR, fname);
    if (completed[fname]) { console.log(`  ✓ [${i+1}/${files.length}] Already done: ${fname}`); continue; }
    console.log(`\n  🔍 [${i+1}/${files.length}] ${fname}`);
    try {
      const parsed = parseChordPro(filepath);
      if (!parsed.title) { console.log(`      No title - skipping`); continue; }
      console.log(`      📖 "${parsed.title}" - ${parsed.artist}`);
      process.stdout.write(`      🤖 Analyzing...`);
      const analysis = await analyzeSong(parsed);
      const record = buildRecord(parsed, analysis);
      const score = record.review.overall_score;
      const emoji = { green: "🟢", amber: "🟡", orange: "🟠", red: "🔴" }[record.review.overall_score_color];
      console.log(` ${emoji} ${score}/10`);
      results.push(record);
      completed[fname] = true;
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(completed, null, 2));
      await sleep(DELAY_MS);
    } catch (err) {
      console.log(`\n      Error: ${err.message}`);
      errors.push({ file: fname, error: err.message });
      await sleep(2000);
    }
  }
  console.log(`\n✅ Done! ${results.length} songs analyzed`);
  if (errors.length) { errors.forEach(e => console.log(`   - ${e.file}: ${e.error}`)); }
  console.log(`\n📄 Output: worshiplens_top100.json`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
