function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function resolveCollisions({ player, objective, zombies, projectiles }) {
  const deadZombieIds = new Set();
  const deadProjectileIds = new Set();

  for (const projectile of projectiles) {
    for (const zombie of zombies) {
      if (deadZombieIds.has(zombie.id) || deadProjectileIds.has(projectile.id)) continue;
      if (distance(projectile, zombie) < projectile.radius + zombie.radius) {
        zombie.hp -= projectile.damage;
        deadProjectileIds.add(projectile.id);
        if (zombie.hp <= 0) deadZombieIds.add(zombie.id);
      }
    }
  }

  for (const zombie of zombies) {
    if (deadZombieIds.has(zombie.id)) continue;

    if (zombie.contactCooldown <= 0 && distance(zombie, objective) < zombie.radius + objective.radius) {
      objective.hp = Math.max(0, objective.hp - zombie.type.contactDamage);
      zombie.contactCooldown = zombie.type.contactIntervalMs;
    }

    if (zombie.contactCooldown <= 0 && distance(zombie, player) < zombie.radius + player.radius) {
      player.hp = Math.max(0, player.hp - zombie.type.contactDamage);
      zombie.contactCooldown = zombie.type.contactIntervalMs;
    }
  }

  return { deadZombieIds, deadProjectileIds };
}
