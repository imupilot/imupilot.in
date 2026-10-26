import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, FileText, BarChart3, ChevronDown, ChevronUp, CheckCircle, RotateCcw, Lock } from 'lucide-react';
import IMUpilotSidebar from '../components/IMUpilotSidebar';
import { supabase } from '../supabaseClient';
import { isPro } from '../utils/planUtils';

const mockTests = Array.from({ length: 19 }, (_, i) => ({
  id: i + 1,
  title: `IMUCET Full Mock ${i + 1}`,
  subtitle: i < 2 ? '2025 Pattern' : i < 6 ? '2024 Pattern' : i < 12 ? '2023 Pattern' : '2022 Pattern',
  duration: '3 Hours',
  questions: 200,
}));

export default function MockTests() {
  const navigate = useNavigate();
  const [allAttempts, setAllAttempts] = useState([]);
  const [expandedTestId, setExpandedTestId] = useState(null);
  const [setsData, setSetsData] = useState([]);
  const [profile, setProfile] = useState(null);
  const [lockedMsgId, setLockedMsgId] = useState(null);

  useEffect(() => {
    async function loadPlanAndSets() {
      try {
        let currentUserId = null;
        const { data: authData } = await supabase.auth.getSession();
        if (authData?.session?.user?.id) {
          currentUserId = authData.session.user.id;
        } else {
          const userStr = localStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          if (user?.id) currentUserId = user.id;
        }

        if (currentUserId) {
          const { data: pData } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', currentUserId)
            .single();
          if (pData) setProfile(pData);
        }

        const { data: sData } = await supabase
          .from('mock_test_sets')
          .select('set_number, is_free');
        if (sData && sData.length > 0) {
          setSetsData(sData);
        }
      } catch (e) {
        console.error('Error loading mock sets or profile:', e);
      }
    }
    loadPlanAndSets();
  }, []);

  // Load and merge all test history attempts from localStorage
  const loadTestHistory = () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userKey = user?.id ? `imupilot_test_history_${user.id}` : null;

      const collected = [];

      // 1. Primary user key
      if (userKey) {
        const raw = localStorage.getItem(userKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) collected.push(...parsed);
          } catch (e) {}
        }
      }

      // 2. Global fallback key
      const globalRaw = localStorage.getItem('imupilot_test_history_all');
      if (globalRaw) {
        try {
          const parsed = JSON.parse(globalRaw);
          if (Array.isArray(parsed)) collected.push(...parsed);
        } catch (e) {}
      }

      // 3. Scan all localStorage keys starting with imupilot_test_history
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('imupilot_test_history') && key !== userKey && key !== 'imupilot_test_history_all') {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(data)) collected.push(...data);
          } catch (e) {}
        }
      }

      // 4. Last result fallback
      const lastResRaw = localStorage.getItem('imupilot_last_result');
      if (lastResRaw) {
        try {
          const lastRes = JSON.parse(lastResRaw);
          if (lastRes && lastRes.completedAt) {
            collected.push({
              testId: lastRes.testId || 1,
              testNumber: lastRes.testId || 1,
              name: lastRes.name || 'IMUCET Full Mock 1',
              ...lastRes,
            });
          }
        } catch (e) {}
      }

      // Deduplicate attempts by unique completedAt timestamp
      const seen = new Set();
      const unique = [];
      collected.forEach(att => {
        if (!att) return;
        const key = `${att.completedAt}_${att.score}_${att.testId || att.testNumber}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(att);
        }
      });

      // Sort newest first
      unique.sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
      setAllAttempts(unique);
    } catch (err) {
      console.error('Error loading test history in MockTests:', err);
    }
  };

  useEffect(() => {
    loadTestHistory();
    window.addEventListener('storage', loadTestHistory);
    return () => window.removeEventListener('storage', loadTestHistory);
  }, []);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Find all attempts matching a given mock test
  const getAttemptsForTest = (test) => {
    return allAttempts.filter(att => {
      if (!att) return false;
      const testIdNum = Number(att.testId || att.testNumber);
      if (testIdNum === test.id) return true;

      const name = (att.name || '').toLowerCase();
      if (
        name === test.title.toLowerCase() ||
        name === `imucet full mock ${test.id}`.toLowerCase() ||
        name === `mock #${String(test.id).padStart(2, '0')}`.toLowerCase() ||
        name === `mock ${test.id}`.toLowerCase()
      ) {
        return true;
      }

      // If test is Mock 1 and attempt didn't specify an ID, associate with Mock 1
      if (test.id === 1 && !att.testId && !att.testNumber && att.completedAt) {
        return true;
      }

      return false;
    });
  };

  const handleStartTest = (test) => {
    const setInfo = setsData.find((s) => s.set_number === test.id);
    const isFreeSet = setInfo ? Boolean(setInfo.is_free) : test.id <= 3;
    const isAccessible = isPro(profile) || isFreeSet;
    if (!isAccessible) {
      setLockedMsgId(test.id);
      return;
    }
    navigate('/test/engine', {
      state: {
        testId: test.id,
        setNumber: test.id,
        testTitle: test.title,
      },
    });
  };

  const handleViewAnalysis = (attempt) => {
    try {
      localStorage.setItem('imupilot_last_result', JSON.stringify(attempt));
    } catch (e) {}
    navigate('/test/result');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <IMUpilotSidebar />

      <main style={{ flex: 1, overflowY: 'auto' }}>

        {/* Topbar */}
        <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Mock Tests</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Full-length IMUCET mock tests with real CBT exam interface & anti-cheat proctoring</div>
          </div>
        </div>

        <div style={{ padding: '28px' }}>

          {/* Info banner */}
          <div style={{ background: 'var(--accent-navy)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>Real IMUCET Exam Environment</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                200 questions · 180 minutes · Negative marking (−0.25) · Auto Fullscreen · Tab Switch Monitoring
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
              {[['200', 'Questions'], ['180', 'Minutes'], ['−0.25', 'Per Wrong']].map(([val, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#fff' }}>{val}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Test list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mockTests.map((test) => {
              const attempts = getAttemptsForTest(test);
              const hasAttempts = attempts.length > 0;
              const lastAttempt = hasAttempts ? attempts[0] : null;
              const isExpanded = expandedTestId === test.id;
              const setInfo = setsData.find((s) => s.set_number === test.id);
              const isFreeSet = setInfo ? Boolean(setInfo.is_free) : test.id <= 3;
              const isAccessible = isPro(profile) || isFreeSet;

              return (
                <div key={test.id} style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14,
                  padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'border-color 0.15s ease',
                  position: 'relative',
                }}>
                  {/* Card Header Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    
                    {/* Icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                      background: hasAttempts ? '#DCFCE7' : !isAccessible ? '#FEF3C7' : 'var(--accent-navy-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: hasAttempts ? '#16A34A' : !isAccessible ? '#D97706' : 'var(--accent-navy)',
                    }}>
                      {hasAttempts ? <CheckCircle size={20} /> : !isAccessible ? <Lock size={20} /> : <FileText size={20} />}
                    </div>

                    {/* Main Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{test.title}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 999 }}>{test.subtitle}</span>
                        {!isAccessible ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Lock size={10} /> Pro
                          </span>
                        ) : isFreeSet ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: 999 }}>
                            Free
                          </span>
                        ) : null}
                        {hasAttempts && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: 999 }}>
                            Attempted ({attempts.length})
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: 'var(--text-secondary)', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {test.duration}
                        </span>
                        <span>{test.questions} Questions</span>

                        {hasAttempts && lastAttempt && (
                          <>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 4, background: lastAttempt.score >= 100 ? '#DCFCE7' : '#FEF3C7', color: lastAttempt.score >= 100 ? '#15803D' : '#B45309', fontWeight: 700 }}>
                              Last Score: {lastAttempt.score} / 200 ({lastAttempt.accuracy}% acc)
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              Attempted: {formatDateTime(lastAttempt.completedAt)}
                            </span>
                            <button
                              onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                              style={{
                                background: 'transparent', border: 'none', color: '#2563EB', cursor: 'pointer',
                                fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3, padding: 0
                              }}>
                              <span>History ({attempts.length})</span>
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {hasAttempts && lastAttempt && (
                        <button
                          onClick={() => handleViewAnalysis(lastAttempt)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                            border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--bg-elevated)',
                            cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'inherit'
                          }}>
                          <BarChart3 size={14} /> Analysis
                        </button>
                      )}

                      {!isAccessible ? (
                        <button
                          onClick={() => setLockedMsgId(lockedMsgId === test.id ? null : test.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
                            border: '1px solid #E2E8F0', borderRadius: 8, background: '#F8FAFC',
                            cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#0F172A', fontFamily: 'inherit'
                          }}>
                          <Lock size={13} color="#D97706" /> Locked 🔒
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartTest(test)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px',
                            border: 'none', borderRadius: 8, background: 'var(--accent-navy)',
                            cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit'
                          }}>
                          {hasAttempts ? <RotateCcw size={13} /> : <Play size={13} fill="#fff" />}
                          {hasAttempts ? 'Start Test' : 'Start Test'}
                        </button>
                      )}
                    </div>

                  </div>

                  {lockedMsgId === test.id && (
                    <div style={{
                      padding: '8px 14px',
                      background: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      borderRadius: 8,
                      color: '#92400E',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Lock size={13} color="#92400E" />
                        <span>Pro feature — unlock coming soon</span>
                      </div>
                      <button
                        onClick={() => setLockedMsgId(null)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#92400E', fontSize: 14, fontWeight: 700, padding: 0 }}
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Expandable History Drawer */}
                  {isExpanded && hasAttempts && (
                    <div style={{
                      marginTop: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 12,
                      display: 'flex', flexDirection: 'column', gap: 8
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>All Attempts for {test.title}:</span>
                        <span>Best Score: {Math.max(...attempts.map(a => Number(a.score) || 0))} / 200</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {attempts.map((att, idx) => (
                          <div key={idx} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 14px', borderRadius: 8, background: 'var(--bg-tertiary)',
                            fontSize: 12
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontWeight: 700, color: 'var(--accent-navy)' }}>
                                Attempt #{attempts.length - idx}
                              </span>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {formatDateTime(att.completedAt)}
                              </span>
                              {att.autoSubmitted && (
                                <span style={{ color: '#DC2626', fontSize: 11, fontWeight: 600, background: '#FEE2E2', padding: '1px 6px', borderRadius: 4 }}>
                                  Auto-submitted (Proctoring)
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <span style={{ fontWeight: 700, color: att.score >= 100 ? '#15803D' : '#B45309' }}>
                                Score: {att.score} / 200
                              </span>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                Accuracy: {att.accuracy}%
                              </span>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                Correct: {att.correct} | Wrong: {att.incorrect}
                              </span>
                              <button
                                onClick={() => handleViewAnalysis(att)}
                                style={{
                                  padding: '4px 10px', fontSize: 11, fontWeight: 600,
                                  border: '1px solid var(--border-subtle)', borderRadius: 4,
                                  cursor: 'pointer', background: 'var(--bg-elevated)', color: 'var(--accent-navy)'
                                }}>
                                Review Result
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
