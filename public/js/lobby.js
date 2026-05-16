const socket = io();

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
  if (!name) return showError('join-error', 'お名前を入力してください');
  if (code.length !== 4) return showError('join-error', '4文字のルームコードを入力してください');
  socket.emit('join-room', { code, name });
});

document.getElementById('join-code').addEventListener('input', e => {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
});

// Create
document.getElementById('btn-create').addEventListener('click', () => {
  const name = document.getElementById('create-name').value.trim();
  if (!name) return showError('create-error', 'お名前を入力してください');
  socket.emit('create-room', { name, settings: {} });
});

// Enter key support
['join-name', 'join-code'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-join').click();
  });
});
document.getElementById('create-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-create').click();
});

socket.on('room-created', ({ code }) => {
  sessionStorage.setItem('roomCode', code);
  sessionStorage.setItem('isHost', 'true');
  window.location.href = '/room.html';
});

socket.on('room-joined', ({ code }) => {
  sessionStorage.setItem('roomCode', code);
  sessionStorage.setItem('isHost', 'false');
  window.location.href = '/room.html';
});

socket.on('error', ({ message }) => {
  const activeTab = document.querySelector('.tab.active')?.dataset.tab;
  showError(activeTab === 'create' ? 'create-error' : 'join-error', message);
});

function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}
