// 神経衰弱 UI

socket.on('game-state', state => {
  if (state.type !== 'concentration') return;
  renderConcentration(state);
});

socket.on('game-over', result => {
  if (!result.rankings) return;
  showScreen('result');
  document.getElementById('result-title').textContent = '🎊 結果発表！';
  const body = document.getElementById('result-body');
  const medals = ['🥇', '🥈', '🥉'];
  const ul = document.createElement('ul');
  ul.className = 'ranking-list';
  result.rankings.forEach((r, i) => {
    const li = document.createElement('li');
    if (i === 0) li.classList.add('rank-1');
    li.innerHTML = `
      <span class="rank-num">${medals[i] ?? i + 1}</span>
      <span class="rank-name">${esc(r.name)}</span>
      <span class="rank-score"><strong>${r.score}</strong> ペア</span>`;
    ul.appendChild(li);
  });
  body.innerHTML = '';
  body.appendChild(ul);
  const isHost = getRoomState()?.host === getMyId();
  document.getElementById('btn-restart').style.display = isHost ? '' : 'none';
});

function renderConcentration(state) {
  const myId = getMyId();
  const isMyTurn = state.currentPlayer === myId;

  // Turn label
  const label = document.getElementById('conc-turn-label');
  label.textContent = isMyTurn ? 'あなたのターン！' : `${esc(state.currentPlayerName)} のターン`;
  label.className = 'turn-label' + (isMyTurn ? ' my-turn' : '');

  // Score bar
  const bar = document.getElementById('conc-scores');
  bar.innerHTML = state.scores.map(s =>
    `<span class="score-chip${s.id === myId ? ' me' : ''}">${esc(s.name)}: ${s.score}</span>`
  ).join('');

  // ゾーンロック判定: face-up かつ未マッチが1枚 → そのzoneをロック
  const faceUpCards = state.cards.filter(c => c.faceUp && !c.matched);
  const lockedZone = faceUpCards.length === 1 ? faceUpCards[0].type : null;

  // カードを種別に分離
  const wordCards   = state.cards.filter(c => c.type === 'word');
  const answerCards = state.cards.filter(c => c.type === 'answer');

  // それぞれのグリッドを更新
  renderZone(document.getElementById('conc-words'),   wordCards,   isMyTurn, lockedZone);
  renderZone(document.getElementById('conc-answers'), answerCards, isMyTurn, lockedZone);

  // スマホ用カードサイズ計算
  setCardSize(wordCards.length);
}

function renderZone(grid, cards, isMyTurn, lockedZone) {
  if (grid.children.length !== cards.length) {
    grid.innerHTML = '';
    cards.forEach(card => grid.appendChild(buildFlipCard(card, isMyTurn, lockedZone)));
  } else {
    cards.forEach((card, i) => updateFlipCard(grid.children[i], card, isMyTurn, lockedZone));
  }
}

function buildFlipCard(card, isMyTurn, lockedZone) {
  const el = document.createElement('div');
  el.className = 'flip-card';
  el.dataset.cardId = card.id;
  el.innerHTML = `
    <div class="flip-card-inner">
      <div class="flip-card-front">🃏</div>
      <div class="flip-card-back">
        <span class="flip-card-type">${card.type === 'word' ? '単語' : '意味'}</span>
        ${esc(card.content)}
      </div>
    </div>`;
  updateFlipCard(el, card, isMyTurn, lockedZone);
  el.addEventListener('click', () => {
    if (el.classList.contains('not-my-turn') ||
        el.classList.contains('face-up') ||
        el.classList.contains('matched') ||
        el.classList.contains('zone-locked')) return;
    socket.emit('flip-card', { cardId: card.id });
  });
  return el;
}

function updateFlipCard(el, card, isMyTurn, lockedZone) {
  el.classList.toggle('face-up',     card.faceUp || card.matched);
  el.classList.toggle('matched',     card.matched);
  el.classList.toggle('not-my-turn', !isMyTurn);
  el.classList.toggle('zone-locked', lockedZone !== null && card.type === lockedZone && !card.faceUp && !card.matched);
  const back = el.querySelector('.flip-card-back');
  if (back) {
    back.innerHTML = `<span class="flip-card-type">${card.type === 'word' ? '単語' : '意味'}</span>${esc(card.content)}`;
  }
}

function setCardSize(pairCount) {
  if (window.innerWidth > 640) {
    document.documentElement.style.removeProperty('--conc-card-h');
    return;
  }
  const cols = 3;
  const rows = Math.ceil(pairCount / cols);
  const header = document.querySelector('#screen-concentration .game-header');
  const headerH = header ? header.offsetHeight : 64;
  const zoneLabel = 36;
  const padding = 16;
  const gaps = rows * 6;
  const availH = window.innerHeight - headerH - zoneLabel - padding - gaps;
  const cardH = Math.floor(availH / rows);
  const clamped = Math.max(52, Math.min(100, cardH));
  document.documentElement.style.setProperty('--conc-card-h', clamped + 'px');
}

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
