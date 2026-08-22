export const STARTING_WEAPON = {
  damage: 12,
  fireRate: 6,
  automatic: true,
  projectileSpeed: 480,
};

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.speed = 220;
    this.maxHp = 100;
    this.hp = this.maxHp;
    this.weapon = STARTING_WEAPON;
    this.fireCooldown = 0;
  }

  respawn(x, y) {
    this.x = x;
    this.y = y;
    this.hp = this.maxHp;
  }
}
