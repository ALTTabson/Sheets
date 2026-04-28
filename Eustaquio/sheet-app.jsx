/* sheet-app.jsx — root app, tweaks, state */
const { useState, useEffect, useRef } = React;

// Background images (free Unsplash)
const BG_IMAGES = {
  monastery: "https://images.unsplash.com/photo-1548013146-72479768bada?w=2400&q=85",
  forest: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2400&q=85",
  vista: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=2400&q=85"
};

const PALETTES = {
  forest: { bg: "#0d1604", bgRgb: "13, 22, 4", panelRgb: "29, 51, 9", panel: "rgba(15, 26, 6, 0.82)", edge: "#6A804F", edge2: "rgba(106, 128, 79, 0.45)", accent: "#A7BD40", accentRgb: "167, 189, 64", bright: "#C7DA91", blue: "#5C95E0", inkD: "#c7daa1", inkDd: "#8a9a6a", red: "#d97a5a", green: "#A7BD40", gold: "#e0c068" },
  midnight: { bg: "#070a14", bgRgb: "7, 10, 20", panelRgb: "18, 25, 45", panel: "rgba(12, 18, 36, 0.85)", edge: "#3a4a78", edge2: "rgba(58, 74, 120, 0.45)", accent: "#5C95E0", accentRgb: "92, 149, 224", bright: "#9ec0ee", blue: "#5C95E0", inkD: "#b0cfff", inkDd: "#7a90b8", red: "#e07070", green: "#70b8a0", gold: "#c8a840" },
  amber: { bg: "#1a0f04", bgRgb: "26, 15, 4", panelRgb: "45, 30, 15", panel: "rgba(36, 22, 8, 0.82)", edge: "#7a5530", edge2: "rgba(122, 85, 48, 0.45)", accent: "#e0a050", accentRgb: "224, 160, 80", bright: "#f5c878", blue: "#5C95E0", inkD: "#f5d8a0", inkDd: "#b89a6a", red: "#d97a5a", green: "#b0c060", gold: "#e0b040" },
  pink: { bg: "#1a0b12", bgRgb: "26, 11, 18", panelRgb: "45, 20, 30", panel: "rgba(36, 16, 24, 0.82)", edge: "#804f66", edge2: "rgba(128, 79, 102, 0.45)", accent: "#d6659c", accentRgb: "214, 101, 156", bright: "#f291c1", blue: "#5C95E0", inkD: "#f2b6d3", inkDd: "#b87a98", red: "#e06080", green: "#80c090", gold: "#d4b050" },
  purple: { bg: "#0e0914", bgRgb: "14, 9, 20", panelRgb: "25, 15, 40", panel: "rgba(20, 12, 32, 0.82)", edge: "#584078", edge2: "rgba(88, 64, 120, 0.45)", accent: "#946cd4", accentRgb: "148, 108, 212", bright: "#bca4ed", blue: "#5C95E0", inkD: "#d4c4f5", inkDd: "#9a8abd", red: "#b070d0", green: "#80b8a0", gold: "#c8a840" },
  red: { bg: "#1a0505", bgRgb: "26, 5, 5", panelRgb: "45, 15, 15", panel: "rgba(36, 10, 10, 0.82)", edge: "#803030", edge2: "rgba(128, 48, 48, 0.45)", accent: "#d44444", accentRgb: "212, 68, 68", bright: "#f27979", blue: "#5C95E0", inkD: "#f2a0a0", inkDd: "#b86a6a", red: "#e05050", green: "#80c090", gold: "#d4b050" },
  yellow: { bg: "#171404", bgRgb: "23, 20, 4", panelRgb: "40, 35, 10", panel: "rgba(32, 28, 8, 0.82)", edge: "#807020", edge2: "rgba(128, 112, 32, 0.45)", accent: "#d4bc35", accentRgb: "212, 188, 53", bright: "#f2dc79", blue: "#5C95E0", inkD: "#f2e6a0", inkDd: "#b8a86a", red: "#d08030", green: "#a0c050", gold: "#e0c040" }
};

const HEART_COLORS = {
  red: "#e22b2b",
  blue: "#4a90e2",
  green: "#50c878",
  purple: "#9b59b6",
  gold: "#f1c40f",
  pink: "#f368e0"
};

const TWEAKS_DEFAULTS = {
  "background": "monastery",
  "lighting": "day",
  "palette": "forest",
  "ornament": "standard",
  "characterTint": "barbarian",
  "heartColor": "red"
};

/* ============ Character Sheet Engine ============ */
const Sheet = ({ initialData, onBack }) => {
  const [tweaks, setTweak] = useState({ ...TWEAKS_DEFAULTS, ...initialData.tweaks });
  const [tab, setTab] = useState("overview");
  const [ch, setCh] = useState(initialData);
  const [econ, setEcon] = useState(initialData.actionEconomy);
  const [status, setStatus] = useState(initialData.status);
  const [resources, setResources] = useState(initialData.resources);
  const [deathSaves, setDeathSaves] = useState(initialData.hp.deathSaves);
  const [inventory, setInventory] = useState(initialData.inventory);
  const [spells, setSpells] = useState(initialData.spells);
  const [showRestModal, setShowRestModal] = useState(false);
  const [hitDice, setHitDice] = useState(() => {
    if (initialData.hitDice) return JSON.parse(JSON.stringify(initialData.hitDice));
    const dice = {};
    initialData.meta.classes.forEach(c => {
      const clsInfo = Object.values(window.COMPENDIUM?.classes || {}).find(x => x.name === c.name || x.name === c.name.split(" ")[0]) || { hitDie: 8 };
      const d = `d${clsInfo.hitDie}`;
      if (!dice[d]) dice[d] = { max: 0, current: 0 };
      dice[d].max += c.level;
      dice[d].current += c.level;
    });
    return dice;
  });

  const [diceResult, setDiceResult] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [customBg, setCustomBg] = useState(null);
  const [showConditions, setShowConditions] = useState(false);
  const [showCompendium, setShowCompendium] = useState(false);
  const { vfx, flash, triggerRoll, clearVfx } = window.useDiceVFX ? window.useDiceVFX() : { vfx: null, flash: false, triggerRoll: () => { }, clearVfx: () => { } };

  const pushLog = (entry) => setLogEntries(L => [
    { ...entry, t: Date.now(), id: Math.random().toString(36).slice(2) },
    ...L
  ].slice(0, 200));

  const onBgUpload = (file) => {
    if (!file) return;
    if (customBg) URL.revokeObjectURL(customBg);
    const url = URL.createObjectURL(file);
    setCustomBg(url);
    setTweak(t => ({ ...t, background: "custom" }));
    pushLog({ kind: "system", text: `Plano de fundo trocado: ${file.name}` });
  };

  // apply palette
  useEffect(() => {
    const p = PALETTES[tweaks.palette] || PALETTES.forest;
    const r = document.documentElement;
    r.style.setProperty("--c-bg", p.bg);
    r.style.setProperty("--c-bg-rgb", p.bgRgb);
    r.style.setProperty("--c-panel-rgb", p.panelRgb);
    r.style.setProperty("--c-panel", p.panel);
    r.style.setProperty("--c-edge", p.edge);
    r.style.setProperty("--c-edge-2", p.edge2);
    r.style.setProperty("--c-accent", p.accent);
    r.style.setProperty("--c-accent-rgb", p.accentRgb);
    r.style.setProperty("--c-accent-bright", p.bright);
    r.style.setProperty("--c-blue", p.blue);
    r.style.setProperty("--c-ink-d", p.inkD);
    r.style.setProperty("--c-ink-dd", p.inkDd);
    r.style.setProperty("--c-red", p.red);
    r.style.setProperty("--c-green", p.green);
    r.style.setProperty("--c-gold", p.gold);

    // apply heart color
    r.style.setProperty("--c-heart", HEART_COLORS[tweaks.heartColor] || HEART_COLORS.red);
  }, [tweaks.palette, tweaks.heartColor]);

  // apply lighting + ornament data-attrs
  useEffect(() => {
    document.documentElement.dataset.light = tweaks.lighting;
    document.documentElement.dataset.ornament = tweaks.ornament;
  }, [tweaks.lighting, tweaks.ornament]);

  const onRoll = (result) => {
    setDiceResult(result);
    pushLog({ kind: "roll", ...result });
    triggerRoll(result);
  };

  const onHeal = (n) => {
    setCh(c => ({ ...c, hp: { ...c.hp, current: Math.min(c.hp.max, c.hp.current + n) } }));
    pushLog({ kind: "heal", amount: n });
  };
  const onDamage = (n) => {
    setCh(c => ({ ...c, hp: { ...c.hp, current: Math.max(0, c.hp.current - n) } }));
    pushLog({ kind: "damage", amount: n });
  };

  const onRest = (kind) => {
    if (kind === "short") {
      setShowRestModal(true);
      return;
    }

    // Long Rest
    setCh(c => ({ ...c, hp: { ...c.hp, current: c.hp.max } }));
    setResources(r => {
      const out = {};
      for (const [k, v] of Object.entries(r)) out[k] = { ...v, current: v.max };
      return out;
    });
    if (spells) {
      setSpells(st => {
        const next = { ...st };
        if (next.system === "points" && next.points) {
          next.points.current = next.points.max;
        }
        if (next.slots) {
          const newSlots = {};
          for (const [lvl, slot] of Object.entries(next.slots)) newSlots[lvl] = { ...slot, current: slot.max };
          next.slots = newSlots;
        }
        return next;
      });
    }
    setHitDice(hd => {
      const next = { ...hd };
      for (const d in next) {
        next[d].current = Math.min(next[d].max, next[d].current + Math.max(1, Math.floor(next[d].max / 2)));
      }
      return next;
    });
    setStatus(s => ({ ...s, raging: false, recklessAttack: false, exhaustion: Math.max(0, s.exhaustion - 1) }));
    setEcon({ action: true, bonus: true, reaction: true, movement: ch.speed.walk });
    setDiceResult({ label: "Descanso Longo", total: ch.hp.max, nat: ch.hp.max, rolls: [], mod: 0, crit: false, critFail: false });
    pushLog({ kind: "rest", restKind: "long" });
  };

  const finalizeShortRest = () => {
    setResources(r => {
      const out = {};
      for (const [k, v] of Object.entries(r)) {
        out[k] = v.resetsOn === "shortRest" ? { ...v, current: v.max } : v;
      }
      return out;
    });
    setEcon({ action: true, bonus: true, reaction: true, movement: ch.speed.walk });
    pushLog({ kind: "rest", restKind: "short" });
    setShowRestModal(false);
  };

  const tabs = [
    { id: "overview", label: "Visão Geral", num: "01" },
    { id: "combat", label: "Combate", num: "02" },
    { id: "skills", label: "Perícias", num: "03" },
    { id: "inventory", label: "Equipamento", num: "04" },
    { id: "persona", label: "Personagem", num: "05" }
  ];

  if (spells !== null) {
    tabs.push({ id: "spells", label: "Magias", num: "06" });
  }

  return (
    <>
      <div className="bg-layer" style={{ backgroundImage: `url(${tweaks.background === "custom" && customBg ? customBg : BG_IMAGES[tweaks.background] || BG_IMAGES.monastery})` }} />
      <div className="bg-overlay" />
      <div className="bg-tint" />

      <div className="app">
        <div style={{ marginBottom: 14 }}>
          <button className="back-btn" onClick={onBack} style={{ background: 'var(--c-panel)', border: '1px solid var(--c-edge)', color: 'var(--c-ink)', padding: '6px 10px', cursor: 'pointer', fontFamily: 'var(--font-pixel)', fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon name="chevron-left" size={10} /> Voltar
          </button>
        </div>

        <TopBar ch={ch} onRoll={onRoll} status={status} setStatus={setStatus}
          onRest={onRest} lighting={tweaks.lighting}
          setLighting={(v) => setTweak(t => ({ ...t, lighting: v }))}
          palette={tweaks.palette}
          setPalette={(v) => setTweak(t => ({ ...t, palette: v }))}
          heartColor={tweaks.heartColor || "red"}
          setHeartColor={(v) => setTweak(t => ({ ...t, heartColor: v }))}
          background={tweaks.background}
          setBackground={(v) => setTweak(t => ({ ...t, background: v }))}
          onBgUpload={onBgUpload}
          hasCustomBg={!!customBg} />

        {/* B-Plan quick-access buttons */}
        <div style={{ display: "flex", gap: 6, padding: "4px 0 8px", justifyContent: "flex-end" }}>
          {(status.conditions || []).length > 0 && (status.conditions || []).map((c, i) => (
            window.ConditionPip ? <ConditionPip key={i} condition={c} /> : null
          ))}
          <button className="rest-btn" style={{ marginLeft: 8 }} onClick={() => setShowConditions(true)}
            title="Gerenciar Condições">
            ☠ Condições {(status.conditions || []).length > 0 && `(${status.conditions.length})`}
          </button>
          <button className="rest-btn" onClick={() => setShowCompendium(c => !c)}
            title="Abrir Compêndio">
            📖 Compêndio
          </button>
        </div>

        {showRestModal && (
          <ShortRestModal
            ch={ch}
            hitDice={hitDice}
            setHitDice={setHitDice}
            spells={spells}
            setSpells={setSpells}
            onHeal={onHeal}
            onClose={() => setShowRestModal(false)}
            onFinalize={finalizeShortRest}
          />
        )}

        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}>
              <span className="num">{t.num}</span>{t.label}
            </button>
          ))}
          <div className="tab-meta">
            <span className="pill">XP <b>{ch.meta.xp}</b></span>
            <span className="pill"><b>{ch.meta.level}</b>/20</span>
          </div>
        </div>

        {tab === "overview" && (
          <TabOverview ch={ch} onRoll={onRoll}
            deathSaves={deathSaves} setDeathSaves={setDeathSaves}
            onHeal={onHeal} onDamage={onDamage}
            econ={econ} setEcon={setEcon}
            status={status} setStatus={setStatus}
            resources={resources} setResources={setResources} />
        )}
        {tab === "combat" && (
          <TabCombat ch={ch} onRoll={onRoll}
            econ={econ} setEcon={setEcon}
            status={status} setStatus={setStatus}
            resources={resources} setResources={setResources} />
        )}
        {tab === "skills" && <TabSkills ch={ch} onRoll={onRoll} />}
        {tab === "inventory" && <TabInventory ch={ch} inventory={inventory} setInventory={setInventory} />}
        {tab === "persona" && <TabPersona ch={ch} />}
        {tab === "spells" && <TabSpells ch={ch} spells={spells} setSpells={setSpells} />}
      </div>

      <DiceResult result={diceResult} onClose={() => setDiceResult(null)} />
      <RollLog entries={logEntries} onClear={() => setLogEntries([])} />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Estilo">
          <TweakRadio label="Ornamento" value={tweaks.ornament}
            onChange={(v) => setTweak(t => ({ ...t, ornament: v }))}
            options={[
              { value: "minimal", label: "Mínimo" },
              { value: "standard", label: "Padrão" }
            ]} />
          <TweakSelect label="Classe (Tinta)" value={tweaks.characterTint}
            onChange={(v) => setTweak(t => ({ ...t, characterTint: v }))}
            options={[
              { value: "barbarian", label: "Bárbaro" },
              { value: "wizard", label: "Mago" },
              { value: "rogue", label: "Ladino" }
            ]} />
        </TweakSection>
      </TweaksPanel>

      {/* B2: Condition Visual Overlay */}
      {window.ConditionOverlay && <ConditionOverlay conditions={status.conditions} />}

      {/* B2: Condition Manager Modal */}
      {showConditions && window.ConditionManager && (
        <ConditionManager
          conditions={status.conditions || []}
          onConditionsChange={(c) => setStatus(s => ({ ...s, conditions: c }))}
          onClose={() => setShowConditions(false)}
        />
      )}

      {/* B3: Compendium Browser Panel */}
      {showCompendium && window.CompendiumBrowser && (
        <CompendiumBrowser
          onAddSpell={(s) => spells && setSpells(st => ({ ...st, known: [...st.known, s] }))}
          onAddItem={(it) => setInventory(inv => [...inv, { ...it, qty: 1, equipped: false }])}
          onClose={() => setShowCompendium(false)}
        />
      )}

      {/* B4: Dice VFX */}
      {vfx && window.DiceVFX && <DiceVFX face={vfx.face} isCrit={vfx.isCrit} isCritFail={vfx.isCritFail} onDone={clearVfx} />}
      {flash && window.DamageFlash && <DamageFlash active={flash} />}
    </>
  );
};

/* ============ Character Selector ============ */
/* ============ Character Selector ============ */
const CharacterSelector = ({ onSelect, onEdit, onDMMode }) => {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
      background: 'url(https://images.unsplash.com/photo-1548013146-72479768bada?w=2400&q=85) center/cover no-repeat',
      color: '#fff', fontFamily: 'var(--font-body)', position: 'relative'
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}></div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 1000, padding: 40 }}>
        <div style={{ marginBottom: 60, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-pixel)', color: 'var(--c-accent-bright)', fontSize: 32, textShadow: '0 4px 10px rgba(0,0,0,0.8)', letterSpacing: '0.1em' }}>D&D SHEET ENGINE</h1>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-ink-d)', fontSize: 14, marginTop: 10, letterSpacing: '0.2em' }}>DATA CENTER</div>
        </div>

        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
          {DATABASE.map(ch => (
            <div key={ch.id} style={{ width: 220, background: 'rgba(15, 26, 6, 0.85)', border: '1px solid var(--c-edge)', padding: '30px 20px', textAlign: 'center', transition: 'all 0.2s ease', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} className="char-card">
              <span className="corner-tr"></span>
              <span className="corner-bl"></span>
              <div style={{ width: 90, height: 90, background: 'linear-gradient(135deg, var(--c-edge) 0%, #000 100%)', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontFamily: 'var(--font-pixel)', border: '2px solid var(--c-accent)' }}>
                {ch.meta.name.substring(0, 1).toUpperCase()}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontFamily: 'var(--font-pixel)', lineHeight: 1.4 }}>{ch.meta.name}</h3>
              <div style={{ fontSize: 12, color: 'var(--c-ink-d)', marginBottom: 15, fontFamily: 'var(--font-mono)' }}>{ch.meta.classes.map(c => c.name).join(' / ')} nv {ch.meta.level}</div>
              
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="sel-btn play" onClick={() => onSelect(ch)}>JOGAR</button>
                <button className="sel-btn edit" onClick={() => onEdit(ch)}>EDITAR</button>
              </div>
            </div>
          ))}

          <div style={{ width: 220, cursor: 'pointer', background: 'rgba(0, 0, 0, 0.5)', border: '1px dashed var(--c-edge)', padding: '30px 20px', textAlign: 'center', transition: 'all 0.2s ease', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className="char-card new-char" onClick={() => alert("Criador de Fichas será implementado na Fase 3 do Roadmap!")}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--c-edge)' }}>+</div>
            <h3 style={{ margin: '0', fontSize: 12, fontFamily: 'var(--font-pixel)', color: 'var(--c-ink-d)' }}>CRIAR NOVO</h3>
          </div>
        </div>
      </div>

      {/* DM Mode button */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 30 }}>
        <button onClick={onDMMode} style={{ padding: '10px 24px', background: 'rgba(0,0,0,0.6)', border: '1px solid var(--c-edge)', color: 'var(--c-ink-d)', fontFamily: 'var(--font-pixel)', fontSize: 10, cursor: 'pointer', letterSpacing: '0.1em', transition: 'all 0.2s ease' }}
          onMouseOver={e => { e.target.style.borderColor = 'var(--c-accent)'; e.target.style.color = 'var(--c-accent-bright)'; }}
          onMouseOut={e => { e.target.style.borderColor = 'var(--c-edge)'; e.target.style.color = 'var(--c-ink-d)'; }}>
          ⚗ MODO MESTRE
        </button>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .char-card:hover { border-color: var(--c-accent-bright); transform: translateY(-5px); background: rgba(29, 51, 9, 0.95) !important; }
        .char-card.new-char:hover { background: rgba(167, 189, 64, 0.1) !important; color: var(--c-accent-bright); }
        .char-card.new-char:hover div { color: var(--c-accent-bright) !important; }
      `}} />
    </div>
  );
};

const App = () => {
  const [activeCharacter, setActiveCharacter] = useState(null);
  const [editorTarget, setEditorTarget] = useState(null);
  const [dmMode, setDmMode] = useState(false);
  const [tiles, setTiles] = useState(false);

  const triggerTransition = (fn) => {
    setTiles(true);
    setTimeout(() => {
      fn();
      setTimeout(() => setTiles(false), 400);
    }, 400);
  };

  const handleSelect = (ch) => triggerTransition(() => setActiveCharacter(ch));
  const handleEdit = (ch) => triggerTransition(() => setEditorTarget(ch));
  const handleSave = (updated) => triggerTransition(() => {
    setActiveCharacter(updated);
    setEditorTarget(null);
  });
  const handleBack = () => triggerTransition(() => {
    setActiveCharacter(null);
    setEditorTarget(null);
  });

  if (dmMode) {
    return <DMScreen onBack={() => setDmMode(false)} />;
  }

  return (
    <>
      {editorTarget ? (
        <CharacterEditor ch={editorTarget} onSave={handleSave} onBack={handleBack} />
      ) : activeCharacter ? (
        <Sheet key={activeCharacter.id} initialData={activeCharacter} onBack={handleBack} />
      ) : (
        <CharacterSelector onSelect={handleSelect} onEdit={handleEdit} onDMMode={() => setDmMode(true)} />
      )}

      {tiles && (
        <div className="tile-transition">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="tile" style={{ animationDelay: `${(i % 10) * 40 + Math.floor(i / 10) * 40}ms` }} />
          ))}
        </div>
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
