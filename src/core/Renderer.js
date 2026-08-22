export class Renderer {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  render({ player, objective, zombies, projectiles, gameOver }) {
    const { ctx, canvas } = this;
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawObjective(objective);
    for (const zombie of zombies) this.drawZombie(zombie);
    for (const projectile of projectiles) this.drawProjectile(projectile);
    this.drawPlayer(player);

    if (gameOver) this.drawGameOver();
  }

  drawObjective(objective) {
    const { ctx } = this;
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(objective.x, objective.y, objective.radius, 0, Math.PI * 2);
    ctx.fill();
    this.drawHpBar(objective.x, objective.y - objective.radius - 14, 60, objective.hp, objective.maxHp, "#3b82f6");
  }

  drawPlayer(player) {
    const { ctx } = this;
    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    this.drawHpBar(player.x, player.y - player.radius - 12, 40, player.hp, player.maxHp, "#4ade80");
  }

  drawZombie(zombie) {
    const { ctx } = this;
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(zombie.x, zombie.y, zombie.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawProjectile(projectile) {
    const { ctx } = this;
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHpBar(x, y, width, hp, maxHp, color) {
    const { ctx } = this;
    const height = 6;
    ctx.fillStyle = "#333";
    ctx.fillRect(x - width / 2, y, width, height);
    ctx.fillStyle = color;
    ctx.fillRect(x - width / 2, y, width * Math.max(0, hp / maxHp), height);
  }

  drawGameOver() {
    const { ctx, canvas } = this;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.fillStyle = "#f87171";
    ctx.font = "48px sans-serif";
    ctx.fillText("OBJECTIVE DESTROYED", canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "20px sans-serif";
    ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 30);
    ctx.textAlign = "left";
  }
}
