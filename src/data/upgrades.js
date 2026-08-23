import { WEAPONS } from "./weapons.js";

// Cost grows per tier so later ranks compete with buying a new weapon rather
// than being an automatic purchase.
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
    label: "All Weapon Damage",
    detail: "+15% damage, every gun",
    baseCost: 110,
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

// Per-gun upgrades, mirroring how turret levels work in Build Mode. Only
// weapons the player actually owns are offered.
function weaponUpgradesFor(weapon) {
  return [
    {
      id: `weapon_${weapon.id}_damage`,
      category: "weapon_upgrade",
      weaponId: weapon.id,
      stat: "damage",
      label: `${weapon.label} Damage`,
      detail: "+18% damage",
      baseCost: 90,
      maxTier: 4,
    },
    {
      id: `weapon_${weapon.id}_firerate`,
      category: "weapon_upgrade",
      weaponId: weapon.id,
      stat: "fireRate",
      label: `${weapon.label} Fire Rate`,
      detail: "+15% fire rate",
      baseCost: 100,
      maxTier: 3,
    },
    {
      id: `weapon_${weapon.id}_reload`,
      category: "weapon_upgrade",
      weaponId: weapon.id,
      stat: "reload",
      label: `${weapon.label} Reload`,
      detail: "-15% reload time",
      baseCost: 80,
      maxTier: 3,
    },
    {
      id: `weapon_${weapon.id}_magazine`,
      category: "weapon_upgrade",
      weaponId: weapon.id,
      stat: "magazine",
      label: `${weapon.label} Magazine`,
      detail: "+30% magazine",
      baseCost: 85,
      maxTier: 3,
    },
  ];
}

export const ALL_UPGRADES = [
  ...PLAYER_UPGRADES,
  ...OBJECTIVE_UPGRADES,
  ...Object.values(WEAPONS).flatMap(weaponUpgradesFor),
];

export function upgradeCost(upgrade, currentTier) {
  return upgrade.flatCost ? upgrade.baseCost : tieredCost(upgrade.baseCost, currentTier);
}

export function upgradesAvailableTo(player) {
  return ALL_UPGRADES.filter((u) => {
    if (u.category !== "weapon_upgrade") return true;
    return player.ownsWeapon(u.weaponId);
  });
}
