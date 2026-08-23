// Shortest distance from point p to the segment ab.
function distanceToSegment(p, a, b) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lengthSq = abx * abx + aby * aby;
  if (lengthSq < 0.000001) return Math.hypot(p.x - a.x, p.y - a.y);

  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
}

// §8: placed turrets are the only thing that blocks a boss's line of sight,
// so turret placement doubles as cover. A blocker sitting on either endpoint
// doesn't count — otherwise a turret the boss is standing on would make it
// permanently unable to fire.
export function hasLineOfSight(from, to, blockers) {
  for (const blocker of blockers) {
    const atSource = Math.hypot(blocker.x - from.x, blocker.y - from.y) <= blocker.radius;
    const atTarget = Math.hypot(blocker.x - to.x, blocker.y - to.y) <= blocker.radius;
    if (atSource || atTarget) continue;

    if (distanceToSegment(blocker, from, to) <= blocker.radius) return false;
  }
  return true;
}
