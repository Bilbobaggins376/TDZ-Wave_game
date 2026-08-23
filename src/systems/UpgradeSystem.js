import { upgradeCost } from "../data/upgrades.js";
import { WEAPONS } from "../data/weapons.js";

const NEUTRAL_WEAPON_MODS = { damage: 1, fireRate: 1, reload: 1, magazine: 1 };

export class UpgradeSystem {
  constructor() {
    this.tiers = {};
    this.weaponMods = {};
    for (const id of Object.keys(WEAPONS)) {
      this.weaponMods[id] = { ...NEUTRAL_WEAPON_MODS };
    }
    this.globalWeaponDamage = 1;
  }

  tierOf(upgradeId) {
    return this.tiers[upgradeId] ?? 0;
  }

  isMaxed(upgrade) {
    return this.tierOf(upgrade.id) >= upgrade.maxTier;
  }

  costOf(upgrade) {
    return upgradeCost(upgrade, this.tierOf(upgrade.id));
  }

  modsFor(weaponId) {
    return this.weaponMods[weaponId] ?? NEUTRAL_WEAPON_MODS;
  }

  damageFor(weaponId) {
    return WEAPONS[weaponId].damage * this.modsFor(weaponId).damage * this.globalWeaponDamage;
  }

  fireRateFor(weaponId) {
    return WEAPONS[weaponId].fireRate * this.modsFor(weaponId).fireRate;
  }

  reloadMsFor(weaponId) {
    return WEAPONS[weaponId].reloadMs * this.modsFor(weaponId).reload;
  }

  magazineFor(weaponId) {
    return Math.round(WEAPONS[weaponId].magazine * this.modsFor(weaponId).magazine);
  }

  // Returns null on success, or a string reason the purchase was refused.
  purchase(upgrade, { economy, player, objective }) {
    if (this.isMaxed(upgrade)) return "Already maxed";

    const cost = this.costOf(upgrade);
    if (!economy.canAfford(cost)) return `Need $${cost}`;
    if (upgrade.id === "objective_repair" && objective.hp >= objective.maxHp) {
      return "Objective at full HP";
    }

    economy.spend(cost);
    this.tiers[upgrade.id] = this.tierOf(upgrade.id) + 1;
    this.applyEffect(upgrade, { player, objective });
    return null;
  }

  applyEffect(upgrade, { player, objective }) {
    switch (upgrade.id) {
      case "player_speed":
        player.speed *= 1.15;
        return;
      case "player_maxhp":
        player.maxHp += 25;
        player.hp += 25;
        return;
      case "player_damage":
        this.globalWeaponDamage *= 1.15;
        return;
      case "turret_cap":
        player.turretCap += 1;
        return;
      case "objective_maxhp":
        objective.maxHp += 75;
        objective.hp += 75;
        return;
      case "objective_repair":
        objective.hp = Math.min(objective.maxHp, objective.hp + 100);
        return;
      case "objective_armor":
        objective.damageReduction = Math.min(0.9, objective.damageReduction + 0.1);
        return;
      default:
        break;
    }

    if (upgrade.category === "weapon_upgrade") {
      const mods = this.weaponMods[upgrade.weaponId];
      const factor = { damage: 1.18, fireRate: 1.15, reload: 0.85, magazine: 1.3 }[upgrade.stat];
      mods[upgrade.stat] *= factor;

      // A bigger magazine should be usable immediately rather than only after
      // the next reload.
      if (upgrade.stat === "magazine") {
        player.ammo[upgrade.weaponId] = this.magazineFor(upgrade.weaponId);
      }
    }
  }
}
