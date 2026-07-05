import { useNavigate } from 'react-router-dom';
import { Play, Clock, FileText, BarChart3, ChevronRight, Lock } from 'lucide-react';
import IMUpilotSidebar from '../components/IMUpilotSidebar';

const mockTests = [
  { id: 1, title: 'IMUCET Full Mock 1', subtitle: '2025 Pattern', duration: '3 Hours', questions: 200, status: 'new' },
  { id: 2, title: 'IMUCET Full Mock 2', subtitle: '2025 Pattern', duration: '3 Hours', questions: 200, status: 'locked' },
  { id: 3, title: 'IMUCET Full Mock 3', subtitle: '2024 Pattern', duration: '3 Hours', questions: 200, status: 'locked' },
  { id: 4, title: 'IMUCET Full Mock 4', subtitle: '2024 Pattern', duration: '3 Hours', questions: 200, status: 'locked' },
  { id: 5, title: 'IMUCET Full Mock 5', subtitle: '2023 Pattern', duration: '3 Hours', questions: 200, status: 'locked' },
];

export default function MockTests() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <IMUpilotSidebar />

      <main style={{ flex: 1, overflowY: 'auto' }}>

        {/* Topbar */}
        <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Mock Tests</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Full-length IMUCET mock tests with real exam interface</div>
          </div>
        </div>

        <div style={{ padding: '28px' }}>

          {/* Info banner */}
          <div style={{ background: 'var(--accent-navy)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 4 }}>Real IMUCET Exam Environment</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                200 questions · 180 minutes · Negative marking (−0.25) · Exact CBT interface
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mockTests.map((test, idx) => {
              const isLocked = test.status === 'locked';
              const isCompleted = test.status === 'completed';
              const isResume = test.status === 'resume';

              return (
                <div key={test.id} style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14,
                  padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16,
                  opacity: isLocked ? 0.6 : 1,
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: isCompleted ? 'var(--accent-success-subtle)' : isResume ? 'var(--accent-primary-subtle)' : 'var(--accent-navy-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isCompleted ? 'var(--accent-success)' : isResume ? 'var(--accent-primary)' : 'var(--accent-navy)',
                  }}>
                    {isLocked ? <Lock size={18} /> : <FileText size={18} />}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{test.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 999 }}>{test.subtitle}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {test.duration}
                      </span>
                      <span>{test.questions} Questions</span>
                      {isCompleted && test.score && (
                        <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>Score: {test.score}/200</span>
                      )}
                      {isResume && (
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>In Progress</span>
                      )}
                      {isLocked && (
                        <span style={{ color: 'var(--text-secondary)' }}>🔒 Coming soon</span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ flexShrink: 0 }}>
                    {isCompleted && (
                      <button onClick={() => navigate('/test/result')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: '1px solid var(--border-subtle)', borderRadius: 8, background: 'var(--bg-elevated)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'inherit' }}>
                        <BarChart3 size={14} /> Analysis
                      </button>
                    )}
                    {isResume && (
                      <button onClick={() => navigate('/test/engine')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: '1px solid var(--accent-primary)', borderRadius: 8, background: 'var(--bg-elevated)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'inherit' }}>
                        Resume <ChevronRight size={14} />
                      </button>
                    )}
                    {test.status === 'new' && (
                      <button onClick={() => navigate('/test/engine')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', border: 'none', borderRadius: 8, background: 'var(--accent-navy)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'inherit' }}>
                        <Play size={13} fill="#fff" /> Start Test
                      </button>
                    )}
                    {isLocked && (
                      <div style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Locked
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
