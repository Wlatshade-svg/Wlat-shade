import { useState, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";

// ─── VERIFIED CALCULATION ENGINE ─────────────────────────────────────────────
function calculate({ system, rails, cephe, acilim }) {
  const c = Number(cephe);
  const a = Number(acilim);
  const n = Number(rails);
  if (!c || !a || c < 100 || a < 100) return null;

  const rayLen     = a - 220;
  const rayQty     = n;
  const rayCode    = system === "110" ? "2001" : "2052";
  const rayProfile = system === "70" ? "70×150" : system === "90" ? "90×150" : "110×150";

  const olukLen     = c + 150;
  const olukCode    = system === "110" ? "2078" : "2770";
  const olukProfile = system === "110" ? "152×150" : "145×135";

  const motorLen = c;

  const dikmeLen     = 3000;
  const dikmeQty     = n;
  const dikmeCode    = system === "70" && n === 2 ? "6565" : "2111";
  const dikmeProfile = system === "110" ? "110×145" : "100×100";
  const dikmeName    = system === "70" ? "DİKME" : "AYAK";

  let trapLen, trapQty;
  if (system === "70") {
    if (n === 2)      { trapLen = (rayLen - 70) / 2;  trapQty = 1; }
    else if (n === 3) { trapLen = c / 2 - 105;        trapQty = 2; }
    else              { trapLen = c / 3 - 93.33;       trapQty = 3; }
  } else if (system === "90") {
    if (n === 2)      { trapLen = (a - 730) / 2;       trapQty = 1; }
    else if (n === 3) { trapLen = c / 2 - 135;         trapQty = 2; }
    else              { trapLen = c / 3 - 120;          trapQty = 3; }
  } else {
    if (n === 2)      { trapLen = c - 180;             trapQty = 2; }
    else if (n === 3) { trapLen = c / 2 - 135;         trapQty = 2; }
    else              { trapLen = c / 3 - 120;          trapQty = 3; }
  }

  const kornisOffset  = system === "70" ? 20 : 40;
  const inceLen       = trapLen + kornisOffset;
  const kalinLen      = inceLen;
  const kalinQty      = 2 * (n - 1);

  const cadirBaseOffset = system === "70" ? 20 : 40;
  const cadirC          = c - (cadirBaseOffset + 4 * n);
  const cadirA          = a - 170;

  const pitches    = { "70": 282, "90": 254, "110": 204.6 };
  const inceChita  = cadirC / pitches[system];
  const inceKornisQty = inceChita;
  const kalinChita = 2;

  return {
    ray:         { len: Math.round(rayLen),          qty: rayQty,   code: rayCode,   profile: rayProfile,   name: "RAY"                        },
    oluk:        { len: Math.round(olukLen),          qty: 1,        code: olukCode,  profile: olukProfile,  name: "OLUK"                       },
    motor:       { len: Math.round(motorLen),         qty: 1,        code: "5312",    profile: "",           name: "MOTOR BORUSU"               },
    dikme:       { len: dikmeLen,                     qty: dikmeQty, code: dikmeCode, profile: dikmeProfile, name: dikmeName                    },
    trapez:      { len: +(trapLen.toFixed(2)),         qty: trapQty,  code: "37025",   profile: "",           name: "TRAPEZ PROFİLİ"             },
    inceKornis:  { len: +(inceLen.toFixed(2)),         qty: +(inceKornisQty.toFixed(6)), code: "2653", profile: "", name: "İNCE KORNİŞ / İNCE ÇITA" },
    kalinKornis: { len: +(kalinLen.toFixed(2)),        qty: kalinQty, code: "37216",   profile: "",           name: "KALIN KORNİŞ / KALIN ÇITA"  },
    cadir: {
      cephe:     Math.round(cadirC),
      acilim:    Math.round(cadirA),
      inceChita: +(inceChita.toFixed(6)),
      kalinChita,
    },
  };
}

// ─── ANIMATED NUMBER ─────────────────────────────────────────────────────────
function AnimNum({ value, decimals = 0 }) {
  const sp   = useSpring(0, { stiffness: 220, damping: 32 });
  const disp = useTransform(sp, v =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  );
  useEffect(() => { sp.set(Number(value) || 0); }, [value]);
  return <motion.span>{disp}</motion.span>;
}

// ─── IMAGE SLOT ──────────────────────────────────────────────────────────────
function ImgSlot({ src }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{
      width: 80, height: 56, flexShrink: 0,
      borderRadius: 14,
      border: "1px solid rgba(154,13,55,0.24)",
      background: "rgba(0,0,0,0.30)",
      overflow: "hidden", position: "relative",
      boxShadow: "0 2px 14px rgba(154,13,55,0.12), inset 0 0 14px rgba(154,13,55,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {src ? (
        <img src={src} onLoad={() => setLoaded(true)}
          style={{ width:"100%", height:"100%", objectFit:"contain",
            mixBlendMode:"multiply", opacity: loaded ? 1 : 0, transition:"opacity 0.3s" }} alt="" />
      ) : (
        <div style={{
          width:"76%", height:"70%",
          border:"1.5px dashed rgba(154,13,55,0.26)",
          borderRadius:8,
        }} />
      )}
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse at center,transparent 48%,rgba(6,2,4,0.55) 100%)",
        pointerEvents:"none",
      }} />
    </div>
  );
}

// ─── COLOR SWATCH ────────────────────────────────────────────────────────────
function Swatch({ color }) {
  const isNamed = color && /^[a-zA-Z#]/.test(color.trim());
  return (
    <span style={{
      display:"inline-block", width:9, height:9, borderRadius:"50%",
      background: isNamed ? color : "rgba(154,13,55,0.5)",
      border:"1px solid rgba(255,255,255,0.22)",
      flexShrink:0, verticalAlign:"middle",
    }} />
  );
}

// ─── RESULT CARD ─────────────────────────────────────────────────────────────
function ResultCard({ imgSrc, label, len, qty, code, isFractional, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity:0, y:20, scale:0.97 }}
      animate={{ opacity:1, y:0,  scale:1    }}
      transition={{ delay, type:"spring", stiffness:300, damping:28 }}
      style={{
        display:"flex", alignItems:"center", gap:13,
        background:"rgba(154,13,55,0.07)",
        border:"1px solid rgba(154,13,55,0.18)",
        borderRadius:16, padding:"13px 14px", marginBottom:9,
        backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)",
      }}
    >
      <ImgSlot src={imgSrc} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontSize:12, fontWeight:600, color:"#f0e8ec",
          letterSpacing:"0.3px", marginBottom:2,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          fontFamily:"var(--sys)",
        }}>
          {label}
        </div>
        <div style={{ fontSize:9.5, color:"rgba(240,232,236,0.28)", letterSpacing:"1.2px", marginBottom:5, fontFamily:"var(--sys)" }}>
          #{code}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
            <span style={{ fontSize:22, fontWeight:700, color:"white", fontVariantNumeric:"tabular-nums", fontFamily:"var(--sys)" }}>
              <AnimNum value={Math.round(Number(len))} />
            </span>
            <span style={{ fontSize:9, color:"rgba(240,232,236,0.42)", letterSpacing:"1px", fontFamily:"var(--sys)" }}>mm</span>
          </div>
          <span style={{ color:"rgba(154,13,55,0.55)", fontSize:14 }}>×</span>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", lineHeight:1 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
              <span style={{ fontSize:22, fontWeight:700, color:"white", fontVariantNumeric:"tabular-nums", fontFamily:"var(--sys)" }}>
                {isFractional ? <AnimNum value={qty} decimals={4} /> : <AnimNum value={qty} />}
              </span>
              <span style={{ fontSize:9, color:"rgba(240,232,236,0.42)", letterSpacing:"1px", fontFamily:"var(--sys)" }}>adet</span>
            </div>
            <span style={{ fontSize:8, color:"rgba(240,232,236,0.18)", letterSpacing:"0.5px", marginTop:2, fontFamily:"var(--krd)" }}>
              دانە
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SEGMENT CONTROL ─────────────────────────────────────────────────────────
function SegControl({ options, value, onChange }) {
  return (
    <div style={{ display:"flex", background:"rgba(0,0,0,0.35)", borderRadius:13, padding:4, gap:4, marginBottom:18 }}>
      {options.map(opt => (
        <motion.button key={opt.value} onClick={() => onChange(opt.value)} whileTap={{ scale:0.92 }}
          style={{
            flex:1, padding:"9px 0", border:"none", borderRadius:9, cursor:"pointer",
            background: value === opt.value
              ? "linear-gradient(135deg,#9A0D37 0%,#c01548 100%)"
              : "transparent",
            color: value === opt.value ? "white" : "rgba(240,232,236,0.4)",
            fontFamily:"var(--sys)", fontSize:13, fontWeight:600, letterSpacing:"0.5px",
            boxShadow: value === opt.value ? "0 3px 14px rgba(154,13,55,0.42)" : "none",
            transition:"all 0.2s",
          }}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}

// ─── NUMBER INPUT ────────────────────────────────────────────────────────────
function NumInput({ label, value, onChange }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom:13 }}>
      <label style={{ display:"block", fontSize:10, letterSpacing:"2px", textTransform:"uppercase",
        color:"rgba(240,232,236,0.46)", marginBottom:5, fontFamily:"var(--sys)" }}>
        {label}
      </label>
      <div style={{ position:"relative" }}>
        <input type="number" value={value} placeholder=""
          onChange={e => onChange(e.target.value)}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{
            width:"100%", padding:"12px 44px 12px 15px",
            background:"rgba(0,0,0,0.36)",
            border:`1px solid ${f ? "#9A0D37" : "rgba(255,255,255,0.09)"}`,
            borderRadius:13, color:"white",
            fontFamily:"var(--sys)", fontSize:16,
            outline:"none",
            boxShadow: f ? "0 0 0 3px rgba(154,13,55,0.14)" : "none",
            transition:"all 0.18s",
            WebkitAppearance:"none", MozAppearance:"textfield",
          }}
        />
        <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
          fontSize:10, color:"rgba(240,232,236,0.28)", letterSpacing:"1px", pointerEvents:"none",
          fontFamily:"var(--sys)" }}>mm</span>
      </div>
    </div>
  );
}

// ─── TEXT INPUT ──────────────────────────────────────────────────────────────
function TxtInput({ label, value, onChange }) {
  const [f, setF] = useState(false);
  return (
    <div style={{ marginBottom:13 }}>
      <label style={{ display:"block", fontSize:10, letterSpacing:"2px", textTransform:"uppercase",
        color:"rgba(240,232,236,0.46)", marginBottom:5, fontFamily:"var(--sys)" }}>
        {label}
      </label>
      <input type="text" value={value} placeholder=""
        onChange={e => onChange(e.target.value)}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{
          width:"100%", padding:"11px 14px",
          background:"rgba(0,0,0,0.30)",
          border:`1px solid ${f ? "#9A0D37" : "rgba(255,255,255,0.08)"}`,
          borderRadius:12, color:"white",
          fontFamily:"var(--sys)", fontSize:14,
          outline:"none", transition:"all 0.18s",
        }}
      />
    </div>
  );
}

// ─── DIVIDER ─────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(154,13,55,0.25),transparent)", margin:"6px 0 16px" }} />;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [system,   setSystem]   = useState("70");
  const [rails,    setRails]    = useState("2");
  const [cephe,    setCephe]    = useState("");
  const [acilim,   setAcilim]   = useState("");
  const [alColor,  setAlColor]  = useState("");
  const [fabColor, setFabColor] = useState("");
  const [customer, setCustomer] = useState("");
  const [result,   setResult]   = useState(null);

  const today = new Date().toLocaleDateString("tr-TR");

  const handleCalc = () => {
    const r = calculate({ system, rails: Number(rails), cephe, acilim });
    setResult(r);
    setTimeout(() => {
      document.getElementById("res-anchor")?.scrollIntoView({ behavior:"smooth", block:"start" });
    }, 120);
  };

  return (
    <>
      <style>{`
        /* ── ZAIN FONT via Google Fonts (Kurdish Sorani) ── */
        @import url('https://fonts.googleapis.com/css2?family=Zain:wght@400;700;800&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        :root {
          --text:  #f0e8ec;
          --muted: rgba(240,232,236,0.44);
          --sys:   -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          --krd:   'Zain', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          --accent: #9A0D37;
        }

        html, body, #root { height:100%; min-height:100%; }

        body {
          font-family: var(--sys);
          background: #070209;
          color: var(--text);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .bg-wrap {
          position: fixed; inset: 0; z-index: 0;
          background: #070209; overflow: hidden;
        }
        .bg-wrap::before {
          content: ''; position: absolute; inset: -50%; width: 200%; height: 200%;
          background:
            radial-gradient(ellipse 68% 50% at 18% 8%,  rgba(154,13,55,0.60) 0%, transparent 52%),
            radial-gradient(ellipse 45% 55% at 88% 88%, rgba(90,5,32,0.52)   0%, transparent 52%),
            radial-gradient(ellipse 38% 42% at 58% 48%, rgba(40,8,30,0.38)   0%, transparent 58%),
            radial-gradient(ellipse 55% 30% at 80% 12%, rgba(60,0,40,0.28)   0%, transparent 55%),
            radial-gradient(ellipse 30% 50% at 5%  70%, rgba(120,10,45,0.22) 0%, transparent 55%);
          filter: blur(48px);
          animation: meshDrift 22s ease-in-out infinite alternate;
        }
        .bg-wrap::after {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 25% 35% at 72% 18%, rgba(154,13,55,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 20% 28% at 12% 85%, rgba(160,15,60,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 30% 20% at 50% 95%, rgba(80,5,40,0.20)   0%, transparent 55%);
          filter: blur(28px);
          animation: meshDrift2 28s ease-in-out infinite alternate;
        }
        @keyframes meshDrift {
          0%   { transform: translate(0%,0%)   scale(1)    rotate(0deg); }
          25%  { transform: translate(3%,5%)   scale(1.03) rotate(1.5deg); }
          50%  { transform: translate(-4%,3%)  scale(0.97) rotate(-1deg); }
          75%  { transform: translate(2%,-4%)  scale(1.02) rotate(2deg); }
          100% { transform: translate(-2%,2%)  scale(1.04) rotate(-0.5deg); }
        }
        @keyframes meshDrift2 {
          0%   { transform: translate(0%,0%)  scale(1);    opacity:0.7; }
          33%  { transform: translate(-5%,4%) scale(1.05); opacity:1; }
          66%  { transform: translate(4%,-3%) scale(0.96); opacity:0.85; }
          100% { transform: translate(2%,5%)  scale(1.03); opacity:0.9; }
        }

        .scroll-root {
          position:relative; z-index:1; min-height:100dvh;
          display:flex; flex-direction:column; align-items:center;
        }
        .app { width:100%; max-width:500px; padding:0 16px 100px; flex:1; }

        .gc {
          background:rgba(255,255,255,0.048);
          border:1px solid rgba(255,255,255,0.082);
          border-radius:22px; padding:22px;
          backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          margin-bottom:14px;
        }
        .stl {
          font-size:10px; letter-spacing:3px; text-transform:uppercase;
          color:var(--muted); margin-bottom:12px; font-family:var(--sys);
        }

        .rbrow { display:flex; gap:7px; margin-bottom:18px; }
        .rb {
          flex:1; padding:9px 0;
          border:1px solid rgba(255,255,255,0.08); border-radius:11px;
          background:rgba(0,0,0,0.22); color:var(--muted);
          font-family:var(--sys); font-size:11px;
          cursor:pointer; transition:all 0.18s; text-align:center;
        }
        .rb.on { border-color:#9A0D37; background:rgba(154,13,55,0.16); color:white; }

        .color-grid { display:grid; grid-template-columns:1fr; gap:0; }
        @media (min-width:460px) { .color-grid { grid-template-columns:1fr 1fr; gap:10px; } }

        .cbtn {
          width:100%; padding:15px; border:none; border-radius:16px;
          background:linear-gradient(135deg,#9A0D37 0%,#c01548 50%,#9A0D37 100%);
          background-size:200%; color:white;
          font-family:var(--sys); font-size:13px; font-weight:600; letter-spacing:2px;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:9px;
          box-shadow:0 6px 24px rgba(154,13,55,0.42);
          animation:shimmer 4s ease infinite;
          -webkit-tap-highlight-color:transparent;
        }
        @keyframes shimmer { 0%,100%{background-position:0%} 50%{background-position:100%} }

        .pbtn {
          padding:9px 16px;
          border:1px solid rgba(255,255,255,0.16); border-radius:12px;
          background:rgba(255,255,255,0.07); backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px); color:var(--text);
          font-family:var(--sys); font-size:11px; letter-spacing:1px;
          cursor:pointer; display:flex; align-items:center; gap:6px;
          transition:all 0.22s ease;
          box-shadow:0 2px 14px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.09);
          -webkit-tap-highlight-color:transparent;
        }
        .pbtn:hover { background:rgba(255,255,255,0.12); border-color:rgba(154,13,55,0.42); }
        .pbtn:active { transform:scale(0.96); background:rgba(154,13,55,0.13); }

        .chips { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap; align-items:center; }
        .chip {
          display:inline-flex; align-items:center; gap:5px;
          background:rgba(154,13,55,0.12); border:1px solid rgba(154,13,55,0.26);
          border-radius:8px; padding:4px 10px;
          font-size:11px; color:rgba(240,232,236,0.72);
          white-space:nowrap; flex-shrink:0; font-family:var(--sys);
        }

        #res-anchor { scroll-margin-top:16px; }

        .psh { display:none; }
        @media print {
          .no-print { display:none !important; }
          body { background:white !important; color:black !important; }
          .bg-wrap { display:none !important; }
          .psh { display:block !important; padding:24px; font-family:Arial,sans-serif; }
        }

        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
        input[type=number] { -moz-appearance:textfield; }
      `}</style>

      <div className="bg-wrap" />

      <div className="scroll-root">
        <div className="app no-print">

          {/* ── HEADER ── */}
          <header style={{ textAlign:"center", padding:"44px 0 26px" }}>
            <motion.div
              initial={{ opacity:0, y:-20 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.7, ease:"easeOut" }}
            >
              <div style={{ fontFamily:"var(--sys)", fontSize:26, fontWeight:700, letterSpacing:7, marginBottom:10 }}>
                <span style={{ color:"#9A0D37" }}>WLAT</span>{" "}
                <span style={{ color:"white", textShadow:"0 0 12px rgba(255,255,255,0.9),0 0 28px rgba(255,255,255,0.38)" }}>
                  SHADE
                </span>
              </div>
              <div style={{ fontFamily:"var(--krd)", fontSize:22, fontWeight:800, lineHeight:1.4, marginBottom:5, letterSpacing:"0.3px", direction:"rtl" }}>
                <span style={{ color:"#9A0D37" }}>حسابکردنی</span>{" "}
                <span style={{ color:"white", textShadow:"0 0 14px rgba(255,255,255,0.70),0 0 32px rgba(255,255,255,0.26)" }}>
                  بڕینی پەرگۆلا
                </span>
              </div>
              <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:"3.5px", textTransform:"uppercase", fontFamily:"var(--sys)" }}>
                Pergola Kesim Hesabı
              </div>
              <div style={{ width:55, height:1, background:"linear-gradient(90deg,transparent,#9A0D37,transparent)", margin:"14px auto 0" }} />
            </motion.div>
          </header>

          {/* ── INPUT CARD ── */}
          <motion.div className="gc"
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:0.1, type:"spring", stiffness:280, damping:26 }}
          >
            <div className="stl">سیستەم / Sistem</div>
            <SegControl
              value={system}
              onChange={s => { setSystem(s); setResult(null); }}
              options={[
                { value:"70",  label:"Ray 70"  },
                { value:"90",  label:"Ray 90"  },
                { value:"110", label:"Ray 110" },
              ]}
            />

            <div className="stl">ژمارەی ڕەیل / Ray Sayısı</div>
            <div className="rbrow">
              {["2","3","4"].map(r => (
                <motion.button key={r}
                  className={`rb ${rails===r?"on":""}`}
                  onClick={() => { setRails(r); setResult(null); }}
                  whileTap={{ scale:0.92 }}
                >
                  {r} ڕەیل / Ray
                </motion.button>
              ))}
            </div>

            <TxtInput label="کریار / Müşteri" value={customer} onChange={setCustomer} />
            <NumInput label="ڕوکار / Cephe (mm)"   value={cephe}  onChange={setCephe}  />
            <NumInput label="کرانەوە / Açılım (mm)" value={acilim} onChange={setAcilim} />

            <Divider />

            <div className="color-grid">
              <TxtInput label="رەنگی ئەلومنیۆم / Alüminyum" value={alColor}  onChange={setAlColor}  />
              <TxtInput label="رەنگی کوماش / Kumaş"          value={fabColor} onChange={setFabColor} />
            </div>
          </motion.div>

          {/* ── CALCULATE BUTTON ── */}
          <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18 }}>
            <motion.button className="cbtn" onClick={handleCalc}
              whileTap={{ scale:0.95 }} whileHover={{ scale:1.02 }}
              transition={{ type:"spring", stiffness:480, damping:28 }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="white" strokeWidth="1.3"/>
                <rect x="8.5" y="1.5" width="5" height="5" rx="1" stroke="white" strokeWidth="1.3"/>
                <rect x="1.5" y="8.5" width="5" height="5" rx="1" stroke="white" strokeWidth="1.3"/>
                <path d="M11 8.5v6M8.5 11h6" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              حساب بکە / Hesapla
            </motion.button>
          </motion.div>

          {/* ── RESULTS ── */}
          <AnimatePresence>
            {result && (
              <motion.div id="res-anchor"
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                style={{ marginTop:22 }}
              >
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div className="stl" style={{ margin:0 }}>ئەنجامەکان / Sonuçlar</div>
                  <button className="pbtn" onClick={() => window.print()}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M3 5V1h7v4M3 9.5H1V5h11v4.5h-2M3 8h7v4H3z"
                        stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    پرینت / Yazdır
                  </button>
                </div>

                <motion.div className="chips"
                  initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
                >
                  <span className="chip">RAY {system}</span>
                  <span className="chip">{rails} ڕەیل</span>
                  <span className="chip">{cephe} × {acilim} mm</span>
                  {alColor  && <span className="chip"><Swatch color={alColor}  /> {alColor}</span>}
                  {fabColor && <span className="chip"><Swatch color={fabColor} /> {fabColor}</span>}
                  {customer && <span className="chip" style={{ fontFamily:"var(--krd)" }}>{customer}</span>}
                </motion.div>

                <div style={{ fontSize:9, letterSpacing:"2.8px", textTransform:"uppercase",
                  color:"rgba(154,13,55,0.72)", marginBottom:10, fontFamily:"var(--sys)" }}>
                  ئەلومنیۆم / Alüminyum Profiller
                </div>

                <ResultCard delay={0.04} label={`ڕەیل / RAY ${result.ray.profile}`}          code={result.ray.code}         len={result.ray.len}         qty={result.ray.qty} />
                <ResultCard delay={0.08} label={`ئاوڕۆ / OLUK ${result.oluk.profile}`}        code={result.oluk.code}        len={result.oluk.len}        qty={result.oluk.qty} />
                <ResultCard delay={0.12} label="بۆری مۆتۆر / MOTOR BORUSU"                   code={result.motor.code}       len={result.motor.len}       qty={result.motor.qty} />
                <ResultCard delay={0.16} label={`ستوون / ${result.dikme.name} ${result.dikme.profile}`} code={result.dikme.code} len={result.dikme.len} qty={result.dikme.qty} />
                <ResultCard delay={0.20} label="تراپێز / TRAPEZ PROFİLİ"                      code={result.trapez.code}      len={result.trapez.len}      qty={result.trapez.qty} />
                <ResultCard delay={0.24} isFractional label="کورنیشی باریک / İNCE KORNİŞ"    code={result.inceKornis.code}  len={result.inceKornis.len}  qty={result.inceKornis.qty} />
                <ResultCard delay={0.28} label="کورنیشی ئەستوور / KALIN KORNİŞ"              code={result.kalinKornis.code} len={result.kalinKornis.len} qty={result.kalinKornis.qty} />

                {/* ── ÇADIR SECTION ── */}
                <motion.div
                  initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay:0.33, type:"spring", stiffness:280 }}
                  style={{
                    background:"rgba(154,13,55,0.07)",
                    border:"1px solid rgba(154,13,55,0.15)",
                    borderRadius:16, padding:"16px", marginBottom:9,
                  }}
                >
                  <div style={{ fontSize:9.5, letterSpacing:"2.5px", textTransform:"uppercase",
                    color:"rgba(154,13,55,0.85)", marginBottom:13, fontFamily:"var(--sys)" }}>
                    چادر / Çadır Ölçüsü
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                    {[
                      { lbl:"ڕوکار / Cephe",   val:result.cadir.cephe  },
                      { lbl:"کرانەوە / Açılım", val:result.cadir.acilim },
                    ].map(({ lbl, val }) => (
                      <div key={lbl} style={{ background:"rgba(0,0,0,0.28)", borderRadius:12, padding:12, textAlign:"center" }}>
                        <div style={{ fontSize:9, color:"var(--muted)", letterSpacing:"1.5px", marginBottom:4, fontFamily:"var(--sys)" }}>{lbl}</div>
                        <div style={{ fontSize:23, fontWeight:700, fontFamily:"var(--sys)" }}><AnimNum value={val} /></div>
                        <div style={{ fontSize:9, color:"var(--muted)", letterSpacing:"1px", fontFamily:"var(--sys)" }}>mm</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop:"1px solid rgba(154,13,55,0.14)", paddingTop:12 }}>
                    <div style={{ fontSize:9, letterSpacing:"2px", textTransform:"uppercase",
                      color:"rgba(154,13,55,0.65)", marginBottom:10, fontFamily:"var(--sys)" }}>
                      چیتا / Çita Sayısı
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {[
                        { lbl:"باریک / İnce Çita",    val:result.cadir.inceChita,  dec:4 },
                        { lbl:"ئەستوور / Kalin Çita", val:result.cadir.kalinChita, dec:0 },
                      ].map(({ lbl, val, dec }) => (
                        <div key={lbl} style={{ background:"rgba(0,0,0,0.24)", borderRadius:11, padding:"10px 13px" }}>
                          <div style={{ fontSize:9, color:"var(--muted)", letterSpacing:"1.5px", marginBottom:4, fontFamily:"var(--sys)" }}>{lbl}</div>
                          <div style={{ fontSize:19, fontWeight:700, fontFamily:"var(--sys)" }}>
                            <AnimNum value={val} decimals={dec} />
                          </div>
                          <div style={{ fontSize:8, color:"rgba(240,232,236,0.18)", marginTop:2, fontFamily:"var(--krd)" }}>دانە</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── PRINT SHEET ── */}
      {result && (
        <div className="psh">
          <div style={{ textAlign:"center", borderBottom:"2.5px solid #9A0D37", paddingBottom:12, marginBottom:16 }}>
            <div style={{ fontSize:22, fontWeight:"bold", color:"#9A0D37", letterSpacing:5 }}>WLAT SHADE</div>
            <div style={{ fontSize:15, fontWeight:"bold", marginTop:2 }}>
              حسابکردنی بڕینی پەرگۆلا / Pergola Kesim Listesi
            </div>
            <div style={{ fontSize:11, color:"#777", marginTop:4 }}>
              {customer && <><span>کریار / Müşteri: <b>{customer}</b></span> &nbsp;|&nbsp;</>}
              بەروار / Tarih: {today}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:14, fontSize:12 }}>
            <div><b>سیستەم / Sistem:</b> Ray {system}</div>
            <div><b>ڕەیل / Ray Sayısı:</b> {rails}</div>
            <div><b>ڕوکار / Cephe:</b> {cephe} mm</div>
            <div><b>کرانەوە / Açılım:</b> {acilim} mm</div>
            {alColor  && <div><b>ئەلومنیۆم:</b> {alColor}</div>}
            {fabColor && <div><b>کوماش / Kumaş:</b> {fabColor}</div>}
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:"#9A0D37", color:"white" }}>
                {["KALIP NO","ÜRÜN ADI / ناوی کاڵا","KESİM ÖLÇÜSÜ (mm)","ADET / دانە"].map(h => (
                  <th key={h} style={{ padding:"7px 9px", textAlign:"left", fontSize:11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { code:result.ray.code,          name:`ڕەیل / RAY ${result.ray.profile}`,                     len:result.ray.len,         qty:result.ray.qty },
                { code:result.oluk.code,         name:`ئاوڕۆ / OLUK ${result.oluk.profile}`,                  len:result.oluk.len,        qty:result.oluk.qty },
                { code:result.motor.code,        name:"بۆری مۆتۆر / MOTOR BORUSU",                           len:result.motor.len,       qty:result.motor.qty },
                { code:result.dikme.code,        name:`ستوون / ${result.dikme.name} ${result.dikme.profile}`, len:result.dikme.len,       qty:result.dikme.qty },
                { code:result.trapez.code,       name:"تراپێز / TRAPEZ PROFİLİ",                              len:result.trapez.len,      qty:result.trapez.qty },
                { code:result.inceKornis.code,   name:"کورنیشی باریک / İNCE KORNİŞ",                         len:result.inceKornis.len,  qty:result.inceKornis.qty.toFixed(4) },
                { code:result.kalinKornis.code,  name:"کورنیشی ئەستوور / KALIN KORNİŞ",                     len:result.kalinKornis.len, qty:result.kalinKornis.qty },
              ].map((row,i) => (
                <tr key={i} style={{ background:i%2===0?"#fdf7f9":"white" }}>
                  <td style={{ padding:"6px 9px", borderBottom:"1px solid #eee", color:"#888", fontSize:11 }}>{row.code}</td>
                  <td style={{ padding:"6px 9px", borderBottom:"1px solid #eee" }}>{row.name}</td>
                  <td style={{ padding:"6px 9px", borderBottom:"1px solid #eee", textAlign:"right", fontWeight:"bold" }}>{row.len}</td>
                  <td style={{ padding:"6px 9px", borderBottom:"1px solid #eee", textAlign:"right" }}>{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop:12, padding:"10px 12px", background:"#fdf0f4", border:"1px solid #9A0D37", borderRadius:8, fontSize:12 }}>
            <b>چادر / Çadır:</b>
            {" "}Cephe: <b>{result.cadir.cephe}</b> mm &nbsp;|&nbsp;
            Açılım: <b>{result.cadir.acilim}</b> mm &nbsp;|&nbsp;
            İnce Çita: <b>{result.cadir.inceChita.toFixed(4)}</b> &nbsp;|&nbsp;
            Kalin Çita: <b>{result.cadir.kalinChita}</b>
          </div>
          <div style={{ marginTop:18, fontSize:10, color:"#bbb", textAlign:"center" }}>
            WLAT SHADE — Pergola Cutting System · {today}
          </div>
        </div>
      )}
    </>
  );
}
