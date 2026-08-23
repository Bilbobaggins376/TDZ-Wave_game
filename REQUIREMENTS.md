# TDZ Wave Game — Requirements

Living document. Update as design decisions change; this is not a spec frozen
in stone.

## 1. Core concept

A top-down tower-defense/survival hybrid. Zombies spawn in waves and path
toward a central **objective** with hit points. The player directly fights
zombies with equipped weapons and can also place a limited number of
turrets/traps. If the objective's HP reaches 0, the game ends.

The play area is a **fixed viewport** — the whole map is sized to the browser
window and always fully visible. No camera, no scrolling/panning; this is
true for the entire game, not just an early simplification.

### 1.1 Design pillars — what sets this apart

Competitive research (Aug 2026) across itch.io's tower-defense/zombie tags
and the wider hybrid genre found the space splits into two camps: pure
turret-placement games where you never fight directly (Zombie Tower
Survivor, Wizard Siege TD), and survival shooters with base-building but no
real turret strategy (Don't Bite Me Bro!, Surrounded). The genuine hybrids —
Sanctum, Sentry, GROSS — are all first-person, not top-down. The following
four pillars are the deliberate differentiators; treat them as load-bearing,
and weigh feature changes against whether they strengthen or dilute them.

1. **The build radius follows the player, not a base.** Nearly every
   competitor either allows free placement anywhere or restricts building to
   a static home base. Anchoring it to the player (§5) forces a live
   tradeoff: push forward to fight, or hold position to keep your build
   radius over your turrets.
2. **Enemies hunt different targets.** Genre-standard is "every enemy
   beelines the same target." Per-type priority targeting (§8) — Stalkers
   hunt the player, Breakers hunt turrets, Shamblers hunt the objective —
   means the player-anchored build radius and the enemy AI reinforce each
   other into one tactical layer rather than two unrelated features. **These
   first two pillars are the headline; they must be legible to the player,
   not merely emergent** (see §10's threat cue).
3. **Turrets counter behaviors, not just hit harder.** Each turret type is
   designed against a specific enemy behavior (§5.1), so each unlock is a
   strategy shift rather than a rung on a power ladder.
4. **A finite, winnable run.** Most of the surveyed field is endless
   survival. A bounded 25-wave run with a real victory (§11) is a stronger
   pitch on a browse-and-bail storefront like itch.io, and **"5 bosses, 5
   different fights"** (§9.1) is a headline feature almost nothing in the
   surveyed field advertises.

## 2. Objective

- A fixed structure/point on the map with a visible HP bar.
- Takes damage when a zombie reaches it and attacks (zombie is not required
  to die to deal damage — it attacks on contact, then either dies, retreats,
  or keeps attacking depending on enemy type).
- HP does not regenerate on its own. Repair may exist as a purchasable
  upgrade (see §6).
- Game over when objective HP hits 0.

## 3. Player character

- Moves freely around the map — **WASD/arrow keys**, 8-directional.
- Aims with the **mouse cursor**; the equipped weapon fires toward the
  cursor position. **Automatic weapons hold-to-fire** (continue firing at
  their fire rate for as long as the button is held); **non-automatic
  weapons are click-per-shot** (one shot per click, regardless of how long
  it's held). Which weapons are automatic is a per-weapon flag, see §4.
- Switches equipped weapon with **number keys** (1, 2, 3…), one key per
  owned weapon in purchase order.
- Has their own HP, separate from the objective. On death, the player
  **respawns** rather than ending the run — but loses a currency penalty each
  time they die. Penalty scales with the current wave: `10 × waveNumber`
  (wave 1 = 10, wave 2 = 20, … wave 25 = 250). Player death is never itself a
  loss condition; only the objective reaching 0 HP ends the run.
- Can place a limited number of turrets/traps within a build radius of their
  *current position* (limit increases via upgrades) — see §5.
- **Build Mode**: toggled with a dedicated key (**B**). Movement and aiming
  still work while it's active, but left-click places the currently
  selected turret type instead of firing the equipped weapon, and the
  number keys select *which turret type* to place instead of switching
  weapons. Right-click or **Esc** exits Build Mode without placing anything;
  placing a turret does not exit it, so multiple turrets can be placed
  without re-toggling. The build-radius ring (§10) is only ever drawn while
  Build Mode is active — it's invisible during normal play.

## 4. Weapons

- Player carries one equipped weapon at a time, switchable from an inventory
  of unlocked/purchased weapons.
- Each weapon has: damage, fire rate, range, ammo/reload behavior (if any),
  a purchase cost, and an `automatic` flag (hold-to-fire vs. click-per-shot
  — see §3).
- Starting weapon is available for free at wave 1.
- Weapons are bought with currency (see §7) — no fixed unlock progression.

## 5. Turrets / traps

- Placed while in **Build Mode** (§3) at chosen map positions within a build
  radius **of the player's current position** — not a fixed zone around the
  objective. The radius moves with the player, so defending a different
  part of the map means walking there first. Default radius: **200px**, as
  a single tunable constant — adjust once it's visible in-game and screen
  sizes are known; not derived from anything else.
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

### 5.1 Counter-design: each turret answers a behavior

Per pillar 3 (§1.1), turret types are **not** a power ladder where each
unlock is a strictly better gun. Each is designed to answer a specific enemy
behavior from §8, so every unlock changes *how* you defend rather than just
raising your damage numbers:

| Turret | Unlocks | Answers | Why it works |
|---|---|---|---|
| **Cannon** | Wave 1 | Shambler packs | Splash punishes the tight clusters that objective-priority zombies naturally form as they converge on one point. |
| **Frost** | Wave 6 | Stalkers | Slow negates the speed advantage that makes player-hunters hard to escape, buying room to reposition. |
| **Flame** | Wave 11 | Breakers | Breakers stop and attack a turret rather than moving through. Persistent area DoT placed among your turret cluster punishes exactly that camping. |
| **Machine Gun** | Wave 16 | Bosses | Sustained single-target DPS is dead weight against hordes but the right answer to one high-HP target — which is why it lands right before the wave-20 and 25 bosses. |

Two constraints follow from this and should hold as stats get tuned:

- **The counter turret unlocks exactly one wave before its target enemy
  first appears** (§8.1). The player therefore gets one full shop
  intermission to buy and place the answer before the new threat arrives —
  the unlock *telegraphs* the problem rather than reacting to it. Two
  deliberate exceptions are documented in §8.1: Shambler and the bosses.
- **No turret should be strictly better than an earlier one.** If Machine
  Gun ends up simply outperforming Cannon against crowds, the counter design
  has collapsed into a power ladder and the stats need revisiting.

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
- Currency is spent on **weapons and upgrades** via the shop/menu, available
  only between waves (§6).
- **Turrets are the exception**: they are bought *by placing them* in Build
  Mode (§3), which works during a wave as well as between waves, and the
  cost is deducted at placement. Build Mode's spec — movement and aiming
  stay live, click places instead of firing — only makes sense in-world, so
  routing turret purchases through the between-waves shop would contradict
  it. Placement is still refused, with an on-screen reason, when the player
  can't afford it, is outside the build radius, or is at the turret cap.
- No other currency sources planned initially (no passive income).

## 8. Zombies

Each zombie type has a **priority target** — what it heads for first — rather
than every zombie uniformly beelining for the objective. Proposed starter
roster (editable):

- **Shambler** — *from wave 1.* Objective-priority. Baseline HP/speed,
  ignores the player and turrets unless they're directly blocking its path;
  heads straight for the objective.
- **Stalker** — *from wave 7.* Player-priority. Faster, lower HP; actively
  paths toward and attacks the player. Falls back to Objective-priority
  behavior if the player is unreachable or out of its aggro range.
- **Breaker** — *from wave 12.* Turret-priority. Higher damage against
  structures; paths toward the nearest placed turret and attacks it. Falls
  back to Objective-priority behavior if no turrets are currently placed.
- **Boss** — one per boss wave (see §9). Turret-priority: destroys placed
  turrets first, then falls back to Objective-priority once no turrets
  remain (same fallback rule as Breaker). In addition, every boss has a
  **secondary attack** — a circular area attack centered on the boss
  (radius varies per boss), which:
  - **Triggers** only when the player is inside the radius *and* has clear
    line of sight to the boss. Placed turrets block the line; nothing else
    currently can, since there's no terrain/obstacle system. Turrets
    therefore double as cover, which reinforces pillar 1 (§1.1).
  - **Winds up before firing**, showing an expanding warning ring for the
    boss's windup duration. The radius is re-checked at detonation, so
    walking out of the ring during the windup avoids the hit entirely —
    this is the skill the wave-5 boss exists to teach.
  - **Damages placed turrets as well as the player**, not the player alone.
    Turrets being destructible by the area attack is what makes the wave-10
    chain mechanic (§9.1) possible and keeps every later boss threatening
    to a defense the player has walked away from.
  - Fires on a cooldown, not continuously.

  Each of the 5 bosses is a distinct design (see §9.1) with its own radius,
  damage, cooldown, and signature mechanic; the turret-first-then-objective
  pattern and the proximity-plus-line-of-sight-plus-windup gate are what all
  5 share.

All zombies still deal contact damage to the objective if they reach it,
regardless of type. Zombie stats scale up as waves progress (see §9).

### 8.1 Introduction waves

Each zombie type first appears **one wave after its counter turret unlocks**
(§5.1), so the player gets exactly one shop intermission to buy and place
the answer before the threat arrives:

| Type | Counter turret unlocks | First appears |
|---|---|---|
| Shambler | Cannon, wave 1 | Wave 1 — *exception, see below* |
| Stalker | Frost, wave 6 | Wave 7 |
| Breaker | Flame, wave 11 | Wave 12 |
| Boss | Machine Gun, wave 16 | Waves 5/10/15/20/25 — *exception, see below* |

Once introduced, a type stays in the spawn pool for every subsequent wave —
introduction waves add variety, they don't replace earlier types.

Two deliberate exceptions to the one-wave-after rule:

- **Shambler appears on wave 1**, the same wave Cannon unlocks, not wave 2 —
  it's the baseline enemy, and delaying it would leave wave 1 with nothing
  to fight.
- **Bosses follow their own fixed 5/10/15/20/25 cadence** (§9), which is
  locked and predates this rule. Machine Gun is therefore *not* the answer
  to the first boss; it's aimed specifically at the wave-20 DPS check and
  the wave-25 finale (§9.1). The earlier bosses are meant to be beaten with
  the turret roster available at the time.

## 9. Wave system

- Waves are discrete: a wave ends only when every entity spawned in it is
  dead — no time limit. A shop/upgrade interval (hard pause, see §6) opens
  before the next wave starts.
- Difficulty increases with wave number via more zombies per wave, higher
  zombie HP/damage/speed, and new zombie types entering the spawn pool at
  their introduction waves (§8.1).
- **Boss waves** occur every 5th wave (5, 10, 15, 20, 25). A boss wave
  replaces the normal spawn with a single boss enemy. **All 5 bosses are
  distinct designs** (not one boss reused with scaled stats), with overall
  difficulty increasing from the wave 5 boss through the wave 25 boss. Each
  shares the turret-priority/secondary-attack pattern described in §8, but
  stats and the specific secondary attack differ per boss — exact per-boss
  kits TBD, see Open Questions.
- **Max wave is 25 (for now)** — clearing wave 25's boss wins the run.

### 9.1 Boss variety is a headline feature

Per pillar 4 (§1.1), **"5 bosses, 5 different fights"** is a marketing line,
not just an internal design note — almost nothing in the surveyed field
advertises boss variety at all. That only holds if each boss genuinely plays
differently, so the design rule is:

> **Each boss stresses a different one of the player's systems.** A boss
> that is merely "the last one with bigger numbers" fails this rule and
> should be redesigned rather than re-tuned.

**Decided.** Each boss's role below is settled design, not a proposal — the
numbers realizing each role are still to be tuned (§15), but *which system
each boss stresses* is fixed, and a boss whose stats stop delivering its
assigned pressure gets re-tuned until it does, rather than reassigned:

| Wave | Stresses | Signature mechanic |
|---|---|---|
| 5 | Learning the pattern | **Telegraphed Slam.** Long windup, generous cooldown, low damage. Teaches all three things later bosses assume you know: bosses eat turrets first, a ring means danger, and you can walk out of it. Must be survivable with only Cannon. |
| 10 | Turret spacing | **Chain Detonation.** When its area attack destroys a turret, that turret explodes and can chain to any turret within the chain radius. A tight cluster cascades and the whole line dies at once; spread placement breaks the chain. Clustering doesn't merely take damage — it turns the player's own defense into the weapon. |
| 15 | Positioning | **Leap Advance.** Instead of walking between targets it periodically leaps across the map to its next turret target, so spread turrets no longer buy travel time. Still turret-priority; what kills you is being far from wherever it lands. |
| 20 | Sustained DPS | **Regeneration.** Heals steadily after a short window with no damage taken, so chip damage can never out-pace it. This is what makes it a damage *check* rather than an HP *sponge*, and it's why Machine Gun unlocks four waves earlier (§5.1). |
| 25 | All of it | **Phase Shifts + Adds.** Cycles the previous four mechanics as its HP drops — slam → chain → leap → regen — announcing each phase, and spawns Shambler/Stalker/Breaker adds so the horde and the boss have to be handled together. Assumes the full turret roster. |

The shared elements (turret-priority then objective, proximity-plus-line-of-
sight secondary attack) stay constant across all 5 per §8 — the *variety*
lives in stats, secondary-attack shape, and which system each pressures.

## 10. UI / HUD

- Objective HP bar (always visible).
- Player HP bar.
- Currency count.
- Current wave number (out of 25) and progress within the current wave.
- Weapon/turret selection UI, with cost and stats shown before purchase —
  locked turret types (Frost, Flame, Machine Gun before their unlock wave)
  shown but disabled, with the unlock wave indicated.
- Equipped-weapon indicator showing its number-key hotkey (hidden while
  Build Mode is active, replaced by the selected-turret-type indicator).
- Build-radius ring around the player, and a placement preview (ghost
  turret at the cursor, styled valid/invalid) — both drawn **only while
  Build Mode is active** (§3), never during normal play.
- **Turret-under-threat cue** — see §10.1.
- Boss-wave indicator/warning before a boss wave starts.

### 10.1 Making the core tension legible

Pillars 1 and 2 (§1.1) only land if the player *feels* the tradeoff. Left
purely emergent, the failure case is invisible: the player walks off to
fight, a Breaker eats a turret somewhere behind them, and all they notice is
that a turret is missing later — a punishment with no readable cause and no
decision point.

So the turret-vs-player tension must be surfaced directly:

- When a turret-priority enemy (Breaker, or a boss) is actively targeting a
  placed turret, that turret shows a **threat indicator**, and the turret's
  HP bar becomes visible while it is under attack.
- If the threatened turret is far from the player, show a **directional
  marker** pointing toward it, so the player can choose to respond or
  deliberately write it off.
- The cue must be readable at a glance during combat, and must not require
  the player to be looking at that part of the screen already.

The intent is that abandoning a turret is always a *choice the player made*,
never something they simply failed to notice.

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

## 13. Deployment target

**itch.io**, played in-browser (HTML5 embed) — not a downloadable native
build. This has concrete architectural consequences:

- itch.io never serves a game from a domain root; it hosts each upload under
  its own path. Any build tooling must emit **relative** asset paths, not
  absolute ones (`/assets/...`), or every asset 404s once uploaded.
  `vite.config.js` sets `base: './'` for exactly this reason — verified by
  building and serving `dist/` from a nested path
  (`scripts/verify-itch-build.mjs`); do not remove that config.
- Static output only — everything ships as files in `dist/`, no server-side
  code. This is already true of the whole architecture (no backend planned),
  so nothing else changes here.
- **Upload checklist**: `npm run build` → zip the *contents* of `dist/`
  (`index.html` and `assets/` at the zip root, not inside a wrapping folder)
  → upload as a new file on the itch.io project page → mark it "This file
  will be played in the browser" → set kind to "HTML".
- **Known caveat**: itch.io embeds the game in an iframe served from its own
  subdomain, not the itch.io page's own origin. `localStorage` (used for
  Persistence, §12) works there in most browsers, but some browsers restrict
  or clear storage for iframed content more aggressively than for top-level
  pages (e.g. Safari's tracking prevention). Resume-after-refresh should
  degrade gracefully — start a fresh run rather than error — if a saved
  state can't be read back, rather than assuming storage is always
  reliable.
- No mobile/touch requirement (see §14) means no itch.io mobile-friendly
  toggle is needed; assume desktop browser + keyboard/mouse.

## 14. Out of scope (for now)

- Multiplayer/co-op.
- Meta-progression between runs (persistent unlocks across sessions).
- Mobile/touch controls.

## 15. Open questions

- **Numbers only** for the 5 bosses — HP, movement speed, and each one's
  secondary-attack radius/damage/cooldown (wave 5, 10, 15, 20, 25). The
  shared pattern (§8) and each boss's assigned role (§9.1) are both locked;
  what remains is tuning stats until each boss actually delivers its
  assigned pressure. Tune, don't reassign.
- Whether the §10.1 threat cue should also fire when the *objective* is
  under attack, or whether the objective's always-visible HP bar is
  sufficient signal on its own.
