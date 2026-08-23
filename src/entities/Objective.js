export class Objective {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 28;
    this.maxHp = 300;
    this.hp = this.maxHp;
    this.damageReduction = 0;
    this.isStructure = true;
  }
}
