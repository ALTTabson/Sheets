#!/usr/bin/env node
/**
 * import-xphb.js — Conversor de dados do 5etools (XPHB / 2024 PHB)
 * para o formato do nosso compendium.js.
 *
 * Uso: node scripts/import-xphb.js
 * Output: compendium-xphb.js (na raiz do projeto)
 */

const https = require("https");
const fs    = require("fs");
const path  = require("path");

/* ── Configuração ───────────────────────────────────────────── */
const XPHB_URL = "https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/master/data/spells/spells-xphb.json";
const OUT_FILE = path.join(__dirname, "..", "compendium-xphb.js");

/* ── Mapeamento de escolas (letra → nome em PT) ─────────────── */
const SCHOOLS = {
  A: "Abjuração",
  C: "Conjuração",
  D: "Adivinhação",
  E: "Encantamento",
  I: "Ilusão",
  N: "Necromancia",
  T: "Transmutação",
  V: "Evocação"
};

/* ── Remove tags inline do 5etools ─────────────────────────── */
// Ex: {@damage 1d6} → 1d6
//     {@condition Charmed|XPHB} → Charmed
//     {@spell Fireball|XPHB} → Fireball
//     {@variantrule Hit Points|XPHB|Hit Point} → Hit Point
function cleanTags(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/\{@damage\s+([^}]+)\}/g, "$1")
    .replace(/\{@dice\s+([^|]+)[^}]*\}/g, "$1")
    .replace(/\{@hit\s+([^}]+)\}/g, "$1")
    .replace(/\{@h\}/g, "")
    .replace(/\{@condition\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@condition\s+([^}]+)\}/g, "$1")
    .replace(/\{@spell\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@spell\s+([^}]+)\}/g, "$1")
    .replace(/\{@creature\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@creature\s+([^}]+)\}/g, "$1")
    .replace(/\{@variantrule\s+[^|]+\|[^|]*\|([^}]+)\}/g, "$1")
    .replace(/\{@variantrule\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@action\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@action\s+([^}]+)\}/g, "$1")
    .replace(/\{@filter\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@sense\s+([^|]+)\|[^}]*\}/g, "$1")
    .replace(/\{@[^}]+\}/g, "")     // fallback: remove qualquer tag restante
    .replace(/\s{2,}/g, " ")
    .trim();
}

/* ── Converte entries (array) → texto limpo ─────────────────── */
function entriesToText(entries) {
  if (!entries || !Array.isArray(entries)) return "";

  const parts = [];
  for (const entry of entries) {
    if (typeof entry === "string") {
      parts.push(cleanTags(entry));
    } else if (entry && typeof entry === "object") {
      if (entry.type === "entries" && entry.name) {
        parts.push(`${entry.name}: ${entriesToText(entry.entries)}`);
      } else if (entry.type === "list" && Array.isArray(entry.items)) {
        for (const item of entry.items) {
          if (typeof item === "string") {
            parts.push("• " + cleanTags(item));
          } else if (item && item.entries) {
            const label = item.name ? `${item.name}: ` : "";
            parts.push("• " + label + entriesToText(item.entries));
          }
        }
      } else if (entry.type === "table" && entry.rows) {
        // Apenas menciona que há uma tabela
        parts.push(`[${entry.caption || "Tabela"}]`);
      } else if (entry.entries) {
        parts.push(entriesToText(entry.entries));
      }
    }
  }

  return parts.filter(Boolean).join(" ");
}

/* ── Converte time ───────────────────────────────────────────── */
function fmtTime(timeArr) {
  if (!Array.isArray(timeArr) || timeArr.length === 0) return "?";
  const t = timeArr[0];
  const unitMap = {
    action: "ação",
    reaction: "reação",
    "bonus action": "ação bônus",
    bonus_action: "ação bônus",
    minute: "minuto",
    minutes: "minutos",
    hour: "hora",
    hours: "horas",
    day: "dia"
  };

  // Detecta "bonus action" via condition no 5etools
  let unit = unitMap[t.unit] || t.unit;
  if (t.unit === "bonus") unit = "ação bônus";

  // Condição da reação (ex: "when you take damage")
  const cond = t.condition ? `, ${cleanTags(t.condition)}` : "";

  return `${t.number > 1 ? t.number + " " : ""}${t.number > 1 ? unit + "s" : "1 " + unit}${cond}`;
}

/* ── Converte range ──────────────────────────────────────────── */
function fmtRange(range) {
  if (!range) return "Pessoal";
  const type = range.type;
  const dist = range.distance;

  if (!dist) {
    // "self" ou "special"
    return type === "special" ? "Especial" : "Pessoal";
  }

  const distType = dist.type;
  if (distType === "self") return "Pessoal";
  if (distType === "touch") return "Toque";
  if (distType === "unlimited") return "Ilimitado";
  if (distType === "sight") return "Visão";

  const unitMap = { feet: "pés", miles: "milhas", mile: "milha", foot: "pé" };
  const unit = unitMap[distType] || distType;

  const areaMap = {
    radius: "raio de",
    sphere: "esfera de",
    cone: "cone de",
    line: "linha de",
    cube: "cubo de",
    cylinder: "cilindro de",
    emanation: "emanação de"
  };

  const prefix = areaMap[type] ? `${areaMap[type]} ` : "";
  return `${prefix}${dist.amount} ${unit}`;
}

/* ── Converte components ────────────────────────────────────── */
function fmtComponents(comp) {
  if (!comp) return "";
  const parts = [];
  if (comp.v) parts.push("V");
  if (comp.s) parts.push("S");
  if (comp.m) parts.push("M");
  return parts.join(", ");
}

/* ── Converte duration ──────────────────────────────────────── */
function fmtDuration(durArr) {
  if (!Array.isArray(durArr) || durArr.length === 0) return "Instantâneo";
  const d = durArr[0];

  if (d.type === "instant") return "Instantâneo";
  if (d.type === "permanent") return "Permanente";
  if (d.type === "special") return "Especial";
  if (d.type === "until rest") return "Até descanso";

  if (d.type === "timed" && d.duration) {
    const unitMap = {
      round: "rodada", rounds: "rodadas",
      minute: "minuto", minutes: "minutos",
      hour: "hora", hours: "horas",
      day: "dia", days: "dias",
      week: "semana", weeks: "semanas",
      year: "ano"
    };
    const unit = unitMap[d.duration.type] || d.duration.type;
    const plural = d.duration.amount > 1 ? "s" : "";
    const conc = d.concentration ? "Concentração, até " : "";
    return `${conc}${d.duration.amount} ${unit}${plural}`;
  }

  return "Especial";
}

/* ── Extrai desc de nível acima ─────────────────────────────── */
function fmtHigherLevel(entriesHigherLevel) {
  if (!Array.isArray(entriesHigherLevel) || entriesHigherLevel.length === 0) return null;
  const first = entriesHigherLevel[0];
  if (!first) return null;
  const text = entriesToText(first.entries || []);
  return text || null;
}

/* ── Converte um feitiço 5etools → nosso formato ────────────── */
function convertSpell(s) {
  const desc = entriesToText(s.entries);
  const higherLevel = fmtHigherLevel(s.entriesHigherLevel);

  return {
    id: s.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_"),
    name: s.name,
    source: "XPHB_2024",
    level: s.level,
    school: SCHOOLS[s.school] || s.school,
    time: fmtTime(s.time),
    range: fmtRange(s.range),
    components: fmtComponents(s.components),
    componentsDetail: typeof s.components?.m === "string" ? s.components.m : null,
    duration: fmtDuration(s.duration),
    ritual: !!(s.meta && s.meta.ritual),
    concentration: !!(s.duration && s.duration[0] && s.duration[0].concentration),
    desc: desc,
    higherLevel: higherLevel,
    // Tags úteis para filtros futuros
    tags: {
      savingThrow: s.savingThrow || [],
      damageType: s.damageInflict || [],
      conditions: s.conditionInflict || [],
      area: s.areaTags || []
    }
  };
}

/* ── Download do JSON ───────────────────────────────────────── */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Baixando: ${url}`);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} para ${url}`));
        return;
      }
      let raw = "";
      res.on("data", chunk => raw += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error("JSON inválido: " + e.message)); }
      });
    }).on("error", reject);
  });
}

/* ── Estatísticas de qualidade ──────────────────────────────── */
function printStats(spells) {
  const byLevel = {};
  const bySchool = {};
  let withHigherLevel = 0;
  let withConcentration = 0;
  let withRitual = 0;

  for (const s of spells) {
    byLevel[s.level] = (byLevel[s.level] || 0) + 1;
    bySchool[s.school] = (bySchool[s.school] || 0) + 1;
    if (s.higherLevel) withHigherLevel++;
    if (s.concentration) withConcentration++;
    if (s.ritual) withRitual++;
  }

  console.log(`\n📊 ESTATÍSTICAS:`);
  console.log(`   Total: ${spells.length} magias`);
  console.log(`   Por nível: ${JSON.stringify(byLevel)}`);
  console.log(`   Por escola: ${JSON.stringify(bySchool)}`);
  console.log(`   Com "Em Níveis Superiores": ${withHigherLevel}`);
  console.log(`   Com Concentração: ${withConcentration}`);
  console.log(`   Com Ritual: ${withRitual}`);
}

/* ── Main ───────────────────────────────────────────────────── */
async function main() {
  console.log("🧙 D&D Sheet Engine — Importador XPHB 2024\n");

  let data;
  try {
    data = await fetchJson(XPHB_URL);
  } catch (e) {
    console.error("❌ Erro ao baixar:", e.message);
    process.exit(1);
  }

  const rawSpells = data.spell || [];
  console.log(`✅ ${rawSpells.length} magias brutas recebidas`);

  const converted = rawSpells.map(convertSpell);
  printStats(converted);

  // Gera o arquivo JS
  const output = `/* compendium-xphb.js — Magias da 2024 Player's Handbook (XPHB / SRD 5.2)
 * Gerado automaticamente por scripts/import-xphb.js
 * Fonte: github.com/5etools-mirror-3/5etools-src
 * Licença: Creative Commons — SRD 5.2
 * Total: ${converted.length} magias
 */

window.COMPENDIUM = window.COMPENDIUM || {};
window.COMPENDIUM.spells_2024 = ${JSON.stringify(converted, null, 2)};

// Merge opcional com spells originais
// Para usar apenas as 2024: window.COMPENDIUM.spells = window.COMPENDIUM.spells_2024;
// Para ambas as edições num pool: 
// window.COMPENDIUM.allSpells = [...(window.COMPENDIUM.spells || []), ...window.COMPENDIUM.spells_2024];
`;

  fs.writeFileSync(OUT_FILE, output, "utf8");
  const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(`\n✅ Arquivo gerado: ${OUT_FILE}`);
  console.log(`   Tamanho: ${kb} KB`);
  console.log(`\n💡 Adicione ao index.html:`);
  console.log(`   <script src="compendium-xphb.js"></script>`);
  console.log(`   (Carregue ANTES de compendium.js e data.js)\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
