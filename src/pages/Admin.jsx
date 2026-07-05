import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient"; // your existing supabase client

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "imupilot_admin_2026";

// ─── helpers ────────────────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines
    .slice(1)
    .map((line) => {
      const vals = [];
      let cur = "", inQ = false;
      for (const ch of line) {
        if (ch === '"') inQ = !inQ;
        else if (ch === "," && !inQ) { vals.push(cur); cur = ""; }
        else cur += ch;
      }
      vals.push(cur);
      const obj = {};
      headers.forEach((h, i) => (obj[h] = (vals[i] || "").trim().replace(/^"|"$/g, "")));
      return obj;
    })
    .filter((r) => Object.values(r).some((v) => v));
}

function Toast({ msg }) {
  return msg ? (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 8, padding: "10px 18px", fontSize: 13,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 9999,
    }}>{msg}</div>
  ) : null;
}

// ─── styles (inline so zero CSS file needed) ─────────────────────────────────

const S = {
  wrap: { display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif", background: "#f9fafb" },
  sidebar: { width: 220, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 },
  logo: { padding: "0 20px 20px", borderBottom: "1px solid #e5e7eb", marginBottom: 8 },
  logoTitle: { fontSize: 15, fontWeight: 600, color: "#111" },
  logoSub: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "9px 20px",
    fontSize: 13, color: active ? "#2563eb" : "#6b7280",
    background: active ? "#eff6ff" : "transparent",
    borderLeft: active ? "2px solid #2563eb" : "2px solid transparent",
    fontWeight: active ? 500 : 400, cursor: "pointer", transition: "all 0.12s",
  }),
  main: { flex: 1, padding: 32, overflowY: "auto" },
  pageTitle: { fontSize: 20, fontWeight: 600, color: "#111", marginBottom: 4 },
  pageSub: { fontSize: 13, color: "#9ca3af", marginBottom: 24 },
  cardsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 },
  metricCard: { background: "#f3f4f6", borderRadius: 8, padding: 16 },
  metricLabel: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  metricVal: { fontSize: 24, fontWeight: 600, color: "#111" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px", marginBottom: 16 },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  cardTitle: { fontSize: 14, fontWeight: 500, color: "#111" },
  btn: (variant = "default") => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", fontSize: 13, borderRadius: 8, cursor: "pointer",
    border: variant === "primary" ? "none" : variant === "danger" ? "none" : "1px solid #d1d5db",
    background: variant === "primary" ? "#2563eb" : variant === "danger" ? "#fee2e2" : "#fff",
    color: variant === "primary" ? "#fff" : variant === "danger" ? "#dc2626" : "#374151",
    fontWeight: variant === "primary" ? 500 : 400,
  }),
  btnSm: { padding: "4px 10px", fontSize: 12 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f3f4f6", color: "#111", verticalAlign: "middle" },
  badge: (color) => {
    const map = { blue: ["#dbeafe", "#1d4ed8"], green: ["#dcfce7", "#15803d"], yellow: ["#fef9c3", "#a16207"], red: ["#fee2e2", "#dc2626"], gray: ["#f3f4f6", "#6b7280"] };
    const [bg, fg] = map[color] || map.gray;
    return { display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg, color: fg };
  },
  input: { width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", color: "#111", marginBottom: 10, boxSizing: "border-box" },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 4, display: "block" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  tabRow: { display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid #e5e7eb" },
  tab: (active) => ({ padding: "8px 16px", fontSize: 13, cursor: "pointer", color: active ? "#2563eb" : "#6b7280", borderBottom: active ? "2px solid #2563eb" : "2px solid transparent", marginBottom: -1, fontWeight: active ? 500 : 400 }),
  uploadZone: { border: "1.5px dashed #d1d5db", borderRadius: 8, padding: 32, textAlign: "center", cursor: "pointer", color: "#9ca3af", fontSize: 13 },
  empty: { textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 13 },
  loginWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" },
  loginCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 32, width: 340 },
  progressBar: { height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden", marginTop: 6 },
  progressFill: (pct) => ({ height: "100%", width: pct + "%", background: "#2563eb", borderRadius: 3 }),
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "#1d4ed8", flexShrink: 0 },
};

// ─── sub-pages ───────────────────────────────────────────────────────────────

function Dashboard({ questions, flashcards, users }) {
  const checklist = [
    ["Enable RLS on all tables", "critical"],
    ["Password protect /admin route properly", "critical"],
    ["Rotate Supabase anon key (it was in handoff doc)", "critical"],
    ["Change all localhost:3001 URLs to Railway URL", "pending"],
    ["Upload question bank (0 questions currently)", "pending"],
    ["Add answers to Anglo Eastern flashcards", "pending"],
    ["Upload Maersk, MSC, SCI, SIMS, GE, FM CSVs", "pending"],
    ["Test auth + mock test submit flow end-to-end", "pending"],
  ];
  return (
    <div>
      <div style={S.pageTitle}>Dashboard</div>
      <div style={S.pageSub}>Platform overview</div>
      <div style={S.cardsRow}>
        <div style={S.metricCard}><div style={S.metricLabel}>Questions</div><div style={S.metricVal}>{questions.length}</div>{questions.length === 0 && <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>⚠ Upload needed</div>}</div>
        <div style={S.metricCard}><div style={S.metricLabel}>Flashcards</div><div style={S.metricVal}>{flashcards.length}</div></div>
        <div style={S.metricCard}><div style={S.metricLabel}>Users</div><div style={S.metricVal}>{users.length}</div></div>
        <div style={S.metricCard}><div style={S.metricLabel}>DB</div><div style={{ ...S.metricVal, fontSize: 14, paddingTop: 4 }}>🟢 Live</div></div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>Launch checklist</div>
        <div style={{ marginTop: 12 }}>
          {checklist.map(([item, sev]) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
              <span style={{ color: sev === "critical" ? "#dc2626" : "#f59e0b" }}>{sev === "critical" ? "●" : "○"}</span>
              <span>{item}</span>
              <span style={{ ...S.badge(sev === "critical" ? "red" : "yellow"), marginLeft: "auto" }}>{sev === "critical" ? "Critical" : "Pending"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const EMPTY_Q = { subject: "", chapter: "", topic_tag: "", difficulty: "medium", question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", concept: "", solution_steps: "", exam_tip: "", year: "" };

function EditDrawer({ question, onClose, onSave }) {
  const [form, setForm] = useState({ ...EMPTY_Q, ...question });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.question_text || !form.subject) return alert("Subject and question text are required");
    setSaving(true);
    const { id, created_at, ...fields } = form;
    const { data, error } = await supabase.from("questions").update(fields).eq("id", question.id).select();
    setSaving(false);
    if (error) return alert("Save failed: " + error.message);
    onSave(data[0]);
  }

  const f = (key) => ({ value: form[key] || "", onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div style={{ width: 560, background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Edit question</div>
          <button style={{ ...S.btn(), padding: "4px 10px", fontSize: 12 }} onClick={onClose}>✕ Close</button>
        </div>
        <div style={{ padding: 24, flex: 1 }}>
          <div style={S.formRow}>
            <div><label style={S.label}>Subject</label><input style={S.input} placeholder="Mathematics" {...f("subject")} /></div>
            <div><label style={S.label}>Chapter</label><input style={S.input} placeholder="Trigonometry" {...f("chapter")} /></div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Topic tag</label><input style={S.input} {...f("topic_tag")} /></div>
            <div><label style={S.label}>Difficulty</label>
              <select style={S.input} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <label style={S.label}>Question text (use $...$ for LaTeX)</label>
          <textarea style={{ ...S.input, height: 80 }} {...f("question_text")} />
          <div style={S.formRow}>
            <div><label style={S.label}>Option A</label><input style={S.input} {...f("option_a")} /></div>
            <div><label style={S.label}>Option B</label><input style={S.input} {...f("option_b")} /></div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Option C</label><input style={S.input} {...f("option_c")} /></div>
            <div><label style={S.label}>Option D</label><input style={S.input} {...f("option_d")} /></div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Correct option</label>
              <select style={S.input} value={form.correct_option} onChange={(e) => setForm({ ...form, correct_option: e.target.value })}>
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </select>
            </div>
            <div><label style={S.label}>Year</label><input style={S.input} placeholder="2024" {...f("year")} /></div>
          </div>
          <label style={S.label}>Concept / explanation</label>
          <textarea style={{ ...S.input, height: 70 }} {...f("concept")} />
          <label style={S.label}>Solution steps</label>
          <textarea style={{ ...S.input, height: 70 }} {...f("solution_steps")} />
          <label style={S.label}>Exam tip</label>
          <textarea style={{ ...S.input, height: 50 }} {...f("exam_tip")} />
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, position: "sticky", bottom: 0, background: "#fff" }}>
          <button style={S.btn("primary")} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          <button style={S.btn()} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Questions({ toast }) {
  const [questions, setQuestions] = useState([]);
  const [tab, setTab] = useState("view");
  const [subFilter, setSubFilter] = useState("");
  const [chapFilter, setChapFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [csvName, setCsvName] = useState("");
  const [editingQ, setEditingQ] = useState(null);
  const [form, setForm] = useState(EMPTY_Q);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("questions").select("id,subject,chapter,topic_tag,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,concept,solution_steps,exam_tip,year").order("created_at", { ascending: false }).limit(500);
    setQuestions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const subjects = [...new Set(questions.map((q) => q.subject))].filter(Boolean);
  const filtered = questions.filter((q) => {
    if (subFilter && q.subject !== subFilter) return false;
    if (chapFilter && !q.chapter?.toLowerCase().includes(chapFilter.toLowerCase())) return false;
    return true;
  });

  async function deleteQ(id) {
    if (!confirm("Delete this question?")) return;
    await supabase.from("questions").delete().eq("id", id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast("Question deleted");
  }

  function handleSaved(updated) {
    setQuestions((prev) => prev.map((q) => q.id === updated.id ? updated : q));
    setEditingQ(null);
    toast("Question saved!");
  }

  async function addQ() {
    if (!form.question_text || !form.subject) return alert("Subject and question text are required");
    const { data } = await supabase.from("questions").insert([form]).select();
    if (data?.[0]) setQuestions((prev) => [data[0], ...prev]);
    toast("Question added!");
    setForm(EMPTY_Q);
  }

  function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => { setCsvData(parseCSV(ev.target.result)); setCsvName(file.name); };
    r.readAsText(file);
  }

  async function uploadCSV() {
    if (!csvData?.length) return;
    setLoading(true);
    const chunks = [];
    for (let i = 0; i < csvData.length; i += 50) chunks.push(csvData.slice(i, i + 50));
    for (const chunk of chunks) await supabase.from("questions").upsert(chunk);
    toast(`${csvData.length} questions uploaded!`);
    setCsvData(null); setCsvName("");
    load();
  }

  return (
    <div>
      {editingQ && <EditDrawer question={editingQ} onClose={() => setEditingQ(null)} onSave={handleSaved} />}
      <div style={S.pageTitle}>Questions</div>
      <div style={S.pageSub}>{questions.length} questions in database</div>
      <div style={S.tabRow}>
        {["view", "add", "upload"].map((t) => <div key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t === "view" ? "View & manage" : t === "add" ? "Add single" : "CSV upload"}</div>)}
      </div>

      {tab === "view" && (
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={{ display: "flex", gap: 8, flex: 1 }}>
              <select style={{ ...S.input, width: 160, marginBottom: 0 }} value={subFilter} onChange={(e) => setSubFilter(e.target.value)}>
                <option value="">All subjects</option>
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input style={{ ...S.input, flex: 1, marginBottom: 0 }} placeholder="Filter by chapter..." value={chapFilter} onChange={(e) => setChapFilter(e.target.value)} />
            </div>
            <button style={{ ...S.btn("primary"), ...S.btnSm, marginLeft: 8 }} onClick={load}>↺ Refresh</button>
          </div>
          {loading ? <div style={S.empty}>Loading...</div> : filtered.length === 0 ? (
            <div style={S.empty}>{questions.length === 0 ? "No questions in database. Upload a CSV to get started." : "No questions match filter."}</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead><tr><th style={S.th}>Subject</th><th style={S.th}>Chapter</th><th style={S.th}>Difficulty</th><th style={S.th}>Question</th><th style={S.th}>Answer</th><th style={S.th}>Actions</th></tr></thead>
                <tbody>
                  {filtered.slice(0, 50).map((q) => (
                    <tr key={q.id}>
                      <td style={S.td}><span style={S.badge("blue")}>{q.subject || "—"}</span></td>
                      <td style={{ ...S.td, color: "#6b7280" }}>{q.chapter || "—"}</td>
                      <td style={S.td}><span style={S.badge(q.difficulty === "hard" ? "red" : q.difficulty === "medium" ? "yellow" : "green")}>{q.difficulty || "—"}</span></td>
                      <td style={{ ...S.td, maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.question_text || "—"}</td>
                      <td style={S.td}><span style={S.badge("gray")}>{q.correct_option || "—"}</span></td>
                      <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                        <button style={{ ...S.btn(), ...S.btnSm, marginRight: 6 }} onClick={() => setEditingQ(q)}>✏ Edit</button>
                        <button style={{ ...S.btn("danger"), ...S.btnSm }} onClick={() => deleteQ(q.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 50 && <div style={{ textAlign: "center", padding: 12, fontSize: 12, color: "#9ca3af" }}>Showing 50 of {filtered.length}</div>}
            </div>
          )}
        </div>
      )}

      {tab === "add" && (
        <div style={S.card}>
          <div style={{ ...S.cardTitle, marginBottom: 16 }}>Add question</div>
          <div style={S.formRow}>
            <div><label style={S.label}>Subject</label><input style={S.input} placeholder="Mathematics" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div><label style={S.label}>Chapter</label><input style={S.input} placeholder="Trigonometry" value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} /></div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Topic tag</label><input style={S.input} value={form.topic_tag} onChange={(e) => setForm({ ...form, topic_tag: e.target.value })} /></div>
            <div><label style={S.label}>Difficulty</label>
              <select style={S.input} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <label style={S.label}>Question text (use $...$ for LaTeX math)</label>
          <textarea style={{ ...S.input, height: 72 }} placeholder="Find the value of $x^2 + y^2$ when..." value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} />
          <div style={S.formRow}>
            <div><label style={S.label}>Option A</label><input style={S.input} value={form.option_a} onChange={(e) => setForm({ ...form, option_a: e.target.value })} /></div>
            <div><label style={S.label}>Option B</label><input style={S.input} value={form.option_b} onChange={(e) => setForm({ ...form, option_b: e.target.value })} /></div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Option C</label><input style={S.input} value={form.option_c} onChange={(e) => setForm({ ...form, option_c: e.target.value })} /></div>
            <div><label style={S.label}>Option D</label><input style={S.input} value={form.option_d} onChange={(e) => setForm({ ...form, option_d: e.target.value })} /></div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Correct option</label>
              <select style={S.input} value={form.correct_option} onChange={(e) => setForm({ ...form, correct_option: e.target.value })}>
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </select>
            </div>
            <div><label style={S.label}>Year (optional)</label><input style={S.input} placeholder="2024" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
          </div>
          <label style={S.label}>Concept / explanation</label>
          <textarea style={{ ...S.input, height: 60 }} value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} />
          <label style={S.label}>Solution steps</label>
          <textarea style={{ ...S.input, height: 60 }} value={form.solution_steps} onChange={(e) => setForm({ ...form, solution_steps: e.target.value })} />
          <label style={S.label}>Exam tip</label>
          <textarea style={{ ...S.input, height: 50 }} value={form.exam_tip} onChange={(e) => setForm({ ...form, exam_tip: e.target.value })} />
          <button style={S.btn("primary")} onClick={addQ}>+ Add question</button>
        </div>
      )}

      {tab === "upload" && (
        <div style={S.card}>
          <div style={{ ...S.cardTitle, marginBottom: 12 }}>Upload question CSV</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
            Required columns: <code>subject, chapter, topic_tag, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, concept, solution_steps, exam_tip, source, year</code><br />
            <strong>Always use Google Sheets → Download as CSV.</strong> Excel breaks µ × ² symbols.
          </div>
          <label style={S.uploadZone}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>↑</div>
            {csvName ? `${csvData?.length} rows from "${csvName}"` : "Click to select CSV file"}
            <input type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSV} />
          </label>
          {csvData && (
            <button style={{ ...S.btn("primary"), marginTop: 12 }} onClick={uploadCSV} disabled={loading}>
              {loading ? "Uploading..." : `Upload ${csvData.length} questions to Supabase`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const EMPTY_F = { company: "", section: "DNS", category: "", type: "interview", question: "", answer: "", chapter: "" };

function FlashcardEditDrawer({ flashcard, onClose, onSave }) {
  const [form, setForm] = useState({ ...EMPTY_F, ...flashcard });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.question || !form.company) return alert("Company and question are required");
    setSaving(true);
    const { id, created_at, ...fields } = form;
    const { data, error } = await supabase.from("flashcards").update(fields).eq("id", flashcard.id).select();
    setSaving(false);
    if (error) return alert("Save failed: " + error.message);
    onSave(data[0]);
  }

  const f = (key) => ({ value: form[key] || "", onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div style={{ width: 560, background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Edit flashcard</div>
          <button style={{ ...S.btn(), padding: "4px 10px", fontSize: 12 }} onClick={onClose}>✕ Close</button>
        </div>
        <div style={{ padding: 24, flex: 1 }}>
          <div style={S.formRow}>
            <div><label style={S.label}>Company</label><input style={S.input} placeholder="Anglo Eastern" {...f("company")} /></div>
            <div><label style={S.label}>Section</label>
              <select style={S.input} value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                <option value="DNS">DNS</option><option value="IMUCET">IMUCET</option>
              </select>
            </div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Category</label><input style={S.input} placeholder="Personal/HR" {...f("category")} /></div>
            <div><label style={S.label}>Chapter (optional)</label><input style={S.input} {...f("chapter")} /></div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Type</label><input style={S.input} {...f("type")} /></div>
          </div>
          <label style={S.label}>Question</label>
          <textarea style={{ ...S.input, height: 80 }} {...f("question")} />
          <label style={S.label}>Answer (model answer)</label>
          <textarea style={{ ...S.input, height: 120 }} {...f("answer")} />
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, position: "sticky", bottom: 0, background: "#fff" }}>
          <button style={S.btn("primary")} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          <button style={S.btn()} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Flashcards({ toast }) {
  const [flashcards, setFlashcards] = useState([]);
  const [tab, setTab] = useState("view");
  const [compFilter, setCompFilter] = useState("");
  const [secFilter, setSecFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [csvName, setCsvName] = useState("");
  const [editingF, setEditingF] = useState(null);
  const [form, setForm] = useState(EMPTY_F);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("flashcards").select("id,company,section,category,question,answer,type,chapter").order("created_at", { ascending: false }).limit(1000);
    setFlashcards(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const companies = [...new Set(flashcards.map((f) => f.company))].filter(Boolean);
  const sections = [...new Set(flashcards.map((f) => f.section))].filter(Boolean);
  const filtered = flashcards.filter((f) => {
    if (compFilter && f.company !== compFilter) return false;
    if (secFilter && f.section !== secFilter) return false;
    return true;
  });

  async function deleteF(id) {
    if (!confirm("Delete this flashcard?")) return;
    await supabase.from("flashcards").delete().eq("id", id);
    setFlashcards((prev) => prev.filter((f) => f.id !== id));
    toast("Flashcard deleted");
  }

  function handleSaved(updated) {
    setFlashcards((prev) => prev.map((f) => f.id === updated.id ? updated : f));
    setEditingF(null);
    toast("Flashcard saved!");
  }

  async function addF() {
    if (!form.question || !form.company) return alert("Company and question are required");
    const { data } = await supabase.from("flashcards").insert([form]).select();
    if (data?.[0]) setFlashcards((prev) => [data[0], ...prev]);
    toast("Flashcard added!");
    setForm(EMPTY_F);
  }

  function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => { setCsvData(parseCSV(ev.target.result)); setCsvName(file.name); };
    r.readAsText(file);
  }

  async function uploadCSV() {
    if (!csvData?.length) return;
    setLoading(true);
    const chunks = [];
    for (let i = 0; i < csvData.length; i += 50) chunks.push(csvData.slice(i, i + 50));
    for (const chunk of chunks) await supabase.from("flashcards").upsert(chunk);
    toast(`${csvData.length} flashcards uploaded!`);
    setCsvData(null); setCsvName("");
    load();
  }

  return (
    <div>
      {editingF && <FlashcardEditDrawer flashcard={editingF} onClose={() => setEditingF(null)} onSave={handleSaved} />}
      <div style={S.pageTitle}>Flashcards</div>
      <div style={S.pageSub}>{flashcards.length} flashcards in database</div>
      <div style={S.tabRow}>
        {["view", "add", "upload"].map((t) => <div key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t === "view" ? "View & manage" : t === "add" ? "Add single" : "CSV upload"}</div>)}
      </div>

      {tab === "view" && (
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={{ display: "flex", gap: 8, flex: 1 }}>
              <select style={{ ...S.input, width: 160, marginBottom: 0 }} value={compFilter} onChange={(e) => setCompFilter(e.target.value)}>
                <option value="">All companies</option>
                {companies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select style={{ ...S.input, width: 130, marginBottom: 0 }} value={secFilter} onChange={(e) => setSecFilter(e.target.value)}>
                <option value="">All sections</option>
                {sections.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button style={{ ...S.btn("primary"), ...S.btnSm, marginLeft: 8 }} onClick={load}>↺ Refresh</button>
          </div>
          {loading ? <div style={S.empty}>Loading...</div> : filtered.length === 0 ? (
            <div style={S.empty}>No flashcards match filter.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead><tr><th style={S.th}>Company</th><th style={S.th}>Section</th><th style={S.th}>Category</th><th style={S.th}>Question</th><th style={S.th}>Has answer</th><th style={S.th}>Actions</th></tr></thead>
                <tbody>
                  {filtered.slice(0, 50).map((f) => (
                    <tr key={f.id}>
                      <td style={S.td}><span style={S.badge("blue")}>{f.company || "—"}</span></td>
                      <td style={S.td}>{f.section || "—"}</td>
                      <td style={{ ...S.td, color: "#6b7280" }}>{f.category || "—"}</td>
                      <td style={{ ...S.td, maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.question || "—"}</td>
                      <td style={S.td}><span style={S.badge(f.answer ? "green" : "yellow")}>{f.answer ? "Yes" : "Missing"}</span></td>
                      <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                        <button style={{ ...S.btn(), ...S.btnSm, marginRight: 6 }} onClick={() => setEditingF(f)}>✏ Edit</button>
                        <button style={{ ...S.btn("danger"), ...S.btnSm }} onClick={() => deleteF(f.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 50 && <div style={{ textAlign: "center", padding: 12, fontSize: 12, color: "#9ca3af" }}>Showing 50 of {filtered.length}</div>}
            </div>
          )}
        </div>
      )}

      {tab === "add" && (
        <div style={S.card}>
          <div style={{ ...S.cardTitle, marginBottom: 16 }}>Add flashcard</div>
          <div style={S.formRow}>
            <div><label style={S.label}>Company</label><input style={S.input} placeholder="Anglo Eastern" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
            <div><label style={S.label}>Section</label>
              <select style={S.input} value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                <option value="DNS">DNS</option><option value="IMUCET">IMUCET</option>
              </select>
            </div>
          </div>
          <div style={S.formRow}>
            <div><label style={S.label}>Category</label><input style={S.input} placeholder="Personal/HR" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><label style={S.label}>Chapter (optional)</label><input style={S.input} value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} /></div>
          </div>
          <label style={S.label}>Question</label>
          <textarea style={{ ...S.input, height: 60 }} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          <label style={S.label}>Answer (model answer)</label>
          <textarea style={{ ...S.input, height: 80 }} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          <button style={S.btn("primary")} onClick={addF}>+ Add flashcard</button>
        </div>
      )}

      {tab === "upload" && (
        <div style={S.card}>
          <div style={{ ...S.cardTitle, marginBottom: 12 }}>Upload flashcard CSV</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
            Required columns: <code>company, category, question, answer, type, section, chapter</code>
          </div>
          <label style={S.uploadZone}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>↑</div>
            {csvName ? `${csvData?.length} rows from "${csvName}"` : "Click to select CSV file"}
            <input type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSV} />
          </label>
          {csvData && (
            <button style={{ ...S.btn("primary"), marginTop: 12 }} onClick={uploadCSV} disabled={loading}>
              {loading ? "Uploading..." : `Upload ${csvData.length} flashcards to Supabase`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Users({ toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("id,full_name,email,phone,plan,created_at").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function changePlan(userId, plan) {
    await supabase.from("profiles").update({ plan }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, plan } : u));
    toast("Plan updated to " + plan);
  }

  return (
    <div>
      <div style={S.pageTitle}>Users</div>
      <div style={S.pageSub}>{users.length} registered users</div>
      <div style={S.card}>
        <div style={S.cardHeader}>
          <div style={S.cardTitle}>All users</div>
          <button style={{ ...S.btn("primary"), ...S.btnSm }} onClick={load}>↺ Refresh</button>
        </div>
        {loading ? <div style={S.empty}>Loading...</div> : users.length === 0 ? (
          <div style={S.empty}>No users yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={S.table}>
              <thead><tr><th style={S.th}>Name</th><th style={S.th}>Email</th><th style={S.th}>Phone</th><th style={S.th}>Plan</th><th style={S.th}>Joined</th><th style={S.th}>Change plan</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={S.avatar}>{(u.full_name || "?")[0].toUpperCase()}</div>
                        {u.full_name || "—"}
                      </div>
                    </td>
                    <td style={{ ...S.td, color: "#6b7280" }}>{u.email || "—"}</td>
                    <td style={{ ...S.td, color: "#6b7280" }}>{u.phone || "—"}</td>
                    <td style={S.td}><span style={S.badge(u.plan === "pro" ? "green" : u.plan === "pro_max" ? "blue" : "gray")}>{u.plan || "free"}</span></td>
                    <td style={{ ...S.td, color: "#6b7280" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN") : "—"}</td>
                    <td style={S.td}>
                      <select style={{ ...S.input, width: 100, marginBottom: 0, padding: "4px 8px", fontSize: 12 }} value={u.plan || "free"} onChange={(e) => changePlan(u.id, e.target.value)}>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="pro_max">Pro Max</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Analytics() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("question_responses").select("user_id,subject,is_correct,created_at").order("created_at", { ascending: false }).limit(500);
    setAttempts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const bySubject = {};
  attempts.forEach((a) => {
    if (a.subject) {
      if (!bySubject[a.subject]) bySubject[a.subject] = { total: 0, correct: 0 };
      bySubject[a.subject].total++;
      if (a.is_correct) bySubject[a.subject].correct++;
    }
  });

  return (
    <div>
      <div style={S.pageTitle}>Analytics</div>
      <div style={S.pageSub}>Test attempts and student performance</div>
      <div style={S.cardsRow}>
        <div style={S.metricCard}><div style={S.metricLabel}>Total responses</div><div style={S.metricVal}>{attempts.length}</div></div>
        <div style={S.metricCard}><div style={S.metricLabel}>Unique students</div><div style={S.metricVal}>{new Set(attempts.map((a) => a.user_id)).size}</div></div>
      </div>
      <div style={S.card}>
        <div style={S.cardHeader}>
          <div style={S.cardTitle}>Subject accuracy</div>
          <button style={{ ...S.btn("primary"), ...S.btnSm }} onClick={load}>↺ Refresh</button>
        </div>
        {loading ? <div style={S.empty}>Loading...</div> : Object.keys(bySubject).length === 0 ? (
          <div style={S.empty}>No test data yet. Appears once students attempt tests.</div>
        ) : (
          Object.entries(bySubject).map(([sub, d]) => {
            const pct = Math.round((d.correct / d.total) * 100);
            return (
              <div key={sub} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{sub}</span>
                  <span style={{ color: "#9ca3af" }}>{d.correct}/{d.total} correct ({pct}%)</span>
                </div>
                <div style={S.progressBar}><div style={S.progressFill(pct)} /></div>
              </div>
            );
          })
        )}
      </div>
      {attempts.length > 0 && (
        <div style={S.card}>
          <div style={{ ...S.cardTitle, marginBottom: 12 }}>Recent attempts</div>
          <table style={S.table}>
            <thead><tr><th style={S.th}>User ID</th><th style={S.th}>Subject</th><th style={S.th}>Result</th><th style={S.th}>Date</th></tr></thead>
            <tbody>
              {attempts.slice(0, 30).map((a, i) => (
                <tr key={i}>
                  <td style={{ ...S.td, color: "#9ca3af", fontSize: 12 }}>{a.user_id?.slice(0, 8)}…</td>
                  <td style={S.td}>{a.subject || "—"}</td>
                  <td style={S.td}><span style={S.badge(a.is_correct ? "green" : "red")}>{a.is_correct ? "Correct" : "Wrong"}</span></td>
                  <td style={{ ...S.td, color: "#9ca3af" }}>{a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState("dashboard");
  const [toastMsg, setToastMsg] = useState("");
  const [questions, setQuestions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [users, setUsers] = useState([]);

  function toast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  }

  function login() {
    if (password === ADMIN_PASSWORD) { setAuthed(true); }
    else setError("Incorrect password");
  }

  useEffect(() => {
    if (!authed) return;
    supabase.from("questions").select("id,subject,chapter,difficulty,question_text,correct_option").order("created_at", { ascending: false }).limit(500).then(({ data }) => setQuestions(data || []));
    supabase.from("flashcards").select("id,company,section,category,question,answer").order("created_at", { ascending: false }).limit(1000).then(({ data }) => setFlashcards(data || []));
    supabase.from("profiles").select("id,full_name,email,phone,plan,created_at").order("created_at", { ascending: false }).then(({ data }) => setUsers(data || []));
  }, [authed]);

  if (!authed) {
    return (
      <div style={S.loginWrap}>
        <div style={S.loginCard}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>IMUpilot Admin</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>Enter admin password to continue</div>
          <label style={S.label}>Password</label>
          <input type="password" style={S.input} placeholder="Admin password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()} />
          {error && <div style={{ color: "#dc2626", fontSize: 12, marginTop: -6, marginBottom: 8 }}>{error}</div>}
          <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center" }} onClick={login}>Sign in</button>
        </div>
      </div>
    );
  }

  const nav = [
    { id: "dashboard", label: "Dashboard" },
    { id: "questions", label: "Questions" },
    { id: "flashcards", label: "Flashcards" },
    { id: "users", label: "Users" },
    { id: "analytics", label: "Analytics" },
  ];

  const pages = {
    dashboard: <Dashboard questions={questions} flashcards={flashcards} users={users} />,
    questions: <Questions toast={toast} />,
    flashcards: <Flashcards toast={toast} />,
    users: <Users toast={toast} />,
    analytics: <Analytics />,
  };

  return (
    <div style={S.wrap}>
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoTitle}>IMUpilot</div>
          <div style={S.logoSub}>Admin Panel</div>
        </div>
        {nav.map((n) => (
          <div key={n.id} style={S.navItem(page === n.id)} onClick={() => setPage(n.id)}>{n.label}</div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={S.navItem(false)} onClick={() => setAuthed(false)}>Sign out</div>
      </div>
      <div style={S.main}>{pages[page]}</div>
      <Toast msg={toastMsg} />
    </div>
  );
}
