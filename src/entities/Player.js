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

    // Ammo is tracked per weapon so switching away and back doesn't refill.
    this.ammo = { [STARTING_WEAPON_ID]: WEAPONS[STARTING_WEAPON_ID].magazine };
    this.reloadRemaining = 0;

    this.buildRadius = BUILD_RADIUS;
    this.buildMode = false;
    this.selectedTurretTypeId = "cannon";
    this.turretCap = 4;
  }

  currentAmmo() {
    return this.ammo[this.weapon.id] ?? 0;
  }

  magazineFor(weaponId, upgrades) {
    return upgrades ? upgrades.magazineFor(weaponId) : WEAPONS[weaponId].magazine;
  }

  isReloading() {
    return this.reloadRemaining > 0;
  }

  startReload(upgrades) {
    if (this.isReloading()) return false;
    if (this.currentAmmo() >= this.magazineFor(this.weapon.id, upgrades)) return false;
    this.reloadRemaining = upgrades ? upgrades.reloadMsFor(this.weapon.id) : this.weapon.reloadMs;
    return true;
  }

  updateReload(dt, upgrades) {
    if (!this.isReloading()) return;
    this.reloadRemaining -= dt * 1000;
    if (this.reloadRemaining > 0) return;
    this.reloadRemaining = 0;
    this.ammo[this.weapon.id] = this.magazineFor(this.weapon.id, upgrades);
  }

  consumeAmmo() {
    this.ammo[this.weapon.id] = Math.max(0, this.currentAmmo() - 1);
  }

  ownsWeapon(weaponId) {
    return this.ownedWeaponIds.includes(weaponId);
  }

  giveWeapon(weaponId) {
    if (this.ownsWeapon(weaponId)) return;
    this.ownedWeaponIds.push(weaponId);
    this.ammo[weaponId] = WEAPONS[weaponId].magazine;
  }

  // §4: number keys map to owned weapons in purchase order. Switching cancels
  // an in-progress reload rather than letting it finish on the wrong gun.
  equipSlot(slot) {
    const id = this.ownedWeaponIds[slot - 1];
    if (!id || id === this.weapon.id) return false;
    this.weapon = WEAPONS[id];
    this.fireCooldown = 0;
    this.reloadRemaining = 0;
    return true;
  }

  canBuildAt(x, y) {
    return Math.hypot(x - this.x, y - this.y) <= this.buildRadius;
  }

  respawn(x, y) {
    this.x = x;
    this.y = y;
    this.hp = this.maxHp;
    this.buildMode = false;
    this.reloadRemaining = 0;
  }
}
