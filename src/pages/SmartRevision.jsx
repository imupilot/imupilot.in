import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Layers, FastForward, Bookmark, CheckCircle2, XCircle, BookOpen, Ship } from 'lucide-react';
import IMUpilotSidebar from '../components/IMUpilotSidebar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const COMPANY_COLORS = {
  'Anglo Eastern':    '#1B3A6B',
  'Maersk':           '#0033A0',
  'MSC':              '#4A154B',
  'SCI':              '#B22222',
  'SIMS':             '#1A6B3A',
  'Great Eastern':    '#E8630A',
  'Fleet Management': '#2C7873',
};

const SUBJECT_COLORS = {
  'Physics':           '#3B82F6',
  'Chemistry':         '#10B981',
  'Mathematics':       '#F59E0B',
  'English':           '#8B5CF6',
  'General Aptitude':  '#EF4444',
  'General Knowledge': '#EC4899',
};

function getColor(name, section) {
  if (section === 'DNS') return COMPANY_COLORS[name] || 'var(--accent-navy)';
  return SUBJECT_COLORS[name] || 'var(--accent-navy)';
}

// ─── Flashcard View ───────────────────────────────────────────────────────────
function FlashcardView({ title, cards, onBack, userId, color }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped]       = useState(false);
  const [progress, setProgress]         = useState({});
  const [mode, setMode]                 = useState('all');
  const [saving, setSaving]             = useState(false);

  const visibleCards = cards.filter(card => {
    if (mode === 'review')     return progress[card.id] === 'didnt_know';
    if (mode === 'bookmarked') return progress[card.id] === 'bookmarked';
    return true;
  });

  const current = visibleCards[currentIndex];

  useEffect(() => {
    async function loadProgress() {
      if (!userId) return;
      const cardIds = cards.map(c => c.id);
      const { data } = await supabase
        .from('flashcard_progress')
        .select('flashcard_id, status')
        .eq('user_id', userId)
        .in('flashcard_id', cardIds);
      if (data) {
        const map = {};
        data.forEach(row => { map[row.flashcard_id] = row.status; });
        setProgress(map);
      }
    }
    loadProgress();
  }, [userId, cards]);

  useEffect(() => { setCurrentIndex(0); setIsFlipped(false); }, [mode]);

  const saveProgress = useCallback(async (cardId, status) => {
    if (!userId) return;
    setSaving(true);
    await supabase.from('flashcard_progress').upsert(
      { user_id: userId, flashcard_id: cardId, status },
      { onConflict: 'user_id,flashcard_id' }
    );
    setProgress(prev => ({ ...prev, [cardId]: status }));
    setSaving(false);
  }, [userId]);

  const handleKnewIt = async () => {
    if (!current) return;
    await saveProgress(current.id, 'knew_it');
    goNext();
  };

  const handleDidntKnow = async () => {
    if (!current) return;
    await saveProgress(current.id, 'didnt_know');
    goNext();
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!current) return;
    const newStatus = progress[current.id] === 'bookmarked' ? null : 'bookmarked';
    if (newStatus) {
      await saveProgress(current.id, 'bookmarked');
    } else {
      await supabase.from('flashcard_progress').delete()
        .eq('user_id', userId).eq('flashcard_id', current.id);
      setProgress(prev => { const p = { ...prev }; delete p[current.id]; return p; });
    }
  };

  const goNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(i => Math.min(i + 1, visibleCards.length - 1)), 150);
  };

  const goPrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(i => Math.max(i - 1, 0)), 150);
  };

  const reviewCount   = cards.filter(c => progress[c.id] === 'didnt_know').length;
  const bookmarkCount = cards.filter(c => progress[c.id] === 'bookmarked').length;
  const knewCount     = cards.filter(c => progress[c.id] === 'knew_it').length;

  if (visibleCards.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 28px', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
          {mode === 'review' ? 'No cards to review!' : 'No bookmarked cards yet.'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {mode === 'review' ? "Mark cards as \"Didn't Know\" to add them here." : 'Bookmark cards to save them for later.'}
        </div>
        <button onClick={() => setMode('all')} style={{ marginTop: 8, background: color, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          Back to All Cards
        </button>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 13, color: 'var(--text-tertiary)' }}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px' }}>

      {/* Top row */}
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)' }}>
          <ChevronLeft size={14} /> Back
        </button>
        <div style={{ fontWeight: 700, fontSize: 15, color: color }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{currentIndex + 1} / {visibleCards.length}</div>
      </div>

      {/* Mode tabs */}
      <div style={{ width: '100%', maxWidth: 640, display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'all',        label: `All (${cards.length})` },
          { key: 'review',     label: `Review (${reviewCount})` },
          { key: 'bookmarked', label: `Bookmarked (${bookmarkCount})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setMode(tab.key)} style={{
            flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            background: mode === tab.key ? color : 'var(--bg-tertiary)',
            color: mode === tab.key ? '#fff' : 'var(--text-tertiary)',
            transition: 'all 0.2s',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 640, height: 4, background: 'var(--border-subtle)', borderRadius: 999, marginBottom: 20 }}>
        <div style={{ width: `${cards.length > 0 ? (knewCount / cards.length) * 100 : 0}%`, height: '100%', background: 'var(--accent-success)', borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>

      {/* Card */}
      <div style={{ perspective: 1000, width: '100%', maxWidth: 640, aspectRatio: '3/2', cursor: 'pointer', marginBottom: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}>
        <div style={{ width: '100%', height: '100%', position: 'relative', transition: 'transform 0.55s ease', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

          {/* Front */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: color, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 40px', textAlign: 'center' }}>
            <button onClick={handleBookmark} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: progress[current?.id] === 'bookmarked' ? '#FCD34D' : 'rgba(255,255,255,0.6)' }}>
              <Bookmark size={16} fill={progress[current?.id] === 'bookmarked' ? '#FCD34D' : 'none'} />
            </button>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>Question</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#fff', lineHeight: 1.7, userSelect: 'none' }}>{current?.question}</div>
            <div style={{ position: 'absolute', bottom: 18, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Tap to reveal answer</div>
          </div>

          {/* Back */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: 'var(--bg-elevated)', border: `2px solid ${color}`, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 40px', textAlign: 'center', transform: 'rotateY(180deg)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>Answer</div>
            <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.8, userSelect: 'none' }}>
              {current?.answer || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Answer coming soon.</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Knew It / Didn't Know */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, width: '100%', maxWidth: 640 }}>
        <button onClick={handleDidntKnow} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '2px solid var(--accent-danger)', background: 'var(--accent-danger-subtle)', color: 'var(--accent-danger)', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <XCircle size={16} /> Didn't Know
        </button>
        <button onClick={handleKnewIt} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '2px solid var(--accent-success)', background: 'var(--accent-success-subtle)', color: 'var(--accent-success)', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> I Knew It
        </button>
      </div>

      {/* Numbered nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 640 }}>
        <button onClick={goPrev} disabled={currentIndex === 0} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', cursor: currentIndex === 0 ? 'default' : 'pointer', opacity: currentIndex === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={14} color="var(--text-primary)" />
        </button>
        {visibleCards.map((card, i) => {
          const status = progress[card.id];
          let bg = 'var(--bg-tertiary)', textColor = 'var(--text-tertiary)';
          if (i === currentIndex)          { bg = color;      textColor = '#fff'; }
          else if (status === 'knew_it')   { bg = 'var(--accent-success-subtle)';  textColor = 'var(--accent-success)'; }
          else if (status === 'didnt_know'){ bg = 'var(--accent-danger-subtle)';  textColor = 'var(--accent-danger)'; }
          else if (status === 'bookmarked'){ bg = 'var(--accent-warning-subtle)';  textColor = 'var(--accent-warning)'; }
          return (
            <button key={card.id} onClick={() => { setCurrentIndex(i); setIsFlipped(false); }} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: bg, color: textColor, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
              {i + 1}
            </button>
          );
        })}
        <button onClick={goNext} disabled={currentIndex === visibleCards.length - 1} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', cursor: currentIndex === visibleCards.length - 1 ? 'default' : 'pointer', opacity: currentIndex === visibleCards.length - 1 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={14} color="var(--text-primary)" />
        </button>
      </div>
    </div>
  );
}

// ─── Deck Grid ────────────────────────────────────────────────────────────────
function DeckGrid({ decks, section, onSelect, onBack, title, subtitle, onReview, onBookmarked, reviewCount, bookmarkCount }) {
  return (
    <div>
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{subtitle}</div>
        </div>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)' }}>
            <ChevronLeft size={14} /> Back
          </button>
        )}
      </div>

      <div style={{ padding: '24px 28px' }}>

        {/* Review + Bookmarked shortcuts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div onClick={reviewCount > 0 ? onReview : undefined} style={{ background: 'var(--accent-danger-subtle)', border: '1px solid var(--accent-danger)', borderRadius: 12, padding: '14px 18px', cursor: reviewCount > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 12, opacity: reviewCount > 0 ? 1 : 0.5 }}>
            <XCircle size={20} color="var(--accent-danger)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Review</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cards you didn't know</div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-danger)' }}>{reviewCount}</span>
          </div>
          <div onClick={bookmarkCount > 0 ? onBookmarked : undefined} style={{ background: 'var(--accent-warning-subtle)', border: '1px solid var(--accent-warning)', borderRadius: 12, padding: '14px 18px', cursor: bookmarkCount > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 12, opacity: bookmarkCount > 0 ? 1 : 0.5 }}>
            <Bookmark size={20} color="var(--accent-warning)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Bookmarked</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Saved for later</div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-warning)' }}>{bookmarkCount}</span>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          {section === 'DNS' ? 'Companies' : 'Subjects'}
        </div>

        {decks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8 }}>
            <div style={{ fontSize: 36 }}>📭</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No content yet — coming soon.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {decks.map(deck => {
              const color = getColor(deck.name, section);
              return (
                <div key={deck.name} onClick={() => onSelect(deck)}
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, background: color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                      <Layers size={17} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '3px 10px', borderRadius: 999 }}>
                      {deck.count} cards
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{deck.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 14 }}>
                    {section === 'DNS' ? 'Interview questions' : 'Chapter-wise cards'}
                  </div>
                  <button style={{ width: '100%', padding: '7px', borderRadius: 8, background: color + '12', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    Study <FastForward size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SmartRevision() {
  const [allCards, setAllCards]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [userId, setUserId]             = useState(null);
  const [sectionProgress, setSectionProgress] = useState({}); // flashcard_id -> status for all cards

  // Navigation state: null | 'DNS' | 'IMUCET' | {section, groupName, subName, cards}
  const [view, setView] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });

    async function fetchAll() {
      const { data } = await supabase
        .from('flashcards')
        .select('id, section, company, category, chapter, question, answer');
      if (data) {
        setAllCards(data);
        // Load progress for all cards
        supabase.auth.getUser().then(async ({ data: authData }) => {
          if (!authData?.user) return;
          const ids = data.map(c => c.id);
          const { data: prog } = await supabase
            .from('flashcard_progress')
            .select('flashcard_id, status')
            .eq('user_id', authData.user.id)
            .in('flashcard_id', ids);
          if (prog) {
            const map = {};
            prog.forEach(row => { map[row.flashcard_id] = row.status; });
            setSectionProgress(map);
          }
        });
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  // ── Derived data ──
  // DNS: group by company, then category
  const dnsCards    = allCards.filter(c => !c.section || c.section === 'DNS');
  const imucetCards = allCards.filter(c => c.section === 'IMUCET');

  // DNS companies
  const dnsCompanies = [...new Set(dnsCards.map(c => c.company))].map(company => ({
    name: company,
    count: dnsCards.filter(c => c.company === company).length,
    cards: dnsCards.filter(c => c.company === company),
  }));

  // IMUCET subjects
  const imucetSubjects = [...new Set(imucetCards.map(c => c.company))].map(subject => ({
    name: subject,
    count: imucetCards.filter(c => c.company === subject).length,
    cards: imucetCards.filter(c => c.company === subject),
  }));

  // ── Render ──
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)' }}>
        <IMUpilotSidebar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
          Loading...
        </main>
      </div>
    );
  }

  // Active flashcard view
  if (view?.cards) {
    return (
      <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>
        <IMUpilotSidebar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 19, color: 'var(--text-primary)' }}>{view.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tap a card to reveal the answer</div>
            </div>
          </div>
          <FlashcardView
            title={view.title}
            cards={view.cards}
            onBack={() => setView(view.parent)}
            userId={userId}
            color={view.color}
          />
        </main>
      </div>
    );
  }

  // DNS company selected — show categories
  if (view?.type === 'dns-company') {
    const categories = [...new Set(view.companyCards.map(c => c.category))].map(cat => ({
      name: cat,
      count: view.companyCards.filter(c => c.category === cat).length,
      cards: view.companyCards.filter(c => c.category === cat),
    }));

    return (
      <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <IMUpilotSidebar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <DeckGrid
            decks={categories}
            section="DNS"
            title={view.company}
            subtitle="Select a category to study"
            onBack={() => setView('DNS')}
            onSelect={cat => setView({
              cards: cat.cards,
              title: `${view.company} — ${cat.name}`,
              color: getColor(view.company, 'DNS'),
              parent: { type: 'dns-company', company: view.company, companyCards: view.companyCards },
            })}
          />
        </main>
      </div>
    );
  }

  // IMUCET subject selected — show chapters
  if (view?.type === 'imucet-subject') {
    const chapters = [...new Set(view.subjectCards.map(c => c.chapter).filter(Boolean))].map(ch => ({
      name: ch,
      count: view.subjectCards.filter(c => c.chapter === ch).length,
      cards: view.subjectCards.filter(c => c.chapter === ch),
    }));

    // If no chapters, go straight to cards
    if (chapters.length === 0) {
      return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>
          <IMUpilotSidebar />
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 19, color: 'var(--text-primary)' }}>{view.subject}</div>
            </div>
            <FlashcardView
              title={view.subject}
              cards={view.subjectCards}
              onBack={() => setView('IMUCET')}
              userId={userId}
              color={getColor(view.subject, 'IMUCET')}
            />
          </main>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <IMUpilotSidebar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <DeckGrid
            decks={chapters}
            section="IMUCET"
            title={view.subject}
            subtitle="Select a chapter to study"
            onBack={() => setView('IMUCET')}
            onSelect={ch => setView({
              cards: ch.cards,
              title: `${view.subject} — ${ch.name}`,
              color: getColor(view.subject, 'IMUCET'),
              parent: { type: 'imucet-subject', subject: view.subject, subjectCards: view.subjectCards },
            })}
          />
        </main>
      </div>
    );
  }

  // DNS section
  if (view === 'DNS') {
    const dnsReviewCards   = dnsCards.filter(c => sectionProgress[c.id] === 'didnt_know');
    const dnsBookmarkCards = dnsCards.filter(c => sectionProgress[c.id] === 'bookmarked');
    return (
      <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <IMUpilotSidebar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <DeckGrid
            decks={dnsCompanies}
            section="DNS"
            title="DNS Interview Prep"
            subtitle="Select a company to start practising"
            onBack={() => setView(null)}
            onSelect={deck => setView({ type: 'dns-company', company: deck.name, companyCards: deck.cards })}
            reviewCount={dnsReviewCards.length}
            bookmarkCount={dnsBookmarkCards.length}
            onReview={() => setView({ cards: dnsReviewCards, title: 'DNS — Review', color: 'var(--accent-danger)', parent: 'DNS' })}
            onBookmarked={() => setView({ cards: dnsBookmarkCards, title: 'DNS — Bookmarked', color: 'var(--accent-warning)', parent: 'DNS' })}
          />
        </main>
      </div>
    );
  }

  // IMUCET section
  if (view === 'IMUCET') {
    const imucetReviewCards   = imucetCards.filter(c => sectionProgress[c.id] === 'didnt_know');
    const imucetBookmarkCards = imucetCards.filter(c => sectionProgress[c.id] === 'bookmarked');
    return (
      <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <IMUpilotSidebar />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <DeckGrid
            decks={imucetSubjects}
            section="IMUCET"
            title="IMUCET Flashcards"
            subtitle="Select a subject to start studying"
            onBack={() => setView(null)}
            onSelect={deck => setView({ type: 'imucet-subject', subject: deck.name, subjectCards: deck.cards })}
            reviewCount={imucetReviewCards.length}
            bookmarkCount={imucetBookmarkCards.length}
            onReview={() => setView({ cards: imucetReviewCards, title: 'IMUCET — Review', color: 'var(--accent-danger)', parent: 'IMUCET' })}
            onBookmarked={() => setView({ cards: imucetBookmarkCards, title: 'IMUCET — Bookmarked', color: 'var(--accent-warning)', parent: 'IMUCET' })}
          />
        </main>
      </div>
    );
  }

  // Home — choose section
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <IMUpilotSidebar />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Flashcards</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Choose your prep mode</div>
          </div>
        </div>

        <div style={{ padding: '32px 28px', maxWidth: 680, margin: '0 auto' }}>

          {/* Total progress bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{dnsCards.length} cards ready · IMUCET coming soon</div>
            <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 999 }}>
              <div style={{ width: dnsCards.length > 0 ? '45%' : '0%', height: '100%', background: 'var(--accent-navy)', borderRadius: 999 }} />
            </div>
          </div>

          {/* Two section cards side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

            {/* DNS — dark filled card */}
            <div onClick={() => setView('DNS')} style={{ background: 'var(--accent-navy)', borderRadius: 18, padding: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <Ship size={28} color="rgba(255,255,255,0.7)" style={{ marginBottom: 16, display: 'block' }} />
              <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 6 }}>DNS Interview Prep</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 20 }}>Anglo Eastern, Maersk, MSC, SCI & more</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 22, color: '#fff' }}>{dnsCards.length}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 999 }}>cards</span>
              </div>
            </div>

            {/* IMUCET — light card */}
            <div onClick={() => setView('IMUCET')} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: '50%', background: 'var(--bg-tertiary)' }} />
              <BookOpen size={28} color="var(--accent-info)" style={{ marginBottom: 16, display: 'block' }} />
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>IMUCET Prep</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Physics, Chemistry, Maths, English, GA</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-secondary)' }}>Coming</span>
                <span style={{ fontSize: 11, color: 'var(--accent-info)', background: 'var(--accent-info-subtle)', padding: '3px 10px', borderRadius: 999 }}>Soon</span>
              </div>
            </div>

          </div>

          {/* Info note */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '14px 18px', fontSize: 12, color: 'var(--text-secondary)' }}>
            💡 Review and Bookmark are inside each section — your DNS cards and IMUCET cards are tracked separately.
          </div>

        </div>
      </main>
    </div>
  );
}
