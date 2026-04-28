/* sheet-tabs.jsx — tab-level views */
const { useState, useRef } = React;

/* ============ Visão Geral ============ */
const TabOverview = ({ ch, onRoll, deathSaves, setDeathSaves, onHeal, onDamage,
  econ, setEcon, status, setStatus, resources, setResources }) => (
  <div className="grid-overview">
    {/* LEFT: Abilities + Saves */}
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel>
        <div className="section-head">Atributos <span className="count">click p/ rolar</span></div>
        <AbilityStones ch={ch} onRoll={onRoll} />
      </Panel>
      <Panel>
        <div className="section-head">Resistências</div>
        <SavesGrid ch={ch} onRoll={onRoll} />
      </Panel>
    </div>

    {/* CENTER: Action economy + Actions */}
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel>
        <div className="section-head">Economia de Ações</div>
        <ActionEconomy econ={econ} setEcon={setEcon} />
        <StatusBar status={status} setStatus={setStatus} />
      </Panel>
      <Panel>
        <div className="section-head">Ações <span className="count">{ch.features.actions.length}</span></div>
        <ActionList actions={ch.features.actions} onRoll={onRoll}
          ch={ch} resources={resources} setResources={setResources}
          status={status} setStatus={setStatus} />
      </Panel>
      <div className="grid-2">
        <Panel>
          <div className="section-head">Ações Bônus <span className="count">{ch.features.bonusActions.length}</span></div>
          <ActionList actions={ch.features.bonusActions} onRoll={onRoll}
            ch={ch} resources={resources} setResources={setResources}
            status={status} setStatus={setStatus} />
        </Panel>
        <Panel>
          <div className="section-head">Reações <span className="count">{ch.features.reactions.length}</span></div>
          <ActionList actions={ch.features.reactions} onRoll={onRoll}
            ch={ch} resources={resources} setResources={setResources}
            status={status} setStatus={setStatus} />
        </Panel>
      </div>
    </div>

    {/* RIGHT: HP + Resources */}
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel>
        <div className="section-head">Vitalidade</div>
        <HPHeart ch={ch} deathSaves={deathSaves} setDeathSaves={setDeathSaves}
          onHeal={onHeal} onDamage={onDamage} />
      </Panel>
      <Panel>
        <div className="section-head">Recursos</div>
        <Resources resources={resources} setResources={setResources} />
      </Panel>
      <Panel>
        <div className="section-head">Características Passivas <span className="count">{ch.features.passives.length}</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ch.features.passives.map(p => (
            <div key={p.id} className="feature-card">
              <div className="fnm">{p.name}</div>
              <div className="fdesc">{p.desc}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  </div>
);

/* ============ Combate ============ */
const TabCombat = ({ ch, onRoll, econ, setEcon, status, setStatus, resources, setResources }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel>
        <div className="section-head">Economia de Ações</div>
        <ActionEconomy econ={econ} setEcon={setEcon} />
        <StatusBar status={status} setStatus={setStatus} />
      </Panel>
      <Panel>
        <div className="section-head">Ações <span className="count">{ch.features.actions.length}</span></div>
        <ActionList actions={ch.features.actions} onRoll={onRoll}
          ch={ch} resources={resources} setResources={setResources}
          status={status} setStatus={setStatus} />
      </Panel>
      <Panel>
        <div className="section-head">Reações <span className="count">{ch.features.reactions.length}</span></div>
        <ActionList actions={ch.features.reactions} onRoll={onRoll}
          ch={ch} resources={resources} setResources={setResources}
          status={status} setStatus={setStatus} />
      </Panel>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel>
        <div className="section-head">Recursos</div>
        <Resources resources={resources} setResources={setResources} />
      </Panel>
      <Panel>
        <div className="section-head">Ações Bônus <span className="count">{ch.features.bonusActions.length}</span></div>
        <ActionList actions={ch.features.bonusActions} onRoll={onRoll}
          ch={ch} resources={resources} setResources={setResources}
          status={status} setStatus={setStatus} />
      </Panel>
      <Panel>
        <div className="section-head">Resistências de Dano</div>
        <div className="conditions">
          <span className="cond" style={{ borderColor: "var(--c-accent)", color: "var(--c-accent-bright)" }}>
            ⛨ Em Fúria: TODOS exceto psíquico (Urso)
          </span>
        </div>
      </Panel>
      <Panel>
        <div className="section-head">Condições Ativas</div>
        <div className="conditions">
          {status.conditions.length === 0
            ? <span className="cond empty">Nenhuma condição ativa</span>
            : status.conditions.map(c => <span key={c} className="cond">{c}</span>)}
        </div>
      </Panel>
    </div>
  </div>
);

/* ============ Perícias ============ */
const TabSkills = ({ ch, onRoll }) => (
  <div className="grid-2">
    <Panel>
      <div className="section-head">Perícias <span className="count">click rola · shift = vantagem</span></div>
      <SkillsList ch={ch} onRoll={onRoll} />
    </Panel>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel>
        <div className="section-head">Resistências</div>
        <SavesGrid ch={ch} onRoll={onRoll} />
      </Panel>
      <Panel>
        <div className="section-head">Atributos</div>
        <AbilityStones ch={ch} onRoll={onRoll} />
      </Panel>
      <Panel>
        <div className="section-head">Proficiências</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
          <div><b style={{ color: "var(--c-accent-bright)", fontFamily: "var(--font-pixel)", fontSize: 9, letterSpacing: ".08em" }}>ARMADURAS </b><span style={{ color: "var(--c-ink-d)" }}>{ch.proficiencies.armor.join(", ")}</span></div>
          <div><b style={{ color: "var(--c-accent-bright)", fontFamily: "var(--font-pixel)", fontSize: 9, letterSpacing: ".08em" }}>ARMAS </b><span style={{ color: "var(--c-ink-d)" }}>{ch.proficiencies.weapons.join(", ")}</span></div>
          <div><b style={{ color: "var(--c-accent-bright)", fontFamily: "var(--font-pixel)", fontSize: 9, letterSpacing: ".08em" }}>IDIOMAS </b><span style={{ color: "var(--c-ink-d)" }}>{ch.proficiencies.languages.join(", ")}</span></div>
        </div>
      </Panel>
    </div>
  </div>
);

/* ============ Equipamento ============ */
const TabInventory = ({ ch, inventory, setInventory }) => {
  const totalWeight = inventory.reduce((s, i) => s + i.weight * i.qty, 0);
  const dragIdx = useRef(null);
  const [overIdx, setOverIdx] = useState(null);
  const [editing, setEditing] = useState(null); // { mode: 'new'|'edit', index, item }
  const startNew = () => setEditing({ mode: "new" });
  const startEdit = (i) => setEditing({ mode: "edit", index: i, item: inventory[i] });
  const saveItem = (it) => {
    if (editing.mode === "new") {
      setInventory(arr => [...arr, it]);
    } else {
      setInventory(arr => arr.map((x, idx) => idx === editing.index ? it : x));
    }
    setEditing(null);
  };
  const deleteItem = () => {
    setInventory(arr => arr.filter((_, idx) => idx !== editing.index));
    setEditing(null);
  };
  return (
    <div className="grid-2">
      <Panel>
        <div className="section-head">Inventário <span className="count">{inventory.length} itens · arrasta p/ reordenar</span></div>
        <div>
          {inventory.map((it, i) => (
            <div key={i}
              className={`inv-row ${it.equipped ? "equipped" : ""} ${dragIdx.current === i ? "dragging" : ""} ${overIdx === i ? "drag-over" : ""}`}
              draggable
              onDragStart={() => { dragIdx.current = i; }}
              onDragOver={(e) => { e.preventDefault(); setOverIdx(i); }}
              onDragLeave={() => setOverIdx(null)}
              onDrop={(e) => {
                e.preventDefault();
                const from = dragIdx.current; const to = i;
                if (from === null || from === to) return;
                setInventory(arr => {
                  const copy = [...arr];
                  const [m] = copy.splice(from, 1);
                  copy.splice(to, 0, m);
                  return copy;
                });
                dragIdx.current = null; setOverIdx(null);
              }}
              onDragEnd={() => { dragIdx.current = null; setOverIdx(null); }}>
              <span className="grip"><Icon name="grip" size={14} /></span>
              <div>
                <div className="nm" style={{ display: "flex", alignItems: "center", gap: 6 }}>{it.equipped && <Icon name="sword" size={12} />}{it.name}</div>
                {it.notes && <div className="nt">{it.notes}</div>}
              </div>
              <span className="qty">×{it.qty}</span>
              <span className="wt">{it.weight}lb</span>
              <span className="row-tools" onMouseDown={(e) => e.stopPropagation()}>
                <button className="row-tool" title="Editar"
                  onClick={(e) => { e.stopPropagation(); startEdit(i); }}>
                  <Icon name="pencil" size={12} />
                </button>
              </span>
            </div>
          ))}
        </div>
        <button className="add-item-btn" onClick={startNew}>
          <Icon name="plus" size={11} /> ADICIONAR ITEM
        </button>
      </Panel>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Panel>
          <div className="section-head">Moedas</div>
          <div className="currency">
            <div className="coin cp"><div className="label">CP</div><div className="amt">{ch.currency.cp}</div></div>
            <div className="coin sp"><div className="label">SP</div><div className="amt">{ch.currency.sp}</div></div>
            <div className="coin ep"><div className="label">EP</div><div className="amt">{ch.currency.ep}</div></div>
            <div className="coin gp"><div className="label">GP</div><div className="amt">{ch.currency.gp}</div></div>
            <div className="coin pp"><div className="label">PP</div><div className="amt">{ch.currency.pp}</div></div>
          </div>
        </Panel>
        <Panel>
          <div className="section-head">Carga <span className="count">{ch.encumbrance.notes}</span></div>
          <div className="encumb-text">
            <span>Carregando: <b style={{ color: "var(--c-accent-bright)" }}>{totalWeight} lb</b></span>
            <span>Máx: {ch.encumbrance.max} lb</span>
          </div>
          <div className="encumbrance">
            <div className="encumb-bar">
              <div className="encumb-fill" style={{ width: `${Math.min(100, (totalWeight / ch.encumbrance.max) * 100)}%` }} />
              <div className="encumb-marker" style={{ left: `${(ch.encumbrance.light / ch.encumbrance.max) * 100}%` }} data-label={`Leve ${ch.encumbrance.light}`} />
              <div className="encumb-marker" style={{ left: `${(ch.encumbrance.heavy / ch.encumbrance.max) * 100}%` }} data-label={`Pesado ${ch.encumbrance.heavy}`} />
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="section-head">Equipados</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {inventory.filter(i => i.equipped).map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "rgba(167, 189, 64, 0.08)", borderLeft: "2px solid var(--c-accent)" }}>
                <span style={{ color: "var(--c-accent-bright)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="sword" size={12} />{it.name}</span>
                <span style={{ color: "var(--c-ink-dd)", fontSize: 11, fontFamily: "var(--font-mono)" }}>{it.weight}lb</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      {editing && (
        <ItemEditor
          item={editing.item}
          onSave={saveItem}
          onCancel={() => setEditing(null)}
          onDelete={editing.mode === "edit" ? deleteItem : undefined} />
      )}
    </div>
  );
};

/* ============ Personagem ============ */
const TabPersona = ({ ch }) => (
  <div className="persona-grid">
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="portrait-xl">
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 12 }}>{ch.meta.name.toUpperCase()}</div>
          <div style={{ fontSize: 9, color: "var(--c-ink-dd)" }}>[ retrato ]</div>
        </div>
      </div>
      <Panel>
        <div className="section-head">Identidade</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
          <div><span style={{ color: "var(--c-ink-dd)", fontFamily: "var(--font-pixel)", fontSize: 8, letterSpacing: ".1em" }}>RAÇA</span><br /><b>{ch.meta.race}</b></div>
          <div><span style={{ color: "var(--c-ink-dd)", fontFamily: "var(--font-pixel)", fontSize: 8, letterSpacing: ".1em" }}>CLASSES</span><br />
            {ch.meta.classes.map((c, i) => (
              <div key={i}><b>{c.name} {c.level}</b> <span style={{ color: "var(--c-ink-dd)" }}>· {c.subclass}</span></div>
            ))}
          </div>
          <div><span style={{ color: "var(--c-ink-dd)", fontFamily: "var(--font-pixel)", fontSize: 8, letterSpacing: ".1em" }}>ANTECEDENTE</span><br /><b>{ch.meta.background}</b></div>
          <div><span style={{ color: "var(--c-ink-dd)", fontFamily: "var(--font-pixel)", fontSize: 8, letterSpacing: ".1em" }}>TENDÊNCIA</span><br /><b>{ch.meta.alignment}</b></div>
          <div><span style={{ color: "var(--c-ink-dd)", fontFamily: "var(--font-pixel)", fontSize: 8, letterSpacing: ".1em" }}>JOGADOR</span><br /><b>{ch.meta.player}</b></div>
        </div>
      </Panel>
      {ch.physical && (
        <Panel>
          <div className="section-head">Atributos Físicos</div>
          <div className="physical-grid">
            <div className="ph-cell"><div className="lbl">IDADE</div><div className="val">{ch.physical.age}</div></div>
            <div className="ph-cell"><div className="lbl">ALTURA</div><div className="val">{ch.physical.height}</div></div>
            <div className="ph-cell"><div className="lbl">PESO</div><div className="val">{ch.physical.weight}</div></div>
            <div className="ph-cell"><div className="lbl">OLHOS</div><div className="val">{ch.physical.eyes}</div></div>
            <div className="ph-cell"><div className="lbl">PELE</div><div className="val">{ch.physical.skin}</div></div>
            <div className="ph-cell"><div className="lbl">CABELO</div><div className="val">{ch.physical.hair}</div></div>
          </div>
        </Panel>
      )}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel>
        <div className="section-head">História</div>
        <div className="story-block">
          <h4>Antecedente</h4>
          <p>{ch.story.backstory}</p>
        </div>
        <div className="grid-2">
          <div className="story-block"><h4>Vínculos</h4><p>{ch.story.bonds}</p></div>
          <div className="story-block"><h4>Ideais</h4><p>{ch.story.ideals}</p></div>
          <div className="story-block"><h4>Defeitos</h4><p>{ch.story.flaws}</p></div>
          <div className="story-block"><h4>Personalidade</h4><p>{ch.story.personality}</p></div>
        </div>
    </div>
  </div>
);

const SPELL_POINT_COSTS = {
  1: 2, 2: 3, 3: 5, 4: 6, 5: 7, 6: 9, 7: 10, 8: 11, 9: 13
};

/* ============ Magias ============ */
const TabSpells = ({ ch, spells, setSpells }) => {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  if (!spells) return <div style={{ padding: 20, textAlign: "center", color: "var(--c-ink-dd)" }}>Este personagem não possui magias.</div>;

  const ab = spells.castingAbility || "INT";
  const mod = abilityMod(ch.abilities[ab]);
  const dc = 8 + mod + ch.profBonus;
  const atk = mod + ch.profBonus;

  const startNew = () => setEditing({ mode: "new" });
  const startEdit = (idx) => setEditing({ mode: "edit", index: idx, spell: spells.known[idx] });

  const saveSpell = (s) => {
    if (editing.mode === "new") {
      setSpells(st => ({ ...st, known: [...st.known, s] }));
    } else {
      setSpells(st => ({ ...st, known: st.known.map((x, i) => i === editing.index ? s : x) }));
    }
    setEditing(null);
  };
  const deleteSpell = () => {
    setSpells(st => ({ ...st, known: st.known.filter((_, i) => i !== editing.index) }));
    setEditing(null);
  };

  const castWithPoints = (lvl) => {
    if (lvl === 0 || spells.system !== "points" || !spells.points) return;
    const cost = SPELL_POINT_COSTS[lvl];
    if (spells.points.current >= cost) {
      setSpells(st => ({ ...st, points: { ...st.points, current: st.points.current - cost } }));
    } else {
      alert(`Pontos insuficientes! Requer ${cost} pontos.`);
    }
  };

  const filteredSpells = spells.known.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.desc && s.desc.toLowerCase().includes(search.toLowerCase())));
  const levels = [...new Set(filteredSpells.map(s => s.level))].sort();

  return (
    <div className="grid-2">
      <Panel>
        <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Grimório</span>
          <button className="add-item-btn" onClick={startNew} style={{ margin: 0, padding: "2px 8px" }}>
            <Icon name="plus" size={10} /> ADICIONAR MAGIA
          </button>
        </div>
        <div style={{ marginBottom: 15 }}>
          <input type="text" placeholder="Pesquisar magia..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.5)", border: "1px solid var(--c-edge)", color: "#fff", fontFamily: "var(--font-body)", outline: "none" }} />
        </div>

        {levels.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--c-ink-dd)" }}>Nenhuma magia encontrada.</div>
        ) : (
          levels.map(lvl => (
            <div key={lvl} style={{ marginBottom: 20 }}>
              <h4 style={{ color: "var(--c-accent)", borderBottom: "1px solid var(--c-edge)", paddingBottom: 4, marginBottom: 10 }}>
                {lvl === 0 ? "Truques (Nível 0)" : `Nível ${lvl}`}
                {spells.system === "points" && lvl > 0 && <span style={{fontSize: 10, color: "var(--c-ink-dd)", marginLeft: 8}}>(Custo: {SPELL_POINT_COSTS[lvl]} pts)</span>}
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {filteredSpells.filter(s => s.level === lvl).map((s, idx) => {
                  const realIdx = spells.known.indexOf(s);
                  return (
                    <div key={realIdx} className="feature-card" style={{ position: "relative" }}>
                      <button className="row-tool" style={{ position: "absolute", top: 8, right: 8 }} onClick={() => startEdit(realIdx)}>
                        <Icon name="pencil" size={12} />
                      </button>
                      <div className="fnm">{s.name}</div>
                      <div style={{ fontSize: 11, color: "var(--c-ink-d)", marginBottom: 6 }}>
                        Tempo: <b>{s.time}</b> | Alcance: <b>{s.range}</b>
                        {s.dmg && ` | Efeito: ${s.dmg} ${s.type}`}
                      </div>
                      <div className="fdesc">{s.desc}</div>
                      {spells.system === "points" && lvl > 0 && (
                        <button style={{ marginTop: 8, width: "100%", padding: 6, background: "rgba(0,0,0,0.3)", border: "1px solid var(--c-accent)", color: "var(--c-accent-bright)", borderRadius: 4, fontFamily: "var(--font-pixel)", fontSize: 8, cursor: "pointer" }}
                                onClick={() => castWithPoints(lvl)}>
                          CONJURAR (-{SPELL_POINT_COSTS[lvl]} pts)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </Panel>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Panel>
          <div className="section-head">Atributos de Conjuração</div>
          <div className="vitals">
            <div className="vital">
              <div className="lbl">HAB.</div>
              <div className="val">{I18N_PT.abilities[ab]}</div>
            </div>
            <div className="vital">
              <div className="lbl">CD MAGIA</div>
              <div className="val">{dc}</div>
            </div>
            <div className="vital">
              <div className="lbl">ATAQUE</div>
              <div className="val">{fmtMod(atk)}</div>
            </div>
          </div>
        </Panel>

        {spells.system === "points" && spells.points && (
          <Panel>
            <div className="section-head">Pontos de Magia</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 32, fontFamily: "var(--font-mono)", color: "var(--c-accent-bright)", textShadow: "0 2px 10px rgba(167, 189, 64, 0.4)" }}>
                  {spells.points.current}
                </span>
                <span style={{ fontSize: 16, color: "var(--c-ink-d)", fontFamily: "var(--font-mono)" }}>
                  / {spells.points.max}
                </span>
              </div>
              
              <div style={{ display: "flex", gap: 8 }}>
                <button className="res-pip on" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, borderRadius: "50%" }} onClick={() => setSpells(st => ({...st, points: {...st.points, current: Math.max(0, st.points.current - 1)}}))}>-</button>
                <button className="res-pip on" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, borderRadius: "50%" }} onClick={() => setSpells(st => ({...st, points: {...st.points, current: Math.min(st.points.max, st.points.current + 1)}}))}>+</button>
              </div>
              
              <div style={{ width: "100%", marginTop: 12, borderTop: "1px dashed var(--c-edge-2)", paddingTop: 12 }}>
                <div style={{ fontSize: 10, color: "var(--c-accent)", marginBottom: 8, fontFamily: "var(--font-pixel)", textAlign: "center" }}>CUSTOS (Nível : Pontos)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--c-ink-d)" }}>
                  <span>1º:2</span><span>2º:3</span><span>3º:5</span><span>4º:6</span><span>5º:7</span><span>6º:9</span><span>7º:10</span><span>8º:11</span><span>9º:13</span>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {spells.system !== "points" && Object.keys(spells.slots || {}).length > 0 && (
          <Panel>
            <div className="section-head">Espaços de Magia (Slots)</div>
            <div className="resources">
              {Object.entries(spells.slots).map(([lvl, slot]) => (
                <div key={lvl} className="res-row">
                  <div style={{ width: 60 }}><b>Nível {lvl}</b></div>
                  <div className="res-pips">
                    {Array.from({ length: slot.max }).map((_, i) => (
                      <button key={i} className={`res-pip ${i < slot.current ? "on" : ""}`}
                        onClick={() => {
                          setSpells(st => ({
                            ...st,
                            slots: { ...st.slots, [lvl]: { ...slot, current: i < slot.current ? i : i + 1 } }
                          }));
                        }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {editing && (
        <SpellEditor spell={editing.spell} onSave={saveSpell} onCancel={() => setEditing(null)} onDelete={editing.mode === "edit" ? deleteSpell : undefined} />
      )}
    </div>
  );
};

Object.assign(window, { TabOverview, TabCombat, TabSkills, TabInventory, TabPersona, TabSpells });
