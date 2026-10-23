let right = [];
let down = [];
let visited = [];
for (let y = 0; y < SIZE; y++) {
  right.push(new Array(SIZE).fill(false));
  down.push(new Array(SIZE).fill(false));
  visited.push(new Array(SIZE).fill(false));
}

function openWall(x1, y1, x2, y2) {
  if (x1 !== x2) right[y1][Math.min(x1, x2)] = true;
  else down[Math.min(y1, y2)][x1] = true;
}

for (let i = 0; i < ROPE_PATH.length; i++) {
  let [x, y] = ROPE_PATH[i];
  visited[y][x] = true;
  if (i > 0) {
    let [px, py] = ROPE_PATH[i - 1];
    openWall(px, py, x, y);
  }
}

let rand = makeRandom(MAZE_SEED);

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function dig(x, y) {
  let dirs = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]);
  for (let [dx, dy] of dirs) {
    let nx = x + dx;
    let ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) continue;
    if (visited[ny][nx]) continue;
    visited[ny][nx] = true;
    openWall(x, y, nx, ny);
    dig(nx, ny);
  }
}

let starts = shuffle(ROPE_PATH.slice(0, -1));
for (let [x, y] of starts) dig(x, y);

function inside(x, y) {
  return x >= 0 && y >= 0 && x < SIZE && y < SIZE;
}

function canGo(x, y, dx, dy) {
  let nx = x + dx;
  let ny = y + dy;
  if (!inside(nx, ny)) return false;
  if (dy === 0) return right[y][Math.min(x, nx)];
  if (dx === 0) return down[Math.min(y, ny)][x];
  return (canGo(x, y, dx, 0) && canGo(nx, y, 0, dy)) ||
         (canGo(x, y, 0, dy) && canGo(x, ny, dx, 0));
}


let ropeDirs = {};
for (let i = 0; i < ROPE_PATH.length; i++) {
  let [x, y] = ROPE_PATH[i];
  let dirs = [];
  if (i > 0) dirs.push([ROPE_PATH[i - 1][0] - x, ROPE_PATH[i - 1][1] - y]);
  if (i < ROPE_PATH.length - 1) dirs.push([ROPE_PATH[i + 1][0] - x, ROPE_PATH[i + 1][1] - y]);
  ropeDirs[x + ',' + y] = dirs;
}

let photoAt = {};
for (let p of PHOTOS) photoAt[p.x + ',' + p.y] = p.src;

let dotsAt = {};
let dotGap = DOT_PATH.length / DOT_COUNT;
for (let i = 0; i < DOT_COUNT; i++) {
  let pos = (i + 0.5) * dotGap;
  let idx = Math.floor(pos);
  let k = DOT_PATH[idx][0] + ',' + DOT_PATH[idx][1];
  if (!dotsAt[k]) dotsAt[k] = [];
  dotsAt[k].push(pos - idx);
}


let world = document.getElementById('world');
let roomImgs = {};

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    let room = document.createElement('div');
    room.className = 'room';
    room.style.setProperty('--x', x);
    room.style.setProperty('--y', y);
    let img = document.createElement('img');
    img.alt = '';
    room.appendChild(img);
    world.appendChild(room);
    roomImgs[x + ',' + y] = img;
  }
}

function paint(x, y) {
  let img = roomImgs[x + ',' + y];
  if (img.src) return;
  let k = x + ',' + y;
  if (photoAt[k]) img.src = photoAt[k];
  else img.src = drawRoom(500 + y * SIZE + x, ropeDirs[k], dotsAt[k]);
}


let cx = ROPE_PATH[0][0];
let cy = ROPE_PATH[0][1];

function show() {
  world.style.setProperty('--cx', cx);
  world.style.setProperty('--cy', cy);
  paint(cx, cy);

  let todo = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if ((dx || dy) && inside(cx + dx, cy + dy)) todo.push([cx + dx, cy + dy]);
    }
  }
  function next() {
    let p = todo.shift();
    if (!p) return;
    paint(p[0], p[1]);
    setTimeout(next, 30);
  }
  next();
}

function move(dx, dy) {
  if (!dx && !dy) return;
  if (!canGo(cx, cy, dx, dy)) return;
  cx += dx;
  cy += dy;
  show();
}

show();


let stage = document.getElementById('stage');
let sumX = 0, sumY = 0;
let waiting = false;
let lastWheel = 0, movedAt = 0;

stage.addEventListener('wheel', function (e) {
  e.preventDefault();
  lastWheel = performance.now();
  if (waiting) return;

  let x = e.deltaX;
  let y = e.deltaY;
  if (e.shiftKey && !x) { x = y; y = 0; }
  sumX += x;
  sumY += y;
  if (Math.abs(sumX) < SCROLL_AMOUNT && Math.abs(sumY) < SCROLL_AMOUNT) return;

  let big = Math.max(Math.abs(sumX), Math.abs(sumY));
  let dx = Math.abs(sumX) > big * 0.45 ? Math.sign(sumX) : 0;
  let dy = Math.abs(sumY) > big * 0.45 ? Math.sign(sumY) : 0;
  sumX = 0;
  sumY = 0;
  move(dx, dy);

  waiting = true;
  movedAt = performance.now();
  function check() {
    let now = performance.now();
    if (now - lastWheel > 140 && now - movedAt > 300) waiting = false;
    else setTimeout(check, 40);
  }
  check();
}, { passive: false });


let keyDir = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
  a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1],
};
let pressed = new Set();
let keyTimer = null;

document.addEventListener('keydown', function (e) {
  let k = keyDir[e.key] ? e.key : e.key.toLowerCase();
  if (!keyDir[k]) return;
  e.preventDefault();
  if (e.repeat) return;
  pressed.add(k);
  if (keyTimer) return;
  keyTimer = setTimeout(function () {
    let dx = 0, dy = 0;
    pressed.forEach(function (p) {
      dx += keyDir[p][0];
      dy += keyDir[p][1];
    });
    keyTimer = null;
    move(Math.sign(dx), Math.sign(dy));
  }, 70);
});

document.addEventListener('keyup', function (e) {
  pressed.delete(e.key);
  pressed.delete(e.key.toLowerCase());
});
window.addEventListener('blur', function () { pressed.clear(); });


let touchX = null, touchY = null;
stage.addEventListener('touchstart', function (e) {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}, { passive: true });

stage.addEventListener('touchend', function (e) {
  if (touchX === null) return;
  let vx = touchX - e.changedTouches[0].clientX;
  let vy = touchY - e.changedTouches[0].clientY;
  touchX = null;
  if (Math.hypot(vx, vy) < 40) return;
  let step = Math.round(Math.atan2(vy, vx) / (Math.PI / 4));
  move(Math.round(Math.cos(step * Math.PI / 4)), Math.round(Math.sin(step * Math.PI / 4)));
});
