import { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Lock, FileText, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import IMUpilotSidebar from '../components/IMUpilotSidebar';
import { supabase } from '../supabaseClient';
import { isPro } from '../utils/planUtils';
import UpgradeModal from '../components/UpgradeModal';

const BLUEPRINT_SUBJECTS = [
  { name: 'Mathematics', desc: 'Calculus, Algebra, Vectors, Probability & Coordinate Geometry' },
  { name: 'Physics', desc: 'Mechanics, Electrodynamics, Optics, Thermodynamics & Modern Physics' },
  { name: 'Chemistry', desc: 'Physical, Organic, Inorganic & Environmental Chemistry' },
  { name: 'English', desc: 'Grammar, Vocabulary, Reading Comprehension & Maritime Terms' },
  { name: 'General Aptitude', desc: 'Logical Reasoning, Data Interpretation & Quantitative Aptitude' },
];

export default function Learn() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [lockedMsgId, setLockedMsgId] = useState(null);
  const [bannerNotice, setBannerNotice] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        let currentUserId = null;
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          currentUserId = authData.user.id;
          setUserId(currentUserId);
        } else {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user?.id) {
            currentUserId = sessionData.session.user.id;
            setUserId(currentUserId);
          } else {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            if (user?.id) {
              currentUserId = user.id;
              setUserId(currentUserId);
            }
            if (user?.plan) setProfile({ plan: user.plan });
          }
        }

        if (currentUserId) {
          const { data: pData } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', currentUserId)
            .single();
          if (pData) setProfile(pData);
        }

        // 2. Blueprint chapters
        const { data: cData, error } = await supabase
          .from('blueprint_chapters')
          .select('*')
          .order('chapter_order', { ascending: true });

        if (!error && cData) {
          setChapters(cData);
        }
      } catch (err) {
        console.error('Error loading notes/blueprint chapters:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const userIsPro = isPro(profile);

  // Filter chapters for currently selected subject
  const subjectChapters = chapters.filter(
    (c) => c.subject === selectedSubject && c.is_published !== false
  );

  const handleChapterClick = (chapter) => {
    const isAccessible = userIsPro || Boolean(chapter.is_free);
    if (!isAccessible) {
      setShowUpgrade(true);
      return;
    }
    setActiveChapter(chapter);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: '#F8FAFC', color: '#0F172A', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <IMUpilotSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden', overflowY: 'auto' }}>
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

        {/* Topbar */}
        <div style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 28px',
          minHeight: 58,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {(selectedSubject || activeChapter) && (
              <button
                onClick={() => {
                  if (activeChapter) setActiveChapter(null);
                  else setSelectedSubject(null);
                }}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>
                {activeChapter ? activeChapter.chapter_name : selectedSubject ? `${selectedSubject} Notes` : 'Notes & Blueprint'}
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                {activeChapter ? selectedSubject : selectedSubject ? 'Chapter notes and study materials' : 'Chapter-wise syllabus, key concepts & formula notes'}
              </div>
            </div>
          </div>

          {!userIsPro && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setShowUpgrade(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(15,23,42,0.1)'
                }}
              >
                🔒 Unlock Pro — ₹999
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(12px, 4vw, 28px)' }}>
          {/* VIEW 1: ACTIVE CHAPTER READER */}
          {activeChapter ? (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '28px 32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, borderBottom: '1px solid #E2E8F0', paddingBottom: 18, marginBottom: 24 }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    <span>{activeChapter.subject}</span>
                    <span>•</span>
                    <span>Chapter {activeChapter.chapter_order || 1}</span>
                  </div>
                  <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {activeChapter.chapter_name}
                  </h1>
                </div>

                {activeChapter.pdf_url && (
                  <a
                    href={activeChapter.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '9px 18px',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(15,23,42,0.12)'
                    }}
                  >
                    <FileText size={15} />
                    <span>View / Download PDF</span>
                    <ExternalLink size={13} style={{ opacity: 0.7 }} />
                  </a>
                )}
              </div>

              {activeChapter.content ? (
                <div style={{ fontSize: 15, lineHeight: 1.85, color: '#1E293B', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>
                  {activeChapter.content}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                  <BookOpen size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: 14 }}>Full notes are attached in the PDF document above.</p>
                </div>
              )}
            </div>
          ) : selectedSubject ? (
            /* VIEW 2: CHAPTERS LIST FOR SELECTED SUBJECT */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 750, color: '#0F172A' }}>
                    {selectedSubject} Chapters
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748B' }}>
                    {subjectChapters.length} chapter{subjectChapters.length === 1 ? '' : 's'} available
                  </p>
                </div>

                {!userIsPro && (
                  <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={13} color="#D97706" />
                    <span>Pro membership unlocks all chapters</span>
                  </div>
                )}
              </div>

              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
                  Loading chapters...
                </div>
              ) : subjectChapters.length === 0 ? (
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: '#F1F5F9', color: '#64748B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <BookOpen size={24} />
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Notes being uploaded</h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>
                    Chapters and formula sheets for {selectedSubject} are being prepared.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {subjectChapters.map((chap, idx) => {
                    const isAccessible = userIsPro || Boolean(chap.is_free);

                    return (
                      <div
                        key={chap.id || idx}
                        onClick={() => handleChapterClick(chap)}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: 12,
                          padding: '16px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#CBD5E1';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                            <div style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: !isAccessible ? '#FEF3C7' : '#F1F5F9',
                              color: !isAccessible ? '#D97706' : '#0F172A',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontWeight: 700,
                              fontSize: 13
                            }}>
                              {!isAccessible ? <Lock size={16} /> : (chap.chapter_order || idx + 1)}
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {chap.chapter_name}
                                </span>
                                {!isAccessible ? (
                                  <span style={{ fontSize: 10, fontWeight: 700, background: '#FEF3C7', color: '#B45309', padding: '2px 7px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    <Lock size={9} /> Pro
                                  </span>
                                ) : chap.is_free ? (
                                  <span style={{ fontSize: 10, fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '2px 7px', borderRadius: 999 }}>
                                    Free
                                  </span>
                                ) : null}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748B' }}>
                                {chap.pdf_url ? 'Notes & PDF attached' : 'Comprehensive chapter notes'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {!isAccessible ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowUpgrade(true);
                                }}
                                style={{
                                  background: '#0F172A',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  padding: '6px 14px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                🔒 Unlock Pro — ₹999
                              </button>
                            ) : (
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 3 }}>
                                Read <ChevronRight size={14} />
                              </span>
                            )}
                          </div>
                        </div>

                        {lockedMsgId === chap.id && (
                          <div style={{
                            padding: '8px 12px',
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
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowUpgrade(true);
                                }}
                                style={{
                                  background: '#0F172A',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '5px 12px',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                🔒 Unlock Pro — ₹999
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLockedMsgId(null);
                              }}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#92400E', fontSize: 14, fontWeight: 700, padding: 0 }}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* VIEW 3: ALL 5 SUBJECTS CARDS */
            <div>
              {/* Pro Promotion Banner for Free Users */}
              {!userIsPro && (
                <div
                  onClick={() => setShowUpgrade(true)}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                    borderRadius: 16,
                    padding: '20px 24px',
                    marginBottom: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(15,23,42,0.12)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={22} color="#FBBF24" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 750, color: '#FFFFFF', marginBottom: 2 }}>
                        IMUpilot Pro — Unlock All Chapter Notes
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                        Complete syllabus revision, downloadable PDF notes, formula sheets, and full mock test engine.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUpgrade(true);
                    }}
                    style={{
                      background: '#FBBF24',
                      color: '#0F172A',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      flexShrink: 0
                    }}
                  >
                    🔒 Unlock Pro — ₹999
                  </button>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 750, color: '#0F172A' }}>
                  Select a Subject
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748B' }}>
                  Explore complete IMUCET theory notes, important formulas, and quick summaries.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {BLUEPRINT_SUBJECTS.map((subj) => {
                  const count = chapters.filter((c) => c.subject === subj.name && c.is_published !== false).length;
                  const freeCount = chapters.filter((c) => c.subject === subj.name && c.is_published !== false && c.is_free).length;

                  return (
                    <div
                      key={subj.name}
                      onClick={() => setSelectedSubject(subj.name)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 16,
                        padding: '22px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 160,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#0F172A';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(15,23,42,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            background: '#0F172A',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 16
                          }}>
                            <BookOpen size={20} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '3px 9px', borderRadius: 999 }}>
                            {count} {count === 1 ? 'Chapter' : 'Chapters'}
                          </span>
                        </div>

                        <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 750, color: '#0F172A' }}>
                          {subj.name}
                        </h3>
                        <p style={{ margin: 0, fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                          {subj.desc}
                        </p>
                      </div>

                      <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A' }}>
                          {userIsPro ? 'All unlocked' : freeCount > 0 ? `${freeCount} Free Chapter${freeCount > 1 ? 's' : ''}` : 'Requires Pro'}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 3 }}>
                          Browse <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} userId={userId} />}
    </div>
  );
}
