// The `automatic` flag drives §3's firing rule: automatics repeat while the
// button is held, everything else is one shot per click.
export const WEAPONS = {
  sidearm: {
    id: "sidearm",
    label: "Sidearm",
    cost: 0,
    damage: 12,
    fireRate: 6,
    automatic: true,
    projectileSpeed: 480,
    pellets: 1,
    spread: 0,
  },
  shotgun: {
    id: "shotgun",
    label: "Shotgun",
    cost: 150,
    damage: 8,
    fireRate: 1.2,
    automatic: false,
    projectileSpeed: 430,
    pellets: 6,
    spread: 0.42,
  },
  rifle: {
    id: "rifle",
    label: "Rifle",
    cost: 260,
    damage: 32,
    fireRate: 2.4,
    automatic: true,
    projectileSpeed: 640,
    pellets: 1,
    spread: 0,
  },
};

export const STARTING_WEAPON_ID = "sidearm";
