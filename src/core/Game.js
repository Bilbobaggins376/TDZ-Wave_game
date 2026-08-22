import { InputManager } from "./InputManager.js";
import { Renderer } from "./Renderer.js";
import { Player } from "../entities/Player.js";
import { Objective } from "../entities/Objective.js";
import { Projectile } from "../entities/Projectile.js";
import { WaveManager } from "../systems/WaveManager.js";
import { resolveCollisions } from "../systems/CollisionSystem.js";
import { drawHUD } from "../ui/HUD.js";

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
    this.waveManager = new WaveManager(this.canvas.width, this.canvas.height);
    this.gameOver = false;
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
    if (this.gameOver) {
      if (this.input.isKeyPressed("r")) this.reset();
      this.input.endFrame();
      return;
    }

    this.updatePlayer(dt);
    for (const zombie of this.zombies) zombie.update(dt, this.objective);
    this.updateProjectiles(dt);

    const spawned = this.waveManager.update(dt, this.zombies.length);
    this.zombies.push(...spawned);

    const { deadZombieIds, deadProjectileIds } = resolveCollisions({
      player: this.player,
      objective: this.objective,
      zombies: this.zombies,
      projectiles: this.projectiles,
    });
    this.zombies = this.zombies.filter((z) => !deadZombieIds.has(z.id));
    this.projectiles = this.projectiles.filter((p) => !deadProjectileIds.has(p.id));

    if (this.player.hp <= 0) {
      this.player.respawn(this.objective.x, this.objective.y - 100);
    }
    if (this.objective.hp <= 0) {
      this.gameOver = true;
    }

    this.input.endFrame();
  }

  updatePlayer(dt) {
    const move = this.input.getMoveVector();
    this.player.x += move.x * this.player.speed * dt;
    this.player.y += move.y * this.player.speed * dt;
    this.player.x = Math.max(this.player.radius, Math.min(this.canvas.width - this.player.radius, this.player.x));
    this.player.y = Math.max(this.player.radius, Math.min(this.canvas.height - this.player.radius, this.player.y));

    this.player.fireCooldown -= dt;
    const wantsToFire = this.player.weapon.automatic ? this.input.mouseDown : this.input.mouseClickedThisFrame;
    if (wantsToFire && this.player.fireCooldown <= 0) {
      this.fireWeapon();
      this.player.fireCooldown = 1 / this.player.weapon.fireRate;
    }
  }

  fireWeapon() {
    const dx = this.input.mouseX - this.player.x;
    const dy = this.input.mouseY - this.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.001) return;

    const weapon = this.player.weapon;
    this.projectiles.push(
      new Projectile(this.player.x, this.player.y, dx / dist, dy / dist, weapon.projectileSpeed, weapon.damage)
    );
  }

  updateProjectiles(dt) {
    for (const projectile of this.projectiles) projectile.update(dt);
    this.projectiles = this.projectiles.filter(
      (p) => p.x > -20 && p.x < this.canvas.width + 20 && p.y > -20 && p.y < this.canvas.height + 20
    );
  }

  draw() {
    this.renderer.render({
      player: this.player,
      objective: this.objective,
      zombies: this.zombies,
      projectiles: this.projectiles,
      gameOver: this.gameOver,
    });
    drawHUD(this.ctx, { wave: this.waveManager.wave });
  }
}
