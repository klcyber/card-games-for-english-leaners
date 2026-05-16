#!/usr/bin/env node
// Fix levels (NGSL frequency-based) + fill missing translations + fill missing definitions

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Japanese translations for all missing words ───────────────────────────────
const EXTRA_JP = {
  // TOEIC missing
  "apple":"リンゴ","arc":"弧","asleep":"眠って","auto":"自動","automatic":"自動の",
  "bake":"焼く","baseball":"野球","basket":"カゴ","basketball":"バスケットボール",
  "bathroom":"浴室","battery":"電池","biology":"生物学","birthday":"誕生日",
  "born":"生まれた","brake":"ブレーキ","bug":"虫","bye":"さようなら","cage":"ケージ",
  "cheeseburger":"チーズバーガー","circus":"サーカス","contraction":"短縮",
  "descriptive":"説明的な","dial":"ダイヤル","disgust":"嫌悪","dishwasher":"食洗機",
  "dislike":"嫌う","dissatisfy":"不満にする","distract":"気を散らす",
  "distraction":"気散じ","distractor":"妨害物","dive":"飛び込む","donut":"ドーナツ",
  "drastically":"大幅に","drought":"干ばつ","economically":"経済的に",
  "electronically":"電子的に","enthusiastically":"熱心に","entrée":"メインディッシュ",
  "environmentally":"環境的に","evenly":"均等に","exclusively":"専ら",
  "explanatory":"説明的な","explorer":"探検家","fax":"ファックス","firework":"花火",
  "flour":"小麦粉","flu":"インフルエンザ","generalization":"一般化","gram":"グラム",
  "graphics":"グラフィックス","housekeep":"家事をする","hungry":"空腹の",
  "incomplete":"不完全な","indirect":"間接的な","induction":"導入","inexperience":"経験不足",
  "inference":"推論","insert":"挿入する","intently":"真剣に","internationally":"国際的に",
  "intonation":"イントネーション","lab":"実験室","likewise":"同様に","ma'am":"奥様",
  "microscope":"顕微鏡","misplace":"置き忘れる","oblige":"義務付ける","occurrence":"発生",
  "outdate":"時代遅れにする","overcrowd":"混雑させる","overpay":"払いすぎる",
  "paraphrase":"言い換える","photocopier":"コピー機","photocopy":"コピー",
  "physics":"物理学","poster":"ポスター","purse":"財布","purser":"事務長",
  "rainfall":"降雨量","rainy":"雨の","refinery":"精製所","reflexive":"再帰的な",
  "refresh":"更新する","refreshment":"軽食","reopen":"再開する","repairperson":"修理工",
  "repeatedly":"繰り返し","repetition":"繰り返し","reproduce":"再現する","resemble":"似ている",
  "respondent":"回答者","restatement":"言い換え","reviewer":"評者","rewrite":"書き直す",
  "rider":"乗客","salespeople":"販売員","seaside":"海辺","seeker":"探す人",
  "seller":"売り手","sender":"送信者","serial":"連続の","sew":"縫う","sewer":"下水道",
  "sharply":"急激に","shortly":"まもなく","sightsee":"観光する","silently":"静かに",
  "skate":"スケートをする","skateboard":"スケートボード","sketch":"スケッチ","skim":"流し読みする",
  "sleepy":"眠い","sleeve":"袖","slot":"スロット","snack":"軽食","snowy":"雪の",
  "soap":"石鹸","soccer":"サッカー","specially":"特に","spill":"こぼす","spite":"悪意",
  "taker":"引き受ける人","tech":"技術","thirsty":"のどが渇いた","thunderstorm":"雷雨",
  "unattended":"無人の","unauthorize":"無許可にする","underline":"下線を引く",
  "unhappy":"不幸な","unplug":"プラグを抜く","unreal":"非現実の","unreliable":"信頼できない",
  "unspecified":"不特定の","unsure":"不確かな","unused":"未使用の","unusually":"異常に",
  "upcoming":"近づいている","upstairs":"上の階に","vacuum":"掃除機をかける","vend":"販売する",
  "ward":"病棟","whoever":"誰でも","windy":"風の強い",
  // TOEFL missing
  "airplane":"飛行機","classroom":"教室","descendent":"子孫","entrant":"参加者",
  "ex":"元〜","fin":"ヒレ","founds":"設立する","interestingly":"興味深いことに",
  "interviewer":"面接官","jazz":"ジャズ","junior":"下位の","micro":"微小な",
  "mid":"中間の","morphological":"形態論的な","multi":"複数の","neo":"新しい",
  "nest":"巣","nicely":"うまく","non":"非〜","nonetheless":"それにもかかわらず",
  "nonlinear":"非線形の","onwards":"前に","par":"同等","pardon":"許す",
  "parenthesis":"括弧","photographic":"写真の","pi":"円周率","pre":"前〜",
  "punch":"打つ","quiz":"クイズ","rack":"棚","rope":"縄","rub":"こする",
  "scripture":"聖典","scroll":"巻物","secrete":"分泌する","semi":"半〜","sin":"罪",
  "skip":"飛ばす","slab":"厚板","slash":"スラッシュ","snake":"ヘビ","sneeze":"くしゃみ",
  "sniff":"鼻をすする","socialize":"社交する","socially":"社会的に","sodium":"ナトリウム",
  "sophisticate":"洗練させる","span":"及ぶ","sperm":"精子","splice":"接合する",
  "sponsorship":"スポンサーシップ","sub":"副〜","super":"超〜","sword":"剣",
  "syntactic":"構文の","terribly":"ひどく","thumb":"親指","trans":"〜を超えた",
  "tricky":"扱いにくい","unintelligible":"理解不能な","uplift":"高める","urine":"尿",
  "volition":"意志","whichever":"どちらでも",
  // Daily missing
  "how":"どのように","more":"もっと","each":"それぞれ","among":"〜の中で",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
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

async function fetchFreeDictDef(word) {
  const data = await get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
  if (Array.isArray(data) && data[0]?.meanings?.[0]?.definitions?.[0]?.definition)
    return data[0].meanings[0].definitions[0].definition;
  return null;
}

async function fetchWikiDef(word) {
  const data = await get(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`);
  if (!data || typeof data !== 'object') return null;
  const entries = data.en || data[Object.keys(data)[0]];
  if (!Array.isArray(entries) || !entries[0]) return null;
  const def = entries[0].definitions?.[0]?.definition;
  return def ? def.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null;
}

async function fetchDef(word) {
  let def = await fetchFreeDictDef(word);
  if (def) return def;
  await sleep(80);
  return await fetchWikiDef(word);
}

// ── NGSL frequency map ─────────────────────────────────────────────────────────
function buildNgslRankMap() {
  const daily = JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','daily.json'),'utf8'));
  const map = new Map();
  daily.words.forEach((w, i) => map.set(w.word.toLowerCase(), i));
  return { map, total: daily.words.length };
}

function assignLevelByNgsl(word, ngslMap, ngslTotal) {
  const rank = ngslMap.get(word.toLowerCase());
  if (rank === undefined) return null; // not in NGSL
  const third = Math.floor(ngslTotal / 3);
  return rank < third ? 1 : rank < third * 2 ? 2 : 3;
}

// syllable count heuristic
function syllables(word) {
  return (word.toLowerCase().match(/[aeiouy]+/g) || []).length;
}

// ── Process one category file ──────────────────────────────────────────────────
async function processFile(cat, ngslMap, ngslTotal) {
  const file = path.join(__dirname, '..', 'data', `${cat}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const words = data.words;

  // 1. Fill missing Japanese translations instantly
  let trFixed = 0;
  words.forEach(w => {
    if (!w.translation) {
      const tr = EXTRA_JP[w.word];
      if (tr) { w.translation = tr; trFixed++; }
    }
  });
  console.log(`[${cat}] translations fixed instantly: ${trFixed}`);

  // 2. Assign levels
  if (cat === 'daily') {
    // NGSL is already frequency-ordered by index in daily.json
    const total = words.length;
    const third = Math.floor(total / 3);
    words.forEach((w, i) => {
      w.level = i < third ? 1 : i < third * 2 ? 2 : 3;
    });
    console.log(`[${cat}] levels set by frequency index`);
  } else {
    // TOEIC/TOEFL: in NGSL=level1, not-in-NGSL short=level2, long=level3
    words.forEach(w => {
      const rank = ngslMap.get(w.word.toLowerCase());
      if (rank !== undefined) {
        w.level = 1; // appears in everyday English → easiest
      } else {
        const syl = syllables(w.word);
        w.level = syl <= 2 ? 2 : 3;
      }
    });
    const l1=words.filter(w=>w.level===1).length;
    const l2=words.filter(w=>w.level===2).length;
    const l3=words.filter(w=>w.level===3).length;
    console.log(`[${cat}] levels: ★${l1} ★★${l2} ★★★${l3}`);
  }

  // 3. Fetch missing definitions
  const missing = words.filter(w => !w.definition);
  console.log(`[${cat}] fetching ${missing.length} missing definitions…`);

  let fetched = 0;
  for (let i = 0; i < missing.length; i++) {
    const w = missing[i];
    process.stdout.write(`  [${i+1}/${missing.length}] ${w.word} … `);
    const def = await fetchDef(w.word);
    if (def) { w.definition = def; fetched++; process.stdout.write('ok\n'); }
    else { process.stdout.write('-\n'); }
    await sleep(150);
    if ((i+1) % 100 === 0) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      console.log(`  ✓ saved progress (${i+1}/${missing.length})`);
    }
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  const stillNoDef = words.filter(w=>!w.definition).length;
  const stillNoTr  = words.filter(w=>!w.translation).length;
  console.log(`[${cat}] done. definitions fetched=${fetched}, still missing def=${stillNoDef}, tr=${stillNoTr}\n`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const { map: ngslMap, total: ngslTotal } = buildNgslRankMap();
  console.log(`NGSL reference: ${ngslTotal} words loaded\n`);

  for (const cat of ['toeic', 'toefl', 'daily']) {
    await processFile(cat, ngslMap, ngslTotal);
  }
  console.log('=== ALL DONE ===');
}

main().catch(console.error);
