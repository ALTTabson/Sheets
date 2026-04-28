/* data.js — Engine Database + skill mappings + i18n */

/**
 * @typedef {{ name: string, level: number, subclass: string }} CharacterClass
 *
 * @typedef {Object} CharacterMeta
 * @property {string} name
 * @property {string} player
 * @property {string} race
 * @property {CharacterClass[]} classes
 * @property {number} level
 * @property {string} background
 * @property {string} alignment
 * @property {number} xp
 */

/**
 * @typedef {Object} HitPoints
 * @property {number} max
 * @property {number} current
 * @property {number} temp
 * @property {{ success: number, fail: number }} deathSaves
 */

/**
 * @typedef {Object} Resource
 * @property {number} max
 * @property {number} current
 * @property {"longRest"|"shortRest"} resetsOn
 * @property {string} label
 * @property {string|null} die
 * @property {string} icon
 */

/**
 * @typedef {Object} Character
 * @property {string} id
 * @property {CharacterMeta} meta
 * @property {Object<string, number>} abilities  STR/DEX/CON/INT/WIS/CHA scores
 * @property {number} profBonus
 * @property {Object} proficiencies
 * @property {HitPoints} hp
 * @property {{ base: number }} ac
 * @property {{ walk: number }} speed
 * @property {Object} status
 * @property {Object} actionEconomy
 * @property {Object<string, Resource>} resources
 * @property {Object} features
 * @property {Object[]} inventory
 * @property {Object} currency
 * @property {Object} encumbrance
 * @property {Object} story
 * @property {Object|null} spells
 * @property {Object} [tweaks]
 */

/** @type {Character[]} */
const DATABASE = [
  {
    id: "eustaquio",
    meta: {
      name: "Eustáquio Provenza",
      player: "Pedro",
      race: "Hobgoblin",
      classes: [
        { name: "Bárbaro", level: 6, subclass: "Caminho do Totem (Urso)" },
        { name: "Guerreiro", level: 2, subclass: "—" }
      ],
      level: 8,
      background: "Exilado / Pária",
      alignment: "Caótico Bom",
      xp: 0,
      portrait: "assets/eustaquio.png"
    },
    physical: {
      age: "37",
      height: "2,10 m",
      weight: "138 kg",
      eyes: "Âmbar",
      skin: "Azul-acinzentado",
      hair: "Negro, trançado"
    },
    abilities: { STR: 18, DEX: 14, CON: 16, INT: 8, WIS: 12, CHA: 8 },
    profBonus: 3,
    proficiencies: {
      saves: ["STR", "CON"],
      skills: ["acrobatics", "athletics", "perception", "survival"],
      expertise: [],
      armor: ["Leve", "Média", "Pesada", "Escudos"],
      weapons: ["Simples", "Marciais"],
      languages: ["Comum", "Goblin"]
    },
    hp: {
      max: 90, current: 30, temp: 0,
      hitDice: { d12: { max: 6, current: 6 }, d10: { max: 2, current: 2 } },
      deathSaves: { success: 0, fail: 0 },
      notes: "Base 82 + 8 (Machado Mortal: +1 PV/nível)"
    },
    ac: { base: 15, notes: "Defesa Desarmada: 10 + DES + CON" },
    initiative: { base: "DEX" },
    speed: { walk: 40, notes: "+10 ft (Movimento Rápido)" },
    status: {
      inspiration: false, raging: false, recklessAttack: false,
      blessed: false, hasted: false, exhaustion: 0, conditions: []
    },
    actionEconomy: { action: true, bonus: true, reaction: true, movement: 40 },
    resources: {
      rage: { max: 4, current: 4, resetsOn: "longRest", label: "Fúria", die: null, icon: "flame" },
      secondWind: { max: 1, current: 1, resetsOn: "shortRest", label: "Segundo Fôlego", die: "1d10+2", icon: "wind" },
      actionSurge: { max: 1, current: 1, resetsOn: "shortRest", label: "Surto de Ação", die: null, icon: "bolt" }
    },
    features: {
      actions: [
        { id: "extraAttack", name: "Ataque Extra", desc: "Ataque duas vezes ao usar a ação de Ataque." },
        { id: "machadoMortal", name: "Machado Mortal", attack: "+8", damage: "1d12+5", damageType: "cortante", rageBonus: "+2", desc: "Ataque corpo-a-corpo principal." },
        { id: "gwmAllIn", name: "GWM: All In", desc: "-5 ataque para +10 de dano." },
        { id: "recklessAttack", name: "Ataque Imprudente", desc: "Vantagem em ataques de FOR; inimigos têm vantagem contra você." },
        { id: "actionSurge", name: "Surto de Ação", desc: "Uma ação adicional (1x por Descanso Curto).", resource: "actionSurge" },
        { id: "senseBeasts", name: "Sentir Bestas / Falar com Animais", desc: "Conjuração via ritual." }
      ],
      bonusActions: [
        { id: "gwmBonus", name: "GWM: Ataque Bônus", desc: "Ao crítico ou matar, realize um ataque corpo-a-corpo bônus." },
        { id: "rage", name: "Fúria", desc: "Resistência bruta (Urso: tudo exceto psíquico), +2 dano FOR.", resource: "rage", toggles: "raging" },
        { id: "secondWind", name: "Segundo Fôlego", desc: "Recupere 1d10+2 PV.", resource: "secondWind" }
      ],
      reactions: [
        { id: "dangerSense", name: "Sentido de Perigo", desc: "Vantagem em testes de DES contra efeitos visíveis." }
      ],
      passives: [
        { id: "gwfStyle", name: "Combate com Arma Pesada", desc: "Re-role dados de dano que saírem 1 ou 2 (uma vez por rolagem)." },
        { id: "bearTotem", name: "Espírito Totêmico (Urso)", desc: "Em fúria: resistência a TODOS os danos exceto psíquico." },
        { id: "bearAspect", name: "Aspecto da Besta (Urso)", desc: "Capacidade de carga duplicada; vantagem em empurrar/quebrar." },
        { id: "fastMovement", name: "Movimento Rápido", desc: "+10 ft de deslocamento (sem armadura pesada)." }
      ]
    },
    inventory: [
      { name: "Machado Mortal", qty: 1, weight: 7, equipped: true, notes: "1d12 +1 atq/dano, +1 PV máx por nível." },
      { name: "Papel de Códigos", qty: 1, weight: 0, equipped: false, notes: "" },
      { name: "Figurine of Wondrous Power", qty: 1, weight: 1, equipped: false, notes: "Coruja Prateada" },
      { name: "Berimbau", qty: 1, weight: 3, equipped: false, notes: "Instrumento musical" },
      { name: "Armadilha de Caça", qty: 1, weight: 25, equipped: false, notes: "" },
      { name: "Roupas de Viajante", qty: 1, weight: 4, equipped: true, notes: "" },
      { name: "Mochila", qty: 1, weight: 5, equipped: true, notes: "" },
      { name: "Bolsa de Cinto", qty: 1, weight: 1, equipped: true, notes: "" }
    ],
    currency: { cp: 0, sp: 0, ep: 0, gp: 260, pp: 0 },
    encumbrance: { light: 90, heavy: 180, max: 270, notes: "Aspecto do Urso: dobrado" },
    story: {
      backstory: "Exilado das hostes hobgoblins por se recusar a executar prisioneiros, Eustáquio caminha pelos vales com seu Machado Mortal e um berimbau improvisado. Carrega papéis cifrados de uma rede que ainda não compreende.",
      bonds: "Devolver os códigos a quem souber lê-los — sem perguntas.",
      ideals: "Honra acima da obediência. Força a serviço dos sem-voz.",
      flaws: "Confunde silêncio com julgamento; reage com punhos quando lhe falta resposta.",
      personality: "Curioso sob a casca dura. Toca berimbau ao acampar. Conta verdades enviesadas."
    },
    spells: null,
    tweaks: {
      palette: "forest",
      characterTint: "barbarian"
    }
  },
  {
    id: "connor",
    meta: {
      name: "Connor Armstrong",
      player: "Jogador",
      race: "Custom Half-Elf",
      classes: [
        { name: "Wizard", level: 8, subclass: "Chronurgy" }
      ],
      level: 8,
      background: "Fazer Manutenção",
      alignment: "Neutro Bom",
      xp: 40000,
      portrait: "assets/connor.png"
    },
    physical: {
      age: "Desconhecida",
      height: "1,75 m",
      weight: "70 kg",
      eyes: "Azuis (relógio)",
      skin: "Pálida",
      hair: "Loiro, curto"
    },
    abilities: { STR: 8, DEX: 14, CON: 14, INT: 20, WIS: 12, CHA: 8 },
    profBonus: 3,
    proficiencies: {
      saves: ["INT", "WIS"],
      skills: ["arcana", "history", "investigation", "perception", "sleightOfHand"],
      expertise: [],
      armor: [],
      weapons: ["Dagger", "Dart", "Sling", "Quarterstaff", "Light Crossbow", "Longsword", "Shortsword", "Shortbow", "Longbow"],
      languages: ["Common", "Elvish", "Dwarvish", "Draconic", "Giant", "Deep Speech", "Druidic"]
    },
    hp: {
      max: 50, current: 50, temp: 0,
      hitDice: { d6: { max: 8, current: 8 } },
      deathSaves: { success: 0, fail: 0 },
      notes: "Caster HP"
    },
    ac: { base: 12, notes: "10 + DES" },
    initiative: { base: "DEX", modifiers: ["INT"] },
    speed: { walk: 30, notes: "" },
    status: {
      inspiration: false, raging: false, recklessAttack: false,
      blessed: false, hasted: false, exhaustion: 0, conditions: []
    },
    actionEconomy: { action: true, bonus: true, reaction: true, movement: 30 },
    resources: {
      chronalShift: { max: 2, current: 2, resetsOn: "longRest", label: "Chronal Shift", die: null, icon: "clock" },
      momentaryStasis: { max: 5, current: 5, resetsOn: "longRest", label: "Momentary Stasis", die: null, icon: "eye" }
    },
    features: {
      actions: [
        { id: "dagger", name: "Dagger", attack: "+5", damage: "1d4+2", damageType: "piercing", desc: "Finesse, Light, Thrown (20/60)" },
        { id: "momentaryStasis", name: "Momentary Stasis", desc: "Como ação, force uma criatura Grande ou menor a fazer um teste de Resistência de CON. Se falhar, fica Incapacitada e seu deslocamento é 0 até o final do seu próximo turno. Usos: INT mod (5) / longo.", resource: "momentaryStasis" }
      ],
      bonusActions: [
        { id: "telekinetic", name: "Telekinetic Shove", desc: "Mover criatura 5ft (Força save vs CD Magia)." }
      ],
      reactions: [
        { id: "chronalShift", name: "Chronal Shift", desc: "Forçar re-rolagem depois do dado, mas antes do resultado. (2 usos / descanso longo)", resource: "chronalShift" }
      ],
      passives: [
        { id: "tacticalWit", name: "Tactical Wit", desc: "Adiciona bônus de Inteligência à rolagem de Iniciativa." },
        { id: "arcaneRecovery", name: "Recuperação Arcana", desc: "Recupera slots iguais a metade do nível de mago arredondado pra cima (4) num descanso curto." }
      ]
    },
    inventory: [
      { name: "Dagger", qty: 2, weight: 1, equipped: true, notes: "Arma leve" },
      { name: "Coroa de Ossos", qty: 1, weight: 2, equipped: false, notes: "" },
      { name: "Perna de Pau", qty: 1, weight: 4, equipped: false, notes: "" },
      { name: "Óculos de Identificar", qty: 1, weight: 0.5, equipped: true, notes: "" },
      { name: "Braço Novo", qty: 1, weight: 5, equipped: false, notes: "" }
    ],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    encumbrance: { light: 40, heavy: 80, max: 120, notes: "" },
    story: {
      backstory: "Wizard of Time.",
      bonds: "",
      ideals: "",
      flaws: "",
      personality: ""
    },
    spells: {
      system: "points",
      points: { max: 44, current: 44 },
      castingAbility: "INT",
      slots: {
        1: { max: 4, current: 4 },
        2: { max: 3, current: 3 },
        3: { max: 3, current: 3 },
        4: { max: 2, current: 2 }
      },
      known: window.COMPENDIUM.spells
    },
    tweaks: {
      palette: "midnight",
      characterTint: "wizard"
    }
  }
];

const SKILLS = {
  acrobatics: "DEX", animalHandling: "WIS", arcana: "INT",
  athletics: "STR", deception: "CHA", history: "INT",
  insight: "WIS", intimidation: "CHA", investigation: "INT",
  medicine: "WIS", nature: "INT", perception: "WIS",
  performance: "CHA", persuasion: "CHA", religion: "INT",
  sleightOfHand: "DEX", stealth: "DEX", survival: "WIS",
};

const I18N_PT = {
  abilities: { STR: "FOR", DEX: "DES", CON: "CON", INT: "INT", WIS: "SAB", CHA: "CAR" },
  abilitiesLong: { STR: "Força", DEX: "Destreza", CON: "Constituição", INT: "Inteligência", WIS: "Sabedoria", CHA: "Carisma" },
  skills: {
    acrobatics: "Acrobacia", animalHandling: "Lidar com Animais", arcana: "Arcanismo",
    athletics: "Atletismo", deception: "Enganação", history: "História",
    insight: "Intuição", intimidation: "Intimidação", investigation: "Investigação",
    medicine: "Medicina", nature: "Natureza", perception: "Percepção",
    performance: "Atuação", persuasion: "Persuasão", religion: "Religião",
    sleightOfHand: "Prestidigitação", stealth: "Furtividade", survival: "Sobrevivência",
  }
};

/** @param {number} s @returns {number} */
const abilityMod = (s) => Math.floor((s - 10) / 2);

/** @param {number} m @returns {string} */
const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);

Object.assign(window, { DATABASE, SKILLS, I18N_PT, abilityMod, fmtMod });
