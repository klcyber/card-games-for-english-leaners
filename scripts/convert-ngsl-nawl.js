#!/usr/bin/env node
// Convert NGSL.csv → daily.json, NAWL.csv → toefl.json
// NAWL: rank-ordered (rank 1 = most frequent = easiest)
// NGSL: alphabetical → levels assigned via NAWL rank cross-reference

const fs   = require('fs');
const path = require('path');

function parseCSV(text) {
  const lines = text.split('\n');
  const rows  = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    // simple CSV parse: handle quoted fields
    const cols = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else { cur += c; }
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

function cleanDef(s) {
  return s.replace(/\xa0/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Parse NAWL.csv ────────────────────────────────────────────────────────────
// Columns: Rank, Lemma, POS, Definition, JP Translation
const nawlText = fs.readFileSync(path.join(__dirname, '..', 'NAWL.csv'), 'utf8')
  .replace(/^﻿/, ''); // strip BOM
const nawlRows = parseCSV(nawlText).slice(1); // skip header

// Deduplicate: keep first occurrence of each word
const nawlSeen = new Set();
const nawlWords = [];
for (const row of nawlRows) {
  const word = (row[1] || '').trim();
  const rank = parseInt(row[0]) || 9999;
  const def  = cleanDef(row[3] || '');
  const jp   = (row[4] || '').trim();
  if (!word || nawlSeen.has(word.toLowerCase())) continue;
  nawlSeen.add(word.toLowerCase());
  nawlWords.push({ word, rank, definition: def, translation: jp });
}

nawlWords.sort((a, b) => a.rank - b.rank); // ensure sorted by rank

const nawlTotal = nawlWords.length;
const nawlThird = Math.floor(nawlTotal / 3);
nawlWords.forEach((w, i) => {
  w.level = i < nawlThird ? 1 : i < nawlThird * 2 ? 2 : 3;
});

// Build rank map for NGSL level cross-reference
const nawlRankMap = new Map();
nawlWords.forEach(w => nawlRankMap.set(w.word.toLowerCase(), w.rank));

console.log(`NAWL: ${nawlTotal} unique words`);
const n1=nawlWords.filter(w=>w.level===1).length;
const n2=nawlWords.filter(w=>w.level===2).length;
const n3=nawlWords.filter(w=>w.level===3).length;
console.log(`  Level distribution: ★=${n1} ★★=${n2} ★★★=${n3}`);
console.log(`  Sample L1: ${nawlWords.filter(w=>w.level===1).slice(0,6).map(w=>w.word).join(', ')}`);
console.log(`  Sample L3: ${nawlWords.filter(w=>w.level===3).slice(-6).map(w=>w.word).join(', ')}`);

// ── Save toefl.json ───────────────────────────────────────────────────────────
const toeflOut = {
  category: 'toefl',
  source: 'NAWL (New Academic Word List) with Japanese translations',
  words: nawlWords.map((w, i) => ({
    id: `f${String(i+1).padStart(4,'0')}`,
    word: w.word,
    translation: w.translation,
    definition: w.definition,
    level: w.level,
  }))
};
fs.writeFileSync(path.join(__dirname, '..', 'data', 'toefl.json'),
  JSON.stringify(toeflOut, null, 2));
console.log(`\n✅ toefl.json saved (${nawlTotal} words)`);

// ── Parse NGSL.csv ────────────────────────────────────────────────────────────
// Columns: Meanings (word), English Definition, POS, J Translation
const ngslText = fs.readFileSync(path.join(__dirname, '..', 'NGSL.csv'), 'utf8')
  .replace(/^﻿/, ''); // strip BOM
const ngslRows = parseCSV(ngslText).slice(1); // skip header

const ngslSeen = new Set();
const ngslWords = [];
for (const row of ngslRows) {
  const word = (row[0] || '').trim();
  const def  = cleanDef(row[1] || '');
  const jp   = (row[3] || '').trim();
  if (!word || ngslSeen.has(word.toLowerCase())) continue;
  ngslSeen.add(word.toLowerCase());

  // Assign level via NAWL rank cross-reference
  const rank = nawlRankMap.get(word.toLowerCase());
  let level;
  if (rank !== undefined) {
    level = rank <= nawlThird ? 1 : rank <= nawlThird * 2 ? 2 : 3;
  } else {
    level = 3; // not in NAWL (rare word)
  }

  ngslWords.push({ word, definition: def, translation: jp, level });
}

// Sort by level then alphabetically within level
ngslWords.sort((a, b) => a.level - b.level || a.word.localeCompare(b.word));

const ngslTotal = ngslWords.length;
const g1=ngslWords.filter(w=>w.level===1).length;
const g2=ngslWords.filter(w=>w.level===2).length;
const g3=ngslWords.filter(w=>w.level===3).length;
console.log(`\nNGSL: ${ngslTotal} unique words`);
console.log(`  Level distribution: ★=${g1} ★★=${g2} ★★★=${g3}`);
console.log(`  Sample L1: ${ngslWords.filter(w=>w.level===1).slice(0,6).map(w=>w.word).join(', ')}`);
console.log(`  Sample L3: ${ngslWords.filter(w=>w.level===3).slice(0,6).map(w=>w.word).join(', ')}`);

// ── Save daily.json ───────────────────────────────────────────────────────────
const dailyOut = {
  category: 'daily',
  source: 'NGSL (New General Service List) with Japanese translations',
  words: ngslWords.map((w, i) => ({
    id: `d${String(i+1).padStart(4,'0')}`,
    word: w.word,
    translation: w.translation,
    definition: w.definition,
    level: w.level,
  }))
};
fs.writeFileSync(path.join(__dirname, '..', 'data', 'daily.json'),
  JSON.stringify(dailyOut, null, 2));
console.log(`\n✅ daily.json saved (${ngslTotal} words)`);

// ── Missing check ─────────────────────────────────────────────────────────────
console.log('\n── Missing data check ──');
const tNoDef = nawlWords.filter(w=>!w.definition).length;
const tNoJp  = nawlWords.filter(w=>!w.translation).length;
const gNoDef = ngslWords.filter(w=>!w.definition).length;
const gNoJp  = ngslWords.filter(w=>!w.translation).length;
console.log(`TOEFL (NAWL): no def=${tNoDef}, no JP=${tNoJp}`);
console.log(`Daily (NGSL): no def=${gNoDef}, no JP=${gNoJp}`);
console.log('\n=== DONE ===');
