/* character-editor.jsx — Fullscreen Editor + Compendium */
const { useState, useEffect, useMemo } = React;

const CharacterEditor = ({ ch: initialCh, onSave, onBack }) => {
  const [ch, setCh] = useState(JSON.parse(JSON.stringify(initialCh)));
  const [activeTab, setActiveTab] = useState("spells");
  const [search, setSearch] = useState("");
  const [editionFilter, setEditionFilter] = useState("all"); // all, 2014, 2024
  const [expandedItem, setExpandedItem] = useState(null);

  // Derived stats calculation (simplified for editor preview)
  const mods = useMemo(() => {
    const m = {};
    for (const [a, val] of Object.entries(ch.abilities)) {
      m[a] = Math.floor((val - 10) / 2);
    }
    return m;
  }, [ch.abilities]);

  const handleAbilityChange = (ab, val) => {
    setCh(prev => ({
      ...prev,
      abilities: { ...prev.abilities, [ab]: parseInt(val) || 0 }
    }));
  };

  const filteredCompendium = useMemo(() => {
    if (!window.COMPENDIUM) return [];
    let pool = [];
    if (activeTab === "spells") pool = window.COMPENDIUM.allSpells || [];
    if (activeTab === "items") pool = window.COMPENDIUM.allItems || [];
    if (activeTab === "feats") pool = window.COMPENDIUM.allFeats || [];
    if (activeTab === "backgrounds") pool = window.COMPENDIUM.allBackgrounds || [];

    return pool.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          (item.desc && item.desc.toLowerCase().includes(search.toLowerCase()));
      const matchesEdition = editionFilter === "all" || item.edition === editionFilter;
      return matchesSearch && matchesEdition;
    });
  }, [activeTab, search, editionFilter]);

  const addToCharacter = (item) => {
    setCh(prev => {
      const next = { ...prev };
      if (activeTab === "spells") {
        if (!next.spells) next.spells = { known: [], prepared: [], slots: {} };
        if (!next.spells.known.find(s => s.name === item.name)) {
          next.spells.known = [...next.spells.known, item];
        }
      } else if (activeTab === "items") {
        next.inventory = [...next.inventory, { ...item, qty: 1, equipped: false }];
      }
      return next;
    });
  };

  const removeFromCharacter = (type, name) => {
    setCh(prev => {
      const next = { ...prev };
      if (type === "spell") {
        next.spells.known = next.spells.known.filter(s => s.name !== name);
      } else if (type === "item") {
        next.inventory = next.inventory.filter(i => i.name !== name);
      }
      return next;
    });
  };

  return (
    <div className="editor-root">
      <div className="editor-sidebar">
        <div className="editor-section">
          <div className="editor-header">
            <input className="edit-name" value={ch.meta.name} onChange={e => setCh(p => ({...p, meta: {...p.meta, name: e.target.value}}))} />
            <div className="edit-sub">
              {ch.meta.race} · Nível {ch.meta.level}
            </div>
          </div>
        </div>

        <div className="editor-section">
          <h4 className="section-title">ATRIBUTOS</h4>
          <div className="editor-abilities-grid">
            {Object.entries(ch.abilities).map(([ab, val]) => (
              <div key={ab} className="editor-stat-block">
                <label>{ab}</label>
                <input type="number" value={val} onChange={e => handleAbilityChange(ab, e.target.value)} />
                <span className="mod">{(mods[ab] >= 0 ? "+" : "") + mods[ab]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="editor-section">
          <h4 className="section-title">RESUMO ATUAL</h4>
          <div className="editor-current-list">
            {activeTab === "spells" && ch.spells?.known.map(s => (
              <div key={s.name} className="current-item">
                <span>{s.name}</span>
                <button onClick={() => removeFromCharacter("spell", s.name)}>✕</button>
              </div>
            ))}
            {activeTab === "items" && ch.inventory.map((i, idx) => (
              <div key={idx} className="current-item">
                <span>{i.name}</span>
                <button onClick={() => removeFromCharacter("item", i.name)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="editor-footer">
          <button className="back-btn" onClick={onBack}>CANCELAR</button>
          <button className="save-btn" onClick={() => onSave(ch)}>PRONTO</button>
        </div>
      </div>

      <div className="editor-main">
        <div className="editor-nav">
          <div className="editor-tabs">
            <button className={activeTab === "spells" ? "active" : ""} onClick={() => setActiveTab("spells")}>MAGIAS</button>
            <button className={activeTab === "items" ? "active" : ""} onClick={() => setActiveTab("items")}>ITENS</button>
            <button className={activeTab === "feats" ? "active" : ""} onClick={() => setActiveTab("feats")}>TALENTOS</button>
            <button className={activeTab === "backgrounds" ? "active" : ""} onClick={() => setActiveTab("backgrounds")}>ANTECEDENTES</button>
          </div>
          <div className="editor-filters">
            <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            <select value={editionFilter} onChange={e => setEditionFilter(e.target.value)}>
              <option value="all">Todas Edições</option>
              <option value="2014">2014 (Legacy)</option>
              <option value="2024">2024 (Revised)</option>
            </select>
          </div>
        </div>

        <div className="editor-grid">
          {filteredCompendium.map((item, i) => (
            <div key={i} className={`editor-card ${expandedItem === item.name ? "expanded" : ""}`} onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}>
              <div className="card-header">
                <span className={`edition-tag ${item.edition === '2024' ? 'revised' : 'legacy'}`}>
                  {item.edition === '2024' ? '2024' : '2014'}
                </span>
                <span className="name">{item.name}</span>
                <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCharacter(item); }}>+</button>
              </div>
              {expandedItem === item.name && (
                <div className="card-body">
                  <div className="meta">{item.level ? `Nível ${item.level}` : item.type}</div>
                  <div className="desc">{item.desc}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.CharacterEditor = CharacterEditor;
