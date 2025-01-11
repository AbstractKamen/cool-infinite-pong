// INIT
window.onload = setup;

// CONST
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const CELL_SIZE = 40;
const CELLS = [];
const FPS = 60;
const PONG_RADIUS = 20.0;
const PONG_VELOCITY = 0.2;

// RUNTIME
var pongCanvas;
var ctx;
var start, now, then, deltaTime, fpsInterval;

var player1 = {
  color: "white",
  pong: getPong("black", 0 + PONG_RADIUS, 0 + PONG_RADIUS, PONG_RADIUS, PONG_VELOCITY, PONG_VELOCITY)
}

var player2 = {
  color: "black",
  pong: getPong("white", WIDTH - PONG_RADIUS, HEIGHT - PONG_RADIUS, PONG_RADIUS, -PONG_VELOCITY, -PONG_VELOCITY)
}

function getPong(color, x, y, r, xv, yv) {
  return {
    xv: xv,
    yv: yv,
    x: x,
    y: y,
    r: r,
    color: color,
    lastHitColor: undefined
  };
}

function setup() {
  pongCanvas = document.getElementById("pong");
  pongCanvas.width = WIDTH;
  pongCanvas.height = HEIGHT;
  ctx = pongCanvas.getContext("2d");
  ctx.font = "bold 40px Arial";

  const leftColLimit = WIDTH >> 1;
  for (let y = 0; y < HEIGHT; y += CELL_SIZE) {
    let row = [];
    for (let x = 0; x < WIDTH; x += CELL_SIZE) {
      let c = player1.color;
      if (x > leftColLimit) {
        c = player2.color;
      }
      row.push({
        x: x,
        y: y,
        color: c
      });
    }
    CELLS.push(row);
  }
  fpsInterval = 1000 / FPS;
  then = window.performance.now();
  start = then;


  animationStep();
}

function animationStep(newtime) {
  requestAnimationFrame(animationStep);
  now = newtime;
  deltaTime = now - then;
  if (deltaTime > fpsInterval) {
    then = now - (deltaTime % fpsInterval);
    update();
    draw();
  }
}

function update() {
  updatePlayer(player1);
  updatePlayer(player2);
}

function updatePlayer(player) {
  let thePong = player.pong;
  let r = thePong.r;

  let newX = thePong.x + thePong.xv * deltaTime;
  let newY = thePong.y + thePong.yv * deltaTime;

  if (newX - r < 0 || newX + r >= WIDTH || oppositePlayerCollission(player)) {
    thePong.xv *= -1;
  } else {
    thePong.x = newX;
  }

  if (newY - r < 0 || newY + r >= HEIGHT || oppositePlayerCollission(player)) {
    thePong.yv *= -1;
  } else {
    thePong.y = newY;
  }
}

function oppositePlayerCollission(player) {
  let thePong = player.pong;
  let r = thePong.r;
  let pongX = thePong.x;
  let pongY = thePong.y;
  let dyStart = Math.floor((pongY - r) / CELL_SIZE);
  let dyEnd = Math.floor((pongY + r) / CELL_SIZE);
  let dxStart = Math.floor((pongX - r) / CELL_SIZE);
  let dxEnd = Math.floor((pongX + r) / CELL_SIZE);

  for (let dy = dyStart; dy <= dyEnd; ++dy) {
    for (let dx = dxStart; dx <= dxEnd; ++dx) {
      let cell = CELLS[dy][dx];
      if (
        mrTsoding_rectCircleCollision(cell.x, cell.x + CELL_SIZE, cell.y, cell.y + CELL_SIZE, pongX, pongY, r) &&
        cell.color !== player.color
      ) {
        cell.color = player.color;
        return true;
      }
    }
  }
  return false;
}

// www.twitch.tv/Tsoding
function mrTsoding_rectCircleCollision(left, right, top, bottom, circleX, circleY, radius) {
  let x = Math.min(Math.max(left, circleX), right);
  let y = Math.min(Math.max(top, circleY), bottom);
  let dx = circleX - x;
  let dy = circleY - y;
  return dx * dx + dy * dy <= radius * radius;
}


function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  for (let row of CELLS) {
    for (let cell of row) {
      ctx.fillStyle = cell.color;
      ctx.fillRect(cell.x, cell.y, CELL_SIZE, CELL_SIZE);
    }
  }
  drawPlayer(player1);
  drawPlayer(player2);
  ctx.fillStyle = "black";
  ctx.fillText("Cool Infinite Pong v0.0.1",10, 80);
}

function drawPlayer(player) {
  let r = player.pong.r;
  let pongX = player.pong.x;
  let pongY = player.pong.y;
  ctx.fillStyle = player.pong.color;
  ctx.beginPath();
  ctx.arc(pongX, pongY, r, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}