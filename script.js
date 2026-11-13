'use strict';
/* Tank Turn Tactics - juego por turnos en un solo dispositivo (hot-seat) */
(() => {
  // ---------- Configuración ----------
  const COLS = 18, ROWS = 18, CELL = 36;
  const MAX_HP = 100, DAMAGE = 25, RANGE = 4, AP_PER_TURN = 2;
  const COLORS = ['#e63946', '#2a9df4', '#2ecc71', '#f4d03f', '#9b59b6', '#ff8c42', '#1abc9c',
                  '#ff6fb5', '#8d6e63', '#c0ff3e', '#00e5ff', '#b0bec5', '#6c5ce7', '#ff5252'];
  const MAP = [
    '..................',
    '..###......###....',
    '..#..........#....',
    '......##..##......',
    '....#........#....',
    '.##....####....##.',
    '..................',
    '...#....##....#...',
    '...#....##....#...',
    '..................',
    '.##....####....##.',
    '....#........#....',
    '......##..##......',
    '..#..........#....',
    '..###......###....',
    '..................',
    '..................',
    '..................'
  ];

  // ---------- Estado ----------
  let players = [], current = 0, ap = 0, over = false, count = 6;

  // ---------- Elementos ----------
  const $ = id => document.getElementById(id);
  const canvas = $('board'), ctx = canvas.getContext('2d');
  canvas.width = COLS * CELL;
  canvas.height = ROWS * CELL;

  // ---------- Utilidades ----------
  const isWall = (x, y) => MAP[y][x] === '#';
  const inside = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
  const tankAt = (x, y) => players.find(p => p.alive && p.x === x && p.y === y);
  const dist = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  const alive = () => players.filter(p => p.alive);
  const say = t => { $('message').textContent = t; };

  function hasLineOfSight(a, b) {
    const steps = dist(a, b);
    for (let i = 1; i < steps; i++) {
      const x = Math.round(a.x + (b.x - a.x) * i / steps);
      const y = Math.round(a.y + (b.y - a.y) * i / steps);
      if (isWall(x, y)) return false;
    }
    return true;
  }
  const canShoot = (a, b) => a !== b && b.alive && dist(a, b) <= RANGE && hasLineOfSight(a, b);

  function spawnPoints(n) {
    const free = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!isWall(x, y)) free.push({ x, y });
    for (let i = free.length - 1; i > 0; i--) { // barajar
      const j = Math.floor(Math.random() * (i + 1));
      [free[i], free[j]] = [free[j], free[i]];
    }
    const chosen = [];
    for (let d = 6; d >= 0 && chosen.length < n; d--) {
      for (const c of free) {
        if (chosen.length >= n) break;
        if (!chosen.includes(c) && chosen.every(o => dist(o, c) >= d)) chosen.push(c);
      }
    }
    return chosen;
  }

  // ---------- Flujo del juego ----------
  function showScreen(name) {
    $('menu').hidden = name !== 'menu';
    $('game').hidden = name !== 'game';
    $('over').hidden = true;
  }

  function startGame() {
    const spots = spawnPoints(count);
    players = spots.map((s, i) => ({
      id: i + 1, name: 'Jugador ' + (i + 1), color: COLORS[i],
      x: s.x, y: s.y, hp: MAX_HP, alive: true, dir: [1, 0]
    }));
    current = 0; ap = AP_PER_TURN; over = false;
    showScreen('game');
    say('Mueve con un clic en casillas vecinas o dispara a un enemigo marcado en rojo.');
    updateUI();
  }

  function nextTurn() {
    do { current = (current + 1) % players.length; } while (!players[current].alive);
    ap = AP_PER_TURN;
    say('Turno de ' + players[current].name + '.');
    updateUI();
  }

  function spendAction() {
    ap--;
    if (alive().length === 1) return endGame();
    if (ap <= 0) nextTurn(); else updateUI();
  }

  function endGame() {
    over = true;
    updateUI();
    $('over-title').textContent = '🏆 ¡Gana ' + alive()[0].name + '!';
    $('over').hidden = false;
  }

  function move(dx, dy) {
    if (over || ap <= 0) return;
    const p = players[current], nx = p.x + dx, ny = p.y + dy;
    p.dir = [dx, dy];
    if (!inside(nx, ny) || isWall(nx, ny)) { say('Hay un obstáculo.'); return updateUI(); }
    if (tankAt(nx, ny)) { say('Esa casilla está ocupada.'); return updateUI(); }
    p.x = nx; p.y = ny;
    spendAction();
  }

  function shoot(target) {
    const p = players[current];
    if (!canShoot(p, target)) return say('Objetivo fuera de alcance o tapado por un muro.');
    p.dir = [Math.sign(target.x - p.x), Math.sign(target.y - p.y)];
    target.hp = Math.max(0, target.hp - DAMAGE);
    if (target.hp === 0) { target.alive = false; say(p.name + ' destruyó a ' + target.name + '.'); }
    else say(p.name + ' dispara a ' + target.name + ': -' + DAMAGE + ' vida.');
    spendAction();
  }

  // ---------- Interfaz ----------
  function updateUI() {
    const p = players[current];
    $('turn-dot').style.background = p.color;
    $('turn-text').textContent = over ? 'Partida terminada' : 'Turno de ' + p.name;
    $('ap-text').textContent = over ? '' : 'Acciones: ' + ap + '/' + AP_PER_TURN;
    $('player-list').innerHTML = players.map((q, i) =>
      '<li class="' + (i === current && !over ? 'current ' : '') + (q.alive ? '' : 'dead') + '">' +
      '<span class="sw" style="background:' + q.color + '"></span>' +
      '<span>' + q.name + '<div class="bar"><i style="width:' + q.hp + '%"></i></div></span>' +
      '<span>' + q.hp + '</span></li>').join('');
  }

  // ---------- Dibujo ----------
  function drawTank(p, isCurrent, t) {
    const cx = p.x * CELL + CELL / 2, cy = p.y * CELL + CELL / 2;
    if (isCurrent) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, CELL / 2 + 1 + Math.sin(t / 200) * 2, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.atan2(p.dir[1], p.dir[0]));
    ctx.fillStyle = '#222';
    ctx.fillRect(-13, -14, 26, 7); ctx.fillRect(-13, 7, 26, 7);   // orugas
    ctx.fillStyle = p.color;
    ctx.fillRect(-11, -9, 22, 18);                                 // casco
    ctx.fillStyle = '#222';
    ctx.fillRect(0, -2.5, 17, 5);                                  // cañón
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = p.color; ctx.fill();
    ctx.strokeStyle = '#0008'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    // barra de vida y número
    ctx.fillStyle = '#000a'; ctx.fillRect(p.x * CELL + 3, p.y * CELL + 1, CELL - 6, 4);
    ctx.fillStyle = p.hp > 50 ? '#6bd66b' : p.hp > 25 ? '#ffd166' : '#ef476f';
    ctx.fillRect(p.x * CELL + 3, p.y * CELL + 1, (CELL - 6) * p.hp / MAX_HP, 4);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(p.id, cx, p.y * CELL + CELL - 3);
  }

  function draw(t) {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#7cb86a' : '#86c273';
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      if (isWall(x, y)) {
        ctx.fillStyle = '#6d6d7a'; ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        ctx.fillStyle = '#8e8e9c'; ctx.fillRect(x * CELL + 3, y * CELL + 3, CELL - 6, CELL - 6);
      }
    }
    if (players.length && !over) {
      const p = players[current];
      if (ap > 0) {
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = p.x + dx, ny = p.y + dy;
          if (inside(nx, ny) && !isWall(nx, ny) && !tankAt(nx, ny)) {
            ctx.fillStyle = 'rgba(255,255,255,.35)';
            ctx.fillRect(nx * CELL + 2, ny * CELL + 2, CELL - 4, CELL - 4);
          }
        }
        for (const q of alive()) if (canShoot(p, q)) {
          ctx.strokeStyle = '#e63946'; ctx.lineWidth = 3;
          ctx.strokeRect(q.x * CELL + 2, q.y * CELL + 2, CELL - 4, CELL - 4);
        }
      }
    }
    players.forEach((q, i) => { if (q.alive) drawTank(q, i === current && !over, t); });
    requestAnimationFrame(draw);
  }

  // ---------- Eventos ----------
  canvas.addEventListener('click', e => {
    if (over || !players.length) return;
    const r = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) * COLS / r.width);
    const y = Math.floor((e.clientY - r.top) * ROWS / r.height);
    if (!inside(x, y) || ap <= 0) return;
    const p = players[current], target = tankAt(x, y);
    if (target) {
      if (target === p) return say('Ese es tu tanque.');
      return shoot(target);
    }
    const dx = x - p.x, dy = y - p.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) move(dx, dy);
    else say('Solo puedes moverte a una casilla vecina.');
  });

  document.addEventListener('keydown', e => {
    if ($('game').hidden || over) return;
    const k = e.key.toLowerCase();
    const dirs = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1],
                   arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
    if (dirs[k]) { e.preventDefault(); move(...dirs[k]); }
    else if (k === 'enter') { e.preventDefault(); nextTurn(); }
  });

  $('count').addEventListener('input', e => {
    count = Number(e.target.value);
    $('count-label').textContent = count;
  });
  $('btn-play').addEventListener('click', startGame);
  $('btn-help').addEventListener('click', () => { $('help').hidden = !$('help').hidden; });
  $('btn-end').addEventListener('click', () => { if (!over) nextTurn(); });
  $('btn-restart').addEventListener('click', startGame);
  $('btn-again').addEventListener('click', startGame);
  $('btn-menu').addEventListener('click', () => showScreen('menu'));
  $('btn-over-menu').addEventListener('click', () => showScreen('menu'));

  requestAnimationFrame(draw);
})();
