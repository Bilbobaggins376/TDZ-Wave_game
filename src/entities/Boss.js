import { Zombie } from "./Zombie.js";
import { hasLineOfSight } from "../systems/LineOfSight.js";

export class Boss extends Zombie {
  constructor(type, x, y, wave) {
    super(type, x, y, wave);
    this.isBossEntity = true;

    this.attackCooldown = type.secondaryAttack.cooldownMs;
    this.windupRemaining = 0;
    this.windupTotal = 0;

    this.leapCooldown = type.leapCooldownMs ?? 0;
    this.msSinceDamaged = 0;
    this.addSpawnCooldown = type.addSpawnIntervalMs ?? 0;

    this.phaseIndex = -1;
    this.phaseLabel = null;
  }

  // Wave 25 swaps mechanic as HP drops; every other boss has exactly one.
  activeMechanic() {
    if (this.type.mechanic !== "phases") return this.type.mechanic;
    const phase = this.currentPhase();
    return phase ? phase.mechanic : "slam";
  }

  currentPhase() {
    if (!this.type.phases) return null;
    const fraction = this.hp / this.maxHp;
    return this.type.phases.find((p) => fraction > p.above) ?? this.type.phases[this.type.phases.length - 1];
  }

  updatePhase(onPhaseChange) {
    if (!this.type.phases) return;
    const index = this.type.phases.indexOf(this.currentPhase());
    if (index === this.phaseIndex) return;
    this.phaseIndex = index;
    this.phaseLabel = this.type.phases[index].label;
    onPhaseChange?.(this.phaseLabel);
  }

  isWindingUp() {
    return this.windupRemaining > 0;
  }

  windupProgress() {
    if (this.windupTotal <= 0) return 0;
    return 1 - this.windupRemaining / this.windupTotal;
  }

  canSee(player, turrets) {
    return hasLineOfSight(this, player, turrets);
  }

  inAttackRange(player) {
    return Math.hypot(player.x - this.x, player.y - this.y) <= this.type.secondaryAttack.radius;
  }

  update(dt, world, hooks = {}) {
    const ms = dt * 1000;
    const { player, turrets } = world;

    this.updatePhase(hooks.onPhaseChange);
    this.msSinceDamaged += ms;

    if (this.activeMechanic() === "regen") this.regenerate(dt);
    if (this.activeMechanic() === "leap") this.updateLeap(ms, world);
    if (this.type.mechanic === "phases") this.updateAdds(ms, hooks.onSpawnAdds);

    this.updateSecondaryAttack(ms, player, turrets, hooks.onDetonate);

    // A boss stops moving while winding up, so the ring stays a readable
    // fixed circle the player can step out of.
    if (this.isWindingUp()) {
      this.updateEffects(dt);
      this.target = this.pickTarget(world);
      if (this.contactCooldown > 0) this.contactCooldown -= ms;
      return;
    }

    super.update(dt, world);
  }

  regenerate(dt) {
    if (this.msSinceDamaged < this.type.regenDelayMs) return;
    this.hp = Math.min(this.maxHp, this.hp + this.type.regenPerSecond * dt);
  }

  updateLeap(ms, world) {
    this.leapCooldown -= ms;
    if (this.leapCooldown > 0 || this.isWindingUp()) return;

    const target = this.pickTarget(world);
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < this.type.leapMinDistance) return;

    // Land just short of the target rather than on top of it.
    const landing = Math.max(0, dist - (target.radius + this.radius + 6));
    this.x += (dx / dist) * landing;
    this.y += (dy / dist) * landing;
    this.leapCooldown = this.type.leapCooldownMs;
  }

  updateAdds(ms, onSpawnAdds) {
    if (!onSpawnAdds) return;
    this.addSpawnCooldown -= ms;
    if (this.addSpawnCooldown > 0) return;
    this.addSpawnCooldown = this.type.addSpawnIntervalMs;
    onSpawnAdds(this.type.addsPerSpawn);
  }

  updateSecondaryAttack(ms, player, turrets, onDetonate) {
    if (this.isWindingUp()) {
      this.windupRemaining -= ms;
      if (this.windupRemaining <= 0) {
        this.windupRemaining = 0;
        onDetonate?.(this);
      }
      return;
    }

    this.attackCooldown -= ms;
    if (this.attackCooldown > 0) return;
    if (player.hp <= 0) return;

    // §8: proximity AND line of sight, both checked before the windup starts.
    if (!this.inAttackRange(player)) return;
    if (!this.canSee(player, turrets)) return;

    this.windupTotal = this.type.secondaryAttack.windupMs;
    this.windupRemaining = this.windupTotal;
    this.attackCooldown = this.type.secondaryAttack.cooldownMs;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.msSinceDamaged = 0;
  }
}
