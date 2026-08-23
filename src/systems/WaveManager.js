import { Zombie } from "../entities/Zombie.js";
import { Boss } from "../entities/Boss.js";
import { typesAvailableAtWave, bossForWave } from "../data/zombieTypes.js";

const SPAWN_INTERVAL = 0.5;

export const MAX_WAVE = 25;
export const BOSS_CADENCE = 5;

export class WaveManager {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.wave = 1;
    this.spawnTimer = 0;
    this.toSpawn = this.spawnCountForWave();
  }

  // §9: a boss wave replaces the normal spawn with a single boss.
  isBossWave() {
    return this.wave % BOSS_CADENCE === 0 && bossForWave(this.wave) !== null;
  }

  spawnCountForWave() {
    return this.isBossWave() ? 1 : 3 + this.wave * 2;
  }

  isFinalWave() {
    return this.wave >= MAX_WAVE;
  }

  // §9: a wave ends only once every entity it spawned is dead. Advancing is
  // the caller's decision — the shop sits between waves and is a hard pause.
  update(dt, aliveZombieCount) {
    if (this.toSpawn > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = SPAWN_INTERVAL;
        this.toSpawn -= 1;
        return { spawned: [this.makeZombie()], waveCleared: false };
      }
      return { spawned: [], waveCleared: false };
    }

    return { spawned: [], waveCleared: aliveZombieCount === 0 };
  }

  advanceWave() {
    this.wave += 1;
    this.spawnTimer = 0;
    this.toSpawn = this.spawnCountForWave();
  }

  pickType() {
    const available = typesAvailableAtWave(this.wave);
    const totalWeight = available.reduce((sum, t) => sum + t.spawnWeight, 0);
    let roll = Math.random() * totalWeight;
    for (const type of available) {
      roll -= type.spawnWeight;
      if (roll <= 0) return type;
    }
    return available[available.length - 1];
  }

  spawnPosition() {
    const edge = Math.floor(Math.random() * 4);
    if (edge === 0) return { x: Math.random() * this.canvasWidth, y: -20 };
    if (edge === 1) return { x: this.canvasWidth + 20, y: Math.random() * this.canvasHeight };
    if (edge === 2) return { x: Math.random() * this.canvasWidth, y: this.canvasHeight + 20 };
    return { x: -20, y: Math.random() * this.canvasHeight };
  }

  makeZombie() {
    const { x, y } = this.spawnPosition();
    if (this.isBossWave()) return new Boss(bossForWave(this.wave), x, y, this.wave);
    return new Zombie(this.pickType(), x, y, this.wave);
  }

  // Adds summoned mid-fight by the wave-25 boss, not part of the wave's own
  // spawn budget.
  makeAdds(count) {
    const adds = [];
    for (let i = 0; i < count; i++) {
      const { x, y } = this.spawnPosition();
      adds.push(new Zombie(this.pickType(), x, y, this.wave));
    }
    return adds;
  }
}
