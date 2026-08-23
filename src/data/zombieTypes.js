// structureDamage falls back to contactDamage when a type doesn't distinguish;
// only Breaker currently hits structures harder than it hits the player.
export const ZOMBIE_TYPES = {
  shambler: {
    id: "shambler",
    label: "Shambler",
    priorityTarget: "objective",
    introducedAtWave: 1,
    spawnWeight: 6,
    baseHp: 30,
    speed: 60,
    radius: 12,
    color: "#dc2626",
    contactDamage: 10,
    contactIntervalMs: 1000,
    currencyDrop: 5,
  },
  stalker: {
    id: "stalker",
    label: "Stalker",
    priorityTarget: "player",
    introducedAtWave: 7,
    spawnWeight: 3,
    baseHp: 18,
    speed: 115,
    radius: 10,
    color: "#c026d3",
    contactDamage: 8,
    contactIntervalMs: 700,
    aggroRange: 360,
    currencyDrop: 9,
  },
  breaker: {
    id: "breaker",
    label: "Breaker",
    priorityTarget: "turret",
    introducedAtWave: 12,
    spawnWeight: 2,
    baseHp: 65,
    speed: 45,
    radius: 16,
    color: "#ea580c",
    contactDamage: 12,
    structureDamage: 30,
    contactIntervalMs: 1200,
    currencyDrop: 14,
  },
};

export const HP_SCALING_PER_WAVE = 0.12;

export function scaledHp(type, wave) {
  return Math.round(type.baseHp * (1 + (wave - 1) * HP_SCALING_PER_WAVE));
}

export function typesAvailableAtWave(wave) {
  return Object.values(ZOMBIE_TYPES).filter((t) => wave >= t.introducedAtWave);
}
