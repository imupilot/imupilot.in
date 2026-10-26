import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Bell,
  BookOpen,
  ChevronDown,
  ClipboardList,
  Clock3,
  Target,
  Trophy,
} from "lucide-react";
import IMUpilotSidebar from "../components/IMUpilotSidebar";
import { supabase } from "../supabaseClient";

const DAILY_TARGET = 20;
const SURFACE = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 18,
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function readTestHistory(userId) {
  try {
    const raw = localStorage.getItem(`imupilot_test_history_${userId}`);
    if (!raw) return [];
    const history = JSON.parse(raw);
    if (!Array.isArray(history)) {
      console.error("Unable to load your test history: saved history is not a list.");
      return [];
    }
    return history.filter(test => {
      const valid = test && typeof test === "object"
        && Number.isFinite(test.correct)
        && Number.isFinite(test.incorrect)
        && Number.isFinite(test.score)
        && Number.isFinite(test.totalQuestions)
        && test.correct >= 0
        && test.incorrect >= 0
        && test.totalQuestions > 0
        && test.correct + test.incorrect <= test.totalQuestions;
      if (!valid) console.error("Skipping an invalid saved mock test result.", test);
      return valid;
    });
  } catch (error) {
    console.error("Unable to load your test history.", error);
    return [];
  }
}

function formatTestDate(value) {
  if (!value) return "Recent";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recent";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Card({ children, style = {} }) {
  return <section style={{ ...SURFACE, padding: 22, ...style }}>{children}</section>;
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
      <div>
        {eyebrow && <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 5 }}>{eyebrow}</div>}
        <h2 style={{ margin: 0, color: "#0F172A", fontSize: 17, fontWeight: 650, letterSpacing: "-0.025em" }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      console.error("Unable to read the signed-in user.", error);
    }

    if (!storedUser?.id) {
      navigate("/auth", { replace: true });
      return;
    }

    setUser(storedUser);
    setHistory(readTestHistory(storedUser.id));
  }, [navigate]);

  const metrics = useMemo(() => {
    const attempts = history.reduce((sum, test) => sum + (Number(test.correct) || 0) + (Number(test.incorrect) || 0), 0);
    const correct = history.reduce((sum, test) => sum + (Number(test.correct) || 0), 0);
    const scoreTotal = history.reduce((sum, test) => sum + (Number(test.score) || 0), 0);
    const questionTotal = history.reduce((sum, test) => sum + (Number(test.totalQuestions) || 0), 0);
    const todayQuestions = history
      .filter(test => test.completedAt && new Date(test.completedAt).toDateString() === new Date().toDateString())
      .reduce((sum, test) => sum + (Number(test.correct) || 0) + (Number(test.incorrect) || 0), 0);

    return {
      testsTaken: history.length,
      averageScore: questionTotal ? Math.round((scoreTotal / questionTotal) * 200) : null,
      accuracy: attempts ? Math.round((correct / attempts) * 100) : null,
      dailyProgress: Math.min(100, Math.round((todayQuestions / DAILY_TARGET) * 100)),
      todayQuestions,
    };
  }, [history]);

  const latestTest = history[0];
  const subjectRows = useMemo(() => {
    if (!latestTest?.subjectBreakdown || typeof latestTest.subjectBreakdown !== "object") return [];
    const order = ["Physics", "Chemistry", "Mathematics", "English", "General Aptitude"];
    return order
      .filter(name => latestTest.subjectBreakdown[name] && typeof latestTest.subjectBreakdown[name] === "object")
      .map(name => ({
        name,
        accuracy: Number(latestTest.subjectBreakdown[name].accuracy) || 0,
        correct: Number(latestTest.subjectBreakdown[name].correct) || 0,
        total: Number(latestTest.subjectBreakdown[name].total) || 0,
      }));
  }, [latestTest]);

  const weakTopics = useMemo(() => {
    if (!Array.isArray(latestTest?.questions) || !latestTest?.answers || typeof latestTest.answers !== "object") return [];
    const topics = new Map();
    latestTest.questions.forEach(question => {
      if (!question || typeof question !== "object" || question.id === undefined) return;
      const selected = latestTest.answers[question.id];
      if (selected === undefined || selected === null) return;
      const topic = question.topic_tag || question.subject || "Other";
      const current = topics.get(topic) || { name: topic, correct: 0, attempted: 0 };
      current.attempted += 1;
      if (selected === question.correctAnswer) current.correct += 1;
      topics.set(topic, current);
    });
    return [...topics.values()]
      .filter(topic => topic.attempted > 0)
      .map(topic => ({ ...topic, accuracy: Math.round((topic.correct / topic.attempted) * 100) }))
      .filter(topic => topic.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 4);
  }, [latestTest]);

  const trend = history.slice(0, 7).reverse();
  const userName = user?.name || "Student";
  const firstName = userName.trim().split(/\s+/)[0] || "Student";
  const chartValues = trend.map(test => Math.max(0, Math.min(100, Math.round(((Number(test.score) || 0) / (Number(test.totalQuestions) || 1)) * 100))));
  const chartPoints = chartValues.map((value, index) => {
    const x = chartValues.length < 2 ? 50 : 10 + (index / (chartValues.length - 1)) * 80;
    const y = 82 - (value / 100) * 65;
    return `${x},${y}`;
  }).join(" ");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      localStorage.removeItem("user");
      navigate("/auth", { replace: true });
    }
  };

  if (!user) return null;

  const stats = [
    { label: "Tests", value: metrics.testsTaken, caption: "Completed tests", icon: ClipboardList },
    { label: "Avg Score", value: metrics.averageScore === null ? "—" : `${metrics.averageScore}/200`, caption: metrics.averageScore === null ? "No scores yet" : "Across completed tests", icon: Trophy },
    { label: "Accuracy", value: metrics.accuracy === null ? "—" : `${metrics.accuracy}%`, caption: metrics.accuracy === null ? "No answers yet" : "Correct answers", icon: Target },
    { label: "Progress", value: `${metrics.dailyProgress}%`, caption: `${Math.min(metrics.todayQuestions, DAILY_TARGET)}/${DAILY_TARGET} questions today`, icon: Activity },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", color: "#0F172A", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <IMUpilotSidebar />
      <main style={{ minWidth: 0, flex: 1, overflowY: "auto" }}>
        <header style={{ height: 72, padding: isMobile ? "0 16px" : "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderBottom: "1px solid #E2E8F0", position: "sticky", top: isMobile ? 56 : 0, zIndex: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: "#64748B" }}>IMUPilot / Dashboard</div>
            <div style={{ marginTop: 2, fontSize: 12, color: "#94A3B8" }}>Your preparation overview</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
            <button type="button" aria-label="Notifications" onClick={() => { setNotificationsOpen(value => !value); setMenuOpen(false); }} style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 999, border: "1px solid #E2E8F0", color: "#475569", background: "#fff", cursor: "pointer" }}>
              <Bell size={17} />
            </button>
            <button type="button" aria-expanded={menuOpen} onClick={() => { setMenuOpen(value => !value); setNotificationsOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 10px 4px 5px", border: "1px solid #E2E8F0", borderRadius: 999, color: "#0F172A", background: "#fff", cursor: "pointer", font: "inherit" }}>
              <span style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: 999, background: "#0F172A", color: "#fff", fontSize: 12, fontWeight: 700 }}>{firstName[0].toUpperCase()}</span>
              {!isMobile && <span style={{ fontSize: 13, fontWeight: 600 }}>{firstName}</span>}
              <ChevronDown size={14} color="#64748B" />
            </button>
            {(menuOpen || notificationsOpen) && (
              <div style={{ position: "absolute", top: 48, right: 0, zIndex: 30, width: 220, padding: 14, border: "1px solid #E2E8F0", borderRadius: 14, background: "#fff", boxShadow: "0 16px 40px rgba(15,23,42,.12)" }}>
                {notificationsOpen ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 650, color: "#0F172A" }}>Notifications</div>
                    <div style={{ padding: "18px 0 6px", color: "#64748B", fontSize: 12 }}>You’re all caught up.</div>
                  </>
                ) : (
                  <>
                    <div style={{ padding: "2px 4px 12px", borderBottom: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 13, fontWeight: 650 }}>{userName}</div>
                      <div style={{ marginTop: 3, color: "#64748B", fontSize: 11 }}>{user.email || user.phone || ""}</div>
                    </div>
                    <button type="button" onClick={handleLogout} style={{ width: "100%", marginTop: 10, padding: "8px 4px", textAlign: "left", border: 0, borderRadius: 8, color: "#475569", background: "transparent", font: "inherit", fontSize: 13, cursor: "pointer" }}>Log out</button>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <div style={{ width: "100%", maxWidth: 1480, margin: "0 auto", padding: isMobile ? "26px 16px 92px" : "34px 36px 48px" }}>
          <div style={{ marginBottom: 26 }}>
            <div style={{ color: "#0F172A", fontSize: isMobile ? 25 : 31, fontWeight: 650, lineHeight: 1.2, letterSpacing: "-0.045em" }}>{getGreeting()}, {firstName}</div>
            <div style={{ marginTop: 8, color: "#64748B", fontSize: 14 }}>Here's where your preparation stands.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,minmax(0,1fr))" : "repeat(4,minmax(0,1fr))", gap: 14, marginBottom: 26 }}>
            {stats.map(({ label, value, caption, icon: Icon }) => (
              <Card key={label} style={{ padding: isMobile ? 16 : 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <div style={{ color: "#64748B", fontSize: 11, fontWeight: 650 }}>{label}</div>
                  <span style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: 9, color: "#334155", background: "#F1F5F9" }}><Icon size={15} /></span>
                </div>
                <div style={{ marginTop: 16, color: "#0F172A", fontSize: isMobile ? 22 : 27, fontWeight: 700, letterSpacing: "-0.04em" }}>{value}</div>
                <div style={{ marginTop: 4, color: "#64748B", fontSize: 11 }}>{caption}</div>
              </Card>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.7fr) minmax(250px,.8fr)", gap: 16, marginBottom: 16 }}>
            <Card>
              <SectionHeading eyebrow="PERFORMANCE" title="Score progression" action={<button type="button" onClick={() => navigate("/analytics")} style={{ padding: 0, border: 0, color: "#475569", background: "none", font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View analytics <ArrowRight size={13} style={{ verticalAlign: "middle" }} /></button>} />
              {trend.length ? (
                <>
                  <div style={{ height: 182, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: "8px 0 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      {[0, 1, 2, 3].map(line => <div key={line} style={{ borderTop: "1px dashed #E2E8F0" }} />)}
                    </div>
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: "8px 0 24px", width: "100%", height: "calc(100% - 32px)", overflow: "visible" }} aria-label="Score progression chart">
                      {chartValues.length > 1 && <polyline points={chartPoints} fill="none" stroke="#0F172A" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />}
                      {chartValues.map((value, index) => {
                        const x = chartValues.length < 2 ? 50 : 10 + (index / (chartValues.length - 1)) * 80;
                        const y = 82 - (value / 100) * 65;
                        return <circle key={`${trend[index]?.name}-${index}`} cx={x} cy={y} r="2.2" fill="#fff" stroke="#0F172A" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />;
                      })}
                    </svg>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", gap: 8 }}>
                      {trend.map((test, index) => <span key={`${test.completedAt}-${index}`} style={{ flex: 1, textAlign: "center", color: "#94A3B8", fontSize: 10 }}>{test.name || `Test ${index + 1}`}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #E2E8F0", paddingTop: 14, color: "#64748B", fontSize: 12 }}>
                    <span>Latest score</span>
                    <strong style={{ color: "#0F172A" }}>{latestTest.score}/{latestTest.totalQuestions}</strong>
                  </div>
                </>
              ) : (
                <div style={{ minHeight: 176, display: "grid", placeItems: "center", textAlign: "center", color: "#64748B" }}>
                  <div><Activity size={25} color="#94A3B8" style={{ margin: "0 auto 10px" }} /><div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Your score trend will appear here</div><div style={{ marginTop: 5, fontSize: 12 }}>Complete a mock test to start tracking progress.</div></div>
                </div>
              )}
            </Card>

            <Card style={{ display: "flex", flexDirection: "column" }}>
              <SectionHeading eyebrow="TODAY" title="Daily target" />
              <div style={{ padding: "8px 0 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 54, height: 54, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 16, color: "#0F172A", background: "#F1F5F9" }}><Target size={24} /></div>
                <div>
                  <div style={{ color: "#0F172A", fontSize: 19, fontWeight: 700 }}>{DAILY_TARGET} Questions</div>
                  <div style={{ marginTop: 4, color: "#64748B", fontSize: 12 }}>{metrics.todayQuestions} completed today</div>
                </div>
              </div>
              <div style={{ height: 7, marginBottom: 18, overflow: "hidden", borderRadius: 999, background: "#F1F5F9" }}>
                <div style={{ width: `${metrics.dailyProgress}%`, height: "100%", borderRadius: 999, background: "#0F172A", transition: "width 250ms ease" }} />
              </div>
              <button type="button" onClick={() => navigate("/test/sectional")} style={{ display: "flex", width: "100%", marginTop: "auto", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: 0, borderRadius: 12, color: "#fff", background: "#0F172A", font: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Continue practicing <ArrowRight size={16} />
              </button>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.2fr) minmax(270px,.9fr)", gap: 16, marginBottom: 26 }}>
            <Card>
              <SectionHeading eyebrow="SUBJECTS" title="Subject performance" action={<BookOpen size={17} color="#64748B" />} />
              {subjectRows.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {subjectRows.map(subject => (
                    <div key={subject.name}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                        <span style={{ color: "#334155", fontSize: 13, fontWeight: 550 }}>{subject.name}</span>
                        <span style={{ color: "#0F172A", fontSize: 13, fontWeight: 650 }}>{subject.accuracy}%</span>
                      </div>
                      <div style={{ height: 6, overflow: "hidden", borderRadius: 999, background: "#F1F5F9" }}>
                        <div style={{ width: `${subject.accuracy}%`, height: "100%", borderRadius: 999, background: "#0F172A" }} />
                      </div>
                      <div style={{ marginTop: 4, color: "#94A3B8", fontSize: 10 }}>{subject.correct}/{subject.total} correct on latest test</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "24px 0", color: "#64748B", fontSize: 13 }}>Complete a test to see your subject breakdown.</div>
              )}
            </Card>

            <Card>
              <SectionHeading eyebrow="FOCUS NEXT" title="Weak areas" action={<ArrowDownRight size={17} color="#64748B" />} />
              {weakTopics.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {weakTopics.map(topic => (
                    <div key={topic.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 12px", border: "1px solid #E2E8F0", borderRadius: 12, background: "#fff" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ overflow: "hidden", color: "#334155", fontSize: 12, fontWeight: 600, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{topic.name}</div>
                        <div style={{ marginTop: 3, color: "#94A3B8", fontSize: 10 }}>{topic.correct}/{topic.attempted} correct</div>
                      </div>
                      <span style={{ flexShrink: 0, color: "#0F172A", fontSize: 13, fontWeight: 700 }}>{topic.accuracy}%</span>
                    </div>
                  ))}
                  <button type="button" onClick={() => navigate("/revise")} style={{ marginTop: 4, padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 999, color: "#334155", background: "#fff", font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Review weak areas <ArrowRight size={13} style={{ verticalAlign: "middle" }} /></button>
                </div>
              ) : (
                <div style={{ padding: "24px 0", color: "#64748B", fontSize: 13 }}>
                  {latestTest ? "No weak topics found from your latest test." : "Take a mock test to identify topics to focus on."}
                </div>
              )}
            </Card>
          </div>

          <Card style={{ padding: isMobile ? 16 : 22 }}>
            <SectionHeading eyebrow="ACTIVITY" title="Recent tests" action={<Clock3 size={17} color="#64748B" />} />
            {history.length ? (
              <div>
                {history.slice(0, 5).map((test, index) => (
                  <button key={`${test.completedAt}-${index}`} type="button" onClick={() => { localStorage.setItem("imupilot_last_result", JSON.stringify(test)); navigate("/test/result"); }} style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0,1fr) auto" : "minmax(0,2fr) 1fr 1fr auto", alignItems: "center", gap: 12, width: "100%", padding: "14px 4px", border: 0, borderTop: "1px solid #F1F5F9", color: "#334155", background: "transparent", textAlign: "left", font: "inherit", cursor: "pointer" }}>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", overflow: "hidden", color: "#0F172A", fontSize: 13, fontWeight: 600, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{test.name || `Mock #${String(history.length - index).padStart(2, "0")}`}</span>
                      {isMobile && <span style={{ display: "block", marginTop: 3, color: "#94A3B8", fontSize: 11 }}>{formatTestDate(test.completedAt)} · {test.score}/{test.totalQuestions}</span>}
                    </span>
                    {!isMobile && <span style={{ color: "#64748B", fontSize: 12 }}>{formatTestDate(test.completedAt)}</span>}
                    <span style={{ color: "#334155", fontSize: 12, fontWeight: 600 }}>{test.score}/{test.totalQuestions}</span>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, color: "#0F172A", fontSize: 12, fontWeight: 700 }}>
                      {Number(test.accuracy) || 0}% <ArrowRight size={14} color="#94A3B8" />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 0 4px", borderTop: "1px solid #F1F5F9" }}>
                <div>
                  <div style={{ color: "#334155", fontSize: 13, fontWeight: 600 }}>No completed tests yet</div>
                  <div style={{ marginTop: 4, color: "#64748B", fontSize: 12 }}>Your test history will show here when you finish a mock.</div>
                </div>
                <button type="button" onClick={() => navigate("/test")} style={{ flexShrink: 0, padding: "10px 14px", border: 0, borderRadius: 999, color: "#fff", background: "#0F172A", font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Browse tests</button>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
