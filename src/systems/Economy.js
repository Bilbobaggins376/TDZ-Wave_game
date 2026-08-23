export const STARTING_CURRENCY = 120;

export class Economy {
  constructor(starting = STARTING_CURRENCY) {
    this.currency = starting;
  }

  canAfford(cost) {
    return this.currency >= cost;
  }

  spend(cost) {
    if (!this.canAfford(cost)) return false;
    this.currency -= cost;
    return true;
  }

  award(amount) {
    this.currency += amount;
  }

  // §3/§7: the respawn penalty scales with the wave reached, and can't push
  // the balance negative.
  applyDeathPenalty(wave) {
    const penalty = 10 * wave;
    const taken = Math.min(penalty, this.currency);
    this.currency -= taken;
    return taken;
  }
}
