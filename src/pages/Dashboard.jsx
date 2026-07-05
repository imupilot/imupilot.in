import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IMUpilotSidebar from "../components/IMUpilotSidebar";

const IC = ({ path, size = 18 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  analytics: "M4 20V14M9 20V8M14 20V12M19 20V4",
  mock:      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  flashcard: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  fire:      "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.974 7.974 0 01-2.343 5.657z",
  check:     "M5 13l4 4L19 7",
};

const SUBJECTS = [
  { name: "Physics",     emoji: "⚡", mastery: 53, chapters: "1/3",  topics: 15, pyqs: "150+", color: "#3B82F6" },
  { name: "Chemistry",   emoji: "🧪", mastery: 0,  chapters: "0/8",  topics: 0,  pyqs: "150+", color: "#10B981" },
  { name: "Mathematics", emoji: "📐", mastery: 0,  chapters: "0/10", topics: 0,  pyqs: "100+", color: "#F59E0B" },
  { name: "English",     emoji: "📝", mastery: 0,  chapters: "0/6",  topics: 0,  pyqs: "80+",  color: "#8B5CF6" },
  { name: "GA / GK",    emoji: "🌍", mastery: 0,  chapters: "0/5",  topics: 0,  pyqs: "50+",  color: "#EF4444" },
];

const MOCK_TESTS = [
  { name: "IMUCET Full Mock #1", questions: 200, time: "3h",  difficulty: "Medium", status: "available" },
  { name: "IMUCET Full Mock #2", questions: 200, time: "3h",  difficulty: "Hard",   status: "coming" },
  { name: "Physics Sectional",   questions: 50,  time: "45m", difficulty: "Easy",   status: "available" },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  useEffect(() => { if (!user) navigate('/auth'); }, []);
  if (!user) return null;

  const userName = user.name || 'Student';
  const firstName = userName.split(' ')[0];

  const pad = isMobile ? "16px" : "24px 28px";
  const cols4 = isMobile ? "1fr 1fr" : "repeat(4,1fr)";
  const cols2 = isMobile ? "1fr" : "1fr 300px";
  const cols3 = isMobile ? "1fr" : "repeat(3,1fr)";
  const colsSubjects = isMobile ? "1fr 1fr" : "1fr 1fr";

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "var(--bg-primary)" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <IMUpilotSidebar />

      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)", padding: isMobile ? "0 16px" : "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 16 : 19, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Dashboard</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Welcome back, {firstName}!</div>
          </div>
        </div>

        <div style={{ padding: pad, flex: 1 }}>

          {/* STATS */}
          <div style={{ display: "grid", gridTemplateColumns: cols4, gap: 12, marginBottom: 22 }}>
            {[
              { label: "Tests Taken", value: "0",    sub: "Start your first mock", icon: "mock",      accent: "#1B3A6B", bgClass: "var(--accent-navy-subtle)", colorClass: "var(--accent-navy)" },
              { label: "Avg Score",   value: "—",    sub: "No data yet",           icon: "analytics", accent: "#3B82F6", bgClass: "var(--accent-info-subtle)", colorClass: "var(--accent-info)" },
              { label: "Day Streak",  value: "0",    sub: "Login daily",           icon: "fire",      accent: "#E8630A", bgClass: "var(--accent-primary-subtle)", colorClass: "var(--accent-primary)" },
              { label: "Topics Done", value: "0/45", sub: "Across all subjects",   icon: "check",     accent: "#10B981", bgClass: "var(--accent-success-subtle)", colorClass: "var(--accent-success)" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: s.bgClass, display: "flex", alignItems: "center", justifyContent: "center", color: s.colorClass }}>
                    <IC path={ICONS[s.icon]} size={13} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* LEARNING HUB + RIGHT PANEL */}
          <div style={{ display: "grid", gridTemplateColumns: cols2, gap: 18, marginBottom: 22 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Learning Hub</div>
                <button onClick={() => navigate("/learn")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--accent-primary)", fontWeight: 600, fontFamily: "inherit" }}>View all →</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: colsSubjects, gap: 10 }}>
                {SUBJECTS.map(s => (
                  <div key={s.name} onClick={() => navigate("/learn")}
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "16px", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.mastery}%</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>Mastery</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", marginBottom: 8 }}>{s.chapters} Chapters</div>
                    <div style={{ height: 3, background: "var(--bg-tertiary)", borderRadius: 999, marginBottom: 10 }}>
                      <div style={{ width: `${s.mastery}%`, height: "100%", background: s.color, borderRadius: 999 }} />
                    </div>
                    <button style={{ width: "100%", padding: "7px", borderRadius: 8, background: "var(--accent-navy)", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}>
                      Continue Learning
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel — hidden on mobile to save space, shown as separate cards */}
            {!isMobile && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "18px" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Learning Goals</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>Daily Progress</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>0/5 Topics</div>
                  </div>
                  <div style={{ height: 6, background: "var(--bg-tertiary)", borderRadius: 999, marginBottom: 14 }}>
                    <div style={{ width: "0%", height: "100%", background: "var(--accent-primary)", borderRadius: 999 }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--accent-primary-subtle)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff" }}>
                      <IC path={ICONS.fire} size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Welcome, {firstName}!</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Start your first session today.</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "var(--accent-navy)", borderRadius: 14, padding: "18px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 6 }}>Ready to Revise?</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>Start with your flashcard decks today.</div>
                  <button onClick={() => navigate("/revise")} style={{ width: "100%", padding: "10px", borderRadius: 8, background: "var(--accent-primary)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
                    Start Flashcards
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* On mobile — show quick action cards */}
          {isMobile && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
              <div onClick={() => navigate("/revise")} style={{ background: "var(--accent-navy)", borderRadius: 14, padding: "16px", cursor: "pointer" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 4 }}>Flashcards</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>DNS Interview Prep</div>
              </div>
              <div onClick={() => window.open("/test", "_blank")} style={{ background: "var(--accent-primary)", borderRadius: 14, padding: "16px", cursor: "pointer" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 4 }}>Mock Tests</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>IMUCET Practice</div>
              </div>
            </div>
          )}

          {/* MOCK TESTS */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Mock Tests</div>
              <button onClick={() => window.open("/test", "_blank")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--accent-primary)", fontWeight: 600, fontFamily: "inherit" }}>View all →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: cols3, gap: 10 }}>
              {MOCK_TESTS.map(t => (
                <div key={t.name} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3, paddingRight: 8 }}>{t.name}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, flexShrink: 0, background: t.status === "available" ? "var(--accent-success-subtle)" : "var(--bg-tertiary)", color: t.status === "available" ? "var(--accent-success)" : "var(--text-secondary)" }}>
                      {t.status === "available" ? "Available" : "Soon"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}><b style={{ color: "var(--text-primary)" }}>{t.questions}Q</b></span>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}><b style={{ color: "var(--text-primary)" }}>{t.time}</b></span>
                  </div>
                  <button disabled={t.status !== "available"}
                    onClick={() => t.status === "available" && window.open("/test/engine", "_blank")}
                    style={{ width: "100%", padding: "8px", borderRadius: 8, border: "none", cursor: t.status === "available" ? "pointer" : "default", fontSize: 12, fontWeight: 600, fontFamily: "inherit", background: t.status === "available" ? "var(--accent-navy)" : "var(--bg-tertiary)", color: t.status === "available" ? "#fff" : "var(--text-tertiary)" }}>
                    {t.status === "available" ? "Start Test →" : "Coming Soon"}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
