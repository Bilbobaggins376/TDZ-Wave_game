// Stats follow REQUIREMENTS.md §5.1: each type answers a specific enemy
// behavior, and none may be strictly better than an earlier unlock. Cannon's
// low single-target DPS is intentional — its splash multiplies against packs,
// which is what keeps Machine Gun from superseding it.
export const TURRET_TYPES = {
  cannon: {
    id: "cannon",
    label: "Cannon",
    unlockWave: 1,
    cost: 60,
    maxHp: 90,
    radius: 14,
    color: "#0ea5e9",
    range: 170,
    fireRate: 0.8,
    damage: 26,
    projectileSpeed: 380,
    effect: "splash",
    splashRadius: 58,
  },
  frost: {
    id: "frost",
    label: "Frost",
    unlockWave: 6,
    cost: 75,
    maxHp: 80,
    radius: 13,
    color: "#67e8f9",
    range: 180,
    fireRate: 1.5,
    damage: 6,
    projectileSpeed: 420,
    effect: "slow",
    slowFactor: 0.45,
    slowDurationMs: 1600,
  },
  flame: {
    id: "flame",
    label: "Flame",
    unlockWave: 11,
    cost: 90,
    maxHp: 85,
    radius: 13,
    color: "#f97316",
    range: 95,
    fireRate: 0,
    damage: 0,
    effect: "dot",
    dotDps: 20,
    dotDurationMs: 900,
  },
  machinegun: {
    id: "machinegun",
    label: "Machine Gun",
    unlockWave: 16,
    cost: 110,
    maxHp: 75,
    radius: 12,
    color: "#a3e635",
    range: 205,
    fireRate: 6,
    damage: 9,
    projectileSpeed: 520,
    effect: "none",
  },
};

export const DEFAULT_TURRET_CAP = 4;

export function turretsAvailableAtWave(wave) {
  return Object.values(TURRET_TYPES).filter((t) => wave >= t.unlockWave);
}

export function isUnlocked(type, wave) {
  return wave >= type.unlockWave;
}
