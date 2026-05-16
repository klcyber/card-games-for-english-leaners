// ババ抜き UI

let myHand = [];
let selectedCards = [];
let newlyDrawnCardId = null;
let waitingForPass = false; // 引いた後の捨てる/捨てない待機中（クライアント管理）
let lastState = null;       // 最新のgame-state

// 引いたカードを受信 → 即座に捨てる/捨てないUIを表示
socket.on('hand-update', ({ hand, newCardId, discarded }) => {
  myHand = hand;
  if (newCardId) {
    newlyDrawnCardId = newCardId;
    waitingForPass = true;   // 引いた瞬間にUIを切り替え
    updateActionBar();
    updateDrawArea();
  }
  if (discarded) {
    selectedCards = [];
    document.getElementById('om-discard-error').textContent = '';
  }
  renderMyHand();
});

socket.on('discard-error', ({ message }) => {
  const el = document.getElementById('om-discard-error');
  el.textContent = '❌ ' + message;
  setTimeout(() => {
    selectedCards = [];
    el.textContent = '';
    renderMyHand();
  }, 2000);
});

socket.on('game-state', state => {
  if (state.type !== 'oldmaid') return;
  lastState = state;
  const myId = getMyId();
  if (state.waitingForPass === myId) {
    // サーバーが waitingForPass を確認 → 捨てる/捨てないUIを有効化
    waitingForPass = true;
  } else if (state.currentPlayer !== myId) {
    // 自分のターンでなくなったらリセット
    waitingForPass = false;
    newlyDrawnCardId = null;
    selectedCards = [];
  }
  renderOldMaid(state);
});

socket.on('game-over', result => {
  if (!result.loser) return;
  showScreen('result');
  const myId = getMyId();
  const isLoser = result.loser.id === myId;
  document.getElementById('result-title').textContent = isLoser ? '😢 あなたはババを引きました！' : '🎉 ゲーム終了！';

  const body = document.getElementById('result-body');
  const ul = document.createElement('ul');
  ul.className = 'ranking-list';
  result.rankings.forEach(r => {
    const li = document.createElement('li');
    if (r.result.includes('負け')) li.classList.add('rank-loser');
    else li.classList.add('rank-1');
    li.innerHTML = `<span class="rank-name">${esc(r.name)}</span><span class="rank-score">${esc(r.result)}</span>`;
    ul.appendChild(li);
  });
  body.innerHTML = '';
  body.appendChild(ul);
  const isHost = getRoomState()?.host === getMyId();
  document.getElementById('btn-restart').style.display = isHost ? '' : 'none';
});

// 捨てるボタン
document.getElementById('btn-discard-pair').addEventListener('click', () => {
  if (selectedCards.length !== 2) return;
  socket.emit('discard-pair', { cardId1: selectedCards[0], cardId2: selectedCards[1] });
});

// 捨てないボタン（次のプレイヤーへ）
document.getElementById('btn-pass-turn').addEventListener('click', () => {
  if (!waitingForPass) return;
  waitingForPass = false;
  newlyDrawnCardId = null;
  selectedCards = [];
  socket.emit('pass-turn');
  updateActionBar();
  updateDrawArea();
  renderMyHand();
});

function updateActionBar() {
  document.getElementById('om-discard-bar').style.display = waitingForPass ? 'block' : 'none';
}

function updateDrawArea() {
  if (!lastState) return;
  const myId = getMyId();
  const isMyTurn = lastState.currentPlayer === myId;
  const me = lastState.players?.find(p => p.id === myId);
  const show = isMyTurn && !waitingForPass && !me?.eliminated;
  document.getElementById('om-draw-area').style.display = show ? 'block' : 'none';
}

function renderOldMaid(state) {
  const myId = getMyId();
  const isMyTurn = state.currentPlayer === myId;

  // ターンラベル
  const label = document.getElementById('om-turn-label');
  if (waitingForPass) {
    label.textContent = '🃏 引きました！捨てますか？';
    label.className = 'turn-label my-turn';
  } else {
    label.textContent = isMyTurn ? 'あなたのターン！' : `${esc(state.currentPlayerName)} のターン`;
    label.className = 'turn-label' + (isMyTurn ? ' my-turn' : '');
  }

  // 引き先（waitingForPass 中は引けない）
  const activePlayers = state.players.filter(p => !p.eliminated);
  const myIndex = activePlayers.findIndex(p => p.id === myId);
  const drawFromId = (!waitingForPass && isMyTurn && myIndex >= 0)
    ? activePlayers[(myIndex + 1) % activePlayers.length]?.id : null;

  // 相手の手札表示
  const oppRow = document.getElementById('om-opponents');
  oppRow.innerHTML = '';
  state.players.filter(p => p.id !== myId).forEach(p => {
    const isDrawTarget = p.id === drawFromId && !p.eliminated && p.handCount > 0;
    const box = document.createElement('div');
    box.className = 'opponent-box' +
      (isDrawTarget ? ' draw-target' : '') +
      (p.id === state.currentPlayer && !waitingForPass ? ' current-turn' : '') +
      (p.eliminated ? ' eliminated' : '');

    const cardArea = document.createElement('div');
    cardArea.className = 'opponent-cards';
    for (let i = 0; i < p.handCount; i++) {
      const c = document.createElement('div');
      c.className = 'opp-card' + (isDrawTarget ? ' drawable' : '');
      c.style.setProperty('--i', i);
      if (isDrawTarget) c.addEventListener('click', () => {
        if (waitingForPass) return; // 二重引き防止
        waitingForPass = true;      // 即フラグ（サーバー応答前）
        updateActionBar();
        updateDrawArea();
        socket.emit('draw-card');
      });
      cardArea.appendChild(c);
    }

    const statusIcon = p.eliminated ? ' 🎉' : (isDrawTarget ? ' 👈' : '');
    const botMark = p.isBot ? '🤖 ' : '';
    box.innerHTML = `<div class="opponent-name">${botMark}${esc(p.name)}${statusIcon}</div>`;
    if (isDrawTarget) box.innerHTML += `<div class="draw-target-label">ここから引く！</div>`;
    box.appendChild(cardArea);
    oppRow.appendChild(box);
  });

  updateActionBar();
  updateDrawArea();
  renderMyHand();
}

function renderMyHand() {
  const handRow = document.getElementById('om-my-hand');
  handRow.innerHTML = '';
  document.getElementById('om-my-count').textContent = `(${myHand.length}枚)`;

  myHand.forEach(card => {
    const isSelected = selectedCards.includes(card.id);
    const isNew = card.id === newlyDrawnCardId;
    const el = document.createElement('div');
    el.className = 'hand-card' +
      (card.wordId === 'joker' ? ' joker' : '') +
      (isSelected ? ' selected' : '') +
      (isNew ? ' newly-drawn' : '');

    if (card.wordId === 'joker') {
      el.innerHTML = '<div class="card-word">🃏</div><div class="card-answer">JOKER</div>';
    } else {
      el.innerHTML = `<div class="card-word">${esc(card.content)}</div><div class="card-answer">${esc(card.answer ?? '')}</div>`;
      if (waitingForPass) el.addEventListener('click', () => toggleCard(card.id));
    }
    handRow.appendChild(el);
  });

  updateDiscardBtn();
}

function toggleCard(cardId) {
  const idx = selectedCards.indexOf(cardId);
  if (idx >= 0) selectedCards.splice(idx, 1);
  else {
    if (selectedCards.length >= 2) selectedCards = [selectedCards[1], cardId];
    else selectedCards.push(cardId);
  }
  document.getElementById('om-discard-error').textContent = '';
  renderMyHand();
}

function updateDiscardBtn() {
  const btn = document.getElementById('btn-discard-pair');
  const ready = waitingForPass && selectedCards.length === 2;
  btn.style.opacity = ready ? '1' : '0.4';
  btn.style.pointerEvents = ready ? 'auto' : 'none';
}

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
