let nextId = 1;

export class Projectile {
  constructor(x, y, dirX, dirY, speed, damage, options = {}) {
    this.id = nextId++;
    this.x = x;
    this.y = y;
    this.vx = dirX * speed;
    this.vy = dirY * speed;
    this.radius = options.radius ?? 4;
    this.damage = damage;
    this.color = options.color ?? "#facc15";
    this.effect = options.effect ?? "none";
    this.splashRadius = options.splashRadius ?? 0;
    this.slowFactor = options.slowFactor ?? 0;
    this.slowDurationMs = options.slowDurationMs ?? 0;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}
