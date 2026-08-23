import { WEAPONS } from "../data/weapons.js";
import { upgradesAvailableAtWave } from "../data/upgrades.js";

const ROW_HEIGHT = 30;
const COLUMN_GAP = 22;
const PANEL_MARGIN = 48;

const CATEGORY_TITLES = {
  weapon: "Weapons",
  player: "Player",
  turret: "Turrets",
  objective: "Objective",
};

// Builds the flat list of purchasable rows plus their hit-test rectangles.
// Layout is recomputed each frame so it survives a window resize.
export function buildShopLayout(ctx, { wave, player, upgrades }) {
  const canvas = ctx.canvas;
  const panelX = PANEL_MARGIN;
  const panelY = PANEL_MARGIN;
  const panelW = canvas.width - PANEL_MARGIN * 2;
  const panelH = canvas.height - PANEL_MARGIN * 2;

  const columns = [
    { key: "weapon", items: weaponRows(player) },
    { key: "player", items: upgradeRows(upgrades, "player", wave) },
    { key: "turret", items: upgradeRows(upgrades, "turret", wave) },
    { key: "objective", items: upgradeRows(upgrades, "objective", wave) },
  ];

  const columnW = (panelW - COLUMN_GAP * (columns.length + 1)) / columns.length;
  const rows = [];

  columns.forEach((column, index) => {
    const x = panelX + COLUMN_GAP + index * (columnW + COLUMN_GAP);
    let y = panelY + 96;
    column.x = x;
    column.width = columnW;
    column.headerY = y - 14;

    for (const item of column.items) {
      rows.push({ ...item, x, y, width: columnW, height: ROW_HEIGHT - 4 });
      y += ROW_HEIGHT;
    }
  });

  return { panelX, panelY, panelW, panelH, columns, rows };
}

function weaponRows(player) {
  return Object.values(WEAPONS)
    .filter((w) => w.cost > 0)
    .map((weapon) => ({
      kind: "weapon",
      id: weapon.id,
      weapon,
      label: weapon.label,
      detail: `${weapon.damage}dmg x${weapon.pellets} · ${weapon.automatic ? "auto" : "click"}`,
      owned: player.ownsWeapon(weapon.id),
      cost: weapon.cost,
    }));
}

function upgradeRows(upgrades, category, wave) {
  return upgradesAvailableAtWave(wave)
    .filter((u) => u.category === category)
    .map((upgrade) => ({
      kind: "upgrade",
      id: upgrade.id,
      upgrade,
      label: upgrade.label,
      detail: upgrade.detail,
      tier: upgrades.tierOf(upgrade.id),
      maxTier: upgrade.maxTier,
      maxed: upgrades.isMaxed(upgrade),
      cost: upgrades.costOf(upgrade),
    }));
}

export function rowAtPoint(layout, x, y) {
  return layout.rows.find(
    (row) => x >= row.x && x <= row.x + row.width && y >= row.y && y <= row.y + row.height
  );
}

export function drawShop(ctx, layout, { wave, currency, hoveredRow, message, isFinalWave }) {
  const canvas = ctx.canvas;
  ctx.save();

  ctx.fillStyle = "rgba(2, 6, 23, 0.92)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 2;
  ctx.strokeRect(layout.panelX, layout.panelY, layout.panelW, layout.panelH);

  ctx.textAlign = "left";
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(`Wave ${wave} cleared`, layout.panelX + COLUMN_GAP, layout.panelY + 42);

  ctx.fillStyle = "#fcd34d";
  ctx.font = "20px sans-serif";
  ctx.fillText(`$${currency}`, layout.panelX + COLUMN_GAP, layout.panelY + 70);

  ctx.textAlign = "right";
  ctx.fillStyle = "#38bdf8";
  ctx.font = "16px sans-serif";
  const prompt = isFinalWave ? "SPACE — face the final wave" : "SPACE — start next wave";
  ctx.fillText(prompt, layout.panelX + layout.panelW - COLUMN_GAP, layout.panelY + 42);

  if (message) {
    ctx.fillStyle = "#fca5a5";
    ctx.font = "14px sans-serif";
    ctx.fillText(message, layout.panelX + layout.panelW - COLUMN_GAP, layout.panelY + 68);
  }

  ctx.textAlign = "left";
  for (const column of layout.columns) {
    ctx.fillStyle = "#64748b";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(CATEGORY_TITLES[column.key].toUpperCase(), column.x, column.headerY);

    if (column.items.length === 0) {
      ctx.fillStyle = "#475569";
      ctx.font = "13px sans-serif";
      ctx.fillText("—", column.x, column.headerY + 26);
    }
  }

  for (const row of layout.rows) {
    drawRow(ctx, row, { currency, hovered: hoveredRow && hoveredRow.id === row.id });
  }

  ctx.restore();
}

function drawRow(ctx, row, { currency, hovered }) {
  const unavailable = row.owned || row.maxed;
  const affordable = !unavailable && currency >= row.cost;

  ctx.fillStyle = hovered && affordable ? "rgba(56, 189, 248, 0.16)" : "rgba(30, 41, 59, 0.55)";
  ctx.fillRect(row.x, row.y, row.width, row.height);

  if (hovered && affordable) {
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(row.x + 0.5, row.y + 0.5, row.width - 1, row.height - 1);
  }

  ctx.fillStyle = unavailable ? "#475569" : affordable ? "#e2e8f0" : "#64748b";
  ctx.font = "14px sans-serif";
  ctx.fillText(row.label, row.x + 8, row.y + 17);

  ctx.fillStyle = unavailable ? "#334155" : "#64748b";
  ctx.font = "11px sans-serif";
  const tierText = row.kind === "upgrade" && Number.isFinite(row.maxTier) ? `  (${row.tier}/${row.maxTier})` : "";
  ctx.fillText(row.detail + tierText, row.x + 8, row.y + 30);

  ctx.textAlign = "right";
  if (row.owned) {
    ctx.fillStyle = "#475569";
    ctx.font = "12px sans-serif";
    ctx.fillText("OWNED", row.x + row.width - 8, row.y + 20);
  } else if (row.maxed) {
    ctx.fillStyle = "#475569";
    ctx.font = "12px sans-serif";
    ctx.fillText("MAX", row.x + row.width - 8, row.y + 20);
  } else {
    ctx.fillStyle = affordable ? "#fcd34d" : "#7f1d1d";
    ctx.font = "14px sans-serif";
    ctx.fillText(`$${row.cost}`, row.x + row.width - 8, row.y + 20);
  }
  ctx.textAlign = "left";
}
