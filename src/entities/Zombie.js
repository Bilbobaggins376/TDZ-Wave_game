import { scaledHp } from "../data/zombieTypes.js";

let nextId = 1;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export class Zombie {
  constructor(type, x, y, wave) {
    this.id = nextId++;
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = type.radius;
    this.speed = type.speed;
    this.maxHp = scaledHp(type, wave);
    this.hp = this.maxHp;
    this.contactCooldown = 0;
    this.target = null;
    this.effects = {};
  }

  // §5 stacking rule: one instance per effect category, strongest wins — a
  // second, weaker source must never shorten or replace a stronger one.
  applyEffect(kind, { strength, durationMs }) {
    const existing = this.effects[kind];
    if (existing && existing.strength > strength) return;
    this.effects[kind] = { strength, remainingMs: durationMs };
  }

  updateEffects(dt) {
    for (const [kind, effect] of Object.entries(this.effects)) {
      effect.remainingMs -= dt * 1000;
      if (effect.remainingMs <= 0) {
        delete this.effects[kind];
        continue;
      }
      if (kind === "dot") this.hp -= effect.strength * dt;
    }
  }

  currentSpeed() {
    const slow = this.effects.slow;
    return slow ? this.type.speed * (1 - slow.strength) : this.type.speed;
  }

  // Per-type priority target, always falling back to the objective when the
  // preferred target doesn't exist or is out of reach (REQUIREMENTS.md §8).
  pickTarget({ player, objective, turrets }) {
    if (this.type.priorityTarget === "player" && player.hp > 0) {
      if (distance(this, player) <= this.type.aggroRange) return player;
    }

    if (this.type.priorityTarget === "turret" && turrets.length > 0) {
      let nearest = turrets[0];
      let nearestDist = distance(this, nearest);
      for (const turret of turrets) {
        const d = distance(this, turret);
        if (d < nearestDist) {
          nearest = turret;
          nearestDist = d;
        }
      }
      return nearest;
    }

    return objective;
  }

  damageAgainst(target) {
    const isStructure = target !== undefined && target.isStructure === true;
    return isStructure ? this.type.structureDamage ?? this.type.contactDamage : this.type.contactDamage;
  }

  update(dt, world) {
    this.updateEffects(dt);
    this.target = this.pickTarget(world);

    const speed = this.currentSpeed();
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.001) {
      this.x += (dx / dist) * speed * dt;
      this.y += (dy / dist) * speed * dt;
    }

    if (this.contactCooldown > 0) this.contactCooldown -= dt * 1000;
  }
}
