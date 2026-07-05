import React, { useState } from 'react';
import { BookOpen, ChevronRight, ChevronDown, PlayCircle, FileText, RotateCcw, Zap, Trophy, Target, AlertCircle, ArrowLeft, CheckCircle2, Star, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IMUpilotSidebar from '../components/IMUpilotSidebar';

const syllabusData = {
  Physics: {
    icon: <Zap size={22} />, color: 'navy',
    chapters: [
      { id: 'p1', title: 'Units & Dimensions', topicsCount: 4, completion: 100, accuracy: 85, difficulty: 'Easy', pyqs: 12, topics: [{ id: 't1', title: 'Physical Quantities', status: 'completed' },{ id: 't2', title: 'Dimensional Analysis', status: 'completed' },{ id: 't3', title: 'Significant Figures', status: 'completed' },{ id: 't4', title: 'Errors in Measurement', status: 'completed' }] },
      { id: 'p2', title: 'Wave Optics', topicsCount: 3, completion: 60, accuracy: 42, difficulty: 'Hard', pyqs: 18, isWeak: true, topics: [{ id: 't5', title: 'Interference', status: 'completed' },{ id: 't6', title: 'Diffraction', status: 'in-progress' },{ id: 't7', title: 'Polarization', status: 'pending' }] },
      { id: 'p3', title: 'Current Electricity', topicsCount: 5, completion: 0, accuracy: 0, difficulty: 'Medium', pyqs: 25, topics: [{ id: 't8', title: "Ohm's Law", status: 'pending' },{ id: 't9', title: "Kirchhoff's Laws", status: 'pending' },{ id: 't10', title: 'Wheatstone Bridge', status: 'pending' },{ id: 't11', title: 'Potentiometer', status: 'pending' },{ id: 't12', title: 'Heating Effect', status: 'pending' }] },
    ]
  },
  Chemistry:   { icon: <Activity size={22} />, color: 'orange', chapters: [] },
  Mathematics: { icon: <Target size={22} />,   color: 'navy',   chapters: [] },
  'General Aptitude': { icon: <Trophy size={22} />, color: 'navy', chapters: [] },
  English:     { icon: <Star size={22} />,     color: 'navy',   chapters: [] },
};

const IC = ({ path, size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
);

export default function Learn() {
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const subjects = Object.keys(syllabusData);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <IMUpilotSidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {/* Topbar */}
        <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              {selected ? selected : 'Topic Notes'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {selected ? `${syllabusData[selected].chapters.length} chapters` : 'Master the complete IMUCET syllabus'}
            </div>
          </div>
          {selected && (
            <button onClick={() => { setSelected(null); setExpanded(null); }}
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
              ← Back to Hub
            </button>
          )}
        </div>

        <div style={{ padding: '28px' }}>
          {!selected ? (
            /* SUBJECT GRID */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {subjects.map(name => {
                const sub = syllabusData[name];
                const total = sub.chapters.length;
                const done = sub.chapters.filter(c => c.completion === 100).length;
                const avg = total > 0 ? Math.round(sub.chapters.reduce((a, c) => a + c.completion, 0) / total) : 0;
                const colors = { Physics: 'var(--accent-info)', Chemistry: 'var(--accent-success)', Mathematics: 'var(--accent-warning)', 'General Aptitude': 'var(--accent-primary)', English: 'var(--accent-danger)' };
                const c = colors[name] || 'var(--accent-navy)';
                return (
                  <div key={name} onClick={() => setSelected(name)}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '22px', cursor: 'pointer', transition: 'all 0.2s', minHeight: 280, display: 'flex', flexDirection: 'column' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: c + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c }}>{sub.icon}</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: c, letterSpacing: '-0.02em' }}>{avg}%</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mastery</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 3 }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 14 }}>{done}/{total} Chapters Completed</div>
                    <div style={{ display: 'flex', gap: 16, background: 'var(--bg-tertiary)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}><b style={{ color: 'var(--text-primary)' }}>{total * 5}</b> Topics</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}><b style={{ color: 'var(--text-primary)' }}>150+</b> PYQs</div>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 999, marginBottom: 14 }}>
                      <div style={{ width: `${avg}%`, height: '100%', background: c, borderRadius: 999 }} />
                    </div>
                    <button style={{ width: '100%', padding: '9px', borderRadius: 8, background: 'var(--accent-navy)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', marginTop: 'auto' }}>
                      Continue Learning
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* CHAPTER VIEW */
            <div>
              {syllabusData[selected].chapters.length === 0 ? (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>🚧</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>Coming Soon</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected} content is being prepared. Check back soon.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {syllabusData[selected].chapters.map(ch => (
                    <div key={ch.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
                      <button onClick={() => setExpanded(expanded === ch.id ? null : ch.id)}
                        style={{ width: '100%', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-navy)' }}>{ch.completion}%</div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{ch.title}</div>
                              {ch.isWeak && <span style={{ fontSize: 9, fontWeight: 700, background: 'var(--accent-danger-subtle)', color: 'var(--accent-danger)', padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weak Area</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                              <span>{ch.topicsCount} Topics</span>
                              <span>•</span>
                              <span>{ch.pyqs} PYQs</span>
                              <span>•</span>
                              <span style={{ color: ch.difficulty === 'Hard' ? 'var(--accent-danger)' : ch.difficulty === 'Easy' ? 'var(--accent-success)' : 'var(--accent-warning)' }}>{ch.difficulty}</span>
                            </div>
                          </div>
                        </div>
                        {expanded === ch.id ? <ChevronDown size={18} color="var(--text-secondary)" /> : <ChevronRight size={18} color="var(--text-secondary)" />}
                      </button>
                      {expanded === ch.id && (
                        <div style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)', padding: '12px 16px' }}>
                          {ch.topics.map(t => (
                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 16px', marginBottom: 8, border: '1px solid var(--border-subtle)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: t.status === 'completed' ? 'var(--accent-success-subtle)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.status === 'completed' ? 'var(--accent-success)' : 'var(--text-secondary)' }}>
                                  {t.status === 'completed' ? <CheckCircle2 size={14} /> : <BookOpen size={14} />}
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</div>
                                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>{t.status}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                {[['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', 'Notes'],['M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0', 'PYQs']].map(([d, label]) => (
                                  <button key={label} title={label} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                    <IC path={d} size={12} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
