const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 20000,
  pingInterval: 10000,
});

app.use(express.static(path.join(__dirname, 'public')));

// Word list API
app.get('/api/words', (req, res) => {
  const cat = req.query.category || 'toeic';
  const level = parseInt(req.query.level) || 0;
  let words = vocabData[cat] || [];
  if (level > 0) words = words.filter(w => w.level === level);
  res.json({ words, total: words.length });
});

// Load vocabulary data
const vocabData = {};
['toeic', 'toefl', 'daily'].forEach(cat => {
  const file = path.join(__dirname, 'data', `${cat}.json`);
  if (fs.existsSync(file)) {
    vocabData[cat] = JSON.parse(fs.readFileSync(file, 'utf8')).words;
  }
});

const rooms = {};

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms[code]);
  return code;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function discardPairs(hand) {
  const wordMap = {};
  hand.forEach(card => {
    if (!wordMap[card.wordId]) wordMap[card.wordId] = [];
    wordMap[card.wordId].push(card);
  });
  const discarded = [];
  const remaining = hand.filter(card => {
    if (wordMap[card.wordId].length === 2 && !discarded.find(d => d.id === card.id)) {
      discarded.push(...wordMap[card.wordId]);
      return false;
    }
    return !discarded.find(d => d.id === card.id);
  });
  return { remaining, discarded };
}

function buildCards(words, pattern, pairCount) {
  const selected = shuffle(words).slice(0, pairCount);
  const cards = [];
  selected.forEach(w => {
    const answer = pattern === 'jp' ? w.translation : w.definition;
    cards.push({ id: `w-${w.id}`, wordId: w.id, type: 'word', content: w.word });
    cards.push({ id: `a-${w.id}`, wordId: w.id, type: 'answer', content: answer });
  });
  return shuffle(cards);
}

// ─── Vocabulary helpers ───────────────────────────────────────────────────────

function filterWords(room) {
  const { settings } = room;
  let words = room.customWords || vocabData[settings.category] || [];
  if (settings.category === 'toeic' && settings.level && settings.level > 0) {
    words = words.filter(w => w.level === settings.level);
  }
  return words;
}

// ─── Concentration ────────────────────────────────────────────────────────────

function startConcentration(room) {
  const { settings } = room;
  const words = filterWords(room);
  const cards = buildCards(words, settings.pattern, settings.pairCount);
  room.game = {
    type: 'concentration',
    cards: cards.map((c, i) => ({ ...c, index: i, faceUp: false, matched: false })),
    flipped: [],
    currentPlayerIndex: 0,
    scores: Object.fromEntries(room.players.map(p => [p.id, 0])),
    phase: 'playing',
  };
}

function handleFlipCard(room, playerId, cardId) {
  const g = room.game;
  const currentPlayer = room.players[g.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    // 自分のターンでないのに操作してきた → 最新状態を送って同期
    const s = io.sockets.sockets.get(playerId);
    if (s) s.emit('game-state', gameStatePayload(room));
    return;
  }
  if (g.phase !== 'playing') return;

  const card = g.cards.find(c => c.id === cardId);
  if (!card || card.matched) return;
  if (card.faceUp) return;

  // enパターン: 1枚目は定義(answer)ゾーンから選ぶ
  if (g.flipped.length === 0 && room.settings.pattern === 'en' && card.type === 'word') return;

  // ゾーンロック: 1枚目と同じゾーンは選べない
  if (g.flipped.length === 1 && card.type === g.flipped[0].type) return;

  // 2枚揃うまで待機中なら弾く
  if (g.flipped.length >= 2) return;

  card.faceUp = true;
  g.flipped.push(card);

  // 全ボットの記憶を更新（誰のターンでも見えたカードは覚える）
  if (!g.botMemory) g.botMemory = {};
  room.players.filter(p => p.isBot).forEach(bot => {
    if (!g.botMemory[bot.id]) g.botMemory[bot.id] = {};
    g.botMemory[bot.id][card.id] = { type: card.type, wordId: card.wordId };
  });

  io.to(room.code).emit('game-state', gameStatePayload(room));

  if (g.flipped.length === 2) {
    const [a, b] = g.flipped;
    if (a.wordId === b.wordId) {
      // ペア成立: 0.8秒後に確定
      setTimeout(() => {
        if (!rooms[room.code] || rooms[room.code].game !== g) return;
        a.matched = true;
        b.matched = true;
        g.scores[playerId] = (g.scores[playerId] || 0) + 1;
        g.flipped = [];
        const isBot = room.players.find(p => p.id === playerId)?.isBot;
        if (!g.streak) g.streak = {};
        g.streak[playerId] = isBot ? (g.streak[playerId] || 0) + 1 : 0;
        if (g.cards.every(c => c.matched)) {
          g.phase = 'finished';
          io.to(room.code).emit('game-over', buildConcentrationResult(room));
        } else if (isBot && g.streak[playerId] >= 2) {
          // CPUは2ペア連続でターンチェンジ
          g.streak[playerId] = 0;
          g.currentPlayerIndex = (g.currentPlayerIndex + 1) % room.players.length;
          io.to(room.code).emit('game-state', gameStatePayload(room));
          scheduleBotAction(room);
        } else {
          io.to(room.code).emit('game-state', gameStatePayload(room));
          scheduleBotAction(room);
        }
      }, 800);
    } else {
      // ミス: 1.8秒間カードを見せてから自動で裏返してターンチェンジ
      setTimeout(() => {
        if (!rooms[room.code] || rooms[room.code].game !== g) return;
        a.faceUp = false;
        b.faceUp = false;
        g.flipped = [];
        if (!g.streak) g.streak = {};
        g.streak[playerId] = 0;
        g.currentPlayerIndex = (g.currentPlayerIndex + 1) % room.players.length;
        io.to(room.code).emit('game-state', gameStatePayload(room));
        scheduleBotAction(room);
      }, 1800);
    }
  }
}

function buildConcentrationResult(room) {
  const g = room.game;
  const rankings = room.players
    .map(p => ({ name: p.name, score: g.scores[p.id] ?? 0, isBot: p.isBot }))
    .sort((a, b) => b.score - a.score);

  // 使用単語リスト: wordカードとanswerカードをwordIdで対応付け
  const wordCards   = g.cards.filter(c => c.type === 'word');
  const answerCards = g.cards.filter(c => c.type === 'answer');
  const wordList = wordCards.map(w => {
    const ans = answerCards.find(a => a.wordId === w.wordId);
    return { word: w.content, answer: ans?.content ?? '' };
  });

  return { rankings, wordList };
}

// ─── Old Maid ─────────────────────────────────────────────────────────────────

function startOldMaid(room) {
  const words = filterWords(room);
  const cards = buildCards(words, room.settings.pattern, room.settings.pairCount);
  cards.push({ id: 'joker', wordId: 'joker', type: 'joker', content: 'JOKER' });

  const shuffled = shuffle(cards);
  const hands = {};
  room.players.forEach(p => { hands[p.id] = []; });
  shuffled.forEach((card, i) => {
    hands[room.players[i % room.players.length].id].push(card);
  });

  room.game = {
    type: 'oldmaid',
    hands,
    currentPlayerIndex: 0,
    eliminated: [],
    phase: 'dealing',
    readyPlayers: [],
  };
}

function checkOldMaidGameOver(room) {
  const g = room.game;
  const activePlayers = room.players.filter(p => !g.eliminated.includes(p.id));
  if (activePlayers.length === 1) {
    g.phase = 'finished';
    const loser = activePlayers[0];
    io.to(room.code).emit('game-state', gameStatePayload(room));
    // 脱落順（早い順 = 上位）にならべ、最後にジョーカー保持者を追加
    const orderedRankings = g.eliminated.map(id => {
      const p = room.players.find(pl => pl.id === id);
      return { id, name: p.name, isBot: p.isBot, result: 'win' };
    });
    orderedRankings.push({ id: loser.id, name: loser.name, isBot: loser.isBot, result: 'lose' });

    io.to(room.code).emit('game-over', {
      type: 'oldmaid',
      loser: { id: loser.id, name: loser.name },
      rankings: orderedRankings,
    });
    return true;
  }
  return false;
}

function handleDrawCard(room, playerId, drawerSocket = null) {
  const g = room.game;
  const currentPlayer = room.players[g.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) return;
  if (g.phase !== 'playing') return;
  if (g.waitingForPass) return; // 既に引いた後の確認待ち中は無視

  // 次のアクティブプレイヤー
  let nextIndex = (g.currentPlayerIndex + 1) % room.players.length;
  let tries = 0;
  while (g.eliminated.includes(room.players[nextIndex].id) && tries < room.players.length) {
    nextIndex = (nextIndex + 1) % room.players.length;
    tries++;
  }
  const nextPlayer = room.players[nextIndex];
  const nextHand = g.hands[nextPlayer.id];

  if (!nextHand || nextHand.length === 0) {
    advanceTurn(room);
    io.to(room.code).emit('game-state', gameStatePayload(room));
    scheduleBotAction(room);
    return;
  }

  // 相手の手札からランダムに1枚引く
  const pickIndex = Math.floor(Math.random() * nextHand.length);
  const drawn = nextHand.splice(pickIndex, 1)[0];
  g.hands[currentPlayer.id].push(drawn);

  if (nextHand.length === 0 && !g.eliminated.includes(nextPlayer.id)) {
    g.eliminated.push(nextPlayer.id);
  }

  if (currentPlayer.isBot) {
    // ボットは引いた後、自動でペアを捨ててターンを進める
    const { remaining } = discardPairs(g.hands[currentPlayer.id]);
    g.hands[currentPlayer.id] = remaining;
    if (remaining.length === 0 && !g.eliminated.includes(currentPlayer.id)) {
      g.eliminated.push(currentPlayer.id);
    }
    if (checkOldMaidGameOver(room)) return;
    advanceTurn(room);
    io.to(room.code).emit('game-state', gameStatePayload(room));
    // ドナーに手札更新
    if (!nextPlayer.isBot) {
      const donorSocket = io.sockets.sockets.get(nextPlayer.id);
      if (donorSocket) donorSocket.emit('hand-update', { hand: g.hands[nextPlayer.id], takenCardId: drawn.id });
    }
    scheduleBotAction(room);
  } else {
    // 人間プレイヤー：引いた後に捨てるかどうか確認させる
    if (checkOldMaidGameOver(room)) return;
    g.waitingForPass = currentPlayer.id;
    io.to(room.code).emit('game-state', gameStatePayload(room));
    // drawerSocket は draw-card ハンドラから直接渡す（io.to でも可）
    const ds = drawerSocket ?? io.sockets.sockets.get(currentPlayer.id);
    if (ds) ds.emit('hand-update', { hand: g.hands[currentPlayer.id], newCardId: drawn.id });
    if (!nextPlayer.isBot) {
      const donorSock = io.sockets.sockets.get(nextPlayer.id);
      if (donorSock) donorSock.emit('hand-update', { hand: g.hands[nextPlayer.id], takenCardId: drawn.id });
    }
  }
}

function advanceTurn(room) {
  const g = room.game;
  let next = (g.currentPlayerIndex + 1) % room.players.length;
  let tries = 0;
  while (
    (g.eliminated.includes(room.players[next].id) || g.hands[room.players[next].id]?.length === 0)
    && tries < room.players.length
  ) {
    next = (next + 1) % room.players.length;
    tries++;
  }
  g.currentPlayerIndex = next;
}

// ─── Bot AI ───────────────────────────────────────────────────────────────────

function scheduleBotAction(room) {
  const g = room.game;
  if (!g || g.phase === 'finished') return;

  if (g.type === 'concentration') {
    const cur = room.players[g.currentPlayerIndex];
    if (cur?.isBot) {
      const delay = 500 + Math.floor(Math.random() * 400);
      setTimeout(() => {
        if (rooms[room.code]?.game !== g) return;
        botConcFlip(room, cur);
      }, delay);
    } else {
      // 人間のターン: 状態を全員に再送して確実に同期
      io.to(room.code).emit('game-state', gameStatePayload(room));
    }

  } else if (g.type === 'oldmaid' && g.phase === 'playing') {
    if (g.waitingForPass) return; // 人間プレイヤーの確認待ち中はボット動作させない
    const cur = room.players[g.currentPlayerIndex];
    if (!cur?.isBot) return;
    const delay = 1600 + Math.floor(Math.random() * 1400); // 1.6〜3.0秒
    setTimeout(() => {
      if (rooms[room.code]?.game !== g) return;
      handleDrawCard(room, cur.id);
    }, delay);
  }
}

function botConcFlip(room, bot) {
  const g = room.game;
  if (!g || g.phase !== 'playing') return;
  if (room.players[g.currentPlayerIndex]?.id !== bot.id) return;

  if (!g.botMemory) g.botMemory = {};
  if (!g.botMemory[bot.id]) g.botMemory[bot.id] = {};
  const mem = g.botMemory[bot.id];

  const HIT_RATE = 0.50; // 記憶したペアを使う確率

  const faceDown = g.cards.filter(c => !c.faceUp && !c.matched);
  const faceDownIds = new Set(faceDown.map(c => c.id));

  // 記憶から完全なペアを探す
  const byWord = {};
  for (const [id, info] of Object.entries(mem)) {
    if (!faceDownIds.has(id)) continue;
    if (!byWord[info.wordId]) byWord[info.wordId] = {};
    byWord[info.wordId][info.type] = id;
  }
  const knownPairs = Object.values(byWord).filter(p => p.word && p.answer);

  const pickRandom = (type) => {
    const pool = faceDown.filter(c => c.type === type);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  };
  const pickUnknown = (type) => {
    const pool = faceDown.filter(c => c.type === type && !mem[c.id]);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : pickRandom(type);
  };

  // enパターンは必ずanswerゾーン（定義）から先にめくる
  const enPattern = room.settings.pattern === 'en';

  let firstId, secondId = null;

  if (knownPairs.length > 0 && Math.random() < HIT_RATE) {
    const pair = knownPairs[Math.floor(Math.random() * knownPairs.length)];
    // enパターン: 定義(answer)→英単語(word) の順で
    firstId  = enPattern ? pair.answer : pair.word;
    secondId = enPattern ? pair.word   : pair.answer;
  } else {
    // ランダム探索: enパターンは必ずanswerから
    const startType = enPattern ? 'answer' : (Math.random() < 0.5 ? 'word' : 'answer');
    const c1 = pickUnknown(startType) || pickUnknown(startType === 'word' ? 'answer' : 'word');
    if (!c1) return;
    firstId = c1.id;
  }

  handleFlipCard(room, bot.id, firstId);

  setTimeout(() => {
    if (rooms[room.code]?.game !== g) return;
    if (room.players[g.currentPlayerIndex]?.id !== bot.id) return;

    let c2Id = secondId;

    if (!c2Id) {
      // 1枚めくった後、そのカードのペアを記憶していれば使う（これも確率的に）
      const flipped = g.flipped[0];
      if (flipped) {
        const oppType = flipped.type === 'word' ? 'answer' : 'word';
        const knownMatch = Object.entries(mem).find(([id, info]) =>
          info.wordId === flipped.wordId && info.type === oppType && faceDownIds.has(id)
        );
        if (knownMatch && Math.random() < HIT_RATE) {
          c2Id = knownMatch[0];
        } else {
          c2Id = (pickUnknown(oppType) || pickRandom(oppType))?.id;
        }
      }
    }

    if (!c2Id) {
      // c2が見つからない場合: 1枚目を裏に戻してターンを進める
      if (g.flipped.length === 1) {
        g.flipped[0].faceUp = false;
        g.flipped = [];
      }
      g.currentPlayerIndex = (g.currentPlayerIndex + 1) % room.players.length;
      io.to(room.code).emit('game-state', gameStatePayload(room));
      scheduleBotAction(room);
      return;
    }
    handleFlipCard(room, bot.id, c2Id);
  }, 1200 + Math.floor(Math.random() * 1000));
}

function botOldMaidDeal(room) {
  const g = room.game;
  // ボットは全ペアを自動で捨てて即座に準備完了
  room.players.filter(p => p.isBot).forEach(bot => {
    const { remaining } = discardPairs(g.hands[bot.id]);
    g.hands[bot.id] = remaining;
    if (remaining.length === 0 && !g.eliminated.includes(bot.id)) {
      g.eliminated.push(bot.id);
    }
    if (!g.readyPlayers.includes(bot.id)) g.readyPlayers.push(bot.id);
  });

  // 全員（非脱落）が準備完了なら playing へ
  const nonElim = room.players.filter(p => !g.eliminated.includes(p.id));
  if (nonElim.length > 0 && nonElim.every(p => g.readyPlayers.includes(p.id))) {
    g.phase = 'playing';
    g.readyPlayers = [];
  }

  io.to(room.code).emit('game-state', gameStatePayload(room));

  // 人間プレイヤーに手札を配布
  room.players.filter(p => !p.isBot).forEach(p => {
    const s = io.sockets.sockets.get(p.id);
    if (s) s.emit('hand-update', { hand: g.hands[p.id] });
  });

  if (g.phase === 'playing') scheduleBotAction(room);
}

// ─── State payloads ───────────────────────────────────────────────────────────

function gameStatePayload(room) {
  const g = room.game;
  if (g.type === 'concentration') {
    return {
      type: 'concentration',
      cards: g.cards,
      pattern: room.settings.pattern,
      currentPlayer: room.players[g.currentPlayerIndex]?.id,
      currentPlayerName: room.players[g.currentPlayerIndex]?.name,
      currentPlayerIsBot: room.players[g.currentPlayerIndex]?.isBot ?? false,
      scores: room.players.map(p => ({ id: p.id, name: p.name, score: g.scores[p.id] ?? 0, isBot: p.isBot })),
      phase: g.phase,
    };
  }
  if (g.type === 'oldmaid') {
    return {
      type: 'oldmaid',
      phase: g.phase,
      readyCount: g.readyPlayers?.length ?? 0,
      totalPlayers: room.players.length,
      currentPlayer: room.players[g.currentPlayerIndex]?.id,
      currentPlayerName: room.players[g.currentPlayerIndex]?.name,
      waitingForPass: g.waitingForPass ?? null,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        isBot: p.isBot ?? false,
        handCount: g.hands[p.id]?.length ?? 0,
        eliminated: g.eliminated.includes(p.id),
        ready: g.readyPlayers?.includes(p.id) ?? false,
      })),
    };
  }
}

function roomStatePayload(room) {
  return {
    code: room.code,
    host: room.host,
    players: room.players.filter(p => !p.isBot), // ロビーにはボットを表示しない
    settings: room.settings,
    phase: room.phase,
    hasCustomWords: !!room.customWords,
  };
}

// clientId → socketId のマッピング（再接続対応）
const clientSocketMap = {}; // clientId → socket.id
const disconnectTimers = {}; // clientId → timer

function findPlayerByClientId(clientId) {
  for (const room of Object.values(rooms)) {
    const player = room.players.find(p => p.clientId === clientId);
    if (player) return { room, player };
  }
  return null;
}

// ─── Socket.io ────────────────────────────────────────────────────────────────

io.on('connection', socket => {

  // 再接続: clientIdで既存プレイヤーに紐づける
  socket.on('reconnect-player', ({ clientId }) => {
    if (!clientId) return;
    socket.data.clientId = clientId;
    clientSocketMap[clientId] = socket.id;

    // 切断タイマーをキャンセル
    if (disconnectTimers[clientId]) {
      clearTimeout(disconnectTimers[clientId]);
      delete disconnectTimers[clientId];
    }

    const found = findPlayerByClientId(clientId);
    if (!found) return;

    const { room, player } = found;
    const oldSocketId = player.id;
    player.id = socket.id; // socket.idを更新
    if (room.host === oldSocketId) room.host = socket.id;

    socket.data.roomCode = room.code;
    socket.join(room.code);

    // ゲーム中なら現在のゲーム状態を送信
    if (room.game) {
      socket.emit('game-state', gameStatePayload(room));
    } else {
      socket.emit('room-state', roomStatePayload(room));
    }
  });

  socket.on('create-room', ({ name, settings, clientId }) => {
    const code = generateCode();
    if (clientId) { socket.data.clientId = clientId; clientSocketMap[clientId] = socket.id; }
    const player = { id: socket.id, name, clientId };
    rooms[code] = {
      code,
      host: socket.id,
      players: [player],
      settings: { category: 'toeic', pattern: 'jp', game: 'concentration', pairCount: 15, cpuCount: 0, ...settings },
      phase: 'lobby',
      game: null,
      customWords: null,
    };
    socket.data.playerId = socket.id;
    socket.data.roomCode = code;
    socket.join(code);
    socket.emit('room-created', { code });
    io.to(code).emit('room-state', roomStatePayload(rooms[code]));
  });

  socket.on('join-room', ({ code, name, clientId }) => {
    const upper = code.toUpperCase();
    const room = rooms[upper];
    if (!room) return socket.emit('error', { message: 'ルームが見つかりません' });

    if (clientId) { socket.data.clientId = clientId; clientSocketMap[clientId] = socket.id; }

    // ゲーム中に同じclientIdのプレイヤーが再参加する場合は復帰
    if (clientId && room.game) {
      const existing = room.players.find(p => p.clientId === clientId);
      if (existing) {
        const oldId = existing.id;
        existing.id = socket.id;
        if (room.host === oldId) room.host = socket.id;
        socket.data.roomCode = upper;
        socket.join(upper);
        socket.emit('game-state', gameStatePayload(room));
        return;
      }
    }

    const humanCount = room.players.filter(p => !p.isBot).length;
    if (humanCount >= 8) return socket.emit('error', { message: 'ルームが満員です (最大8人)' });

    const player = { id: socket.id, name, clientId };
    room.players.push(player);
    socket.data.playerId = socket.id;
    socket.data.roomCode = upper;
    socket.join(upper);
    socket.emit('room-joined', { code: upper, gameInProgress: room.phase !== 'lobby' });
    io.to(upper).emit('room-state', roomStatePayload(room));
  });

  socket.on('update-settings', (settings) => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.host !== socket.id) return;
    Object.assign(room.settings, settings);
    io.to(room.code).emit('room-state', roomStatePayload(room));
  });

  socket.on('import-words', ({ words }) => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.host !== socket.id) return;
    room.customWords = words;
    room.settings.category = 'custom';
    io.to(room.code).emit('room-state', roomStatePayload(room));
  });

  socket.on('start-game', () => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.host !== socket.id) return;

    // 既存のボットをリセットして設定数分追加
    room.players = room.players.filter(p => !p.isBot);
    const cpuCount = Math.min(room.settings.cpuCount || 0, 3);
    for (let i = 0; i < cpuCount; i++) {
      room.players.push({ id: `bot-${i + 1}`, name: `CPU ${i + 1}`, isBot: true });
    }

    if (room.players.length < 2) {
      return socket.emit('error', { code: 'needMorePlayers' });
    }

    room.phase = 'playing';

    if (room.settings.game === 'concentration') {
      startConcentration(room);
      io.to(room.code).emit('game-start', { gameType: 'concentration' });
      io.to(room.code).emit('game-state', gameStatePayload(room));
      scheduleBotAction(room);
    } else {
      startOldMaid(room);
      io.to(room.code).emit('game-start', { gameType: 'oldmaid' });
      // ボットの配牌処理（内部で game-state と hand-update を送信）
      botOldMaidDeal(room);
    }
  });

  socket.on('flip-card', ({ cardId }) => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.game?.type !== 'concentration') return;
    handleFlipCard(room, socket.id, cardId);
  });

  socket.on('draw-card', () => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.game?.type !== 'oldmaid') return;
    handleDrawCard(room, socket.id, socket);
  });

  socket.on('player-ready', () => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.game?.type !== 'oldmaid' || room.game.phase !== 'dealing') return;
    const g = room.game;
    if (!g.readyPlayers.includes(socket.id)) g.readyPlayers.push(socket.id);

    const nonElim = room.players.filter(p => !g.eliminated.includes(p.id));
    if (nonElim.every(p => g.readyPlayers.includes(p.id))) {
      g.phase = 'playing';
      g.readyPlayers = [];
      io.to(room.code).emit('game-state', gameStatePayload(room));
      scheduleBotAction(room);
    } else {
      io.to(room.code).emit('game-state', gameStatePayload(room));
    }
  });

  socket.on('pass-turn', () => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.game?.type !== 'oldmaid') return;
    const g = room.game;
    if (g.phase !== 'playing') return;
    if (g.waitingForPass !== socket.id) return;
    g.waitingForPass = null;
    advanceTurn(room);
    io.to(room.code).emit('game-state', gameStatePayload(room));
    scheduleBotAction(room);
  });

  socket.on('discard-pair', ({ cardId1, cardId2 }) => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.game?.type !== 'oldmaid') return;
    const g = room.game;
    if (g.phase !== 'dealing' && g.phase !== 'playing') return;
    const hand = g.hands[socket.id];
    if (!hand) return;

    const card1 = hand.find(c => c.id === cardId1);
    const card2 = hand.find(c => c.id === cardId2);
    if (!card1 || !card2) return socket.emit('discard-error', { code: 'notInHand' });
    if (card1.wordId === 'joker' || card2.wordId === 'joker') return socket.emit('discard-error', { code: 'jokerCannotDiscard' });
    if (card1.wordId !== card2.wordId) return socket.emit('discard-error', { code: 'notAPair' });

    g.hands[socket.id] = hand.filter(c => c.id !== cardId1 && c.id !== cardId2);
    if (g.hands[socket.id].length === 0 && !g.eliminated.includes(socket.id)) {
      g.eliminated.push(socket.id);
      // 手札が全部なくなったら自動でターンを進める
      if (g.waitingForPass === socket.id) {
        g.waitingForPass = null;
        if (!checkOldMaidGameOver(room)) {
          advanceTurn(room);
          io.to(room.code).emit('game-state', gameStatePayload(room));
          scheduleBotAction(room);
        }
        socket.emit('hand-update', { hand: [], discarded: [card1, card2] });
        return;
      }
    }

    if (checkOldMaidGameOver(room)) return;

    io.to(room.code).emit('game-state', gameStatePayload(room));
    socket.emit('hand-update', { hand: g.hands[socket.id], discarded: [card1, card2] });
  });

  socket.on('sync-state', () => {
    const room = rooms[socket.data.roomCode];
    if (room?.game) socket.emit('game-state', gameStatePayload(room));
  });

  socket.on('end-concentration', () => {
    const room = rooms[socket.data.roomCode];
    if (!room || !room.game || room.game.type !== 'concentration') return;
    if (room.game.phase === 'finished') return;
    room.game.phase = 'finished';
    io.to(room.code).emit('game-over', buildConcentrationResult(room));
  });

  socket.on('restart-game', () => {
    const room = rooms[socket.data.roomCode];
    if (!room || room.host !== socket.id) return;
    room.players = room.players.filter(p => !p.isBot);
    room.phase = 'lobby';
    room.game = null;
    io.to(room.code).emit('room-state', roomStatePayload(room));
  });

  // 誰でも使えるルームに戻るイベント
  // ホストなら全員をロビーに戻す、非ホストは自分だけルーム画面へ
  socket.on('return-to-room', () => {
    const room = rooms[socket.data.roomCode];
    if (!room) return;
    if (room.host === socket.id) {
      // ホスト: ゲームをリセットして全員をロビーへ
      room.players = room.players.filter(p => !p.isBot);
      room.phase = 'lobby';
      room.game = null;
      io.to(room.code).emit('room-state', roomStatePayload(room));
    } else {
      // 非ホスト: 自分だけに現在のルーム状態を送る
      socket.emit('room-state', roomStatePayload(room));
    }
  });

  socket.on('leave-room', () => {
    const code = socket.data.roomCode;
    const room = rooms[code];
    if (!room) return;
    room.players = room.players.filter(p => p.id !== socket.id);
    socket.leave(code);
    socket.data.roomCode = null;
    if (room.players.filter(p => !p.isBot).length === 0) {
      delete rooms[code];
      return;
    }
    if (room.host === socket.id) room.host = room.players.find(p => !p.isBot)?.id ?? room.players[0]?.id;
    io.to(code).emit('room-state', roomStatePayload(room));
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    const clientId = socket.data.clientId;
    const room = rooms[code];
    if (!room) return;

    const removePlayer = () => {
      if (clientId) delete disconnectTimers[clientId];
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx === -1) return;

      // currentPlayerIndex のズレを補正
      const g = room.game;
      if (g && g.type === 'concentration' && g.currentPlayerIndex >= idx) {
        g.currentPlayerIndex = Math.max(0, g.currentPlayerIndex - 1);
      }

      room.players.splice(idx, 1);

      if (room.players.filter(p => !p.isBot).length === 0) {
        delete rooms[code];
        return;
      }
      if (room.host === socket.id) {
        room.host = room.players.find(p => !p.isBot)?.id ?? room.players[0]?.id;
      }
      if (g && g.phase === 'playing') {
        // インデックス越境防止
        g.currentPlayerIndex = g.currentPlayerIndex % room.players.length;
        io.to(code).emit('game-state', gameStatePayload(room));
        scheduleBotAction(room);
      } else {
        io.to(code).emit('room-state', roomStatePayload(room));
      }
    };

    // ゲーム中は5分間プレイヤーを保持して再接続を待つ（学校WiFiの途切れ対策）
    if (room.game && room.game.phase === 'playing' && clientId) {
      disconnectTimers[clientId] = setTimeout(removePlayer, 300000);

      // 神経衰弱: 切断したプレイヤーのターンなら5秒後にスキップ
      const g = room.game;
      if (g && g.type === 'concentration') {
        const currentPlayer = room.players[g.currentPlayerIndex];
        if (currentPlayer && currentPlayer.id === socket.id) {
          setTimeout(() => {
            if (!rooms[code] || rooms[code].game !== g || g.phase !== 'playing') return;
            if (room.players[g.currentPlayerIndex]?.id !== socket.id) return;
            // フリップ中のカードを戻してターンを進める
            g.flipped.forEach(c => { c.faceUp = false; });
            g.flipped = [];
            g.currentPlayerIndex = (g.currentPlayerIndex + 1) % room.players.length;
            io.to(code).emit('game-state', gameStatePayload(room));
            scheduleBotAction(room);
          }, 5000);
        }
      }
    } else {
      removePlayer();
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
