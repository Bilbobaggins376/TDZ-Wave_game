// Sprites are drawn once into offscreen canvases at startup and blitted each
// frame. Keeping them procedural rather than loading image files means the
// itch.io build stays a self-contained bundle with no asset loading step.

const cache = new Map();

function makeSprite(key, width, height, draw) {
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  const ctx = canvas.getContext("2d");
  ctx.translate(width / 2, height / 2);
  draw(ctx, width, height);
  cache.set(key, canvas);
  return canvas;
}

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) * amount);
  const g = clamp(((n >> 8) & 255) * amount);
  const b = clamp((n & 255) * amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function limb(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* ---------------------------------------------------------------- player */

export function playerSprite() {
  return makeSprite("player", 44, 44, (ctx) => {
    // Faces +x; the renderer rotates the whole sprite toward the cursor.
    limb(ctx, -3, -11, 6, 5, "#166534");
    limb(ctx, -3, 11, 6, 5, "#166534");

    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.ellipse(3, 0, 7, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#bbf7d0";
    ctx.beginPath();
    ctx.arc(6, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ----------------------------------------------------------------- guns */

const GUN_DRAWERS = {
  pistol: (ctx) => {
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, -2, 13, 4);
    ctx.fillRect(1, 1, 5, 6);
    ctx.fillStyle = "#64748b";
    ctx.fillRect(9, -1.5, 4, 3);
  },
  shotgun: (ctx) => {
    ctx.fillStyle = "#422006";
    ctx.fillRect(-6, -2.5, 10, 5);
    ctx.fillStyle = "#44403c";
    ctx.fillRect(3, -3.5, 20, 3);
    ctx.fillRect(3, 0.5, 20, 3);
    ctx.fillStyle = "#78716c";
    ctx.fillRect(20, -3.5, 3, 7);
  },
  ar: (ctx) => {
    ctx.fillStyle = "#292524";
    ctx.fillRect(-5, -2.5, 16, 5);
    ctx.fillStyle = "#44403c";
    ctx.fillRect(10, -1.8, 13, 3.6);
    ctx.fillStyle = "#1c1917";
    ctx.fillRect(2, 2, 5, 8);
    ctx.fillStyle = "#57534e";
    ctx.fillRect(21, -2.2, 3, 4.4);
  },
  sniper: (ctx) => {
    ctx.fillStyle = "#1c1917";
    ctx.fillRect(-9, -2.5, 16, 5);
    ctx.fillStyle = "#292524";
    ctx.fillRect(6, -1.6, 26, 3.2);
    // scope
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(2, -6, 11, 3.5);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(11, -5.6, 2, 2.7);
    ctx.fillStyle = "#44403c";
    ctx.fillRect(30, -2.4, 3, 4.8);
  },
  minigun: (ctx) => {
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.ellipse(2, 0, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#475569";
    for (const off of [-4, 0, 4]) ctx.fillRect(8, off - 1.3, 22, 2.6);
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.arc(9, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#334155";
    ctx.fillRect(-6, -5, 7, 10);
  },
};

export function weaponSprite(weaponId) {
  const draw = GUN_DRAWERS[weaponId] ?? GUN_DRAWERS.pistol;
  return makeSprite(`gun:${weaponId}`, 72, 26, draw);
}

/* -------------------------------------------------------------- zombies */

const ZOMBIE_DRAWERS = {
  shambler: (ctx, color) => {
    limb(ctx, -2, -9, 5, 4, shade(color, 0.55));
    limb(ctx, -1, 9, 5, 4, shade(color, 0.55));
    ctx.fillStyle = shade(color, 0.8);
    ctx.beginPath();
    ctx.ellipse(-1, 0, 11, 9.5, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(3, 1, 6.5, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // slack arms hanging forward
    ctx.strokeStyle = shade(color, 0.5);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(1, -7); ctx.lineTo(11, -5);
    ctx.moveTo(1, 7); ctx.lineTo(11, 6);
    ctx.stroke();
    ctx.fillStyle = "#fca5a5";
    ctx.beginPath(); ctx.arc(6, -2, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, 3, 1.4, 0, Math.PI * 2); ctx.fill();
  },
  stalker: (ctx, color) => {
    // lean and forward-pitched: reads as fast
    ctx.fillStyle = shade(color, 0.6);
    ctx.beginPath();
    ctx.moveTo(-11, -6); ctx.lineTo(-4, -8); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-11, 6); ctx.lineTo(-4, 8); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shade(color, 1.3);
    ctx.beginPath();
    ctx.moveTo(6, -5); ctx.lineTo(13, 0); ctx.lineTo(6, 5); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = shade(color, 1.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, -6); ctx.lineTo(9, -9);
    ctx.moveTo(2, 6); ctx.lineTo(9, 9);
    ctx.stroke();
    ctx.fillStyle = "#fef08a";
    ctx.beginPath(); ctx.arc(9, -1.6, 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, 1.6, 1.3, 0, Math.PI * 2); ctx.fill();
  },
  breaker: (ctx, color) => {
    // heavy, armoured shoulders: reads as a structure-wrecker
    ctx.fillStyle = shade(color, 0.5);
    ctx.fillRect(-6, -15, 11, 7);
    ctx.fillRect(-6, 8, 11, 7);
    ctx.fillStyle = shade(color, 0.75);
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(4, 0, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shade(color, 0.4);
    ctx.beginPath();
    ctx.moveTo(9, -9); ctx.lineTo(17, -4); ctx.lineTo(9, -1); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(9, 9); ctx.lineTo(17, 4); ctx.lineTo(9, 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath(); ctx.arc(8, -2.6, 1.7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, 2.6, 1.7, 0, Math.PI * 2); ctx.fill();
  },
};

export function zombieSprite(typeId, color, radius) {
  const size = radius * 3.4;
  const draw = ZOMBIE_DRAWERS[typeId] ?? ZOMBIE_DRAWERS.shambler;
  return makeSprite(`zombie:${typeId}`, size, size, (ctx, w) => {
    ctx.scale(w / 40, w / 40);
    draw(ctx, color);
  });
}

/* ---------------------------------------------------------------- bosses */

// Each boss silhouette hints at its mechanic so the fight reads at a glance.
const BOSS_DRAWERS = {
  boss5: (ctx, color) => {
    ctx.fillStyle = shade(color, 0.6);
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(5, 0, 12, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(color, 0.4);
    ctx.beginPath();
    ctx.moveTo(10, -14); ctx.lineTo(24, -8); ctx.lineTo(11, -3); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, 14); ctx.lineTo(24, 8); ctx.lineTo(11, 3); ctx.closePath(); ctx.fill();
  },
  boss10: (ctx, color) => {
    ctx.fillStyle = shade(color, 0.6);
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 19, 0, 0, Math.PI * 2); ctx.fill();
    // charge pods, the visual tell for chain detonation
    for (const a of [0, 1, 2, 3, 4, 5]) {
      const ang = (a / 6) * Math.PI * 2;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * 15, Math.sin(ang) * 15, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = shade(color, 0.35);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, 11, 11, 0, 0, Math.PI * 2); ctx.fill();
  },
  boss15: (ctx, color) => {
    // swept-back and bladed: reads as the leaper
    ctx.fillStyle = shade(color, 0.5);
    ctx.beginPath();
    ctx.moveTo(-20, -16); ctx.lineTo(-2, -9); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-20, 16); ctx.lineTo(-2, 9); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(color, 0.75);
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(8, -9); ctx.lineTo(24, 0); ctx.lineTo(8, 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fef08a";
    ctx.beginPath(); ctx.arc(13, -2.5, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, 2.5, 2, 0, Math.PI * 2); ctx.fill();
  },
  boss20: (ctx, color) => {
    // bloated, with regenerating nodes
    ctx.fillStyle = shade(color, 0.7);
    ctx.beginPath(); ctx.ellipse(0, 0, 22, 21, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(color, 1.6);
    for (const [dx, dy, rr] of [[-7,-7,5],[6,-9,4],[-9,6,4.5],[7,7,5.5],[0,0,6]]) {
      ctx.beginPath(); ctx.arc(dx, dy, rr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(9, 0, 9, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#bbf7d0";
    ctx.beginPath(); ctx.arc(13, -3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(13, 3, 2, 0, Math.PI * 2); ctx.fill();
  },
  boss25: (ctx, color) => {
    // crowned finale silhouette
    ctx.fillStyle = shade(color, 0.55);
    ctx.beginPath(); ctx.ellipse(0, 0, 23, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(color, 0.35);
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 20, Math.sin(ang) * 20);
      ctx.lineTo(Math.cos(ang + 0.18) * 30, Math.sin(ang + 0.18) * 30);
      ctx.lineTo(Math.cos(ang + 0.36) * 20, Math.sin(ang + 0.36) * 20);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff7ed";
    ctx.beginPath(); ctx.arc(6, -4, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, 4, 2.6, 0, Math.PI * 2); ctx.fill();
  },
};

export function bossSprite(typeId, color, radius) {
  const size = radius * 3.6;
  const draw = BOSS_DRAWERS[typeId] ?? BOSS_DRAWERS.boss5;
  return makeSprite(`boss:${typeId}`, size, size, (ctx, w) => {
    ctx.scale(w / 68, w / 68);
    draw(ctx, color);
  });
}

/* --------------------------------------------------------------- turrets */

// Bases are static; barrels are separate sprites the renderer rotates.
export function turretBaseSprite(typeId, color, radius) {
  const size = radius * 3;
  return makeSprite(`turretBase:${typeId}`, size, size, (ctx, w) => {
    ctx.scale(w / 42, w / 42);
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(color, 0.45);
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = shade(color, 0.8);
    ctx.lineWidth = 2;
    for (let a = 0; a < 4; a++) {
      const ang = (a / 4) * Math.PI * 2 + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 9, Math.sin(ang) * 9);
      ctx.lineTo(Math.cos(ang) * 15, Math.sin(ang) * 15);
      ctx.stroke();
    }
  });
}

const TURRET_BARRELS = {
  cannon: (ctx, color) => {
    ctx.fillStyle = shade(color, 0.7);
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(color, 0.5);
    ctx.fillRect(4, -5, 20, 10);
    ctx.fillStyle = color;
    ctx.fillRect(20, -6.5, 6, 13);
  },
  frost: (ctx, color) => {
    ctx.fillStyle = shade(color, 0.7);
    ctx.beginPath(); ctx.arc(0, 0, 8.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(5, s * 4); ctx.lineTo(22, s * 2.2); ctx.lineTo(5, s * 0.5);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#e0f2fe";
    ctx.beginPath();
    ctx.moveTo(18, -3.5); ctx.lineTo(26, 0); ctx.lineTo(18, 3.5); ctx.closePath();
    ctx.fill();
  },
  flame: (ctx, color) => {
    ctx.fillStyle = shade(color, 0.6);
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(color, 0.45);
    ctx.beginPath(); ctx.arc(-6, 0, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = color;
    ctx.fillRect(4, -3.5, 15, 7);
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.moveTo(17, -5.5); ctx.lineTo(25, 0); ctx.lineTo(17, 5.5); ctx.closePath();
    ctx.fill();
  },
  machinegun: (ctx, color) => {
    ctx.fillStyle = shade(color, 0.7);
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = shade(color, 0.5);
    ctx.fillRect(4, -5.5, 18, 3.4);
    ctx.fillRect(4, 2.1, 18, 3.4);
    ctx.fillStyle = color;
    ctx.fillRect(19, -6, 4, 12);
  },
};

export function turretBarrelSprite(typeId, color) {
  const draw = TURRET_BARRELS[typeId] ?? TURRET_BARRELS.cannon;
  return makeSprite(`turretBarrel:${typeId}`, 64, 30, (ctx) => draw(ctx, color));
}

/* ------------------------------------------------------------- objective */

export function objectiveSprite(radius) {
  const size = radius * 3;
  return makeSprite("objective", size, size, (ctx, w) => {
    ctx.scale(w / 84, w / 84);
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1e3a8a";
    ctx.beginPath(); ctx.arc(0, 0, 27, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#3b82f6";
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 12, Math.sin(ang) * 12);
      ctx.lineTo(Math.cos(ang + 0.5) * 25, Math.sin(ang + 0.5) * 25);
      ctx.lineTo(Math.cos(ang + 1.05) * 12, Math.sin(ang + 1.05) * 12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#93c5fd";
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#dbeafe";
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  });
}
