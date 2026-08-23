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
    this.aimAngle = -Math.PI / 2;
    this.isTurret = true;
    this.isStructure = true;
  }

  // Turrets are upgraded per instance in Build Mode, so a well-placed turret
  // can be invested in rather than buffing every turret of that type at once.
  static levelMultipliers(level) {
    const steps = level - 1;
    return {
      damage: Math.pow(1.25, steps),
      range: Math.pow(1.08, steps),
      fireRate: Math.pow(1.12, steps),
      maxHp: Math.pow(1.2, steps),
    };
  }

  static upgradeCost(type, level) {
    return Math.round(type.cost * 0.6 * Math.pow(1.55, level - 1));
  }

  nextUpgradeCost() {
    return Turret.upgradeCost(this.type, this.level);
  }

  upgrade() {
    const before = Turret.levelMultipliers(this.level).maxHp;
    this.level += 1;
    const after = Turret.levelMultipliers(this.level).maxHp;

    const healthRatio = this.hp / this.maxHp;
    this.maxHp = Math.round(this.type.maxHp * after);
    this.hp = Math.max(this.hp, Math.round(this.maxHp * healthRatio));
    return after / before;
  }

  effectiveStats() {
    const mult = Turret.levelMultipliers(this.level);
    return {
      damage: this.type.damage * mult.damage,
      range: this.type.range * mult.range,
      fireRate: this.type.fireRate * mult.fireRate,
      dotDps: (this.type.dotDps ?? 0) * mult.damage,
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

  update(dt, zombies, spawnProjectile) {
    const stats = this.effectiveStats();

    if (this.type.effect === "dot") {
      this.applyAura(zombies, stats);
      return;
    }

    // Track the target every frame, not just when firing, so the barrel keeps
    // following a zombie between shots.
    const target = this.nearestZombieInRange(zombies, stats.range);
    if (target) this.aimAngle = Math.atan2(target.y - this.y, target.x - this.x);

    this.fireCooldown -= dt;
    if (this.fireCooldown > 0 || !target) return;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.001) return;

    spawnProjectile(this, dx / dist, dy / dist, stats.damage);
    this.fireCooldown = 1 / stats.fireRate;
  }
}
