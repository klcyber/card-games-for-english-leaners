#!/usr/bin/env node
// Fix level assignments (frequency-based) and fill missing definitions (Wiktionary)
// Usage: node scripts/fix-levels-and-defs.js [toeic|toefl|daily]

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const TARGET = process.argv[2] || 'toeic';
const FILE   = path.join(__dirname, '..', 'data', `${TARGET}.json`);
const PROG   = path.join(__dirname, '..', 'data', `.fix-${TARGET}-progress.json`);

function get(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'VocabCardGame/1.0' } }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(null); } });
    }).on('error', () => resolve(null));
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchFrequency(word) {
  const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=f&max=1`;
  const data = await get(url);
  if (!Array.isArray(data) || !data[0]) return 0;
  const match = data[0];
  // Only trust exact match
  if (match.word.toLowerCase() !== word.toLowerCase()) return 0;
  const tag = (match.tags || []).find(t => t.startsWith('f:'));
  return tag ? parseFloat(tag.slice(2)) : 0;
}

async function fetchWiktionary(word) {
  const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`;
  const data = await get(url);
  if (!data || typeof data !== 'object') return null;
  // data is { en: [ { partOfSpeech, definitions: [{definition}] } ] }
  const entries = data.en || data[Object.keys(data)[0]];
  if (!Array.isArray(entries) || !entries[0]) return null;
  const defs = entries[0].definitions;
  if (!Array.isArray(defs) || !defs[0]) return null;
  // Strip HTML tags
  return defs[0].definition.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

async function main() {
  const data  = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const words = data.words;
  const total = words.length;

  let prog = {};
  if (fs.existsSync(PROG)) {
    try { prog = JSON.parse(fs.readFileSync(PROG, 'utf8')); } catch {}
    console.log(`Resuming: ${Object.keys(prog).length} words done`);
  }

  console.log(`Processing ${total} words in ${TARGET}…`);

  let done = 0;
  for (let i = 0; i < total; i++) {
    const w = words[i];
    if (prog[w.word]) { done++; continue; }

    const needsDef  = !w.definition;
    const entry     = { freq: 0, def: w.definition || '' };

    process.stdout.write(`[${i+1}/${total}] ${w.word} `);

    // Always fetch frequency
    entry.freq = await fetchFrequency(w.word);
    process.stdout.write(`freq=${entry.freq.toFixed(1)} `);
    await sleep(120);

    // Fetch definition if missing
    if (needsDef) {
      const wikDef = await fetchWiktionary(w.word);
      if (wikDef) {
        entry.def = wikDef;
        process.stdout.write(`def=ok `);
      } else {
        process.stdout.write(`def=- `);
      }
      await sleep(150);
    }

    prog[w.word] = entry;
    done++;
    process.stdout.write('\n');

    if (done % 50 === 0) {
      fs.writeFileSync(PROG, JSON.stringify(prog));
      console.log(`  ✓ Saved progress (${done}/${total})`);
    }
  }

  fs.writeFileSync(PROG, JSON.stringify(prog));

  // Apply definitions
  words.forEach(w => {
    const p = prog[w.word];
    if (!p) return;
    if (!w.definition && p.def) w.definition = p.def;
  });

  // Assign levels by frequency rank
  // Sort by freq desc → rank 0 = most frequent = easiest (level 1)
  const withFreq = words.map((w, i) => ({ i, freq: (prog[w.word]?.freq || 0) }));
  withFreq.sort((a, b) => b.freq - a.freq);

  const third = Math.floor(total / 3);
  withFreq.forEach((item, rank) => {
    words[item.i].level = rank < third ? 1 : rank < third * 2 ? 2 : 3;
  });

  // Zero-frequency words (not found) → level 3
  words.forEach(w => {
    if (!prog[w.word] || prog[w.word].freq === 0) w.level = 3;
  });

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  fs.unlinkSync(PROG);
  console.log(`\n✅ Done! ${total} words updated in data/${TARGET}.json`);

  // Summary
  const l1 = words.filter(w => w.level === 1).length;
  const l2 = words.filter(w => w.level === 2).length;
  const l3 = words.filter(w => w.level === 3).length;
  const noDef = words.filter(w => !w.definition).length;
  console.log(`Level distribution: ★=${l1}  ★★=${l2}  ★★★=${l3}`);
  console.log(`Still no definition: ${noDef}`);
}

main().catch(console.error);
