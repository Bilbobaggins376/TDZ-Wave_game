function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function touching(a, b) {
  return distance(a, b) < a.radius + b.radius;
}

function applyProjectileHit(projectile, zombie, zombies, deadZombieIds) {
  zombie.hp -= projectile.damage;

  if (projectile.effect === "slow") {
    zombie.applyEffect("slow", {
      strength: projectile.slowFactor,
      durationMs: projectile.slowDurationMs,
    });
  }

  if (projectile.effect === "splash") {
    for (const other of zombies) {
      if (other.id === zombie.id || deadZombieIds.has(other.id)) continue;
      if (distance(projectile, other) <= projectile.splashRadius) {
        other.hp -= projectile.damage * 0.5;
        if (other.hp <= 0) deadZombieIds.add(other.id);
      }
    }
  }

  if (zombie.hp <= 0) deadZombieIds.add(zombie.id);
}

export function resolveCollisions({ player, objective, zombies, projectiles, turrets = [] }) {
  const deadZombieIds = new Set();
  const deadProjectileIds = new Set();
  const deadTurretIds = new Set();

  for (const projectile of projectiles) {
    for (const zombie of zombies) {
      if (deadZombieIds.has(zombie.id) || deadProjectileIds.has(projectile.id)) continue;
      if (touching(projectile, zombie)) {
        applyProjectileHit(projectile, zombie, zombies, deadZombieIds);
        deadProjectileIds.add(projectile.id);
      }
    }
  }

  // Aura damage (Flame) is applied by the turret itself, so a zombie can die
  // from a damage-over-time tick with no projectile involved.
  for (const zombie of zombies) {
    if (zombie.hp <= 0) deadZombieIds.add(zombie.id);
  }

  for (const zombie of zombies) {
    if (deadZombieIds.has(zombie.id) || zombie.contactCooldown > 0) continue;

    // Its chosen target takes priority, but anything it physically runs into
    // still gets hit — §8: zombies damage the objective on contact whatever
    // their priority target is, and the player counts as blocking the path.
    const candidates = [zombie.target, objective, player];
    const hit = candidates.find((c) => c && c.hp > 0 && touching(zombie, c));
    if (!hit) continue;

    const reduction = hit.damageReduction ?? 0;
    hit.hp = Math.max(0, hit.hp - zombie.damageAgainst(hit) * (1 - reduction));
    zombie.contactCooldown = zombie.type.contactIntervalMs;
    if (hit.isTurret && hit.hp <= 0) deadTurretIds.add(hit.id);
  }

  return { deadZombieIds, deadProjectileIds, deadTurretIds };
}
