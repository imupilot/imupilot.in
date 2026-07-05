import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import MathText from '../components/MathText';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const SUBJECTS = [
  { id: 'Physics',          label: 'Physics',           color: 'var(--accent-info)', bg: 'var(--accent-info-subtle)', icon: '⚡' },
  { id: 'Chemistry',        label: 'Chemistry',          color: 'var(--accent-success)', bg: 'var(--accent-success-subtle)', icon: '🧪' },
  { id: 'Mathematics',      label: 'Mathematics',        color: 'var(--accent-warning)', bg: 'var(--accent-warning-subtle)', icon: '📐' },
  { id: 'English',          label: 'English',            color: 'var(--accent-primary)', bg: 'var(--accent-primary-subtle)', icon: '📝' },
  { id: 'General Aptitude', label: 'General Aptitude',   color: 'var(--accent-danger)', bg: 'var(--accent-danger-subtle)', icon: '🧠' },
];

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ─── Subject Selection ────────────────────────────────────────────────────────
function SubjectSelect({ onSelect }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-navy-subtle)', border: '2px solid var(--accent-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 8, fontWeight: 800, color: 'var(--accent-navy)', textAlign: 'center', lineHeight: 1.2 }}>IMU<br/>PILOT</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--accent-navy)' }}>IMUpilot</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Sectional Tests</div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 8 }}>Choose a Subject</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Select a subject to practice chapter-wise questions</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {SUBJECTS.map(sub => (
            <div key={sub.id} onClick={() => onSelect(sub)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: '28px 20px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = sub.color; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, background: sub.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 26 }}>
                {sub.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>{sub.label}</div>
              <div style={{ fontSize: 12, color: sub.color, fontWeight: 600, background: sub.bg, padding: '3px 12px', borderRadius: 999, display: 'inline-block' }}>
                Select →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Chapter Selection ────────────────────────────────────────────────────────
function ChapterSelect({ subject, onSelect, onBack }) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChapters() {
      const { data } = await supabase
        .from('questions')
        .select('chapter')
        .eq('subject', subject.id);

      if (data) {
        const unique = [...new Set(data.map(q => q.chapter).filter(Boolean))];
        // If no chapters, create one default
        if (unique.length === 0) {
          setChapters([{ name: 'All Questions', count: data.length }]);
        } else {
          const counts = {};
          data.forEach(q => { if (q.chapter) counts[q.chapter] = (counts[q.chapter] || 0) + 1; });
          setChapters(unique.map(ch => ({ name: ch, count: counts[ch] })));
        }
      }
      setLoading(false);
    }
    fetchChapters();
  }, [subject.id]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'inherit' }}>
          ← Back
        </button>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{subject.label}</div>
        <div style={{ width: 80 }} />
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: subject.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            {subject.icon}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>{subject.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Select a chapter to begin</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>Loading chapters...</div>
        ) : chapters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No questions yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Questions for {subject.label} are coming soon.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chapters.map((ch, i) => (
              <div key={ch.name} onClick={() => onSelect(ch)}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = subject.color; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: subject.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: subject.color, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{ch.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{ch.count} questions</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: subject.color }}>Start →</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Test Engine ──────────────────────────────────────────────────────────────
function TestEngine({ subject, chapter, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(45 * 60);
  const [startTime] = useState(Date.now());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      let query = supabase.from('questions').select('*').eq('subject', subject.id);
      if (chapter.name !== 'All Questions') query = query.eq('chapter', chapter.name);
      const { data } = await query;
      setQuestions(data || []);
      setTimeRemaining((data?.length || 50) * 54); // ~54 sec per question
      setLoading(false);
    }
    fetchQuestions();
  }, [subject.id, chapter.name]);

  useEffect(() => {
    if (loading || submitted) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, submitted]);

  const currentQ = questions[currentIndex];

  const handleAnswer = (optKey) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: optKey }));
  };

  const handleClear = () => {
    setAnswers(prev => { const p = { ...prev }; delete p[currentIndex]; return p; });
  };

  const handleSubmit = useCallback(() => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    let correct = 0, incorrect = 0, skipped = 0;

    questions.forEach((q, i) => {
      const selected = answers[i];
      if (!selected) { skipped++; return; }
      const selectedLetter = selected.replace('option_', '');
      if (selectedLetter === q.correct_option) correct++;
      else incorrect++;
    });

    const score = correct - incorrect * 0.25;
    const attempted = correct + incorrect;
    setResult({
      correct, incorrect, skipped,
      score: Math.round(score * 100) / 100,
      total: questions.length,
      accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
      timeTaken,
      questions,
      answers,
    });
    setSubmitted(true);
  }, [answers, questions, startTime]);

  // ── Result Screen ──
  if (submitted && result) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--accent-navy)' }}>IMUpilot</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{subject.label} — {chapter.name}</div>
          <button onClick={onBack} style={{ background: 'var(--accent-navy)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
            Back to Subjects
          </button>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
          {/* Score cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Score', value: result.score, color: 'var(--accent-navy)', big: true },
              { label: 'Correct', value: result.correct, color: 'var(--accent-success)' },
              { label: 'Incorrect', value: result.incorrect, color: 'var(--accent-danger)' },
              { label: 'Skipped', value: result.skipped, color: 'var(--text-secondary)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: s.big ? 32 : 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                {s.big && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>/ {result.total}</div>}
              </div>
            ))}
          </div>

          {/* Accuracy + time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: subject.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎯</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Accuracy</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: result.accuracy >= 70 ? 'var(--accent-success)' : result.accuracy >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>{result.accuracy}%</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⏱️</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time Taken</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{formatTime(result.timeTaken)}</div>
              </div>
            </div>
          </div>

          {/* Question review */}
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 16 }}>Question Review</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.questions.map((q, i) => {
              const selected = result.answers[i];
              const selectedLetter = selected ? selected.replace('option_', '') : null;
              const isCorrect = selectedLetter === q.correct_option;
              const isSkipped = !selected;
              return (
                <div key={i} style={{ background: 'var(--bg-elevated)', border: `1px solid ${isCorrect ? 'var(--accent-success)' : isSkipped ? 'var(--border-subtle)' : 'var(--accent-danger)'}`, borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isCorrect ? 'var(--accent-success-subtle)' : isSkipped ? 'var(--bg-tertiary)' : 'var(--accent-danger-subtle)' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)' }}>Q{i + 1}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: isCorrect ? 'var(--accent-success-subtle)' : isSkipped ? 'var(--bg-tertiary)' : 'var(--accent-danger-subtle)', color: isCorrect ? 'var(--accent-success)' : isSkipped ? 'var(--text-secondary)' : 'var(--accent-danger)' }}>
                      {isCorrect ? '✓ Correct' : isSkipped ? '— Skipped' : '✗ Incorrect'}
                    </span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.6 }}>
                      <MathText text={q.question_text} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {['option_a','option_b','option_c','option_d'].map((opt, oi) => {
                        const letter = opt.replace('option_', '');
                        const isCorrectOpt = letter === q.correct_option;
                        const isSelectedOpt = letter === selectedLetter;
                        const isWrong = isSelectedOpt && !isCorrectOpt;
                        return (
                          <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: isCorrectOpt ? 'var(--accent-success-subtle)' : isWrong ? 'var(--accent-danger-subtle)' : 'var(--bg-tertiary)', border: `1px solid ${isCorrectOpt ? 'var(--accent-success)' : isWrong ? 'var(--accent-danger)' : 'var(--border-subtle)'}` }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: isCorrectOpt ? 'var(--accent-success)' : isWrong ? 'var(--accent-danger)' : 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: isCorrectOpt || isWrong ? '#fff' : 'var(--text-secondary)', flexShrink: 0 }}>
                              {letter.toUpperCase()}
                            </div>
                            <span style={{ fontSize: 12, color: isCorrectOpt ? 'var(--accent-success)' : isWrong ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                              <MathText text={q[opt]} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {q.concept && (
                      <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--accent-info-subtle)', borderRadius: 8, fontSize: 12, color: 'var(--accent-info)' }}>
                        💡 <b>Concept:</b> {q.concept}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Submit Confirm ──
  if (showSubmitConfirm) {
    const answered = Object.keys(answers).length;
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'DM Sans','Segoe UI',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 20, padding: 36, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>Submit Test?</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
            Answered <b style={{ color: 'var(--accent-success)' }}>{answered}</b> of <b>{questions.length}</b> questions.
            <br />{questions.length - answered} questions unanswered.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowSubmitConfirm(false)} style={{ flex: 1, padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 10, background: 'var(--bg-elevated)', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit', color: 'var(--text-secondary)' }}>
              Go Back
            </button>
            <button onClick={handleSubmit} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 10, background: 'var(--accent-danger)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Segoe UI',sans-serif", color: 'var(--text-secondary)' }}>
      Loading questions...
    </div>
  );

  if (questions.length === 0) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Segoe UI',sans-serif", gap: 12 }}>
      <div style={{ fontSize: 48 }}>📭</div>
      <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>No questions yet</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Questions for this chapter are coming soon.</div>
      <button onClick={onBack} style={{ marginTop: 12, background: 'var(--accent-navy)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
        Back
      </button>
    </div>
  );

  const answered = Object.keys(answers).length;

  // ── Main Test UI ──
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-navy-subtle)', border: '2px solid var(--accent-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 7, fontWeight: 800, color: 'var(--accent-navy)', textAlign: 'center', lineHeight: 1.2 }}>IMU<br/>PILOT</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent-navy)' }}>IMUpilot</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{subject.label} · {chapter.name}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Timer */}
          <div style={{ background: timeRemaining < 300 ? 'var(--accent-danger)' : 'var(--accent-navy)', color: '#fff', fontWeight: 800, fontSize: 18, padding: '6px 18px', borderRadius: 10, letterSpacing: 1, fontFamily: 'monospace' }}>
            {formatTime(timeRemaining)}
          </div>
          {/* Submit */}
          <button onClick={() => setShowSubmitConfirm(true)} style={{ background: 'var(--accent-success)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Submit Exam
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

        {/* Question card */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

            {/* Question header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: subject.color, color: '#fff', fontWeight: 700, fontSize: 11, padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {subject.label}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Question {currentIndex + 1} of {questions.length}</span>
              </div>
            </div>

            {/* Question text */}
            <div style={{ padding: '24px 24px 16px' }}>
              <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: 24, fontWeight: 500 }}>
                <MathText text={currentQ?.question_text || ''} />
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['option_a','option_b','option_c','option_d'].map((opt, i) => {
                  const label = ['A','B','C','D'][i];
                  const isSelected = answers[currentIndex] === opt;
                  return (
                    <div key={opt} onClick={() => handleAnswer(opt)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `2px solid ${isSelected ? subject.color : 'var(--border-subtle)'}`, background: isSelected ? subject.bg : 'var(--bg-tertiary)', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-elevated)'; } }}
                      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; } }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${isSelected ? subject.color : 'var(--border-subtle)'}`, background: isSelected ? subject.color : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: isSelected ? '#fff' : 'var(--text-secondary)', flexShrink: 0, transition: 'all 0.15s' }}>
                        {label}
                      </div>
                      <span style={{ fontSize: 14, color: isSelected ? 'var(--text-primary)' : 'var(--text-primary)', fontWeight: isSelected ? 600 : 400 }}>
                        <MathText text={currentQ?.[opt] || ''} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom nav */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => { if (currentIndex > 0) setCurrentIndex(i => i - 1); }}
                disabled={currentIndex === 0}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', border: '1px solid var(--border-subtle)', borderRadius: 10, background: 'var(--bg-elevated)', cursor: currentIndex === 0 ? 'default' : 'pointer', opacity: currentIndex === 0 ? 0.4 : 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                ← Previous
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={handleClear}
                  style={{ padding: '9px 16px', border: '1px solid var(--accent-danger-subtle)', borderRadius: 10, background: 'var(--accent-danger-subtle)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--accent-danger)', fontFamily: 'inherit' }}>
                  ✕ Clear
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{answered} answered · {questions.length - answered} remaining</span>
              </div>

              <button onClick={() => { if (currentIndex < questions.length - 1) setCurrentIndex(i => i + 1); else setShowSubmitConfirm(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', border: 'none', borderRadius: 10, background: 'var(--accent-navy)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit' }}>
                {currentIndex < questions.length - 1 ? 'Next →' : 'Submit →'}
              </button>
            </div>
          </div>
        </div>

        {/* Right palette */}
        <div style={{ width: 220, background: 'var(--bg-elevated)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>Question Palette</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Answered: {answered} / {questions.length}</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {questions.map((_, i) => {
                const isAnswered = !!answers[i];
                const isCurrent = currentIndex === i;
                return (
                  <div key={i} onClick={() => setCurrentIndex(i)}
                    style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                      background: isCurrent ? subject.color : isAnswered ? 'var(--accent-success-subtle)' : 'var(--bg-tertiary)',
                      color: isCurrent ? '#fff' : isAnswered ? 'var(--accent-success)' : 'var(--text-secondary)',
                      border: isCurrent ? `2px solid ${subject.color}` : isAnswered ? '2px solid var(--accent-success)' : '2px solid var(--border-subtle)',
                      boxShadow: isCurrent ? `0 0 0 3px ${subject.color}33` : 'none',
                    }}>
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--text-secondary)' }}>
            {[
              { color: subject.color, label: 'Current' },
              { color: 'var(--accent-success-subtle)', border: 'var(--accent-success)', textColor: 'var(--accent-success)', label: 'Answered' },
              { color: 'var(--bg-tertiary)', border: 'var(--border-subtle)', textColor: 'var(--text-secondary)', label: 'Not answered' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color, border: `1px solid ${l.border || l.color}`, flexShrink: 0 }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SectionalTestEngine() {
  const [view, setView] = useState('subjects'); // subjects | chapters | test
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  if (view === 'subjects') return (
    <SubjectSelect onSelect={sub => { setSelectedSubject(sub); setView('chapters'); }} />
  );

  if (view === 'chapters') return (
    <ChapterSelect
      subject={selectedSubject}
      onSelect={ch => { setSelectedChapter(ch); setView('test'); }}
      onBack={() => setView('subjects')}
    />
  );

  return (
    <TestEngine
      subject={selectedSubject}
      chapter={selectedChapter}
      onBack={() => { setView('subjects'); setSelectedSubject(null); setSelectedChapter(null); }}
    />
  );
}
