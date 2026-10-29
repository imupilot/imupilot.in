import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertTriangle, ShieldAlert, Maximize2 } from 'lucide-react';
import MathText from '../components/MathText';
import { supabase } from '../supabaseClient';
import { LogoIcon } from '../components/Icons';

export default function MockTestEngine() {
  const navigate = useNavigate();
  const location = useLocation();

  const testId = Number(location.state?.testId || location.state?.setNumber || 1);
  const testTitle = location.state?.testTitle || `IMUCET Full Mock ${testId}`;

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState({});
  const [apiError, setApiError] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [studentDetails, setStudentDetails] = useState({ name: 'Guest Student', phone: '9876543210', email: '' });
  const [timeRemaining, setTimeRemaining] = useState(180 * 60);
  const [startTime, setStartTime] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [testStage, setTestStage] = useState('instructions');
  const [attemptToken, setAttemptToken] = useState(null);
  const [activeSetNumber, setActiveSetNumber] = useState(testId || 1);

  // Anti-cheat proctoring state
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warningModal, setWarningModal] = useState({ open: false, count: 0, reason: '' });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lastViolationTimeRef = useRef(0);
  const isSubmittingRef = useRef(false);
  const showSubmitConfirmRef = useRef(false);
  const handleSubmitRef = useRef();

  const sections = [
    { id: 'English',          title: 'PART-A', sub: 'English',           count: (questions['English'] || []).length || 40 },
    { id: 'General Aptitude', title: 'PART-B', sub: 'General\nAptitude', count: (questions['General Aptitude'] || []).length || 40 },
    { id: 'Mathematics',      title: 'PART-C', sub: 'Mathematics',        count: (questions['Mathematics'] || []).length || 50 },
    { id: 'Physics',          title: 'PART-D', sub: 'Physics',            count: (questions['Physics'] || []).length || 50 },
    { id: 'Chemistry',        title: 'PART-E', sub: 'Chemistry',          count: (questions['Chemistry'] || []).length || 20 },
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
    async function initTest() {
      try {
        setLoading(true);
        // First get published set numbers
        const { data: publishedSets } = await supabase
          .from("mock_test_sets")
          .select("set_number")
          .eq("published", true);

        if (!publishedSets?.length) {
          setApiError(true);
          setLoading(false);
          return;
        }

        const matchingSet = (testId >= 1 && testId <= 19)
          ? publishedSets.find((s) => s.set_number === Number(testId))
          : null;
        const randomSet = publishedSets[Math.floor(Math.random() * publishedSets.length)];
        const setNumber = matchingSet ? matchingSet.set_number : randomSet.set_number;
        setActiveSetNumber(setNumber);

        const { data: rows, error } = await supabase
          .from("mock_questions")
          .select("*")
          .eq("set_number", setNumber);

        if (error || !rows || rows.length === 0) {
          console.error("Supabase mock_questions error:", error);
          setApiError(true);
          setLoading(false);
          return;
        }

        // Canonical subject normalizer to handle variations like "English Language", "General Knowledge"
        const normalizeSubject = (subj) => {
          if (!subj) return 'English';
          const s = subj.trim();
          const lower = s.toLowerCase();
          if (lower.includes('english')) return 'English';
          if (lower.includes('aptitude') || lower.includes('knowledge') || lower.includes('gk') || lower.includes('reasoning')) return 'General Aptitude';
          if (lower.includes('math')) return 'Mathematics';
          if (lower.includes('physic')) return 'Physics';
          if (lower.includes('chem')) return 'Chemistry';
          return 'English';
        };

        const grouped = {
          'English': [],
          'General Aptitude': [],
          'Mathematics': [],
          'Physics': [],
          'Chemistry': []
        };

        rows.forEach(q => {
          const norm = normalizeSubject(q.subject);
          if (grouped[norm]) {
            grouped[norm].push(q);
          } else {
            grouped['General Aptitude'].push(q);
          }
        });

        setQuestions(grouped);
        setAttemptToken(`local-${setNumber}-${Date.now()}`);
        setLoading(false);
      } catch (err) {
        console.error('initTest exception:', err);
        setApiError(true);
        setLoading(false);
      }
    }
    initTest();
  }, [testId]);

  // Request fullscreen mode safely
  const requestFullscreenMode = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed or was dismissed:', err);
    }
  };

  // Triggered when candidate clicks "Start Test" on verify screen
  const handleStartTest = async () => {
    await requestFullscreenMode();
    setTestStage('test');
  };

  // Resume exam and return to fullscreen on warning dismissal
  const resumeExam = async () => {
    if (warningModal.count < 3) {
      setWarningModal({ open: false, count: 0, reason: '' });
      await requestFullscreenMode();
    }
  };

  // Anti-cheat violation detector with 2.5s debounce to prevent duplicate triggers
  const triggerViolation = useCallback((reason = 'tab_switch') => {
    if (testStage !== 'test' || isSubmittingRef.current || showSubmitConfirmRef.current) return;

    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2500) {
      return;
    }
    lastViolationTimeRef.current = now;

    setTabSwitchCount(prev => {
      const nextCount = prev + 1;
      const violationReason = reason === 'fullscreen_exit' ? 'Exited Full-Screen Mode' : 'Switched Tab / Window';

      if (nextCount >= 3) {
        setWarningModal({
          open: true,
          count: 3,
          reason: violationReason,
        });

        // Auto submit exam after 1.2s delay so candidate sees notice
        setTimeout(() => {
          if (handleSubmitRef.current) {
            handleSubmitRef.current(true);
          }
        }, 1200);
      } else {
        setWarningModal({
          open: true,
          count: nextCount,
          reason: violationReason,
        });
      }
      return nextCount;
    });
  }, [testStage]);

  // Anti-tab-switch & fullscreen monitoring listeners
  useEffect(() => {
    if (testStage !== 'test') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('tab_switch');
      }
    };

    const handleBlur = () => {
      triggerViolation('tab_switch');
    };

    const handleFullscreenChange = () => {
      const fs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(fs);
      if (!fs && !isSubmittingRef.current && !showSubmitConfirmRef.current) {
        triggerViolation('fullscreen_exit');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [testStage, triggerViolation]);

  // Exam countdown timer
  useEffect(() => {
    if (testStage === 'test') {
      setStartTime(Date.now());
      const timer = setInterval(() => setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (handleSubmitRef.current) handleSubmitRef.current(false);
          return 0;
        }
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
    if (currentQuestionIndex < activeSectionQuestions.length - 1) {
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
    let answered = 0, marked = 0;
    const count = activeSectionQuestions.length || activeSecObj.count;
    for (let i = 0; i < count; i++) {
      const k = `${activeSection}-${i}`;
      if (answers[k]) answered++;
      if (markedForReview.has(k)) marked++;
    }
    return { answered, notAnswered: count - answered, marked };
  };

  const handleSubmit = async (autoSubmitted = false) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setShowSubmitConfirm(false);
    setWarningModal({ open: false, count: 0, reason: '' });

    // Exit fullscreen if still active
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (e) {
      console.warn('Failed to exit fullscreen:', e);
    }

    const timeTakenSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 180 * 60 - timeRemaining;
    
    try {
      let correct = 0;
      let incorrect = 0;
      let skipped = 0;

      const allQuestions = [];
      const subjectBreakdown = {};
      const answersByIdMap = {};

      const optionMap = {
        1: 'option_a',
        2: 'option_b',
        3: 'option_c',
        4: 'option_d',
        '1': 'option_a',
        '2': 'option_b',
        '3': 'option_c',
        '4': 'option_d',
      };

      sections.forEach(sec => {
        const secQs = questions[sec.id] || [];
        let secCorrect = 0, secTotal = 0;

        secQs.forEach((q, i) => {
          const key = `${sec.id}-${i}`;
          const selectedOption = answers[key];
          const correctOptionString = optionMap[q.correct_option] || 'option_a';
          const isCorrect = selectedOption && selectedOption === correctOptionString;
          const isSkipped = !selectedOption;

          if (isSkipped) {
            skipped++;
          } else if (isCorrect) {
            correct++;
            secCorrect++;
            secTotal++;
          } else {
            incorrect++;
            secTotal++;
          }

          if (selectedOption) {
            answersByIdMap[q.id] = ['option_a', 'option_b', 'option_c', 'option_d'].indexOf(selectedOption);
          }

          const correctOptionIndex = ['option_a', 'option_b', 'option_c', 'option_d'].indexOf(correctOptionString);

          allQuestions.push({
            id: q.id,
            subject: sec.id,
            topic_tag: q.topic_tag || sec.id,
            difficulty: q.difficulty || 'Medium',
            text: q.question_text,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correctAnswer: correctOptionIndex,
            concept: q.concept,
            solution_steps: q.solution_steps,
            exam_tip: q.exam_tip,
          });
        });

        subjectBreakdown[sec.id] = {
          correct: secCorrect,
          total: secTotal,
          accuracy: secTotal > 0 ? Math.round((secCorrect / secTotal) * 100) : 0,
        };
      });

      const totalAttempted = correct + incorrect;
      const score = correct - (incorrect * 0.25);
      const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;
      const completedAt = new Date().toISOString();
      const result = {
        testId: Number(testId),
        testNumber: Number(testId),
        name: testTitle,
        score: Math.round(score * 100) / 100,
        totalQuestions: allQuestions.length,
        correct,
        incorrect,
        skipped,
        unattempted: skipped,
        accuracy,
        timeTakenSeconds,
        subjectBreakdown,
        questions: allQuestions,
        answers: answersByIdMap,
        completedAt,
        autoSubmitted: autoSubmitted ? 'Tab Switch Limit Exceeded (3/3)' : false,
      };

      // 1. Save last result
      localStorage.setItem('imupilot_last_result', JSON.stringify(result));

      // 2. Save to user history
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = user?.id;
      if (userId) {
        const historyKey = `imupilot_test_history_${userId}`;
        try {
          const storedHistory = localStorage.getItem(historyKey);
          const history = storedHistory ? JSON.parse(storedHistory) : [];
          localStorage.setItem(historyKey, JSON.stringify([result, ...(Array.isArray(history) ? history : [])].slice(0, 50)));
        } catch (error) {
          console.error('Unable to update your dashboard test history.', error);
        }

        // Insert to Supabase test_results
        try {
          await supabase.from('test_results').insert({
            user_id: userId,
            set_number: activeSetNumber || Number(testId) || 1,
            score: Math.round(result.score),
            total_questions: result.totalQuestions,
            correct: result.correct,
            incorrect: result.incorrect,
            unattempted: result.skipped ?? result.unattempted ?? 0,
            time_taken_seconds: result.timeTakenSeconds,
            subject_breakdown: result.subjectBreakdown,
            completed_at: completedAt,
          });
        } catch (dbErr) {
          console.warn('Unable to save test_results to Supabase:', dbErr);
        }
      }

      // 3. Save to global history
      try {
        const storedAll = localStorage.getItem('imupilot_test_history_all');
        const historyAll = storedAll ? JSON.parse(storedAll) : [];
        localStorage.setItem('imupilot_test_history_all', JSON.stringify([result, ...(Array.isArray(historyAll) ? historyAll : [])].slice(0, 50)));
      } catch (e) {}

      navigate('/test/result');
    } catch (err) {
      console.error(err);
      window.alert('Failed to evaluate test. Please try again.');
    }
  };

  // Keep refs synchronized on every render
  handleSubmitRef.current = handleSubmit;
  showSubmitConfirmRef.current = showSubmitConfirm;

  const PreTestHeader = () => (
    <div style={{ backgroundColor: 'var(--bg-elevated)', borderBottom: '2px solid var(--accent-navy)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'flex', color: '#0F172A' }}>
            <LogoIcon />
          </span>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#0F172A', letterSpacing: '-0.03em' }}>IMUPilot</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-navy)' }}>{testTitle}</div>
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
            <p>4. Total time: <b>180 minutes</b>. The test auto-submits when time runs out.</p>
            <p>5. You can navigate between questions and sections freely using the palette on the right.</p>
            <p>6. Use "Mark for Review" to flag questions you want to revisit.</p>
            <p>7. <b style={{ color: 'var(--accent-navy)' }}>Anti-Cheat Proctoring:</b> Starting the test will automatically enter full-screen mode. Switching tabs, minimizing the window, or exiting full-screen is strictly monitored. If done <b>3 times</b>, the test will automatically submit.</p>
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
              <tr><td style={{ color: 'var(--text-secondary)' }}>Duration</td><td style={{ fontWeight: 700, color: 'var(--accent-navy)' }}>180 Minutes</td></tr>
              <tr><td style={{ color: 'var(--text-secondary)' }}>Total Questions</td><td style={{ fontWeight: 700, color: 'var(--accent-navy)' }}>{sections.reduce((sum, sec) => sum + sec.count, 0)}</td></tr>
              <tr><td style={{ color: 'var(--text-secondary)' }}>Proctoring</td><td style={{ fontWeight: 700, color: '#16A34A' }}>Auto Fullscreen & 3-Strike Auto Submit</td></tr>
            </tbody></table>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button onClick={handleStartTest} style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', padding: '11px 48px', fontWeight: 700, fontSize: 14, cursor: 'pointer', borderRadius: 4 }}>Start Test</button>
        </div>
      </div>
      <Footer />
    </div>
  );

  // ── MAIN TEST UI ──────────────────────────────────────────────────────────
  const stats = sectionStats();
  const currentSectionCount = activeSectionQuestions.length || activeSecObj.count;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', height: '100vh', display: 'flex', flexDirection: 'column', fontSize: 13, overflow: 'hidden', position: 'relative' }}>

      {/* TOP HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 14px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, backgroundColor: 'var(--bg-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', color: 'var(--accent-navy, #0F172A)' }}>
            <LogoIcon />
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--accent-navy)', lineHeight: 1 }}>IMUPilot</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>UG Technical Courses (B.Tech, B.Sc., DNS)</div>
          </div>
        </div>

        {/* Zoom & Fullscreen buttons */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', borderRadius: 14, padding: '4px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Zoom (+)</button>
          <button style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', borderRadius: 14, padding: '4px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Zoom (-)</button>
          {!isFullscreen && (
            <button onClick={requestFullscreenMode}
              title="Re-enter Full-Screen Mode"
              style={{ backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: 14, padding: '4px 12px', fontWeight: 700, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Maximize2 size={12} /> Fullscreen
            </button>
          )}
        </div>

        {/* Roll no center */}
        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)', textAlign: 'center' }}>
          Hallticket Number: {studentDetails.phone} [{studentDetails.name}]
        </div>

        {/* Anti-cheat tab switches counter badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          backgroundColor: tabSwitchCount >= 2 ? '#FEF2F2' : tabSwitchCount === 1 ? '#FFFBEB' : '#F0FDF4',
          border: `1px solid ${tabSwitchCount >= 2 ? '#F87171' : tabSwitchCount === 1 ? '#FCD34D' : '#86EFAC'}`,
          padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
          color: tabSwitchCount >= 2 ? '#B91C1C' : tabSwitchCount === 1 ? '#B45309' : '#15803D'
        }}>
          <span>🛡️ Tab Switches: {tabSwitchCount}/3</span>
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
            <button onClick={handleNext} disabled={currentQuestionIndex === currentSectionCount - 1}
              style={{ backgroundColor: 'var(--accent-navy)', color: '#fff', border: 'none', padding: '5px 16px', fontWeight: 700, fontSize: 12, cursor: currentQuestionIndex === currentSectionCount - 1 ? 'default' : 'pointer', opacity: currentQuestionIndex === currentSectionCount - 1 ? 0.5 : 1, borderRadius: 3 }}>
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
            {Array.from({ length: currentSectionCount }).map((_, i) => (
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

      {/* CONFIRM SUBMIT MODAL */}
      {showSubmitConfirm && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99998, padding: 16
        }}>
          <div style={{
            backgroundColor: 'var(--bg-elevated, #fff)', borderRadius: 10, maxWidth: 460, width: '100%',
            padding: 26, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Submit Mock Test?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Are you sure you want to finish and submit your exam? You cannot modify answers after submission.
            </p>

            <div style={{ backgroundColor: 'var(--bg-tertiary, #f8fafc)', borderRadius: 8, padding: '14px 18px', marginBottom: 20, textAlign: 'left', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Questions Answered:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-success, #16A34A)' }}>{Object.keys(answers).length} / {sections.reduce((sum, sec) => sum + sec.count, 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Unanswered:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-danger, #DC2626)' }}>{sections.reduce((sum, sec) => sum + sec.count, 0) - Object.keys(answers).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Marked for Review:</span>
                <span style={{ fontWeight: 700, color: '#D97706' }}>{markedForReview.size}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                style={{
                  padding: '9px 20px', borderRadius: 6, border: '1px solid var(--border-subtle)',
                  backgroundColor: 'transparent', color: 'var(--text-primary)', fontWeight: 600,
                  fontSize: 13, cursor: 'pointer'
                }}>
                Keep Reviewing
              </button>
              <button
                onClick={() => handleSubmit(false)}
                style={{
                  padding: '9px 24px', borderRadius: 6, border: 'none',
                  backgroundColor: 'var(--accent-danger, #DC2626)', color: '#fff', fontWeight: 700,
                  fontSize: 13, cursor: 'pointer'
                }}>
                Yes, Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANTI-CHEAT TAB SWITCH / FULLSCREEN WARNING MODAL */}
      {warningModal.open && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: 16
        }}>
          <div style={{
            backgroundColor: 'var(--bg-elevated, #fff)', borderRadius: 12, maxWidth: 490, width: '100%',
            padding: 30, textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: warningModal.count >= 3 ? '2px solid #EF4444' : warningModal.count === 2 ? '2px solid #F97316' : '2px solid #F59E0B'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              {warningModal.count >= 3 ? (
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={36} color="#DC2626" />
                </div>
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: warningModal.count === 2 ? '#FFEDD5' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={36} color={warningModal.count === 2 ? '#EA580C' : '#D97706'} />
                </div>
              )}
            </div>

            <div style={{
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: 14,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 12,
              backgroundColor: warningModal.count >= 3 ? '#FEE2E2' : warningModal.count === 2 ? '#FFEDD5' : '#FEF3C7',
              color: warningModal.count >= 3 ? '#DC2626' : warningModal.count === 2 ? '#C2410C' : '#B45309'
            }}>
              {warningModal.count >= 3 ? 'Exam Auto-Submitted' : warningModal.count === 2 ? 'Final Warning: 2 of 3' : 'Security Warning: 1 of 3'}
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
              {warningModal.count >= 3
                ? 'Maximum Violations Reached'
                : `${warningModal.reason || 'Tab Switch Detected'}`}
            </h3>

            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 22 }}>
              {warningModal.count >= 3 ? (
                <>
                  You have switched tabs, minimized the window, or exited fullscreen <b>3 times</b>.
                  <br />In accordance with exam rules, your test has been <b>automatically submitted</b>.
                </>
              ) : warningModal.count === 2 ? (
                <>
                  You have navigated away or exited fullscreen <b>2 times</b>.
                  <br />
                  <b style={{ color: '#DC2626' }}>This is your FINAL warning.</b> If you switch tabs or leave fullscreen once more, your test will be instantly auto-submitted!
                </>
              ) : (
                <>
                  Leaving the exam window, switching tabs, or exiting full-screen mode is strictly prohibited.
                  <br />
                  You have <b>2 warnings remaining</b> before your test is automatically submitted.
                </>
              )}
            </p>

            {warningModal.count >= 3 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#DC2626', fontWeight: 700, fontSize: 14 }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Auto-submitting test and compiling your results...</span>
              </div>
            ) : (
              <button
                onClick={resumeExam}
                style={{
                  backgroundColor: 'var(--accent-navy, #0F172A)',
                  color: '#fff',
                  border: 'none',
                  padding: '11px 28px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                <Maximize2 size={16} />
                <span>Return to Exam & Resume Fullscreen</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
