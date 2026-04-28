/* hp-heart.jsx — HPHeart + ShortRestModal */

const HEART_MAP = [
  "  XXX   XXX  ",
  " XXXXX XXXXX ",
  "XXXXXXXXXXXXX",
  "XXXXXXXXXXXXX",
  "XXXXXXXXXXXXX",
  " XXXXXXXXXXX ",
  "  XXXXXXXXX  ",
  "   XXXXXXX   ",
  "    XXXXX    ",
  "     XXX     ",
  "      X      "
];

const HPHeart = ({ ch, deathSaves, setDeathSaves, onHeal, onDamage }) => {
  const pct = Math.max(0, Math.min(1, ch.hp.current / ch.hp.max));
  const [manualHp, setManualHp] = React.useState("");

  const bgPixels = React.useMemo(() => {
    const pixels = [];
    for (let r = 0; r < HEART_MAP.length; r++) {
      for (let c = 0; c < HEART_MAP[r].length; c++) {
        if (HEART_MAP[r][c] === 'X') {
          pixels.push(<rect key={`bg-${r}-${c}`} x={c} y={r} width="1.05" height="1.05" fill="rgba(0,0,0,0.5)" />);
        }
      }
    }
    return pixels;
  }, []);

  const fgPixels = React.useMemo(() => {
    const pixels = [];
    for (let r = 0; r < HEART_MAP.length; r++) {
      for (let c = 0; c < HEART_MAP[r].length; c++) {
        if (HEART_MAP[r][c] === 'X') {
          const delay = (Math.random() * 2).toFixed(2);
          const dur = (2 + Math.random()).toFixed(2);
          pixels.push(<rect key={`fg-${r}-${c}`} x={c} y={r} width="1.05" height="1.05" className="pixel-pulse" style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }} />);
        }
      }
    }
    return pixels;
  }, []);

  return (
    <div className="hp-block">
      <div className="hp-ring-big" style={{ width: 140, height: 140, position: "relative", margin: "10px auto" }}>
        <svg viewBox="-1 -1 15 13" width="100%" height="100%" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))", transform: "none" }}>
          <defs>
            <clipPath id="hpClip">
              <rect x="-1" y={11 * (1 - pct)} width="15" height={11 * pct} style={{ transition: "all 0.4s ease" }} />
            </clipPath>
          </defs>
          <g>{bgPixels}</g>
          <g clipPath="url(#hpClip)">{fgPixels}</g>
        </svg>
        <div className="hp-ring-inner" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
          <div className="hp-cur" style={{ color: "#fff", fontSize: 32, fontFamily: "var(--font-mono)", fontWeight: 700, lineHeight: 1 }}>{ch.hp.current}</div>
          <div className="hp-max" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontFamily: "var(--font-mono)" }}>/ {ch.hp.max}</div>
          <div className="hp-lbl" style={{ color: "var(--c-accent-bright)", fontSize: 8, fontFamily: "var(--font-pixel)", letterSpacing: "0.1em", marginTop: 4 }}>PV</div>
        </div>
      </div>
      <div className="hp-controls" style={{ marginBottom: 8 }}>
        <button className="hp-btn dmg" onClick={() => onDamage(5)}>−5 DANO</button>
        <button className="hp-btn dmg" onClick={() => onDamage(1)}>−1</button>
        <button className="hp-btn heal" onClick={() => onHeal(1)}>+1</button>
        <button className="hp-btn heal" onClick={() => onHeal(5)}>+5 CURA</button>
      </div>
      <div className="hp-manual-row">
        <input type="number" placeholder="0" value={manualHp} onChange={e => setManualHp(e.target.value)}
          className="hp-manual-input" />
        <button className="hp-btn dmg" style={{ padding: "4px 10px", flex: "none" }} onClick={() => { if(manualHp) { onDamage(parseInt(manualHp)); setManualHp(""); } }}>DANO</button>
        <button className="hp-btn heal" style={{ padding: "4px 10px", flex: "none" }} onClick={() => { if(manualHp) { onHeal(parseInt(manualHp)); setManualHp(""); } }}>CURA</button>
      </div>
      <div className="death-saves">
        <div className="group">
          <div className="glbl">SUCESSOS</div>
          <div className="pips">
            {[1,2,3].map(i => (
              <button key={i} className={`pip ${i <= deathSaves.success ? "on success" : ""}`}
                onClick={() => setDeathSaves(d => ({ ...d, success: i === d.success ? i-1 : i }))}/>
            ))}
          </div>
        </div>
        <div className="group">
          <div className="glbl">FALHAS</div>
          <div className="pips">
            {[1,2,3].map(i => (
              <button key={i} className={`pip ${i <= deathSaves.fail ? "on fail" : ""}`}
                onClick={() => setDeathSaves(d => ({ ...d, fail: i === d.fail ? i-1 : i }))}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ShortRestModal = ({ ch, hitDice, setHitDice, spells, setSpells, onHeal, onClose, onFinalize }) => {
  const [arcaneUsed, setArcaneUsed] = React.useState(false);
  const rollHitDie = (die) => {
    if (hitDice[die].current <= 0) return;
    setHitDice(prev => ({ ...prev, [die]: { ...prev[die], current: prev[die].current - 1 } }));
    const face = parseInt(die.substring(1));
    const roll = Math.floor(Math.random() * face) + 1;
    const conMod = abilityMod(ch.abilities.CON);
    const healAmount = Math.max(1, roll + conMod);
    onHeal(healAmount);
  };

  const hasArcaneRecovery = ch.features.passives?.some(p => p.id === "arcaneRecovery");
  
  const handleArcaneRecovery = () => {
    if (!spells || arcaneUsed) return;
    
    // Nível de recuperação: metade do nível de mago arredondado pra cima.
    // Usamos o ch.meta.level como referência por simplicidade.
    const recoveryLevel = Math.ceil(ch.meta.level / 2);
    
    if (spells.system === "points" && spells.points) {
      // Regra da variante: Recupera pontos igual ao custo combinado dos slots.
      // Para simplificar, assumimos que seria o equivalente a 1 slot do nível mais alto possível (até o recoveryLevel),
      // ou apenas pontos diretamente. Na variante (DMG 289), recuperar X níveis de slots = recuperar pontos.
      // 1 nível = 2, 2 níveis = 3, 3 níveis = 5, 4 níveis = 6.
      // Mapearemos o custo correspondente ao nível de recuperação como se fosse um único slot desse nível,
      // ou a soma de slots de nível 1. Vamos seguir a tabela de custos de pontos de magia.
      const SPELL_POINT_COSTS = { 1: 2, 2: 3, 3: 5, 4: 6, 5: 7, 6: 9, 7: 10, 8: 11, 9: 13 };
      const ptsToRecover = SPELL_POINT_COSTS[recoveryLevel] || (recoveryLevel * 2);
      
      setSpells(st => ({ 
        ...st, 
        points: { 
          ...st.points, 
          current: Math.min(st.points.max, st.points.current + ptsToRecover) 
        } 
      }));
    }
    setArcaneUsed(true);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="rest-modal-title">Descanso Curto</h2>
        <p className="rest-modal-desc">
          Role seus Dados de Vida para recuperar pontos de vida. Seu modificador de CON (+{abilityMod(ch.abilities.CON)}) será adicionado a cada rolagem.
        </p>
        <div className="rest-die-list">
          {Object.entries(hitDice).map(([die, stats]) => (
            <div key={die} className="rest-die-row">
              <div className="rest-die-label">
                <Icon name="heart" size={16} />
                <span className="rest-die-name">{die}</span>
              </div>
              <div className="rest-die-count-wrap">
                <span className="rest-die-count">{stats.current} / {stats.max}</span>
                <button className="modal-btn"
                  onClick={() => rollHitDie(die)}
                  disabled={stats.current <= 0}
                  style={{ margin: 0, padding: "6px 12px", background: stats.current > 0 ? "rgba(var(--c-accent-rgb), 0.2)" : "rgba(0,0,0,0.5)", borderColor: stats.current > 0 ? "var(--c-accent)" : "var(--c-edge)" }}>
                  ROLAR
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {hasArcaneRecovery && (
          <div style={{ marginTop: 20, borderTop: "1px dashed var(--c-edge-2)", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "var(--c-accent)", marginBottom: 4 }}>RECUPERAÇÃO ARCANA</div>
                <div style={{ fontSize: 12, color: "var(--c-ink-d)" }}>Recupera slots / pontos de magia.</div>
              </div>
              <button className="modal-btn" onClick={handleArcaneRecovery} disabled={arcaneUsed || !spells} style={{ margin: 0 }}>
                {arcaneUsed ? "UTILIZADO" : "USAR"}
              </button>
            </div>
          </div>
        )}

        <div className="rest-modal-actions">
          <button className="modal-btn" onClick={onClose} style={{ flex: 1 }}>CANCELAR</button>
          <button className="modal-btn primary" onClick={onFinalize} style={{ flex: 2 }}>FINALIZAR DESCANSO</button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { HEART_MAP, HPHeart, ShortRestModal });
