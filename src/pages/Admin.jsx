import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient"; // your existing supabase client

// Direct Supabase integration - backend API dependency removed

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
    try {
      const { data, error } = await supabase
        .from("questions")
        .update(fields)
        .eq("id", question.id)
        .select();
      setSaving(false);
      if (error) return alert("Save failed: " + error.message);
      if (data && data[0]) onSave(data[0]);
    } catch (err) {
      setSaving(false);
      alert("Save failed: " + err.message);
    }
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
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      setQuestions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) return alert("Delete failed: " + error.message);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast("Question deleted");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  function handleSaved(updated) {
    setQuestions((prev) => prev.map((q) => q.id === updated.id ? updated : q));
    setEditingQ(null);
    toast("Question saved!");
  }

  async function addQ() {
    if (!form.question_text || !form.subject) return alert("Subject and question text are required");
    try {
      const { data, error } = await supabase.from("questions").insert([form]).select();
      if (error) return alert("Add failed: " + error.message);
      if (data && data[0]) setQuestions((prev) => [data[0], ...prev]);
      toast("Question added!");
      setForm(EMPTY_Q);
    } catch (err) {
      alert("Add failed: " + err.message);
    }
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
    try {
      for (const chunk of chunks) {
        const { error } = await supabase.from("questions").upsert(chunk);
        if (error) throw new Error(error.message || 'Bulk upload failed');
      }
      toast(`${csvData.length} questions uploaded!`);
      setCsvData(null); setCsvName("");
      load();
    } catch (err) {
      alert("Upload error: " + err.message);
      setLoading(false);
    }
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

// ─── Mock Questions section ───────────────────────────────────────────────────

const EMPTY_MOCK_Q = {
  set_number: 1,
  subject: "",
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: 1,
  difficulty: "medium",
  solution_steps: "",
};

function MockEditDrawer({ question, onClose, onSave, sets = [] }) {
  const [form, setForm] = useState({ ...EMPTY_MOCK_Q, ...question });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.question_text || !form.subject) return alert("Subject and question text are required");
    setSaving(true);
    const { id, created_at, ...fields } = form;
    const payload = {
      ...fields,
      set_number: Number(fields.set_number) || 1,
      correct_option: Number(fields.correct_option) || 1,
    };
    try {
      const { data, error } = await supabase
        .from("mock_questions")
        .update(payload)
        .eq("id", question.id)
        .select();
      setSaving(false);
      if (error) return alert("Save failed: " + error.message);
      if (data && data[0]) onSave(data[0]);
    } catch (err) {
      setSaving(false);
      alert("Save failed: " + err.message);
    }
  }

  const f = (key) => ({ value: form[key] ?? "", onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div style={{ width: 560, background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Edit mock question</div>
          <button style={{ ...S.btn(), padding: "4px 10px", fontSize: 12 }} onClick={onClose}>✕ Close</button>
        </div>
        <div style={{ padding: 24, flex: 1 }}>
          <div style={S.formRow}>
            <div>
              <label style={S.label}>Set Number</label>
              <select
                style={S.input}
                value={form.set_number}
                onChange={(e) => setForm({ ...form, set_number: Number(e.target.value) })}
              >
                {sets && sets.length > 0 ? (
                  sets.map((s) => (
                    <option key={s.set_number} value={s.set_number}>
                      Set {s.set_number}{s.title ? ` - ${s.title}` : ""}
                    </option>
                  ))
                ) : (
                  Array.from({ length: 19 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>Set {n}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label style={S.label}>Subject</label>
              <select
                style={S.input}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                <option value="">Select subject</option>
                <option value="General Aptitude">General Aptitude</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>
          <div style={S.formRow}>
            <div>
              <label style={S.label}>Difficulty</label>
              <select style={S.input} value={form.difficulty || "medium"} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label style={S.label}>Correct Option</label>
              <select
                style={S.input}
                value={form.correct_option}
                onChange={(e) => setForm({ ...form, correct_option: Number(e.target.value) })}
              >
                <option value={1}>1 (A)</option>
                <option value={2}>2 (B)</option>
                <option value={3}>3 (C)</option>
                <option value={4}>4 (D)</option>
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
          <label style={S.label}>Solution steps</label>
          <textarea style={{ ...S.input, height: 80 }} {...f("solution_steps")} />
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, position: "sticky", bottom: 0, background: "#fff" }}>
          <button style={S.btn("primary")} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          <button style={S.btn()} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function MockQuestions({ toast, role }) {
  const [mockQuestions, setMockQuestions] = useState([]);
  const [sets, setSets] = useState([]);
  const [tab, setTab] = useState("view");
  const [setFilter, setSetFilter] = useState("1");
  const [subFilter, setSubFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [form, setForm] = useState(EMPTY_MOCK_Q);
  const [showNewSet, setShowNewSet] = useState(false);
  const [newSetNumber, setNewSetNumber] = useState("");
  const [newSetTitle, setNewSetTitle] = useState("");
  const [creatingSet, setCreatingSet] = useState(false);

  // Guarantee sets 1-19 are always present, combined with any sets loaded or created
  const baseSetNumbers = Array.from({ length: 19 }, (_, i) => i + 1);
  const combinedSetNumbers = [...new Set([...baseSetNumbers, ...sets.map((s) => Number(s.set_number))])].sort((a, b) => a - b);
  const displaySets = combinedSetNumbers.map((num) => {
    const existing = sets.find((s) => Number(s.set_number) === num);
    return existing || { set_number: num, title: "", published: true };
  });

  const loadSets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("mock_test_sets")
        .select("*")
        .order("set_number");
      if (!error && data && data.length > 0) {
        setSets(data);
      } else {
        // Fallback: discover available set numbers from mock_questions
        const { data: qData } = await supabase
          .from("mock_questions")
          .select("set_number")
          .limit(1000);
        const found = [...new Set((qData || []).map((q) => q.set_number))].filter(Boolean);
        const allNums = [...new Set([...Array.from({ length: 19 }, (_, i) => i + 1), ...found])].sort((a, b) => a - b);
        setSets(allNums.map((n) => ({ set_number: n, title: "", published: true })));
      }
    } catch (err) {
      console.error("Error loading mock_test_sets:", err);
      setSets(Array.from({ length: 19 }, (_, i) => ({ set_number: i + 1, title: "", published: true })));
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("mock_questions")
        .select("*")
        .order("set_number", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(2000);

      if (setFilter) {
        query = query.eq("set_number", Number(setFilter));
      }

      const { data, error } = await query;
      if (error) throw error;
      setMockQuestions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const subjects = [...new Set(mockQuestions.map((q) => q.subject))].filter(Boolean);

  const filtered = mockQuestions.filter((q) => {
    if (subFilter && q.subject !== subFilter) return false;
    return true;
  });

  const currentSetObj = displaySets.find((s) => s.set_number === parseInt(setFilter));
  const isPublished = Boolean(sets.find((s) => s.set_number === parseInt(setFilter))?.published ?? currentSetObj?.published);
  const isSetFree = Boolean(sets.find((s) => s.set_number === parseInt(setFilter))?.is_free ?? currentSetObj?.is_free);

  async function togglePublish() {
    const currentSet = sets.find(s => s.set_number === parseInt(setFilter));
    const current = currentSet?.published;
    await supabase.from('mock_test_sets').update({ published: !current }).eq('set_number', parseInt(setFilter));
    setSets((prev) => prev.map((s) => s.set_number === parseInt(setFilter) ? { ...s, published: !current } : s));
    await loadSets();
  }

  async function toggleFree() {
    const currentSet = sets.find(s => s.set_number === parseInt(setFilter));
    const current = currentSet?.is_free;
    await supabase.from('mock_test_sets').update({ is_free: !current }).eq('set_number', parseInt(setFilter));
    setSets((prev) => prev.map((s) => s.set_number === parseInt(setFilter) ? { ...s, is_free: !current } : s));
    await loadSets();
  }

  async function handleCreateSet(e) {
    if (e && e.preventDefault) e.preventDefault();
    const num = parseInt(newSetNumber, 10);
    if (!newSetNumber || isNaN(num) || num < 1 || num > 50) {
      alert("Set number must be between 1 and 50.");
      return;
    }
    if (displaySets.some((s) => Number(s.set_number) === num)) {
      alert(`Set ${num} already exists in sets.`);
      return;
    }

    setCreatingSet(true);
    const newSetObj = { set_number: num, title: newSetTitle.trim(), published: false };
    try {
      const { error } = await supabase.from("mock_test_sets").insert([newSetObj]);
      if (error) {
        console.warn("mock_test_sets insert notice (check RLS):", error.message);
      }
      setSets((prev) => {
        const next = [...prev.filter((s) => s.set_number !== num), newSetObj];
        return next.sort((a, b) => a.set_number - b.set_number);
      });
      toast(`Set ${num} created as Draft`);
      setNewSetNumber("");
      setNewSetTitle("");
      setShowNewSet(false);
      setSetFilter(String(num));
    } catch (err) {
      alert("Error creating set: " + err.message);
    } finally {
      setCreatingSet(false);
    }
  }

  // Calculate subject counts for current set
  const subjectBreakdown = {
    "General Aptitude": 0,
    "Mathematics": 0,
    "Physics": 0,
    "Chemistry": 0,
    "English": 0,
  };
  mockQuestions.forEach((q) => {
    const s = q.subject || "";
    if (s.includes("Aptitude") || s.includes("Knowledge") || s.includes("GK") || s.includes("Reasoning")) {
      subjectBreakdown["General Aptitude"]++;
    } else if (s.includes("Math")) {
      subjectBreakdown["Mathematics"]++;
    } else if (s.includes("Physic")) {
      subjectBreakdown["Physics"]++;
    } else if (s.includes("Chemi")) {
      subjectBreakdown["Chemistry"]++;
    } else if (s.includes("English")) {
      subjectBreakdown["English"]++;
    } else if (subjectBreakdown[s] !== undefined) {
      subjectBreakdown[s]++;
    } else {
      subjectBreakdown[s] = (subjectBreakdown[s] || 0) + 1;
    }
  });

  const setProgressPct = Math.min(100, Math.round((mockQuestions.length / 200) * 100));

  async function deleteQ(id) {
    if (!confirm("Delete this mock question?")) return;
    try {
      const { error } = await supabase.from("mock_questions").delete().eq("id", id);
      if (error) return alert("Delete failed: " + error.message);
      setMockQuestions((prev) => prev.filter((q) => q.id !== id));
      toast("Mock question deleted");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  function handleSaved(updated) {
    setMockQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setEditingQ(null);
    toast("Mock question saved!");
  }

  async function addQ() {
    if (!form.question_text || !form.subject) return alert("Subject and question text are required");
    try {
      const payload = {
        ...form,
        set_number: Number(form.set_number) || 1,
        correct_option: Number(form.correct_option) || 1,
      };
      const { data, error } = await supabase.from("mock_questions").insert([payload]).select();
      if (error) return alert("Add failed: " + error.message);
      if (data && data[0]) setMockQuestions((prev) => [data[0], ...prev]);
      toast("Mock question added!");
      setForm(EMPTY_MOCK_Q);
      setTab("view");
    } catch (err) {
      alert("Add failed: " + err.message);
    }
  }

  const f = (key) => ({ value: form[key] ?? "", onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

  const OPTION_MAP = { 1: "A", 2: "B", 3: "C", 4: "D" };

  return (
    <div>
      {editingQ && <MockEditDrawer question={editingQ} sets={displaySets} onClose={() => setEditingQ(null)} onSave={handleSaved} />}
      <div style={S.pageTitle}>Mock Questions</div>
      <div style={S.pageSub}>
        Manage full mock test question sets (mock_questions table) · {mockQuestions.length} questions in current view
      </div>

      <div style={S.tabRow}>
        <div style={S.tab(tab === "view")} onClick={() => setTab("view")}>View & manage</div>
        <div style={S.tab(tab === "add")} onClick={() => setTab("add")}>Add single</div>
      </div>

      {tab === "view" && (
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={{ display: "flex", gap: 10, flex: 1, flexWrap: "wrap", alignItems: "center" }}>
              <select
                style={{ ...S.input, width: 160, marginBottom: 0 }}
                value={setFilter}
                onChange={(e) => setSetFilter(e.target.value)}
              >
                <option value="">All Sets</option>
                {displaySets.map((s) => (
                  <option key={s.set_number} value={s.set_number}>
                    Set {s.set_number}{s.title ? ` - ${s.title}` : ""}
                  </option>
                ))}
              </select>

              {role === 'admin' && setFilter && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={S.badge(isPublished ? "green" : "yellow")}>
                    {isPublished ? "Published" : "Draft"}
                  </span>
                  <button
                    style={{
                      ...S.btn(isPublished ? "danger" : "primary"),
                      ...S.btnSm,
                      ...(isPublished ? {} : { background: "#16a34a", color: "#fff" }),
                    }}
                    onClick={togglePublish}
                  >
                    {isPublished ? "Unpublish" : "Publish"}
                  </button>

                  <span style={S.badge(isSetFree ? "green" : "gray")}>
                    {isSetFree ? "Free" : "Locked 🔒"}
                  </span>
                  <button
                    style={{
                      ...S.btn(isSetFree ? "default" : "primary"),
                      ...S.btnSm,
                      ...(!isSetFree ? { background: "#16a34a", color: "#fff" } : {}),
                    }}
                    onClick={toggleFree}
                  >
                    {isSetFree ? "Make Locked" : "Make Free"}
                  </button>
                </div>
              )}

              <select
                style={{ ...S.input, width: 180, marginBottom: 0 }}
                value={subFilter}
                onChange={(e) => setSubFilter(e.target.value)}
              >
                <option value="">All subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {role === 'admin' && (
                <button
                  type="button"
                  style={{ ...S.btn(showNewSet ? "default" : "primary"), ...S.btnSm }}
                  onClick={() => setShowNewSet((prev) => !prev)}
                >
                  {showNewSet ? "✕ Cancel" : "+ New Set"}
                </button>
              )}
            </div>
            <button style={{ ...S.btn("primary"), ...S.btnSm, marginLeft: 8 }} onClick={load}>↺ Refresh</button>
          </div>

          {/* Inline form for creating a new set */}
          {role === 'admin' && showNewSet && (
            <form
              onSubmit={handleCreateSet}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Set Number:</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="1-50"
                  style={{ ...S.input, width: 85, marginBottom: 0 }}
                  value={newSetNumber}
                  onChange={(e) => setNewSetNumber(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Title (optional):</span>
                <input
                  type="text"
                  placeholder="e.g. Full Length Mock 20"
                  style={{ ...S.input, flex: 1, marginBottom: 0 }}
                  value={newSetTitle}
                  onChange={(e) => setNewSetTitle(e.target.value)}
                />
              </div>

              <button
                type="submit"
                style={{ ...S.btn("primary"), ...S.btnSm }}
                disabled={creatingSet}
              >
                {creatingSet ? "Creating..." : "Create Set"}
              </button>

              <button
                type="button"
                style={{ ...S.btn(), ...S.btnSm }}
                onClick={() => {
                  setShowNewSet(false);
                  setNewSetNumber("");
                  setNewSetTitle("");
                }}
              >
                Cancel
              </button>
            </form>
          )}

          {/* Set Progress summary row */}
          {setFilter && (
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: "#111" }}>
                  Set {setFilter}: {mockQuestions.length} / 200 questions
                </span>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#4b5563", flexWrap: "wrap" }}>
                  <span>General Aptitude: <b>{subjectBreakdown["General Aptitude"] || 0}</b></span>
                  <span>Mathematics: <b>{subjectBreakdown["Mathematics"] || 0}</b></span>
                  <span>Physics: <b>{subjectBreakdown["Physics"] || 0}</b></span>
                  <span>Chemistry: <b>{subjectBreakdown["Chemistry"] || 0}</b></span>
                  <span>English: <b>{subjectBreakdown["English"] || 0}</b></span>
                </div>
              </div>
              <div style={S.progressBar}>
                <div style={S.progressFill(setProgressPct)} />
              </div>
            </div>
          )}

          {loading ? (
            <div style={S.empty}>Loading mock questions...</div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>
              {mockQuestions.length === 0 ? "No mock questions found." : "No mock questions match subject filter."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 70 }}>Set</th>
                    <th style={{ ...S.th, width: 140 }}>Subject</th>
                    <th style={S.th}>Question</th>
                    <th style={{ ...S.th, width: 80 }}>Correct</th>
                    <th style={{ ...S.th, width: 80 }}>Diff</th>
                    <th style={{ ...S.th, width: 120, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((q) => (
                    <tr key={q.id}>
                      <td style={S.td}><span style={S.badge("blue")}>Set {q.set_number}</span></td>
                      <td style={S.td}><b>{q.subject}</b></td>
                      <td style={{ ...S.td, maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={q.question_text}>
                        {q.question_text}
                      </td>
                      <td style={S.td}>
                        <span style={S.badge("green")}>
                          {q.correct_option} ({OPTION_MAP[q.correct_option] || "?"})
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={S.badge(q.difficulty === "easy" ? "green" : q.difficulty === "hard" ? "red" : "yellow")}>
                          {q.difficulty || "medium"}
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button style={{ ...S.btn(), ...S.btnSm }} onClick={() => setEditingQ(q)}>Edit</button>
                          <button style={{ ...S.btn("danger"), ...S.btnSm }} onClick={() => deleteQ(q.id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "add" && (
        <div style={{ ...S.card, maxWidth: 640 }}>
          <div style={S.cardTitle}>Add new mock question</div>
          <div style={{ marginTop: 16 }}>
            <div style={S.formRow}>
              <div>
                <label style={S.label}>Set Number *</label>
                <select
                  style={S.input}
                  value={form.set_number}
                  onChange={(e) => setForm({ ...form, set_number: Number(e.target.value) })}
                >
                  {displaySets.map((s) => (
                    <option key={s.set_number} value={s.set_number}>
                      Set {s.set_number}{s.title ? ` - ${s.title}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Subject *</label>
                <select
                  style={S.input}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                  <option value="">Select subject</option>
                  <option value="General Aptitude">General Aptitude</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            <div style={S.formRow}>
              <div>
                <label style={S.label}>Difficulty</label>
                <select style={S.input} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Correct Option</label>
                <select
                  style={S.input}
                  value={form.correct_option}
                  onChange={(e) => setForm({ ...form, correct_option: Number(e.target.value) })}
                >
                  <option value={1}>1 (A)</option>
                  <option value={2}>2 (B)</option>
                  <option value={3}>3 (C)</option>
                  <option value={4}>4 (D)</option>
                </select>
              </div>
            </div>

            <label style={S.label}>Question text *</label>
            <textarea style={{ ...S.input, height: 80 }} placeholder="Type question..." {...f("question_text")} />

            <div style={S.formRow}>
              <div><label style={S.label}>Option A</label><input style={S.input} placeholder="Option A text" {...f("option_a")} /></div>
              <div><label style={S.label}>Option B</label><input style={S.input} placeholder="Option B text" {...f("option_b")} /></div>
            </div>
            <div style={S.formRow}>
              <div><label style={S.label}>Option C</label><input style={S.input} placeholder="Option C text" {...f("option_c")} /></div>
              <div><label style={S.label}>Option D</label><input style={S.input} placeholder="Option D text" {...f("option_d")} /></div>
            </div>

            <label style={S.label}>Solution steps</label>
            <textarea style={{ ...S.input, height: 80 }} placeholder="Step-by-step solution / explanation..." {...f("solution_steps")} />

            <div style={{ marginTop: 12 }}>
              <button style={S.btn("primary")} onClick={addQ}>Add mock question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const EMPTY_F = {
  company: "", section: "DNS", category: "", type: "interview", question: "", answer: "", chapter: "",
  subject: "", topic: "", explanation: "", exam_tip: "", difficulty: "", source: "",
};

function FlashcardEditDrawer({ flashcard, onClose, onSave }) {
  const [form, setForm] = useState({ ...EMPTY_F, ...flashcard });
  const [subjectTouched, setSubjectTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const isImucet = form.section === "IMUCET";
  const legacySubject = isImucet && flashcard.section === "IMUCET" && !form.subject?.trim() ? form.company || "" : "";
  const subjectValue = form.subject?.trim() || (!subjectTouched ? legacySubject : "");

  async function save() {
    if (!form.question?.trim()) return alert("Question is required");
    if (isImucet && !form.subject?.trim() && (!legacySubject || subjectTouched)) return alert("Subject and question are required");
    if (!isImucet && !form.company?.trim()) return alert("Company and question are required");
    setSaving(true);
    const fields = isImucet
      ? {
          section: "IMUCET",
          chapter: form.chapter || "",
          topic: form.topic || "",
          question: form.question,
          answer: form.answer || "",
          explanation: form.explanation || "",
          exam_tip: form.exam_tip || "",
          difficulty: form.difficulty || "",
          source: form.source || "",
          type: form.type || "",
          ...(form.subject?.trim() ? { subject: form.subject.trim() } : subjectTouched ? { subject: "" } : {}),
        }
      : {
          section: "DNS",
          company: form.company,
          category: form.category || "",
          chapter: form.chapter || "",
          question: form.question,
          answer: form.answer || "",
          type: form.type || "",
        };
    const { data, error } = await supabase.from("flashcards").update(fields).eq("id", flashcard.id).select();
    setSaving(false);
    if (error) return alert("Save failed: " + error.message);
    onSave(data[0]);
  }

  const f = (key) => ({ value: form[key] || "", onChange: (e) => setForm({ ...form, [key]: e.target.value }) });
  const setSection = (section) => setForm(previous => ({
    ...previous,
    section,
    type: section === "DNS" && !previous.type ? "interview" : section === "IMUCET" && previous.type === "interview" ? "" : previous.type,
  }));

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
            <div><label style={S.label}>Section</label>
              <select style={S.input} value={form.section} onChange={(e) => setSection(e.target.value)}>
                <option value="DNS">DNS</option><option value="IMUCET">IMUCET</option>
              </select>
            </div>
          </div>
          {isImucet ? (
            <>
              <div style={S.formRow}>
                <div><label style={S.label}>Subject</label><input style={S.input} value={subjectValue} onChange={(e) => { setSubjectTouched(true); setForm({ ...form, subject: e.target.value }); }} /></div>
                <div><label style={S.label}>Chapter</label><input style={S.input} {...f("chapter")} /></div>
              </div>
              <div style={S.formRow}>
                <div><label style={S.label}>Topic</label><input style={S.input} {...f("topic")} /></div>
                <div><label style={S.label}>Difficulty (optional)</label><input style={S.input} {...f("difficulty")} /></div>
              </div>
              <div style={S.formRow}>
                <div><label style={S.label}>Source (optional)</label><input style={S.input} {...f("source")} /></div>
                <div><label style={S.label}>Type</label><input style={S.input} {...f("type")} /></div>
              </div>
            </>
          ) : (
            <>
              <div style={S.formRow}>
                <div><label style={S.label}>Company</label><input style={S.input} placeholder="Anglo Eastern" {...f("company")} /></div>
                <div><label style={S.label}>Category</label><input style={S.input} placeholder="Personal/HR" {...f("category")} /></div>
              </div>
              <div style={S.formRow}>
                <div><label style={S.label}>Chapter (optional)</label><input style={S.input} {...f("chapter")} /></div>
                <div><label style={S.label}>Type</label><input style={S.input} {...f("type")} /></div>
              </div>
            </>
          )}
          <label style={S.label}>Question</label>
          <textarea style={{ ...S.input, height: 80 }} {...f("question")} />
          <label style={S.label}>Answer (model answer)</label>
          <textarea style={{ ...S.input, height: 120 }} {...f("answer")} />
          {isImucet && (
            <>
              <label style={S.label}>Explanation</label>
              <textarea style={{ ...S.input, height: 100 }} {...f("explanation")} />
              <label style={S.label}>Exam Tip</label>
              <textarea style={{ ...S.input, height: 80 }} {...f("exam_tip")} />
            </>
          )}
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
    const { data } = await supabase.from("flashcards").select("id,created_at,company,section,category,question,answer,type,chapter,subject,topic,explanation,exam_tip,difficulty,source,is_free").order("created_at", { ascending: false }).limit(1000);
    setFlashcards(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const groups = [...new Set(flashcards.map((card) => card.section === "IMUCET" ? card.subject || card.company : card.company))].filter(Boolean);
  const sections = ["DNS", "IMUCET"];
  const filtered = flashcards.filter((f) => {
    const group = f.section === "IMUCET" ? f.subject || f.company : f.company;
    if (compFilter && group !== compFilter) return false;
    if (secFilter && f.section !== secFilter) return false;
    return true;
  });
  const visibleCards = filtered.slice(0, 50);
  const visibleSections = [...new Set(visibleCards.map(card => card.section || "DNS"))];

  function renderSectionTable(section) {
    const cards = visibleCards.filter(card => (card.section || "DNS") === section);
    if (!cards.length) return null;
    const isImucet = section === "IMUCET";
    const columns = isImucet
      ? [
          ...(cards.some(card => card.subject || card.company) ? [{ label: "Subject", value: card => card.subject || card.company }] : []),
          ...(cards.some(card => card.chapter) ? [{ label: "Chapter", value: card => card.chapter }] : []),
          ...(cards.some(card => card.topic) ? [{ label: "Topic", value: card => card.topic }] : []),
          { label: "Question", value: card => card.question, truncate: true },
          ...(cards.some(card => card.difficulty) ? [{ label: "Difficulty", value: card => card.difficulty }] : []),
        ]
      : [
          ...(cards.some(card => card.company) ? [{ label: "Company", value: card => card.company, badge: true }] : []),
          ...(cards.some(card => card.category) ? [{ label: "Category", value: card => card.category }] : []),
          ...(cards.some(card => card.chapter) ? [{ label: "Chapter", value: card => card.chapter }] : []),
          { label: "Question", value: card => card.question, truncate: true },
        ];

    return (
      <div key={section} style={{ marginBottom: 22, overflowX: "auto" }}>
        <div style={{ ...S.cardTitle, marginBottom: 10 }}>{section}</div>
        <table style={S.table}>
          <thead><tr>
            {columns.map(column => <th key={column.label} style={S.th}>{column.label}</th>)}
            <th style={S.th}>Has answer</th>
            <th style={S.th}>Access</th>
            <th style={S.th}>Actions</th>
          </tr></thead>
          <tbody>
            {cards.map(card => (
              <tr key={card.id}>
                {columns.map(column => (
                  <td key={column.label} style={{ ...S.td, ...(column.truncate ? { maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } : {}) }}>
                    {column.badge && column.value(card)
                      ? <span style={S.badge("blue")}>{column.value(card)}</span>
                      : column.value(card) || "—"}
                  </td>
                ))}
                <td style={S.td}><span style={S.badge(card.answer ? "green" : "yellow")}>{card.answer ? "Yes" : "Missing"}</span></td>
                <td style={S.td}>
                  <span style={S.badge(card.is_free ? "green" : "gray")}>
                    {card.is_free ? "Free" : "Locked"}
                  </span>
                </td>
                <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                  <button
                    style={{ ...S.btn("default"), ...S.btnSm, marginRight: 6 }}
                    onClick={async () => {
                      const newFree = !card.is_free;
                      const { error } = await supabase.from('flashcards').update({ is_free: newFree }).eq('id', card.id);
                      if (error) {
                        console.warn("flashcards update notice:", error.message);
                      }
                      setFlashcards((prev) => prev.map((f) => f.id === card.id ? { ...f, is_free: newFree } : f));
                      toast(`Card set to ${newFree ? "Free" : "Locked"}`);
                    }}
                  >
                    {card.is_free ? "🔒 Lock" : "🔓 Free"}
                  </button>
                  <button style={{ ...S.btn(), ...S.btnSm, marginRight: 6 }} onClick={() => setEditingF(card)}>✏ Edit</button>
                  <button style={{ ...S.btn("danger"), ...S.btnSm }} onClick={() => deleteF(card.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

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
    const isImucet = form.section === "IMUCET";
    if (!form.question?.trim()) return alert("Question is required");
    if (isImucet && !form.subject?.trim()) return alert("Subject and question are required");
    if (!isImucet && !form.company?.trim()) return alert("Company and question are required");
    const payload = isImucet
      ? {
          section: "IMUCET",
          subject: form.subject.trim(),
          chapter: form.chapter || "",
          topic: form.topic || "",
          question: form.question,
          answer: form.answer || "",
          explanation: form.explanation || "",
          exam_tip: form.exam_tip || "",
          difficulty: form.difficulty || "",
          source: form.source || "",
          type: form.type || "",
        }
      : {
          section: "DNS",
          company: form.company,
          category: form.category || "",
          chapter: form.chapter || "",
          question: form.question,
          answer: form.answer || "",
          type: form.type || "interview",
        };
    const { data, error } = await supabase.from("flashcards").insert([payload]).select();
    if (error) return alert("Add failed: " + error.message);
    if (data?.[0]) setFlashcards((prev) => [data[0], ...prev]);
    toast("Flashcard added!");
    setForm(EMPTY_F);
  }

  const setFormSection = (section) => setForm(previous => ({
    ...previous,
    section,
    type: section === "DNS" && !previous.type ? "interview" : section === "IMUCET" && previous.type === "interview" ? "" : previous.type,
  }));

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
                <option value="">All groups</option>
                {groups.map((group) => <option key={group} value={group}>{group}</option>)}
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
            <div>
              {visibleSections.map(renderSectionTable)}
              {filtered.length > 50 && <div style={{ textAlign: "center", padding: 12, fontSize: 12, color: "#9ca3af" }}>Showing 50 of {filtered.length}</div>}
            </div>
          )}
        </div>
      )}

      {tab === "add" && (
        <div style={S.card}>
          <div style={{ ...S.cardTitle, marginBottom: 16 }}>Add flashcard</div>
          <div style={S.formRow}>
            <div><label style={S.label}>Section</label>
              <select style={S.input} value={form.section} onChange={(e) => setFormSection(e.target.value)}>
                <option value="DNS">DNS</option><option value="IMUCET">IMUCET</option>
              </select>
            </div>
          </div>
          {form.section === "IMUCET" ? (
            <>
              <div style={S.formRow}>
                <div><label style={S.label}>Subject</label><input style={S.input} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                <div><label style={S.label}>Chapter</label><input style={S.input} value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} /></div>
              </div>
              <div style={S.formRow}>
                <div><label style={S.label}>Topic</label><input style={S.input} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></div>
                <div><label style={S.label}>Difficulty (optional)</label><input style={S.input} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} /></div>
              </div>
              <div style={S.formRow}>
                <div><label style={S.label}>Source (optional)</label><input style={S.input} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
                <div><label style={S.label}>Type</label><input style={S.input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
              </div>
            </>
          ) : (
            <>
              <div style={S.formRow}>
                <div><label style={S.label}>Company</label><input style={S.input} placeholder="Anglo Eastern" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
                <div><label style={S.label}>Category</label><input style={S.input} placeholder="Personal/HR" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              </div>
              <div style={S.formRow}>
                <div><label style={S.label}>Chapter (optional)</label><input style={S.input} value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} /></div>
                <div><label style={S.label}>Type</label><input style={S.input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
              </div>
            </>
          )}
          <label style={S.label}>Question</label>
          <textarea style={{ ...S.input, height: 60 }} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          <label style={S.label}>Answer (model answer)</label>
          <textarea style={{ ...S.input, height: 80 }} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
          {form.section === "IMUCET" && (
            <>
              <label style={S.label}>Explanation</label>
              <textarea style={{ ...S.input, height: 100 }} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
              <label style={S.label}>Exam Tip</label>
              <textarea style={{ ...S.input, height: 80 }} value={form.exam_tip} onChange={(e) => setForm({ ...form, exam_tip: e.target.value })} />
            </>
          )}
          <button style={S.btn("primary")} onClick={addF}>+ Add flashcard</button>
        </div>
      )}

      {tab === "upload" && (
        <div style={S.card}>
          <div style={{ ...S.cardTitle, marginBottom: 12 }}>Upload flashcard CSV</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
            DNS: <code>company, category, question, answer, type, section, chapter</code><br />
            IMUCET: include <code>section, subject, chapter, topic, question, answer, explanation, exam_tip, difficulty, source, type</code>. IMUCET metadata columns are not required for DNS rows.
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

// ─── Blueprint ──────────────────────────────────────────────────────────────

const BLUEPRINT_SUBJECTS = [
  "General Aptitude",
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
];

const EMPTY_CHAPTER = {
  subject: "General Aptitude",
  chapter_name: "",
  chapter_order: 1,
  is_free: false,
  content: "",
  pdf_url: "",
  is_published: false,
};

function BlueprintEditDrawer({ chapter, onClose, onSave }) {
  const [form, setForm] = useState({
    subject: chapter.subject || "General Aptitude",
    chapter_name: chapter.chapter_name || "",
    chapter_order: chapter.chapter_order ?? 1,
    is_free: Boolean(chapter.is_free),
    content: chapter.content || "",
    pdf_url: chapter.pdf_url || "",
    is_published: Boolean(chapter.is_published ?? chapter.published),
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.chapter_name.trim() || !form.subject) {
      alert("Subject and Chapter Name are required");
      return;
    }
    setSaving(true);
    const payload = {
      subject: form.subject,
      chapter_name: form.chapter_name.trim(),
      chapter_order: Number(form.chapter_order) || 1,
      is_free: Boolean(form.is_free),
      content: form.content || "",
      pdf_url: (form.pdf_url || "").trim(),
      is_published: Boolean(form.is_published),
    };
    try {
      const { data, error } = await supabase
        .from("blueprint_chapters")
        .update(payload)
        .eq("id", chapter.id)
        .select();
      setSaving(false);
      if (error) {
        alert("Failed to save chapter: " + error.message);
        return;
      }
      if (data && data[0]) onSave(data[0]);
    } catch (err) {
      setSaving(false);
      alert("Save failed: " + err.message);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.3)" }} onClick={onClose} />
      <div style={{ width: 620, background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Edit Notes Chapter</div>
          <button style={{ ...S.btn(), padding: "4px 10px", fontSize: 12 }} onClick={onClose}>✕ Close</button>
        </div>
        <div style={{ padding: 24, flex: 1 }}>
          <div style={S.formRow}>
            <div>
              <label style={S.label}>Subject *</label>
              <select
                style={S.input}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                {BLUEPRINT_SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={S.label}>Chapter Order (sorting) *</label>
              <input
                type="number"
                min="1"
                style={S.input}
                value={form.chapter_order}
                onChange={(e) => setForm({ ...form, chapter_order: Number(e.target.value) })}
              />
            </div>
          </div>

          <label style={S.label}>Chapter Name *</label>
          <input
            style={S.input}
            placeholder="e.g. Kinematics"
            value={form.chapter_name}
            onChange={(e) => setForm({ ...form, chapter_name: e.target.value })}
          />

          <div style={S.formRow}>
            <div>
              <label style={S.label}>Access (Free / Paid) *</label>
              <select
                style={S.input}
                value={form.is_free ? "true" : "false"}
                onChange={(e) => setForm({ ...form, is_free: e.target.value === "true" })}
              >
                <option value="false">Paid</option>
                <option value="true">Free</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", paddingTop: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontWeight: 500, color: "#111" }}>Published</span>
              </label>
            </div>
          </div>

          <label style={S.label}>Content (Markdown / Notes text)</label>
          <textarea
            style={{ ...S.input, height: 300, fontFamily: "monospace", fontSize: 13, lineHeight: 1.5 }}
            placeholder="Write notes / markdown content here..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />

          <label style={S.label}>PDF URL (optional)</label>
          <input
            style={S.input}
            placeholder="https://drive.google.com/... or any public PDF link"
            value={form.pdf_url}
            onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
          />
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, position: "sticky", bottom: 0, background: "#fff" }}>
          <button style={S.btn("primary")} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          <button style={S.btn()} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Blueprint({ toast }) {
  const [chapters, setChapters] = useState([]);
  const [tab, setTab] = useState("view");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [form, setForm] = useState(EMPTY_CHAPTER);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blueprint_chapters")
        .select("*")
        .order("subject")
        .order("chapter_order");
      if (error) throw error;
      setChapters(data || []);
    } catch (err) {
      console.error("Error loading blueprint chapters:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = chapters.filter((c) => {
    if (subjectFilter && c.subject !== subjectFilter) return false;
    return true;
  });

  async function togglePublished(ch) {
    const isPub = Boolean(ch.is_published ?? ch.published);
    const newStatus = !isPub;
    try {
      const { error } = await supabase
        .from("blueprint_chapters")
        .update({ is_published: newStatus })
        .eq("id", ch.id);
      if (error) {
        alert("Failed to update status: " + error.message);
        return;
      }
      setChapters((prev) =>
        prev.map((c) => (c.id === ch.id ? { ...c, is_published: newStatus } : c))
      );
      toast(`Chapter is now ${newStatus ? "Published" : "Draft"}`);
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  }

  async function deleteChapter(id) {
    if (!confirm("Delete this chapter?")) return;
    try {
      const { error } = await supabase.from("blueprint_chapters").delete().eq("id", id);
      if (error) return alert("Delete failed: " + error.message);
      setChapters((prev) => prev.filter((c) => c.id !== id));
      toast("Chapter deleted");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  function handleSaved(updated) {
    setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setEditingChapter(null);
    toast("Chapter saved!");
  }

  async function addChapter() {
    if (!form.chapter_name.trim() || !form.subject) {
      alert("Subject and Chapter Name are required");
      return;
    }
    setSubmitting(true);
    const payload = {
      subject: form.subject,
      chapter_name: form.chapter_name.trim(),
      chapter_order: Number(form.chapter_order) || 1,
      is_free: Boolean(form.is_free),
      content: form.content || "",
      pdf_url: (form.pdf_url || "").trim(),
      is_published: Boolean(form.is_published),
    };
    try {
      const { data, error } = await supabase.from("blueprint_chapters").insert([payload]).select();
      if (error) {
        alert("Add failed: " + error.message);
        return;
      }
      toast("Chapter note added!");
      setForm(EMPTY_CHAPTER);
      setTab("view");
      load();
    } catch (err) {
      alert("Add failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {editingChapter && (
        <BlueprintEditDrawer
          chapter={editingChapter}
          onClose={() => setEditingChapter(null)}
          onSave={handleSaved}
        />
      )}

      <div style={S.pageTitle}>Notes</div>
      <div style={S.pageSub}>
        Manage chapter notes and study material ({chapters.length} total chapters)
      </div>

      <div style={S.tabRow}>
        <div style={S.tab(tab === "view")} onClick={() => setTab("view")}>View & manage</div>
        <div style={S.tab(tab === "add")} onClick={() => setTab("add")}>Add chapter</div>
      </div>

      {tab === "view" && (
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div style={{ display: "flex", gap: 10, flex: 1, flexWrap: "wrap", alignItems: "center" }}>
              <select
                style={{ ...S.input, width: 200, marginBottom: 0 }}
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="">All subjects</option>
                {BLUEPRINT_SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button style={{ ...S.btn("primary"), ...S.btnSm, marginLeft: 8 }} onClick={load}>↺ Refresh</button>
          </div>

          {loading ? (
            <div style={S.empty}>Loading notes...</div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>
              {chapters.length === 0 ? "No notes found. Add one in the 'Add chapter' tab." : "No chapters match selected subject."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 140 }}>Subject</th>
                    <th style={S.th}>Chapter</th>
                    <th style={{ ...S.th, width: 90 }}>PDF</th>
                    <th style={{ ...S.th, width: 90 }}>Free/Paid</th>
                    <th style={{ ...S.th, width: 160 }}>Published</th>
                    <th style={{ ...S.th, width: 220, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ch) => {
                    const isPub = Boolean(ch.is_published ?? ch.published);
                    return (
                      <tr key={ch.id}>
                        <td style={S.td}><span style={S.badge("blue")}>{ch.subject}</span></td>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600, color: "#111" }}>
                            {ch.chapter_order ? `${ch.chapter_order}. ` : ""}{ch.chapter_name}
                          </div>
                          {ch.content && (
                            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, maxWidth: 350, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {ch.content.slice(0, 100)}
                            </div>
                          )}
                        </td>
                        <td style={S.td}>
                          {ch.pdf_url ? (
                            <a
                              href={ch.pdf_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "#2563eb",
                                textDecoration: "underline",
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              View PDF
                            </a>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                        <td style={S.td}>
                          <span style={S.badge(ch.is_free ? "green" : "blue")}>
                            {ch.is_free ? "Free" : "Paid"}
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={S.badge(isPub ? "green" : "yellow")}>
                              {isPub ? "Published" : "Draft"}
                            </span>
                            <button
                              style={{
                                ...S.btn(isPub ? "danger" : "primary"),
                                ...S.btnSm,
                                ...(isPub ? {} : { background: "#16a34a", color: "#fff" }),
                              }}
                              onClick={() => togglePublished(ch)}
                            >
                              {isPub ? "Unpublish" : "Publish"}
                            </button>
                          </div>
                        </td>
                        <td style={{ ...S.td, textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button
                              style={{ ...S.btn("default"), ...S.btnSm }}
                              onClick={async () => {
                                const newFree = !ch.is_free;
                                const { error } = await supabase.from('blueprint_chapters').update({ is_free: newFree }).eq('id', ch.id);
                                if (error) {
                                  console.warn("blueprint_chapters update notice:", error.message);
                                }
                                setChapters((prev) => prev.map((c) => (c.id === ch.id ? { ...c, is_free: newFree } : c)));
                                toast(`Chapter set to ${newFree ? "Free" : "Paid"}`);
                              }}
                            >
                              {ch.is_free ? "Make Paid" : "Make Free"}
                            </button>
                            <button style={{ ...S.btn(), ...S.btnSm }} onClick={() => setEditingChapter(ch)}>Edit</button>
                            <button style={{ ...S.btn("danger"), ...S.btnSm }} onClick={() => deleteChapter(ch.id)}>Del</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "add" && (
        <div style={{ ...S.card, maxWidth: 700 }}>
          <div style={S.cardTitle}>Add new chapter note</div>
          <div style={{ marginTop: 16 }}>
            <div style={S.formRow}>
              <div>
                <label style={S.label}>Subject *</label>
                <select
                  style={S.input}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                  {BLUEPRINT_SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Chapter Order (sorting) *</label>
                <input
                  type="number"
                  min="1"
                  style={S.input}
                  value={form.chapter_order}
                  onChange={(e) => setForm({ ...form, chapter_order: Number(e.target.value) })}
                />
              </div>
            </div>

            <label style={S.label}>Chapter Name *</label>
            <input
              style={S.input}
              placeholder="e.g. Kinematics"
              value={form.chapter_name}
              onChange={(e) => setForm({ ...form, chapter_name: e.target.value })}
            />

            <div style={S.formRow}>
              <div>
                <label style={S.label}>Access (Free / Paid) *</label>
                <select
                  style={S.input}
                  value={form.is_free ? "true" : "false"}
                  onChange={(e) => setForm({ ...form, is_free: e.target.value === "true" })}
                >
                  <option value="false">Paid</option>
                  <option value="true">Free</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", paddingTop: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontWeight: 500, color: "#111" }}>Published</span>
                </label>
              </div>
            </div>

            <label style={S.label}>Content (Markdown / Notes text)</label>
            <textarea
              style={{ ...S.input, height: 300, fontFamily: "monospace", fontSize: 13, lineHeight: 1.5 }}
              placeholder="Write chapter notes or markdown here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />

            <label style={S.label}>PDF URL (optional)</label>
            <input
              style={S.input}
              placeholder="https://drive.google.com/... or any public PDF link"
              value={form.pdf_url}
              onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
            />

            <button
              style={{ ...S.btn("primary"), marginTop: 8 }}
              onClick={addChapter}
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Chapter"}
            </button>
          </div>
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
  const [role, setRole] = useState(null); // "admin" | "editor"
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
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || "Genda12345@";
    const editorPass = import.meta.env.VITE_EDITOR_PASSWORD || "editor123";

    if (password === adminPass) {
      setAuthed(true);
      setRole("admin");
      setPage("dashboard");
      setError("");
    } else if (password === editorPass) {
      setAuthed(true);
      setRole("editor");
      setPage("questions");
      setError("");
    } else {
      setError("Incorrect password");
    }
  }

  useEffect(() => {
    if (!authed) return;
    supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => setQuestions(data || []));

    supabase
      .from("flashcards")
      .select("id,company,section,category,question,answer")
      .order("created_at", { ascending: false })
      .limit(1000)
      .then(({ data }) => setFlashcards(data || []));

    if (role === "admin") {
      supabase
        .from("profiles")
        .select("id,full_name,email,phone,plan,created_at")
        .order("created_at", { ascending: false })
        .then(({ data }) => setUsers(data || []));
    }
  }, [authed, role]);

  if (!authed) {
    return (
      <div style={S.loginWrap}>
        <div style={S.loginCard}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>IMUpilot Admin</div>
          <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>Enter password to continue</div>
          <label style={S.label}>Password</label>
          <input type="password" style={S.input} placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()} />
          {error && <div style={{ color: "#dc2626", fontSize: 12, marginTop: -6, marginBottom: 8 }}>{error}</div>}
          <button style={{ ...S.btn("primary"), width: "100%", justifyContent: "center" }} onClick={login}>Sign in</button>
        </div>
      </div>
    );
  }

  const nav = [
    { id: "dashboard", label: "Dashboard", adminOnly: true },
    { id: "questions", label: "Questions" },
    { id: "mockquestions", label: "Mock Questions" },
    { id: "flashcards", label: "Flashcards" },
    { id: "blueprint", label: "Notes" },
    { id: "users", label: "Users", adminOnly: true },
    { id: "analytics", label: "Analytics", adminOnly: true },
  ].filter((n) => !n.adminOnly || role === "admin");

  const pages = {
    dashboard: <Dashboard questions={questions} flashcards={flashcards} users={users} />,
    questions: <Questions toast={toast} />,
    mockquestions: <MockQuestions toast={toast} role={role} />,
    flashcards: <Flashcards toast={toast} />,
    blueprint: <Blueprint toast={toast} />,
    users: <Users toast={toast} />,
    analytics: <Analytics />,
  };

  return (
    <div style={S.wrap}>
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoTitle}>IMUpilot</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <span style={S.logoSub}>Admin Panel</span>
            <span style={S.badge(role === "admin" ? "blue" : "gray")}>{role}</span>
          </div>
        </div>
        {nav.map((n) => (
          <div key={n.id} style={S.navItem(page === n.id)} onClick={() => setPage(n.id)}>{n.label}</div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={S.navItem(false)} onClick={() => { setAuthed(false); setRole(null); setPassword(""); setPage("dashboard"); }}>Sign out</div>
      </div>
      <div style={S.main}>{pages[page] || (role === "admin" ? pages.dashboard : pages.questions)}</div>
      <Toast msg={toastMsg} />
    </div>
  );
}

