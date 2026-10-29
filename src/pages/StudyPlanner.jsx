import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import IMUpilotSidebar from "../components/IMUpilotSidebar";
import {
  Flame,
  Trophy,
  Edit3,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Calendar as CalendarIcon,
  List as ListIcon,
  BarChart2,
  CheckCircle2,
  Check,
  X
} from "lucide-react";

// ─── constants ────────────────────────────────────────────────────────────────

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "English", "General Aptitude"];
const TASK_TYPES = ["Study notes", "Practice questions", "Mock test", "Flashcards", "Revision", "Past paper"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm

const MONO = ["var(--accent-navy, #1a2f5a)", "rgba(26,47,90,0.12)"];
const SUB_COLORS = {
  Mathematics:        MONO,
  Physics:            MONO,
  Chemistry:          MONO,
  English:            MONO,
  "General Aptitude": MONO,
};

const TYPE_COLORS = {
  "Mock test":          MONO,
  "Flashcards":         MONO,
  "Revision":           MONO,
  "Practice questions": MONO,
  "Study notes":        MONO,
  "Past paper":         MONO,
};

const PRIORITY_META = {
  high:   { label: "High",   icon: "●", color: "#1a2f5a", bg: "rgba(26,47,90,0.12)", border: "rgba(26,47,90,0.3)" },
  medium: { label: "Medium", icon: "●", color: "#4a6080", bg: "rgba(74,96,128,0.12)", border: "rgba(74,96,128,0.3)" },
  low:    { label: "Low",    icon: "●", color: "#8B949E", bg: "rgba(139,148,158,0.12)", border: "rgba(139,148,158,0.3)" },
};

function taskColor(task) {
  if (task.subject && SUB_COLORS[task.subject]) return SUB_COLORS[task.subject];
  if (task.task_type && TYPE_COLORS[task.task_type]) return TYPE_COLORS[task.task_type];
  return ["#8B949E", "rgba(139,148,158,0.15)"];
}

function dateKey(d) { return d.toISOString().slice(0, 10); }
function todayKey() { return dateKey(new Date()); }
function isToday(d) { return dateKey(d) === todayKey(); }

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
}

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

// ─── colours & design system ──────────────────────────────────────────────────

const D = {
  bg: "var(--bg-primary, #0A0F1E)",
  surface: "var(--bg-elevated, #111827)",
  surface2: "var(--bg-secondary, #1A2235)",
  border: "var(--border-subtle, rgba(255,255,255,0.08))",
  borderStrong: "var(--border-default, rgba(255,255,255,0.15))",
  accent: "var(--accent-navy, #1a2f5a)",
  accentBg: "rgba(26,47,90,0.08)",
  navy: "var(--accent-navy, #1a2f5a)",
  text: "var(--text-primary, #F5F5F5)",
  textSec: "var(--text-secondary, #9CA3AF)",
  textMuted: "var(--text-tertiary, #6B7280)",
  green: "#1a2f5a",
  greenBg: "rgba(26,47,90,0.08)",
};

const S = {
  page: { display: "flex", minHeight: "100vh", background: D.bg, fontFamily: "'DM Sans', system-ui, sans-serif", color: D.text },
  main: { flex: 1, minWidth: 0, overflowX: "hidden", display: "flex", flexDirection: "column", minHeight: "100vh" },
  topbar: { padding: "clamp(12px, 4vw, 28px)", paddingBottom: 0, flexShrink: 0 },
  titleRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 },
  title: { fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: D.text },
  titleSub: { fontSize: 13, color: D.textSec, marginTop: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  todayHighlight: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "3px 10px", borderRadius: 999, background: D.surface2,
    border: `1px solid ${D.border}`, fontSize: 12, fontWeight: 600, color: D.accent
  },
  tabGroup: { display: "flex", gap: 4, background: D.surface, border: `1px solid ${D.border}`, borderRadius: 10, padding: 4 },
  tab: (a) => ({
    padding: "6px 14px", fontSize: 13, fontWeight: 600, borderRadius: 7, cursor: "pointer",
    border: "none", background: a ? D.accent : "transparent", color: a ? "#fff" : D.textSec,
    transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: 6
  }),
  weekNav: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  navBtn: { width: 30, height: 30, borderRadius: 8, border: `1px solid ${D.border}`, background: D.surface, color: D.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" },
  weekLabel: { fontSize: 13, fontWeight: 500, color: D.text, minWidth: 160, textAlign: "center" },
  todayBtn: { padding: "5px 12px", fontSize: 12, fontWeight: 500, borderRadius: 7, border: `1px solid ${D.border}`, background: "transparent", color: D.textSec, cursor: "pointer" },

  // calendar
  calWrap: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "0 28px 28px" },
  calGrid: { display: "flex", flex: 1, overflow: "hidden", border: `1px solid ${D.border}`, borderRadius: 12, background: D.surface },
  timeCol: { width: 52, flexShrink: 0, borderRight: `1px solid ${D.border}` },
  timeHeader: { height: 48, borderBottom: `1px solid ${D.border}` },
  timeCell: { height: 60, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 4, fontSize: 11, color: D.textMuted, borderBottom: `1px solid ${D.border}` },
  daysCols: { flex: 1, overflow: "auto", display: "flex", flexDirection: "column" },
  dayHeaders: { display: "grid", height: 48, borderBottom: `1px solid ${D.border}`, flexShrink: 0 },
  dayHeader: (today) => ({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${D.border}`, fontSize: 11, fontWeight: 600, color: today ? "#1a2f5a" : D.textSec, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", gap: 2 }),
  dayDateNum: (today) => ({ fontSize: 16, fontWeight: 700, color: today ? "#fff" : D.text, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: today ? "#1a2f5a" : "transparent" }),
  hoursGrid: { display: "grid", flex: 1 },
  hourRow: { display: "grid", height: 60, borderBottom: `1px solid ${D.border}` },
  hourCell: (today) => ({ borderRight: `1px solid ${D.border}`, position: "relative", background: today ? "rgba(26,47,90,0.03)" : "transparent" }),

  // task block
  taskBlock: (color, bg, done) => ({
    position: "absolute", left: 3, right: 3, borderRadius: 6, padding: "3px 6px",
    background: bg, borderLeft: `3px solid ${color}`, cursor: "pointer",
    overflow: "hidden", opacity: done ? 0.45 : 1, transition: "opacity 0.15s",
    zIndex: 1,
  }),
  taskBlockTitle: { fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  taskBlockSub: { fontSize: 10, color: D.textSec, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },

  // list view
  listWrap: { flex: 1, overflow: "auto", padding: "0 28px 28px" },
  daySection: { marginBottom: 20 },
  daySectionTitle: { fontSize: 13, fontWeight: 700, color: D.textSec, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 },
  taskRow: (done) => ({ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 14px", background: done ? "rgba(255,255,255,0.02)" : D.surface, borderRadius: 10, marginBottom: 6, border: `1px solid ${done ? D.border : "transparent"}`, opacity: done ? 0.6 : 1 }),
  checkbox: (done) => ({ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${done ? D.accent : D.border}`, background: done ? D.accent : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }),
  taskTitle: (done) => ({ fontSize: 14, fontWeight: 500, color: done ? D.textSec : D.text, textDecoration: done ? "line-through" : "none", flex: 1, lineHeight: 1.4 }),
  taskMeta: { fontSize: 11, color: D.textSec, marginTop: 3 },
  deleteBtn: { width: 26, height: 26, borderRadius: 6, border: "none", background: "transparent", color: D.textMuted, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  badge: (c, bg) => ({ display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: bg, color: c, marginRight: 5 }),

  // add modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" },
  modalBox: { background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, padding: 24, width: 460, maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16 },
  input: { width: "100%", padding: "9px 12px", fontSize: 13, borderRadius: 9, border: `1px solid ${D.border}`, background: D.bg, color: D.text, marginBottom: 10, boxSizing: "border-box", outline: "none" },
  select: { width: "100%", padding: "9px 12px", fontSize: 13, borderRadius: 9, border: `1px solid ${D.border}`, background: D.bg, color: D.text, marginBottom: 10, boxSizing: "border-box", cursor: "pointer" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  label: { fontSize: 11, color: D.textSec, marginBottom: 4, display: "block" },
  btn: (v) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", fontSize: 13, fontWeight: 600, borderRadius: 9, cursor: "pointer", border: v === "ghost" ? `1px solid ${D.border}` : "none", background: v === "accent" ? D.accent : v === "ghost" ? "transparent" : D.surface2, color: v === "accent" ? "#fff" : D.textSec }),

  // summary
  summaryWrap: { flex: 1, overflow: "auto", padding: "0 28px 28px" },
  metricGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 },
  metricCard: (accent) => ({ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 12, padding: 16, borderTop: `3px solid ${accent}` }),
  metricVal: { fontSize: 28, fontWeight: 700 },
  metricLabel: { fontSize: 12, color: D.textSec, marginTop: 4 },
  progBar: { height: 6, background: D.border, borderRadius: 3, overflow: "hidden", marginTop: 6 },
  progFill: (pct, c) => ({ height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: c, borderRadius: 3, transition: "width 0.3s ease" }),

  // carryover
  coModal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" },
  coBox: { background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, padding: 28, width: 400, maxWidth: "92vw" },
};

// ─── TODO VIEW COMPONENT ──────────────────────────────────────────────────────

function TodoView({ todos, onAdd, onToggle, onUpdateText, onDelete, isSidebar = false }) {
  const [inputText, setInputText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [doneOpen, setDoneOpen] = useState(false);

  const undone = todos.filter(t => !t.done);
  const todayFocus = undone.filter(t => t.priority === "high");
  const regularTodos = undone.filter(t => t.priority !== "high");
  const doneTodos = todos.filter(t => t.done);

  const handleAdd = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onAdd(inputText.trim(), priority);
    setInputText("");
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditText(t.text);
  };

  const saveEdit = (id) => {
    if (editText.trim()) {
      onUpdateText(id, editText.trim());
    }
    setEditingId(null);
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: isSidebar ? "16px 18px" : "0 28px 28px",
      overflowY: "auto",
      boxSizing: "border-box"
    }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: isSidebar ? 15 : 18, fontWeight: 700, color: D.text, display: "flex", alignItems: "center", gap: 7 }}>
            <span>To-Do List</span>
            <span style={{ fontSize: 11, background: D.accentBg, color: D.accent, padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
              {undone.length} remaining
            </span>
          </div>
          {!isSidebar && <div style={{ fontSize: 12, color: D.textSec, marginTop: 2 }}>Persistent tasks without set dates</div>}
        </div>
      </div>

      {/* Inline Quick-Add Form */}
      <form onSubmit={handleAdd} style={{ marginBottom: 16 }}>
        <div style={{
          background: D.surface,
          border: `1px solid ${D.border}`,
          borderRadius: 12,
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          <input
            type="text"
            placeholder="Add task... (Press Enter)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              color: D.text,
              fontSize: 13,
              fontFamily: "inherit",
              padding: "4px 2px",
              boxSizing: "border-box"
            }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTop: `1px solid ${D.border}` }}>
            {/* Priority Selector */}
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { id: "high", icon: "●", color: "#1a2f5a", label: "High" },
                { id: "medium", icon: "●", color: "#4a6080", label: "Med" },
                { id: "low", icon: "●", color: "#8B949E", label: "Low" }
              ].map(p => {
                const active = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    style={{
                      border: `1px solid ${active ? p.color : D.border}`,
                      background: active ? `${p.color}15` : "transparent",
                      color: active ? p.color : D.textSec,
                      borderRadius: 6,
                      padding: "2px 6px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ color: p.color, fontSize: 10 }}>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                background: inputText.trim() ? "var(--accent-navy, #1a2f5a)" : D.surface2,
                color: inputText.trim() ? "#fff" : D.textMuted,
                border: "none",
                borderRadius: 7,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                cursor: inputText.trim() ? "pointer" : "default",
                display: "inline-flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <Plus size={13} /> Add
            </button>
          </div>
        </div>
      </form>

      {/* Task Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* SECTION 1: TODAY'S FOCUS (HIGH PRIORITY) */}
        {todayFocus.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-navy, #1a2f5a)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <span>🎯 Today's Focus ({todayFocus.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {todayFocus.map(t => renderTodoRow(t))}
            </div>
          </div>
        )}

        {/* SECTION 2: REGULAR TO DO */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: D.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <span>📋 To Do ({regularTodos.length})</span>
          </div>
          {regularTodos.length === 0 && todayFocus.length === 0 ? (
            <div style={{ padding: "16px 12px", textAlign: "center", color: D.textMuted, fontSize: 12, background: D.surface, borderRadius: 10, border: `1px dashed ${D.border}` }}>
              No tasks left. Add your first item above!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {regularTodos.map(t => renderTodoRow(t))}
            </div>
          )}
        </div>

        {/* SECTION 3: DONE (COLLAPSIBLE) */}
        {doneTodos.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <button
              type="button"
              onClick={() => setDoneOpen(p => !p)}
              style={{
                background: "transparent",
                border: "none",
                color: D.textSec,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 0",
                marginBottom: 6,
              }}
            >
              {doneOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>Completed ({doneTodos.length})</span>
            </button>
            {doneOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {doneTodos.map(t => renderTodoRow(t))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  function renderTodoRow(t) {
    const meta = PRIORITY_META[t.priority] || PRIORITY_META.medium;
    const isEditing = editingId === t.id;

    return (
      <div
        key={t.id}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
          borderRadius: 9,
          background: t.done ? "transparent" : D.surface,
          border: `1px solid ${t.done ? D.border : D.borderStrong}`,
          opacity: t.done ? 0.55 : 1,
          transition: "all 0.15s ease",
        }}
      >
        {/* Checkbox */}
        <div
          onClick={() => onToggle(t.id, t.done)}
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            border: `2px solid ${t.done ? D.green : D.border}`,
            background: t.done ? D.green : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "all 0.12s",
          }}
        >
          {t.done && <Check size={11} color="#fff" strokeWidth={3} />}
        </div>

        {/* Text / Inline Edit */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <input
              type="text"
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={() => saveEdit(t.id)}
              onKeyDown={e => {
                if (e.key === "Enter") saveEdit(t.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              style={{
                width: "100%",
                background: D.bg,
                color: D.text,
                border: `1px solid ${D.accent}`,
                borderRadius: 4,
                padding: "2px 6px",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          ) : (
            <span
              onClick={() => !t.done && startEdit(t)}
              title={!t.done ? "Click to edit" : ""}
              style={{
                fontSize: 13,
                color: t.done ? D.textMuted : D.text,
                textDecoration: t.done ? "line-through" : "none",
                cursor: t.done ? "default" : "pointer",
                wordBreak: "break-word",
                display: "block",
                lineHeight: 1.4,
              }}
            >
              {t.text}
            </span>
          )}
        </div>

        {/* Priority Badge */}
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: meta.color,
            background: meta.bg,
            border: `1px solid ${meta.border}`,
            padding: "2px 6px",
            borderRadius: 6,
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <span>{meta.icon}</span>
          <span>{meta.label}</span>
        </span>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(t.id)}
          style={{
            background: "transparent",
            border: "none",
            color: D.textMuted,
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            transition: "color 0.15s",
          }}
          onMouseOver={e => e.currentTarget.style.color = "#EF4444"}
          onMouseOut={e => e.currentTarget.style.color = D.textMuted}
          title="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    );
  }
}

// ─── UPGRADED SUMMARY VIEW ────────────────────────────────────────────────────

function SummaryView({ tasks, allCompletedTasks = [] }) {
  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("planner_goals") || "null") || {
        Mathematics: 4,
        Physics: 4,
        Chemistry: 4,
        English: 2,
        "General Aptitude": 2
      };
    } catch {
      return { Mathematics: 4, Physics: 4, Chemistry: 4, English: 2, "General Aptitude": 2 };
    }
  });
  const [editingGoals, setEditingGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState({ ...goals });

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  // 1. Streak Calculation
  const { currentStreak, bestStreak } = useMemo(() => {
    const datesSet = new Set(allCompletedTasks.map(t => t.date_key).filter(Boolean));
    if (datesSet.size === 0) return { currentStreak: 0, bestStreak: 0 };

    const sortedDates = Array.from(datesSet).sort();
    
    // Best streak
    let best = 0;
    let run = 0;
    let prev = null;
    for (const dStr of sortedDates) {
      const cur = new Date(dStr);
      if (prev) {
        const diffDays = Math.round((cur - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          run++;
        } else if (diffDays > 1) {
          run = 1;
        }
      } else {
        run = 1;
      }
      prev = cur;
      if (run > best) best = run;
    }

    // Current streak ending today or yesterday
    let current = 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let check = new Date(today);

    // If completed today, count today
    if (datesSet.has(dateKey(check))) {
      current++;
      check.setDate(check.getDate() - 1);
    } else {
      // Check if completed yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (datesSet.has(dateKey(yesterday))) {
        current++;
        check = new Date(yesterday);
        check.setDate(check.getDate() - 1);
      } else {
        return { currentStreak: 0, bestStreak: best };
      }
    }

    while (datesSet.has(dateKey(check))) {
      current++;
      check.setDate(check.getDate() - 1);
    }

    return { currentStreak: current, bestStreak: Math.max(best, current) };
  }, [allCompletedTasks]);

  // 2. 28-day Heatmap Data (4 weeks)
  const heatmapDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const k = dateKey(d);
      const count = allCompletedTasks.filter(t => t.date_key === k).length;
      days.push({ date: d, key: k, count });
    }
    return days;
  }, [allCompletedTasks]);

  const saveGoals = () => {
    setGoals(tempGoals);
    localStorage.setItem("planner_goals", JSON.stringify(tempGoals));
    setEditingGoals(false);
  };

  return (
    <div style={S.summaryWrap}>
      {/* ── 1. STREAK & CONSISTENCY CARD ── */}
      <div style={{
        background: D.surface,
        border: `1px solid ${D.border}`,
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 20,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 20,
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(26, 47, 90, 0.12)",
            border: "1px solid rgba(26, 47, 90, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}>
            <Flame size={28} color="#1a2f5a" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: D.accent, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Active Study Streak
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: D.text, lineHeight: 1.2 }}>
              🔥 {currentStreak} {currentStreak === 1 ? "day" : "days"}
            </div>
            <div style={{ fontSize: 12, color: D.textSec, marginTop: 2 }}>
              {currentStreak > 0 ? "You're building momentum! Keep it going." : "Complete a task today to begin your streak."}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, borderLeft: `1px solid ${D.border}`, paddingLeft: 20 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(26, 47, 90, 0.12)",
            border: "1px solid rgba(26, 47, 90, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1a2f5a",
            flexShrink: 0
          }}>
            <Trophy size={24} color="#1a2f5a" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a2f5a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              All-Time Best
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: D.text, lineHeight: 1.2 }}>
              {bestStreak} {bestStreak === 1 ? "day" : "days"}
            </div>
            <div style={{ fontSize: 12, color: D.textSec, marginTop: 2 }}>
              Personal record streak
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. COMPLETION HEATMAP (28 DAYS) ── */}
      <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: D.text }}>Completion Heatmap</div>
            <div style={{ fontSize: 12, color: D.textSec }}>Study consistency over the past 4 weeks (28 days)</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: D.textSec }}>
            <span>Less</span>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(255,255,255,0.06)" }} />
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(26, 47, 90, 0.35)" }} />
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(26, 47, 90, 0.65)" }} />
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "#1a2f5a" }} />
            <span>More</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(28, 1fr)", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
          {heatmapDays.map((hd, i) => {
            let bg = "rgba(255,255,255,0.06)";
            let border = "transparent";
            if (hd.count === 1) bg = "rgba(26, 47, 90, 0.35)";
            else if (hd.count === 2) bg = "rgba(26, 47, 90, 0.65)";
            else if (hd.count >= 3) { bg = "#1a2f5a"; border = "#4a6080"; }

            const isCurrent = hd.key === todayKey();

            return (
              <div
                key={i}
                title={`${hd.date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}: ${hd.count} tasks done`}
                style={{
                  height: 36,
                  borderRadius: 6,
                  background: bg,
                  border: isCurrent ? `2px solid ${D.accent}` : `1px solid ${border}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 600,
                  color: hd.count > 0 ? "#fff" : D.textMuted,
                  cursor: "default",
                  transition: "transform 0.15s ease",
                  minWidth: 16
                }}
              >
                {hd.count > 0 ? hd.count : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. WEEKLY GOAL PROGRESS PER SUBJECT ── */}
      <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: D.text }}>Weekly Subject Goals</div>
            <div style={{ fontSize: 12, color: D.textSec }}>Target completed sessions this week</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setTempGoals({ ...goals });
              setEditingGoals(p => !p);
            }}
            style={{
              background: "transparent",
              border: `1px solid ${D.border}`,
              borderRadius: 8,
              padding: "5px 12px",
              color: D.textSec,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <Edit3 size={13} /> {editingGoals ? "Cancel" : "Set Targets"}
          </button>
        </div>

        {editingGoals ? (
          <div style={{ background: D.surface2, padding: 16, borderRadius: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: D.text }}>Adjust Weekly Session Targets:</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
              {SUBJECTS.map(s => (
                <div key={s}>
                  <label style={{ fontSize: 12, color: D.textSec, display: "block", marginBottom: 4 }}>{s}</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={tempGoals[s] || 3}
                    onChange={e => setTempGoals({ ...tempGoals, [s]: parseInt(e.target.value) || 1 })}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 7,
                      border: `1px solid ${D.border}`,
                      background: D.bg,
                      color: D.text,
                      fontSize: 13,
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              ))}
            </div>
            <button style={{ ...S.btn("accent"), padding: "6px 14px", fontSize: 12 }} onClick={saveGoals}>
              Save Targets
            </button>
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SUBJECTS.map(s => {
            const [c] = SUB_COLORS[s] || ["#8B949E"];
            const doneSessions = tasks.filter(t => t.subject === s && t.done).length;
            const target = goals[s] || 3;
            const progressPct = Math.round((doneSessions / target) * 100);

            return (
              <div key={s}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, color: D.text }}>{s}</span>
                  <span style={{ color: doneSessions >= target ? "var(--accent-navy, #1a2f5a)" : D.textSec, fontWeight: 600 }}>
                    {doneSessions}/{target} sessions {doneSessions >= target ? "🎉 Done" : `(${progressPct}%)`}
                  </span>
                </div>
                <div style={S.progBar}>
                  <div style={S.progFill(progressPct, doneSessions >= target ? "var(--accent-navy, #1a2f5a)" : c)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. EXISTING METRIC OVERVIEW ── */}
      <div style={S.metricGrid}>
        {[
          ["Planned", total, D.accent],
          ["Completed", done, D.accent],
          ["Completion Rate", `${pct}%`, D.accent],
          ["Remaining", Math.max(0, total - done), D.accent]
        ].map(([label, val, c]) => (
          <div key={label} style={S.metricCard(c)}>
            <div style={{ ...S.metricVal, color: c }}>{val}</div>
            <div style={S.metricLabel}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SMARTER ADD TASK MODAL ───────────────────────────────────────────────────

function AddModal({ date, initialSubject = "", startHour = "", onAdd, onClose }) {
  const [mode, setMode] = useState("structured");
  const [form, setForm] = useState({
    title: "",
    subject: initialSubject || "",
    task_type: "",
    notes: "",
    start_hour: startHour ? String(startHour) : "",
    duration_mins: "60",
    priority: "medium",
    repeat: "none"
  });
  const [quickInput, setQuickInput] = useState("");
  const [parsedHint, setParsedHint] = useState("");

  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  // Intelligent Quick Parse: "math 2h", "phy 90m revision", "chem mock"
  const parseQuickInput = (str) => {
    let sub = form.subject;
    let dur = form.duration_mins;
    let type = form.task_type;
    let prio = form.priority;

    // Parse subject
    if (/math(s|ematics)?/i.test(str)) sub = "Mathematics";
    else if (/phy(s|sics)?/i.test(str)) sub = "Physics";
    else if (/chem(istry)?/i.test(str)) sub = "Chemistry";
    else if (/eng(lish)?/i.test(str)) sub = "English";
    else if (/apt|general aptitude|ga/i.test(str)) sub = "General Aptitude";

    // Parse duration
    const hourMatch = str.match(/(\d+(\.\d+)?)\s*(h|hr|hours?)/i);
    if (hourMatch) {
      dur = String(Math.round(parseFloat(hourMatch[1]) * 60));
    } else {
      const minMatch = str.match(/(\d+)\s*(m|min|mins?)/i);
      if (minMatch) dur = minMatch[1];
    }

    // Parse task type
    if (/notes?/i.test(str)) type = "Study notes";
    else if (/mock/i.test(str)) type = "Mock test";
    else if (/flash(card)?s?/i.test(str)) type = "Flashcards";
    else if (/revis(e|ion)/i.test(str)) type = "Revision";
    else if (/practice|question/i.test(str)) type = "Practice questions";
    else if (/past\s*paper|pyq/i.test(str)) type = "Past paper";

    // Parse priority
    if (/high|urgent|p1/i.test(str)) prio = "high";
    else if (/low|p3/i.test(str)) prio = "low";

    setForm(prev => ({
      ...prev,
      subject: sub,
      duration_mins: dur,
      task_type: type,
      priority: prio,
    }));

    const parsedBits = [sub, `${dur}m`, type, prio ? `${prio} priority` : ""].filter(Boolean);
    if (parsedBits.length > 0) {
      setParsedHint(`Auto-detected: ${parsedBits.join(" · ")}`);
    }
  };

  function submit() {
    const title = mode === "free" ? form.title : [form.task_type, form.subject, form.title].filter(Boolean).join(" — ");
    if (!title.trim()) return;

    onAdd({
      title,
      subject: form.subject || null,
      task_type: form.task_type || null,
      notes: form.notes || null,
      start_hour: form.start_hour ? parseInt(form.start_hour) : null,
      duration_mins: form.duration_mins ? parseInt(form.duration_mins) : 60,
      priority: form.priority || "medium",
      repeat: form.repeat || "none",
      date_key: dateKey(date),
      done: false,
    });
  }

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={S.modalTitle}>Add Task — {date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</div>
          <button style={{ ...S.btn("ghost"), padding: "4px 10px", fontSize: 12 }} onClick={onClose}>✕</button>
        </div>

        {/* Quick Add parser shortcut */}
        <div style={{
          background: D.surface2,
          border: `1px solid ${D.border}`,
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 16
        }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: D.accent, display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <Sparkles size={12} /> Quick Add Shortcut
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              placeholder="e.g. math 2h mock OR physics 90m revision"
              value={quickInput}
              onChange={e => {
                setQuickInput(e.target.value);
                parseQuickInput(e.target.value);
              }}
              style={{
                ...S.input,
                marginBottom: 0,
                fontSize: 12,
                padding: "7px 10px",
              }}
            />
          </div>
          {parsedHint && (
            <div style={{ fontSize: 11, color: "var(--accent-navy, #1a2f5a)", fontWeight: 600, marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
              <Check size={12} /> {parsedHint}
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
          {["structured", "free"].map(m => (
            <button key={m} style={{ ...S.btn(mode === m ? "accent" : "ghost"), padding: "5px 12px", fontSize: 12 }} onClick={() => setMode(m)}>
              {m === "structured" ? "Picker" : "Free text"}
            </button>
          ))}
        </div>

        {mode === "structured" ? (
          <div style={S.formRow}>
            <div>
              <label style={S.label}>Subject</label>
              <select style={S.select} {...f("subject")}>
                <option value="">— Subject —</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Task type</label>
              <select style={S.select} {...f("task_type")}>
                <option value="">— Type —</option>
                {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        ) : null}

        <label style={S.label}>{mode === "structured" ? "Extra detail (optional)" : "Task Title"}</label>
        <input
          style={S.input}
          placeholder={mode === "structured" ? "e.g. Chapter 3, exercises 1–15" : "e.g. Solve 20 Trigonometry problems"}
          {...f("title")}
          onKeyDown={e => e.key === "Enter" && submit()}
        />

        <div style={S.formRow}>
          <div>
            <label style={S.label}>Start time (optional)</label>
            <select style={S.select} {...f("start_hour")}>
              <option value="">No time set</option>
              {HOURS.map(h => <option key={h} value={h}>{h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Duration</label>
            <select style={S.select} {...f("duration_mins")}>
              {[30, 45, 60, 90, 120, 150, 180].map(m => (
                <option key={m} value={m}>
                  {m >= 60 ? `${m / 60}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority & Repeat Fields */}
        <div style={S.formRow}>
          <div>
            <label style={S.label}>Priority</label>
            <select style={S.select} {...f("priority")}>
              <option value="high">● High Priority</option>
              <option value="medium">● Medium Priority</option>
              <option value="low">● Low Priority</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Repeat</label>
            <select style={S.select} {...f("repeat")}>
              <option value="none">None (Single day)</option>
              <option value="daily">Daily (Rest of week)</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <label style={S.label}>Notes (optional)</label>
        <input style={S.input} placeholder="Any notes or references..." {...f("notes")} />

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button style={S.btn("accent")} onClick={submit}>+ Add task</button>
          <button style={S.btn("ghost")} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── CALENDAR VIEW ────────────────────────────────────────────────────────────

function CalendarView({ weekDates, tasks, onToggle, onDelete, onClickDay, onClickCell }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 60;
  }, []);

  const tasksByDayHour = {};
  tasks.forEach(t => {
    if (t.start_hour != null) {
      const key = `${t.date_key}_${t.start_hour}`;
      if (!tasksByDayHour[key]) tasksByDayHour[key] = [];
      tasksByDayHour[key].push(t);
    }
  });

  return (
    <div style={S.calGrid}>
      {/* time column */}
      <div style={S.timeCol}>
        <div style={S.timeHeader} />
        <div style={{ overflowY: "hidden", flex: 1 }} ref={scrollRef}>
          {HOURS.map(h => (
            <div key={h} style={S.timeCell}>
              {h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}
            </div>
          ))}
        </div>
      </div>

      {/* days columns */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* day headers */}
        <div style={{ ...S.dayHeaders, gridTemplateColumns: `repeat(7, 1fr)`, flexShrink: 0 }}>
          {weekDates.map((d, i) => {
            const today = isToday(d);
            return (
              <div key={i} style={S.dayHeader(today)} onClick={() => onClickDay(d)}>
                <span>{DAYS_SHORT[i]}</span>
                <div style={S.dayDateNum(today)}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* scrollable hour rows */}
        <div style={{ flex: 1, overflowY: "auto" }} ref={scrollRef}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(7, 1fr)` }}>
            {HOURS.map(h => (
              weekDates.map((d, di) => {
                const today = isToday(d);
                const key = `${dateKey(d)}_${h}`;
                const cellTasks = tasksByDayHour[key] || [];
                return (
                  <div key={`${h}_${di}`} style={{ ...S.hourCell(today), height: 60, borderBottom: `1px solid ${D.border}` }}
                    onClick={() => onClickCell(d, h)}>
                    {cellTasks.map((t) => {
                      const [c, bg] = taskColor(t);
                      const heightPct = Math.min((t.duration_mins || 60) / 60, 4);
                      return (
                        <div key={t.id} style={{ ...S.taskBlock(c, bg, t.done), top: 2, height: `${Math.max(heightPct * 58, 22)}px` }}
                          onClick={e => { e.stopPropagation(); onToggle(t.id, t.done); }}>
                          <div style={S.taskBlockTitle}>{t.done ? "✓ " : ""}{t.title}</div>
                          {t.subject && <div style={S.taskBlockSub}>{t.subject}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────

function ListView({ weekDates, tasks, onToggle, onDelete, onAddDay }) {
  return (
    <div style={S.listWrap}>
      {weekDates.map((d, i) => {
        const dayTasks = tasks.filter(t => t.date_key === dateKey(d));
        const today = isToday(d);
        return (
          <div key={i} style={S.daySection}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ ...S.daySectionTitle, color: today ? D.accent : D.textSec }}>
                {today ? "Today — " : ""}{d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                {dayTasks.length > 0 && <span style={{ color: D.textMuted, marginLeft: 8, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{dayTasks.filter(t => t.done).length}/{dayTasks.length} done</span>}
              </div>
              <button style={{ ...S.btn("ghost"), padding: "4px 10px", fontSize: 12 }} onClick={() => onAddDay(d)}>+ Add</button>
            </div>
            {dayTasks.length === 0 ? (
              <div style={{ fontSize: 13, color: D.textMuted, padding: "10px 0" }}>No tasks — <span style={{ color: D.accent, cursor: "pointer" }} onClick={() => onAddDay(d)}>add one</span></div>
            ) : dayTasks.map(t => {
              const [c, bg] = taskColor(t);
              const prio = PRIORITY_META[t.priority];
              return (
                <div key={t.id} style={S.taskRow(t.done)}>
                  <div style={S.checkbox(t.done)} onClick={() => onToggle(t.id, t.done)}>
                    {t.done && <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={S.taskTitle(t.done)}>{t.title}</div>
                    <div style={S.taskMeta}>
                      {t.subject && <span style={S.badge(c, bg)}>{t.subject}</span>}
                      {t.task_type && <span style={S.badge(D.textSec, D.surface2)}>{t.task_type}</span>}
                      {prio && <span style={S.badge(prio.color, prio.bg)}>{prio.icon} {prio.label}</span>}
                      {t.start_hour != null && <span style={{ color: D.textMuted }}>⏰ {t.start_hour < 12 ? `${t.start_hour}am` : t.start_hour === 12 ? "12pm" : `${t.start_hour - 12}pm`}</span>}
                      {t.duration_mins && <span style={{ color: D.textMuted, marginLeft: 6 }}>· {t.duration_mins}m</span>}
                    </div>
                  </div>
                  <button style={S.deleteBtn} onClick={() => onDelete(t.id)}>✕</button>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── CARRYOVER MODAL ──────────────────────────────────────────────────────────

function CarryoverModal({ tasks, onDecide, onDismiss }) {
  const [sel, setSel] = useState(tasks.map(t => t.id));
  const toggle = id => setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  return (
    <div style={S.coModal}>
      <div style={S.coBox}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Incomplete tasks from yesterday</div>
        <div style={{ fontSize: 13, color: D.textSec, marginBottom: 16 }}>Move them to today?</div>
        {tasks.map(t => {
          const [c] = taskColor(t);
          const checked = sel.includes(t.id);
          return (
            <div key={t.id} onClick={() => toggle(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: checked ? D.accentBg : D.bg, borderRadius: 9, marginBottom: 8, cursor: "pointer", border: `1px solid ${checked ? D.accent : D.border}` }}>
              <div style={S.checkbox(checked)}>{checked && <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>✓</span>}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</div>
                {t.subject && <div style={{ fontSize: 11, color: D.textSec }}>{t.subject}{t.task_type ? ` · ${t.task_type}` : ""}</div>}
              </div>
              <span style={S.badge(c, taskColor(t)[1])}>{t.subject || t.task_type || "Task"}</span>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button style={S.btn("accent")} onClick={() => onDecide(sel)}>Move {sel.length} task{sel.length !== 1 ? "s" : ""}</button>
          <button style={S.btn("ghost")} onClick={onDismiss}>Skip</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN STUDY PLANNER PAGE ──────────────────────────────────────────────────

export default function StudyPlanner() {
  const windowWidth = useWindowWidth();
  const isDesktop = windowWidth >= 1200;
  const [mobileOpen, setMobileOpen] = useState(false);

  const [view, setView] = useState("calendar");
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [allCompletedTasks, setAllCompletedTasks] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [addModal, setAddModal] = useState(null); // { date, start_hour?, subject? }
  const [carryover, setCarryover] = useState([]);
  const [coChecked, setCoChecked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sub = params.get("subject") || location.state?.subject;
    if (sub) {
      setAddModal({ date: new Date(), subject: sub });
    }
  }, [location.search, location.state]);

  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const userId = user?.id;
  const weekDates = getWeekDates(weekOffset);

  // Load week tasks
  const loadWeekTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from("study_tasks").select("*")
      .eq("user_id", userId)
      .gte("date_key", dateKey(weekDates[0]))
      .lte("date_key", dateKey(weekDates[6]))
      .order("start_hour", { ascending: true, nullsFirst: false });
    setTasks(data || []);
    setLoading(false);
  }, [userId, weekOffset]);

  // Load all completed tasks for streak & heatmap
  const loadAllCompleted = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from("study_tasks").select("id, date_key, done, subject")
      .eq("user_id", userId)
      .eq("done", true);
    setAllCompletedTasks(data || []);
  }, [userId]);

  // Load todos from Supabase with localStorage resilience
  const loadTodos = useCallback(async () => {
    if (!userId) return;
    const localKey = `imupilot_todos_${userId}`;
    try {
      const { data, error } = await supabase
        .from("todo_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTodos(data);
        localStorage.setItem(localKey, JSON.stringify(data));
      } else {
        const cached = localStorage.getItem(localKey);
        if (cached) setTodos(JSON.parse(cached));
      }
    } catch {
      const cached = localStorage.getItem(localKey);
      if (cached) setTodos(JSON.parse(cached));
    }
  }, [userId]);

  useEffect(() => {
    loadWeekTasks();
  }, [loadWeekTasks]);

  useEffect(() => {
    loadAllCompleted();
    loadTodos();
  }, [loadAllCompleted, loadTodos]);

  // Carryover check
  useEffect(() => {
    if (!userId || coChecked) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    supabase.from("study_tasks").select("*").eq("user_id", userId).eq("date_key", dateKey(yesterday)).eq("done", false)
      .then(({ data }) => { if (data?.length) setCarryover(data); setCoChecked(true); });
  }, [userId]);

  // Add Task with Repeat & Priority Support
  async function addTask(data) {
    if (!userId) return;

    // Daily repeat generates tasks for the remaining days of the current week
    const tasksToInsert = [];
    if (data.repeat === "daily") {
      const startDate = new Date(data.date_key);
      const daysLeft = 7 - ((startDate.getDay() + 6) % 7);
      for (let i = 0; i < daysLeft; i++) {
        const nextD = new Date(startDate);
        nextD.setDate(startDate.getDate() + i);
        tasksToInsert.push({
          ...data,
          date_key: dateKey(nextD),
          user_id: userId
        });
      }
    } else {
      tasksToInsert.push({ ...data, user_id: userId });
    }

    try {
      let { data: rows, error } = await supabase.from("study_tasks").insert(tasksToInsert).select();
      if (error && error.message && error.message.includes("column")) {
        // Fallback without new columns if Supabase table is not yet migrated
        const safeTasks = tasksToInsert.map(({ priority, repeat, ...rest }) => rest);
        const res = await supabase.from("study_tasks").insert(safeTasks).select();
        rows = res.data;
      }

      if (rows && rows.length > 0) {
        setTasks(prev => [...prev, ...rows]);
      }
    } catch (err) {
      console.error("Error adding tasks:", err);
    }
    setAddModal(null);
  }

  async function toggleTask(id, done) {
    await supabase.from("study_tasks").update({ done: !done }).eq("id", id);
    setTasks(p => p.map(t => t.id === id ? { ...t, done: !done } : t));
    loadAllCompleted();
  }

  async function deleteTask(id) {
    await supabase.from("study_tasks").delete().eq("id", id);
    setTasks(p => p.filter(t => t.id !== id));
    loadAllCompleted();
  }

  async function handleCarryover(ids) {
    const toMove = carryover.filter(t => ids.includes(t.id));
    for (const t of toMove) {
      const { id, created_at, ...rest } = t;
      await supabase.from("study_tasks").insert([{ ...rest, date_key: todayKey(), done: false, user_id: userId }]);
    }
    setCarryover([]);
    loadWeekTasks();
  }

  // ─── Todo Handlers ──────────────────────────────────────────────────────────

  const addTodo = async (text, priority = "medium") => {
    if (!userId || !text.trim()) return;
    const tempId = `todo_${Date.now()}`;
    const newTodo = {
      id: tempId,
      user_id: userId,
      text: text.trim(),
      done: false,
      priority,
      created_at: new Date().toISOString()
    };

    // Optimistic update
    setTodos(prev => [newTodo, ...prev]);

    try {
      const { data, error } = await supabase
        .from("todo_items")
        .insert([{ text: text.trim(), priority, done: false, user_id: userId }])
        .select()
        .single();

      if (!error && data) {
        setTodos(prev => prev.map(t => t.id === tempId ? data : t));
      }
    } catch (e) {
      console.warn("Saved to local todos (run SQL in Supabase to sync):", e);
    }
  };

  const toggleTodo = async (id, done) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t));
    try {
      await supabase.from("todo_items").update({ done: !done }).eq("id", id);
    } catch (e) {
      console.warn("Updated locally:", e);
    }
  };

  const updateTodoText = async (id, text) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text } : t));
    try {
      await supabase.from("todo_items").update({ text }).eq("id", id);
    } catch (e) {
      console.warn("Updated locally:", e);
    }
  };

  const deleteTodo = async (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    try {
      await supabase.from("todo_items").delete().eq("id", id);
    } catch (e) {
      console.warn("Deleted locally:", e);
    }
  };

  // ─── Today Summary calculation ──────────────────────────────────────────────
  const todayTasks = tasks.filter(t => t.date_key === todayKey());
  const todayDone = todayTasks.filter(t => t.done).length;
  const todayTotalMins = todayTasks.reduce((acc, t) => acc + (t.duration_mins || 60), 0);
  const todayHours = Math.floor(todayTotalMins / 60);
  const todayRemainderMins = todayTotalMins % 60;
  const todayDurationFormatted = todayHours > 0
    ? (todayRemainderMins > 0 ? `${todayHours}h ${todayRemainderMins}m` : `${todayHours}h`)
    : `${todayRemainderMins}m`;

  const weekLabel = `${weekDates[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${weekDates[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

  // Tab list adapts based on desktop sidebar presence
  const tabs = isDesktop ? ["calendar", "list", "summary"] : ["calendar", "list", "summary", "todo"];

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {carryover.length > 0 && <CarryoverModal tasks={carryover} onDecide={handleCarryover} onDismiss={() => setCarryover([])} />}
      {addModal && (
        <AddModal
          date={addModal.date}
          initialSubject={addModal.subject}
          startHour={addModal.start_hour}
          onAdd={addTask}
          onClose={() => setAddModal(null)}
        />
      )}

      <IMUpilotSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div style={S.main}>
        {/* Mobile topbar */}
        <div style={{
          display: 'none', // hidden on desktop via CSS
          position: 'sticky', top: 0, zIndex: 30,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} className="mobile-topbar">
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>IMUpilot</span>
          <button onClick={() => setMobileOpen(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#0F172A', fontSize: 22
          }}>☰</button>
        </div>

        {/* TOPBAR */}
        <div style={S.topbar}>
          <div style={S.titleRow}>
            <div>
              <div style={S.title}>Study Planner</div>
              <div style={S.titleSub}>
                <span style={{ color: D.textSec, fontWeight: 500 }}>
                  {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span>•</span>
                {todayTasks.length === 0 ? (
                  <span
                    onClick={() => setAddModal({ date: new Date() })}
                    style={{ color: D.accent, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    Nothing planned today — add your first task →
                  </span>
                ) : (
                  <span style={S.todayHighlight}>
                    <CheckCircle2 size={13} />
                    Today: {todayTasks.length} {todayTasks.length === 1 ? "task" : "tasks"} · {todayDone} done · {todayDurationFormatted} planned
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                style={{ ...S.btn("accent"), padding: "8px 16px" }}
                onClick={() => setAddModal({ date: new Date() })}
              >
                <Plus size={15} /> Add task
              </button>

              <div style={S.tabGroup}>
                {tabs.map(v => (
                  <button key={v} style={S.tab(view === v)} onClick={() => setView(v)}>
                    {v === "calendar" && <CalendarIcon size={13} />}
                    {v === "list" && <ListIcon size={13} />}
                    {v === "summary" && <BarChart2 size={13} />}
                    {v === "todo" && <CheckCircle2 size={13} />}
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {view !== "summary" && view !== "todo" && (
            <div style={S.weekNav}>
              <button style={S.navBtn} onClick={() => setWeekOffset(w => w - 1)}>‹</button>
              <div style={S.weekLabel}>{weekLabel}</div>
              <button style={S.navBtn} onClick={() => setWeekOffset(w => w + 1)}>›</button>
              {weekOffset !== 0 && <button style={S.todayBtn} onClick={() => setWeekOffset(0)}>Today</button>}
            </div>
          )}
        </div>

        {/* CONTENT CONTAINER (SPLIT ON DESKTOP, FULL ON MOBILE) */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Main Area: Calendar / List / Summary / Mobile Todo */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
            {loading ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: D.textSec, fontSize: 14 }}>
                Loading planner...
              </div>
            ) : view === "calendar" ? (
              <div style={S.calWrap}>
                <CalendarView
                  weekDates={weekDates} tasks={tasks}
                  onToggle={toggleTask} onDelete={deleteTask}
                  onClickDay={d => setAddModal({ date: d })}
                  onClickCell={(d, h) => setAddModal({ date: d, start_hour: h })}
                />
              </div>
            ) : view === "list" ? (
              <ListView
                weekDates={weekDates} tasks={tasks}
                onToggle={toggleTask} onDelete={deleteTask}
                onAddDay={d => setAddModal({ date: d })}
              />
            ) : view === "summary" ? (
              <SummaryView tasks={tasks} allCompletedTasks={allCompletedTasks} />
            ) : (
              /* Mobile Todo Tab View */
              <TodoView
                todos={todos}
                onAdd={addTodo}
                onToggle={toggleTodo}
                onUpdateText={updateTodoText}
                onDelete={deleteTodo}
              />
            )}
          </div>

          {/* Desktop Persistent Right Sidebar Todo Panel (≥1200px) */}
          {isDesktop && (
            <aside style={{
              width: 350,
              flexShrink: 0,
              borderLeft: `1px solid ${D.border}`,
              background: D.surface,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              <TodoView
                todos={todos}
                onAdd={addTodo}
                onToggle={toggleTodo}
                onUpdateText={updateTodoText}
                onDelete={deleteTodo}
                isSidebar={true}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
