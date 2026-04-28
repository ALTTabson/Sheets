// rules/srd5e.js — RAW 5e derivations.
// Pure functions: no DOM, no I/O. Given a state object, return derived values.
// Designed to be called from recalc() together with effects.js.

export const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

// Skill → ability mapping (IDs used in proficiencies.skills).
export const SKILLS = {
  acrobatics:     "DEX", animalHandling: "WIS", arcana:         "INT",
  athletics:      "STR", deception:      "CHA", history:        "INT",
  insight:        "WIS", intimidation:   "CHA", investigation:  "INT",
  medicine:       "WIS", nature:         "INT", perception:     "WIS",
  performance:    "CHA", persuasion:     "CHA", religion:       "INT",
  sleightOfHand:  "DEX", stealth:        "DEX", survival:       "WIS",
};

// Labels for the PT/EN layer (used by i18n files to translate keys consistently).
export const SKILL_LABELS_EN = {
  acrobatics: "Acrobatics", animalHandling: "Animal Handling", arcana: "Arcana",
  athletics: "Athletics", deception: "Deception", history: "History",
  insight: "Insight", intimidation: "Intimidation", investigation: "Investigation",
  medicine: "Medicine", nature: "Nature", perception: "Perception",
  performance: "Performance", persuasion: "Persuasion", religion: "Religion",
  sleightOfHand: "Sleight of Hand", stealth: "Stealth", survival: "Survival",
};

export function abilityMod(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * baseDerive(state) — pure, no effects merged in yet.
 * Returns the "RAW" derived block; effects.js layers on top of this.
 */
export function baseDerive(state) {
  const mods = {};
  for (const a of ABILITIES) mods[a] = abilityMod(state.abilities[a]);

  const prof = state.profBonus ?? proficiencyByLevel(state.meta?.level ?? 1);

  const saves = {};
  for (const a of ABILITIES) {
    saves[a] = mods[a] + (state.proficiencies.saves.includes(a) ? prof : 0);
  }

  const skills = {};
  for (const [id, abil] of Object.entries(SKILLS)) {
    const isProf = state.proficiencies.skills.includes(id);
    const isExp  = state.proficiencies.expertise.includes(id);
    const bonus  = (isExp ? 2 * prof : isProf ? prof : 0);
    skills[id] = { ability: abil, bonus: mods[abil] + bonus, proficient: isProf, expert: isExp };
  }

  const passivePerception = 10 + skills.perception.bonus;

  const initiative = (state.initiative ?? mods.DEX);

  // AC: honor explicit base if set (matches sheet "CA 15" without armor).
  const ac = state.ac?.base ?? (10 + mods.DEX);

  return {
    mods,
    prof,
    saves,
    skills,
    passivePerception,
    initiative,
    ac,
    // lists populated by effects layer:
    advantage:    { checks: [], saves: [], attacks: [] },
    disadvantage: { checks: [], saves: [], attacks: [] },
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    damageBonus: { melee: 0, ranged: 0, spell: 0 },
    attackBonus: { melee: 0, ranged: 0, spell: 0 },
    extraDice:   { attack: [], save: [], check: [], damage: [] }, // e.g. ["1d4"] from Bless
    speedMult: 1,
    tags: [],
  };
}

export function proficiencyByLevel(lvl) {
  if (lvl >= 17) return 6;
  if (lvl >= 13) return 5;
  if (lvl >= 9)  return 4;
  if (lvl >= 5)  return 3;
  return 2;
}

/** Hit-dice spend: d10/d12 standard 5e rules — no CON mod is added here; caller adds it. */
export function formatMod(n) { return (n >= 0 ? "+" : "") + n; }

/** Dice parser for simple NdM+K forms. Returns {n, sides, flat}. */
export function parseDice(expr) {
  const m = /^\s*(\d+)d(\d+)\s*([+-]\s*\d+)?\s*$/i.exec(expr);
  if (!m) return null;
  return { n: +m[1], sides: +m[2], flat: m[3] ? +m[3].replace(/\s+/g, "") : 0 };
}

/** Deterministic-friendly RNG seam for tests: pass rng()→[0,1). */
export function rollDie(sides, rng = Math.random) {
  return 1 + Math.floor(rng() * sides);
}

export function roll(expr, { rng = Math.random, advantage = false, disadvantage = false } = {}) {
  const d = parseDice(expr);
  if (!d) throw new Error("Bad dice expr: " + expr);
  let rolls = [];
  for (let i = 0; i < d.n; i++) rolls.push(rollDie(d.sides, rng));
  // advantage/disadvantage only meaningful for 1d20
  if (d.n === 1 && d.sides === 20 && (advantage || disadvantage) && !(advantage && disadvantage)) {
    const second = rollDie(20, rng);
    rolls = [advantage ? Math.max(rolls[0], second) : Math.min(rolls[0], second)];
  }
  const total = rolls.reduce((a, b) => a + b, 0) + d.flat;
  return { rolls, flat: d.flat, total, expr };
}
