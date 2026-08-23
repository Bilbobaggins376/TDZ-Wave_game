const THREAT_MARKER_DISTANCE = 240;

export class Renderer {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  render({ player, objective, zombies, projectiles, turrets, threatenedTurretIds, buildPreview, detonationFlash, gameOver, victory }) {
    const { ctx, canvas } = this;
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (buildPreview) this.drawBuildRadius(player);

    this.drawObjective(objective);
    for (const turret of turrets) this.drawTurret(turret, threatenedTurretIds.has(turret.id));
    for (const zombie of zombies) this.drawZombie(zombie);
    for (const projectile of projectiles) this.drawProjectile(projectile);
    this.drawPlayer(player);

    if (detonationFlash) this.drawDetonationFlash(detonationFlash);
    this.drawThreatMarkers(player, turrets, threatenedTurretIds);
    if (buildPreview) this.drawBuildPreview(buildPreview);

    if (gameOver) this.drawEndScreen("OBJECTIVE DESTROYED", "#f87171");
    if (victory) this.drawEndScreen("ALL 25 WAVES SURVIVED", "#4ade80");
  }

  drawBuildRadius(player) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.buildRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawBuildPreview({ x, y, type, blockReason }) {
    if (!type) return;
    const { ctx } = this;
    const valid = !blockReason;

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = valid ? type.color : "#7f1d1d";
    ctx.beginPath();
    ctx.arc(x, y, type.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = valid ? type.color : "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, type.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (blockReason) {
      ctx.save();
      ctx.fillStyle = "#fca5a5";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(blockReason, x, y - type.radius - 10);
      ctx.restore();
    }
  }

  drawTurret(turret, threatened) {
    const { ctx } = this;
    ctx.fillStyle = turret.type.color;
    ctx.beginPath();
    ctx.arc(turret.x, turret.y, turret.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(15, 23, 42, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // §10.1: HP bar only appears once the turret is actually taking fire.
    if (threatened || turret.hp < turret.maxHp) {
      this.drawHpBar(turret.x, turret.y - turret.radius - 10, turret.radius * 2.2, turret.hp, turret.maxHp, "#f87171");
    }

    if (threatened) {
      ctx.save();
      ctx.strokeStyle = "#f87171";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(turret.x, turret.y, turret.radius + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // §10.1: an off-screen-ish turret under attack gets an arrow near the
  // player, so abandoning it is a decision rather than an oversight.
  drawThreatMarkers(player, turrets, threatenedTurretIds) {
    const { ctx } = this;
    for (const turret of turrets) {
      if (!threatenedTurretIds.has(turret.id)) continue;
      const dx = turret.x - player.x;
      const dy = turret.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < THREAT_MARKER_DISTANCE || dist < 0.001) continue;

      const angle = Math.atan2(dy, dx);
      const markerDist = player.radius + 26;
      const mx = player.x + Math.cos(angle) * markerDist;
      const my = player.y + Math.sin(angle) * markerDist;

      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);
      ctx.fillStyle = "#f87171";
      ctx.beginPath();
      ctx.moveTo(9, 0);
      ctx.lineTo(-6, 6);
      ctx.lineTo(-6, -6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
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

  // The windup ring is the whole tell: it fills toward the real blast radius
  // so the player can read how long they have to leave it.
  drawWindup(boss) {
    const { ctx } = this;
    const radius = boss.type.secondaryAttack.radius;
    const progress = boss.windupProgress();

    ctx.save();
    ctx.strokeStyle = "rgba(248, 113, 113, 0.55)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(248, 113, 113, 0.18)";
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, radius * progress, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawDetonationFlash({ x, y, radius, timer }) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = Math.max(0, timer / 0.25) * 0.5;
    ctx.fillStyle = "#fca5a5";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawZombie(zombie) {
    const { ctx } = this;

    if (zombie.isBossEntity && zombie.isWindingUp()) this.drawWindup(zombie);

    ctx.fillStyle = zombie.type.color;
    ctx.beginPath();
    ctx.arc(zombie.x, zombie.y, zombie.radius, 0, Math.PI * 2);
    ctx.fill();

    if (zombie.isBossEntity) {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    if (zombie.effects.slow) {
      ctx.strokeStyle = "#67e8f9";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (zombie.effects.dot) {
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(zombie.x, zombie.y, zombie.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (zombie.hp < zombie.maxHp) {
      this.drawHpBar(zombie.x, zombie.y - zombie.radius - 9, zombie.radius * 2, zombie.hp, zombie.maxHp, zombie.type.color);
    }
  }

  drawProjectile(projectile) {
    const { ctx } = this;
    ctx.fillStyle = projectile.color;
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

  drawEndScreen(title, color) {
    const { ctx, canvas } = this;
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.font = "48px sans-serif";
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "20px sans-serif";
    ctx.fillText("Press R to restart", canvas.width / 2, canvas.height / 2 + 30);
    ctx.restore();
  }
}
