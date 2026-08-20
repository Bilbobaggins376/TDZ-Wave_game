# TDZ Wave Game — Requirements

Living document. Update as design decisions change; this is not a spec frozen
in stone.

## 1. Core concept

A top-down tower-defense/survival hybrid. Zombies spawn in waves and path
toward a central **objective** with hit points. The player directly fights
zombies with equipped weapons and can also place a limited number of
turrets/traps. If the objective's HP reaches 0, the game ends.

## 2. Objective

- A fixed structure/point on the map with a visible HP bar.
- Takes damage when a zombie reaches it and attacks (zombie is not required
  to die to deal damage — it attacks on contact, then either dies, retreats,
  or keeps attacking depending on enemy type).
- HP does not regenerate on its own. Repair may exist as a purchasable
  upgrade (see §6).
- Game over when objective HP hits 0.

## 3. Player character

- Moves freely around the map (top-down movement, 8-directional or analog).
- Has their own HP, separate from the objective. On death, the player
  **respawns** rather than ending the run — but loses a currency penalty each
  time they die. Penalty scales with the current wave: `10 × waveNumber`
  (wave 1 = 10, wave 2 = 20, … wave 25 = 250). Player death is never itself a
  loss condition; only the objective reaching 0 HP ends the run.
- Directly attacks zombies with their currently equipped weapon.
- Can place a limited number of turrets/traps (limit increases via upgrades).

## 4. Weapons

- Player carries one equipped weapon at a time, switchable from an inventory
  of unlocked/purchased weapons.
- Each weapon has: damage, fire rate, range, ammo/reload behavior (if any),
  and a purchase cost.
- Starting weapon is available for free at wave 1.
- Weapons are bought with currency (see §7) — no fixed unlock progression.

## 5. Turrets / traps

- Placed by the player at chosen map positions within a build radius of the
  objective (exact radius TBD).
- Multiple distinct turret types are selectable at placement time, each with
  its own cost, stats, and behavior — not just one generic turret. Proposed
  starter roster (editable):
  - **Cannon** — slow fire rate, high damage, splash/AoE on impact. Good
    against clustered hordes. Available from wave 1.
  - **Frost** — low damage, applies a slow debuff to zombies it hits. Crowd
    control rather than a kill tool. **Locked until wave 6.**
  - **Flame** — very short range, continuous damage-over-time to anything in
    its area. Good as a last line of defense near the objective. **Locked
    until wave 11.**
  - **Machine Gun** — cheap, fast fire rate, low damage per hit, single
    target. **Locked until wave 16.**

  Unlock order is deliberately Cannon → Frost → Flame → Machine Gun, not the
  order the types are introduced above.
- Each turret type has its own currency cost, and its own damage/range/
  fire-rate stats, upgradable independently of player weapons and of other
  turret types.
- Number of simultaneously placed turrets is capped; the cap itself is
  upgradable. The cap applies across all turret types combined (no separate
  per-type cap, unless that changes).
- **Effect stacking**: if a zombie is affected by the same kind of turret
  effect from multiple sources (e.g. two Frost turrets slowing it, or Flame +
  another DoT source), only one instance of that effect applies at a time —
  the highest-damaging/strongest one. Effects do not stack additively.

## 6. Upgrades

Purchasable with currency, available only between waves — the shop is a hard
pause (see §9). Categories:

- **Player upgrades**: move speed, max HP, weapon damage multiplier, weapon
  swap speed.
- **Turret/trap upgrades**: damage, range, fire rate, per-turret-type.
- **Objective upgrades**: max HP, repair (restore HP), passive regen (if
  adopted), damage reduction.
- Upgrades persist for the remainder of the run; no separate meta-progression
  across runs unless explicitly added later.

## 7. Currency / economy

- Zombies drop currency on death (amount varies by zombie type — tougher
  zombies drop more).
- Player death costs a currency penalty on respawn (see §3): base 10,
  increasing by 10 per wave (`10 × waveNumber`).
- Currency is spent on weapons, turrets, and upgrades via a shop/menu,
  available only between waves.
- No other currency sources planned initially (no passive income).

## 8. Zombies

Each zombie type has a **priority target** — what it heads for first — rather
than every zombie uniformly beelining for the objective. Proposed starter
roster (editable):

- **Shambler** — Objective-priority. Baseline HP/speed, ignores the player
  and turrets unless they're directly blocking its path; heads straight for
  the objective.
- **Stalker** — Player-priority. Faster, lower HP; actively paths toward and
  attacks the player. Falls back to Objective-priority behavior if the player
  is unreachable or out of its aggro range.
- **Breaker** — Turret-priority. Higher damage against structures; paths
  toward the nearest placed turret and attacks it. Falls back to
  Objective-priority behavior if no turrets are currently placed.
- **Boss** — one per boss wave (see §9). Turret-priority: destroys placed
  turrets first, then falls back to Objective-priority once no turrets
  remain (same fallback rule as Breaker). In addition, every boss has a
  **secondary attack** — a ranged/special ability that can strike the player
  directly regardless of the boss's current movement target. Each of the 5
  bosses is a distinct design (see §9) with its own secondary attack; the
  turret-first, then-objective pattern is the one thing all 5 share.

All zombies still deal contact damage to the objective if they reach it,
regardless of type. Zombie stats scale up as waves progress (see §9).

## 9. Wave system

- Waves are discrete: a wave ends only when every entity spawned in it is
  dead — no time limit. A shop/upgrade interval (hard pause, see §6) opens
  before the next wave starts.
- Difficulty increases with wave number via more zombies per wave and higher
  zombie HP/damage/speed.
- **Boss waves** occur every 5th wave (5, 10, 15, 20, 25). A boss wave
  replaces the normal spawn with a single boss enemy. **All 5 bosses are
  distinct designs** (not one boss reused with scaled stats), with overall
  difficulty increasing from the wave 5 boss through the wave 25 boss. Each
  shares the turret-priority/secondary-attack pattern described in §8, but
  stats and the specific secondary attack differ per boss — exact per-boss
  kits TBD, see Open Questions.
- **Max wave is 25 (for now)** — clearing wave 25's boss wins the run.

## 10. UI / HUD

- Objective HP bar (always visible).
- Player HP bar.
- Currency count.
- Current wave number (out of 25) and progress within the current wave.
- Weapon/turret selection UI, with cost and stats shown before purchase —
  locked turret types (Frost, Flame, Machine Gun before their unlock wave)
  shown but disabled, with the unlock wave indicated.
- Boss-wave indicator/warning before a boss wave starts.

## 11. Win / lose conditions

- **Loss**: objective HP reaches 0.
- **Win**: the wave 25 boss is defeated.
- Player death never ends the run by itself — see §3.

## 12. Persistence

- Run state (current wave, objective HP, player HP/position, currency, owned
  weapons/turrets/upgrades, placed turrets) is saved to browser storage after
  meaningful state changes (wave cleared, purchase made, damage taken).
- On page load, if a saved run exists, resume directly into it instead of
  starting fresh.
- A finished run (win at wave 25, or loss) clears the saved state, so the
  next page load starts a new run.
- Single save slot — no multiple save profiles for now.

## 13. Out of scope (for now)

- Multiplayer/co-op.
- Meta-progression between runs (persistent unlocks across sessions).
- Mobile/touch controls.

## 14. Open questions

- The specific stats and secondary-attack design for each of the 5 distinct
  bosses (wave 5, 10, 15, 20, 25) — only the shared turret-priority pattern
  and "difficulty increases per boss" are decided so far.
- Whether the secondary attack is purely ranged (a projectile/AoE that can
  hit the player from a distance) or requires some proximity — mechanics
  TBD.
