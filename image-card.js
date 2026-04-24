// image-card.jsx — The uploaded card image rendered with iridescent foil + tilt.

const IC_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tiltStrength": 18,
  "perspective": 1200,
  "glowIntensity": 0.8,
  "glowSize": 80,
  "iridescenceOpacity": 0.55,
  "iridescenceScale": 220,
  "iridescenceHueShift": 0,
  "iridescenceSpeed": 110,
  "specularSize": 55,
  "specularIntensity": 0.8,
  "noiseOpacity": 0.1,
  "noiseScale": 1.4,
  "shadowStrength": 0.55,
  "foilMode": "overlay",
  "cardWidth": 440,
  "borderRadius": 16,
  "animateIdle": true
}/*EDITMODE-END*/;

function ImageCard({ t, mouse }) {
  const cardRef = React.useRef(null);
  const [rect, setRect] = React.useState({ w: 440, h: 620 });
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
  }, [t.cardWidth]);

  React.useEffect(() => {
    if (!t.animateIdle || hover) return;
    let raf, start = performance.now();
    const tick = (now) => { setIdleT((now - start) / 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [t.animateIdle, hover]);

  const relX = rect.left != null ? (mouse.x - rect.left) / rect.w : 0.5;
  const relY = rect.top != null ? (mouse.y - rect.top) / rect.h : 0.5;
  const cx = Math.max(0, Math.min(1, relX));
  const cy = Math.max(0, Math.min(1, relY));
  const useMouse = hover && mouse.active;

  const rx = useMouse ? (0.5 - cy) * t.tiltStrength : Math.sin(idleT * 0.6) * 1.6;
  const ry = useMouse ? (cx - 0.5) * t.tiltStrength : Math.cos(idleT * 0.5) * 1.6;

  const hueDrift = useMouse
    ? (cx * 360 + cy * 180 + t.iridescenceHueShift)
    : (idleT * t.iridescenceSpeed + t.iridescenceHueShift);

  const pctX = (cx * 100).toFixed(2);
  const pctY = (cy * 100).toFixed(2);
  const br = t.borderRadius;

  return (
    <div style={{ perspective: t.perspective + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        ref={cardRef}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: 'relative',
          width: `min(${t.cardWidth}px, 82vw)`,
          aspectRatio: '1086 / 1448',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`,
          transition: hover ? 'transform 0.08s linear' : 'transform 0.6s cubic-bezier(.2,.7,.2,1)',
          borderRadius: br,
          willChange: 'transform',
        }}
      >
        {/* Drop shadow — lags with tilt */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, borderRadius: br,
          boxShadow: `
            ${(cx - 0.5) * -36}px ${(cy - 0.5) * -36 + 40}px 80px rgba(0,0,0,${t.shadowStrength}),
            ${(cx - 0.5) * -12}px ${(cy - 0.5) * -12 + 12}px 24px rgba(0,0,0,${t.shadowStrength * 0.6})
          `,
          transform: 'translateZ(-20px)',
        }} />

        {/* card surface — clips all effect layers */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: br, overflow: 'hidden',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.35), inset 0 0 0 1.5px rgba(0,0,0,0.08)',
          background: '#000',
        }}>
          {/* THE IMAGE */}
          <img
            src="card-image.png"
            alt="Card"
            draggable={false}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />

          {/* ───── IRIDESCENT FOIL — conic ───── */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            mixBlendMode: t.foilMode === 'highlights' ? 'color-dodge' : 'overlay',
            opacity: t.foilMode === 'highlights' ? t.iridescenceOpacity * 0.45 : t.iridescenceOpacity,
            filter: `hue-rotate(${hueDrift}deg) saturate(1.25)`,
            backgroundImage: `conic-gradient(from ${hueDrift}deg at ${pctX}% ${pctY}%, #ff3cac 0deg, #784ba0 60deg, #2b86c5 120deg, #4be1ec 180deg, #a1ffce 220deg, #faffd1 260deg, #ffb86b 300deg, #ff3cac 360deg)`,
            backgroundSize: `${t.iridescenceScale}% ${t.iridescenceScale}%`,
            backgroundPosition: `${(100 - cx * 100).toFixed(2)}% ${(100 - cy * 100).toFixed(2)}%`,
          }} />

          {/* ───── striped foil layer ───── */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            mixBlendMode: 'soft-light',
            opacity: t.iridescenceOpacity * 0.75,
            filter: `hue-rotate(${(-hueDrift * 0.6).toFixed(1)}deg)`,
            backgroundImage: `repeating-linear-gradient(${(cx * 180 - 90).toFixed(0)}deg, rgba(255,80,160,0.35) 0%, rgba(120,75,160,0.25) 6%, rgba(43,134,197,0.3) 12%, rgba(75,225,236,0.25) 18%, rgba(161,255,206,0.35) 24%, rgba(250,255,209,0.25) 30%, rgba(255,184,107,0.3) 36%, rgba(255,80,160,0.35) 42%)`,
            backgroundSize: '200% 200%',
            backgroundPosition: `${pctX}% ${pctY}%`,
          }} />

          {/* ───── specular ───── */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            mixBlendMode: 'screen',
            opacity: useMouse ? t.specularIntensity : t.specularIntensity * 0.2,
            backgroundImage: `radial-gradient(circle ${t.specularSize * 2}px at ${pctX}% ${pctY}%, rgba(255, 250, 230, 0.95) 0%, rgba(255, 240, 220, 0.55) 20%, rgba(255, 220, 180, 0.2) 45%, transparent 70%)`,
            transition: useMouse ? 'opacity 0.12s linear' : 'opacity 0.4s ease',
          }} />

          {/* ───── noise ───── */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            mixBlendMode: 'overlay',
            opacity: t.noiseOpacity,
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${0.9 / t.noiseScale}' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
            backgroundSize: `${200 * t.noiseScale}px ${200 * t.noiseScale}px`,
          }} />

          {/* ───── subtle vignette ───── */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(120% 90% at 50% 50%, transparent 58%, rgba(0,0,0,0.18) 100%)',
          }} />
        </div>

        {/* ───── outer hue-aware glow ───── */}
        <div aria-hidden style={{
          position: 'absolute', inset: -t.glowSize, borderRadius: br + t.glowSize,
          pointerEvents: 'none',
          opacity: (useMouse ? 1 : 0.4) * t.glowIntensity,
          transform: 'translateZ(-40px)',
          transition: 'opacity 0.3s ease',
          backgroundImage: `radial-gradient(ellipse at ${pctX}% ${pctY}%, hsla(${(hueDrift) % 360}, 90%, 70%, 0.55) 0%, hsla(${(hueDrift + 80) % 360}, 85%, 68%, 0.4) 22%, hsla(${(hueDrift + 200) % 360}, 80%, 62%, 0.22) 45%, transparent 72%)`,
          filter: `blur(${t.glowSize * 0.4}px)`,
        }} />
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(IC_TWEAK_DEFAULTS);
  const [mouse, setMouse] = React.useState({ x: 0, y: 0, active: false });

  React.useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY, active: true });
    const onLeave = () => setMouse((m) => ({ ...m, active: false }));
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseout', onLeave); };
  }, []);

  return (
    <>
      <ImageCard t={t} mouse={mouse} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Card" />
        <TweakSlider label="Width" value={t.cardWidth} min={260} max={640} step={10} unit="px"
          onChange={(v) => setTweak('cardWidth', v)} />
        <TweakSlider label="Corner radius" value={t.borderRadius} min={0} max={40} step={1} unit="px"
          onChange={(v) => setTweak('borderRadius', v)} />

        <TweakSection label="Tilt & Depth" />
        <TweakSlider label="Tilt strength" value={t.tiltStrength} min={0} max={40} step={1} unit="°"
          onChange={(v) => setTweak('tiltStrength', v)} />
        <TweakSlider label="Perspective" value={t.perspective} min={400} max={2200} step={50} unit="px"
          onChange={(v) => setTweak('perspective', v)} />
        <TweakSlider label="Drop shadow" value={Math.round(t.shadowStrength * 100)} min={0} max={100} step={1} unit="%"
          onChange={(v) => setTweak('shadowStrength', v / 100)} />

        <TweakSection label="Outer Glow" />
        <TweakSlider label="Intensity" value={Math.round(t.glowIntensity * 100)} min={0} max={200} step={1} unit="%"
          onChange={(v) => setTweak('glowIntensity', v / 100)} />
        <TweakSlider label="Size" value={t.glowSize} min={0} max={180} step={1} unit="px"
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

        <TweakSection label="Specular" />
        <TweakSlider label="Size" value={t.specularSize} min={10} max={180} step={1} unit="px"
          onChange={(v) => setTweak('specularSize', v)} />
        <TweakSlider label="Intensity" value={Math.round(t.specularIntensity * 100)} min={0} max={100} step={1} unit="%"
          onChange={(v) => setTweak('specularIntensity', v / 100)} />

        <TweakSection label="Noise" />
        <TweakSlider label="Opacity" value={Math.round(t.noiseOpacity * 100)} min={0} max={60} step={1} unit="%"
          onChange={(v) => setTweak('noiseOpacity', v / 100)} />
        <TweakSlider label="Scale" value={Math.round(t.noiseScale * 10) / 10} min={0.4} max={4} step={0.1}
          onChange={(v) => setTweak('noiseScale', v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
