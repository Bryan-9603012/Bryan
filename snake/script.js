// 簡單的貪吃蛇遊戲實作（純前端）
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

const CANVAS_SIZE = Math.min(canvas.width, canvas.height);
const CELL_COUNT = 20; // 格子數
const CELL = Math.floor(CANVAS_SIZE / CELL_COUNT);

let snake = [];
let dir = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };
let food = null;
let gameInterval = null;
let speed = 120; // ms per tick
let score = 0;
let running = false;
let paused = false;

function resetGame() {
  snake = [ { x: 8, y: 10 }, { x: 7, y: 10 }, { x: 6, y: 10 } ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  spawnFood();
  score = 0;
  updateScore();
}

function spawnFood() {
  while (true) {
    const fx = Math.floor(Math.random() * CELL_COUNT);
    const fy = Math.floor(Math.random() * CELL_COUNT);
    if (!snake.some(s => s.x === fx && s.y === fy)) {
      food = { x: fx, y: fy };
      return;
    }
  }
}

function updateScore() {
  scoreEl.textContent = `分數：${score}`;
}

function start() {
  if (running) stop();
  resetGame();
  running = true;
  paused = false;
  gameInterval = setInterval(tick, speed);
}

function stop() {
  running = false;
  clearInterval(gameInterval);
  gameInterval = null;
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) clearInterval(gameInterval);
  else gameInterval = setInterval(tick, speed);
}

function tick() {
  // apply nextDir (prevent reversing)
  if ((nextDir.x !== -dir.x || nextDir.y !== -dir.y) ) {
    dir = nextDir;
  }

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // wall collision -> game over
  if (head.x < 0 || head.x >= CELL_COUNT || head.y < 0 || head.y >= CELL_COUNT) {
    gameOver();
    return;
  }

  // self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // food
  if (food && head.x === food.x && head.y === food.y) {
    score += 10;
    updateScore();
    spawnFood();
    // optionally speed up
    if (speed > 40) {
      speed = Math.max(40, speed - 2);
      clearInterval(gameInterval);
      gameInterval = setInterval(tick, speed);
    }
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  stop();
  draw();
  // show overlay
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('遊戲結束', canvas.width/2, canvas.height/2 - 10);
  ctx.font = '18px sans-serif';
  ctx.fillText(`最終分數：${score}`, canvas.width/2, canvas.height/2 + 24);
}

function drawGrid() {
  ctx.fillStyle = '#071226';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // draw food
  if (food) {
    ctx.fillStyle = '#ff5c5c';
    ctx.fillRect(food.x * CELL + 1, food.y * CELL + 1, CELL - 2, CELL - 2);
  }

  // draw snake
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    if (i === 0) ctx.fillStyle = '#7ee787';
    else ctx.fillStyle = '#39a36c';
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
  }
}

// input
window.addEventListener('keydown', (e) => {
  const key = e.key;
  if (key === 'ArrowUp' || key === 'w' || key === 'W') nextDir = { x: 0, y: -1 };
  if (key === 'ArrowDown' || key === 's' || key === 'S') nextDir = { x: 0, y: 1 };
  if (key === 'ArrowLeft' || key === 'a' || key === 'A') nextDir = { x: -1, y: 0 };
  if (key === 'ArrowRight' || key === 'd' || key === 'D') nextDir = { x: 1, y: 0 };
  if (key === ' ' ) { // space to pause
    togglePause();
  }
});

startBtn.addEventListener('click', () => start());
pauseBtn.addEventListener('click', () => togglePause());

// init draw
resetGame();
draw();