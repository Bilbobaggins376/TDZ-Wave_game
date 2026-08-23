let nextId = 1;

export class Projectile {
  constructor(x, y, dirX, dirY, speed, damage, options = {}) {
    this.id = nextId++;
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = dirX * speed;
    this.vy = dirY * speed;
    this.radius = options.radius ?? 4;
    this.damage = damage;
    this.color = options.color ?? "#facc15";
    this.effect = options.effect ?? "none";
    this.pierce = options.pierce ?? 0;
    this.hitZombieIds = new Set();
    this.splashRadius = options.splashRadius ?? 0;
    this.slowFactor = options.slowFactor ?? 0;
    this.slowDurationMs = options.slowDurationMs ?? 0;
  }

  update(dt) {
    // Previous position is kept so collision can sweep the travelled segment.
    // Endpoint-only tests miss a target that falls between two sampled
    // positions, which needs (speed*dt)/2 > hit radius. The sniper at 1100px/s
    // crosses that line at 30fps and below (~41% miss rate at the 0.05 dt
    // clamp), so slow frames would silently eat shots without this.
    this.prevX = this.x;
    this.prevY = this.y;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}
