export function drawHUD(ctx, { wave }) {
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Wave ${wave}`, 16, 30);
}
