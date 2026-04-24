// card.jsx — The Oracle: a monochromatic foil card with iridescent hover

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tiltStrength": 18,
  "perspective": 1000,
  "glowIntensity": 0.55,
  "glowSize": 65,
  "iridescenceOpacity": 0.85,
  "iridescenceScale": 180,
  "iridescenceHueShift": 0,
  "iridescenceSpeed": 140,
  "specularSize": 40,
  "specularIntensity": 0.9,
  "noiseOpacity": 0.12,
  "noiseScale": 1.6,
  "shadowStrength": 0.45,
  "paperTone": "#f3ece0",
  "inkTone": "#1c1a16",
  "borderStyle": "double",
  "motif": "eye",
  "foilMode": "overlay",
  "animateIdle": true
}/*EDITMODE-END*/;

// ── Motif SVGs — kept minimal: circles, lines, simple geometry only ─────────
const motifs = {
  eye: (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <linearGradient id="motifStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#motifStroke)" strokeWidth="1.2">
        <circle cx="100" cy="100" r="88" />
        <circle cx="100" cy="100" r="78" strokeDasharray="1 3" />
        <circle cx="100" cy="100" r="60" />
        <circle cx="100" cy="100" r="26" strokeWidth="1.6" />
        <circle cx="100" cy="100" r="10" fill="currentColor" stroke="none" />
        {/* radiating ticks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const x1 = 100 + Math.cos(a) * 62;
          const y1 = 100 + Math.sin(a) * 62;
          const x2 = 100 + Math.cos(a) * 72;
          const y2 = 100 + Math.sin(a) * 72;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={i % 6 === 0 ? 1.6 : 0.8} />;
        })}
        {/* Crosshair */}
        <line x1="100" y1="4" x2="100" y2="24" strokeWidth="1.2" />
        <line x1="100" y1="176" x2="100" y2="196" strokeWidth="1.2" />
        <line x1="4" y1="100" x2="24" y2="100" strokeWidth="1.2" />
        <line x1="176" y1="100" x2="196" y2="100" strokeWidth="1.2" />
      </g>
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="100" cy="100" r="88" />
        <circle cx="100" cy="100" r="78" strokeDasharray="2 2" />
        <circle cx="100" cy="100" r="58" strokeWidth="1.4" />
        {/* crescent via mask */}
        <defs>
          <mask id="crescent">
            <rect width="200" height="200" fill="black" />
            <circle cx="100" cy="100" r="50" fill="white" />
            <circle cx="118" cy="92" r="44" fill="black" />
          </mask>
        </defs>
        <rect x="0" y="0" width="200" height="200" fill="currentColor" mask="url(#crescent)" />
        {/* stars — tiny diamonds */}
        {[[40,50],[160,60],[50,160],[155,150],[30,110],[170,110]].map(([x,y],i)=>(
          <g key={i} transform={`translate(${x} ${y}) rotate(45)`}>
            <rect x="-2" y="-2" width="4" height="4" fill="currentColor" />
          </g>
        ))}
      </g>
    </svg>
  ),
  sigil: (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="100" cy="100" r="88" />
        <circle cx="100" cy="100" r="72" />
        {/* triangle */}
        <polygon points="100,34 158,138 42,138" strokeWidth="1.4" />
        {/* inverted triangle */}
        <polygon points="100,166 42,62 158,62" strokeWidth="1" opacity="0.5" />
        <circle cx="100" cy="100" r="22" strokeWidth="1.4" />
        <circle cx="100" cy="100" r="4" fill="currentColor" stroke="none" />
        {/* corner dots */}
        {[[100,34],[158,138],[42,138]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="3" fill="currentColor" stroke="none" />
        ))}
      </g>
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="100" cy="100" r="88" />
        <circle cx="100" cy="100" r="70" strokeDasharray="1 4" />
        {/* N/S/E/W spikes */}
        <polygon points="100,20 108,100 100,108 92,100" fill="currentColor" stroke="none" opacity="0.85" />
        <polygon points="100,180 108,100 100,92 92,100" fill="currentColor" stroke="none" opacity="0.35" />
        <polygon points="180,100 100,108 92,100 100,92" fill="currentColor" stroke="none" opacity="0.55" />
        <polygon points="20,100 100,92 108,100 100,108" fill="currentColor" stroke="none" opacity="0.55" />
        <circle cx="100" cy="100" r="6" fill="currentColor" stroke="none" />
        {[...'NESW'].map((l, i) => {
          const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
          const x = 100 + Math.cos(a) * 94;
          const y = 100 + Math.sin(a) * 94 + 3;
          return <text key={l} x={x} y={y} fontSize="9" fontFamily="IBM Plex Mono, monospace" fill="currentColor" stroke="none" textAnchor="middle" letterSpacing="1">{l}</text>;
        })}
      </g>
    </svg>
  ),
};

// ── Corner ornaments — simple geometry ──────────────────────────────────────
const CornerOrnament = ({ rotation = 0 }) => (
  <svg viewBox="0 0 60 60" width="60" height="60" style={{ transform: `rotate(${rotation}deg)` }}>
    <g fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.85">
      <path d="M 4 20 L 4 4 L 20 4" />
      <path d="M 8 26 L 8 8 L 26 8" opacity="0.5" />
      <circle cx="14" cy="14" r="2.5" />
      <line x1="14" y1="14" x2="4" y2="4" opacity="0.5" />
    </g>
  </svg>
);

function Card({ t, mouse }) {
  const cardRef = React.useRef(null);
  const [rect, setRect] = React.useState({ w: 360, h: 540 });
  const [hover, setHover] = React.useState(false);
  const [idleT, setIdleT] = React.useState(0);

  React.useEffect(() => {
    const measure = () => {
      if (cardRef.current) {
        const r = cardRef.current.getBoundingClientRect();
        setRect({ w: r.width, h: r.height, left: r.left, top: r.top });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // idle breathing animation for iridescence when not hovering
  React.useEffect(() => {
    if (!t.animateIdle || hover) return;
    let raf, start = performance.now();
    const tick = (now) => {
      setIdleT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [t.animateIdle, hover]);

  // mouse position relative to card (0..1)
  const relX = rect.left != null ? (mouse.x - rect.left) / rect.w : 0.5;
  const relY = rect.top != null ? (mouse.y - rect.top) / rect.h : 0.5;
  const cx = Math.max(0, Math.min(1, relX));
  const cy = Math.max(0, Math.min(1, relY));

  // tilt
  const useMouse = hover && mouse.active;
  const rx = useMouse ? (0.5 - cy) * t.tiltStrength : Math.sin(idleT * 0.6) * 2;
  const ry = useMouse ? (cx - 0.5) * t.tiltStrength : Math.cos(idleT * 0.5) * 2;

  // iridescence drift (degrees). When hovering, follow the mouse; otherwise idle drift.
  const hueDrift = useMouse
    ? (cx * 360 + cy * 180 + t.iridescenceHueShift)
    : (idleT * t.iridescenceSpeed + t.iridescenceHueShift);

  const pctX = (cx * 100).toFixed(2);
  const pctY = (cy * 100).toFixed(2);

  const paperShade = `color-mix(in oklab, ${t.paperTone} 82%, ${t.inkTone} 18%)`;
  const paperEdge = `color-mix(in oklab, ${t.paperTone} 65%, ${t.inkTone} 35%)`;
  const inkSoft = `color-mix(in oklab, ${t.inkTone} 75%, ${t.paperTone} 25%)`;
  const inkFaint = `color-mix(in oklab, ${t.inkTone} 30%, ${t.paperTone} 70%)`;

  const Motif = motifs[t.motif] || motifs.eye;

  // border style variants
  const borderProps = {
    double: { outer: '1.5px solid ' + inkSoft, inner: '0.5px solid ' + inkFaint, gap: 6 },
    single: { outer: '1px solid ' + inkSoft, inner: 'none', gap: 0 },
    deco: { outer: '2px solid ' + inkSoft, inner: '1px dashed ' + inkFaint, gap: 8 },
  }[t.borderStyle] || { outer: '1.5px solid ' + inkSoft, inner: '0.5px solid ' + inkFaint, gap: 6 };

  return (
    <div
      style={{
        perspective: t.perspective + 'px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        ref={cardRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'relative',
          width: 'min(380px, 80vw)',
          aspectRatio: '5 / 7',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`,
          transition: hover ? 'transform 0.08s linear' : 'transform 0.6s cubic-bezier(.2,.7,.2,1)',
          borderRadius: 14,
          willChange: 'transform',
        }}
      >
        {/* drop shadow plate — lags behind the card */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            boxShadow: `
              ${(cx - 0.5) * -30}px ${(cy - 0.5) * -30 + 30}px 60px rgba(0,0,0,${t.shadowStrength}),
              ${(cx - 0.5) * -10}px ${(cy - 0.5) * -10 + 8}px 18px rgba(0,0,0,${t.shadowStrength * 0.6})
            `,
            transform: 'translateZ(-20px)',
          }}
        />

        {/* base paper */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            background: `radial-gradient(120% 90% at 30% 20%, ${t.paperTone}, ${paperShade} 60%, ${paperEdge})`,
            overflow: 'hidden',
            border: borderProps.outer,
            boxShadow: `inset 0 0 0 0.5px rgba(255,255,255,0.4)`,
          }}
        >
          {/* inner decorative border */}
          {borderProps.inner !== 'none' && (
            <div
              style={{
                position: 'absolute',
                inset: borderProps.gap,
                borderRadius: 10,
                border: borderProps.inner,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* corner ornaments */}
          <div style={{ position: 'absolute', top: 14, left: 14, color: inkSoft }}>
            <CornerOrnament rotation={0} />
          </div>
          <div style={{ position: 'absolute', top: 14, right: 14, color: inkSoft }}>
            <CornerOrnament rotation={90} />
          </div>
          <div style={{ position: 'absolute', bottom: 14, left: 14, color: inkSoft }}>
            <CornerOrnament rotation={-90} />
          </div>
          <div style={{ position: 'absolute', bottom: 14, right: 14, color: inkSoft }}>
            <CornerOrnament rotation={180} />
          </div>

          {/* content layout */}
          <div
            style={{
              position: 'absolute',
              inset: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              color: t.inkTone,
            }}
          >
            {/* header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: inkSoft }}>
              <span>N° XVII</span>
              <span>— ☾ —</span>
              <span>MMXXVI</span>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <div style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 13,
                letterSpacing: '0.5em',
                textTransform: 'uppercase',
                color: inkSoft,
                marginBottom: 4,
                paddingLeft: '0.5em',
              }}>
                The Oracle
              </div>
              <div style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 42,
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 1,
                letterSpacing: '-0.01em',
              }}>
                Lumière
              </div>
            </div>

            {/* central motif */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 10px 8px',
              position: 'relative',
              color: t.inkTone,
            }}>
              {/* concentric bg rings */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: '86%', aspectRatio: '1', border: `0.5px solid ${inkFaint}`, borderRadius: '50%' }} />
              </div>
              <div style={{ width: '78%', aspectRatio: '1', position: 'relative', color: t.inkTone }}>
                {Motif}
              </div>
            </div>

            {/* stats / keywords band */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: 10,
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 8.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: inkSoft,
              padding: '10px 0 8px',
              borderTop: `0.5px solid ${inkFaint}`,
              borderBottom: `0.5px solid ${inkFaint}`,
              marginTop: 8,
            }}>
              <span style={{ textAlign: 'left' }}>Vision · 7</span>
              <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 14, fontStyle: 'italic' }}>✦</span>
              <span style={{ textAlign: 'right' }}>Light · ∞</span>
            </div>

            {/* inscription */}
            <div style={{
              textAlign: 'center',
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 11,
              fontStyle: 'italic',
              color: inkSoft,
              padding: '14px 8px 4px',
              lineHeight: 1.5,
              textWrap: 'pretty',
            }}>
              "Who looks outside, dreams;<br />who looks inside, awakens."
            </div>

            {/* footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 8,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: inkFaint,
              marginTop: 'auto',
              paddingTop: 8,
            }}>
              <span>001 / 078</span>
              <span>ARCANA · MAJOR</span>
              <span>✦</span>
            </div>
          </div>

          {/* ───────── IRIDESCENT FOIL LAYER ─────────
              Conic gradient + blend mode. "Dodge" mode boosts highlights (can
              blow out on light paper — lowered opacity compensates); "Overlay"
              preserves hue fidelity across the full tonal range. */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 14,
              pointerEvents: 'none',
              mixBlendMode: t.foilMode === 'highlights' ? 'color-dodge' : 'overlay',
              opacity: t.foilMode === 'highlights' ? t.iridescenceOpacity * 0.45 : t.iridescenceOpacity,
              filter: `hue-rotate(${hueDrift}deg) saturate(1.15)`,
              backgroundImage: `conic-gradient(from ${hueDrift}deg at ${pctX}% ${pctY}%, #ff3cac 0deg, #784ba0 60deg, #2b86c5 120deg, #4be1ec 180deg, #a1ffce 220deg, #faffd1 260deg, #ffb86b 300deg, #ff3cac 360deg)`,
              backgroundSize: `${t.iridescenceScale}% ${t.iridescenceScale}%`,
              backgroundPosition: `${(100 - cx * 100).toFixed(2)}% ${(100 - cy * 100).toFixed(2)}%`,
            }}
          />

          {/* second iridescent layer — offset, subtler, for depth */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 14,
              pointerEvents: 'none',
              mixBlendMode: 'soft-light',
              opacity: t.iridescenceOpacity * 0.7,
              filter: `hue-rotate(${(-hueDrift * 0.6).toFixed(1)}deg)`,
              backgroundImage: `repeating-linear-gradient(${(cx * 180 - 90).toFixed(0)}deg, rgba(255,80,160,0.35) 0%, rgba(120,75,160,0.25) 6%, rgba(43,134,197,0.3) 12%, rgba(75,225,236,0.25) 18%, rgba(161,255,206,0.35) 24%, rgba(250,255,209,0.25) 30%, rgba(255,184,107,0.3) 36%, rgba(255,80,160,0.35) 42%)`,
              backgroundSize: '200% 200%',
              backgroundPosition: `${pctX}% ${pctY}%`,
            }}
          />

          {/* specular screen highlight */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 14,
              pointerEvents: 'none',
              mixBlendMode: 'screen',
              opacity: useMouse ? t.specularIntensity : t.specularIntensity * 0.25,
              backgroundImage: `radial-gradient(circle ${t.specularSize * 2}px at ${pctX}% ${pctY}%, rgba(255, 250, 230, 0.95) 0%, rgba(255, 240, 220, 0.6) 20%, rgba(255, 220, 180, 0.2) 45%, transparent 70%)`,
              transition: useMouse ? 'opacity 0.12s linear' : 'opacity 0.4s ease',
            }}
          />

          {/* ───────── NOISE TEXTURE ───────── */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 14,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              opacity: t.noiseOpacity,
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${0.9 / t.noiseScale}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
              backgroundSize: `${200 * t.noiseScale}px ${200 * t.noiseScale}px`,
            }}
          />

          {/* vignette */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 14,
              pointerEvents: 'none',
              background: 'radial-gradient(120% 90% at 50% 50%, transparent 60%, rgba(0,0,0,0.18) 100%)',
            }}
          />
        </div>

        {/* outer hue-aware glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: -t.glowSize,
            borderRadius: 14 + t.glowSize,
            pointerEvents: 'none',
            opacity: (useMouse ? 1 : 0.35) * t.glowIntensity,
            transform: 'translateZ(-40px)',
            transition: 'opacity 0.3s ease',
            backgroundImage: `radial-gradient(ellipse at ${pctX}% ${pctY}%, hsla(${(hueDrift) % 360}, 90%, 70%, 0.5) 0%, hsla(${(hueDrift + 60) % 360}, 90%, 65%, 0.35) 20%, hsla(${(hueDrift + 180) % 360}, 80%, 60%, 0.2) 40%, transparent 70%)`,
            filter: `blur(${t.glowSize * 0.4}px)`,
          }}
        />
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [mouse, setMouse] = React.useState({ x: 0, y: 0, active: false });

  React.useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY, active: true });
    const onLeave = () => setMouse((m) => ({ ...m, active: false }));
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
    };
  }, []);

  return (
    <>
      <Card t={t} mouse={mouse} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Perspective & Tilt" />
        <TweakSlider label="Tilt strength" value={t.tiltStrength} min={0} max={40} step={1} unit="°"
          onChange={(v) => setTweak('tiltStrength', v)} />
        <TweakSlider label="Perspective" value={t.perspective} min={400} max={2000} step={50} unit="px"
          onChange={(v) => setTweak('perspective', v)} />
        <TweakSlider label="Drop shadow" value={Math.round(t.shadowStrength * 100)} min={0} max={100} step={1} unit="%"
          onChange={(v) => setTweak('shadowStrength', v / 100)} />

        <TweakSection label="Outer Glow" />
        <TweakSlider label="Intensity" value={Math.round(t.glowIntensity * 100)} min={0} max={200} step={1} unit="%"
          onChange={(v) => setTweak('glowIntensity', v / 100)} />
        <TweakSlider label="Size" value={t.glowSize} min={0} max={160} step={1} unit="px"
          onChange={(v) => setTweak('glowSize', v)} />

        <TweakSection label="Iridescence" />
        <TweakRadio label="Blend" value={t.foilMode}
          options={[{ value: 'highlights', label: 'Dodge' }, { value: 'overlay', label: 'Overlay' }]}
          onChange={(v) => setTweak('foilMode', v)} />
        <TweakSlider label="Opacity" value={Math.round(t.iridescenceOpacity * 100)} min={0} max={100} step={1} unit="%"
          onChange={(v) => setTweak('iridescenceOpacity', v / 100)} />
        <TweakSlider label="Scale" value={t.iridescenceScale} min={50} max={400} step={5} unit="%"
          onChange={(v) => setTweak('iridescenceScale', v)} />
        <TweakSlider label="Hue shift" value={t.iridescenceHueShift} min={0} max={360} step={1} unit="°"
          onChange={(v) => setTweak('iridescenceHueShift', v)} />
        <TweakSlider label="Idle speed" value={t.iridescenceSpeed} min={0} max={400} step={5} unit="°/s"
          onChange={(v) => setTweak('iridescenceSpeed', v)} />
        <TweakToggle label="Idle drift" value={t.animateIdle}
          onChange={(v) => setTweak('animateIdle', v)} />

        <TweakSection label="Specular Highlight" />
        <TweakSlider label="Size" value={t.specularSize} min={10} max={160} step={1} unit="px"
          onChange={(v) => setTweak('specularSize', v)} />
        <TweakSlider label="Intensity" value={Math.round(t.specularIntensity * 100)} min={0} max={100} step={1} unit="%"
          onChange={(v) => setTweak('specularIntensity', v / 100)} />

        <TweakSection label="Paper & Noise" />
        <TweakColor label="Paper" value={t.paperTone}
          onChange={(v) => setTweak('paperTone', v)} />
        <TweakColor label="Ink" value={t.inkTone}
          onChange={(v) => setTweak('inkTone', v)} />
        <TweakSlider label="Noise opacity" value={Math.round(t.noiseOpacity * 100)} min={0} max={60} step={1} unit="%"
          onChange={(v) => setTweak('noiseOpacity', v / 100)} />
        <TweakSlider label="Noise scale" value={Math.round(t.noiseScale * 10) / 10} min={0.4} max={4} step={0.1}
          onChange={(v) => setTweak('noiseScale', v)} />

        <TweakSection label="Card" />
        <TweakRadio label="Motif" value={t.motif}
          options={[
            { value: 'eye', label: 'Eye' },
            { value: 'moon', label: 'Moon' },
            { value: 'sigil', label: 'Sigil' },
            { value: 'compass', label: 'Compass' },
          ]}
          onChange={(v) => setTweak('motif', v)} />
        <TweakRadio label="Border" value={t.borderStyle}
          options={[
            { value: 'single', label: 'Single' },
            { value: 'double', label: 'Double' },
            { value: 'deco', label: 'Deco' },
          ]}
          onChange={(v) => setTweak('borderStyle', v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
