import { Zombie } from "../entities/Zombie.js";
import { ZOMBIE_TYPES } from "../data/zombieTypes.js";

const SPAWN_INTERVAL = 0.5;
const INTERMISSION = 1.5;

export class WaveManager {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.wave = 1;
    this.spawnTimer = 0;
    this.intermissionTimer = 0;
    this.toSpawn = 3 + this.wave * 2;
  }

  update(dt, aliveZombieCount) {
    if (this.toSpawn > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = SPAWN_INTERVAL;
        this.toSpawn -= 1;
        return [this.makeZombie()];
      }
      return [];
    }

    if (aliveZombieCount === 0) {
      this.intermissionTimer += dt;
      if (this.intermissionTimer >= INTERMISSION) {
        this.intermissionTimer = 0;
        this.wave += 1;
        this.toSpawn = 3 + this.wave * 2;
      }
    }
    return [];
  }

  makeZombie() {
    const edge = Math.floor(Math.random() * 4);
    let x;
    let y;
    if (edge === 0) {
      x = Math.random() * this.canvasWidth;
      y = -20;
    } else if (edge === 1) {
      x = this.canvasWidth + 20;
      y = Math.random() * this.canvasHeight;
    } else if (edge === 2) {
      x = Math.random() * this.canvasWidth;
      y = this.canvasHeight + 20;
    } else {
      x = -20;
      y = Math.random() * this.canvasHeight;
    }
    return new Zombie(ZOMBIE_TYPES.shambler, x, y, this.wave);
  }
}
