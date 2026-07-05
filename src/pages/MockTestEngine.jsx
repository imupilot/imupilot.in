import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import MathText from '../components/MathText';

export default function MockTestEngine() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState({});
  const [apiError, setApiError] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [studentDetails, setStudentDetails] = useState({ name: 'Guest Student', phone: '9876543210', email: '' });
  const [timeRemaining, setTimeRemaining] = useState(179 * 60);
  const [startTime, setStartTime] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [testStage, setTestStage] = useState('instructions');

  const sections = [
    { id: 'English',          title: 'PART-A', sub: 'English',           count: 40 },
    { id: 'General Aptitude', title: 'PART-B', sub: 'General\nAptitude', count: 40 },
    { id: 'Mathematics',      title: 'PART-C', sub: 'Mathematics',        count: 50 },
    { id: 'Physics',          title: 'PART-D', sub: 'Physics',            count: 50 },
    { id: 'Chemistry',        title: 'PART-E', sub: 'Chemistry',          count: 20 },
  ];

  const [activeSection, setActiveSection] = useState('English');
  const activeSecObj = sections.find(s => s.id === activeSection) || sections[0];

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setStudentDetails({ name: u.name || 'Guest Student', phone: u.phone || '9876543210', email: u.email || '' });
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/questions')
      .then(r => r.json())
      .then(data => {
        const grouped = {};
        data.questions.forEach(q => {
          const section = q.subject === 'General Aptitude' ? 'General Aptitude' : q.subject;
          if (!grouped[section]) grouped[section] = [];
          grouped[section].push(q);
        });
        setQuestions(grouped);
      })
      .catch(() => setApiError(true));
  }, []);

  useEffect(() => {
    if (testStage === 'test') {
      setStartTime(Date.now());
      const timer = setInterval(() => setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      }), 1000);
      return () => clearInterval(timer);
    }
  }, [testStage]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const activeSectionQuestions = questions[activeSection] || [];
  const currentQ = activeSectionQuestions[currentQuestionIndex] || {
    question_text: 'Loading Question...', option_a: 'A', option_b: 'B', option_c: 'C', option_d: 'D'
  };
  const qKey = `${activeSection}-${currentQuestionIndex}`;

  const handleOptionChange = (option) => setAnswers({ ...answers, [qKey]: option });
  const handleNext = () => {
    if (currentQuestionIndex < activeSecObj.count - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      // Move to next section
      const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
      if (currentSectionIndex < sections.length - 1) {
        setActiveSection(sections[currentSectionIndex + 1].id);
        setCurrentQuestionIndex(0);
      }
    }
  };
  const handlePrev = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(i => i - 1); };
  const handleMark = () => {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(qKey)) newMarked.delete(qKey); else newMarked.add(qKey);
    setMarkedForReview(newMarked);
  };

  const getQuestionColor = (secId, i) => {
    const key = `${secId}-${i}`;
    if (markedForReview.has(key) && answers[key]) return '#ffaa00';
    if (markedForReview.has(key)) return '#ff6600';
    if (answers[key]) return '#008000';
    return '#1B3A6B';
  };

  // Section stats for the active section
  const sectionStats = () => {
    const secQs = questions[activeSection] || [];
    let answered = 0, marked = 0;
    for (let i = 0; i < activeSecObj.count; i++) {
      const k = `${activeSection}-${i}`;
      if (answers[k]) answered++;
      if (markedForReview.has(k)) marked++;
    }
    return { answered, notAnswered: activeSecObj.count - answered, marked };
  };

  const handleSubmit = () => {
    const timeTakenSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 179 * 60 - timeRemaining;
    let correct = 0, incorrect = 0, skipped = 0;
    const allQuestions = [];
    const subjectBreakdown = {};
    const answersById = {};

    sections.forEach(sec => {
      const secQs = questions[sec.id] || [];
      let secCorrect = 0, secTotal = 0;
      secQs.forEach((q, i) => {
        const key = `${sec.id}-${i}`;
        const selectedOption = answers[key];
        const correctOption = q.correct_option;
        const selectedLetter = selectedOption ? selectedOption.replace('option_', '') : null;
        const isCorrect = selectedLetter && selectedLetter === correctOption;
        const isSkipped = !selectedOption;
        if (isCorrect) { correct++; secCorrect++; }
        else if (isSkipped) skipped++;
        else incorrect++;
        if (!isSkipped) secTotal++;
        if (selectedOption) answersById[q.id] = ['a','b','c','d'].indexOf(selectedOption.replace('option_', ''));
        allQuestions.push({
          id: q.id, subject: sec.id, topic_tag: q.topic_tag || sec.id, difficulty: q.difficulty || 'Medium',
          text: q.question_text, options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correctAnswer: ['a','b','c','d'].indexOf(correctOption),
          concept: q.concept, solution_steps: q.solution_steps, exam_tip: q.exam_tip,
        });
      });
      subjectBreakdown[sec.id] = { correct: secCorrect, total: secTotal, accuracy: secTotal > 0 ? Math.round((secCorrect / secTotal) * 100) : 0 };
    });

    const totalAttempted = correct + incorrect;
    const score = correct - (incorrect * 0.25);
    const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;
    localStorage.setItem('imupilot_last_result', JSON.stringify({
      score: Math.round(score * 100) / 100, totalQuestions: allQuestions.length,
      correct, incorrect, skipped, accuracy, timeTakenSeconds, subjectBreakdown,
      questions: allQuestions, answers: answersById,
    }));
    navigate('/test/result');
  };

  const PreTestHeader = () => (
    <div style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '2px solid var(--accent-navy)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--accent-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--accent-navy-subtle)' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent-navy)', textAlign: 'center', lineHeight: 1.2 }}>IMU<br/>PILOT</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent-navy)' }}>IMUpilot</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-navy)' }}>IMUCET Mock Test</div>
        <div style={{ width: 80 }} />
      </div>
      <div style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', padding: '5px 20px', fontSize: '12px', fontWeight: 600, display: 'flex', gap: 20 }}>
        <span>Roll No: {studentDetails.phone}</span><span>|</span><span>Name: {studentDetails.name}</span>
      </div>
    </div>
  );

  const Footer = () => (
    <div style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', padding: '5px', textAlign: 'center', fontSize: '11px', fontWeight: 600, position: 'fixed', bottom: 0, left: 0, right: 0 }}>
      © IMUpilot 2026 — India's First Complete IMUCET Preparation Platform
    </div>
  );

  // Submit confirm
  if (showSubmitConfirm) {
    const answered = Object.keys(answers).length;
    const total = sections.reduce((s, sec) => s + sec.count, 0);
    return (
      <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <PreTestHeader />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 32, maxWidth: 480, width: '100%', textAlign: 'center', background: 'var(--bg-elevated)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent-navy)', marginBottom: 8 }}>Submit Test?</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
              Answered: <b style={{ color: 'var(--accent-success)' }}>{answered}</b> &nbsp;|&nbsp; Unanswered: <b style={{ color: 'var(--accent-danger)' }}>{total - answered}</b>
              <br />Once submitted, answers cannot be changed.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setShowSubmitConfirm(false)} style={{ padding: '10px 28px', border: '1px solid var(--border-subtle)', borderRadius: 6, background: 'var(--bg-elevated)', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Go Back</button>
              <button onClick={handleSubmit} style={{ padding: '10px 28px', border: 'none', borderRadius: 6, background: 'var(--accent-danger)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Yes, Submit</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <PreTestHeader />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} style={{ color: 'var(--accent-navy)', animation: 'spin 1s linear infinite' }} />
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (testStage === 'instructions') return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: 60 }}>
      <PreTestHeader />
      <div style={{ padding: 30, maxWidth: 800, margin: '0 auto' }}>
        <div style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', padding: 24, borderRadius: 4 }}>
          <div style={{ display: 'inline-block', backgroundColor: 'var(--bg-tertiary)', fontWeight: 'bold', padding: '4px 15px', fontSize: 12, border: '1px solid var(--border-subtle)', borderBottom: 'none', marginLeft: -24, marginTop: -24, marginBottom: 16, borderTopRightRadius: 8, color: 'var(--text-primary)' }}>
            Instructions, Terms & Conditions
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)' }}>
            <p>1. This Question Paper contains <b style={{ color: 'var(--accent-navy)' }}>200</b> questions comprising the following sections:</p>
            <table style={{ marginLeft: 20, width: 360, marginBottom: 16 }}>
              <tbody>{sections.map(s => (
                <tr key={s.id}><td style={{ paddingRight: 8 }}>{s.title}</td><td>:</td><td style={{ color: 'var(--accent-navy)', paddingLeft: 8 }}>{s.id}</td><td style={{ paddingLeft: 8, color: 'var(--text-secondary)' }}>({s.count} questions)</td></tr>
              ))}</tbody>
            </table>
            <p>2. All questions are objective type with four options. Only one correct answer.</p>
            <p>3. Each correct answer carries <b style={{ color: 'var(--accent-navy)' }}>+1</b> mark. Each wrong answer carries <b style={{ color: 'var(--accent-danger)' }}>−0.25</b> marks.</p>
            <p>4. Total time: <b>179 minutes</b>. The test auto-submits when time runs out.</p>
            <p>5. You can navigate between questions and sections freely using the palette on the right.</p>
            <p>6. Use "Mark for Review" to flag questions you want to revisit.</p>
            <p style={{ textAlign: 'center', marginTop: 28, fontWeight: 700, color: 'var(--accent-navy)' }}>Best of Luck!</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => setTestStage('symbols')} style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', padding: '10px 30px', fontWeight: 700, fontSize: 13, cursor: 'pointer', borderRadius: 4 }}>Proceed →</button>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (testStage === 'symbols') return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: 60 }}>
      <PreTestHeader />
      <div style={{ padding: 30, maxWidth: 700, margin: '0 auto', color: 'var(--text-primary)' }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent-navy)', marginBottom: 20 }}>Question Palette Legend</div>
        {[['var(--accent-navy)','Not attempted'],['#008000','Answered'],['#ff6600','Marked for review (not answered)'],['#ffaa00','Answered and marked for review']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 36, height: 22, backgroundColor: c, borderRadius: 3, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>1</div>
            <span style={{ fontSize: 13 }}>{l}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button onClick={() => setTestStage('instructions')} style={{ backgroundColor: 'var(--text-secondary)', color: '#fff', border: 'none', padding: '9px 24px', fontWeight: 600, fontSize: 13, cursor: 'pointer', borderRadius: 4 }}>← Back</button>
          <button onClick={() => setTestStage('verify')} style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', padding: '9px 24px', fontWeight: 700, fontSize: 13, cursor: 'pointer', borderRadius: 4 }}>Proceed →</button>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (testStage === 'verify') return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: 60 }}>
      <PreTestHeader />
      <div style={{ padding: 30, maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-navy)', marginBottom: 20 }}>Please verify your details before starting the test.</div>
        <div style={{ border: '1px solid var(--border-subtle)', display: 'inline-block', textAlign: 'left', minWidth: 500, borderRadius: 4, background: 'var(--bg-elevated)' }}>
          <div style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', fontWeight: 700, padding: '8px 16px', fontSize: 13 }}>Candidate Details</div>
          <div style={{ padding: '20px 24px', fontSize: 13, lineHeight: 2 }}>
            <table><tbody>
              <tr><td style={{ paddingRight: 16, color: 'var(--text-secondary)' }}>Name</td><td style={{ fontWeight: 700, color: 'var(--accent-navy)' }}>{studentDetails.name}</td></tr>
              <tr><td style={{ color: 'var(--text-secondary)' }}>Roll No.</td><td style={{ fontWeight: 700, color: 'var(--accent-navy)' }}>{studentDetails.phone}</td></tr>
              <tr><td style={{ color: 'var(--text-secondary)' }}>Course</td><td style={{ fontWeight: 700, color: 'var(--accent-navy)' }}>UG Technical Courses (B.Tech / B.Sc. / DNS)</td></tr>
              <tr><td style={{ color: 'var(--text-secondary)' }}>Duration</td><td style={{ fontWeight: 700, color: 'var(--accent-navy)' }}>179 Minutes</td></tr>
              <tr><td style={{ color: 'var(--text-secondary)' }}>Total Questions</td><td style={{ fontWeight: 700, color: 'var(--accent-navy)' }}>200</td></tr>
            </tbody></table>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button onClick={() => setTestStage('test')} style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', padding: '11px 48px', fontWeight: 700, fontSize: 14, cursor: 'pointer', borderRadius: 4 }}>Start Test</button>
        </div>
      </div>
      <Footer />
    </div>
  );

  // ── MAIN TEST UI ──────────────────────────────────────────────────────────
  const stats = sectionStats();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', height: '100vh', display: 'flex', flexDirection: 'column', fontSize: 13, overflow: 'hidden' }}>

      {/* TOP HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 14px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, backgroundColor: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--accent-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--accent-navy-subtle)' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: 'var(--accent-navy)', textAlign: 'center', lineHeight: 1.2 }}>IMU<br/>PILOT</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent-navy)', lineHeight: 1 }}>IMUpilot</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>UG Technical Courses (B.Tech, B.Sc., DNS)</div>
          </div>
        </div>

        {/* Zoom buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', borderRadius: 14, padding: '4px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Zoom (+)</button>
          <button style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', borderRadius: 14, padding: '4px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Zoom (-)</button>
        </div>

        {/* Roll no center */}
        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', textAlign: 'center' }}>
          Hallticket Number: {studentDetails.phone} [{studentDetails.name}]
        </div>

        {/* Timer + submit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>Time Left</div>
            <div style={{ backgroundColor: 'var(--accent-warning-subtle)', color: 'var(--accent-danger)', fontWeight: 700, fontSize: 16, padding: '2px 10px', letterSpacing: 1, border: '1px solid var(--border-subtle)' }}>
              {formatTime(timeRemaining)}
            </div>
          </div>
          <button onClick={() => setShowSubmitConfirm(true)}
            style={{ backgroundColor: 'var(--accent-danger)', color: '#fff', border: 'none', padding: '7px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer', borderRadius: 4 }}>
            Submit
          </button>
        </div>
      </div>

      {/* SECTION TABS + CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 14px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, backgroundColor: 'var(--bg-tertiary)' }}>
        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {sections.map(sec => (
            <div key={sec.id} onClick={() => { setActiveSection(sec.id); setCurrentQuestionIndex(0); }}
              style={{ textAlign: 'center', cursor: 'pointer', minWidth: 70 }}>
              <div style={{
                backgroundColor: activeSection === sec.id ? 'var(--accent-success)' : 'var(--accent-navy)',
                color: '#fff', fontWeight: 700, padding: '4px 6px', fontSize: 11,
                borderRadius: '3px 3px 0 0', border: activeSection === sec.id ? '2px solid var(--accent-success)' : 'none'
              }}>
                {sec.title}
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, marginTop: 2, whiteSpace: 'pre-line', lineHeight: 1.2, color: 'var(--text-primary)' }}>
                {sec.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Question answered count */}
        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--accent-danger)' }}>
          Total Questions answered: <span style={{ color: 'var(--accent-danger)' }}>{Object.keys(answers).length}</span>
        </div>
      </div>

      {/* MAIN AREA — question left, palette right */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT — Question area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-elevated)' }}>

          {/* Nav buttons bar */}
          <div style={{ display: 'flex', gap: 8, padding: '6px 14px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--accent-navy)', marginRight: 8 }}>
              Question : {currentQuestionIndex + 1}
            </span>
            <button onClick={handleMark}
              style={{ backgroundColor: markedForReview.has(qKey) ? 'var(--accent-primary)' : 'var(--accent-navy)', color: '#fff', border: 'none', padding: '5px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer', borderRadius: 3 }}>
              {markedForReview.has(qKey) ? 'Unmark Review' : 'Mark for Review'}
            </button>
            <button onClick={handlePrev} disabled={currentQuestionIndex === 0}
              style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', padding: '5px 16px', fontWeight: 700, fontSize: 12, cursor: currentQuestionIndex === 0 ? 'default' : 'pointer', opacity: currentQuestionIndex === 0 ? 0.5 : 1, borderRadius: 3 }}>
              Previous
            </button>
            <button onClick={handleNext} disabled={currentQuestionIndex === activeSecObj.count - 1}
              style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', padding: '5px 16px', fontWeight: 700, fontSize: 12, cursor: currentQuestionIndex === activeSecObj.count - 1 ? 'default' : 'pointer', opacity: currentQuestionIndex === activeSecObj.count - 1 ? 0.5 : 1, borderRadius: 3 }}>
              Save & Next
            </button>
          </div>

          {/* Question content */}
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            {/* Watermark */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', opacity: 0.04 }}>
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} style={{ fontSize: 22, fontWeight: 900, color: '#000', transform: 'rotate(-20deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', letterSpacing: 2 }}>
                  IMUPILOT.IN
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 20px', position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 14, marginBottom: 20, lineHeight: 1.8, color: 'var(--text-primary)' }}>
                <MathText text={currentQ.text || currentQ.question_text} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey, idx) => {
                  const label = ['A', 'B', 'C', 'D'][idx];
                  const isSelected = answers[qKey] === optKey;
                  return (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer', border: `1px solid ${isSelected ? 'var(--accent-navy)' : 'var(--border-subtle)'}`, backgroundColor: isSelected ? 'var(--accent-navy-subtle)' : 'var(--bg-elevated)', transition: 'all 0.1s' }}>
                      <input type="radio" name={`q-${qKey}`} checked={isSelected} onChange={() => handleOptionChange(optKey)} style={{ margin: '0 10px 0 0', accentColor: 'var(--accent-navy)' }} />
                      <span style={{ fontSize: 13, color: isSelected ? 'var(--accent-navy)' : 'var(--text-primary)', fontWeight: isSelected ? 700 : 400 }}>
                        <MathText text={currentQ[optKey] || `Option ${label}`} />
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Palette + stats */}
        <div style={{ width: 240, borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', flexShrink: 0, backgroundColor: 'var(--bg-tertiary)' }}>

          {/* Section label */}
          <div style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', fontWeight: 700, textAlign: 'center', padding: '6px 0', fontSize: 12 }}>
            {activeSection}
          </div>

          {/* Number palette */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: 10, justifyContent: 'center', overflowY: 'auto', flex: 1 }}>
            {Array.from({ length: activeSecObj.count }).map((_, i) => (
              <div key={i} onClick={() => setCurrentQuestionIndex(i)}
                style={{
                  width: 34, height: 26,
                  backgroundColor: getQuestionColor(activeSection, i),
                  color: '#fff', fontWeight: 700, fontSize: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', borderRadius: 3,
                  border: currentQuestionIndex === i ? '3px solid #FFD700' : '1px solid transparent', boxShadow: currentQuestionIndex === i ? '0 0 0 1px #FFD700' : 'none',
                }}>
                {i + 1}
              </div>
            ))}
          </div>

          {/* Section analysis */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '10px 12px', fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-navy)', marginBottom: 8, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {activeSecObj.title} Analysis
            </div>
            {[
              { label: 'Answered', value: stats.answered, color: 'var(--accent-primary)' },
              { label: 'Not Answered', value: stats.notAnswered, color: 'var(--accent-primary)' },
              { label: 'Mark for Review', value: stats.marked, color: 'var(--accent-primary)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{row.label}</span>
                <span style={{ fontWeight: 700, color: row.color, fontSize: 13 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Palette legend */}
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle)', fontSize: 9, color: 'var(--text-secondary)' }}>
            {[['var(--accent-navy)','Not attempted'],['#008000','Answered'],['#ff6600','Marked'],['#ffaa00','Ans+Marked']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <div style={{ width: 12, height: 10, backgroundColor: c, borderRadius: 1, flexShrink: 0 }} />
                <span>{l}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', padding: '4px', textAlign: 'center', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
        © IMUpilot 2026 — India's First Complete IMUCET Preparation Platform
      </div>

    </div>
  );
}
