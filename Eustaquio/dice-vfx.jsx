/* dice-vfx.jsx — Efeitos Visuais e Sonoros dos Dados (B4)
   Animação SVG de dados + efeitos de dano. */

/* ---- Dados de áudio inline (base64 de click curto) ---- 
   Para não depender de arquivos externos, usamos Web Audio API. */
const DiceAudio = {
  ctx: null,
  getCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this.ctx;
  },
  playRoll() {
    try {
      const ctx = this.getCtx();
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.value = 180 + Math.random() * 120;
        gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.08);
        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.1);
      }
    } catch (e) { /* áudio não disponível */ }
  },
  playCrit() {
    try {
      const ctx = this.getCtx();
      [440, 554, 660].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } catch (e) { /* áudio não disponível */ }
  },
  playCritFail() {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) { /* áudio não disponível */ }
  }
};

/* ---- Dice SVG paths para cada face ---- */
const DICE_PATHS = {
  d4:  "M9 2 L17 15 L1 15 Z",
  d6:  "M2 2 H16 V16 H2 Z",
  d8:  "M9 1 L17 9 L9 17 L1 9 Z",
  d10: "M9 2 L16 7 L14 15 L4 15 L2 7 Z",
  d12: "M9 1 L15 4 L17 10 L14 16 L4 16 L1 10 L3 4 Z",
  d20: "M9 1 L16 5 L17 12 L12 17 L6 17 L1 12 L2 5 Z"
};

/* ---- DiceVFX: dado animado que aparece ao rolar ---- */
const DiceVFX = ({ face = "d20", isCrit, isCritFail, onDone }) => {
  const [phase, setPhase] = React.useState("rolling"); // rolling | reveal | done
  const [rot, setRot] = React.useState(0);

  React.useEffect(() => {
    // Faz o dado girar rápido por 600ms depois revela
    DiceAudio.playRoll();
    let start = Date.now();
    const spin = setInterval(() => {
      const elapsed = Date.now() - start;
      const speed = Math.max(2, 30 - elapsed / 25);
      setRot(r => r + speed);
      if (elapsed > 600) {
        clearInterval(spin);
        setPhase("reveal");
        if (isCrit) DiceAudio.playCrit();
        else if (isCritFail) DiceAudio.playCritFail();
        setTimeout(() => { setPhase("done"); onDone && onDone(); }, 1200);
      }
    }, 16);
    return () => clearInterval(spin);
  }, []);

  const path = DICE_PATHS[face] || DICE_PATHS.d20;
  const fillColor = isCrit ? "#f1c40f" : isCritFail ? "#d44444" : "var(--c-accent)";
  const glowColor = isCrit ? "rgba(241,196,15,0.7)" : isCritFail ? "rgba(212,68,68,0.7)" : "rgba(var(--c-accent-rgb),0.5)";

  if (phase === "done") return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      pointerEvents: "none"
    }}>
      <div style={{
        animation: phase === "reveal" ? "dice-pop 0.3s ease" : "none",
        filter: phase === "reveal" ? `drop-shadow(0 0 20px ${glowColor})` : "none"
      }}>
        <svg width="80" height="80" viewBox="0 0 18 18"
          style={{
            transform: `rotate(${rot}deg)`,
            transition: phase === "reveal" ? "transform 0.2s ease-out" : "none"
          }}>
          <path d={path} fill={fillColor} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          <text x="9" y="12" textAnchor="middle" fontSize="6"
            fill="rgba(0,0,0,0.7)" fontFamily="monospace" fontWeight="bold">
            {face}
          </text>
        </svg>
      </div>

      {phase === "reveal" && isCrit && (
        <div style={{
          position: "absolute", fontSize: 20, fontFamily: "var(--font-pixel)",
          color: "#f1c40f", textShadow: "0 0 20px #f1c40f",
          animation: "dice-crit-text 1s ease", top: "calc(50% + 60px)"
        }}>✦ CRÍTICO!</div>
      )}
      {phase === "reveal" && isCritFail && (
        <div style={{
          position: "absolute", fontSize: 14, fontFamily: "var(--font-pixel)",
          color: "#d44444", textShadow: "0 0 20px #d44444",
          animation: "dice-crit-text 1s ease", top: "calc(50% + 60px)"
        }}>✦ FALHA CRÍTICA</div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dice-pop {
          0% { transform: scale(0.5); }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes dice-crit-text {
          0% { opacity: 0; transform: translateY(10px); }
          30% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}} />
    </div>
  );
};

/* ---- DamageShake: screen flash + shake ao receber dano crítico ---- */
const DamageFlash = ({ active }) => {
  if (!active) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none",
      background: "rgba(220, 50, 50, 0.25)",
      animation: "damage-flash 0.4s ease-out forwards"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes damage-flash {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}} />
    </div>
  );
};

/* ---- useDiceVFX: hook para integrar com rollD20 ---- */
const useDiceVFX = () => {
  const [vfx, setVfx] = React.useState(null);
  const [flash, setFlash] = React.useState(false);

  const triggerRoll = React.useCallback((result, face = "d20") => {
    setVfx({ face, isCrit: result.crit, isCritFail: result.critFail });
    if (result.critFail) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
    }
  }, []);

  const clearVfx = React.useCallback(() => setVfx(null), []);

  return { vfx, flash, triggerRoll, clearVfx };
};

Object.assign(window, { DiceVFX, DamageFlash, useDiceVFX, DiceAudio });
