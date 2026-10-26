import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import IMUpilotSidebar from "../components/IMUpilotSidebar";
import { supabase } from "../supabaseClient";
import { isPro } from "../utils/planUtils";
import UpgradeModal from "../components/UpgradeModal";
import { Lock, Sparkles } from "lucide-react";

const IC = ({ path, size = 16, style = {} }) => (
  <svg
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d={path} />
  </svg>
);

// Strictly Monochromatic Navy/Black/White Theme
const SUBJECT_CONFIG = [
  { key: "Physics", label: "Physics", color: "#0F172A" },
  { key: "Mathematics", label: "Mathematics", color: "#0F172A" },
  { key: "Chemistry", label: "Chemistry", color: "#0F172A" },
  { key: "English", label: "English", color: "#0F172A" },
  { key: "General Aptitude", label: "General Aptitude", color: "#0F172A" },
];

function getSubjectData(breakdown, subjectKey) {
  if (!breakdown || typeof breakdown !== "object") return { correct: 0, total: 0 };
  if (breakdown[subjectKey]) return breakdown[subjectKey];
  if (subjectKey === "General Aptitude") {
    return (
      breakdown["General Aptitude"] ||
      breakdown["GA / GK"] ||
      breakdown["General Knowledge"] ||
      breakdown["Aptitude"] || { correct: 0, total: 0 }
    );
  }
  if (subjectKey === "Mathematics") {
    return breakdown["Mathematics"] || breakdown["Maths"] || { correct: 0, total: 0 };
  }
  return { correct: 0, total: 0 };
}

function formatTestDate(dateStr) {
  if (!dateStr) return "Recent";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Recent";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        if (user?.plan) setProfile({ plan: user.plan });
        if (user?.id) {
          const { data: pData } = await supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle();
          if (pData) setProfile(pData);
        }
      } catch (err) {
        console.error("Failed to load profile for analytics:", err);
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    const loadTestHistory = () => {
      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        let records = [];

        // 1. Primary user key
        if (user?.id) {
          const raw = localStorage.getItem(`imupilot_test_history_${user.id}`);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) records = parsed;
            } catch (e) {}
          }
        }

        // 2. Global fallback key
        if (records.length === 0) {
          const rawAll = localStorage.getItem("imupilot_test_history_all");
          if (rawAll) {
            try {
              const parsed = JSON.parse(rawAll);
              if (Array.isArray(parsed) && parsed.length > 0) records = parsed;
            } catch (e) {}
          }
        }

        // 3. Scan all history keys
        if (records.length === 0) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("imupilot_test_history")) {
              try {
                const data = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(data) && data.length > 0) {
                  records = data;
                  break;
                }
              } catch (e) {}
            }
          }
        }

        // 4. Last result fallback
        if (records.length === 0) {
          const lastResRaw = localStorage.getItem("imupilot_last_result");
          if (lastResRaw) {
            try {
              const lastRes = JSON.parse(lastResRaw);
              if (lastRes && lastRes.completedAt) {
                records = [lastRes];
              }
            } catch (e) {}
          }
        }

        setHistory(records);
      } catch (err) {
        console.error("Failed to load test history from localStorage:", err);
        setHistory([]);
      }
    };

    loadTestHistory();
    window.addEventListener("storage", loadTestHistory);
    return () => window.removeEventListener("storage", loadTestHistory);
  }, []);

  // Subject Aggregates across ALL tests
  const subjectAggregates = useMemo(() => {
    return SUBJECT_CONFIG.map((subj) => {
      let sumCorrect = 0;
      let sumTotal = 0;

      history.forEach((test) => {
        const data = getSubjectData(test?.subjectBreakdown, subj.key);
        sumCorrect += Number(data?.correct) || 0;
        sumTotal += Number(data?.total) || 0;
      });

      const accuracy = sumTotal > 0 ? Math.round((sumCorrect / sumTotal) * 100) : 0;

      return {
        key: subj.key,
        name: subj.label,
        color: subj.color,
        correct: sumCorrect,
        total: sumTotal,
        accuracy,
      };
    });
  }, [history]);

  // Overall Stat Metrics
  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        overallAccuracy: 0,
        totalCorrect: 0,
        totalAttempted: 0,
        avgTimePerQ: null,
        bestSubject: null,
        weakestSubject: null,
      };
    }

    const totalCorrect = history.reduce((sum, t) => sum + (Number(t.correct) || 0), 0);
    const totalAttempted = history.reduce(
      (sum, t) => sum + (Number(t.correct) || 0) + (Number(t.incorrect) || 0),
      0
    );
    const totalQuestions = history.reduce((sum, t) => sum + (Number(t.totalQuestions) || 0), 0);

    const questionsBase = totalAttempted > 0 ? totalAttempted : totalQuestions;
    const overallAccuracy = questionsBase > 0 ? Math.round((totalCorrect / questionsBase) * 100) : 0;

    const totalTimeSeconds = history.reduce((sum, t) => sum + (Number(t.timeTakenSeconds) || 0), 0);
    const timeQuestionBase = totalAttempted > 0 ? totalAttempted : totalQuestions;
    const avgTimePerQ =
      timeQuestionBase > 0 && totalTimeSeconds > 0
        ? Math.round(totalTimeSeconds / timeQuestionBase)
        : null;

    const activeSubjects = subjectAggregates.filter((s) => s.total > 0);
    let bestSubject = null;
    let weakestSubject = null;

    if (activeSubjects.length > 0) {
      const sorted = [...activeSubjects].sort((a, b) => b.accuracy - a.accuracy);
      bestSubject = sorted[0];
      weakestSubject = sorted[sorted.length - 1];
    }

    return {
      overallAccuracy,
      totalCorrect,
      totalAttempted,
      avgTimePerQ,
      bestSubject,
      weakestSubject,
    };
  }, [history, subjectAggregates]);

  // Chronological order for trend (oldest to newest)
  const chronologicalTests = useMemo(() => {
    if (history.length === 0) return [];
    const hasDates = history.every((t) => t?.completedAt && !isNaN(new Date(t.completedAt).getTime()));
    if (hasDates) {
      return [...history].sort(
        (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      );
    }
    return [...history].reverse();
  }, [history]);

  // Last 10 tests oldest -> newest for trend chart
  const trendTests = useMemo(() => {
    return chronologicalTests.slice(-10);
  }, [chronologicalTests]);

  // Trend Delta calculation
  const trendDelta = useMemo(() => {
    if (trendTests.length === 0) return null;
    const firstTest = trendTests[0];
    const latestTest = trendTests[trendTests.length - 1];

    const firstPct =
      firstTest?.totalQuestions > 0
        ? Math.round(((Number(firstTest.score) || 0) / firstTest.totalQuestions) * 100)
        : 0;

    const latestPct =
      latestTest?.totalQuestions > 0
        ? Math.round(((Number(latestTest.score) || 0) / latestTest.totalQuestions) * 100)
        : 0;

    const delta = latestPct - firstPct;

    return {
      firstPct,
      latestPct,
      delta,
      firstName: firstTest?.name || "Mock #1",
      latestName: latestTest?.name || `Mock #${trendTests.length}`,
    };
  }, [trendTests]);

  // All tests for history table (newest first)
  const historyNewestFirst = useMemo(() => {
    if (history.length === 0) return [];
    return [...history].sort((a, b) => {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [history]);

  return (
    <>
      <style>{`
        .analytics-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 14px;
          margin-bottom: 20px;
        }
        .analytics-chart-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1fr) !important;
          gap: 16px;
          margin-bottom: 20px;
        }
        .analytics-subject-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr) !important;
          gap: 12px;
        }
        .analytics-pad {
          padding: 24px 28px !important;
        }
        .analytics-topbar {
          padding: 0 28px !important;
        }
        .analytics-history-table {
          display: grid !important;
        }
        .analytics-history-cards {
          display: none !important;
        }

        @media (max-width: 1024px) {
          .analytics-chart-grid {
            grid-template-columns: 1fr !important;
          }
          .analytics-subject-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        @media (max-width: 767px) {
          .analytics-stats {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .analytics-chart-grid {
            grid-template-columns: 1fr !important;
          }
          .analytics-subject-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .analytics-pad {
            padding: 16px !important;
            padding-bottom: 84px !important;
          }
          .analytics-topbar {
            padding: 0 16px !important;
          }
          .analytics-history-table {
            display: none !important;
          }
          .analytics-history-cards {
            display: flex !important;
          }
        }

        @media (max-width: 480px) {
          .analytics-subject-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "'DM Sans','Segoe UI',sans-serif",
          background: "#F8FAFC",
          color: "#0F172A",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <IMUpilotSidebar />

        <main style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
          {/* Topbar */}
          <div
            className="analytics-topbar"
            style={{
              background: "#FFFFFF",
              borderBottom: "1px solid #E2E8F0",
              height: 58,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 19,
                  letterSpacing: "-0.02em",
                  color: "#0F172A",
                }}
              >
                Analytics
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>
                Deep dive into your performance
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#0F172A",
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                padding: "6px 14px",
              }}
            >
              {history.length > 0
                ? `${history.length} mock test${history.length > 1 ? "s" : ""} completed`
                : "No mock tests"}
            </div>
          </div>

          <div className="analytics-pad">
            {history.length === 0 ? (
              /* EMPTY STATE */
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 18,
                  padding: "54px 24px",
                  textAlign: "center",
                  maxWidth: 580,
                  margin: "40px auto",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 18,
                    background: "#0F172A",
                    color: "#FFFFFF",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <IC
                    path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    size={32}
                  />
                </div>

                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#0F172A",
                    letterSpacing: "-0.02em",
                    marginBottom: 10,
                  }}
                >
                  No Mock Tests Taken Yet
                </h2>

                <p
                  style={{
                    fontSize: 14,
                    color: "#64748B",
                    lineHeight: 1.6,
                    maxWidth: 440,
                    margin: "0 auto 26px",
                  }}
                >
                  Take your first IMU-CET mock test to unlock in-depth analytics, score trend charts,
                  time-per-question analysis, and subject-level proficiency matrices.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/test")}
                  style={{
                    background: "#0F172A",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 28px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.2)",
                    transition: "transform 0.15s ease, background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <span>Start a Mock Test</span>
                  <IC path="M5 12h14M12 5l7 7-7 7" size={16} />
                </button>
              </div>
            ) : (
              <>
                {/* 4 STAT CARDS */}
                <div className="analytics-stats">
                  {[
                    {
                      label: "Overall Accuracy",
                      value: `${stats.overallAccuracy}%`,
                      sub: "Across all tests",
                      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                    },
                    {
                      label: "Avg Time / Q",
                      value: stats.avgTimePerQ !== null ? `${stats.avgTimePerQ}s` : "—",
                      sub: "Target: under 54s",
                      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0",
                    },
                    {
                      label: "Best Subject",
                      value: stats.bestSubject ? stats.bestSubject.name : "—",
                      sub: stats.bestSubject ? `${stats.bestSubject.accuracy}% accuracy` : "No data yet",
                      icon: "M5 13l4 4L19 7",
                    },
                    {
                      label: "Weakest Subject",
                      value: stats.weakestSubject ? stats.weakestSubject.name : "—",
                      sub: stats.weakestSubject
                        ? `${stats.weakestSubject.accuracy}% accuracy`
                        : "No data yet",
                      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: 14,
                        padding: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#64748B",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {s.label}
                        </div>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background: "#F1F5F9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#0F172A",
                          }}
                        >
                          <IC path={s.icon} size={14} />
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: "#0F172A",
                          letterSpacing: "-0.03em",
                          marginBottom: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748B",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CHART + SUBJECT MATRIX OR BLURRED PLACEHOLDER */}
                {isPro(profile) ? (
                  <>
                    <div className="analytics-chart-grid">
                      {/* Score Trend Bar Chart */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: 16,
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#0F172A",
                          letterSpacing: "-0.01em",
                          marginBottom: 2,
                        }}
                      >
                        Score Trend
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748B",
                          marginBottom: 20,
                        }}
                      >
                        Last {trendTests.length} test{trendTests.length > 1 ? "s" : ""} (oldest → newest)
                      </div>

                      {/* Bar chart area */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: trendTests.length > 6 ? 8 : 16,
                          height: 150,
                          paddingBottom: 6,
                          borderBottom: "1px dashed #E2E8F0",
                        }}
                      >
                        {trendTests.map((t, index) => {
                          const pct =
                            t.totalQuestions > 0
                              ? Math.round(((Number(t.score) || 0) / t.totalQuestions) * 100)
                              : 0;
                          const barPct = Math.max(0, Math.min(100, pct));
                          const barHeightPx = Math.max(8, Math.round((barPct / 100) * 110));
                          const isLatest = index === trendTests.length - 1;

                          return (
                            <div
                              key={t.completedAt || index}
                              style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                minWidth: 0,
                              }}
                              title={`${t.name || `Mock #${index + 1}`}: ${t.score}/${t.totalQuestions} (${pct}%) on ${formatTestDate(t.completedAt)}`}
                            >
                              <div
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: isLatest ? "#0F172A" : "#64748B",
                                  marginBottom: 4,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {pct}%
                              </div>
                              <div
                                style={{
                                  width: "100%",
                                  maxWidth: 44,
                                  height: `${barHeightPx}px`,
                                  borderRadius: "4px 4px 0 0",
                                  background: "#0F172A",
                                  opacity: isLatest
                                    ? 1
                                    : Math.max(0.3, 0.3 + (index / Math.max(trendTests.length - 1, 1)) * 0.55),
                                  transition: "height 0.3s ease, opacity 0.2s ease",
                                }}
                              />
                              <div
                                style={{
                                  fontSize: 9,
                                  color: "#94A3B8",
                                  marginTop: 6,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "100%",
                                  textAlign: "center",
                                }}
                              >
                                {formatShortDate(t.completedAt) || t.name || `#${index + 1}`}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Improvement Delta */}
                    {trendDelta && (
                      <div
                        style={{
                          borderTop: "1px solid #E2E8F0",
                          marginTop: 14,
                          paddingTop: 12,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontSize: 11, color: "#64748B" }}>
                          First: <b style={{ color: "#0F172A" }}>{trendDelta.firstPct}%</b>{" "}
                          <span style={{ opacity: 0.75 }}>({trendDelta.firstName})</span>
                        </div>

                        {trendTests.length >= 2 ? (
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0F172A",
                            }}
                          >
                            {trendDelta.delta > 0
                              ? `+${trendDelta.delta}% change`
                              : trendDelta.delta < 0
                              ? `${trendDelta.delta}% change`
                              : "0% change (steady)"}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B" }}>
                            Baseline established
                          </div>
                        )}

                        <div style={{ fontSize: 11, color: "#64748B" }}>
                          Latest: <b style={{ color: "#0F172A" }}>{trendDelta.latestPct}%</b>{" "}
                          <span style={{ opacity: 0.75 }}>({trendDelta.latestName})</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subject Matrix */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: 16,
                      padding: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#0F172A",
                            letterSpacing: "-0.01em",
                            marginBottom: 2,
                          }}
                        >
                          Subject Matrix
                        </div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>
                          Accuracy per subject across all tests
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {subjectAggregates.map((s) => (
                        <div key={s.name}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 5,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#0F172A",
                              }}
                            >
                              {s.name}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                              {s.total > 0 ? `${s.accuracy}%` : "—"}
                            </span>
                          </div>
                          <div
                            style={{
                              height: 6,
                              background: "#F1F5F9",
                              borderRadius: 999,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${s.accuracy}%`,
                                height: "100%",
                                background: "#0F172A",
                                borderRadius: 999,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "#64748B",
                              marginTop: 3,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>
                              {s.correct}/{s.total} correct
                            </span>
                            <span style={{ color: "#94A3B8" }}>
                              {s.total > 0 ? `${s.total} questions` : "0 questions"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SUBJECT BREAKDOWN CARDS */}
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#0F172A",
                      letterSpacing: "-0.01em",
                      marginBottom: 12,
                    }}
                  >
                    Subject Breakdown
                  </div>
                  <div className="analytics-subject-grid">
                    {subjectAggregates.map((s) => {
                      const label =
                        s.accuracy >= 70
                          ? "Strong"
                          : s.accuracy >= 50
                          ? "Average"
                          : "Needs Work";

                      return (
                        <div
                          key={s.name}
                          style={{
                            background: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            borderRadius: 14,
                            padding: "15px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#0F172A",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: 6,
                              }}
                            >
                              {s.name}
                            </div>
                            <div
                              style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: "#0F172A",
                                letterSpacing: "-0.03em",
                                marginBottom: 2,
                              }}
                            >
                              {s.total > 0 ? `${s.accuracy}%` : "0%"}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#64748B",
                                marginBottom: 10,
                              }}
                            >
                              {s.correct}/{s.total} correct
                            </div>
                            <div
                              style={{
                                height: 4,
                                background: "#F1F5F9",
                                borderRadius: 999,
                                marginBottom: 10,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${s.accuracy}%`,
                                  height: "100%",
                                  background: "#0F172A",
                                  borderRadius: 999,
                                }}
                              />
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#0F172A",
                              background: "#F1F5F9",
                              border: "1px solid #E2E8F0",
                              padding: "4px 8px",
                              borderRadius: 6,
                              textAlign: "center",
                            }}
                          >
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* PRO BLURRED PLACEHOLDER FOR FREE USERS */
              <div
                style={{
                  position: "relative",
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 20,
                  minHeight: 340,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Blurred background preview of charts */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    filter: "blur(6px)",
                    opacity: 0.35,
                    pointerEvents: "none",
                    userSelect: "none",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
                    <div style={{ height: 180, background: "#0F172A", opacity: 0.1, borderRadius: 12 }} />
                    <div style={{ height: 180, background: "#0F172A", opacity: 0.08, borderRadius: 12 }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ height: 90, background: "#0F172A", opacity: 0.06, borderRadius: 10 }} />
                    ))}
                  </div>
                </div>

                {/* Centered Lock Card */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    maxWidth: 440,
                    margin: "36px 20px",
                    textAlign: "center",
                    padding: "32px 28px",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid #E2E8F0",
                    borderRadius: 16,
                    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 14,
                      background: "#0F172A",
                      color: "#FFFFFF",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      boxShadow: "0 4px 14px rgba(15, 23, 42, 0.15)",
                    }}
                  >
                    <Lock size={22} />
                  </div>

                  <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 750, color: "#0F172A" }}>
                    Upgrade to Pro to see subject-wise breakdown
                  </h3>
                  <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748B", lineHeight: 1.55 }}>
                    Unlock detailed subject accuracy matrices, 5-subject strength analysis, and historical score trend tracking.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      width: "100%",
                      padding: "12px 20px",
                      background: "#0F172A",
                      color: "#FFFFFF",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 2px 10px rgba(15, 23, 42, 0.12)",
                    }}
                  >
                    <Sparkles size={16} color="#FBBF24" />
                    Upgrade to Pro — ₹999
                  </button>
                </div>
              </div>
            )}

            {/* MOCK HISTORY TABLE */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 16,
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#0F172A",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Mock Test History
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>
                      {historyNewestFirst.length} test{historyNewestFirst.length > 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Desktop table */}
                  <div
                    className="analytics-history-table"
                    style={{
                      gridTemplateColumns: "2.2fr 1.2fr 1fr 1fr 1.2fr",
                      alignItems: "center",
                    }}
                  >
                    {["Test", "Date", "Score", "Percentage", "Result"].map((h) => (
                      <div
                        key={h}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#64748B",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          padding: "8px 12px",
                          borderBottom: "1px solid #E2E8F0",
                        }}
                      >
                        {h}
                      </div>
                    ))}
                    {historyNewestFirst.map((m, idx) => {
                      const pct =
                        m.totalQuestions > 0
                          ? Math.round(((Number(m.score) || 0) / m.totalQuestions) * 100)
                          : 0;
                      const badgeText = pct >= 70 ? "Good" : pct >= 50 ? "Average" : "Needs Work";

                      return (
                        <React.Fragment key={m.completedAt || idx}>
                          <div
                            style={{
                              padding: "10px 12px",
                              borderBottom: "1px solid #E2E8F0",
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0F172A",
                            }}
                          >
                            {m.name || `Mock #${historyNewestFirst.length - idx}`}
                          </div>
                          <div
                            style={{
                              padding: "10px 12px",
                              borderBottom: "1px solid #E2E8F0",
                              fontSize: 13,
                              color: "#64748B",
                            }}
                          >
                            {formatTestDate(m.completedAt)}
                          </div>
                          <div
                            style={{
                              padding: "10px 12px",
                              borderBottom: "1px solid #E2E8F0",
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0F172A",
                            }}
                          >
                            {m.score} / {m.totalQuestions}
                          </div>
                          <div
                            style={{
                              padding: "10px 12px",
                              borderBottom: "1px solid #E2E8F0",
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#0F172A",
                            }}
                          >
                            {pct}%
                          </div>
                          <div
                            style={{
                              padding: "10px 12px",
                              borderBottom: "1px solid #E2E8F0",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: 999,
                                background: "#F1F5F9",
                                color: "#0F172A",
                                border: "1px solid #E2E8F0",
                                display: "inline-block",
                              }}
                            >
                              {badgeText}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Mobile cards */}
                  <div className="analytics-history-cards" style={{ flexDirection: "column", gap: 10 }}>
                    {historyNewestFirst.map((m, idx) => {
                      const pct =
                        m.totalQuestions > 0
                          ? Math.round(((Number(m.score) || 0) / m.totalQuestions) * 100)
                          : 0;
                      const badgeText = pct >= 70 ? "Good" : pct >= 50 ? "Average" : "Needs Work";

                      return (
                        <div
                          key={m.completedAt || idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px",
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: 10,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 13,
                                color: "#0F172A",
                              }}
                            >
                              {m.name || `Mock #${historyNewestFirst.length - idx}`}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#64748B",
                                marginTop: 2,
                              }}
                            >
                              {formatTestDate(m.completedAt)} · {m.score}/{m.totalQuestions}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>
                              {pct}%
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "3px 10px",
                                borderRadius: 999,
                                background: "#FFFFFF",
                                border: "1px solid #E2E8F0",
                                color: "#0F172A",
                              }}
                            >
                              {badgeText}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Unlock Advanced Analytics"
        subtitle="Upgrade to IMUpilot Pro for subject-wise accuracy breakdowns, score progression charts, and full mock exams."
      />
    </>
  );
}
