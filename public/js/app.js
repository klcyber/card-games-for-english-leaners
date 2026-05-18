// ─── Single-page app — one socket connection throughout ───────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// i18n — 言語切替
// ══════════════════════════════════════════════════════════════════════════════

const strings = {
  en: {
    title: 'VOCAB CARD GAME',
    subtitle: 'Master English vocabulary through card games',
    tabJoin: 'Join Room', tabCreate: 'Create Room',
    labelName: 'Your Name', labelCode: 'Room Code', labelHostName: 'Your Name (Host)',
    phName: 'e.g. Yamada Taro', phCode: 'e.g. A3F7', phHostName: 'e.g. Tanaka Sensei',
    btnJoin: 'Join Game', btnCreate: 'Create Room',
    btnLeave: '← Leave', roomCodeLabel: 'Room Code', hostBadge: 'Host',
    playersTitle: 'Players', settingsTitle: 'Game Settings',
    labelCategory: 'Category', labelLevel: 'Level',
    labelCsv: 'CSV File (Term, Definition)', csvHint: 'Quizlet CSV exports work!',
    csvTemplate: 'Template DL',
    csvHelpTitle: 'CSV File Format', csvHelpDesc: 'One word per line, comma or tab separated.',
    csvHelpNote1: '· Col 1: English word (required)', csvHelpNote2: '· Col 2: Japanese translation (required)',
    csvHelpNote3: '· Col 3: English definition (optional)', csvHelpNote4: '· Quizlet exports work as-is',
    csvHelpDl: 'Download Template',
    labelPattern: 'Card Pattern', labelGame: 'Game Type',
    patJp: 'English + Japanese', patEn: 'English + Definition',
    gameConc: 'Concentration', gameOld: 'Old Maid',
    labelPairs: 'Pairs', labelCpu: 'CPU Opponents', cpuUnit: '',
    optDaily: 'Daily English', optCustom: 'Custom (CSV)',
    lvlAll: 'All Levels', lvl1: '★☆☆ Beginner', lvl2: '★★☆ Intermediate', lvl3: '★★★ Advanced',
    btnStart: 'Start Game',
    btnWordList: '📖 Word List',
    colWord: 'Word', colTranslation: 'Translation', colDefinition: 'Definition', colLevel: 'Lv',
    btnHome: '🏠 Home', titleConc: 'Concentration', titleOld: '🂡 Old Maid',
    dealTitle: 'Dealing Phase', dealSub: "Discard all your pairs, then press Ready",
    myHand: '🤚 Your Hand', handHint: "Tap 2 cards → discard if they're a pair",
    btnHint: '💡 Hint', btnReady: '✅ Ready', btnReadyDone: '✅ Ready!',
    btnDiscard: '🗑️ Discard Selected Pair',
    btnPass: "Keep it (Next Player's Turn)",
    drawnPrompt: '🃏 Card drawn! Discard a pair?',
    drawAreaMsg: '👆 Tap a card from the glowing opponent',
    btnReturnRoom: '🏠 Return to Room',
    myTurn: '🎯 Your turn!',
    theirTurn: n => `${n}'s turn`,
    dealing: 'Discard your pairs!',
    hintNone: '💡 No pairs',
    concTitle: '🎉 Results',
    oldTitle: '🎉 Game Over!',
    oldLoser: "😢 You're holding the Joker!",
    pairUnit: 'pairs',
    readyCount: (n, t) => `${n}/${t} Ready`,
    drawTarget: 'Draw from here!',
    errNotAPair: "❌ Not a pair! Try again.",
    errJokerCannotDiscard: "❌ You can't discard the Joker.",
    errNotInHand: "❌ Card not found in hand.",
    gameInProgress: "⏳ Game in progress. You'll join from the next game.",
    needMorePlayers: 'Need 2+ players (add CPU or invite someone)',
    qrLabel: 'Scan to open this site',
    qrClose: 'Close',
  },
  ja: {
    title: '英単語カードゲーム',
    subtitle: '神経衰弱・ババ抜きで英単語を覚えよう',
    tabJoin: 'ルームに参加', tabCreate: 'ルームを作成',
    labelName: 'お名前', labelCode: 'ルームコード', labelHostName: 'お名前（ホスト）',
    phName: '例: 山田太郎', phCode: '例: A3F7', phHostName: '例: 田中先生',
    btnJoin: '参加する', btnCreate: 'ルームを作成',
    btnLeave: '← 退出', roomCodeLabel: 'ルームコード', hostBadge: 'ホスト',
    playersTitle: '参加者', settingsTitle: 'ゲーム設定',
    labelCategory: 'カテゴリ', labelLevel: '難易度',
    labelCsv: 'CSVファイル（Term,Definition 形式）', csvHint: 'Quizlet のエクスポートCSVが使えます',
    csvTemplate: 'テンプレDL',
    csvHelpTitle: 'CSVファイルの形式', csvHelpDesc: '1行1語、カンマまたはタブ区切りで書いてください。',
    csvHelpNote1: '・1列目: 英単語（必須）', csvHelpNote2: '・2列目: 日本語訳（必須）',
    csvHelpNote3: '・3列目: 英語定義（任意）', csvHelpNote4: '・Quizletのエクスポートそのまま使えます',
    csvHelpDl: 'テンプレートをダウンロード',
    labelPattern: 'カードパターン', labelGame: 'ゲーム',
    patJp: '英語 ＋ 日本語訳', patEn: '英語 ＋ 英語の意味',
    gameConc: '神経衰弱', gameOld: 'ババ抜き',
    labelPairs: 'ペア数', labelCpu: 'CPU対戦相手', cpuUnit: '体',
    optDaily: '日常英会話', optCustom: 'カスタム（CSV）',
    lvlAll: '全レベル', lvl1: '★☆☆ 初級', lvl2: '★★☆ 中級', lvl3: '★★★ 上級',
    btnStart: 'ゲームを開始',
    btnWordList: '📖 単語一覧',
    colWord: '単語', colTranslation: '日本語', colDefinition: '英語定義', colLevel: 'Lv',
    btnHome: '🏠 ホーム', titleConc: '神経衰弱', titleOld: '🂡 ババ抜き',
    dealTitle: '配牌フェーズ', dealSub: '手持ちのペアを全て捨ててから「準備完了」を押してください',
    myHand: '🤚 あなたの手札', handHint: 'カードを2枚タップして選択 → ペアなら捨てられます',
    btnHint: '💡 ヒント', btnReady: '✅ 準備完了', btnReadyDone: '✅ 準備完了済み',
    btnDiscard: '🗑️ 選択した2枚を捨てる',
    btnPass: '捨てない（次へ）',
    drawnPrompt: '🃏 引きました！捨てますか？',
    drawAreaMsg: '👆 光っている相手の手札から1枚引いてください',
    btnReturnRoom: '🏠 ルームに戻る',
    myTurn: '🎯 あなたのターン！',
    theirTurn: n => `${n} のターン`,
    dealing: 'ペアを全て捨てよう！',
    hintNone: '💡 ペアなし',
    concTitle: '🎉 結果',
    oldTitle: '🎉 ゲーム終了！',
    oldLoser: '😢 あなたがジョーカーを引きました！',
    pairUnit: 'ペア',
    readyCount: (n, t) => `${n}/${t} 準備完了`,
    drawTarget: 'ここから引く！',
    errNotAPair: '❌ ペアではありません！もう一度考えてみよう',
    errJokerCannotDiscard: '❌ ジョーカーは捨てられません',
    errNotInHand: '❌ 手札にないカードです',
    gameInProgress: '⏳ ゲーム進行中です。終了後に次のゲームから参加できます。',
    needMorePlayers: '2人以上必要です（CPUを追加するか、もう1人招待してください）',
    qrLabel: 'スキャンしてアクセス',
    qrClose: '閉じる',
  },
};

let currentLang = localStorage.getItem('vcg-lang') || 'en';

function t(key, ...args) {
  const val = strings[currentLang][key];
  return typeof val === 'function' ? val(...args) : (val ?? key);
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('vcg-lang', lang);
  document.documentElement.lang = lang;

  // data-i18n テキスト
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = strings[lang][key];
    if (typeof val === 'string') el.textContent = val;
  });
  // data-i18n-ph プレースホルダー
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (strings[lang][key]) el.placeholder = strings[lang][key];
  });
  // select option テキスト
  document.querySelectorAll('[data-i18n-opt]').forEach(el => {
    const key = el.dataset.i18nOpt;
    if (strings[lang][key]) el.textContent = strings[lang][key];
  });

  // 言語ボタンラベル
  const btn = document.getElementById('btn-lang');
  if (btn) btn.textContent = lang === 'en' ? '🇯🇵 日本語' : '🇺🇸 English';
}

// 言語切替ボタン
document.getElementById('btn-lang').addEventListener('click', () => {
  setLang(currentLang === 'en' ? 'ja' : 'en');
});

// 初期化
setLang(currentLang);

const socket = io();
let myId = null;
let roomState = null;
let myHand = [];

socket.on('connect', () => { myId = socket.id; });

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
}

// ══════════════════════════════════════════════════════════════════════════════
// TOP SCREEN — ルーム作成・参加
// ══════════════════════════════════════════════════════════════════════════════

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// Join
document.getElementById('btn-join').addEventListener('click', () => {
  const name = document.getElementById('join-name').value.trim();
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (!name) return showTopError('join-error', 'お名前を入力してください');
  if (code.length !== 4) return showTopError('join-error', '4文字のルームコードを入力してください');
  socket.emit('join-room', { code, name });
});

document.getElementById('join-code').addEventListener('input', e => {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
});

['join-name', 'join-code'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-join').click();
  });
});

// Create
document.getElementById('btn-create').addEventListener('click', () => {
  const name = document.getElementById('create-name').value.trim();
  if (!name) return showTopError('create-error', 'お名前を入力してください');
  socket.emit('create-room', { name, settings: {} });
});

document.getElementById('create-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-create').click();
});

function showTopError(id, msg) {
  document.getElementById(id).textContent = msg;
}

// ── Server responses ──────────────────────────────────────────────────────────

socket.on('room-created', ({ code }) => {
  // room-state will follow immediately and render the room screen
});

socket.on('room-joined', ({ gameInProgress }) => {
  if (gameInProgress) {
    // room-state が来たら room 画面に移行するが、ゲーム中のメッセージを出す
    // → room-state ハンドラ内で start-error に表示
    sessionStorage.setItem('gameInProgress', '1');
  } else {
    sessionStorage.removeItem('gameInProgress');
  }
});

socket.on('error', ({ message, code }) => {
  const msg = code ? (t(code) || message || code) : message;
  const activeTab = document.querySelector('.tab.active')?.dataset.tab;
  const errId = activeTab === 'create' ? 'create-error' : 'join-error';
  // Show in room screen too (start button errors)
  document.getElementById('start-error').textContent = msg;
  showTopError(errId, msg);
});

// ══════════════════════════════════════════════════════════════════════════════
// ROOM SCREEN
// ══════════════════════════════════════════════════════════════════════════════

socket.on('room-state', state => {
  roomState = state;
  myId = socket.id;
  renderRoom(state);
  showScreen('room');
  myHand = [];

  // ゲーム進行中に参加した場合のメッセージ
  if (sessionStorage.getItem('gameInProgress') === '1' && state.phase === 'playing') {
    document.getElementById('start-error').textContent = t('gameInProgress');
    sessionStorage.removeItem('gameInProgress');
  }
});

function renderRoom(state) {
  const isHost = state.host === socket.id;

  document.getElementById('room-code-display').textContent = state.code;
  document.getElementById('host-badge').style.display = isHost ? '' : 'none';
  document.getElementById('btn-start').style.display = isHost ? '' : 'none';
  document.getElementById('start-error').textContent = '';

  // Player list
  const list = document.getElementById('player-list');
  list.innerHTML = '';
  state.players.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="player-avatar">${esc(p.name[0].toUpperCase())}</div>
      <span>${esc(p.name)}${p.id === state.host ? ' 👑' : ''}</span>`;
    list.appendChild(li);
  });
  document.getElementById('player-count').textContent = `(${state.players.length}人)`;

  // Disable settings for non-hosts
  const disabled = !isHost;
  document.getElementById('setting-category').disabled = disabled;
  document.getElementById('setting-pairs').disabled = disabled;
  document.getElementById('setting-cpu').disabled = disabled;
  document.querySelectorAll('input[name="pattern"], input[name="game"]').forEach(r => {
    r.disabled = disabled;
  });

  // Sync settings UI
  const s = state.settings || {};
  const cat = s.category || 'toeic';
  document.getElementById('setting-category').value =
    ['toeic','toefl','daily','custom'].includes(cat) ? cat : 'toeic';
  document.getElementById('csv-upload-area').style.display = cat === 'custom' ? '' : 'none';
  document.getElementById('toeic-level-area').style.display = ['toeic','toefl','daily'].includes(cat) ? '' : 'none';
  document.getElementById('setting-level').value = s.level ?? 0;
  document.getElementById('setting-pairs').value = s.pairCount ?? 15;
  document.getElementById('pair-count-label').textContent = s.pairCount ?? 15;
  document.getElementById('setting-cpu').value = s.cpuCount ?? 0;
  document.getElementById('cpu-count-label').textContent = s.cpuCount ?? 0;
  const pat = s.pattern ?? 'jp';
  const patEl = document.querySelector(`input[name="pattern"][value="${pat}"]`);
  if (patEl) patEl.checked = true;
  const gameEl = document.querySelector(`input[name="game"][value="${s.game ?? 'concentration'}"]`);
  if (gameEl) gameEl.checked = true;

  if (state.hasCustomWords) {
    document.getElementById('csv-status').textContent = 'カスタム単語 読み込み済み';
  }
}

// ── Word List Modal ───────────────────────────────────────────────────────────
let allModalWords = [];

function openWordListModal() {
  const cat   = document.getElementById('setting-category').value;
  const level = parseInt(document.getElementById('setting-level').value) || 0;
  if (cat === 'custom') return;

  const catLabels = { toeic:'TOEIC', toefl:'TOEFL', daily:'Daily English' };
  const lvlLabels = { 0:'All Levels', 1:'★☆☆', 2:'★★☆', 3:'★★★' };
  document.getElementById('modal-wordlist-title').textContent =
    `${catLabels[cat] || cat}  ${level > 0 ? lvlLabels[level] : ''}`;

  fetch(`/api/words?category=${cat}&level=${level}`)
    .then(r => r.json())
    .then(({ words }) => {
      allModalWords = words;
      document.getElementById('modal-search').value = '';
      renderModalTable(words);
      document.getElementById('modal-wordlist').style.display = 'flex';
    });
}

function renderModalTable(words) {
  document.getElementById('modal-word-count').textContent = `${words.length} words`;
  const tbody = document.getElementById('modal-word-tbody');
  tbody.innerHTML = words.map(w => `
    <tr>
      <td class="col-word">${esc(w.word)}</td>
      <td class="col-tr">${esc(w.translation || '—')}</td>
      <td class="col-def">${esc(w.definition || '—')}</td>
      <td class="col-lv"><span class="lv-badge lv${w.level||0}">${'★'.repeat(w.level||0)||'—'}</span></td>
    </tr>`).join('');
}

document.getElementById('btn-wordlist').addEventListener('click', openWordListModal);

document.getElementById('btn-modal-close').addEventListener('click', () => {
  document.getElementById('modal-wordlist').style.display = 'none';
});
document.getElementById('modal-wordlist').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
});

document.getElementById('modal-search').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = q
    ? allModalWords.filter(w =>
        w.word.toLowerCase().includes(q) ||
        (w.translation || '').toLowerCase().includes(q) ||
        (w.definition  || '').toLowerCase().includes(q))
    : allModalWords;
  renderModalTable(filtered);
});

// Copy room code
document.getElementById('btn-copy-code').addEventListener('click', () => {
  const code = document.getElementById('room-code-display').textContent;
  navigator.clipboard.writeText(code).then(() => {
    document.getElementById('btn-copy-code').textContent = '✅';
    setTimeout(() => { document.getElementById('btn-copy-code').textContent = '📋'; }, 1500);
  });
});

// Leave room
document.getElementById('btn-leave').addEventListener('click', () => {
  socket.emit('leave-room');
  showScreen('top');
});

// Settings controls (host only)
function emitSettings() {
  if (!roomState || roomState.host !== socket.id) return;
  socket.emit('update-settings', {
    category: document.getElementById('setting-category').value,
    pairCount: parseInt(document.getElementById('setting-pairs').value),
    pattern: document.querySelector('input[name="pattern"]:checked')?.value ?? 'jp',
    game: document.querySelector('input[name="game"]:checked')?.value ?? 'concentration',
    level: parseInt(document.getElementById('setting-level').value),
    cpuCount: parseInt(document.getElementById('setting-cpu').value),
  });
}

document.getElementById('setting-category').addEventListener('change', e => {
  const cat = e.target.value;
  const isCustom = cat === 'custom';
  document.getElementById('csv-upload-area').style.display = isCustom ? '' : 'none';
  document.getElementById('toeic-level-area').style.display = ['toeic','toefl','daily'].includes(cat) ? '' : 'none';
  emitSettings();
});
document.getElementById('setting-level').addEventListener('change', emitSettings);
document.getElementById('setting-pairs').addEventListener('input', e => {
  document.getElementById('pair-count-label').textContent = e.target.value;
  emitSettings();
});
document.getElementById('setting-cpu').addEventListener('input', e => {
  document.getElementById('cpu-count-label').textContent = e.target.value;
  emitSettings();
});
document.querySelectorAll('input[name="pattern"], input[name="game"]').forEach(r => {
  r.addEventListener('change', emitSettings);
});

// CSV help modal
(function() {
  const modal   = document.getElementById('csv-help-modal');
  const openBtn = document.getElementById('csv-help-btn');
  const closeBtn= document.getElementById('csv-help-close');
  const dlBtn   = document.getElementById('csv-help-dl');
  const tmplBtn = document.getElementById('csv-template-btn');

  function openModal() { modal.style.display = 'flex'; }
  function closeModal() { modal.style.display = 'none'; }

  openBtn.addEventListener('click', openModal);
  tmplBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  function downloadTemplate() {
    const csv = [
      'Word,訳,Definition',
      'negotiate,交渉する,to discuss in order to reach an agreement',
      'revenue,収益,income generated by a business',
      'analyze,分析する,to examine something in detail',
      'implement,実施する,to put a plan or decision into effect',
      'strategy,戦略,a plan designed to achieve a goal',
    ].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wordcard_template.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  dlBtn.addEventListener('click', downloadTemplate);
})();

// CSV import
document.getElementById('csv-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const statusEl = document.getElementById('csv-status');
  statusEl.textContent = '読み込み中…';

  // Try UTF-8 first, fall back to Shift-JIS for Japanese files
  const tryRead = (encoding) => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => resolve(ev.target.result);
    reader.onerror = () => resolve(null);
    reader.readAsText(file, encoding);
  });

  (async () => {
    let text = await tryRead('UTF-8');
    // If UTF-8 produced replacement chars, try Shift-JIS
    if (text && text.includes('�')) {
      const sjis = await tryRead('Shift-JIS');
      if (sjis && !sjis.includes('�')) text = sjis;
    }
    if (!text) { statusEl.textContent = 'エラー: ファイルを読めませんでした'; return; }

    const words = parseCSV(text);
    if (words.length === 0) {
      statusEl.textContent = 'エラー: 単語が見つかりません。形式: 単語,訳 (1行1語)';
      return;
    }
    if (words.length < 4) {
      statusEl.textContent = `エラー: ${words.length}語しかありません（4語以上必要）`;
      return;
    }
    socket.emit('import-words', { words });
    statusEl.textContent = `✅ ${words.length}語 読み込み完了`;
  })();
});

function parseCSV(text) {
  // Parse a single CSV/TSV field (handles quotes)
  function parseFields(line) {
    const sep = line.includes('\t') ? '\t' : ',';
    if (!line.includes('"')) {
      return line.split(sep).map(s => s.trim());
    }
    // Handle quoted fields
    const fields = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i+1] === '"') { cur += '"'; i++; } // escaped quote
        else inQ = !inQ;
      } else if (c === sep && !inQ) {
        fields.push(cur.trim()); cur = '';
      } else {
        cur += c;
      }
    }
    fields.push(cur.trim());
    return fields;
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  if (lines.length === 0) return [];

  // Detect and skip header row (first row containing no useful word if it looks like labels)
  const headerKeywords = /^(word|term|単語|front|英語|question|vocabulary|vocab|w)/i;
  const firstFields = parseFields(lines[0]);
  const startIdx = (firstFields.length >= 2 && headerKeywords.test(firstFields[0])) ? 1 : 0;

  return lines.slice(startIdx).map((line, i) => {
    const parts = parseFields(line);
    if (parts.length < 2 || !parts[0]) return null;
    const word       = parts[0];
    const col1       = parts[1] || '';  // 2nd column
    const col2       = parts[2] || '';  // 3rd column (optional)
    // Auto-detect layout:
    // 2-col: word, JP/def  → both translation & definition = col1
    // 3-col: word, JP, EN  → translation=col1, definition=col2
    const translation = col1;
    const definition  = col2 || col1;
    return { id: `csv${i}`, word, translation, definition, level: 2 };
  }).filter(Boolean);
}

// Start game
document.getElementById('btn-start').addEventListener('click', () => {
  socket.emit('start-game');
});

// Home buttons during game
['conc-home', 'om-home'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    socket.emit('restart-game');
  });
});

// ルームに戻る — ホストは全員をリセット、非ホストはローカルで画面遷移
document.getElementById('btn-return-room').addEventListener('click', () => {
  if (roomState?.host === socket.id) {
    socket.emit('restart-game'); // サーバーが room-state を全員に送信 → showScreen('room')
  } else {
    showScreen('room');
    if (roomState) renderRoom(roomState);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GAME START
// ══════════════════════════════════════════════════════════════════════════════

socket.on('game-start', ({ gameType }) => {
  if (gameType === 'concentration') {
    showScreen('concentration');
  } else {
    selectedCards = [];
    newlyDrawnCardId = null;
    myHand = [];
    showScreen('oldmaid');
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// 神経衰弱
// ══════════════════════════════════════════════════════════════════════════════

socket.on('game-state', state => {
  if (state.type === 'concentration') renderConcentration(state);
  else if (state.type === 'oldmaid') renderOldMaid(state);
});

function renderConcentration(state) {
  const isMyTurn = state.currentPlayer === socket.id;

  const label = document.getElementById('conc-turn-label');
  label.textContent = isMyTurn ? t('myTurn') : t('theirTurn', state.currentPlayerName);
  label.className = 'turn-label' + (isMyTurn ? ' my-turn' : '');

  document.getElementById('conc-scores').innerHTML = state.scores
    .map(s => `<span class="score-chip${s.id === socket.id ? ' me' : ''}">${s.isBot ? '🤖 ' : ''}${esc(s.name)}: ${s.score}</span>`)
    .join('');

  // 1枚だけ表向きなら同じゾーンをロック
  const faceUpUnmatched = state.cards.filter(c => c.faceUp && !c.matched);
  const lockedZone = faceUpUnmatched.length === 1 ? faceUpUnmatched[0].type : null;

  const wordCards   = state.cards.filter(c => c.type === 'word');
  const answerCards = state.cards.filter(c => c.type === 'answer');

  renderZone(document.getElementById('conc-words'),   wordCards,   isMyTurn, lockedZone);
  renderZone(document.getElementById('conc-answers'), answerCards, isMyTurn, lockedZone);

  setCardSize(wordCards.length);
}

function renderZone(grid, cards, isMyTurn, lockedZone) {
  if (grid.children.length !== cards.length) {
    grid.innerHTML = '';
    cards.forEach(card => grid.appendChild(buildFlipCard(card)));
  }
  cards.forEach((card, i) => updateFlipCard(grid.children[i], card, isMyTurn, lockedZone));
}

function setCardSize(pairCount) {
  if (window.innerWidth > 640) {
    document.documentElement.style.removeProperty('--conc-card-h');
    return;
  }
  const header = document.querySelector('#screen-concentration .game-header');
  const headerH = header ? header.offsetHeight : 64;
  const available = window.innerHeight - headerH - 36 - 16 - pairCount * 6;
  const h = Math.floor(available / pairCount);
  document.documentElement.style.setProperty('--conc-card-h', Math.max(52, Math.min(100, h)) + 'px');
}

function buildFlipCard(card) {
  const el = document.createElement('div');
  el.className = 'flip-card';
  el.dataset.cardId = card.id;
  el.innerHTML = `
    <div class="flip-card-inner">
      <div class="flip-card-front"></div>
      <div class="flip-card-back">
        <span class="flip-card-content">${esc(card.content)}</span>
      </div>
    </div>`;
  el.addEventListener('click', () => {
    if (el.classList.contains('not-my-turn') ||
        el.classList.contains('matched') ||
        el.classList.contains('face-up') ||
        el.classList.contains('zone-locked')) return;
    socket.emit('flip-card', { cardId: card.id });
  });
  return el;
}

function updateFlipCard(el, card, isMyTurn, lockedZone) {
  const locked = lockedZone !== null && card.type === lockedZone && !card.faceUp && !card.matched;
  el.classList.toggle('face-up',     card.faceUp || card.matched);
  el.classList.toggle('matched',     card.matched);
  el.classList.toggle('zone-locked', locked);
  el.classList.toggle('not-my-turn', !isMyTurn || card.faceUp || card.matched || locked);
  const content = el.querySelector('.flip-card-content');
  if (content) content.textContent = card.content;
}

// ══════════════════════════════════════════════════════════════════════════════
// ババ抜き
// ══════════════════════════════════════════════════════════════════════════════

let selectedCards = [];
let newlyDrawnCardId = null;
let omWaitingForPass = false; // 引いた後の捨てる/捨てない待機中
let omIsDealing = false;      // 配牌フェーズ中
let omAnimating = false;      // カード取られアニメーション中（再描画ブロック用）
let omDrawAnimating = false;  // 引くアニメーション中（opponents再描画ブロック用）
let omLastState = null;       // renderOldMaid に渡された最新state
let prevHandIds = new Set();  // アニメーション用: 前フレームの手札ID

socket.on('hand-update', ({ hand, newCardId, discarded, takenCardId }) => {
  const oldIds = prevHandIds;

  if (takenCardId) {
    // 取られたカードを一瞬見せてからアニメーションで消す
    const takenCard = myHand.find(c => c.id === takenCardId);
    if (takenCard) {
      const el = document.querySelector(`[data-card-id="${takenCardId}"]`);
      if (el) {
        el.classList.add('card-taken');
        setTimeout(() => {
          myHand = hand;
          prevHandIds = new Set(hand.map(c => c.id));
          renderMyHand();
        }, 1500);
        return;
      }
    }
  }

  myHand = hand;
  prevHandIds = new Set(hand.map(c => c.id));
  if (newCardId) {
    newlyDrawnCardId = newCardId;
    omWaitingForPass = true;
    omUpdateBar();
    omUpdateDrawArea();
  }
  if (discarded) {
    selectedCards = [];
    document.getElementById('om-discard-error').textContent = '';
  }
  const isInitialDeal = oldIds.size === 0 && hand.length > 1;
  renderMyHand(isInitialDeal ? hand.map(c => c.id) : []);
});

socket.on('discard-error', ({ code }) => {
  const el = document.getElementById('om-discard-error');
  const key = code === 'notAPair' ? 'errNotAPair' : code === 'jokerCannotDiscard' ? 'errJokerCannotDiscard' : 'errNotInHand';
  el.textContent = t(key);
  setTimeout(() => {
    selectedCards = [];
    el.textContent = '';
    renderMyHand();
  }, 2000);
});

function omUpdateBar() {
  const canDiscard = omWaitingForPass || omIsDealing;
  document.getElementById('om-discard-bar').style.display = canDiscard ? '' : 'none';
  // 配牌フェーズは「捨てない（次へ）」ボタンを非表示
  document.getElementById('btn-pass-turn').style.display = omIsDealing ? 'none' : '';
  const btn = document.getElementById('btn-discard-pair');
  const ready = canDiscard && selectedCards.length === 2;
  btn.style.opacity = ready ? '1' : '0.4';
  btn.style.pointerEvents = ready ? 'auto' : 'none';
}

function omUpdateDrawArea(isMyTurn = true, eliminated = false) {
  const show = isMyTurn && !omWaitingForPass && !eliminated;
  document.getElementById('om-draw-area').style.display = show ? '' : 'none';
}

function renderOldMaid(state) {
  omLastState = state;
  if (omDrawAnimating) return; // カードを引くアニメーション中は再描画しない
  const isDealing = state.phase === 'dealing';
  omIsDealing = isDealing;
  const isMyTurn = !isDealing && state.currentPlayer === socket.id;
  const me = state.players.find(p => p.id === socket.id);

  // ターンが変わったらwaitingForPassをリセット
  if (state.currentPlayer !== socket.id) {
    omWaitingForPass = false;
    newlyDrawnCardId = null;
    selectedCards = [];
  }
  // サーバーがwaitingForPassを確認 → 確実に有効化
  if (state.waitingForPass === socket.id) {
    omWaitingForPass = true;
  }

  // 配牌フェーズバナー
  const banner = document.getElementById('om-deal-banner');
  banner.style.display = isDealing ? '' : 'none';
  if (isDealing) {
    document.getElementById('om-ready-count').textContent =
      t('readyCount', state.readyCount, state.totalPlayers);
  }

  // ターンラベル
  const label = document.getElementById('om-turn-label');
  if (isDealing) {
    label.textContent = t('dealing');
    label.className = 'turn-label';
  } else if (omWaitingForPass) {
    label.textContent = t('drawnPrompt');
    label.className = 'turn-label my-turn';
  } else {
    label.textContent = isMyTurn ? t('myTurn') : t('theirTurn', state.currentPlayerName);
    label.className = 'turn-label' + (isMyTurn ? ' my-turn' : '');
  }

  // 準備完了ボタン
  const readyBtn = document.getElementById('btn-ready');
  const alreadyReady = me?.ready ?? false;
  readyBtn.style.display = isDealing ? '' : 'none';
  readyBtn.disabled = alreadyReady;
  readyBtn.textContent = alreadyReady ? t('btnReadyDone') : t('btnReady');

  // 引き先（waitingForPass 中は引けない）
  const active = state.players.filter(p => !p.eliminated);
  const myIdx = active.findIndex(p => p.id === socket.id);
  const drawFromId = (!isDealing && isMyTurn && !omWaitingForPass && myIdx >= 0)
    ? active[(myIdx + 1) % active.length]?.id : null;

  // 相手の手札表示
  const oppRow = document.getElementById('om-opponents');
  oppRow.innerHTML = '';
  state.players.filter(p => p.id !== socket.id).forEach(p => {
    const isDrawTarget = p.id === drawFromId && !p.eliminated && p.handCount > 0;
    const box = document.createElement('div');
    box.className = 'opponent-box' +
      (isDrawTarget ? ' draw-target' : '') +
      (p.id === state.currentPlayer && !isDealing ? ' current-turn' : '') +
      (p.eliminated ? ' eliminated' : '');

    const cardArea = document.createElement('div');
    cardArea.className = 'opponent-cards';
    for (let i = 0; i < p.handCount; i++) {
      const c = document.createElement('div');
      c.className = 'opp-card' + (isDrawTarget ? ' drawable' : '');
      c.style.setProperty('--i', i);
      if (isDrawTarget) c.addEventListener('click', () => {
        if (omWaitingForPass || omDrawAnimating) return;
        omWaitingForPass = true;
        omDrawAnimating = true;
        c.classList.add('pulling');
        setTimeout(() => {
          omDrawAnimating = false;
          if (omLastState) renderOldMaid(omLastState);
        }, 480);
        omUpdateBar();
        omUpdateDrawArea(true, me?.eliminated ?? false);
        socket.emit('draw-card');
      });
      cardArea.appendChild(c);
    }

    const statusIcon = p.eliminated ? ' 🎉' : (isDrawTarget ? ' 👈' : '');
    const readyMark = isDealing && p.ready ? ' ✅' : '';
    const botMark = p.isBot ? '🤖 ' : '';
    box.innerHTML = `<div class="opponent-name">${botMark}${esc(p.name)}${statusIcon}${readyMark}</div>`;
    if (isDrawTarget) box.innerHTML += `<div class="draw-target-label">${t('drawTarget')}</div>`;
    box.appendChild(cardArea);
    oppRow.appendChild(box);
  });

  omUpdateBar();
  omUpdateDrawArea(isMyTurn, me?.eliminated ?? false);
  renderMyHand();
}

// dealInIds: array of card IDs that should animate in (initial deal or new draw)
function renderMyHand(dealInIds = []) {
  const handRow = document.getElementById('om-my-hand');
  handRow.innerHTML = '';
  document.getElementById('om-my-count').textContent = `(${myHand.length}枚)`;
  const dealSet = new Set(dealInIds);

  myHand.forEach((card, i) => {
    const isSelected = selectedCards.includes(card.id);
    const isNew = card.id === newlyDrawnCardId;
    const el = document.createElement('div');
    el.className = 'hand-card' +
      (card.wordId === 'joker' ? ' joker' : '') +
      (isSelected ? ' selected' : '') +
      (isNew ? ' newly-drawn' : '') +
      (dealSet.has(card.id) ? ' deal-in' : '');
    if (dealSet.has(card.id)) {
      el.style.animationDelay = `${i * 60}ms`;
    }
    el.dataset.cardId = card.id;

    if (card.wordId === 'joker') {
      el.innerHTML = '<div class="card-word">🃏</div><div class="card-label">JOKER</div>';
    } else {
      el.innerHTML = `<div class="card-word">${esc(card.content)}</div>`;
      el.addEventListener('click', () => toggleHandCard(card.id));
    }
    handRow.appendChild(el);
  });

  omUpdateBar();
}

function toggleHandCard(cardId) {
  if (!omWaitingForPass && !omIsDealing) return;
  const idx = selectedCards.indexOf(cardId);
  if (idx >= 0) {
    selectedCards.splice(idx, 1);
  } else {
    if (selectedCards.length >= 2) selectedCards = [selectedCards[1], cardId];
    else selectedCards.push(cardId);
  }
  document.getElementById('om-discard-error').textContent = '';
  renderMyHand();
}

// 捨てるボタン
document.getElementById('btn-discard-pair').addEventListener('click', () => {
  if (selectedCards.length !== 2) return;
  socket.emit('discard-pair', { cardId1: selectedCards[0], cardId2: selectedCards[1] });
});

// 捨てないボタン
document.getElementById('btn-pass-turn').addEventListener('click', () => {
  if (!omWaitingForPass) return;
  omWaitingForPass = false;
  newlyDrawnCardId = null;
  selectedCards = [];
  omUpdateBar();
  socket.emit('pass-turn');
});

// 準備完了ボタン
document.getElementById('btn-ready').addEventListener('click', () => {
  socket.emit('player-ready');
  document.getElementById('btn-ready').disabled = true;
  document.getElementById('btn-ready').textContent = t('btnReadyDone');
});

// ヒントボタン（ペアをアニメーションで点滅）
let hintTimeout = null;
document.getElementById('btn-hint').addEventListener('click', () => {
  if (hintTimeout) return; // 連打防止

  const wordCount = {};
  myHand.forEach(c => {
    if (c.wordId !== 'joker') wordCount[c.wordId] = (wordCount[c.wordId] || 0) + 1;
  });
  const pairWordIds = new Set(Object.keys(wordCount).filter(id => wordCount[id] >= 2));

  if (pairWordIds.size === 0) {
    const btn = document.getElementById('btn-hint');
    btn.textContent = t('hintNone');
    setTimeout(() => { btn.textContent = t('btnHint'); }, 1500);
    return;
  }

  document.querySelectorAll('.hand-card').forEach(el => {
    const card = myHand.find(c => c.id === el.dataset.cardId);
    if (card && pairWordIds.has(card.wordId)) el.classList.add('hint-blink');
  });

  const btn = document.getElementById('btn-hint');
  btn.disabled = true;
  hintTimeout = setTimeout(() => {
    document.querySelectorAll('.hand-card.hint-blink').forEach(el => el.classList.remove('hint-blink'));
    btn.disabled = false;
    hintTimeout = null;
  }, 3000);
});

// ══════════════════════════════════════════════════════════════════════════════
// GAME OVER
// ══════════════════════════════════════════════════════════════════════════════

socket.on('game-over', result => {
  showScreen('result');

  if (result.rankings && !result.loser) {
    document.getElementById('result-title').textContent = t('concTitle');
    const medals = ['🥇','🥈','🥉'];
    document.getElementById('result-body').innerHTML =
      '<ul class="ranking-list">' +
      result.rankings.map((r, i) => `
        <li class="${i === 0 ? 'rank-1' : ''}">
          <span class="rank-num">${medals[i] ?? i + 1}</span>
          <span class="rank-name">${r.isBot ? '🤖 ' : ''}${esc(r.name)}</span>
          <span class="rank-score">${r.score} ${t('pairUnit')}</span>
        </li>`).join('') +
      '</ul>';
  } else if (result.loser) {
    const isLoser = result.loser.id === socket.id;
    document.getElementById('result-title').textContent =
      isLoser ? t('oldLoser') : t('oldTitle');
    document.getElementById('result-body').innerHTML =
      '<ul class="ranking-list">' +
      result.rankings.map(r => `
        <li class="${r.result.includes('負け') || r.result.includes('Joker') ? 'rank-loser' : 'rank-1'}">
          <span class="rank-name">${r.isBot ? '🤖 ' : ''}${esc(r.name)}</span>
          <span class="rank-score">${esc(r.result)}</span>
        </li>`).join('') +
      '</ul>';
  }
});


// ══════════════════════════════════════════════════════════════════════════════
// UTILITY
// ══════════════════════════════════════════════════════════════════════════════

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}


// ══════════════════════════════════════════════════════════════════════════════
// QR コード
// ══════════════════════════════════════════════════════════════════════════════

let qrInstance = null;

document.getElementById('btn-qr').addEventListener('click', () => {
  const modal = document.getElementById('qr-modal');
  const container = document.getElementById('qr-canvas');
  const urlEl = document.getElementById('qr-url');
  const url = window.location.origin;

  urlEl.textContent = url;
  modal.style.display = 'flex';

  if (!qrInstance) {
    qrInstance = new QRCode(container, {
      text: url,
      width: 220,
      height: 220,
      colorDark: '#1e1b4b',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
  }
});

document.getElementById('qr-close').addEventListener('click', () => {
  document.getElementById('qr-modal').style.display = 'none';
});

document.getElementById('qr-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.style.display = 'none';
  }
});
