import IMUpilotSidebar from "../components/IMUpilotSidebar";

const IC = ({ path, size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const SUBJECTS = [
  { name: "Physics",     score: 55, attempted: 45, correct: 25, color: "#3B82F6", weak: ["Wave Optics", "Magnetism"] },
  { name: "Mathematics", score: 48, attempted: 40, correct: 19, color: "#F59E0B", weak: ["Integration", "Probability"] },
  { name: "Chemistry",   score: 72, attempted: 38, correct: 27, color: "#10B981", weak: ["Organic Reactions"] },
  { name: "English",     score: 88, attempted: 30, correct: 26, color: "#8B5CF6", weak: [] },
  { name: "GA / GK",    score: 61, attempted: 25, correct: 15, color: "#EF4444", weak: ["Current Affairs"] },
];

const MOCK_HISTORY = [
  { name: "Mock #1", date: "May 1",  score: 112, total: 200, pct: 56 },
  { name: "Mock #2", date: "May 5",  score: 128, total: 200, pct: 64 },
  { name: "Mock #3", date: "May 9",  score: 124, total: 200, pct: 62 },
  { name: "Mock #4", date: "May 13", score: 136, total: 200, pct: 68 },
  { name: "Mock #5", date: "May 17", score: 144, total: 200, pct: 72 },
  { name: "Mock #6", date: "May 21", score: 140, total: 200, pct: 70 },
  { name: "Mock #7", date: "May 25", score: 152, total: 200, pct: 76 },
];

const BAR_MAX = 80;

export default function AnalyticsPage() {
  return (
    <>
      <style>{`
        .analytics-stats { grid-template-columns: repeat(4,1fr) !important; }
        .analytics-chart-grid { grid-template-columns: 1fr 380px !important; }
        .analytics-subject-grid { grid-template-columns: repeat(5,1fr) !important; }
        .analytics-pad { padding: 24px 28px !important; }
        .analytics-topbar { padding: 0 28px !important; }
        @media (max-width: 767px) {
          .analytics-stats { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .analytics-chart-grid { grid-template-columns: 1fr !important; }
          .analytics-subject-grid { grid-template-columns: 1fr 1fr !important; }
          .analytics-pad { padding: 16px !important; }
          .analytics-topbar { padding: 0 16px !important; }
        }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "var(--bg-primary)" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <IMUpilotSidebar />

        <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {/* Topbar */}
          <div className="analytics-topbar" style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Analytics</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Deep dive into your performance</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "6px 14px" }}>
              Last 7 mocks
            </div>
          </div>

          <div className="analytics-pad">

            {/* TOP STATS */}
            <div className="analytics-stats" style={{ display: "grid", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Overall Accuracy", value: "68%",    sub: "Across all subjects",   accent: "#1B3A6B", bgClass: "var(--accent-navy-subtle)", colorClass: "var(--accent-navy)", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                { label: "Avg Time / Q",     value: "65s",    sub: "Target: under 54s",     accent: "#3B82F6", bgClass: "var(--accent-info-subtle)", colorClass: "var(--accent-info)", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" },
                { label: "Best Subject",     value: "English",sub: "88% accuracy",           accent: "#10B981", bgClass: "var(--accent-success-subtle)", colorClass: "var(--accent-success)", icon: "M5 13l4 4L19 7" },
                { label: "Weakest Subject",  value: "Maths",  sub: "Needs most attention",   accent: "#EF4444", bgClass: "var(--accent-danger-subtle)", colorClass: "var(--accent-danger)", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: s.bgClass, display: "flex", alignItems: "center", justifyContent: "center", color: s.colorClass }}>
                      <IC path={s.icon} size={13} />
                    </div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 2 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* CHART + SUBJECT MATRIX */}
            <div className="analytics-chart-grid" style={{ display: "grid", gap: 16, marginBottom: 20 }}>

              {/* Bar chart */}
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>Score Trend</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 18 }}>Your mock test scores over time</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, paddingBottom: 4 }}>
                  {MOCK_HISTORY.map((m, i) => (
                    <div key={m.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: i === MOCK_HISTORY.length - 1 ? "var(--accent-primary)" : "var(--text-secondary)" }}>{m.pct}%</div>
                      <div style={{ width: "100%", borderRadius: "4px 4px 0 0", height: `${(m.pct / BAR_MAX) * 110}px`, background: i === MOCK_HISTORY.length - 1 ? "var(--accent-primary)" : "var(--accent-navy)", opacity: i === MOCK_HISTORY.length - 1 ? 1 : 0.25 + (i * 0.1) }} />
                      <div style={{ fontSize: 9, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{m.date}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Started: <b style={{ color: "var(--text-primary)" }}>56%</b></div>
                  <div style={{ fontSize: 11, color: "var(--accent-primary)", fontWeight: 600 }}>↑ +20% improvement</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Latest: <b style={{ color: "var(--text-primary)" }}>76%</b></div>
                </div>
              </div>

              {/* Subject matrix */}
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>Subject Matrix</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 18 }}>Accuracy per subject</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {SUBJECTS.map(s => (
                    <div key={s.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: s.score >= 70 ? "var(--accent-success)" : s.score >= 55 ? "var(--accent-warning)" : "var(--accent-danger)" }}>{s.score}%</span>
                      </div>
                      <div style={{ height: 6, background: "var(--bg-tertiary)", borderRadius: 999 }}>
                        <div style={{ width: `${s.score}%`, height: "100%", background: s.color, borderRadius: 999 }} />
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 3 }}>{s.correct}/{s.attempted} correct</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SUBJECT CARDS */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 12 }}>Subject Breakdown</div>
              <div className="analytics-subject-grid" style={{ display: "grid", gap: 10 }}>
                {SUBJECTS.map(s => (
                  <div key={s.name} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{s.name}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 2 }}>{s.score}%</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 10 }}>{s.correct}/{s.attempted} correct</div>
                    <div style={{ height: 4, background: "var(--bg-tertiary)", borderRadius: 999, marginBottom: 8 }}>
                      <div style={{ width: `${s.score}%`, height: "100%", background: s.color, borderRadius: 999 }} />
                    </div>
                    {s.weak.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: 4 }}>Weak</div>
                        {s.weak.map(w => <div key={w} style={{ fontSize: 11, color: "var(--accent-danger)", background: "var(--accent-danger-subtle)", padding: "3px 8px", borderRadius: 6, marginBottom: 3 }}>{w}</div>)}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "var(--accent-success)", fontWeight: 600 }}>✓ Strong subject</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* MOCK HISTORY — cards on mobile, table on desktop */}
            <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: "20px" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 14 }}>Mock Test History</div>

              {/* Desktop table */}
              <div className="analytics-history-table" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
                <style>{`@media (max-width: 767px) { .analytics-history-table { display: none !important; } .analytics-history-cards { display: flex !important; } }`}</style>
                {["Test", "Date", "Score", "Percentage", "Result"].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "8px 12px", borderBottom: "1px solid var(--border-subtle)" }}>{h}</div>
                ))}
                {MOCK_HISTORY.map(m => (
                  <>
                    <div key={m.name+"n"} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</div>
                    <div key={m.name+"d"} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)", fontSize: 13, color: "var(--text-secondary)" }}>{m.date}</div>
                    <div key={m.name+"s"} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{m.score}/{m.total}</div>
                    <div key={m.name+"p"} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)", fontSize: 13, fontWeight: 700, color: m.pct >= 70 ? "var(--accent-success)" : m.pct >= 55 ? "var(--accent-warning)" : "var(--accent-danger)" }}>{m.pct}%</div>
                    <div key={m.name+"r"} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: m.pct >= 70 ? "var(--accent-success-subtle)" : m.pct >= 55 ? "var(--accent-warning-subtle)" : "var(--accent-danger-subtle)", color: m.pct >= 70 ? "var(--accent-success)" : m.pct >= 55 ? "var(--accent-warning)" : "var(--accent-danger)" }}>
                        {m.pct >= 70 ? "Good" : m.pct >= 55 ? "Average" : "Needs Work"}
                      </span>
                    </div>
                  </>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="analytics-history-cards" style={{ display: "none", flexDirection: "column", gap: 10 }}>
                {MOCK_HISTORY.map(m => (
                  <div key={m.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "var(--bg-tertiary)", borderRadius: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{m.date} · {m.score}/{m.total}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: m.pct >= 70 ? "var(--accent-success)" : m.pct >= 55 ? "var(--accent-warning)" : "var(--accent-danger)" }}>{m.pct}%</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: m.pct >= 70 ? "var(--accent-success-subtle)" : m.pct >= 55 ? "var(--accent-warning-subtle)" : "var(--accent-danger-subtle)", color: m.pct >= 70 ? "var(--accent-success)" : m.pct >= 55 ? "var(--accent-warning)" : "var(--accent-danger)" }}>
                        {m.pct >= 70 ? "Good" : m.pct >= 55 ? "Average" : "Needs Work"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
