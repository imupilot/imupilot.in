import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
import IMUpilotSidebar from "../components/IMUpilotSidebar";

// ─── constants ────────────────────────────────────────────────────────────────

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "English", "General Aptitude"];
const TASK_TYPES = ["Study notes", "Practice questions", "Mock test", "Flashcards", "Revision", "Past paper"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm

const SUB_COLORS = {
  Mathematics:        ["#4d9fff", "rgba(77,159,255,0.15)"],
  Physics:            ["#c084fc", "rgba(192,132,252,0.15)"],
  Chemistry:          ["#4dff91", "rgba(77,255,145,0.15)"],
  English:            ["#ffd84d", "rgba(255,216,77,0.15)"],
  "General Aptitude": ["#f5831f", "rgba(245,131,31,0.15)"],
};
const TYPE_COLORS = {
  "Mock test":            ["#ff6b6b", "rgba(255,107,107,0.15)"],
  "Flashcards":           ["#ffd84d", "rgba(255,216,77,0.15)"],
  "Revision":             ["#c084fc", "rgba(192,132,252,0.15)"],
  "Practice questions":   ["#4dff91", "rgba(77,255,145,0.15)"],
  "Study notes":          ["#4d9fff", "rgba(77,159,255,0.15)"],
  "Past paper":           ["#f5831f", "rgba(245,131,31,0.15)"],
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

// ─── colours ──────────────────────────────────────────────────────────────────

const D = {
  bg: "var(--bg-primary)", surface: "var(--bg-elevated)", surface2: "var(--bg-secondary)",
  border: "var(--border-subtle)", accent: "var(--accent-primary)", accentBg: "var(--accent-primary-subtle)",
  text: "var(--text-primary)", textSec: "var(--text-secondary)", textMuted: "var(--text-tertiary)",
  green: "var(--accent-success)", greenBg: "var(--accent-success-subtle)",
};

const S = {
  page: { display: "flex", minHeight: "100vh", background: D.bg, fontFamily: "'DM Sans', system-ui, sans-serif", color: D.text },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: "100vh" },
  topbar: { padding: "20px 28px 0", flexShrink: 0 },
  titleRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px" },
  titleSub: { fontSize: 13, color: D.textSec, marginTop: 3 },
  tabGroup: { display: "flex", gap: 4, background: D.surface, border: `1px solid ${D.border}`, borderRadius: 10, padding: 4 },
  tab: (a) => ({ padding: "6px 16px", fontSize: 13, fontWeight: 600, borderRadius: 7, cursor: "pointer", border: "none", background: a ? D.accent : "transparent", color: a ? "#fff" : D.textSec, transition: "all 0.15s" }),
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
  dayHeader: (today) => ({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${D.border}`, fontSize: 11, fontWeight: 600, color: today ? D.accent : D.textSec, textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", gap: 2 }),
  dayDateNum: (today) => ({ fontSize: 16, fontWeight: 700, color: today ? D.accent : D.text, width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: today ? D.accentBg : "transparent" }),
  hoursGrid: { display: "grid", flex: 1 },
  hourRow: { display: "grid", height: 60, borderBottom: `1px solid ${D.border}` },
  hourCell: (today) => ({ borderRight: `1px solid ${D.border}`, position: "relative", background: today ? "rgba(245,131,31,0.02)" : "transparent" }),

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
  modalBox: { background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, padding: 24, width: 440, maxWidth: "92vw", maxHeight: "90vh", overflowY: "auto" },
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
  progBar: { height: 4, background: D.border, borderRadius: 2, overflow: "hidden", marginTop: 6 },
  progFill: (pct, c) => ({ height: "100%", width: `${pct}%`, background: c, borderRadius: 2 }),

  // carryover
  coModal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" },
  coBox: { background: D.surface, border: `1px solid ${D.border}`, borderRadius: 16, padding: 28, width: 400, maxWidth: "92vw" },
};

// ─── carryover modal ──────────────────────────────────────────────────────────

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

// ─── add task modal ───────────────────────────────────────────────────────────

function AddModal({ date, onAdd, onClose }) {
  const [mode, setMode] = useState("structured");
  const [form, setForm] = useState({ title: "", subject: "", task_type: "", notes: "", start_hour: "", duration_mins: "60" });
  const f = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  function submit() {
    const title = mode === "free" ? form.title : [form.task_type, form.subject, form.title].filter(Boolean).join(" — ");
    if (!title.trim()) return;
    onAdd({
      title, subject: form.subject || null, task_type: form.task_type || null,
      notes: form.notes || null,
      start_hour: form.start_hour ? parseInt(form.start_hour) : null,
      duration_mins: form.duration_mins ? parseInt(form.duration_mins) : 60,
      date_key: dateKey(date), done: false,
    });
  }

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={S.modalTitle}>Add task — {date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</div>
          <button style={{ ...S.btn("ghost"), padding: "4px 10px", fontSize: 12 }} onClick={onClose}>✕</button>
        </div>

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

        <label style={S.label}>{mode === "structured" ? "Extra detail (optional)" : "Task"}</label>
        <input style={S.input} placeholder={mode === "structured" ? "e.g. Chapter 3, page 45–60" : "e.g. Solve 20 Trigonometry problems"} {...f("title")} onKeyDown={e => e.key === "Enter" && submit()} />

        <div style={S.formRow}>
          <div>
            <label style={S.label}>Start time (optional)</label>
            <select style={S.select} {...f("start_hour")}>
              <option value="">No time set</option>
              {HOURS.map(h => <option key={h} value={h}>{h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Duration (mins)</label>
            <select style={S.select} {...f("duration_mins")}>
              {[30, 45, 60, 90, 120, 150, 180].map(m => <option key={m} value={m}>{m >= 60 ? `${m / 60}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`}</option>)}
            </select>
          </div>
        </div>

        <label style={S.label}>Notes (optional)</label>
        <input style={S.input} placeholder="Any notes..." {...f("notes")} />

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button style={S.btn("accent")} onClick={submit}>+ Add task</button>
          <button style={S.btn("ghost")} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── calendar view ────────────────────────────────────────────────────────────

function CalendarView({ weekDates, tasks, onToggle, onDelete, onClickDay, onClickCell }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    // scroll to 7am on mount
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
                    {cellTasks.map((t, ti) => {
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

// ─── list view ────────────────────────────────────────────────────────────────

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

// ─── summary view ─────────────────────────────────────────────────────────────

function SummaryView({ tasks }) {
  const total = tasks.length, done = tasks.filter(t => t.done).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  const bySubject = {};
  tasks.forEach(t => {
    const s = t.subject || "Other";
    if (!bySubject[s]) bySubject[s] = { total: 0, done: 0 };
    bySubject[s].total++;
    if (t.done) bySubject[s].done++;
  });
  return (
    <div style={S.summaryWrap}>
      <div style={S.metricGrid}>
        {[["Planned", total, D.accent], ["Completed", done, D.green], ["Rate", `${pct}%`, "#4d9fff"], ["Remaining", total - done, "#c084fc"]].map(([label, val, c]) => (
          <div key={label} style={S.metricCard(c)}>
            <div style={{ ...S.metricVal, color: c }}>{val}</div>
            <div style={S.metricLabel}>{label}</div>
          </div>
        ))}
      </div>
      {Object.keys(bySubject).length > 0 && (
        <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>By subject</div>
          {Object.entries(bySubject).map(([sub, d]) => {
            const [c] = SUB_COLORS[sub] || ["#8B949E"];
            const p = Math.round(d.done / d.total * 100);
            return (
              <div key={sub} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 500 }}>{sub}</span>
                  <span style={{ color: D.textSec }}>{d.done}/{d.total} ({p}%)</span>
                </div>
                <div style={S.progBar}><div style={S.progFill(p, c)} /></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function StudyPlanner() {
  const [view, setView] = useState("calendar");
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(null); // { date, start_hour? }
  const [carryover, setCarryover] = useState([]);
  const [coChecked, setCoChecked] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } })();
  const userId = user?.id;
  const weekDates = getWeekDates(weekOffset);

  const load = useCallback(async () => {
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

  useEffect(() => { load(); }, [load]);

  // carryover check
  useEffect(() => {
    if (!userId || coChecked) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    supabase.from("study_tasks").select("*").eq("user_id", userId).eq("date_key", dateKey(yesterday)).eq("done", false)
      .then(({ data }) => { if (data?.length) setCarryover(data); setCoChecked(true); });
  }, [userId]);

  async function addTask(data) {
    if (!userId) return;
    const { data: row } = await supabase.from("study_tasks").insert([{ ...data, user_id: userId }]).select();
    if (row?.[0]) setTasks(p => [...p, row[0]]);
    setAddModal(null);
  }

  async function toggleTask(id, done) {
    await supabase.from("study_tasks").update({ done: !done }).eq("id", id);
    setTasks(p => p.map(t => t.id === id ? { ...t, done: !done } : t));
  }

  async function deleteTask(id) {
    await supabase.from("study_tasks").delete().eq("id", id);
    setTasks(p => p.filter(t => t.id !== id));
  }

  async function handleCarryover(ids) {
    const toMove = carryover.filter(t => ids.includes(t.id));
    for (const t of toMove) {
      const { id, created_at, ...rest } = t;
      await supabase.from("study_tasks").insert([{ ...rest, date_key: todayKey(), done: false, user_id: userId }]);
    }
    setCarryover([]);
    load();
  }

  const weekLabel = `${weekDates[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${weekDates[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div style={S.page}>
      {carryover.length > 0 && <CarryoverModal tasks={carryover} onDecide={handleCarryover} onDismiss={() => setCarryover([])} />}
      {addModal && <AddModal date={addModal.date} onAdd={addTask} onClose={() => setAddModal(null)} />}

      <IMUpilotSidebar />

      <div style={S.main}>
        <div style={S.topbar}>
          <div style={S.titleRow}>
            <div>
              <div style={S.title}>Study Planner</div>
              <div style={S.titleSub}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button style={{ ...S.btn("accent"), padding: "8px 16px" }} onClick={() => setAddModal({ date: new Date() })}>+ Add task</button>
              <div style={S.tabGroup}>
                {["calendar", "list", "summary"].map(v => (
                  <button key={v} style={S.tab(view === v)} onClick={() => setView(v)}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={S.weekNav}>
            <button style={S.navBtn} onClick={() => setWeekOffset(w => w - 1)}>‹</button>
            <div style={S.weekLabel}>{weekLabel}</div>
            <button style={S.navBtn} onClick={() => setWeekOffset(w => w + 1)}>›</button>
            {weekOffset !== 0 && <button style={S.todayBtn} onClick={() => setWeekOffset(0)}>Today</button>}
          </div>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: D.textSec, fontSize: 14 }}>Loading...</div>
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
          <ListView weekDates={weekDates} tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onAddDay={d => setAddModal({ date: d })} />
        ) : (
          <SummaryView tasks={tasks} />
        )}
      </div>
    </div>
  );
}
