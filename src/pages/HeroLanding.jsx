import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Anchor, Menu, X } from "lucide-react";

const ANIMATED_LINES = [
  "Mock tests that mirror the real IMUCET experience",
  "Solutions that make every concept click",
  "Sectional practice built for targeted prep",
  "Analytics that show exactly where to improve",
  "India's first complete IMUCET prep platform",
];

const FEATURES = [
  {
    id: "mocks", title: "Full Mock Tests", sub: "200 questions, real IMUCET pattern",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#fff" strokeWidth="1.8"/><path d="M8 9l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 15h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    preview: { label: "IMUCET · Physics", q: "A charge of 8.85 μC is enclosed in a closed surface. The total electric flux through the surface is:", opts: ["10⁷ Nm²/C", "8.85 × 10⁷ Nm²/C", "10⁶ Nm²/C", "8.85 × 10⁶ Nm²/C"], correct: 3, solution: "Apply Gauss's Law: φ = Q/ε₀ = 8.85×10⁻⁶ / 8.85×10⁻¹² = 10⁶ Nm²/C." },
  },
  {
    id: "notes", title: "Topic Notes", sub: "NCERT-based, chapter by chapter",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="#fff" strokeWidth="1.8"/><path d="M8 7h8M8 11h8M8 15h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    preview: { chapter: "Ch1: Electric Charges & Fields", points: ["Coulomb's Law: F = kq₁q₂/r²", "Electric field E = F/q₀", "Gauss's Law: φ = Q_enc / ε₀", "Field lines go from + to −", "Superposition principle applies"] },
  },
  {
    id: "analytics", title: "Smart Analytics", sub: "See your weak topics instantly",
    icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M4 20V14M9 20V8M14 20V12M19 20V4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    preview: { subjects: [{ name: "Physics", score: 72, color: "#60A5FA" }, { name: "Mathematics", score: 45, color: "#F87171" }, { name: "Chemistry", score: 84, color: "#34D399" }, { name: "English", score: 90, color: "#A78BFA" }] },
  },
];

const PRICING = [
  { name: "Free", price: "₹0", period: "forever", features: ["3 full mock tests", "Basic score report", "Topic notes preview"], cta: "Start Free", highlight: false },
  { name: "Pro", price: "₹999", period: "/ year", features: ["Unlimited mock tests", "Full topic notes", "Detailed analytics", "Solutions for every question", "Sectional practice"], cta: "Get Pro →", highlight: true, badge: "Most Popular" },
  { name: "Dropper", price: "₹599", period: "/ 6 months", features: ["Everything in Pro", "Dropper-focused plan", "Weak topic alerts", "Progress tracking"], cta: "Get Dropper", highlight: false },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

export default function HeroLanding() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [lineIdx, setLineIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pricingRef = useRef(null);
  const featRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setLineIdx(i => (i + 1) % ANIMATED_LINES.length); setVisible(true); }, 350);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { setSelectedOpt(null); setAnswered(false); }, [activeFeature]);

  const scrollTo = (ref) => { ref.current?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };
  const f = FEATURES[activeFeature];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F5F4F0", color: "#0D1B2A", minHeight: "100vh", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E4E1D9", padding: isMobile ? "0 16px" : "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: "#1B3A6B", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Anchor size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.03em", color: "#1B3A6B" }}>IMUpilot</span>
        </div>

        {isMobile ? (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "#1B3A6B", padding: 4 }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        ) : (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#4A5568", fontFamily: "inherit" }} onClick={() => scrollTo(featRef)}>Mock Tests</button>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#4A5568", fontFamily: "inherit" }} onClick={() => scrollTo(featRef)}>Notes</button>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#4A5568", fontFamily: "inherit" }} onClick={() => scrollTo(pricingRef)}>Pricing</button>
            <button style={{ background: "none", border: "1px solid #CBD5E0", borderRadius: 8, padding: "7px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: "#1B3A6B" }} onClick={() => navigate("/auth")}>Log in</button>
            <button style={{ background: "#1B3A6B", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={() => navigate("/auth")}>Sign up free</button>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ background: "#fff", borderBottom: "1px solid #E4E1D9", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 500, color: "#4A5568", fontFamily: "inherit", textAlign: "left", padding: "8px 0" }} onClick={() => scrollTo(featRef)}>Mock Tests</button>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 500, color: "#4A5568", fontFamily: "inherit", textAlign: "left", padding: "8px 0" }} onClick={() => scrollTo(pricingRef)}>Pricing</button>
          <button style={{ background: "#1B3A6B", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }} onClick={() => navigate("/auth")}>Log in / Sign up</button>
        </div>
      )}

      {/* HERO */}
      <section style={{ padding: isMobile ? "40px 16px 32px" : "60px 40px 0" }}>
        <h1 style={{ fontSize: isMobile ? "3.5rem" : "clamp(4rem,9vw,8rem)", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.04em", margin: "0 0 8px", color: "#0D1B2A" }}>Crack</h1>
        <h1 style={{ fontSize: isMobile ? "3.5rem" : "clamp(4rem,9vw,8rem)", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.04em", margin: "0 0 28px", color: "#1B3A6B" }}>IMUCET</h1>

        {/* Dark card */}
        <div style={{ borderRadius: isMobile ? 16 : 24, background: "#0D2442", overflow: "hidden" }}>
          {/* Service tags */}
          <div style={{ display: "flex", flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: isMobile ? "0 16px" : "0 40px" }}>
            {["Full Mocks", "Sectional Tests", "Topic Notes", "Smart Analytics", "Past Year Papers"].map((s, i) => (
              <div key={s} style={{ padding: isMobile ? "12px 8px" : "18px 0", marginRight: isMobile ? 12 : 0, flex: isMobile ? "none" : 1, textAlign: "center", borderRight: !isMobile && i < 4 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <span style={{ fontSize: isMobile ? 12 : 15, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div style={{ padding: isMobile ? "28px 16px" : "48px 40px 40px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>CRACK IMUCET</div>
            <div style={{ height: 52, overflow: "hidden", marginBottom: 20 }}>
              <p style={{ fontSize: isMobile ? "1rem" : "clamp(1.2rem,2.5vw,1.6rem)", fontWeight: 500, color: "#fff", margin: 0, lineHeight: 1.4, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.35s ease, transform 0.35s ease" }}>
                {ANIMATED_LINES[lineIdx]}
              </p>
            </div>
            <button onClick={() => navigate("/auth")} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "14px 20px", cursor: "pointer", color: "#fff", fontFamily: "inherit", fontWeight: 600, fontSize: 14, display: "block", width: isMobile ? "100%" : "auto" }}>
              Ready to Crack IMUCET? Get started →
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section ref={featRef} style={{ background: "#fff", padding: isMobile ? "48px 16px" : "100px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 56 }}>
            <h2 style={{ fontSize: isMobile ? "1.6rem" : "clamp(1.8rem,4vw,3rem)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 10px" }}>Make IMUCET feel simple</h2>
            <p style={{ fontSize: 15, color: "#718096", margin: 0 }}>Simple explanations. Structured practice. Only what matters.</p>
          </div>

          {/* Feature tabs — horizontal scroll on mobile */}
          <div style={{ display: "flex", gap: isMobile ? 8 : 10, marginBottom: 20, overflowX: isMobile ? "auto" : "visible", paddingBottom: isMobile ? 4 : 0 }}>
            {FEATURES.map((feat, i) => (
              <button key={feat.id} onClick={() => setActiveFeature(i)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left", fontFamily: "inherit", border: "1.5px solid transparent", background: activeFeature === i ? "#0D2442" : "#F5F4F0", transition: "all 0.2s", flexShrink: 0, minWidth: isMobile ? 160 : "auto", flex: isMobile ? "none" : 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: activeFeature === i ? "rgba(255,255,255,0.12)" : "#0D2442", display: "flex", alignItems: "center", justifyContent: "center" }}>{feat.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: activeFeature === i ? "#fff" : "#0D1B2A" }}>{feat.title}</div>
                  <div style={{ fontSize: 11, color: activeFeature === i ? "rgba(255,255,255,0.55)" : "#718096", marginTop: 1 }}>{feat.sub}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div style={{ borderRadius: 16, border: "1.5px solid #E4E1D9", background: "#fff", overflow: "hidden", boxShadow: "0 4px 24px rgba(13,36,66,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#F5F4F0", borderBottom: "1px solid #E4E1D9" }}>
              {["#FF5F57","#FFBD2E","#28CA41"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }} />)}
              <div style={{ flex: 1, marginLeft: 8, background: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", border: "1px solid #E4E1D9" }}>imupilot.in</div>
            </div>

            {activeFeature === 0 && (
              <div style={{ padding: isMobile ? "20px 16px" : "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#0D2442", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</span>
                  <span style={{ fontSize: 11, color: "#718096", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{f.preview.label}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#0D1B2A", lineHeight: 1.65, marginBottom: 16 }}>{f.preview.q}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {f.preview.opts.map((opt, i) => {
                    const isCorrect = i === f.preview.correct;
                    const isSelected = selectedOpt === i;
                    let bg = "#fff", border = "1.5px solid #E4E1D9";
                    if (answered) { if (isCorrect) { bg = "#EAF3EA"; border = "1.5px solid #2D6A2D"; } else if (isSelected) { bg = "#FCEBEB"; border = "1.5px solid #A32D2D"; } }
                    return (
                      <button key={i} onClick={() => { if (!answered) { setSelectedOpt(i); setAnswered(true); } }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: answered ? "default" : "pointer", textAlign: "left", width: "100%", fontFamily: "inherit", fontSize: 13, background: bg, border, transition: "all 0.15s" }}>
                        <span style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #E4E1D9", background: answered && isCorrect ? "#2D6A2D" : answered && isSelected ? "#A32D2D" : "#fff", color: answered && (isCorrect || isSelected) ? "#fff" : "#718096" }}>
                          {["A","B","C","D"][i]}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {answered && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, background: selectedOpt === f.preview.correct ? "#EAF3EA" : "#FFF3CD", fontSize: 13, color: selectedOpt === f.preview.correct ? "#2D6A2D" : "#856404", fontWeight: 500 }}>{selectedOpt === f.preview.correct ? "✓ Correct! " : "✗ Incorrect. "}{f.preview.solution}</div>}
              </div>
            )}

            {activeFeature === 1 && (
              <div style={{ padding: isMobile ? "20px 16px" : "28px 32px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#718096", marginBottom: 14 }}>{f.preview.chapter}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {f.preview.points.map((pt, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: "#F5F4F0", borderRadius: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#0D2442", color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i+1}</div>
                      <span style={{ fontSize: 13, color: "#0D1B2A", lineHeight: 1.5 }}>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFeature === 2 && (
              <div style={{ padding: isMobile ? "20px 16px" : "28px 32px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#718096", marginBottom: 18 }}>Your subject performance</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {f.preview.subjects.map(s => (
                    <div key={s.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.score}%</span>
                      </div>
                      <div style={{ height: 7, background: "#E4E1D9", borderRadius: 999 }}>
                        <div style={{ width: `${s.score}%`, height: "100%", background: s.color, borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 18, padding: "10px 14px", background: "#FCEBEB", borderRadius: 10, fontSize: 13, color: "#A32D2D", fontWeight: 500 }}>⚠ Focus on Mathematics — your weakest subject</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section ref={pricingRef} style={{ background: "#F5F4F0", padding: isMobile ? "48px 16px" : "100px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 56 }}>
            <h2 style={{ fontSize: isMobile ? "1.6rem" : "clamp(1.8rem,4vw,3rem)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 10px" }}>Simple pricing</h2>
            <p style={{ fontSize: 15, color: "#718096", margin: 0 }}>Start free. Upgrade when ready.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: isMobile ? 16 : 20 }}>
            {PRICING.map(plan => (
              <div key={plan.name} style={{ background: plan.highlight ? "#0D2442" : "#fff", border: `1.5px solid ${plan.highlight ? "#0D2442" : "#E4E1D9"}`, borderRadius: 20, padding: "28px 24px", position: "relative", boxShadow: plan.highlight ? "0 12px 40px rgba(13,36,66,0.2)" : "none" }}>
                {plan.badge && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#E8630A", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 999 }}>{plan.badge}</div>}
                <div style={{ fontSize: 11, fontWeight: 700, color: plan.highlight ? "rgba(255,255,255,0.45)" : "#718096", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: plan.highlight ? "#fff" : "#0D1B2A", letterSpacing: "-0.03em" }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,0.45)" : "#718096" }}>{plan.period}</span>
                </div>
                <div style={{ margin: "18px 0", borderTop: `1px solid ${plan.highlight ? "rgba(255,255,255,0.1)" : "#E4E1D9"}` }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                  {plan.features.map(feat => (
                    <div key={feat} style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: plan.highlight ? "#60A5FA" : "#2D6A2D", fontSize: 14, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,0.75)" : "#0D1B2A", lineHeight: 1.4 }}>{feat}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/auth")} style={{ width: "100%", padding: "12px", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", background: plan.highlight ? "#fff" : "#0D2442", color: plan.highlight ? "#0D2442" : "#fff", border: "none" }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0D2442", color: "rgba(255,255,255,0.5)", padding: isMobile ? "24px 16px" : "32px 40px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Anchor size={16} color="#fff" strokeWidth={2.5} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-0.02em" }}>IMUpilot</span>
          <span style={{ fontSize: 12, marginLeft: 6 }}>India's first complete IMUCET prep platform</span>
        </div>
        <div style={{ fontSize: 11 }}>© 2026 IMUpilot</div>
      </footer>
    </div>
  );
}
