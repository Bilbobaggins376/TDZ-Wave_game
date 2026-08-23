import { InputManager } from "./InputManager.js";
import { Renderer } from "./Renderer.js";
import { Player } from "../entities/Player.js";
import { Objective } from "../entities/Objective.js";
import { Projectile } from "../entities/Projectile.js";
import { Turret } from "../entities/Turret.js";
import { WaveManager } from "../systems/WaveManager.js";
import { resolveCollisions } from "../systems/CollisionSystem.js";
import { Economy } from "../systems/Economy.js";
import { UpgradeSystem } from "../systems/UpgradeSystem.js";
import { TURRET_TYPES, turretsAvailableAtWave } from "../data/turretTypes.js";
import { WEAPONS } from "../data/weapons.js";
import { drawHUD } from "../ui/HUD.js";
import { buildShopLayout, rowAtPoint, drawShop } from "../ui/ShopMenu.js";

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.input = new InputManager(canvas);
    this.renderer = new Renderer(this.ctx, canvas);

    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.reset();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  reset() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    this.objective = new Objective(cx, cy);
    this.player = new Player(cx, cy + 100);
    this.zombies = [];
    this.projectiles = [];
    this.turrets = [];
    this.economy = new Economy();
    this.upgrades = new UpgradeSystem();
    this.waveManager = new WaveManager(this.canvas.width, this.canvas.height);
    this.state = "playing";
    this.lastBuildError = null;
    this.buildErrorTimer = 0;
    this.shopMessage = null;
    this.shopLayout = null;
  }

  get gameOver() {
    return this.state === "gameover";
  }

  start() {
    let lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      this.update(dt);
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update(dt) {
    if (this.state === "gameover" || this.state === "victory") {
      if (this.input.isKeyPressed("r")) this.reset();
      this.input.endFrame();
      return;
    }

    // §6/§9: the shop is a hard pause — no entity, wave, or collision work
    // happens while it's open, only shop input.
    if (this.state === "intermission") {
      this.updateShop();
      this.input.endFrame();
      return;
    }

    if (this.buildErrorTimer > 0) this.buildErrorTimer -= dt;

    this.handleBuildModeToggle();
    this.updatePlayer(dt);

    const world = {
      player: this.player,
      objective: this.objective,
      turrets: this.turrets,
    };
    for (const zombie of this.zombies) zombie.update(dt, world);
    for (const turret of this.turrets) {
      turret.update(
        dt,
        this.zombies,
        (t, dx, dy, damage) => this.fireTurret(t, dx, dy, damage),
        this.upgrades.modsFor(turret.type.id)
      );
    }
    this.updateProjectiles(dt);

    const { spawned, waveCleared } = this.waveManager.update(dt, this.zombies.length);
    this.zombies.push(...spawned);

    const { deadZombieIds, deadProjectileIds, deadTurretIds } = resolveCollisions({
      ...world,
      zombies: this.zombies,
      projectiles: this.projectiles,
    });

    for (const zombie of this.zombies) {
      if (deadZombieIds.has(zombie.id)) this.economy.award(zombie.type.currencyDrop);
    }
    this.zombies = this.zombies.filter((z) => !deadZombieIds.has(z.id));
    this.projectiles = this.projectiles.filter((p) => !deadProjectileIds.has(p.id));
    this.turrets = this.turrets.filter((t) => !deadTurretIds.has(t.id));

    if (this.player.hp <= 0) {
      this.economy.applyDeathPenalty(this.waveManager.wave);
      this.player.respawn(this.objective.x, this.objective.y - 100);
    }
    if (this.objective.hp <= 0) {
      this.state = "gameover";
    } else if (waveCleared) {
      // §11: clearing the final wave wins the run outright.
      this.state = this.waveManager.isFinalWave() ? "victory" : "intermission";
      this.player.buildMode = false;
      this.shopMessage = null;
    }

    this.input.endFrame();
  }

  updateShop() {
    if (this.input.wasKeyPressed(" ") || this.input.wasKeyPressed("enter")) {
      this.waveManager.advanceWave();
      this.state = "playing";
      return;
    }

    if (!this.input.mouseClickedThisFrame) return;

    // Built here as well as in draw() so a click on the intermission's very
    // first frame still hit-tests against a real layout.
    if (!this.shopLayout) {
      this.shopLayout = buildShopLayout(this.ctx, {
        wave: this.waveManager.wave,
        player: this.player,
        upgrades: this.upgrades,
      });
    }

    const row = rowAtPoint(this.shopLayout, this.input.mouseX, this.input.mouseY);
    if (!row) return;
    this.shopMessage = row.kind === "weapon" ? this.buyWeapon(row) : this.buyUpgrade(row);
  }

  buyWeapon(row) {
    if (this.player.ownsWeapon(row.weapon.id)) return "Already owned";
    if (!this.economy.canAfford(row.weapon.cost)) return `Need $${row.weapon.cost}`;

    this.economy.spend(row.weapon.cost);
    this.player.giveWeapon(row.weapon.id);
    this.player.equipSlot(this.player.ownedWeaponIds.length);
    return null;
  }

  buyUpgrade(row) {
    return this.upgrades.purchase(row.upgrade, {
      economy: this.economy,
      player: this.player,
      objective: this.objective,
    });
  }

  handleBuildModeToggle() {
    if (this.input.wasKeyPressed("b")) {
      this.player.buildMode = !this.player.buildMode;
    }
    if (this.player.buildMode && (this.input.wasKeyPressed("escape") || this.input.rightClickedThisFrame)) {
      this.player.buildMode = false;
    }
  }

  availableTurretTypes() {
    return turretsAvailableAtWave(this.waveManager.wave);
  }

  updatePlayer(dt) {
    const move = this.input.getMoveVector();
    this.player.x += move.x * this.player.speed * dt;
    this.player.y += move.y * this.player.speed * dt;
    this.player.x = Math.max(this.player.radius, Math.min(this.canvas.width - this.player.radius, this.player.x));
    this.player.y = Math.max(this.player.radius, Math.min(this.canvas.height - this.player.radius, this.player.y));

    // §3: click and number keys are contextual on build mode.
    const numberKey = this.input.numberKeyPressed();
    if (this.player.buildMode) {
      if (numberKey) {
        const available = this.availableTurretTypes();
        const picked = available[numberKey - 1];
        if (picked) this.player.selectedTurretTypeId = picked.id;
      }
      if (this.input.mouseClickedThisFrame) this.tryPlaceTurret();
      return;
    }

    if (numberKey) this.player.equipSlot(numberKey);

    this.player.fireCooldown -= dt;
    const wantsToFire = this.player.weapon.automatic ? this.input.mouseDown : this.input.mouseClickedThisFrame;
    if (wantsToFire && this.player.fireCooldown <= 0) {
      this.fireWeapon();
      this.player.fireCooldown = 1 / this.player.weapon.fireRate;
    }
  }

  selectedTurretType() {
    const type = TURRET_TYPES[this.player.selectedTurretTypeId];
    if (type && this.waveManager.wave >= type.unlockWave) return type;
    return this.availableTurretTypes()[0];
  }

  placementBlockReason(x, y) {
    const type = this.selectedTurretType();
    if (!type) return "No turret unlocked";
    if (!this.player.canBuildAt(x, y)) return "Outside build radius";
    if (this.turrets.length >= this.player.turretCap) return `Turret cap reached (${this.player.turretCap})`;
    if (!this.economy.canAfford(type.cost)) return `Need ${type.cost} currency`;
    if (Math.hypot(x - this.objective.x, y - this.objective.y) < this.objective.radius + type.radius) {
      return "Too close to objective";
    }
    for (const turret of this.turrets) {
      if (Math.hypot(x - turret.x, y - turret.y) < turret.radius + type.radius) return "Overlaps a turret";
    }
    return null;
  }

  tryPlaceTurret() {
    const x = this.input.mouseX;
    const y = this.input.mouseY;
    const reason = this.placementBlockReason(x, y);
    if (reason) {
      this.lastBuildError = reason;
      this.buildErrorTimer = 1.5;
      return;
    }

    const type = this.selectedTurretType();
    this.economy.spend(type.cost);
    this.turrets.push(new Turret(type, x, y));
  }

  fireTurret(turret, dirX, dirY, damage) {
    const type = turret.type;
    this.projectiles.push(
      new Projectile(turret.x, turret.y, dirX, dirY, type.projectileSpeed, damage, {
        color: type.color,
        effect: type.effect,
        splashRadius: type.splashRadius,
        slowFactor: type.slowFactor,
        slowDurationMs: type.slowDurationMs,
        radius: type.effect === "splash" ? 6 : 4,
      })
    );
  }

  fireWeapon() {
    const dx = this.input.mouseX - this.player.x;
    const dy = this.input.mouseY - this.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.001) return;

    const weapon = this.player.weapon;
    const damage = weapon.damage * this.upgrades.weaponDamageMultiplier;
    const baseAngle = Math.atan2(dy, dx);

    for (let i = 0; i < weapon.pellets; i++) {
      const offset = weapon.pellets === 1 ? 0 : (i / (weapon.pellets - 1) - 0.5) * weapon.spread;
      const angle = baseAngle + offset;
      this.projectiles.push(
        new Projectile(
          this.player.x,
          this.player.y,
          Math.cos(angle),
          Math.sin(angle),
          weapon.projectileSpeed,
          damage
        )
      );
    }
  }

  updateProjectiles(dt) {
    for (const projectile of this.projectiles) projectile.update(dt);
    this.projectiles = this.projectiles.filter(
      (p) => p.x > -20 && p.x < this.canvas.width + 20 && p.y > -20 && p.y < this.canvas.height + 20
    );
  }

  // §10.1: a turret is "threatened" while any turret-priority zombie is
  // actively targeting it, so the cue can never fire on a stale target.
  threatenedTurretIds() {
    const ids = new Set();
    for (const zombie of this.zombies) {
      if (zombie.target && zombie.target.isTurret) ids.add(zombie.target.id);
    }
    return ids;
  }

  draw() {
    this.renderer.render({
      player: this.player,
      objective: this.objective,
      zombies: this.zombies,
      projectiles: this.projectiles,
      turrets: this.turrets,
      threatenedTurretIds: this.threatenedTurretIds(),
      gameOver: this.state === "gameover",
      victory: this.state === "victory",
      buildPreview: this.player.buildMode
        ? {
            x: this.input.mouseX,
            y: this.input.mouseY,
            type: this.selectedTurretType(),
            blockReason: this.placementBlockReason(this.input.mouseX, this.input.mouseY),
          }
        : null,
    });

    if (this.state === "intermission") {
      this.drawShopOverlay();
      return;
    }

    drawHUD(this.ctx, {
      wave: this.waveManager.wave,
      currency: this.economy.currency,
      buildMode: this.player.buildMode,
      selectedTurretType: this.selectedTurretType(),
      availableTurretTypes: this.availableTurretTypes(),
      turretsPlaced: this.turrets.length,
      turretCap: this.player.turretCap,
      weapon: this.player.weapon,
      ownedWeaponIds: this.player.ownedWeaponIds,
      buildError: this.buildErrorTimer > 0 ? this.lastBuildError : null,
    });
  }

  drawShopOverlay() {
    this.shopLayout = buildShopLayout(this.ctx, {
      wave: this.waveManager.wave,
      player: this.player,
      upgrades: this.upgrades,
    });

    drawShop(this.ctx, this.shopLayout, {
      wave: this.waveManager.wave,
      currency: this.economy.currency,
      hoveredRow: rowAtPoint(this.shopLayout, this.input.mouseX, this.input.mouseY),
      message: this.shopMessage,
      isFinalWave: this.waveManager.wave + 1 >= 25,
    });
  }
}
