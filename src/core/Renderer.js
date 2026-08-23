import {
  playerSprite,
  weaponSprite,
  zombieSprite,
  bossSprite,
  turretBaseSprite,
  turretBarrelSprite,
  objectiveSprite,
} from "../render/Sprites.js";

const THREAT_MARKER_DISTANCE = 240;

export class Renderer {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  // Sprites are authored facing +x, so every draw goes through here.
  drawRotated(sprite, x, y, angle, scale = 1) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.drawImage(sprite, (-sprite.width / 2) * scale, (-sprite.height / 2) * scale, sprite.width * scale, sprite.height * scale);
    ctx.restore();
  }

  render({ player, aimAngle, objective, zombies, projectiles, turrets, threatenedTurretIds, buildPreview, buildRadiusOwner, hoveredTurret, detonationFlash, gameOver, victory }) {
    const { ctx, canvas } = this;
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (buildRadiusOwner) this.drawBuildRadius(buildRadiusOwner);

    this.drawObjective(objective);
    for (const turret of turrets) {
      this.drawTurret(turret, threatenedTurretIds.has(turret.id), hoveredTurret?.id === turret.id);
    }
    for (const zombie of zombies) this.drawZombie(zombie);
    for (const projectile of projectiles) this.drawProjectile(projectile);
    this.drawPlayer(player, aimAngle ?? 0);

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
    ctx.globalAlpha = valid ? 0.6 : 0.35;
    const base = turretBaseSprite(type.id, type.color, type.radius);
    ctx.drawImage(base, x - base.width / 2, y - base.height / 2);
    const barrel = turretBarrelSprite(type.id, type.color);
    const scale = type.radius / 14;
    ctx.save();
    ctx.translate(x, y);
    ctx.drawImage(barrel, (-barrel.width / 2) * scale, (-barrel.height / 2) * scale, barrel.width * scale, barrel.height * scale);
    ctx.restore();

    if (!valid) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#7f1d1d";
      ctx.beginPath();
      ctx.arc(x, y, type.radius, 0, Math.PI * 2);
      ctx.fill();
    }

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

  drawTurret(turret, threatened, hovered) {
    const { ctx } = this;

    if (hovered) {
      ctx.save();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(turret.x, turret.y, turret.effectiveStats().range, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const base = turretBaseSprite(turret.type.id, turret.type.color, turret.radius);
    ctx.drawImage(base, turret.x - base.width / 2, turret.y - base.height / 2);

    // Flame is an aura emitter with no target, so its nozzle stays put.
    const barrelAngle = turret.type.effect === "dot" ? 0 : turret.aimAngle;
    const barrel = turretBarrelSprite(turret.type.id, turret.type.color);
    const scale = turret.radius / 14;
    this.drawRotated(barrel, turret.x, turret.y, barrelAngle, scale);

    if (hovered) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(turret.x, turret.y, turret.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (turret.level > 1) {
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3;
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      const label = String(turret.level);
      const ly = turret.y + turret.radius + 13;
      ctx.strokeText(label, turret.x, ly);
      ctx.fillText(label, turret.x, ly);
      ctx.textAlign = "left";
    }

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
    const sprite = objectiveSprite(objective.radius);
    this.ctx.drawImage(sprite, objective.x - sprite.width / 2, objective.y - sprite.height / 2);
    this.drawHpBar(objective.x, objective.y - objective.radius - 16, 64, objective.hp, objective.maxHp, "#3b82f6");
  }

  drawPlayer(player, aimAngle) {
    this.drawRotated(playerSprite(), player.x, player.y, aimAngle);

    // The gun is a separate sprite mounted forward-right of the body so the
    // equipped weapon is readable at a glance.
    const gun = weaponSprite(player.weapon.id);
    const { ctx } = this;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(aimAngle);
    ctx.drawImage(gun, 2, -gun.height / 2 + 7);
    ctx.restore();

    this.drawHpBar(player.x, player.y - player.radius - 14, 40, player.hp, player.maxHp, "#4ade80");
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

    const sprite = zombie.isBossEntity
      ? bossSprite(zombie.type.id, zombie.type.color, zombie.radius)
      : zombieSprite(zombie.type.id, zombie.type.color, zombie.radius);
    this.drawRotated(sprite, zombie.x, zombie.y, zombie.angle);

    if (zombie.isBossEntity) {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(zombie.x, zombie.y, zombie.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Status rings sit outside the sprite so they read against any silhouette.
    if (zombie.effects.slow) {
      ctx.strokeStyle = "#67e8f9";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(zombie.x, zombie.y, zombie.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (zombie.effects.dot) {
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(zombie.x, zombie.y, zombie.radius + 5, 0, Math.PI * 2);
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
