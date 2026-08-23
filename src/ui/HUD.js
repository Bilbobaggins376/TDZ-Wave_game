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

  if (buildError) {
    ctx.fillStyle = "#fca5a5";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(buildError, ctx.canvas.width / 2, 40);
  }

  ctx.restore();
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
