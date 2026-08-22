let nextId = 1;

export class Zombie {
  constructor(type, x, y, wave) {
    this.id = nextId++;
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.speed = type.speed;
    this.hp = type.baseHp + (wave - 1) * 6;
    this.contactCooldown = 0;
  }

  update(dt, target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.001) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }
    if (this.contactCooldown > 0) this.contactCooldown -= dt * 1000;
  }
}
