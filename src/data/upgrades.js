import { TURRET_TYPES } from "./turretTypes.js";

// Cost grows per tier so later ranks compete with buying a new weapon or
// another turret rather than being an automatic purchase.
function tieredCost(base, tier) {
  return Math.round(base * Math.pow(1.6, tier));
}

const PLAYER_UPGRADES = [
  {
    id: "player_speed",
    category: "player",
    label: "Move Speed",
    detail: "+15% movement",
    baseCost: 70,
    maxTier: 4,
  },
  {
    id: "player_maxhp",
    category: "player",
    label: "Max Health",
    detail: "+25 max HP, healed",
    baseCost: 80,
    maxTier: 4,
  },
  {
    id: "player_damage",
    category: "player",
    label: "Weapon Damage",
    detail: "+15% weapon damage",
    baseCost: 100,
    maxTier: 5,
  },
  {
    id: "turret_cap",
    category: "player",
    label: "Turret Capacity",
    detail: "+1 placeable turret",
    baseCost: 130,
    maxTier: 4,
  },
];

const OBJECTIVE_UPGRADES = [
  {
    id: "objective_maxhp",
    category: "objective",
    label: "Reinforce",
    detail: "+75 max HP, healed",
    baseCost: 90,
    maxTier: 4,
  },
  {
    id: "objective_repair",
    category: "objective",
    label: "Repair",
    detail: "Restore 100 HP now",
    baseCost: 60,
    maxTier: Infinity,
    flatCost: true,
  },
  {
    id: "objective_armor",
    category: "objective",
    label: "Armor Plating",
    detail: "-10% damage taken",
    baseCost: 120,
    maxTier: 3,
  },
];

// §6: turret upgrades are per-turret-type, so each unlocked type contributes
// its own set rather than one global buff.
function turretUpgradesFor(type) {
  return [
    {
      id: `turret_${type.id}_damage`,
      category: "turret",
      turretTypeId: type.id,
      stat: "damage",
      label: `${type.label} Damage`,
      detail: "+20% damage",
      baseCost: 80,
      maxTier: 4,
    },
    {
      id: `turret_${type.id}_range`,
      category: "turret",
      turretTypeId: type.id,
      stat: "range",
      label: `${type.label} Range`,
      detail: "+12% range",
      baseCost: 70,
      maxTier: 3,
    },
    {
      id: `turret_${type.id}_firerate`,
      category: "turret",
      turretTypeId: type.id,
      stat: "fireRate",
      label: `${type.label} Fire Rate`,
      detail: "+18% fire rate",
      baseCost: 90,
      maxTier: 3,
    },
  ];
}

export const ALL_UPGRADES = [
  ...PLAYER_UPGRADES,
  ...OBJECTIVE_UPGRADES,
  ...Object.values(TURRET_TYPES).flatMap(turretUpgradesFor),
];

export function upgradeCost(upgrade, currentTier) {
  return upgrade.flatCost ? upgrade.baseCost : tieredCost(upgrade.baseCost, currentTier);
}

// Turret upgrades only appear once their type is unlocked, matching the
// turret picker in Build Mode.
export function upgradesAvailableAtWave(wave) {
  return ALL_UPGRADES.filter((u) => {
    if (u.category !== "turret") return true;
    return wave >= TURRET_TYPES[u.turretTypeId].unlockWave;
  });
}
