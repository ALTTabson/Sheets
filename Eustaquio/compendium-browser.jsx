/* compendium-browser.jsx — Painel lateral de busca do Compêndio
 * Categorias: Magias | Itens | Talentos | Antecedentes
 * Edição: 2014 (PHB) | 2024 (XPHB) | Ambas
 * Busca robusta: nome, descrição, escola, tipo, nível, propriedades
 */

const CompendiumBrowser = ({ onAddSpell, onAddItem, onClose }) => {
  const { useState, useMemo, useRef, useEffect } = React;

  // ── Filtros ──────────────────────────────────────────────────
  const [tab,       setTab]       = useState("spells");
  const [search,    setSearch]    = useState("");
  const [edition,   setEdition]   = useState("all");   // "all" | "2014" | "2024"
  const [levelMin,  setLevelMin]  = useState(0);
  const [levelMax,  setLevelMax]  = useState(9);
  const [school,    setSchool]    = useState("all");
  const [itemCat,   setItemCat]   = useState("all");   // "all" | "weapon" | "armor" | "gear"
  const [ritual,    setRitual]    = useState(false);
  const [conc,      setConc]      = useState(false);
  const [expanded,  setExpanded]  = useState(null);    // id da linha expandida
  const searchRef   = useRef(null);

  // Auto-focus busca ao abrir
  useEffect(() => { searchRef.current?.focus(); }, []);

  // ── Dados ────────────────────────────────────────────────────
  const C = window.COMPENDIUM || {};

  // Magias: manuais + 2014 + 2024 (todos num array, source identificado)
  const manualSpells = (C.spells || []).map(s => ({ ...s, source: s.source || "manual", edition: "manual" }));
  const spells2014   = C.spells_2014 || [];
  const spells2024   = C.spells_2024 || [];
  const allSpells    = [...manualSpells, ...spells2014, ...spells2024];

  const items2014    = C.items_2014 || [];
  const items2024    = C.items_2024 || [];
  const allItems     = [...items2014, ...items2024];

  const allFeats     = C.feats_2024 || [];
  const allBgs       = C.backgrounds_2024 || [];

  // ── Opções de filtro dinâmicas ──────────────────────────────
  const schools  = useMemo(() => [...new Set(allSpells.map(s => s.school))].sort(), []);
  const itemCats = useMemo(() => ["weapon", "armor", "gear"], []);

  // ── Função de busca ─────────────────────────────────────────
  const q = search.toLowerCase().trim();

  function matchSearch(obj, fields) {
    if (!q) return true;
    for (const f of fields) {
      const val = obj[f];
      if (typeof val === "string" && val.toLowerCase().includes(q)) return true;
      if (typeof val === "number" && String(val).includes(q)) return true;
    }
    return false;
  }

  const filteredSpells = useMemo(() => allSpells.filter(s => {
    if (edition !== "all" && s.edition !== edition && s.edition !== undefined) {
      // "manual" sempre mostra
      if (s.edition !== "manual") return false;
    }
    if (s.level < levelMin || s.level > levelMax) return false;
    if (school !== "all" && s.school !== school) return false;
    if (ritual && !s.ritual) return false;
    if (conc && !s.concentration) return false;
    return matchSearch(s, ["name", "desc", "school", "components", "time", "range", "duration"]);
  }), [allSpells, q, edition, levelMin, levelMax, school, ritual, conc]);

  const filteredItems = useMemo(() => allItems.filter(it => {
    if (edition !== "all" && it.edition !== edition) return false;
    if (itemCat === "weapon" && !it.isWeapon) return false;
    if (itemCat === "armor"  && !it.isArmor) return false;
    if (itemCat === "gear"   && (it.isWeapon || it.isArmor)) return false;
    return matchSearch(it, ["name", "damage", "category", "desc", "properties", "weaponCategory"]);
  }), [allItems, q, edition, itemCat]);

  const filteredFeats = useMemo(() => allFeats.filter(f =>
    matchSearch(f, ["name", "desc", "prerequisite", "abilityBonus"])
  ), [allFeats, q]);

  const filteredBgs   = useMemo(() => allBgs.filter(b =>
    matchSearch(b, ["name", "summary", "skills", "tools"])
  ), [allBgs, q]);

  // ── Helpers de UI ────────────────────────────────────────────
  const EDITION_BADGE = {
    "PHB_2014": { label: "2014", color: "#c87941" },
    "XPHB_2024": { label: "2024", color: "#4da6ff" },
    "manual": { label: "Mesa", color: "#9b6dff" },
  };

  const EdBadge = ({ source }) => {
    const b = EDITION_BADGE[source] || { label: source || "?", color: "#888" };
    return (
      <span style={{
        fontSize: 9, fontFamily: "var(--font-pixel)", padding: "1px 5px", borderRadius: 3,
        background: b.color + "25", color: b.color, border: `1px solid ${b.color}55`,
        letterSpacing: "0.05em", flexShrink: 0, whiteSpace: "nowrap"
      }}>{b.label}</span>
    );
  };

  const ResetFilters = () => (
    <button onClick={() => { setSearch(""); setEdition("all"); setSchool("all"); setLevelMin(0); setLevelMax(9); setRitual(false); setConc(false); setItemCat("all"); }}
      style={{ fontSize: 10, color: "var(--c-ink-d)", background: "none", border: "1px solid var(--c-edge)", padding: "2px 8px", cursor: "pointer", fontFamily: "var(--font-mono)" }}>
      ✕ Limpar
    </button>
  );

  const hasActiveFilters = q || edition !== "all" || school !== "all" || levelMin !== 0 || levelMax !== 9 || ritual || conc || itemCat !== "all";

  // ── Estilos inline ────────────────────────────────────────────
  const panelStyle = {
    position: "fixed", top: 0, right: 0, width: 400, height: "100vh",
    background: "rgba(8, 16, 4, 0.97)", backdropFilter: "blur(12px)",
    borderLeft: "1px solid var(--c-edge)", display: "flex", flexDirection: "column",
    zIndex: 9000, fontFamily: "var(--font-body)", boxShadow: "-8px 0 32px rgba(0,0,0,0.7)"
  };
  const headerStyle = {
    padding: "16px 16px 0", borderBottom: "1px solid var(--c-edge-2)"
  };
  const searchStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--c-edge)",
    color: "var(--c-ink)", padding: "8px 12px", fontSize: 13, fontFamily: "var(--font-body)",
    outline: "none", boxSizing: "border-box", borderRadius: 2,
    transition: "border-color 0.2s"
  };
  const selStyle = {
    background: "rgba(0,0,0,0.6)", border: "1px solid var(--c-edge)", color: "var(--c-ink)",
    padding: "4px 8px", fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer"
  };
  const tabBtn = (active) => ({
    flex: 1, padding: "8px 4px", background: active ? "rgba(167,189,64,0.12)" : "transparent",
    border: "none", borderBottom: active ? "2px solid var(--c-accent)" : "2px solid transparent",
    color: active ? "var(--c-accent-bright)" : "var(--c-ink-d)", cursor: "pointer",
    fontSize: 10, fontFamily: "var(--font-pixel)", letterSpacing: "0.05em", transition: "all 0.15s"
  });

  const rowStyle = (isExp) => ({
    padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)",
    cursor: "pointer", background: isExp ? "rgba(167,189,64,0.06)" : "transparent",
    transition: "background 0.1s"
  });

  // ── Edição toggle buttons ─────────────────────────────────────
  const EditionFilter = () => (
    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
      {[["all", "Todas"], ["2014", "2014"], ["2024", "2024"]].map(([v, l]) => (
        <button key={v} onClick={() => setEdition(v)} style={{
          padding: "3px 10px", fontSize: 10, fontFamily: "var(--font-pixel)", cursor: "pointer",
          border: `1px solid ${edition === v ? "var(--c-accent)" : "var(--c-edge)"}`,
          background: edition === v ? "rgba(167,189,64,0.2)" : "rgba(0,0,0,0.4)",
          color: edition === v ? "var(--c-accent-bright)" : "var(--c-ink-d)",
          borderRadius: 2, transition: "all 0.15s"
        }}>{l}</button>
      ))}
      {hasActiveFilters && <ResetFilters />}
    </div>
  );

  // ── Aba de Magias ─────────────────────────────────────────────
  const SpellsTab = () => (
    <>
      {/* Linha de filtros */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
        <select value={school} onChange={e => setSchool(e.target.value)} style={selStyle}>
          <option value="all">Todas as Escolas</option>
          {schools.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <span style={{ fontSize: 10, color: "var(--c-ink-d)", fontFamily: "var(--font-mono)" }}>Nv</span>
          <input type="number" min={0} max={9} value={levelMin} onChange={e => setLevelMin(+e.target.value)}
            style={{ ...selStyle, width: 42, textAlign: "center" }} />
          <span style={{ color: "var(--c-ink-d)" }}>–</span>
          <input type="number" min={0} max={9} value={levelMax} onChange={e => setLevelMax(+e.target.value)}
            style={{ ...selStyle, width: 42, textAlign: "center" }} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 10, color: "var(--c-ink-d)", fontFamily: "var(--font-mono)" }}>
          <input type="checkbox" checked={ritual} onChange={e => setRitual(e.target.checked)} />Ritual
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 10, color: "var(--c-ink-d)", fontFamily: "var(--font-mono)" }}>
          <input type="checkbox" checked={conc} onChange={e => setConc(e.target.checked)} />Conc.
        </label>
      </div>

      {/* Contagem */}
      <div style={{ fontSize: 10, color: "var(--c-ink-d)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
        {filteredSpells.length} magias encontradas
      </div>

      {/* Lista */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredSpells.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: "var(--c-ink-d)", fontSize: 12 }}>Nenhuma magia encontrada</div>
        ) : filteredSpells.map(s => {
          const isExp = expanded === s.id;
          return (
            <div key={s.id} style={rowStyle(isExp)} onClick={() => setExpanded(isExp ? null : s.id)}>
              {/* Linha principal */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--c-accent)", minWidth: 14, textAlign: "center" }}>
                  {s.level === 0 ? "T" : s.level}
                </span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "var(--c-ink)" }}>{s.name}</span>
                <span style={{ fontSize: 9, color: "var(--c-ink-d)" }}>{s.school?.slice(0,3)}</span>
                {s.ritual && <span style={{ fontSize: 8, color: "#c87941" }}>R</span>}
                {s.concentration && <span style={{ fontSize: 8, color: "#4da6ff" }}>C</span>}
                <EdBadge source={s.source} />
              </div>

              {/* Detalhes expandidos */}
              {isExp && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--c-edge-2)" }}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                    {[["Tempo", s.time], ["Alcance", s.range], ["Dur.", s.duration], ["Comp.", s.components]].map(([k, v]) => v && (
                      <div key={k}>
                        <div style={{ fontSize: 9, color: "var(--c-ink-d)", fontFamily: "var(--font-mono)" }}>{k}</div>
                        <div style={{ fontSize: 11 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {s.componentsDetail && (
                    <div style={{ fontSize: 10, color: "var(--c-ink-d)", marginBottom: 6, fontStyle: "italic" }}>({s.componentsDetail})</div>
                  )}
                  <div style={{ fontSize: 11, color: "var(--c-ink)", lineHeight: 1.5, marginBottom: 8 }}>
                    {(s.desc || "").slice(0, 280)}{s.desc?.length > 280 ? "…" : ""}
                  </div>
                  {s.higherLevel && (
                    <div style={{ fontSize: 10, color: "#9b8", fontStyle: "italic", marginBottom: 8 }}>
                      ⬆ {s.higherLevel.slice(0, 120)}{s.higherLevel.length > 120 ? "…" : ""}
                    </div>
                  )}
                  {onAddSpell && (
                    <button onClick={e => { e.stopPropagation(); onAddSpell(s); setExpanded(null); }}
                      style={{ fontSize: 10, padding: "4px 12px", background: "rgba(167,189,64,0.2)", border: "1px solid var(--c-accent)", color: "var(--c-accent-bright)", cursor: "pointer", fontFamily: "var(--font-pixel)" }}>
                      + Adicionar à Ficha
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  // ── Aba de Itens ─────────────────────────────────────────────
  const ItemsTab = () => (
    <>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
        {[["all","Tudo"],["weapon","Armas"],["armor","Armaduras"],["gear","Outros"]].map(([v,l]) => (
          <button key={v} onClick={() => setItemCat(v)} style={{
            padding: "3px 8px", fontSize: 10, fontFamily: "var(--font-pixel)", cursor: "pointer",
            border: `1px solid ${itemCat === v ? "var(--c-accent)" : "var(--c-edge)"}`,
            background: itemCat === v ? "rgba(167,189,64,0.2)" : "rgba(0,0,0,0.4)",
            color: itemCat === v ? "var(--c-accent-bright)" : "var(--c-ink-d)", borderRadius: 2
          }}>{l}</button>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "var(--c-ink-d)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
        {filteredItems.length} itens encontrados
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: "var(--c-ink-d)", fontSize: 12 }}>Nenhum item encontrado</div>
        ) : filteredItems.map(it => {
          const isExp = expanded === it.id;
          return (
            <div key={it.id} style={rowStyle(isExp)} onClick={() => setExpanded(isExp ? null : it.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, minWidth: 14 }}>
                  {it.isWeapon ? "⚔" : it.isArmor ? "🛡" : "📦"}
                </span>
                <span style={{ flex: 1, fontSize: 12, color: "var(--c-ink)" }}>{it.name}</span>
                {it.damage && <span style={{ fontSize: 10, color: "#e87" }}>{it.damage}</span>}
                {it.ac && <span style={{ fontSize: 10, color: "#7be" }}>CA {it.ac}</span>}
                <EdBadge source={it.source} />
              </div>
              {isExp && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--c-edge-2)" }}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                    {it.weaponCategory && <div><div style={{ fontSize: 9, color: "var(--c-ink-d)" }}>Categoria</div><div style={{ fontSize: 11 }}>{it.weaponCategory}</div></div>}
                    {it.damage2h && <div><div style={{ fontSize: 9, color: "var(--c-ink-d)" }}>2 Mãos</div><div style={{ fontSize: 11 }}>{it.damage2h}</div></div>}
                    {it.range && <div><div style={{ fontSize: 9, color: "var(--c-ink-d)" }}>Alcance</div><div style={{ fontSize: 11 }}>{it.range}</div></div>}
                    {it.value && <div><div style={{ fontSize: 9, color: "var(--c-ink-d)" }}>Preço</div><div style={{ fontSize: 11 }}>{it.value}</div></div>}
                    {it.weight > 0 && <div><div style={{ fontSize: 9, color: "var(--c-ink-d)" }}>Peso</div><div style={{ fontSize: 11 }}>{it.weight} lb</div></div>}
                  </div>
                  {it.properties && <div style={{ fontSize: 10, color: "var(--c-ink-d)", marginBottom: 4 }}>Propriedades: {it.properties}</div>}
                  {it.mastery && <div style={{ fontSize: 10, color: "#c87941", marginBottom: 4 }}>Maestria: {it.mastery}</div>}
                  {it.desc && <div style={{ fontSize: 11, color: "var(--c-ink)", lineHeight: 1.5, marginBottom: 8 }}>{it.desc.slice(0, 200)}{it.desc.length > 200 ? "…" : ""}</div>}
                  {onAddItem && (
                    <button onClick={e => { e.stopPropagation(); onAddItem(it); setExpanded(null); }}
                      style={{ fontSize: 10, padding: "4px 12px", background: "rgba(167,189,64,0.2)", border: "1px solid var(--c-accent)", color: "var(--c-accent-bright)", cursor: "pointer", fontFamily: "var(--font-pixel)" }}>
                      + Adicionar ao Inventário
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  // ── Aba de Talentos ──────────────────────────────────────────
  const FeatsTab = () => (
    <>
      <div style={{ fontSize: 10, color: "var(--c-ink-d)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
        {filteredFeats.length} talentos encontrados
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredFeats.map(f => {
          const isExp = expanded === f.id;
          return (
            <div key={f.id} style={rowStyle(isExp)} onClick={() => setExpanded(isExp ? null : f.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ flex: 1, fontSize: 12, color: "var(--c-ink)" }}>{f.name}</span>
                {f.abilityBonus && <span style={{ fontSize: 10, color: "#9b8" }}>{f.abilityBonus}</span>}
                <EdBadge source={f.source} />
              </div>
              {isExp && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--c-edge-2)" }}>
                  {f.prerequisite && <div style={{ fontSize: 10, color: "#c87941", marginBottom: 6 }}>Requisito: {f.prerequisite}</div>}
                  <div style={{ fontSize: 11, color: "var(--c-ink)", lineHeight: 1.5 }}>{f.desc.slice(0, 300)}{f.desc.length > 300 ? "…" : ""}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  // ── Aba de Antecedentes ──────────────────────────────────────
  const BgsTab = () => (
    <>
      <div style={{ fontSize: 10, color: "var(--c-ink-d)", marginBottom: 6, fontFamily: "var(--font-mono)" }}>
        {filteredBgs.length} antecedentes encontrados
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredBgs.map(b => {
          const isExp = expanded === b.id;
          return (
            <div key={b.id} style={rowStyle(isExp)} onClick={() => setExpanded(isExp ? null : b.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ flex: 1, fontSize: 12, color: "var(--c-ink)" }}>{b.name}</span>
                {b.skills.length > 0 && <span style={{ fontSize: 9, color: "var(--c-ink-d)" }}>{b.skills.slice(0,2).join(", ")}</span>}
                <EdBadge source={b.source} />
              </div>
              {isExp && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--c-edge-2)" }}>
                  {b.summary && <div style={{ fontSize: 10, color: "var(--c-ink-d)", marginBottom: 8, lineHeight: 1.5 }}>{b.summary}</div>}
                  {b.skills.length > 0 && <div style={{ fontSize: 10, marginBottom: 4 }}>Perícias: <span style={{ color: "#9b8" }}>{b.skills.join(", ")}</span></div>}
                  {b.tools.length > 0 && <div style={{ fontSize: 10, marginBottom: 4 }}>Ferramentas: <span style={{ color: "#c87941" }}>{b.tools.join(", ")}</span></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  // ── Render principal ─────────────────────────────────────────
  return (
    <div style={panelStyle}>
      {/* Cabeçalho */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <span style={{ flex: 1, fontFamily: "var(--font-pixel)", fontSize: 11, color: "var(--c-accent-bright)", letterSpacing: "0.1em" }}>
            📖 COMPÊNDIO
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--c-ink-d)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>

        {/* Busca */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar por nome, descrição, escola..."
            value={search}
            onChange={e => { setSearch(e.target.value); setExpanded(null); }}
            onFocus={e => e.target.style.borderColor = "var(--c-accent)"}
            onBlur={e => e.target.style.borderColor = "var(--c-edge)"}
            style={searchStyle}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "var(--c-ink-d)", cursor: "pointer", fontSize: 14
            }}>✕</button>
          )}
        </div>

        {/* Filtro de edição */}
        <EditionFilter />

        {/* Abas */}
        <div style={{ display: "flex", gap: 0, borderTop: "1px solid var(--c-edge-2)" }}>
          {[["spells","Magias"],["items","Itens"],["feats","Talentos"],["backgrounds","Antec."]].map(([t,l]) => (
            <button key={t} onClick={() => { setTab(t); setExpanded(null); }} style={tabBtn(tab === t)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Conteúdo da aba */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px 12px", overflow: "hidden" }}>
        {tab === "spells"      && <SpellsTab />}
        {tab === "items"       && <ItemsTab />}
        {tab === "feats"       && <FeatsTab />}
        {tab === "backgrounds" && <BgsTab />}
      </div>
    </div>
  );
};

window.CompendiumBrowser = CompendiumBrowser;
