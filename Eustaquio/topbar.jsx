/* topbar.jsx — TopBar + Vitals */
const { useState, useEffect, useRef } = React;

const TopBar = ({ ch, onRoll, status, setStatus, onRest, lighting, setLighting, palette, setPalette, heartColor, setHeartColor, background, setBackground, onBgUpload, hasCustomBg, onReset }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const fileRef = useRef(null);
  useEffect(() => {
    if (!settingsOpen) return;
    const onDoc = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [settingsOpen]);
  const cls = ch.meta.classes.map(c => `${c.name} ${c.level}`).join(" / ");
  const lightLabel = { day: "Dia", dusk: "Crepúsculo", night: "Noite" }[lighting];
  const paletteLabel = { forest: "Mata", midnight: "Noturna", amber: "Âmbar", pink: "Rosa", purple: "Roxa", red: "Vermelha", yellow: "Amarela" }[palette];
  const heartLabel = { red: "Vermelho", blue: "Azul", green: "Verde", purple: "Roxo", gold: "Dourado", pink: "Rosa" }[heartColor];
  const bgLabel = { monastery: "Monastério", forest: "Floresta", vista: "Vale", custom: "Personalizado" }[background] || "—";
  return (
    <div className="topbar">
      <div className="identity-block">
        <div className="portrait" title={ch.meta.name}>{ch.meta.name.substring(0,2).toUpperCase()}</div>
        <div className="identity">
          <div className="name">{ch.meta.name}</div>
          <div className="sub">
            <b>{ch.meta.race}</b> · {cls} · <b>Nv {ch.meta.level}</b> · {ch.meta.alignment}
          </div>
        </div>
      </div>

      <Vitals ch={ch} status={status} setStatus={setStatus} />

      <div className="tools">
        <button className={`icon-btn ${status.inspiration ? "active" : ""}`}
          onClick={() => setStatus(s => ({ ...s, inspiration: !s.inspiration }))}
          title="Inspiração"><Icon name="star" size={18} fill={status.inspiration ? "currentColor" : "none"}/></button>
        <button className="rest-btn" onClick={() => onRest("short")}><Icon name="hourglass" size={12}/> CURTO</button>
        <button className="rest-btn" onClick={() => onRest("long")}><Icon name="bed" size={12}/> LONGO</button>
        <div className="topbar-sep"></div>
        <div className="settings-wrap" ref={settingsRef}>
          <button className={`icon-btn ${settingsOpen ? "active" : ""}`}
            onClick={() => setSettingsOpen(o => !o)} title="Configurações">
            <Icon name="gear" size={16}/>
          </button>
          {settingsOpen && (
            <div className="settings-menu">
              <div>
                <div className="sm-label"><Icon name="sun" size={10}/> ILUMINAÇÃO · {lightLabel}</div>
                <div className="sm-row">
                  <button className={`sm-btn ${lighting === "day" ? "active" : ""}`}
                    onClick={() => setLighting("day")}><Icon name="sun" size={11}/> Dia</button>
                  <button className={`sm-btn ${lighting === "dusk" ? "active" : ""}`}
                    onClick={() => setLighting("dusk")}><Icon name="dusk" size={11}/> Cre.</button>
                  <button className={`sm-btn ${lighting === "night" ? "active" : ""}`}
                    onClick={() => setLighting("night")}><Icon name="moon" size={11}/> Noi.</button>
                </div>
              </div>
              <div>
                <div className="sm-label"><Icon name="palette" size={10}/> PALETA · {paletteLabel}</div>
                <div className="sm-row">
                  <button className={`sm-btn ${palette === "forest" ? "active" : ""}`} onClick={() => setPalette("forest")}>Mata</button>
                  <button className={`sm-btn ${palette === "midnight" ? "active" : ""}`} onClick={() => setPalette("midnight")}>Noturna</button>
                  <button className={`sm-btn ${palette === "amber" ? "active" : ""}`} onClick={() => setPalette("amber")}>Âmbar</button>
                </div>
                <div className="sm-row" style={{ marginTop: 4 }}>
                  <button className={`sm-btn ${palette === "pink" ? "active" : ""}`} onClick={() => setPalette("pink")}>Rosa</button>
                  <button className={`sm-btn ${palette === "purple" ? "active" : ""}`} onClick={() => setPalette("purple")}>Roxa</button>
                  <button className={`sm-btn ${palette === "red" ? "active" : ""}`} onClick={() => setPalette("red")}>Verm</button>
                  <button className={`sm-btn ${palette === "yellow" ? "active" : ""}`} onClick={() => setPalette("yellow")}>Ama</button>
                </div>
              </div>
              <div>
                <div className="sm-label"><Icon name="heart" size={10}/> COR DO CORAÇÃO · {heartLabel}</div>
                <div className="sm-row">
                  <button className={`sm-btn ${heartColor === "red" ? "active" : ""}`} onClick={() => setHeartColor("red")}>Verm</button>
                  <button className={`sm-btn ${heartColor === "blue" ? "active" : ""}`} onClick={() => setHeartColor("blue")}>Azul</button>
                  <button className={`sm-btn ${heartColor === "green" ? "active" : ""}`} onClick={() => setHeartColor("green")}>Verde</button>
                </div>
                <div className="sm-row" style={{ marginTop: 4 }}>
                  <button className={`sm-btn ${heartColor === "purple" ? "active" : ""}`} onClick={() => setHeartColor("purple")}>Roxo</button>
                  <button className={`sm-btn ${heartColor === "gold" ? "active" : ""}`} onClick={() => setHeartColor("gold")}>Dour</button>
                  <button className={`sm-btn ${heartColor === "pink" ? "active" : ""}`} onClick={() => setHeartColor("pink")}>Rosa</button>
                </div>
              </div>
              <div>
                <div className="sm-label"><Icon name="image" size={10}/> CENÁRIO · {bgLabel}</div>
                <div className="sm-row">
                  <button className={`sm-btn ${background === "monastery" ? "active" : ""}`}
                    onClick={() => setBackground("monastery")}>Monast.</button>
                  <button className={`sm-btn ${background === "forest" ? "active" : ""}`}
                    onClick={() => setBackground("forest")}>Flor.</button>
                  <button className={`sm-btn ${background === "vista" ? "active" : ""}`}
                    onClick={() => setBackground("vista")}>Vale</button>
                </div>
                <div className="sm-row" style={{ marginTop: 4 }}>
                  <button className={`sm-btn ${background === "custom" ? "active" : ""}`}
                    onClick={() => fileRef.current?.click()}
                    style={{ flex: 1 }}>
                    <Icon name="plus" size={10}/> Enviar imagem
                  </button>
                  {hasCustomBg && background !== "custom" && (
                    <button className="sm-btn" onClick={() => setBackground("custom")}>
                      Usar
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => { onBgUpload && onBgUpload(e.target.files?.[0]); e.target.value = ""; }}/>
              </div>
              <div>
                <div className="sm-label">DADOS</div>
                <div className="sm-row">
                  <button className="sm-btn" style={{ flex: 1, color: "var(--c-red)" }} onClick={onReset}>
                    Resetar Ficha
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Vitals = ({ ch, status }) => {
  let initMod = abilityMod(ch.abilities[ch.initiative?.base || "DEX"]);
  if (ch.initiative?.modifiers) {
    ch.initiative.modifiers.forEach(modKey => {
      initMod += abilityMod(ch.abilities[modKey]);
    });
  }
  const passivePerception = 10 + abilityMod(ch.abilities.WIS) + (ch.proficiencies.skills.includes("perception") ? ch.profBonus : 0);
  return (
    <div className="vitals">
      <div className="vital hp">
        <div className="lbl">PV</div>
        <div className="val">
          <span style={{ color: "var(--c-accent-bright)" }}>{ch.hp.current}</span>
          <span className="sep">/</span>
          <span className="max">{ch.hp.max}</span>
        </div>
        <div className="hp-bar"><span style={{ width: `${(ch.hp.current / ch.hp.max) * 100}%` }}></span></div>
      </div>
      <div className="vital">
        <div className="lbl">CA</div>
        <div className="val">{ch.ac.base}</div>
      </div>
      <div className="vital">
        <div className="lbl">INIC</div>
        <div className="val">{fmtMod(initMod)}</div>
      </div>
      <div className="vital">
        <div className="lbl">DESL</div>
        <div className="val">{ch.speed.walk}</div>
      </div>
      <div className="vital">
        <div className="lbl">PROF</div>
        <div className="val">+{ch.profBonus}</div>
      </div>
      <div className="vital">
        <div className="lbl">PERC.P</div>
        <div className="val">{passivePerception}</div>
      </div>
    </div>
  );
};

Object.assign(window, { TopBar, Vitals });
