// 神経衰弱 UI

socket.on('game-state', state => {
  if (state.type !== 'concentration') return;
  renderConcentration(state);
});

socket.on('game-over', result => {
  if (!result.rankings) return;
  showScreen('result');
  document.getElementById('result-title').textContent = '🎉 神経衰弱 終了！';
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
      <span class="rank-score">${r.score} ペア</span>`;
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

  // Board
  const board = document.getElementById('conc-board');
  // Only rebuild on first render or card count change
  if (board.children.length !== state.cards.length) {
    board.innerHTML = '';
    state.cards.forEach(card => {
      board.appendChild(buildFlipCard(card, isMyTurn));
    });
  } else {
    state.cards.forEach((card, i) => {
      updateFlipCard(board.children[i], card, isMyTurn);
    });
  }
}

function buildFlipCard(card, isMyTurn) {
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
  updateFlipCard(el, card, isMyTurn);
  el.addEventListener('click', () => {
    if (!el.classList.contains('not-my-turn') && !el.classList.contains('face-up') && !el.classList.contains('matched')) {
      socket.emit('flip-card', { cardId: card.id });
    }
  });
  return el;
}

function updateFlipCard(el, card, isMyTurn) {
  el.classList.toggle('face-up', card.faceUp || card.matched);
  el.classList.toggle('matched', card.matched);
  el.classList.toggle('not-my-turn', !isMyTurn);
  // Update content in case it changed
  const back = el.querySelector('.flip-card-back');
  if (back) {
    back.innerHTML = `<span class="flip-card-type">${card.type === 'word' ? '単語' : '意味'}</span>${esc(card.content)}`;
  }
}

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
