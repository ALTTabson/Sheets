/* dm-screen.jsx — Painel do Mestre (DM Screen Mode)
   Exibe mini-cards de todos os personagens simultaneamente.
   Acessado via botão "Modo Mestre" no CharacterSelector. */

const DMScreen = ({ onBack }) => {
  const chars = DATABASE;

  return (
    <div className="dm-screen">
      <div className="dm-bg-layer" style={{
        position: "fixed", inset: 0, zIndex: -2,
        background: "url(https://images.unsplash.com/photo-1548013146-72479768bada?w=2400&q=85) center/cover no-repeat"
      }} />
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }} />

      <div className="dm-header">
        <button className="dm-back-btn" onClick={onBack}>
          <Icon name="chevron-left" size={12} /> VOLTAR
        </button>
        <h1 className="dm-title">
          <Icon name="sword" size={16} /> PAINEL DO MESTRE
        </h1>
        <div className="dm-subtitle">Visão simultânea · {chars.length} personagens</div>
      </div>

      <div className="dm-cards-grid">
        {chars.map(ch => <DMCharCard key={ch.id} ch={ch} />)}
      </div>
    </div>
  );
};

const DMCharCard = ({ ch }) => {
  const conMod = abilityMod(ch.abilities.CON);
  const wisMod = abilityMod(ch.abilities.WIS);
  const passivePerc = 10 + wisMod + (ch.proficiencies.skills.includes("perception") ? ch.profBonus : 0);
  const hpPct = Math.max(0, Math.min(1, ch.hp.current / ch.hp.max));
  const hpColor = hpPct > 0.6 ? "var(--c-accent)" : hpPct > 0.3 ? "#e0a050" : "#d44444";
  const cls = ch.meta.classes.map(c => `${c.name} ${c.level}`).join(" / ");

  return (
    <div className="dm-card">
      <span className="corner-tr" /><span className="corner-bl" />

      {/* Header */}
      <div className="dm-card-header">
        <div className="dm-card-avatar">
          {ch.meta.name.substring(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="dm-card-name">{ch.meta.name}</div>
          <div className="dm-card-sub">{ch.meta.race} · {cls}</div>
        </div>
      </div>

      {/* HP Bar */}
      <div className="dm-hp-section">
        <div className="dm-hp-label">
          <span>PV</span>
          <span style={{ color: hpColor, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
            {ch.hp.current} <span style={{ opacity: 0.6, fontWeight: 400 }}>/ {ch.hp.max}</span>
          </span>
        </div>
        <div className="dm-hp-bar">
          <div className="dm-hp-fill" style={{ width: `${hpPct * 100}%`, background: hpColor }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dm-stats">
        <div className="dm-stat">
          <div className="dm-stat-label">CA</div>
          <div className="dm-stat-value">{ch.ac.base}</div>
        </div>
        <div className="dm-stat">
          <div className="dm-stat-label">INIC</div>
          <div className="dm-stat-value">{fmtMod(abilityMod(ch.abilities.DEX))}</div>
        </div>
        <div className="dm-stat">
          <div className="dm-stat-label">PERC.P</div>
          <div className="dm-stat-value">{passivePerc}</div>
        </div>
        <div className="dm-stat">
          <div className="dm-stat-label">DESL</div>
          <div className="dm-stat-value">{ch.speed.walk}</div>
        </div>
      </div>

      {/* Conditions */}
      {ch.status.conditions && ch.status.conditions.length > 0 && (
        <div className="dm-conditions">
          {ch.status.conditions.map((c, i) => (
            <span key={i} className="dm-condition-badge">{c}</span>
          ))}
        </div>
      )}

      {/* Proficiencies strip */}
      <div className="dm-saves">
        <span className="dm-saves-label">Saves: </span>
        {ch.proficiencies.saves.map(s => (
          <span key={s} className="dm-save-badge">{I18N_PT.abilities[s] || s}</span>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { DMScreen, DMCharCard });
