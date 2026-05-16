#!/usr/bin/env node
// Assign difficulty levels based on word frequency (Datamuse API, parallel batching)
// Also fills missing Japanese translations and English definitions
// Run: node scripts/assign-levels-fast.js

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Missing Japanese translations ─────────────────────────────────────────────
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

// AWL sublist map (Coxhead 2000 Academic Word List)
// Sublist 1-3 = most frequent academic words → level 1 (easy)
// Sublist 4-7 → level 2 (medium)
// Sublist 8-10 = least frequent → level 3 (hard)
const AWL_SUBLISTS = {
  // Sublist 1
  analyse:1,approach:1,area:1,assess:1,assume:1,authority:1,available:1,
  benefit:1,concept:1,consist:1,constitute:1,context:1,contract:1,create:1,
  data:1,define:1,derive:1,distribute:1,economy:1,environment:1,establish:1,
  estimate:1,evident:1,export:1,factor:1,finance:1,formula:1,function:1,
  identify:1,income:1,indicate:1,individual:1,interpret:1,involve:1,issue:1,
  labour:1,legal:1,legislate:1,major:1,method:1,occur:1,percent:1,period:1,
  policy:1,principle:1,proceed:1,process:1,require:1,research:1,respond:1,
  role:1,section:1,sector:1,significant:1,similar:1,source:1,specific:1,
  structure:1,theory:1,vary:1,
  // Sublist 2
  achieve:2,acquire:2,administrate:2,affect:2,appropriate:2,aspect:2,assist:2,
  available:2,category:2,chapter:2,commission:2,community:2,complex:2,
  compute:2,conclude:2,conduct:2,consequent:2,construct:2,consume:2,credit:2,
  culture:2,design:2,distinct:2,element:2,evaluate:2,feature:2,final:2,
  focus:2,impact:2,injure:2,institute:2,invest:2,item:2,journal:2,maintain:2,
  normal:2,obtain:2,participate:2,perceive:2,positive:2,potential:2,
  previous:2,primary:2,purchase:2,range:2,region:2,regulate:2,relevant:2,
  reside:2,resource:2,restrict:2,secure:2,seek:2,select:2,site:2,strategy:2,
  survey:2,text:2,tradition:2,transfer:2,
  // Sublist 3
  alternative:3,circumstance:3,comment:3,compensate:3,component:3,
  considerable:3,constant:3,contribute:3,convene:3,coordinate:3,core:3,
  corporate:3,correspond:3,criteria:3,deduce:3,demonstrate:3,document:3,
  dominate:3,emphasis:3,ensure:3,exclude:3,framework:3,fund:3,illustrate:3,
  immigrate:3,imply:3,initial:3,instance:3,interact:3,justify:3,layer:3,
  link:3,locate:3,maximise:3,minor:3,negate:3,outcome:3,partner:3,
  philosophy:3,physical:3,proportion:3,publish:3,react:3,register:3,
  rely:3,remove:3,scheme:3,sequence:3,shift:3,specify:3,sufficient:3,
  task:3,technical:3,technique:3,technology:3,valid:3,volume:3,
  // Sublist 4
  access:4,adequate:4,annual:4,apparent:4,approximate:4,attitude:4,
  attribute:4,civil:4,code:4,commit:4,communicate:4,concentrate:4,
  confer:4,contrast:4,cycle:4,debate:4,despite:4,dimension:4,domestic:4,
  emerge:4,error:4,ethnic:4,goal:4,grant:4,hence:4,hypothesis:4,
  implement:4,implicate:4,impose:4,integrate:4,internal:4,investigate:4,
  job:4,label:4,mechanism:4,occupying:4,option:4,output:4,overall:4,
  parallel:4,parameter:4,phase:4,predict:4,principal:4,prior:4,
  professional:4,project:4,promote:4,regime:4,resolve:4,retain:4,
  series:4,statistic:4,status:4,stress:4,subsequent:4,sum:4,summary:4,
  undertake:4,
  // Sublist 5
  academy:5,adjust:5,alter:5,amend:5,aware:5,capacity:5,challenge:5,
  clause:5,compound:5,conflict:5,consult:5,contact:5,decline:5,discrete:5,
  draft:5,enable:5,energy:5,enforce:5,entity:5,equivalent:5,evolve:5,
  expand:5,expose:5,external:5,facilitate:5,fundamental:5,generate:5,
  generation:5,image:5,liberal:5,licence:5,logic:5,margin:5,medical:5,
  mental:5,modify:5,monitor:5,network:5,notion:5,objective:5,orient:5,
  perspective:5,precise:5,prime:5,psychology:5,pursue:5,ratio:5,reject:5,
  revenue:5,stable:5,style:5,substitute:5,sustain:5,symbol:5,target:5,
  transit:5,trend:5,version:5,welfare:5,whereas:5,
  // Sublist 6
  abstract:6,acknowledge:6,aggregate:6,allocate:6,assign:6,attach:6,
  author:6,bond:6,brief:6,capable:6,cite:6,cooperate:6,discriminate:6,
  display:6,diverse:6,domain:6,edit:6,enhance:6,estate:6,exceed:6,
  explicit:6,federal:6,fee:6,flexible:6,furthermore:6,gender:6,ignorance:6,
  incentive:6,incorporate:6,index:6,inhibit:6,input:6,instruct:6,
  intelligence:6,interval:6,lecture:6,migrate:6,ministry:6,minimum:6,
  motive:6,nevertheless:6,neutral:6,overseas:6,precede:6,presume:6,
  rational:6,recover:6,reveal:6,scope:6,subsidy:6,tape:6,transform:6,
  transport:6,underlie:6,utilise:6,
  // Sublist 7
  adapt:7,adult:7,advocate:7,aid:7,channel:7,chemical:7,classic:7,
  comprehensive:7,confirm:7,contrary:7,convert:7,couple:7,decade:7,
  definite:7,deny:7,differentiate:7,dispose:7,dynamic:7,eliminate:7,
  empirical:7,equip:7,extract:7,file:7,finite:7,foundation:7,globe:7,
  grade:7,guarantee:7,hierarchy:7,identical:7,ideology:7,infer:7,
  innovate:7,insert:7,intervene:7,isolate:7,media:7,mode:7,paradigm:7,
  phenomenon:7,priority:7,prohibit:7,publication:7,quote:7,release:7,
  reverse:7,simulate:7,sole:7,somewhat:7,submit:7,successor:7,survive:7,
  thesis:7,topic:7,transmit:7,ultimate:7,unique:7,visible:7,voluntary:7,
  // Sublist 8
  abandon:8,accompany:8,accumulate:8,ambiguous:8,appendix:8,arbitrary:8,
  automate:8,bias:8,chart:8,clarify:8,commodity:8,complement:8,
  contemporary:8,contradict:8,crucial:8,currency:8,denote:8,detect:8,
  deviate:8,displace:8,drama:8,eventual:8,exhibit:8,exploit:8,fluctuate:8,
  guideline:8,highlight:8,implicit:8,induce:8,inevitable:8,infrastructure:8,
  inspect:8,intense:8,manipulate:8,minimise:8,nuclear:8,offset:8,
  paragraph:8,plus:8,predominant:8,prospect:8,practitioner:8,random:8,
  radical:8,reinforce:8,restore:8,revise:8,schedule:8,tense:8,terminate:8,
  thereby:8,uniform:8,via:8,virtual:8,visual:8,widespread:8,
  // Sublist 9
  accommodate:9,analogy:9,anticipate:9,assure:9,attain:9,behalf:9,bulk:9,
  cease:9,coherent:9,coincide:9,commence:9,compatible:9,concurrent:9,
  confine:9,controversy:9,converse:9,devote:9,diminish:9,distort:9,
  duration:9,erode:9,ethic:9,format:9,found:9,inherent:9,insight:9,
  integral:9,intermediate:9,manual:9,mature:9,mediate:9,military:9,
  minimal:9,mutual:9,norm:9,overlap:9,passive:9,portion:9,preliminary:9,
  protocol:9,qualitative:9,refine:9,relax:9,restrain:9,revolution:9,
  rigid:9,route:9,scenario:9,sphere:9,subordinate:9,supplement:9,
  suspend:9,team:9,temporary:9,trigger:9,unify:9,violate:9,vision:9,
  // Sublist 10
  adjacent:10,albeit:10,assemble:10,collapse:10,colleague:10,compile:10,
  conceive:10,convince:10,depress:10,encounter:10,enormous:10,forthcoming:10,
  incline:10,integrity:10,intrinsic:10,invoke:10,levy:10,likewise:10,
  nonetheless:10,notwithstanding:10,odd:10,ongoing:10,panel:10,persist:10,
  pose:10,reluctance:10,straightforward:10,undergo:10,whereby:10,
};

// Map AWL sublist to game level
function awlToLevel(sublist) {
  if (sublist <= 3) return 1;
  if (sublist <= 7) return 2;
  return 3;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
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

// Datamuse: returns frequency score (per million) for exact word match
async function fetchFreq(word) {
  const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=f&max=1`;
  const data = await get(url);
  if (!Array.isArray(data) || !data[0]) return 0;
  const match = data[0];
  if (match.word.toLowerCase() !== word.toLowerCase()) return 0;
  const tag = (match.tags || []).find(t => t.startsWith('f:'));
  return tag ? parseFloat(tag.slice(2)) : 0;
}

// Fetch frequencies for a batch of words in parallel
async function fetchFreqBatch(words) {
  return Promise.all(words.map(w => fetchFreq(w)));
}

// FreeDictionary → Wiktionary fallback for definitions
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
  await sleep(50);
  return await fetchWikiDef(word);
}

// ── Frequency-based level assignment ─────────────────────────────────────────
async function assignLevelsByFrequency(words, label) {
  const BATCH = 20;
  const freqMap = new Map();

  console.log(`\n[${label}] Fetching frequencies for ${words.length} words (${Math.ceil(words.length/BATCH)} batches)…`);

  for (let i = 0; i < words.length; i += BATCH) {
    const batch = words.slice(i, i + BATCH);
    const freqs = await fetchFreqBatch(batch.map(w => w.word));
    batch.forEach((w, j) => freqMap.set(w.word, freqs[j]));
    process.stdout.write(`  batch ${Math.floor(i/BATCH)+1}/${Math.ceil(words.length/BATCH)}\r`);
    await sleep(200); // small delay between batches
  }
  process.stdout.write('\n');

  // Sort by frequency descending (most frequent = easiest = level 1)
  const ranked = words
    .map(w => ({ word: w.word, freq: freqMap.get(w.word) || 0 }))
    .sort((a, b) => b.freq - a.freq);

  const third = Math.floor(ranked.length / 3);
  const levelMap = new Map();
  ranked.forEach((item, rank) => {
    // Words with zero frequency (not found) → level 3
    levelMap.set(item.word, item.freq === 0 ? 3 : (rank < third ? 1 : rank < third * 2 ? 2 : 3));
  });

  // Apply levels
  words.forEach(w => { w.level = levelMap.get(w.word) || 3; });

  const l1 = words.filter(w => w.level === 1).length;
  const l2 = words.filter(w => w.level === 2).length;
  const l3 = words.filter(w => w.level === 3).length;
  const zeroFreq = ranked.filter(r => r.freq === 0).length;
  console.log(`[${label}] Level distribution: ★=${l1} ★★=${l2} ★★★=${l3} (${zeroFreq} words had zero freq → level 3)`);

  return freqMap;
}

// ── TOEFL: AWL sublist first, Datamuse for the rest ──────────────────────────
async function assignToeflLevels(words) {
  console.log(`\n[toefl] Assigning levels (AWL sublist → Datamuse fallback)…`);

  const awlAssigned = [];
  const needsFreq = [];

  words.forEach(w => {
    const sublist = AWL_SUBLISTS[w.word.toLowerCase()];
    if (sublist) {
      w.level = awlToLevel(sublist);
      awlAssigned.push(w.word);
    } else {
      needsFreq.push(w);
    }
  });

  console.log(`[toefl] AWL sublist assigned: ${awlAssigned.length}, need Datamuse: ${needsFreq.length}`);

  if (needsFreq.length > 0) {
    await assignLevelsByFrequency(needsFreq, 'toefl-datamuse');
  }

  const l1 = words.filter(w => w.level === 1).length;
  const l2 = words.filter(w => w.level === 2).length;
  const l3 = words.filter(w => w.level === 3).length;
  console.log(`[toefl] Final level distribution: ★=${l1} ★★=${l2} ★★★=${l3}`);
}

// ── Fill missing definitions ──────────────────────────────────────────────────
async function fillDefinitions(words, label) {
  const missing = words.filter(w => !w.definition);
  if (missing.length === 0) {
    console.log(`[${label}] No missing definitions.`);
    return;
  }

  console.log(`\n[${label}] Fetching ${missing.length} missing definitions…`);
  let fetched = 0;

  for (let i = 0; i < missing.length; i++) {
    const w = missing[i];
    const def = await fetchDef(w.word);
    if (def) { w.definition = def; fetched++; }
    if ((i + 1) % 50 === 0) {
      process.stdout.write(`  ${i+1}/${missing.length} (${fetched} found)\r`);
    }
    await sleep(100);
  }
  process.stdout.write('\n');

  const stillMissing = words.filter(w => !w.definition).length;
  console.log(`[${label}] Definitions: fetched=${fetched}, still missing=${stillMissing}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const dataDir = path.join(__dirname, '..', 'data');

  // Load files
  const toeicData = JSON.parse(fs.readFileSync(path.join(dataDir, 'toeic.json'), 'utf8'));
  const toeflData = JSON.parse(fs.readFileSync(path.join(dataDir, 'toefl.json'), 'utf8'));
  const dailyData = JSON.parse(fs.readFileSync(path.join(dataDir, 'daily.json'), 'utf8'));

  // Step 1: Fill missing Japanese translations
  console.log('=== Step 1: Fill missing translations ===');
  let trFixed = 0;
  for (const data of [toeicData, toeflData, dailyData]) {
    data.words.forEach(w => {
      if (!w.translation) {
        const tr = EXTRA_JP[w.word];
        if (tr) { w.translation = tr; trFixed++; }
      }
    });
  }
  console.log(`Fixed ${trFixed} missing translations instantly.`);

  // Step 2: Assign levels
  console.log('\n=== Step 2: Assign difficulty levels ===');

  // TOEIC: parallel Datamuse frequency
  await assignLevelsByFrequency(toeicData.words, 'toeic');
  fs.writeFileSync(path.join(dataDir, 'toeic.json'), JSON.stringify(toeicData, null, 2));
  console.log('[toeic] Saved.');

  // TOEFL: AWL sublist + Datamuse
  await assignToeflLevels(toeflData.words);
  fs.writeFileSync(path.join(dataDir, 'toefl.json'), JSON.stringify(toeflData, null, 2));
  console.log('[toefl] Saved.');

  // Daily: by frequency index (words already in NGSL frequency order)
  {
    const total = dailyData.words.length;
    const third = Math.floor(total / 3);
    dailyData.words.forEach((w, i) => {
      w.level = i < third ? 1 : i < third * 2 ? 2 : 3;
    });
    const l1 = dailyData.words.filter(w=>w.level===1).length;
    const l2 = dailyData.words.filter(w=>w.level===2).length;
    const l3 = dailyData.words.filter(w=>w.level===3).length;
    console.log(`[daily] Levels by NGSL frequency index: ★=${l1} ★★=${l2} ★★★=${l3}`);
    fs.writeFileSync(path.join(dataDir, 'daily.json'), JSON.stringify(dailyData, null, 2));
    console.log('[daily] Saved.');
  }

  // Step 3: Fill missing definitions
  console.log('\n=== Step 3: Fill missing definitions ===');
  await fillDefinitions(toeicData.words, 'toeic');
  fs.writeFileSync(path.join(dataDir, 'toeic.json'), JSON.stringify(toeicData, null, 2));

  await fillDefinitions(toeflData.words, 'toefl');
  fs.writeFileSync(path.join(dataDir, 'toefl.json'), JSON.stringify(toeflData, null, 2));

  await fillDefinitions(dailyData.words, 'daily');
  fs.writeFileSync(path.join(dataDir, 'daily.json'), JSON.stringify(dailyData, null, 2));

  // Final summary
  console.log('\n=== DONE ===');
  for (const [label, data] of [['toeic', toeicData], ['toefl', toeflData], ['daily', dailyData]]) {
    const l1 = data.words.filter(w=>w.level===1).length;
    const l2 = data.words.filter(w=>w.level===2).length;
    const l3 = data.words.filter(w=>w.level===3).length;
    const noDef = data.words.filter(w=>!w.definition).length;
    const noTr  = data.words.filter(w=>!w.translation).length;
    console.log(`[${label}] ★=${l1} ★★=${l2} ★★★=${l3} | missing def=${noDef} tr=${noTr}`);
  }
}

main().catch(console.error);
