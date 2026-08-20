const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

const game = {
  waveNumber: 1,
  waveTimer: 0,
  waveDuration: 10,
};

function update(dt) {
  game.waveTimer += dt;
  if (game.waveTimer >= game.waveDuration) {
    game.waveTimer = 0;
    game.waveNumber += 1;
  }
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#4ade80";
  ctx.font = "32px sans-serif";
  ctx.fillText(`Wave ${game.waveNumber}`, 24, 48);
}

let lastTime = performance.now();
function loop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
