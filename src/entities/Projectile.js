let nextId = 1;

export class Projectile {
  constructor(x, y, dirX, dirY, speed, damage) {
    this.id = nextId++;
    this.x = x;
    this.y = y;
    this.vx = dirX * speed;
    this.vy = dirY * speed;
    this.radius = 4;
    this.damage = damage;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}
