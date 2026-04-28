window.COMPENDIUM = window.COMPENDIUM || {};

// Identificadores de edição usados em todo o compêndio:
//   "manual"     — Magia/item adicionado à mão pela mesa (sempre visível)
//   "PHB_2014"   — Player's Handbook 2014 (5e clássico, SRD 5.1)
//   "XPHB_2024"  — Player's Handbook 2024 (One D&D, SRD 5.2)
// O CompendiumBrowser usa esses valores para filtrar por edição.

// Magias manuais da mesa (source: "manual" = sempre visíveis, independente do filtro de edição)
window.COMPENDIUM.spells = [
  // Cantrips
  { id: "shapeWater", name: "Moldar Água", level: 0, school: "Transmutação", time: "1 ação", range: "30 pés", components: "S", duration: "Instantâneo ou 1 hora", desc: "Você escolhe uma área de água não ocupada que você possa ver e pode manipulá-la (mover, mudar cor, congelar, etc)." },
  { id: "mindSliver", name: "Lasca Mental", level: 0, school: "Encantamento", time: "1 ação", range: "60 pés", components: "V", duration: "1 rodada", desc: "Alvo sofre 1d6 de dano psíquico (Salva INT) e subtrai 1d4 do próximo teste de resistência." },
  { id: "tollTheDead", name: "Dobrar dos Mortos", level: 0, school: "Necromancia", time: "1 ação", range: "60 pés", components: "V, S", duration: "Instantâneo", desc: "Salva WIS ou sofre 1d8 de dano necrótico (ou 1d12 se já estiver ferido)." },
  { id: "fireBolt", name: "Raio de Fogo", level: 0, school: "Evocação", time: "1 ação", range: "120 pés", components: "V, S", duration: "Instantâneo", desc: "Ataque à distância, 1d10 de dano de fogo." },
  { id: "mageHand", name: "Mão Mágica", level: 0, school: "Conjuração", time: "1 ação", range: "30 pés", components: "V, S", duration: "1 minuto", desc: "Cria uma mão espectral que pode manipular objetos até 10 libras." },
  { id: "message", name: "Mensagem", level: 0, school: "Transmutação", time: "1 ação", range: "120 pés", components: "V, S, M", duration: "1 rodada", desc: "Você aponta para uma criatura e sussurra uma mensagem, e apenas ela ouve, podendo responder aos sussurros." },

  // Nível 1
  { id: "silveryBarbs", name: "Farpas Prateadas", level: 1, school: "Encantamento", time: "1 reação", range: "60 pés", components: "V", duration: "Instantâneo", desc: "Força uma criatura a rolar novamente um ataque/teste/salva e usar o menor. Dá vantagem a outra criatura." },
  { id: "shield", name: "Escudo Arcano", level: 1, school: "Abjuração", time: "1 reação", range: "Pessoal", components: "V, S", duration: "1 rodada", desc: "+5 na CA e imunidade a Mísseis Mágicos até seu próximo turno." },
  { id: "sleep", name: "Sono", level: 1, school: "Encantamento", time: "1 ação", range: "90 pés", components: "V, S, M", duration: "1 minuto", desc: "Rola 5d8; criaturas são postas para dormir baseado em seus PVs máximos." },
  { id: "magicMissile", name: "Mísseis Mágicos", level: 1, school: "Evocação", time: "1 ação", range: "120 pés", components: "V, S", duration: "Instantâneo", desc: "Cria 3 dardos que dão 1d4+1 dano de força cada (acerto automático)." },
  { id: "mageArmor", name: "Armadura Arcana", level: 1, school: "Abjuração", time: "1 ação", range: "Toque", components: "V, S, M", duration: "8 horas", desc: "A CA do alvo sem armadura vira 13 + Mod. Destreza." },
  { id: "findFamiliar", name: "Encontrar Familiar", level: 1, school: "Conjuração", time: "1 hora", range: "10 pés", components: "V, S, M", duration: "Instantâneo", ritual: true, desc: "Convoca um espírito na forma de um animal para te servir como familiar." },
  { id: "comprehendLanguages", name: "Compreender Idiomas", level: 1, school: "Adivinhação", time: "1 ação", range: "Pessoal", components: "V, S, M", duration: "1 hora", ritual: true, desc: "Você entende qualquer linguagem falada ou escrita que você tocar." },
  { id: "absorbElements", name: "Absorver Elementos", level: 1, school: "Abjuração", time: "1 reação", range: "Pessoal", components: "S", duration: "1 rodada", desc: "Resistência a dano elementar no ataque desencadeador, e seu próximo ataque corpo-a-corpo causa 1d6 extra do mesmo tipo." },
  { id: "charmPerson", name: "Enfeitiçar Pessoa", level: 1, school: "Encantamento", time: "1 ação", range: "30 pés", components: "V, S", duration: "1 hora", desc: "Salva WIS ou a criatura é enfeitiçada por você (vantagem se estiver lutando contra você)." },
  { id: "featherFall", name: "Queda Suave", level: 1, school: "Transmutação", time: "1 reação", range: "60 pés", components: "V, M", duration: "1 minuto", desc: "Até 5 criaturas caindo diminuem a velocidade de queda (evita dano de queda)." },
  { id: "identify", name: "Identificar", level: 1, school: "Adivinhação", time: "1 minuto", range: "Toque", components: "V, S, M", duration: "Instantâneo", ritual: true, desc: "Identifica propriedades de objetos mágicos." },

  // Nível 2
  { id: "mistyStep", name: "Passo Nebuloso", level: 2, school: "Conjuração", time: "1 ação bônus", range: "Pessoal", components: "V", duration: "Instantâneo", desc: "Você se teleporta até 30 pés para um espaço desocupado que possa ver." },
  { id: "scorchingRay", name: "Raio Ardente", level: 2, school: "Evocação", time: "1 ação", range: "120 pés", components: "V, S", duration: "Instantâneo", desc: "Você dispara 3 raios (ataques à distância), cada um causando 2d6 de dano de fogo." },
  { id: "detectThoughts", name: "Detectar Pensamentos", level: 2, school: "Adivinhação", time: "1 ação", range: "Pessoal", components: "V, S, M", duration: "Concentração, até 1 min", desc: "Lê a mente de criaturas; salva WIS para forçar sondagem profunda." },
  { id: "darkness", name: "Escuridão", level: 2, school: "Evocação", time: "1 ação", range: "60 pés", components: "V, M", duration: "Concentração, até 10 min", desc: "Cria escuridão mágica de 15 pés de raio (visão no escuro não enxerga através)." },
  { id: "web", name: "Teia", level: 2, school: "Conjuração", time: "1 ação", range: "60 pés", components: "V, S, M", duration: "Concentração, até 1 hora", desc: "Criaturas na área (ou que entrarem) devem passar Salva DEX ou ficam Restringidas." },
  { id: "shatter", name: "Despedaçar", level: 2, school: "Evocação", time: "1 ação", range: "60 pés", components: "V, S, M", duration: "Instantâneo", desc: "Raio de 10 pés. Salva CON ou 3d8 dano trovejante (vantagem a alvos inorgânicos)." },
  { id: "enhanceAbility", name: "Aprimorar Habilidade", level: 2, school: "Transmutação", time: "1 ação", range: "Toque", components: "V, S, M", duration: "Concentração, até 1 hora", desc: "Alvo ganha vantagem em testes de um atributo escolhido (e possivelmente PV temp)." },
  { id: "knock", name: "Arrombar", level: 2, school: "Transmutação", time: "1 ação", range: "60 pés", components: "V", duration: "Instantâneo", desc: "Abre fechaduras, cadeados ou correntes normais ou mágicas (faz barulho alto)." },
  { id: "jimsMagicMissile", name: "Míssil Mágico de Jim", level: 2, school: "Evocação", time: "1 ação", range: "120 pés", components: "V, S, M", duration: "Instantâneo", desc: "3 dardos. Você deve rolar um ataque de magia para cada um (2d4 dano). Crítico: 5d4. Falha Crítica: Explode na sua cara (1 de dano de força para você por dardo)." },

  // Nível 3
  { id: "fireball", name: "Bola de Fogo", level: 3, school: "Evocação", time: "1 ação", range: "150 pés", components: "V, S, M", duration: "Instantâneo", desc: "Explosão de 20 pés de raio. Salva DEX ou 8d6 de dano de fogo." },
  { id: "fear", name: "Medo", level: 3, school: "Ilusão", time: "1 ação", range: "Cone de 30 pés", components: "V, S, M", duration: "Concentração, até 1 min", desc: "Salva WIS ou fica Amedrontado e deve usar sua ação para correr na direção oposta." },
  { id: "dispelMagic", name: "Dissipar Magia", level: 3, school: "Abjuração", time: "1 ação", range: "120 pés", components: "V, S", duration: "Instantâneo", desc: "Termina magias no alvo (automático se for magias Nv 3 ou menor, teste de atributo se for maior)." },
  { id: "hypnoticPattern", name: "Padrão Hipnótico", level: 3, school: "Ilusão", time: "1 ação", range: "120 pés", components: "S, M", duration: "Concentração, até 1 min", desc: "Cubo de 30 pés. Salva WIS ou fica Encantado e Incapacitado (não pode se mover)." },
  { id: "haste", name: "Velocidade", level: 3, school: "Transmutação", time: "1 ação", range: "30 pés", components: "V, S, M", duration: "Concentração, até 1 min", desc: "Dobra o deslocamento, +2 na CA, vantagem em saves de DEX e uma ação extra. Quando termina, perde um turno letárgico." },
  { id: "sending", name: "Mensagem Secreta", level: 3, school: "Evocação", time: "1 ação", range: "Ilimitado", components: "V, S, M", duration: "1 rodada", desc: "Mande uma mensagem curta a qualquer criatura que você conheça; ela pode responder." },
  { id: "counterspell", name: "Contramágica", level: 3, school: "Abjuração", time: "1 reação", range: "60 pés", components: "S", duration: "Instantâneo", desc: "Interrompe conjuração em progresso. (Automático Nv 3 ou menor, teste se maior)." },
  { id: "waterBreathing", name: "Respiração Aquática", level: 3, school: "Transmutação", time: "1 ação", range: "30 pés", components: "V, S, M", duration: "24 horas", ritual: true, desc: "Concede capacidade de respirar sob a água a até 10 criaturas." },
  
  // Nível 4
  { id: "polymorph", name: "Metamorfose", level: 4, school: "Transmutação", time: "1 ação", range: "60 pés", components: "V, S, M", duration: "Concentração, até 1 hora", desc: "Transforma a criatura alvo em uma nova forma (Besta), baseada no CR." },
  { id: "divination", name: "Adivinhação", level: 4, school: "Adivinhação", time: "1 ação", range: "Pessoal", components: "V, S, M", duration: "Instantâneo", ritual: true, desc: "Faz uma pergunta sobre um evento que ocorrerá em até 7 dias, Deus te responde." },
  { id: "wallOfFire", name: "Muralha de Fogo", level: 4, school: "Evocação", time: "1 ação", range: "120 pés", components: "V, S, M", duration: "Concentração, até 1 min", desc: "Cria uma muralha de fogo. 5d8 de dano na criação (Salva DEX). Passar através ou ficar num lado causa dano." },
  { id: "stoneShape", name: "Moldar Rocha", level: 4, school: "Transmutação", time: "1 ação", range: "Toque", components: "V, S, M", duration: "Instantâneo", desc: "Você molda um objeto de pedra médio em qualquer forma." },
  { id: "freedomOfMovement", name: "Movimentação Livre", level: 4, school: "Abjuração", time: "1 ação", range: "Toque", components: "V, S, M", duration: "1 hora", desc: "Imunidade a paralisia, restrição e penalidades por terrenos difíceis e estar submerso." },
  { id: "invisibility", name: "Invisibilidade Maior", level: 4, school: "Ilusão", time: "1 ação", range: "Toque", components: "V, S", duration: "Concentração, até 1 min", desc: "Alvo fica invisível e não reaparece ao atacar ou conjurar magias." }
];

window.COMPENDIUM.actions = [
  // Actions compendium can be filled later
];

window.COMPENDIUM.classes = {
  artificer: { name: "Artífice", hitDie: 8 },
  barbarian: { name: "Bárbaro", hitDie: 12 },
  bard: { name: "Bardo", hitDie: 8 },
  cleric: { name: "Clérigo", hitDie: 8 },
  druid: { name: "Druida", hitDie: 8 },
  fighter: { name: "Guerreiro", hitDie: 10 },
  monk: { name: "Monge", hitDie: 8 },
  paladin: { name: "Paladino", hitDie: 10 },
  ranger: { name: "Ranger", hitDie: 10 },
  rogue: { name: "Ladino", hitDie: 8 },
  sorcerer: { name: "Feiticeiro", hitDie: 6 },
  warlock: { name: "Bruxo", hitDie: 8 },
  wizard: { name: "Mago", hitDie: 6 }
};

/* ── Fusão dos pools ────────────────────────────────────────── */
(function mergeAll() {
  // Magias manuais — garantir que têm source + edition
  const manual = (window.COMPENDIUM.spells || []).map(s => ({
    ...s, source: s.source || "manual", edition: s.edition || "manual"
  }));

  // O CompendiumBrowser lê direto de spells_2014 / spells_2024
  // allSpells é usado pelo código legado que busca window.COMPENDIUM.allSpells
  const xphb2024 = window.COMPENDIUM.spells_2024 || [];
  const xphb2014 = window.COMPENDIUM.spells_2014 || [];

  // allSpells = manual + todas as edições (sem duplicatas de nome+edição)
  const seen = new Set(manual.map(s => s.name.toLowerCase()));
  const all2014 = xphb2014.filter(s => !seen.has(s.name.toLowerCase()));
  const all2024 = xphb2024;

  window.COMPENDIUM.spells       = manual;    // pool curado manual
  window.COMPENDIUM.allSpells    = [...manual, ...all2014, ...all2024];

  // Itens
  const legacyItems = window.COMPENDIUM.items || [];
  window.COMPENDIUM.allItems     = [...legacyItems, ...(window.COMPENDIUM.items_2014 || []), ...(window.COMPENDIUM.items_2024 || [])];

  // Talentos + Antecedentes
  window.COMPENDIUM.allFeats       = window.COMPENDIUM.feats_2024 || [];
  window.COMPENDIUM.allBackgrounds = window.COMPENDIUM.backgrounds_2024 || [];

  console.log(
    `[COMPENDIUM] Manual: ${manual.length} magias`,
    `| 2014: ${all2014.length} | 2024: ${all2024.length}`,
    `| Itens: ${window.COMPENDIUM.allItems.length}`,
    `| Talentos: ${window.COMPENDIUM.allFeats.length}`,
    `| Antecedentes: ${window.COMPENDIUM.allBackgrounds.length}`
  );
})();

/* ── Metadados das fontes ────────────────────────────────────── */
window.COMPENDIUM.sources = {
  manual:    { label: "Mesa",                      color: "#9b6dff" },
  phb_2014:  { label: "PHB 2014 (SRD 5.1)",        color: "#c87941" },
  xphb_2024: { label: "PHB 2024 (SRD 5.2 CC)",     color: "#4da6ff" }
};
