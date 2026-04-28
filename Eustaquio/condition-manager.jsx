/* condition-manager.jsx — Sistema de Condições Dinâmicas (B2)
   Modal para adicionar/remover condições D&D 5e.
   As condições afetam visualmente o fundo e mecanicamente as rolagens. */

const CONDITION_VISUALS = {
  poisoned:    { overlay: "rgba(60,140,40,0.18)",  label: "Envenenado",    icon: "skull" },
  blinded:     { overlay: "rgba(0,0,0,0.5)",        label: "Cego",          icon: "eye-off" },
  frightened:  { overlay: "rgba(120,30,30,0.25)",   label: "Amedrontado",   icon: "zap" },
  paralyzed:   { overlay: "rgba(60,100,200,0.22)",  label: "Paralisado",    icon: "lock" },
  stunned:     { overlay: "rgba(200,200,0,0.18)",   label: "Atordoado",     icon: "circle" },
  prone:       { overlay: "rgba(100,60,20,0.22)",   label: "Caído",         icon: "arrow-down" },
  grappled:    { overlay: "rgba(150,80,0,0.20)",    label: "Agarrado",      icon: "anchor" },
  restrained:  { overlay: "rgba(140,50,10,0.22)",   label: "Refreado",      icon: "lock" },
  incapacitated: { overlay: "rgba(100,0,120,0.22)", label: "Incapacitado",  icon: "zap-off" },
  unconscious: { overlay: "rgba(10,10,40,0.55)",    label: "Inconsciente",  icon: "moon" },
  exhaustion1: { overlay: "rgba(80,60,20,0.15)",    label: "Exaustão 1",    icon: "clock" },
  exhaustion2: { overlay: "rgba(80,60,20,0.25)",    label: "Exaustão 2",    icon: "clock" },
  exhaustion3: { overlay: "rgba(80,60,20,0.35)",    label: "Exaustão 3",    icon: "clock" },
  blessed:     { overlay: "rgba(240,220,80,0.12)",  label: "Abençoado",     icon: "star" },
  hasted:      { overlay: "rgba(80,220,180,0.14)",  label: "Acelerado",     icon: "zap" },
  invisible:   { overlay: "rgba(180,180,255,0.10)", label: "Invisível",     icon: "eye-off" },
  concentrating: { overlay: "rgba(120,80,220,0.14)",label: "Concentração",  icon: "target" },
};

// Expõe a map globalmente para que o sheet-app possa aplicar o overlay
window.CONDITION_VISUALS = CONDITION_VISUALS;

/* ---- ConditionOverlay: aplica fundo colorido quando condição ativa ---- */
const ConditionOverlay = ({ conditions }) => {
  const active = (conditions || []).filter(c => CONDITION_VISUALS[c]);
  if (active.length === 0) return null;

  // Combina overlays empilhando backgrounds
  const overlays = active.map(c => CONDITION_VISUALS[c].overlay).join(", ");
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0,
      background: overlays,
      pointerEvents: "none",
      transition: "background 0.6s ease",
      mixBlendMode: "multiply"
    }} />
  );
};

/* ---- ConditionPip: badge na topbar ---- */
const ConditionPip = ({ condition }) => {
  const info = CONDITION_VISUALS[condition];
  if (!info) return null;
  return (
    <span className="condition-pip" title={info.label}
      style={{ background: info.overlay.replace(/[\d.]+\)$/, "0.8)") }}>
      {info.label.split(" ")[0]}
    </span>
  );
};

/* ---- ConditionManager: modal principal ---- */
const ConditionManager = ({ conditions, onConditionsChange, onClose }) => {
  const allConditions = Object.entries(CONDITION_VISUALS);

  const toggle = (key) => {
    const current = conditions || [];
    if (current.includes(key)) {
      onConditionsChange(current.filter(c => c !== key));
    } else {
      onConditionsChange([...current, key]);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ color: "var(--c-accent)", fontFamily: "var(--font-pixel)", fontSize: 14, margin: 0 }}>
            CONDIÇÕES
          </h2>
          <button className="icon-btn" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
        </div>
        <p style={{ color: "var(--c-ink-d)", fontSize: 11, marginBottom: 16, lineHeight: 1.4 }}>
          Condições ativas aplicam efeitos visuais e mecânicos. Clique para ativar ou desativar.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {allConditions.map(([key, info]) => {
            const isOn = (conditions || []).includes(key);
            return (
              <button key={key} onClick={() => toggle(key)}
                style={{
                  padding: "10px 14px", textAlign: "left",
                  background: isOn ? info.overlay.replace(/[\d.]+\)$/, "0.35)") : "rgba(0,0,0,0.35)",
                  border: `1px solid ${isOn ? "var(--c-accent)" : "var(--c-edge-2)"}`,
                  color: isOn ? "var(--c-accent-bright)" : "var(--c-ink-dd)",
                  fontFamily: "var(--font-body)", fontSize: 12,
                  cursor: "pointer", transition: "all 0.15s ease",
                  display: "flex", alignItems: "center", gap: 8,
                  borderRadius: 2
                }}>
                <span style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: isOn ? "var(--c-accent)" : "transparent",
                  border: "1px solid var(--c-edge)", flexShrink: 0,
                  transition: "all 0.15s ease"
                }} />
                {info.label}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button className="modal-btn primary" onClick={onClose} style={{ margin: 0 }}>
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ConditionManager, ConditionOverlay, ConditionPip, CONDITION_VISUALS });
