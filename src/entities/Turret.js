let nextId = 1;

export class Turret {
  constructor(type, x, y) {
    this.id = nextId++;
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = type.radius;
    this.maxHp = type.maxHp;
    this.hp = this.maxHp;
    this.level = 1;
    this.fireCooldown = 0;
    this.isTurret = true;
    this.isStructure = true;
  }

  effectiveStats(mods) {
    return {
      damage: this.type.damage * mods.damage,
      range: this.type.range * mods.range,
      fireRate: this.type.fireRate * mods.fireRate,
      dotDps: (this.type.dotDps ?? 0) * mods.damage,
    };
  }

  nearestZombieInRange(zombies, range) {
    let nearest = null;
    let nearestDist = range;
    for (const zombie of zombies) {
      const d = Math.hypot(zombie.x - this.x, zombie.y - this.y);
      if (d <= nearestDist) {
        nearest = zombie;
        nearestDist = d;
      }
    }
    return nearest;
  }

  // Flame has no fire rate — it's a persistent aura applied straight to
  // everything in range, which is what punishes Breakers for camping on it.
  applyAura(zombies, stats) {
    for (const zombie of zombies) {
      const d = Math.hypot(zombie.x - this.x, zombie.y - this.y);
      if (d <= stats.range + zombie.radius) {
        zombie.applyEffect("dot", {
          strength: stats.dotDps,
          durationMs: this.type.dotDurationMs,
        });
      }
    }
  }

  update(dt, zombies, spawnProjectile, mods) {
    const stats = this.effectiveStats(mods);

    if (this.type.effect === "dot") {
      this.applyAura(zombies, stats);
      return;
    }

    this.fireCooldown -= dt;
    if (this.fireCooldown > 0) return;

    const target = this.nearestZombieInRange(zombies, stats.range);
    if (!target) return;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.001) return;

    spawnProjectile(this, dx / dist, dy / dist, stats.damage);
    this.fireCooldown = 1 / stats.fireRate;
  }
}
