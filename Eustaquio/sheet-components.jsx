/* sheet-components.jsx — UI primitives */
const { useState, useEffect, useRef } = React;

/* ============ Pixel corners helper ============ */
const Panel = ({ children, className = "", style }) => (
  <div className={`panel ${className}`} style={style}>
    <span className="corner-tr"></span>
    <span className="corner-bl"></span>
    {children}
  </div>
);

/* ============ Tooltip ============ */
let tooltipEl = null;
function showTooltip(e, html) {
  if (!tooltipEl) {
    tooltipEl = document.createElement("div");
    tooltipEl.className = "tooltip";
    document.body.appendChild(tooltipEl);
  }
  tooltipEl.innerHTML = html;
  const r = e.currentTarget.getBoundingClientRect();
  tooltipEl.style.left = (r.left + r.width / 2 - tooltipEl.offsetWidth / 2) + "px";
  tooltipEl.style.top = (r.bottom + 8) + "px";
  tooltipEl.style.display = "block";
}
function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = "none";
}

/* ============ Dice roller ============ */
function rollD20(mod, label, opts = {}) {
  const { advantage = false, disadvantage = false } = opts;
  let rolls;
  let nat;
  if (advantage && !disadvantage) {
    const a = 1 + Math.floor(Math.random() * 20);
    const b = 1 + Math.floor(Math.random() * 20);
    rolls = [a, b];
    nat = Math.max(a, b);
  } else if (disadvantage && !advantage) {
    const a = 1 + Math.floor(Math.random() * 20);
    const b = 1 + Math.floor(Math.random() * 20);
    rolls = [a, b];
    nat = Math.min(a, b);
  } else {
    nat = 1 + Math.floor(Math.random() * 20);
    rolls = [nat];
  }
  const total = nat + mod;
  return { label, total, nat, rolls, mod, advantage, disadvantage,
    crit: nat === 20, critFail: nat === 1 };
}

const DiceResult = ({ result, onClose }) => {
  if (!result) return null;
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [result]);
  const cls = result.crit ? "crit" : result.critFail ? "crit-fail" : "";
  return (
    <div className="dice-roller">
      <div className={`dice-result ${cls}`}>
        <div className="dice-label">{result.label}{result.advantage && " · VANT."}{result.disadvantage && " · DESV."}</div>
        <div className="dice-total">
          {result.total}
          <span className="bk">
            ({result.rolls.length > 1 ? `${result.rolls.join(", ")} → ${result.nat}` : result.nat}{" "}
            {fmtMod(result.mod)})
          </span>
        </div>
        <div className="dice-detail">
          {result.crit ? "✦ Crítico!" : result.critFail ? "✦ Falha crítica" : `1d20${fmtMod(result.mod)}`}
        </div>
      </div>
    </div>
  );
};

/* TopBar, Vitals → topbar.jsx */
/* HPHeart, ShortRestModal → hp-heart.jsx */

/* ============ Ability stones ============ */
const AbilityStones = ({ ch, onRoll }) => {
  const order = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  return (
    <div className="abilities">
      {order.map(a => {
        const mod = abilityMod(ch.abilities[a]);
        const isProf = ch.proficiencies.saves.includes(a);
        return (
          <button key={a} className={`ability ${isProf ? "save-prof" : ""}`}
            onClick={(e) => onRoll(rollD20(mod, `Teste de ${I18N_PT.abilitiesLong[a]}`,
              { advantage: e.shiftKey, disadvantage: e.altKey }))}
            onMouseEnter={(e) => showTooltip(e,
              `<b>${I18N_PT.abilitiesLong[a]}</b> · pontuação ${ch.abilities[a]}<br/>` +
              `Mod: ${fmtMod(mod)}${isProf ? ` · Resist.: ${fmtMod(mod + ch.profBonus)}` : ""}<br/>` +
              `<span class="ttbreak">Click rola teste · Shift = vantagem</span>`)}
            onMouseLeave={hideTooltip}>
            <span className="save-mark"></span>
            <div className="lbl">{I18N_PT.abilities[a]}</div>
            <div className="ability-mod">{fmtMod(mod)}</div>
            <div className="ability-score">{ch.abilities[a]}</div>
          </button>
        );
      })}
    </div>
  );
};

/* ============ Action economy & action lists ============ */
const ActionEconomy = ({ econ, setEcon }) => (
  <div className="econ">
    {[["action", "AÇÃO"], ["bonus", "BÔNUS"], ["reaction", "REAÇÃO"]].map(([k, label]) => (
      <button key={k} className={`econ-pip ${econ[k] ? "on" : "spent"}`}
        onClick={() => setEcon(e => ({ ...e, [k]: !e[k] }))}>
        <div className="pip-label">{label}</div>
        <div className="pip-state">{econ[k] ? "Disponível" : "Usado"}</div>
      </button>
    ))}
  </div>
);

const ActionList = ({ actions, onRoll, ch, resources, setResources, status, setStatus }) => (
  <div className="action-list">
    {actions.map(a => {
      const hasRes = a.resource && resources[a.resource];
      const resState = hasRes ? resources[a.resource] : null;
      const isToggleOn = a.toggles && status[a.toggles];
      return (
        <div key={a.id}
          className={`action-row ${a.attack ? "has-attack" : ""}`}
          onClick={() => {
            if (a.attack) {
              const atkMod = parseInt(a.attack.replace("+", ""));
              const adv = status.recklessAttack;
              onRoll(rollD20(atkMod, `${a.name} · Ataque`, { advantage: adv }));
            } else if (a.toggles) {
              setStatus(s => ({ ...s, [a.toggles]: !s[a.toggles] }));
              if (hasRes && !isToggleOn && resState.current > 0) {
                setResources(r => ({ ...r, [a.resource]: { ...r[a.resource], current: r[a.resource].current - 1 } }));
              }
            } else if (hasRes && resState.current > 0) {
              setResources(r => ({ ...r, [a.resource]: { ...r[a.resource], current: r[a.resource].current - 1 } }));
            }
          }}>
          <div>
            <div className="name">
              {isToggleOn && <span style={{color:"var(--c-red)",marginRight:6,display:"inline-flex",verticalAlign:"-2px"}}><Icon name="flame" size={12}/></span>}{a.name}
              {hasRes && <span className="resource-tag" style={{display:"inline-flex",marginLeft:8,fontSize:10}}>· {resState.current}/{resState.max}</span>}
            </div>
            <div className="desc">{a.desc}</div>
          </div>
          {a.attack && (
            <div className="attack-stats">
              <span className="stat-tag atk">ATQ {a.attack}</span>
              <span className="stat-tag dmg">{a.damage} {a.damageType?.slice(0,4)}</span>
            </div>
          )}
        </div>
      );
    })}
  </div>
);

/* ============ Resources block ============ */
const Resources = ({ resources, setResources }) => (
  <div className="resources">
    {Object.entries(resources).map(([key, r]) => (
      <div key={key} className="res-row">
        <span className="res-icon" style={{color:"var(--c-accent)",display:"inline-flex"}}><Icon name={r.icon} size={18}/></span>
        <div>
          <div className="res-name">{r.label.toUpperCase()}</div>
          {r.die && <div className="res-die">{r.die}</div>}
        </div>
        <div className="res-pips">
          {Array.from({ length: r.max }).map((_, i) => (
            <button key={i} className={`res-pip ${i < r.current ? "on" : ""}`}
              onClick={() => {
                setResources(rs => ({ ...rs, [key]: { ...rs[key], current: i < rs[key].current ? i : i + 1 } }));
              }}/>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ============ Status chips ============ */
const StatusBar = ({ status, setStatus }) => {
  const chips = [
    { k: "raging", label: "FÚRIA", cls: "rage" },
    { k: "recklessAttack", label: "IMPRUDENTE", cls: "rage" },
    { k: "blessed", label: "ABENÇOADO", cls: "bless" },
    { k: "hasted", label: "ACELERADO", cls: "haste" },
  ];
  return (
    <div className="status-bar">
      {chips.map(c => (
        <button key={c.k} className={`status-chip ${c.cls} ${status[c.k] ? "on" : ""}`}
          onClick={() => setStatus(s => ({ ...s, [c.k]: !s[c.k] }))}>
          <span style={{display:"inline-flex",marginRight:5,verticalAlign:"-2px"}}><Icon name={status[c.k] ? "dot" : "ring"} size={10}/></span>{c.label}
        </button>
      ))}
      <div style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--c-ink-dd)" }}>
        EXAUSTÃO {status.exhaustion}/6
      </div>
    </div>
  );
};

/* ============ Skills list ============ */
const SkillsList = ({ ch, onRoll }) => {
  const skills = Object.keys(SKILLS).sort((a, b) => I18N_PT.skills[a].localeCompare(I18N_PT.skills[b]));
  return (
    <div className="skills-list">
      {skills.map(id => {
        const ab = SKILLS[id];
        const mod = abilityMod(ch.abilities[ab]);
        const isProf = ch.proficiencies.skills.includes(id);
        const isExp = ch.proficiencies.expertise.includes(id);
        const bonus = mod + (isExp ? 2 * ch.profBonus : isProf ? ch.profBonus : 0);
        return (
          <button key={id} className={`skill-row ${isProf ? "prof" : ""}`}
            onClick={(e) => onRoll(rollD20(bonus, I18N_PT.skills[id],
              { advantage: e.shiftKey, disadvantage: e.altKey }))}>
            <span className={`skill-dot ${isExp ? "expert" : isProf ? "prof" : ""}`}></span>
            <span className="ab">{I18N_PT.abilities[ab]}</span>
            <span className="nm">{I18N_PT.skills[id]}</span>
            <span className="bonus">{fmtMod(bonus)}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ============ Saves grid ============ */
const SavesGrid = ({ ch, onRoll }) => {
  const order = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  return (
    <div className="saves-grid">
      {order.map(a => {
        const mod = abilityMod(ch.abilities[a]);
        const isProf = ch.proficiencies.saves.includes(a);
        const bonus = mod + (isProf ? ch.profBonus : 0);
        return (
          <button key={a} className={`save-card ${isProf ? "prof" : ""}`}
            onClick={() => onRoll(rollD20(bonus, `Resistência de ${I18N_PT.abilitiesLong[a]}`))}>
            <span className="lab" style={{display:"inline-flex",alignItems:"center",gap:6}}><Icon name={isProf ? "dot" : "ring"} size={9}/>{I18N_PT.abilities[a]}</span>
            <span className="val">{fmtMod(bonus)}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ============ Item Editor Modal ============ */
const EMPTY_ITEM = { name: "", qty: 1, weight: 0, equipped: false, notes: "" };

const ItemEditor = ({ item, onSave, onCancel, onDelete }) => {
  const isNew = !item;
  const [draft, setDraft] = useState(item ? { ...item } : EMPTY_ITEM);
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const valid = draft.name.trim().length > 0;
  const save = () => {
    if (!valid) return;
    onSave({
      ...draft,
      name: draft.name.trim(),
      qty: Math.max(1, parseInt(draft.qty) || 1),
      weight: Math.max(0, parseFloat(draft.weight) || 0),
      notes: (draft.notes || "").trim()
    });
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <h3>{isNew ? "✦ NOVO ITEM" : "✦ EDITAR ITEM"}</h3>
        <div className="field">
          <label>Nome</label>
          <input autoFocus value={draft.name} onChange={(e) => set("name", e.target.value)}
            placeholder="Espada longa, Poção de Cura, etc."/>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Quantidade</label>
            <input type="number" min="1" value={draft.qty} onChange={(e) => set("qty", e.target.value)}/>
          </div>
          <div className="field">
            <label>Peso (lb por unidade)</label>
            <input type="number" min="0" step="0.1" value={draft.weight} onChange={(e) => set("weight", e.target.value)}/>
          </div>
        </div>
        <div className="field">
          <label>Notas</label>
          <textarea rows="3" value={draft.notes || ""} onChange={(e) => set("notes", e.target.value)}
            placeholder="Dano, propriedades, descrição..."/>
        </div>
        <div className="field">
          <label className="checkbox-row">
            <input type="checkbox" checked={!!draft.equipped} onChange={(e) => set("equipped", e.target.checked)}/>
            <span>Equipado</span>
          </label>
        </div>
        <div className="actions">
          {!isNew && onDelete && (
            <button className="modal-btn danger" onClick={onDelete}
              style={{ marginRight: "auto" }}>
              <Icon name="trash" size={11}/> Excluir
            </button>
          )}
          <button className="modal-btn" onClick={onCancel}>Cancelar</button>
          <button className="modal-btn primary"
            onClick={save} disabled={!valid}
            style={{ opacity: valid ? 1 : 0.4, cursor: valid ? "pointer" : "not-allowed" }}>
            {isNew ? "Adicionar" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============ Roll Log / Console ============ */
const RollLog = ({ entries, onClear }) => {
  const [open, setOpen] = useState(true);
  const [pulse, setPulse] = useState(false);
  const lastIdRef = useRef(null);
  const listRef = useRef(null);
  useEffect(() => {
    if (entries[0] && entries[0].id !== lastIdRef.current) {
      lastIdRef.current = entries[0].id;
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
  }, [entries]);
  const fmt = (e) => {
    const t = new Date(e.t);
    const hh = String(t.getHours()).padStart(2, "0");
    const mm = String(t.getMinutes()).padStart(2, "0");
    const ss = String(t.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };
  const renderLine = (e) => {
    if (e.kind === "roll") {
      const modStr = e.mod >= 0 ? `+${e.mod}` : `${e.mod}`;
      const detail = e.rolls.length > 1
        ? `[${e.rolls.join(",")}→${e.nat}]${modStr}`
        : `[${e.nat}]${modStr}`;
      const adv = e.advantage ? " VANT" : e.disadvantage ? " DESV" : "";
      const tag = e.crit ? " ✦CRÍT" : e.critFail ? " ✗FALHA" : "";
      return (
        <>
          <span className="lg-tag">»</span>
          <span className="lg-label">{e.label}{adv}</span>
          <span className="lg-detail">{detail}</span>
          <span className={`lg-total ${e.crit ? "crit" : e.critFail ? "fail" : ""}`}>= {e.total}{tag}</span>
        </>
      );
    }
    if (e.kind === "heal") return (
      <>
        <span className="lg-tag heal">+</span>
        <span className="lg-label">Cura</span>
        <span className="lg-total heal">+{e.amount} PV</span>
      </>
    );
    if (e.kind === "damage") return (
      <>
        <span className="lg-tag dmg">−</span>
        <span className="lg-label">Dano</span>
        <span className="lg-total dmg">−{e.amount} PV</span>
      </>
    );
    if (e.kind === "rest") return (
      <>
        <span className="lg-tag rest">~</span>
        <span className="lg-label">{e.restKind === "long" ? "Descanso Longo" : "Descanso Curto"}</span>
        <span className="lg-detail">recursos restaurados</span>
      </>
    );
    if (e.kind === "system") return (
      <>
        <span className="lg-tag sys">·</span>
        <span className="lg-label" style={{ fontStyle: "italic" }}>{e.text}</span>
      </>
    );
    return null;
  };
  return (
    <div className={`roll-log ${open ? "open" : "closed"} ${pulse ? "pulse" : ""}`}>
      <div className="rl-header" onClick={() => setOpen(o => !o)}>
        <span className="rl-prompt">▸</span>
        <span className="rl-title">CONSOLE</span>
        <span className="rl-count">{entries.length}</span>
        <span className="rl-spacer"/>
        {open && entries.length > 0 && (
          <button className="rl-clear" onClick={(e) => { e.stopPropagation(); onClear(); }}>
            <Icon name="trash" size={10}/>
          </button>
        )}
        <button className="rl-toggle">{open ? "▾" : "▴"}</button>
      </div>
      {open && (
        <div className="rl-body" ref={listRef}>
          {entries.length === 0 ? (
            <div className="rl-empty">› aguardando rolagens...<span className="rl-cursor">▍</span></div>
          ) : entries.map(e => (
            <div key={e.id} className="rl-line">
              <span className="rl-time">{fmt(e)}</span>
              {renderLine(e)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============ Spell Editor Modal ============ */
const EMPTY_SPELL = { name: "", level: 1, time: "1 Ação", range: "60 ft", desc: "", dmg: "", type: "" };

const SpellEditor = ({ spell, onSave, onCancel, onDelete }) => {
  const isNew = !spell;
  const [draft, setDraft] = useState(spell ? { ...spell } : EMPTY_SPELL);
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const valid = draft.name.trim().length > 0;

  const save = () => {
    if (!valid) return;
    onSave({
      ...draft,
      name: draft.name.trim(),
      level: parseInt(draft.level) || 0,
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <h3>{isNew ? "✦ NOVA MAGIA" : "✦ EDITAR MAGIA"}</h3>
        <div className="field">
          <label>Nome</label>
          <input autoFocus value={draft.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Nível (0 para Truque)</label>
            <input type="number" min="0" max="9" value={draft.level} onChange={(e) => set("level", e.target.value)} />
          </div>
          <div className="field">
            <label>Tempo de Conjuração</label>
            <input value={draft.time} onChange={(e) => set("time", e.target.value)} placeholder="1 Ação, Bônus, Reação" />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Alcance</label>
            <input value={draft.range} onChange={(e) => set("range", e.target.value)} />
          </div>
          <div className="field">
            <label>Dano e Tipo (ex: 8d6 Fogo)</label>
            <input value={draft.dmg} onChange={(e) => set("dmg", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Descrição</label>
          <textarea rows="4" value={draft.desc} onChange={(e) => set("desc", e.target.value)} />
        </div>
        <div className="actions">
          {!isNew && onDelete && (
            <button className="modal-btn danger" onClick={onDelete} style={{ marginRight: "auto" }}>
              <Icon name="trash" size={11}/> Excluir
            </button>
          )}
          <button className="modal-btn" onClick={onCancel}>Cancelar</button>
          <button className="modal-btn primary" onClick={save} disabled={!valid} style={{ opacity: valid ? 1 : 0.4 }}>
            {isNew ? "Adicionar" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  Panel, DiceResult, AbilityStones,
  ActionEconomy, ActionList, Resources, StatusBar, SkillsList, SavesGrid,
  rollD20, showTooltip, hideTooltip, ItemEditor, RollLog, SpellEditor
});
