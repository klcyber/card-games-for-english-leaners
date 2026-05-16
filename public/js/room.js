const socket = io();

let myId = socket.id;
let roomState = null;
let isHost = false;

// Resolve socket id after connect
socket.on('connect', () => { myId = socket.id; });

// ── Rejoin on page load ──────────────────────────────────────────────────────
const savedCode = sessionStorage.getItem('roomCode');
const savedName = sessionStorage.getItem('playerName') || '名無し';
const hostFlag   = sessionStorage.getItem('isHost') === 'true';

if (!savedCode) {
  window.location.href = '/';
}

// Re-emit join/create to reattach socket
if (hostFlag) {
  const name = sessionStorage.getItem('playerName') || 'ホスト';
  socket.emit('create-room', { name, settings: {} });
} else {
  socket.emit('join-room', { code: savedCode, name: savedName });
}

// On room-created re-save code (host reconnect gives a new code)
socket.on('room-created', ({ code }) => {
  sessionStorage.setItem('roomCode', code);
  isHost = true;
});

socket.on('room-joined', () => { isHost = false; });

// ── Room state ───────────────────────────────────────────────────────────────
socket.on('room-state', state => {
  roomState = state;
  myId = socket.id;
  isHost = state.host === socket.id;
  renderLobby(state);
  showScreen('lobby');
});

function renderLobby(state) {
  document.getElementById('room-code-display').textContent = state.code;
  document.getElementById('host-badge').style.display = isHost ? '' : 'none';
  document.getElementById('btn-start').style.display = isHost ? '' : 'none';
  document.getElementById('start-error').textContent = '';

  // Player list
  const list = document.getElementById('player-list');
  list.innerHTML = '';
  state.players.forEach(p => {
    const li = document.createElement('li');
    const avatar = document.createElement('div');
    avatar.className = 'player-avatar';
    avatar.textContent = p.name[0].toUpperCase();
    const name = document.createElement('span');
    name.textContent = p.name + (p.id === state.host ? ' 👑' : '');
    li.append(avatar, name);
    list.appendChild(li);
  });
  document.getElementById('player-count').textContent = `(${state.players.length}人)`;

  // Settings — disable inputs if not host
  const disabled = !isHost;
  ['setting-category', 'setting-pairs'].forEach(id => {
    document.getElementById(id).disabled = disabled;
  });
  document.querySelectorAll('input[name="pattern"], input[name="game"]').forEach(r => {
    r.disabled = disabled;
  });

  // Sync UI to state
  if (state.settings) {
    const cat = state.settings.category;
    document.getElementById('setting-category').value = ['toeic','toefl','daily','grammar','custom'].includes(cat) ? cat : 'toeic';
    document.getElementById('setting-pairs').value = state.settings.pairCount ?? 15;
    document.getElementById('pair-count-label').textContent = state.settings.pairCount ?? 15;
    const pat = state.settings.pattern ?? 'jp';
    document.querySelector(`input[name="pattern"][value="${pat}"]`).checked = true;
    const game = state.settings.game ?? 'concentration';
    document.querySelector(`input[name="game"][value="${game}"]`).checked = true;
    document.getElementById('csv-upload-area').style.display = cat === 'custom' ? '' : 'none';
  }
}

// ── Settings controls (host only) ───────────────────────────────────────────
function emitSettings() {
  if (!isHost) return;
  const category = document.getElementById('setting-category').value;
  const pairCount = parseInt(document.getElementById('setting-pairs').value);
  const pattern = document.querySelector('input[name="pattern"]:checked')?.value ?? 'jp';
  const game = document.querySelector('input[name="game"]:checked')?.value ?? 'concentration';
  socket.emit('update-settings', { category, pairCount, pattern, game });
}

document.getElementById('setting-category').addEventListener('change', e => {
  document.getElementById('csv-upload-area').style.display = e.target.value === 'custom' ? '' : 'none';
  emitSettings();
});
document.getElementById('setting-pairs').addEventListener('input', e => {
  document.getElementById('pair-count-label').textContent = e.target.value;
  emitSettings();
});
document.querySelectorAll('input[name="pattern"], input[name="game"]').forEach(r => {
  r.addEventListener('change', emitSettings);
});

// CSV import
document.getElementById('csv-file').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const words = parseCSV(ev.target.result);
    if (words.length < 10) {
      document.getElementById('csv-status').textContent = 'エラー: 単語が10個以上必要です';
      return;
    }
    socket.emit('import-words', { words });
    document.getElementById('csv-status').textContent = `${words.length}語 読み込み完了`;
  };
  reader.readAsText(file, 'UTF-8');
});

function parseCSV(text) {
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map((line, i) => {
      // Handle tab or comma delimiters
      const sep = line.includes('\t') ? '\t' : ',';
      const parts = line.split(sep).map(s => s.trim().replace(/^"|"$/g, ''));
      if (parts.length < 2) return null;
      return {
        id: `csv${i}`,
        word: parts[0],
        translation: parts[1],
        definition: parts[1],
      };
    })
    .filter(Boolean);
}

// Copy room code
document.getElementById('btn-copy-code').addEventListener('click', () => {
  const code = document.getElementById('room-code-display').textContent;
  navigator.clipboard.writeText(code).then(() => {
    document.getElementById('btn-copy-code').textContent = '✅';
    setTimeout(() => { document.getElementById('btn-copy-code').textContent = '📋'; }, 1500);
  });
});

// Start game
document.getElementById('btn-start').addEventListener('click', () => {
  socket.emit('start-game');
});

// Restart
document.getElementById('btn-restart').addEventListener('click', () => {
  socket.emit('restart-game');
});

// ── Game start ───────────────────────────────────────────────────────────────
socket.on('game-start', ({ gameType }) => {
  if (gameType === 'concentration') {
    showScreen('concentration');
  } else {
    showScreen('oldmaid');
  }
});

// ── Error ────────────────────────────────────────────────────────────────────
socket.on('error', ({ message }) => {
  document.getElementById('start-error').textContent = message;
});

// ── Utilities ────────────────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${name}`).classList.add('active');
}

// Save player name from room state
socket.on('room-state', state => {
  const me = state.players.find(p => p.id === socket.id);
  if (me) sessionStorage.setItem('playerName', me.name);
});

// Expose for game scripts
window.socket = socket;
window.getMyId = () => socket.id;
window.getRoomState = () => roomState;
window.showScreen = showScreen;
