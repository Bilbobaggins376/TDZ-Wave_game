import { upgradeCost } from "../data/upgrades.js";
import { TURRET_TYPES } from "../data/turretTypes.js";

const NEUTRAL_TURRET_MODS = { damage: 1, range: 1, fireRate: 1 };

export class UpgradeSystem {
  constructor() {
    this.tiers = {};
    this.turretMods = {};
    for (const id of Object.keys(TURRET_TYPES)) {
      this.turretMods[id] = { ...NEUTRAL_TURRET_MODS };
    }
    this.weaponDamageMultiplier = 1;
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
        this.weaponDamageMultiplier *= 1.15;
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

    if (upgrade.category === "turret") {
      const mods = this.turretMods[upgrade.turretTypeId];
      const factor = { damage: 1.2, range: 1.12, fireRate: 1.18 }[upgrade.stat];
      mods[upgrade.stat] *= factor;
    }
  }

  modsFor(turretTypeId) {
    return this.turretMods[turretTypeId] ?? NEUTRAL_TURRET_MODS;
  }
}
