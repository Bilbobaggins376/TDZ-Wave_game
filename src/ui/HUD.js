import { WEAPONS } from "../data/weapons.js";

export function drawHUD(ctx, {
  wave,
  currency,
  buildMode,
  selectedTurretType,
  availableTurretTypes,
  turretsPlaced,
  turretCap,
  weapon,
  ownedWeaponIds,
  buildError,
  boss,
  phaseLabel,
}) {
  ctx.save();
  ctx.textAlign = "left";

  ctx.fillStyle = "#e5e7eb";
  ctx.font = "20px sans-serif";
  ctx.fillText(`Wave ${wave}`, 16, 30);

  ctx.fillStyle = "#fcd34d";
  ctx.fillText(`$${currency}`, 16, 56);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px sans-serif";
  ctx.fillText(`Turrets ${turretsPlaced}/${turretCap}`, 16, 78);

  // §10: the equipped-weapon indicator is replaced by the turret picker
  // while Build Mode is active, never shown alongside it.
  if (buildMode) {
    drawBuildBar(ctx, { selectedTurretType, availableTurretTypes, currency });
  } else {
    let y = 104;
    ownedWeaponIds.forEach((id, index) => {
      const equipped = WEAPONS[id].id === weapon.id;
      ctx.fillStyle = equipped ? "#e5e7eb" : "#64748b";
      ctx.font = equipped ? "bold 15px sans-serif" : "15px sans-serif";
      ctx.fillText(`${equipped ? "▶" : " "} [${index + 1}] ${WEAPONS[id].label}`, 16, y);
      y += 20;
    });
    ctx.fillStyle = "#64748b";
    ctx.font = "13px sans-serif";
    ctx.fillText("B — build mode", 16, y + 4);
  }

  if (boss) drawBossBar(ctx, boss, phaseLabel);

  if (buildError) {
    ctx.fillStyle = "#fca5a5";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(buildError, ctx.canvas.width / 2, 40);
  }

  ctx.restore();
}

function drawBossBar(ctx, boss, phaseLabel) {
  const width = Math.min(520, ctx.canvas.width - 120);
  const x = (ctx.canvas.width - width) / 2;
  const y = 24;

  ctx.textAlign = "center";
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(boss.type.label.toUpperCase(), ctx.canvas.width / 2, y - 6);

  ctx.fillStyle = "#1f2937";
  ctx.fillRect(x, y, width, 12);
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(x, y, width * Math.max(0, boss.hp / boss.maxHp), 12);
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, 11);

  if (phaseLabel) {
    ctx.fillStyle = "#fcd34d";
    ctx.font = "14px sans-serif";
    ctx.fillText(phaseLabel, ctx.canvas.width / 2, y + 32);
  }
  ctx.textAlign = "left";
}

function drawBuildBar(ctx, { selectedTurretType, availableTurretTypes, currency }) {
  ctx.fillStyle = "#38bdf8";
  ctx.font = "15px sans-serif";
  ctx.fillText("BUILD MODE — click to place, right-click/Esc to exit", 16, 104);

  let y = 128;
  availableTurretTypes.forEach((type, index) => {
    const selected = selectedTurretType && type.id === selectedTurretType.id;
    const affordable = currency >= type.cost;

    ctx.fillStyle = selected ? "#e2e8f0" : affordable ? "#94a3b8" : "#64748b";
    ctx.font = selected ? "bold 14px sans-serif" : "14px sans-serif";
    ctx.fillText(`${selected ? "▶" : " "} [${index + 1}] ${type.label}`, 16, y);

    ctx.fillStyle = affordable ? "#fcd34d" : "#7f1d1d";
    ctx.fillText(`$${type.cost}`, 190, y);

    y += 22;
  });
}
