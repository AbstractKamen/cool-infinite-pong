// INIT
window.onload = setup;

// CONST
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const CELL_SIZE = 10;
const CELLS = [];
const FPS = 60;
const PONG_RADIUS = 25;
const PONG_VELOCITY = 0.3;

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
  if (newX - r < 0 || newX + r >= WIDTH || oppositePlayerCellCollission(player)) {
    thePong.xv *= -1;
  } else {
    thePong.x = newX;
  }

  if (newY - r < 0 || newY + r >= HEIGHT || oppositePlayerCellCollission(player)) {
    thePong.yv *= -1;
  } else {
    thePong.y = newY;
  }

  oppositePlayerPongCollision(player);
}

function oppositePlayerCellCollission(player) {
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

// thanks mr gpt for vector stuff
function oppositePlayerPongCollision(player) {
  let thePong = player.pong;
  let oppositePong = player === player1 ? player2.pong : player1.pong;

  // Vector between the two pongs
  let dx = thePong.x - oppositePong.x;
  let dy = thePong.y - oppositePong.y;
  let distanceSquared = dx * dx + dy * dy;
  let minDistance = thePong.r + oppositePong.r + CELL_SIZE + 0.2 * CELL_SIZE; // need this extra distance so they don't get stuck

  // Check if the pongs are colliding
  if (distanceSquared < minDistance * minDistance) {
    let distance = Math.sqrt(distanceSquared) || 1; // Prevent division by zero
    let overlap = minDistance - distance;

    // Normalize collision vector
    let nx = dx / distance;
    let ny = dy / distance;

    // Separate the pongs equally based on their overlap
    thePong.x += nx * (overlap / 2);
    thePong.y += ny * (overlap / 2);
    oppositePong.x -= nx * (overlap / 2);
    oppositePong.y -= ny * (overlap / 2);

    // Reflect velocities along the collision vector
    let dotProduct1 = thePong.xv * nx + thePong.yv * ny;
    let dotProduct2 = oppositePong.xv * nx + oppositePong.yv * ny;

    thePong.xv -= 2 * dotProduct1 * nx;
    thePong.yv -= 2 * dotProduct1 * ny;

    oppositePong.xv -= 2 * dotProduct2 * nx;
    oppositePong.yv -= 2 * dotProduct2 * ny;
  }
}




// www.twitch.tv/tsoding god tier programmer
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
  ctx.fillText("Cool Infinite Pong v0.0.1", 10, 80);
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