// `automatic` drives §3's firing rule: automatics repeat while held, the rest
// are one shot per click. Every weapon has a magazine and reloads when empty
// (or on demand with R).
export const WEAPONS = {
  pistol: {
    id: "pistol",
    label: "Pistol",
    cost: 0,
    damage: 12,
    fireRate: 6,
    automatic: true,
    projectileSpeed: 480,
    pellets: 1,
    spread: 0,
    pierce: 0,
    magazine: 15,
    reloadMs: 1100,
  },
  shotgun: {
    id: "shotgun",
    label: "Shotgun",
    cost: 150,
    damage: 9,
    fireRate: 1.1,
    automatic: false,
    projectileSpeed: 420,
    pellets: 8,
    spread: 0.5,
    pierce: 0,
    magazine: 6,
    reloadMs: 2200,
  },
  ar: {
    id: "ar",
    label: "Assault Rifle",
    cost: 300,
    damage: 22,
    fireRate: 8,
    automatic: true,
    projectileSpeed: 620,
    pellets: 1,
    spread: 0.045,
    pierce: 0,
    magazine: 30,
    reloadMs: 2000,
  },
  sniper: {
    id: "sniper",
    label: "Sniper",
    cost: 420,
    damage: 145,
    fireRate: 0.8,
    automatic: false,
    projectileSpeed: 1100,
    pellets: 1,
    spread: 0,
    // Punches through a line of zombies, which is what makes the low fire
    // rate worth it against a packed approach.
    pierce: 3,
    magazine: 5,
    reloadMs: 2600,
  },
  minigun: {
    id: "minigun",
    label: "Minigun",
    cost: 650,
    damage: 13,
    fireRate: 18,
    automatic: true,
    projectileSpeed: 560,
    pellets: 1,
    spread: 0.13,
    pierce: 0,
    magazine: 150,
    reloadMs: 4500,
  },
};

export const STARTING_WEAPON_ID = "pistol";

export function purchasableWeapons() {
  return Object.values(WEAPONS).filter((w) => w.cost > 0);
}
