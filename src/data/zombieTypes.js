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

// One boss per boss wave (§9.1). Every boss shares turret-priority movement
// and the windup/line-of-sight area attack; `mechanic` is its signature.
// Stats here are a first pass and expected to move with playtesting (§15).
export const BOSS_TYPES = {
  boss5: {
    id: "boss5",
    label: "The Lurcher",
    priorityTarget: "turret",
    isBoss: true,
    bossWave: 5,
    mechanic: "slam",
    baseHp: 420,
    speed: 40,
    radius: 26,
    color: "#a21caf",
    contactDamage: 18,
    structureDamage: 34,
    contactIntervalMs: 1100,
    currencyDrop: 120,
    secondaryAttack: { radius: 125, damage: 16, cooldownMs: 3600, windupMs: 950 },
  },
  boss10: {
    id: "boss10",
    label: "The Detonator",
    priorityTarget: "turret",
    isBoss: true,
    bossWave: 10,
    mechanic: "chain",
    baseHp: 760,
    speed: 44,
    radius: 28,
    color: "#b91c1c",
    contactDamage: 22,
    structureDamage: 42,
    contactIntervalMs: 1000,
    currencyDrop: 190,
    secondaryAttack: { radius: 150, damage: 22, cooldownMs: 3300, windupMs: 850 },
    chainRadius: 95,
    chainDamage: 55,
  },
  boss15: {
    id: "boss15",
    label: "The Vaulter",
    priorityTarget: "turret",
    isBoss: true,
    bossWave: 15,
    mechanic: "leap",
    baseHp: 1050,
    speed: 92,
    radius: 27,
    color: "#7c3aed",
    contactDamage: 26,
    structureDamage: 46,
    contactIntervalMs: 950,
    currencyDrop: 260,
    secondaryAttack: { radius: 135, damage: 26, cooldownMs: 3000, windupMs: 750 },
    leapCooldownMs: 4200,
    leapMinDistance: 220,
  },
  boss20: {
    id: "boss20",
    label: "The Glutton",
    priorityTarget: "turret",
    isBoss: true,
    bossWave: 20,
    mechanic: "regen",
    baseHp: 1800,
    speed: 46,
    radius: 30,
    color: "#065f46",
    contactDamage: 30,
    structureDamage: 52,
    contactIntervalMs: 950,
    currencyDrop: 340,
    secondaryAttack: { radius: 145, damage: 30, cooldownMs: 2900, windupMs: 750 },
    regenDelayMs: 1800,
    regenPerSecond: 38,
  },
  boss25: {
    id: "boss25",
    label: "The Culmination",
    priorityTarget: "turret",
    isBoss: true,
    bossWave: 25,
    mechanic: "phases",
    baseHp: 3000,
    speed: 56,
    radius: 32,
    color: "#f59e0b",
    contactDamage: 34,
    structureDamage: 58,
    contactIntervalMs: 900,
    currencyDrop: 500,
    secondaryAttack: { radius: 160, damage: 32, cooldownMs: 2700, windupMs: 700 },
    chainRadius: 95,
    chainDamage: 55,
    leapCooldownMs: 4200,
    leapMinDistance: 220,
    regenDelayMs: 1800,
    regenPerSecond: 38,
    // Phase boundaries as fractions of max HP, highest first.
    phases: [
      { above: 0.75, mechanic: "slam", label: "Phase I — Slam" },
      { above: 0.5, mechanic: "chain", label: "Phase II — Detonation" },
      { above: 0.25, mechanic: "leap", label: "Phase III — Vault" },
      { above: 0, mechanic: "regen", label: "Phase IV — Glut" },
    ],
    addSpawnIntervalMs: 6000,
    addsPerSpawn: 3,
  },
};

export function bossForWave(wave) {
  return Object.values(BOSS_TYPES).find((b) => b.bossWave === wave) ?? null;
}

export const HP_SCALING_PER_WAVE = 0.12;

// Bosses are tuned per boss wave already, so the generic per-wave ramp would
// compound on top of numbers that are meant to be absolute.
export function scaledHp(type, wave) {
  if (type.isBoss) return type.baseHp;
  return Math.round(type.baseHp * (1 + (wave - 1) * HP_SCALING_PER_WAVE));
}

export function typesAvailableAtWave(wave) {
  return Object.values(ZOMBIE_TYPES).filter((t) => wave >= t.introducedAtWave);
}
