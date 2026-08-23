import { WEAPONS, STARTING_WEAPON_ID } from "../data/weapons.js";

export const BUILD_RADIUS = 200;

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.speed = 220;
    this.maxHp = 100;
    this.hp = this.maxHp;
    this.ownedWeaponIds = [STARTING_WEAPON_ID];
    this.weapon = WEAPONS[STARTING_WEAPON_ID];
    this.fireCooldown = 0;
    this.buildRadius = BUILD_RADIUS;
    this.buildMode = false;
    this.selectedTurretTypeId = "cannon";
    this.turretCap = 4;
  }

  canBuildAt(x, y) {
    return Math.hypot(x - this.x, y - this.y) <= this.buildRadius;
  }

  ownsWeapon(weaponId) {
    return this.ownedWeaponIds.includes(weaponId);
  }

  giveWeapon(weaponId) {
    if (!this.ownsWeapon(weaponId)) this.ownedWeaponIds.push(weaponId);
  }

  // §4: number keys map to owned weapons in purchase order.
  equipSlot(slot) {
    const id = this.ownedWeaponIds[slot - 1];
    if (!id) return false;
    this.weapon = WEAPONS[id];
    this.fireCooldown = 0;
    return true;
  }

  respawn(x, y) {
    this.x = x;
    this.y = y;
    this.hp = this.maxHp;
    this.buildMode = false;
  }
}
