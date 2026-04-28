#!/usr/bin/env node
/**
 * import-5etools.js — Importador completo do 5etools para o compendium da Engine
 *
 * Categorias importadas:
 *   1. Spells PHB 2014 (source: "PHB_2014") + XPHB 2024 (source: "XPHB_2024")
 *   2. Items/Weapons/Armor — 2014 (PHB) e 2024 (XPHB), ambos identificados
 *   3. Feats — XPHB 2024 (srd52)
 *   4. Backgrounds — XPHB 2024 (srd52)
 *
 * Uso:  node scripts/import-5etools.js
 * Out:  compendium-xphb.js  (na raiz do projeto)
 *
 * Identificadores de versão (campo `source`):
 *   "PHB_2014"   — Player's Handbook 2014 (5e clássico)
 *   "XPHB_2024"  — Player's Handbook 2024 (5e One D&D / SRD 5.2)
 *   "manual"     — Adicionado manualmente pela mesa
 */

const https = require("https");
const fs    = require("fs");
const path  = require("path");

const OUT_FILE = path.join(__dirname, "..", "compendium-xphb.js");

/* ── URLs das fontes ────────────────────────────────────────── */
const SOURCES = {
  spells_2024:   "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/spells/spells-xphb.json",
  spells_2014:   "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/spells/spells-phb.json",
  items:         "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/items-base.json",
  feats:         "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/feats.json",
  backgrounds:   "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/backgrounds.json",
};

/* ── Mapeamentos ────────────────────────────────────────────── */
const SCHOOLS = { A:"Abjuração",C:"Conjuração",D:"Adivinhação",E:"Encantamento",I:"Ilusão",N:"Necromancia",T:"Transmutação",V:"Evocação" };
const DMG_TYPES = { B:"contundente",P:"perfurante",S:"cortante",F:"fogo",C:"frio",L:"relâmpago",A:"ácido",N:"necrótico",R:"radiante",T:"trovão",Y:"psíquico",O:"força",I:"veneno" };
const ITEM_TYPE = { M:"Arma Corpo-a-Corpo",R:"Arma à Distância",LA:"Armadura Leve",MA:"Armadura Média",HA:"Armadura Pesada",S:"Escudo",AT:"Ferramenta de Artesão",GS:"Kit de Aventureiro",G:"Equipamento Geral",A:"Munição",INS:"Instrumento",SC:"Pergaminho",P:"Poção",RD:"Bastão",RG:"Anel",WD:"Varinha",ST:"Cajado" };
const WEAPON_CAT = { simple:"Simples",martial:"Marcial" };

/* ── Limpa tags 5etools ─────────────────────────────────────── */
function cleanTags(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/\{@damage\s+([^}]+)\}/g, "$1")
    .replace(/\{@dice\s+([^|]+)[^}]*\}/g, "$1")
    .replace(/\{@hit\s+([^}]+)\}/g, "$1")
    .replace(/\{@dc\s+([^}]+)\}/g, "CD $1")
    .replace(/\{@h\}/g, "")
    .replace(/\{@chance\s+([^}]+)\}/g, "$1%")
    .replace(/\{@condition\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@condition\s+([^}]+)\}/g, "$1")
    .replace(/\{@spell\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@spell\s+([^}]+)\}/g, "$1")
    .replace(/\{@item\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@item\s+([^}]+)\}/g, "$1")
    .replace(/\{@creature\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@creature\s+([^}]+)\}/g, "$1")
    .replace(/\{@variantrule\s+[^|]+\|[^|]*\|([^}]+)\}/g, "$1")
    .replace(/\{@variantrule\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@action\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@action\s+([^}]+)\}/g, "$1")
    .replace(/\{@skill\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@skill\s+([^}]+)\}/g, "$1")
    .replace(/\{@sense\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@filter\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@feat\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@feat\s+([^}]+)\}/g, "$1")
    .replace(/\{@status\s+([^}]+)\}/g, "$1")
    .replace(/\{@[^}]+\}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function entriesToText(entries, depth = 0) {
  if (!entries || !Array.isArray(entries)) return "";
  if (depth > 4) return "";
  const parts = [];
  for (const entry of entries) {
    if (typeof entry === "string") {
      const cleaned = cleanTags(entry);
      if (cleaned) parts.push(cleaned);
    } else if (entry && typeof entry === "object") {
      if (entry.type === "entries" && entry.name) {
        const body = entriesToText(entry.entries || [], depth + 1);
        if (body) parts.push(`${entry.name}: ${body}`);
      } else if (entry.type === "list" && Array.isArray(entry.items)) {
        for (const item of entry.items) {
          if (typeof item === "string") {
            parts.push("• " + cleanTags(item));
          } else if (item && item.entries) {
            const label = item.name ? `${item.name}: ` : "";
            parts.push("• " + label + entriesToText(item.entries || [], depth + 1));
          } else if (item && item.entry) {
            const label = item.name ? `${item.name}: ` : "";
            parts.push("• " + label + cleanTags(item.entry));
          }
        }
      } else if (entry.type === "table") {
        if (entry.caption) parts.push(`[${entry.caption}]`);
      } else if (entry.entries) {
        parts.push(entriesToText(entry.entries, depth + 1));
      } else if (entry.entry) {
        parts.push(cleanTags(entry.entry));
      }
    }
  }
  return parts.filter(Boolean).join(" ");
}

function fmtTime(timeArr) {
  if (!Array.isArray(timeArr) || !timeArr.length) return "?";
  const t = timeArr[0];
  const u = { action:"ação",reaction:"reação",bonus:"ação bônus",minute:"minuto",hour:"hora",day:"dia" };
  let unit = u[t.unit] || t.unit;
  const cond = t.condition ? `, ${cleanTags(t.condition)}` : "";
  return `${t.number > 1 ? t.number+" " : "1 "}${unit}${cond}`;
}

function fmtRange(range) {
  if (!range) return "Pessoal";
  const dist = range.distance;
  if (!dist) return range.type === "special" ? "Especial" : "Pessoal";
  const dt = dist.type;
  if (dt === "self") return "Pessoal";
  if (dt === "touch") return "Toque";
  if (dt === "unlimited") return "Ilimitado";
  if (dt === "sight") return "Visão";
  const um = { feet:"pés",miles:"milhas",mile:"milha",foot:"pé" };
  const am = { radius:"raio de ",sphere:"esfera de ",cone:"cone de ",line:"linha de ",cube:"cubo de ",cylinder:"cilindro de ",emanation:"emanação de " };
  return `${am[range.type]||""}${dist.amount} ${um[dt]||dt}`;
}

function fmtComponents(comp) {
  if (!comp) return "";
  const p = [];
  if (comp.v) p.push("V");
  if (comp.s) p.push("S");
  if (comp.m) p.push("M");
  return p.join(", ");
}

function fmtDuration(durArr) {
  if (!Array.isArray(durArr) || !durArr.length) return "Instantâneo";
  const d = durArr[0];
  if (d.type === "instant") return "Instantâneo";
  if (d.type === "permanent") return "Permanente";
  if (d.type === "special") return "Especial";
  if (d.type === "timed" && d.duration) {
    const um = { round:"rodada",rounds:"rodadas",minute:"minuto",minutes:"minutos",hour:"hora",hours:"horas",day:"dia",days:"dias",week:"semana" };
    const u = um[d.duration.type] || d.duration.type;
    const s = d.duration.amount > 1 ? "s" : "";
    const c = d.concentration ? "Concentração, até " : "";
    return `${c}${d.duration.amount} ${u}${s}`;
  }
  return "Especial";
}

/* ─────────────────────────────────────────────────────────────
   1. SPELLS — aceita edition como parâmetro ("PHB_2014" | "XPHB_2024")
───────────────────────────────────────────────────────────── */
function convertSpell(s, edition) {
  const desc = entriesToText(s.entries);
  let higherLevel = null;
  if (Array.isArray(s.entriesHigherLevel) && s.entriesHigherLevel.length) {
    higherLevel = entriesToText(s.entriesHigherLevel[0].entries || []) || null;
  }
  const baseId = s.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
  return {
    id: `${baseId}_${edition === "PHB_2014" ? "2014" : "2024"}`,
    name: s.name,
    source: edition,                    // ← identificador de edição
    edition: edition === "PHB_2014" ? "2014" : "2024",
    level: s.level,
    school: SCHOOLS[s.school] || s.school,
    time: fmtTime(s.time),
    range: fmtRange(s.range),
    components: fmtComponents(s.components),
    componentsDetail: typeof s.components?.m === "string" ? s.components.m : null,
    duration: fmtDuration(s.duration),
    ritual: !!(s.meta && s.meta.ritual),
    concentration: !!(s.duration && s.duration[0] && s.duration[0].concentration),
    desc,
    higherLevel,
    tags: {
      savingThrow: s.savingThrow || [],
      damageType: s.damageInflict || [],
      conditions: s.conditionInflict || [],
      area: s.areaTags || []
    }
  };
}

/* ─────────────────────────────────────────────────────────────
   2. ITEMS — 2014 (source PHB, srd:true) e 2024 (source XPHB, srd52:true)
───────────────────────────────────────────────────────────── */
function convertItem(it) {
  const is2024 = it.source === "XPHB" && (it.srd52 || it.basicRules2024);
  const is2014 = it.source === "PHB"  && (it.srd === true || it.basicRules === true);
  if (!is2024 && !is2014) return null;
  if (it.age === "modern" || it.age === "futuristic") return null;

  const edition = is2024 ? "2024" : "2014";
  const source  = is2024 ? "XPHB_2024" : "PHB_2014";
  const rawType = (it.type || "G").split("|")[0];
  const category = ITEM_TYPE[rawType] || rawType;
  const isWeapon = !!(it.weapon || it.weaponCategory);
  const isArmor  = !!(it.armor);
  const entries  = it.entries || it.additionalEntries || [];
  const desc = entriesToText(entries);

  return {
    id: `${it.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_")}_${edition}`,
    name: it.name,
    source,
    edition,
    category,
    isWeapon, isArmor,
    weaponCategory: WEAPON_CAT[it.weaponCategory] || null,
    damage:   it.dmg1 ? `${it.dmg1} ${DMG_TYPES[it.dmgType] || it.dmgType || ""}`.trim() : null,
    damage2h: it.dmg2 ? `${it.dmg2} ${DMG_TYPES[it.dmgType] || it.dmgType || ""}`.trim() : null,
    ac: it.ac || null,
    range: it.range || null,
    weight: it.weight || 0,
    value: it.value ? Math.floor(it.value / 100) + " po" : null,
    properties: it.property ? it.property.map(p => (typeof p === "string" ? p.split("|")[0] : "")).filter(Boolean).join(", ") : null,
    mastery: it.mastery ? it.mastery.map(m => (typeof m === "string" ? m.split("|")[0] : "")).filter(Boolean).join(", ") : null,
    desc: desc || null,
    rarity: it.rarity || "none"
  };
}

/* ─────────────────────────────────────────────────────────────
   3. FEATS — XPHB 2024
───────────────────────────────────────────────────────────── */
function convertFeat(f) {
  if (f.source !== "XPHB" && !f.srd52 && !f.basicRules2024) return null;
  const desc = entriesToText(f.entries || []);
  let prereq = null;
  if (Array.isArray(f.prerequisite) && f.prerequisite.length) {
    const p = f.prerequisite[0];
    if (p.level) prereq = `Nível ${p.level}`;
    if (p.ability && Array.isArray(p.ability) && p.ability[0]) {
      const ab = Object.entries(p.ability[0]).map(([k,v]) => `${k.toUpperCase()} ${v}`).join(", ");
      prereq = prereq ? `${prereq}, ${ab}` : ab;
    }
    if (p.feat && Array.isArray(p.feat)) prereq = prereq ? `${prereq}; ${p.feat[0]}` : p.feat[0];
  }
  let abilityBonus = null;
  if (Array.isArray(f.ability) && f.ability.length) {
    const ab = f.ability[0];
    abilityBonus = ab.choose ? "+1 a um atributo" : Object.entries(ab).filter(([k]) => k !== "hidden").map(([k,v]) => `${k.toUpperCase()} +${v}`).join(", ");
  }
  return {
    id: f.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_"),
    name: f.name,
    source: "XPHB_2024",
    edition: "2024",
    category: f.category || "G",
    prerequisite: prereq,
    abilityBonus,
    repeatable: f.repeatable || false,
    desc
  };
}

/* ─────────────────────────────────────────────────────────────
   4. BACKGROUNDS — XPHB 2024
───────────────────────────────────────────────────────────── */
function convertBackground(b) {
  if (b.source !== "XPHB" && !b.srd52 && !b.basicRules2024) return null;
  const entries = b.entries || [];
  let summary = null;
  for (const e of entries) {
    if (e && e.type === "list" && Array.isArray(e.items)) {
      const parts = e.items.map(item => {
        if (item.name && item.entry) return `${item.name} ${cleanTags(item.entry)}`;
        if (typeof item === "string") return cleanTags(item);
        return null;
      }).filter(Boolean);
      if (parts.length) { summary = parts.join(" | "); break; }
    }
  }
  const skills = [];
  if (Array.isArray(b.skillProficiencies)) {
    b.skillProficiencies.forEach(sp => Object.keys(sp).forEach(k => { if (k !== "choose" && sp[k]) skills.push(k); }));
  }
  const tools = [];
  if (Array.isArray(b.toolProficiencies)) {
    b.toolProficiencies.forEach(tp => Object.keys(tp).forEach(k => { if (k !== "choose" && tp[k]) tools.push(k); }));
  }
  return {
    id: b.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_"),
    name: b.name,
    source: "XPHB_2024",
    edition: "2024",
    skills, tools,
    summary: summary || null,
    desc: entriesToText(entries.slice(1))
  };
}

/* ── HTTP Download ──────────────────────────────────────────── */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    process.stdout.write(`  📥 ${url.split("/").pop()} ... `);
    https.get(url, res => {
      if (res.statusCode !== 200) { console.log(`❌ HTTP ${res.statusCode}`); reject(new Error(`HTTP ${res.statusCode}`)); return; }
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try { console.log(`✅ (${Math.round(raw.length/1024)} KB)`); resolve(JSON.parse(raw)); }
        catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

function stats(label, arr) { console.log(`   ${label}: ${arr.length}`); }

/* ── MAIN ───────────────────────────────────────────────────── */
async function main() {
  console.log("\n🧙 D&D Sheet Engine — Importador 5etools (2014 + 2024)\n");
  console.log("Baixando dados:");

  const [spell2024Data, spell2014Data, itemData, featData, bgData] = await Promise.all([
    fetchJson(SOURCES.spells_2024),
    fetchJson(SOURCES.spells_2014),
    fetchJson(SOURCES.items),
    fetchJson(SOURCES.feats),
    fetchJson(SOURCES.backgrounds)
  ]);

  console.log("\n⚙️  Convertendo...");

  const spells_2024 = (spell2024Data.spell || []).map(s => convertSpell(s, "XPHB_2024"));
  const spells_2014 = (spell2014Data.spell || []).map(s => convertSpell(s, "PHB_2014"));
  const items       = (itemData.baseitem || []).map(convertItem).filter(Boolean);
  const feats       = (featData.feat || []).map(convertFeat).filter(Boolean);
  const backgrounds = (bgData.background || []).map(convertBackground).filter(Boolean);

  const items_2024 = items.filter(i => i.edition === "2024");
  const items_2014 = items.filter(i => i.edition === "2014");
  const weaponCount = items.filter(i => i.isWeapon).length;
  const armorCount  = items.filter(i => i.isArmor).length;

  console.log("\n📊 RESULTADO:");
  stats("Magias 2014 (PHB)", spells_2014);
  stats("Magias 2024 (XPHB)", spells_2024);
  stats("Itens 2014 (PHB)", items_2014);
  stats("Itens 2024 (XPHB)", items_2024);
  stats("Talentos 2024 (XPHB)", feats);
  stats("Antecedentes 2024 (XPHB)", backgrounds);
  console.log(`     → Armas total: ${weaponCount} | Armaduras total: ${armorCount}`);

  const out = `/* compendium-xphb.js — Dados D&D 2014 + 2024 via 5etools
 * Gerado automaticamente por scripts/import-5etools.js
 * Fonte: github.com/5etools-mirror-3/5etools-src
 * Licença: Creative Commons CC-BY-4.0 — SRD 5.1 (2014) e SRD 5.2 (2024)
 * Gerado em: ${new Date().toISOString()}
 *
 * Identificadores de edição (campo source / edition):
 *   "PHB_2014"  — Player's Handbook 2014 (5e clássico, SRD 5.1)
 *   "XPHB_2024" — Player's Handbook 2024 (One D&D, SRD 5.2)
 *   "manual"    — Adicionado manualmente pela mesa
 *
 * Conteúdo:
 *   spells_2014     — ${spells_2014.length} magias (2014)
 *   spells_2024     — ${spells_2024.length} magias (2024)
 *   items_2014      — ${items_2014.length} itens (2014)
 *   items_2024      — ${items_2024.length} itens (2024)
 *   feats_2024      — ${feats.length} talentos (2024)
 *   backgrounds_2024 — ${backgrounds.length} antecedentes (2024)
 */

window.COMPENDIUM = window.COMPENDIUM || {};

window.COMPENDIUM.spells_2014 = ${JSON.stringify(spells_2014, null, 2)};

window.COMPENDIUM.spells_2024 = ${JSON.stringify(spells_2024, null, 2)};

window.COMPENDIUM.items_2014 = ${JSON.stringify(items_2014, null, 2)};

window.COMPENDIUM.items_2024 = ${JSON.stringify(items_2024, null, 2)};

window.COMPENDIUM.feats_2024 = ${JSON.stringify(feats, null, 2)};

window.COMPENDIUM.backgrounds_2024 = ${JSON.stringify(backgrounds, null, 2)};
`;

  fs.writeFileSync(OUT_FILE, out, "utf8");
  const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(0);
  console.log(`\n✅ Arquivo: ${OUT_FILE}`);
  console.log(`   Tamanho: ${kb} KB\n`);
}

main().catch(e => { console.error("\n❌ Erro:", e.message); process.exit(1); });
