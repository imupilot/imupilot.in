import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Layers, FastForward, Bookmark, CheckCircle2, XCircle, BookOpen, BarChart3, Lock } from 'lucide-react';
import IMUpilotSidebar from '../components/IMUpilotSidebar';
import { supabase } from '../supabaseClient';
import { isPro } from '../utils/planUtils';
import UpgradeModal from '../components/UpgradeModal';

const COMPANY_COLORS = {
  'Anglo Eastern': '#1B3A6B',
  'Maersk': '#0033A0',
  'MSC': '#4A154B',
  'SCI': '#B22222',
  'SIMS': '#1A6B3A',
  'Great Eastern': '#E8630A',
  'Fleet Management': '#2C7873',
};

const SUBJECT_COLORS = {
  'Physics': '#3B82F6',
  'Chemistry': '#10B981',
  'Mathematics': '#F59E0B',
  'English': '#8B5CF6',
  'General Aptitude': '#EF4444',
  'General Knowledge': '#EC4899',
};

function getColor(name, section) {
  if (section === 'DNS') return COMPANY_COLORS[name] || 'var(--accent-navy)';
  return SUBJECT_COLORS[name] || 'var(--accent-navy)';
}

// ─── Flashcard View ───────────────────────────────────────────────────────────
function FlashcardView({ title, cards, onBack, userId, color, initialProgress, onProgressChange, initialMode = 'all', progressAvailable = false, profile, onUpgrade }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(initialProgress || {});
  const [mode, setMode] = useState(initialMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setProgress(initialProgress || {}), [initialProgress]);

  const visibleCards = cards.filter(card => {
    if (mode === 'review') return progress[card.id] === 'didnt_know';
    if (mode === 'bookmarked') return progress[card.id] === 'bookmarked';
    return true;
  });

  const current = visibleCards[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [mode, cards]);

  useEffect(() => {
    setCurrentIndex(index => Math.min(index, Math.max(visibleCards.length - 1, 0)));
  }, [visibleCards.length]);

  const saveProgress = useCallback(async (cardId, status) => {
    if (!userId) throw new Error('Please sign in again to save flashcard progress.');
    setSaving(true);
    setError('');
    try {
      const { error: saveError } = await supabase.from('flashcard_progress').upsert(
        { user_id: userId, flashcard_id: cardId, status },
        { onConflict: 'user_id,flashcard_id' }
      );
      if (saveError) throw saveError;
      setProgress(prev => ({ ...prev, [cardId]: status }));
      onProgressChange?.(cardId, status);
    } finally {
      setSaving(false);
    }
  }, [userId, onProgressChange]);

  const handleKnewIt = async () => {
    if (!current) return;
    try {
      await saveProgress(current.id, 'knew_it');
      if (mode === 'all') goNext();
      else setIsFlipped(false);
    } catch (saveError) {
      console.error('Unable to save flashcard progress.', saveError);
      setError(saveError.message || 'Could not save your progress. Please try again.');
    }
  };

  const handleDidntKnow = async () => {
    if (!current) return;
    try {
      await saveProgress(current.id, 'didnt_know');
      if (mode !== 'bookmarked') goNext();
      else setIsFlipped(false);
    } catch (saveError) {
      console.error('Unable to save flashcard progress.', saveError);
      setError(saveError.message || 'Could not save your progress. Please try again.');
    }
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!current || saving) return;
    const newStatus = progress[current.id] === 'bookmarked' ? null : 'bookmarked';
    try {
      if (newStatus) {
        await saveProgress(current.id, 'bookmarked');
      } else {
        if (!userId) throw new Error('Please sign in again to update bookmarks.');
        setSaving(true);
        setError('');
        const { error: deleteError } = await supabase.from('flashcard_progress').delete()
          .eq('user_id', userId).eq('flashcard_id', current.id);
        if (deleteError) throw deleteError;
        setProgress(prev => { const updated = { ...prev }; delete updated[current.id]; return updated; });
        onProgressChange?.(current.id, null);
      }
    } catch (saveError) {
      console.error('Unable to update flashcard bookmark.', saveError);
      setError(saveError.message || 'Could not update your bookmark. Please try again.');
    } finally {
      setSaving(false);
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

  const reviewCount = cards.filter(c => progress[c.id] === 'didnt_know').length;
  const bookmarkCount = cards.filter(c => progress[c.id] === 'bookmarked').length;
  const knewCount = cards.filter(c => progress[c.id] === 'knew_it').length;

  if (visibleCards.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 24px', gap: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
          {mode === 'review' ? progressAvailable ? 'No cards to review' : 'Sign in to view review cards' : mode === 'bookmarked' ? progressAvailable ? 'No bookmarked cards' : 'Sign in to view bookmarks' : 'No flashcards in this deck yet'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
          {mode === 'review' ? progressAvailable ? "You haven't marked any cards as Didn't Know yet." : 'Sign in to load your saved flashcard progress.' : mode === 'bookmarked' ? progressAvailable ? 'Save important cards here for quick revision.' : 'Sign in to load your saved flashcard progress.' : 'Cards will appear here when they are available.'}
        </div>
        {mode !== 'all' && cards.length > 0 && <button onClick={() => setMode('all')} style={{ marginTop: 8, background: color, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Back to all cards</button>}
        <button onClick={onBack} style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontSize: 13, color: 'var(--text-tertiary)' }}>Back to library</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px' }}>

      {/* Top row */}
      <div style={{ width: '100%', maxWidth: 760, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button onClick={onBack} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 9, padding: '9px 13px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, color: '#334155' }}>
          <ChevronLeft size={14} /> Library
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 16, color: '#0F172A' }}>{title}</div>
        <div style={{ padding: '7px 10px', borderRadius: 8, background: '#F1F5F9', color: '#475569', fontSize: 12, fontWeight: 600 }}>{currentIndex + 1} / {visibleCards.length}</div>
      </div>

      <div style={{ width: '100%', maxWidth: 760, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, color: '#64748B', fontSize: 11 }}>
          <span>Deck progress</span><span>{Math.round(((currentIndex + 1) / visibleCards.length) * 100)}%</span>
        </div>
        <div role="progressbar" aria-label="Current deck position" aria-valuemin={0} aria-valuemax={visibleCards.length} aria-valuenow={currentIndex + 1} style={{ height: 5, overflow: 'hidden', borderRadius: 999, background: '#E2E8F0' }}>
          <div style={{ width: `${((currentIndex + 1) / visibleCards.length) * 100}%`, height: '100%', borderRadius: 999, background: '#1E3A5F' }} />
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 760, display: 'flex', gap: 8, marginBottom: 18 }}>
        {[
          { key: 'all', label: `All (${cards.length})` },
          { key: 'review', label: progressAvailable ? `Review (${reviewCount})` : 'Review' },
          { key: 'bookmarked', label: progressAvailable ? `Bookmarked (${bookmarkCount})` : 'Bookmarked' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setMode(tab.key)} style={{
            flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            background: mode === tab.key ? '#1E3A5F' : '#fff',
            color: mode === tab.key ? '#fff' : '#475569',
            border: mode === tab.key ? '1px solid #1E3A5F' : '1px solid #E2E8F0',
            transition: 'all 0.2s',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Locked cards banner in deck */}
      {!isPro(profile) && cards.filter(c => !c.is_free).length > 0 && (
        <div
          onClick={onUpgrade}
          style={{
            width: '100%',
            maxWidth: 760,
            marginBottom: 16,
            padding: '12px 18px',
            background: '#0F172A',
            color: '#FFFFFF',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(15,23,42,0.1)',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 600 }}>
            <Lock size={15} color="#93C5FD" />
            <span>
              {cards.filter(c => !c.is_free).length} {cards.filter(c => !c.is_free).length === 1 ? 'card' : 'cards'} locked — Upgrade to Pro to unlock all
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#93C5FD', display: 'flex', alignItems: 'center', gap: 3 }}>
            Upgrade ₹999 <ChevronRight size={14} />
          </span>
        </div>
      )}

      {/* Card */}
      <div role="button" tabIndex={0} aria-label={isFlipped ? 'Flashcard answer. Activate to show question.' : 'Flashcard question. Activate to reveal answer.'}
        onClick={() => setIsFlipped(value => !value)}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setIsFlipped(value => !value); } }}
        style={{ width: '100%', maxWidth: 760, minHeight: 300, position: 'relative', marginBottom: 16, padding: '38px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isFlipped ? '#CBD5E1' : '#1E3A5F'}`, borderRadius: 20, background: isFlipped ? '#fff' : '#1E3A5F', color: isFlipped ? '#0F172A' : '#fff', textAlign: 'center', cursor: 'pointer', boxShadow: '0 10px 28px rgba(15,23,42,0.07)' }}>

        <div style={{ marginBottom: 16, color: isFlipped ? '#64748B' : '#CBD5E1', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{isFlipped ? 'Answer' : 'Question'}</div>

        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            maxWidth: 620,
            color: isFlipped ? '#0F172A' : '#fff',
            fontSize: 20,
            fontWeight: 600,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            filter: (isFlipped && !isPro(profile) && !current?.is_free) ? 'blur(5px)' : 'none',
            userSelect: (isFlipped && !isPro(profile) && !current?.is_free) ? 'none' : 'auto',
          }}>
            {isFlipped ? current?.answer || 'Answer is not available for this card yet.' : current?.question}
          </div>

          {/* Pro Lock Overlay over blurred answer */}
          {isFlipped && !isPro(profile) && !current?.is_free && (
            <div
              onClick={(e) => { e.stopPropagation(); onUpgrade?.(); }}
              style={{
                position: 'absolute',
                inset: '-12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: 'rgba(255, 255, 255, 0.78)',
                backdropFilter: 'blur(3px)',
                borderRadius: 14,
                cursor: 'pointer',
                zIndex: 5,
              }}
            >
              <div style={{
                background: '#0F172A',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
              }}>
                <Lock size={13} color="#93C5FD" /> 🔒 Pro
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', textAlign: 'center' }}>
                Answer is locked for Pro members
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onUpgrade?.(); }}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 18px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Upgrade to Pro — ₹999
              </button>
            </div>
          )}
        </div>

        {isFlipped && (!isPro(profile) && !current?.is_free ? null : current?.section === 'IMUCET' && [
          ['Explanation', current.explanation],
          ['Exam tip', current.exam_tip],
          ['Difficulty', current.difficulty],
          ['Source', current.source],
        ].filter(([, value]) => value?.trim()).map(([label, value]) => (
          <div key={label} style={{ width: '100%', maxWidth: 620, marginTop: 18, paddingTop: 14, borderTop: '1px solid #E2E8F0', textAlign: 'left' }}>
            <div style={{ marginBottom: 5, color: '#64748B', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ color: '#334155', fontSize: 14, fontWeight: 400, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{value}</div>
          </div>
        )))}
        {!isFlipped && <div style={{ marginTop: 24, color: '#CBD5E1', fontSize: 12 }}>Select to reveal the answer</div>}
      </div>
      <button type="button" onClick={() => setIsFlipped(value => !value)} style={{ marginBottom: 20, padding: '9px 16px', border: '1px solid #E2E8F0', borderRadius: 9, background: '#fff', color: '#334155', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {isFlipped ? 'Show question' : 'Reveal answer'}
      </button>

      {/* Knew It / Didn't Know */}
      {error && <div role="alert" style={{ width: '100%', maxWidth: 760, marginBottom: 14, padding: '10px 12px', border: '1px solid #FECACA', borderRadius: 9, background: '#FEF2F2', color: '#B91C1C', fontSize: 13 }}>{error}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24, width: '100%', maxWidth: 760 }}>
        <button onClick={handleDidntKnow} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '2px solid var(--accent-danger)', background: 'var(--accent-danger-subtle)', color: 'var(--accent-danger)', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <XCircle size={16} /> Didn't Know
        </button>
        <button onClick={handleKnewIt} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '2px solid var(--accent-success)', background: 'var(--accent-success-subtle)', color: 'var(--accent-success)', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> I Knew It
        </button>
        <button type="button" onClick={handleBookmark} disabled={saving} style={{ padding: '12px 18px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#fff', color: '#334155', cursor: saving ? 'wait' : 'pointer', fontWeight: 650, fontSize: 14, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Bookmark size={16} fill={progress[current?.id] === 'bookmarked' ? '#1E3A5F' : 'none'} />
          {progress[current?.id] === 'bookmarked' ? 'Bookmarked' : 'Bookmark'}
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
          if (i === currentIndex) { bg = color; textColor = '#fff'; }
          else if (status === 'knew_it') { bg = 'var(--accent-success-subtle)'; textColor = 'var(--accent-success)'; }
          else if (status === 'didnt_know') { bg = 'var(--accent-danger-subtle)'; textColor = 'var(--accent-danger)'; }
          else if (status === 'bookmarked') { bg = 'var(--accent-warning-subtle)'; textColor = 'var(--accent-warning)'; }
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
function DeckGrid({ decks, section, onSelect, onBack, title, subtitle, onReview, onBookmarked, reviewCount = 0, bookmarkCount = 0, sectionProgress = {}, progressAvailable, ungroupedCards = [], ungroupedLabel = 'Cards without a group', onSelectUngrouped }) {
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

      <div style={{ padding: 'clamp(12px, 4vw, 28px)' }}>

        {/* Review + Bookmarked shortcuts */}
        {(onReview || onBookmarked) && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 24 }}>
          {onReview && <button type="button" onClick={onReview} style={{ textAlign: 'left', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit' }}>
            <XCircle size={20} color="var(--accent-danger)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Review</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cards you didn't know</div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-danger)' }}>{reviewCount}</span>
          </button>}
          {onBookmarked && <button type="button" onClick={onBookmarked} style={{ textAlign: 'left', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit' }}>
            <Bookmark size={20} color="var(--accent-warning)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Bookmarked</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Saved for later</div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent-warning)' }}>{bookmarkCount}</span>
          </button>}
        </div>}

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          {section === 'DNS' ? 'Companies' : 'Subjects'}
        </div>

        {decks.length === 0 && ungroupedCards.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8 }}>
            <div style={{ color: '#0F172A', fontWeight: 650, fontSize: 15 }}>{section === 'IMUCET' ? 'IMUCET flashcards are being prepared' : 'No flashcards in this section yet'}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{section === 'IMUCET' ? 'Subject and chapter cards will appear here when available.' : 'Available cards will appear here.'}</div>
          </div>
        ) : decks.length > 0 && (
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
                    {Number.isFinite(deck.count) && <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', padding: '3px 10px', borderRadius: 999 }}>{deck.count} cards</span>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{deck.name}</div>
                  {progressAvailable && deck.count > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ marginBottom: 5, color: '#64748B', fontSize: 10 }}>{deck.cards.filter(card => sectionProgress[card.id] === 'knew_it').length}/{deck.count} marked “I Knew It”</div>
                      <div style={{ height: 4, overflow: 'hidden', borderRadius: 999, background: '#E2E8F0' }}>
                        <div style={{ width: `${(deck.cards.filter(card => sectionProgress[card.id] === 'knew_it').length / deck.count) * 100}%`, height: '100%', background: '#1E3A5F' }} />
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={event => { event.stopPropagation(); onSelect(deck); }} style={{ width: '100%', marginTop: 'auto', padding: '9px', borderRadius: 8, background: color + '12', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    Study <FastForward size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {ungroupedCards.length > 0 && onSelectUngrouped && (
          <button type="button" onClick={onSelectUngrouped} style={{ width: '100%', marginTop: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, border: '1px solid var(--border-subtle)', borderRadius: 12, background: 'var(--bg-elevated)', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <span style={{ fontSize: 13, fontWeight: 650 }}>{ungroupedLabel}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 12 }}>
              {ungroupedCards.length} {ungroupedCards.length === 1 ? 'card' : 'cards'} <FastForward size={13} />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}


function FlashcardLayout({ children, mobileOpen, setMobileOpen, bg = '#F8FAFC' }) {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: bg, overflow: 'hidden' }}>
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
        {children}
      </main>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SmartRevision() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [sectionProgress, setSectionProgress] = useState({}); // flashcard_id -> status for all cards
  const [progressLoaded, setProgressLoaded] = useState(false);

  // Navigation state: null | 'DNS' | 'IMUCET' | {section, groupName, subName, cards}
  const [view, setView] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadLibrary() {
      try {
        // 1. Get current authenticated user
        let currentUserId = null;
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user?.id) {
            currentUserId = authData.user.id;
          }
        } catch (e) {
          console.warn("getUser check:", e);
        }

        if (!currentUserId) {
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.user?.id) {
              currentUserId = sessionData.session.user.id;
            }
          } catch (e) {
            console.warn("getSession check:", e);
          }
        }

        if (!currentUserId) {
          try {
            const localUser = JSON.parse(localStorage.getItem('user') || 'null');
            if (localUser?.id) {
              currentUserId = localUser.id;
              if (localUser.plan) setProfile({ plan: localUser.plan });
            }
          } catch (e) {}
        }

        if (!currentUserId) {
          navigate('/auth', { replace: true });
          return;
        }

        if (active) setUserId(currentUserId);

        // 2. Fetch flashcards and profile plan
        const [{ data: cards, error: cardsError }, { data: pData }] = await Promise.all([
          supabase
            .from('flashcards')
            .select('id, section, company, category, chapter, question, answer, type, subject, topic, explanation, exam_tip, difficulty, source, is_free, created_at'),
          supabase
            .from('profiles')
            .select('id, full_name, email, plan')
            .eq('id', currentUserId)
            .maybeSingle(),
        ]);

        if (cardsError) throw cardsError;
        if (!active) return;
        const loadedCards = cards || [];
        setAllCards(loadedCards);

        if (pData && active) setProfile(pData);

        // 3. Fetch progress for current user
        if (loadedCards.length) {
          try {
            const { data: progressRows, error: progressError } = await supabase
              .from('flashcard_progress')
              .select('flashcard_id, status')
              .eq('user_id', currentUserId)
              .in('flashcard_id', loadedCards.map(card => card.id));

            if (!progressError && progressRows && active) {
              const progressMap = {};
              progressRows.forEach(row => { progressMap[row.flashcard_id] = row.status; });
              setSectionProgress(progressMap);
              setProgressLoaded(true);
            }
          } catch (pErr) {
            console.warn('Could not load flashcard progress:', pErr);
          }
        }
      } catch (error) {
        console.error('Unable to load the flashcard library.', error);
        if (active) setLoadError(error.message || 'Unable to load flashcards. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadLibrary();
    return () => { active = false; };
  }, [navigate]);

  const dnsCards = allCards.filter(c => !c.section || c.section === 'DNS');
  const imucetCards = allCards.filter(c => c.section === 'IMUCET');
  const dnsCompanies = [...new Set(dnsCards.map(c => c.company).filter(Boolean))].map(company => ({
    name: company,
    count: dnsCards.filter(c => c.company === company).length,
    cards: dnsCards.filter(c => c.company === company),
  }));
  const imucetSubjects = [...new Set(imucetCards.map(card => card.subject?.trim() || card.company?.trim()).filter(Boolean))].map(subject => {
    const cards = imucetCards.filter(card => (card.subject?.trim() || card.company?.trim()) === subject);
    return { name: subject, count: cards.length, cards };
  });
  const sectionGroups = [...new Set(allCards.map(card => card.section || 'DNS'))]
    .map(section => ({
      name: section,
      cards: allCards.filter(card => (card.section || 'DNS') === section),
    }));
  const knownCount = allCards.filter(card => sectionProgress[card.id] === 'knew_it').length;
  const reviewedCount = allCards.filter(card => ['knew_it', 'didnt_know'].includes(sectionProgress[card.id])).length;
  const reviewCards = allCards.filter(card => sectionProgress[card.id] === 'didnt_know');
  const bookmarkedCards = allCards.filter(card => sectionProgress[card.id] === 'bookmarked');
  const updateProgress = useCallback((cardId, status) => {
    setSectionProgress(previous => {
      const next = { ...previous };
      if (status) next[cardId] = status;
      else delete next[cardId];
      return next;
    });
  }, []);

  // ── Render ──
  if (loading) {
    return (
      <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="var(--bg-primary)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14, minHeight: '60vh' }}>
          Loading...
        </div>
      </FlashcardLayout>
    );
  }

  if (loadError && !allCards.length) {
    return (
      <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="#F8FAFC">
        <div style={{ display: 'grid', placeItems: 'center', padding: 24, minHeight: '60vh' }}>
          <div role="alert" style={{ maxWidth: 520, padding: 24, border: '1px solid #FECACA', borderRadius: 14, background: '#fff', color: '#991B1B', fontSize: 14 }}>{loadError}</div>
        </div>
      </FlashcardLayout>
    );
  }

  // Active flashcard view
  if (view?.cards) {
    return (
      <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="var(--bg-primary)">
        <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19, color: 'var(--text-primary)' }}>{view.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Recall the question, then reveal the answer.</div>
          </div>
        </div>
        <FlashcardView
          title={view.title}
          cards={view.cards}
          onBack={() => setView(view.parent)}
          userId={userId}
          color={view.color}
          initialProgress={sectionProgress}
          onProgressChange={updateProgress}
          initialMode={view.mode || 'all'}
          progressAvailable={progressLoaded}
          profile={profile}
          onUpgrade={() => setShowUpgradeModal(true)}
        />
      </FlashcardLayout>
    );
  }

  // DNS company selected — show categories
  if (view?.type === 'dns-company') {
    const categories = [...new Set(view.companyCards.map(c => c.category).filter(Boolean))].map(cat => ({
      name: cat,
      count: view.companyCards.filter(c => c.category === cat).length,
      cards: view.companyCards.filter(c => c.category === cat),
    }));

    if (!categories.length) {
      return (
        <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="#F8FAFC">
          <div style={{ padding: '0 28px', minHeight: 58, display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #E2E8F0', background: '#fff' }}>
            <button type="button" onClick={() => setView('DNS')} style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', color: '#334155', cursor: 'pointer' }}><ChevronLeft size={14} /> Library</button>
            <strong style={{ color: '#0F172A' }}>{view.company}</strong>
          </div>
          <FlashcardView
            title={view.company}
            cards={view.companyCards}
            onBack={() => setView('DNS')}
            userId={userId}
            color={getColor(view.company, 'DNS')}
            initialProgress={sectionProgress}
            onProgressChange={updateProgress}
            progressAvailable={progressLoaded}
            profile={profile}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        </FlashcardLayout>
      );
    }

    return (
      <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="var(--bg-primary)">
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
          sectionProgress={sectionProgress}
          progressAvailable={progressLoaded}
        />
      </FlashcardLayout>
    );
  }

  // IMUCET subject selected — show chapters
  if (view?.type === 'imucet-subject') {
    const chapters = [...new Set(view.subjectCards.map(card => card.chapter?.trim()).filter(Boolean))].map(chapter => ({
      name: chapter,
      cards: view.subjectCards.filter(card => card.chapter?.trim() === chapter),
      count: view.subjectCards.filter(card => card.chapter?.trim() === chapter).length,
    }));
    const ungroupedCards = view.subjectCards.filter(card => !card.chapter?.trim());

    // If no chapters, go straight to cards
    if (chapters.length === 0) {
      return (
        <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="var(--bg-primary)">
          <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 19, color: 'var(--text-primary)' }}>{view.subject}</div>
          </div>
          <FlashcardView
            title={view.subject}
            cards={view.subjectCards}
            onBack={() => setView('IMUCET')}
            userId={userId}
            color={getColor(view.subject, 'IMUCET')}
            initialProgress={sectionProgress}
            onProgressChange={updateProgress}
            progressAvailable={progressLoaded}
            profile={profile}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        </FlashcardLayout>
      );
    }

    return (
      <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="var(--bg-primary)">
        <DeckGrid
          decks={chapters}
          section="IMUCET"
          title={view.subject}
          subtitle="Select a chapter to study"
          onBack={() => setView('IMUCET')}
          onSelect={ch => setView({
            type: 'imucet-chapter',
            subject: view.subject,
            chapter: ch.name,
            chapterCards: ch.cards,
            subjectCards: view.subjectCards,
          })}
          ungroupedCards={ungroupedCards}
          ungroupedLabel="Cards without a chapter"
          onSelectUngrouped={() => setView({
            cards: ungroupedCards,
            title: `${view.subject} — Cards without a chapter`,
            color: getColor(view.subject, 'IMUCET'),
            parent: { type: 'imucet-subject', subject: view.subject, subjectCards: view.subjectCards },
          })}
          sectionProgress={sectionProgress}
          progressAvailable={progressLoaded}
        />
      </FlashcardLayout>
    );
  }

  if (view?.type === 'imucet-chapter') {
    const topics = [...new Set(view.chapterCards.map(card => card.topic?.trim()).filter(Boolean))].map(topic => ({
      name: topic,
      cards: view.chapterCards.filter(card => card.topic?.trim() === topic),
      count: view.chapterCards.filter(card => card.topic?.trim() === topic).length,
    }));
    const ungroupedCards = view.chapterCards.filter(card => !card.topic?.trim());
    const parent = { type: 'imucet-subject', subject: view.subject, subjectCards: view.subjectCards };

    if (topics.length === 0) {
      return (
        <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="var(--bg-primary)">
          <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 19, color: 'var(--text-primary)' }}>{view.subject} — {view.chapter}</div>
          </div>
          <FlashcardView
            title={`${view.subject} — ${view.chapter}`}
            cards={view.chapterCards}
            onBack={() => setView(parent)}
            userId={userId}
            color={getColor(view.subject, 'IMUCET')}
            initialProgress={sectionProgress}
            onProgressChange={updateProgress}
            progressAvailable={progressLoaded}
            profile={profile}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        </FlashcardLayout>
      );
    }

    return (
      <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="var(--bg-primary)">
        <DeckGrid
          decks={topics}
          section="IMUCET"
          title={`${view.subject} — ${view.chapter}`}
          subtitle="Select a topic to study"
          onBack={() => setView(parent)}
          onSelect={topic => setView({
            cards: topic.cards,
            title: `${view.subject} — ${view.chapter} — ${topic.name}`,
            color: getColor(view.subject, 'IMUCET'),
            parent: view,
          })}
          ungroupedCards={ungroupedCards}
          ungroupedLabel="Cards without a topic"
          onSelectUngrouped={() => setView({
            cards: ungroupedCards,
            title: `${view.subject} — ${view.chapter} — Cards without a topic`,
            color: getColor(view.subject, 'IMUCET'),
            parent: view,
          })}
          sectionProgress={sectionProgress}
          progressAvailable={progressLoaded}
        />
      </FlashcardLayout>
    );
  }

  if (view?.type === 'other-section') {
    const groups = [...new Set(view.cards.map(card => card.company).filter(Boolean))].map(name => ({
      name,
      cards: view.cards.filter(card => card.company === name),
      count: view.cards.filter(card => card.company === name).length,
    }));
    if (!groups.length && view.cards.length) {
      return (
        <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="#F8FAFC">
          <div style={{ padding: '0 28px', minHeight: 58, display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #E2E8F0', background: '#fff' }}>
            <button type="button" onClick={() => setView(null)} style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', color: '#334155', cursor: 'pointer' }}><ChevronLeft size={14} /> Library</button>
            <strong style={{ color: '#0F172A' }}>{view.section}</strong>
          </div>
          <FlashcardView title={view.section} cards={view.cards} onBack={() => setView(null)} userId={userId} color={getColor(view.section, view.section)} initialProgress={sectionProgress} onProgressChange={updateProgress} progressAvailable={progressLoaded} />
        </FlashcardLayout>
      );
    }
    return (
      <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="#F8FAFC">
        <DeckGrid
          decks={groups}
          section={view.section}
          title={view.section}
          subtitle="Browse available flashcards"
          onBack={() => setView(null)}
          sectionProgress={sectionProgress}
          progressAvailable={progressLoaded}
          onSelect={group => {
            const chapters = [...new Set(group.cards.map(card => card.chapter).filter(Boolean))];
            if (chapters.length) {
              setView({ type: 'other-subject', section: view.section, subject: group.name, cards: group.cards });
            } else {
              setView({ cards: group.cards, title: group.name, color: getColor(group.name, view.section), parent: view });
            }
          }}
        />
      </FlashcardLayout>
    );
  }

  if (view?.type === 'other-subject') {
    const chapters = [...new Set(view.cards.map(card => card.chapter).filter(Boolean))].map(name => ({
      name,
      cards: view.cards.filter(card => card.chapter === name),
      count: view.cards.filter(card => card.chapter === name).length,
    }));
    return (
      <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="#F8FAFC">
        <DeckGrid
          decks={chapters}
          section={view.section}
          title={view.subject}
          subtitle="Choose a chapter to study"
          onBack={() => setView({ type: 'other-section', section: view.section, cards: allCards.filter(card => (card.section || 'DNS') === view.section) })}
          sectionProgress={sectionProgress}
          progressAvailable={progressLoaded}
          onSelect={chapter => setView({
            cards: chapter.cards,
            title: `${view.subject} — ${chapter.name}`,
            color: getColor(view.subject, view.section),
            parent: view,
          })}
        />
      </FlashcardLayout>
    );
  }

  // DNS section
  if (view === 'DNS') {
    const dnsReviewCards = dnsCards.filter(c => sectionProgress[c.id] === 'didnt_know');
    const dnsBookmarkCards = dnsCards.filter(c => sectionProgress[c.id] === 'bookmarked');
    if (dnsCards.length && !dnsCompanies.length) {
      return (
        <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="#F8FAFC">
          <div style={{ padding: '0 28px', minHeight: 58, display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #E2E8F0', background: '#fff' }}>
            <button type="button" onClick={() => setView(null)} style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', color: '#334155', cursor: 'pointer' }}><ChevronLeft size={14} /> Library</button>
            <strong style={{ color: '#0F172A' }}>DNS Interview Prep</strong>
          </div>
          <FlashcardView title="DNS Interview Prep" cards={dnsCards} onBack={() => setView(null)} userId={userId} color={getColor('DNS', 'DNS')} initialProgress={sectionProgress} onProgressChange={updateProgress} progressAvailable={progressLoaded} profile={profile} onUpgrade={() => setShowUpgradeModal(true)} />
        </FlashcardLayout>
      );
    }
    return (
      <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="var(--bg-primary)">
        <DeckGrid
          decks={dnsCompanies}
          section="DNS"
          title="DNS Interview Prep"
          subtitle="Select a company to start practising"
          onBack={() => setView(null)}
          onSelect={deck => setView({ type: 'dns-company', company: deck.name, companyCards: deck.cards })}
          reviewCount={dnsReviewCards.length}
          bookmarkCount={dnsBookmarkCards.length}
          onReview={progressLoaded ? () => setView({ cards: dnsCards, title: 'DNS — Review', color: 'var(--accent-danger)', parent: 'DNS', mode: 'review' }) : undefined}
          onBookmarked={progressLoaded ? () => setView({ cards: dnsCards, title: 'DNS — Bookmarked', color: 'var(--accent-warning)', parent: 'DNS', mode: 'bookmarked' }) : undefined}
          sectionProgress={sectionProgress}
          progressAvailable={progressLoaded}
        />
      </FlashcardLayout>
    );
  }

  // IMUCET section
  if (view === 'IMUCET') {
    const imucetReviewCards = imucetCards.filter(c => sectionProgress[c.id] === 'didnt_know');
    const imucetBookmarkCards = imucetCards.filter(c => sectionProgress[c.id] === 'bookmarked');
    const ungroupedSubjectCards = imucetCards.filter(card => !(card.subject?.trim() || card.company?.trim()));
    if (imucetCards.length && !imucetSubjects.length) {
      return (
        <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="#F8FAFC">
          <div style={{ padding: '0 28px', minHeight: 58, display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #E2E8F0', background: '#fff' }}>
            <button type="button" onClick={() => setView(null)} style={{ padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', color: '#334155', cursor: 'pointer' }}><ChevronLeft size={14} /> Library</button>
            <strong style={{ color: '#0F172A' }}>IMUCET Prep</strong>
          </div>
          <FlashcardView title="IMUCET Prep" cards={imucetCards} onBack={() => setView(null)} userId={userId} color={getColor('IMUCET', 'IMUCET')} initialProgress={sectionProgress} onProgressChange={updateProgress} progressAvailable={progressLoaded} profile={profile} onUpgrade={() => setShowUpgradeModal(true)} />
        </FlashcardLayout>
      );
    }
    return (
      <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="var(--bg-primary)">
        <DeckGrid
          decks={imucetSubjects}
          section="IMUCET"
          title="IMUCET Flashcards"
          subtitle="Select a subject to start studying"
          onBack={() => setView(null)}
          onSelect={deck => setView({ type: 'imucet-subject', subject: deck.name, subjectCards: deck.cards })}
          reviewCount={imucetReviewCards.length}
          bookmarkCount={imucetBookmarkCards.length}
          onReview={progressLoaded ? () => setView({ cards: imucetCards, title: 'IMUCET — Review', color: 'var(--accent-danger)', parent: 'IMUCET', mode: 'review' }) : undefined}
          onBookmarked={progressLoaded ? () => setView({ cards: imucetCards, title: 'IMUCET — Bookmarked', color: 'var(--accent-warning)', parent: 'IMUCET', mode: 'bookmarked' }) : undefined}
          ungroupedCards={ungroupedSubjectCards}
          ungroupedLabel="Cards without a subject"
          onSelectUngrouped={() => setView({
            cards: ungroupedSubjectCards,
            title: 'IMUCET — Cards without a subject',
            color: getColor('IMUCET', 'IMUCET'),
            parent: 'IMUCET',
          })}
          sectionProgress={sectionProgress}
          progressAvailable={progressLoaded}
        />
      </FlashcardLayout>
    );
  }

  return (
    <FlashcardLayout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} bg="#F8FAFC">
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 32px', minHeight: 72, display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ padding: '12px 0' }}>
          <h1 style={{ margin: 0, fontWeight: 750, fontSize: 24, letterSpacing: '-0.035em', color: '#0F172A' }}>Flashcards</h1>
          <div style={{ marginTop: 4, fontSize: 13, color: '#64748B' }}>Quick recall for concepts, formulas, definitions, and important facts.</div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: 'clamp(12px, 4vw, 28px)', boxSizing: 'border-box' }}>
          {/* Locked cards top banner */}
          {!isPro(profile) && allCards.some(c => !c.is_free) && (
            <div
              onClick={() => setShowUpgradeModal(true)}
              style={{
                marginBottom: 20,
                padding: '14px 20px',
                background: '#0F172A',
                color: '#FFFFFF',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(15,23,42,0.12)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 600 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={16} color="#93C5FD" />
                </div>
                <span>
                  {allCards.filter(c => !c.is_free).length} {allCards.filter(c => !c.is_free).length === 1 ? 'card' : 'cards'} locked — Upgrade to Pro to unlock all
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#93C5FD', display: 'flex', alignItems: 'center', gap: 4 }}>
                Upgrade to Pro <ChevronRight size={15} />
              </span>
            </div>
          )}
          {loadError && <div role="alert" style={{ marginBottom: 18, padding: '12px 14px', border: '1px solid #FECACA', borderRadius: 10, background: '#FEF2F2', color: '#991B1B', fontSize: 13 }}>{loadError}</div>}
          <section style={{ marginBottom: 22, padding: 22, border: '1px solid #E2E8F0', borderRadius: 16, background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: progressLoaded && allCards.length ? 13 : 0 }}>
              <div>
                <h2 style={{ margin: 0, color: '#0F172A', fontSize: 16 }}>Your progress</h2>
                <p style={{ margin: '5px 0 0', color: '#64748B', fontSize: 12 }}>
                  {allCards.length
                    ? progressLoaded ? `${reviewedCount} of ${allCards.length} cards reviewed · ${knownCount} marked “I Knew It”` : userId ? 'Your study progress is being loaded.' : 'Sign in to load your saved study progress.'
                    : 'Progress will be available when flashcards are added.'}
                </p>
              </div>
              {progressLoaded && allCards.length > 0 && <div style={{ color: '#1E3A5F', fontSize: 20, fontWeight: 700 }}>{Math.round((reviewedCount / allCards.length) * 100)}%</div>}
            </div>
            {progressLoaded && allCards.length > 0 && (
              <div role="progressbar" aria-label="Flashcards reviewed" aria-valuemin={0} aria-valuemax={allCards.length} aria-valuenow={reviewedCount} style={{ height: 6, overflow: 'hidden', borderRadius: 999, background: '#E2E8F0' }}>
                <div style={{ width: `${(reviewedCount / allCards.length) * 100}%`, height: '100%', borderRadius: 999, background: '#1E3A5F' }} />
              </div>
            )}
          </section>

          <section aria-label="Flashcard actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))', gap: 14, marginBottom: 30 }}>
            {[
              { title: 'Review', detail: 'Cards you marked “Didn’t Know”', count: progressLoaded && allCards.length ? reviewCards.length : null, icon: XCircle, color: '#B91C1C', background: '#FEF2F2', mode: 'review' },
              { title: 'Bookmarked', detail: 'Cards you saved for later', count: progressLoaded && allCards.length ? bookmarkedCards.length : null, icon: Bookmark, color: '#1E3A5F', background: '#EFF6FF', mode: 'bookmarked' },
            ].map(action => {
              const Icon = action.icon;
              return (
                <button key={action.title} type="button" disabled={action.count === null} onClick={() => setView({ cards: allCards, title: action.title, color: action.color, parent: null, mode: action.mode })}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, border: '1px solid #E2E8F0', borderRadius: 14, background: '#fff', textAlign: 'left', cursor: action.count !== null ? 'pointer' : 'default', opacity: action.count !== null ? 1 : 0.72, fontFamily: 'inherit' }}>
                  <span style={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 12, background: action.background, color: action.color }}><Icon size={19} /></span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', color: '#0F172A', fontSize: 14, fontWeight: 700 }}>{action.title}</span>
                    <span style={{ display: 'block', marginTop: 4, color: '#64748B', fontSize: 11 }}>{action.detail}</span>
                  </span>
                  {action.count !== null && <span style={{ color: '#0F172A', fontSize: 17, fontWeight: 700 }}>{action.count}</span>}
                </button>
              );
            })}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, border: '1px solid #E2E8F0', borderRadius: 14, background: '#fff', opacity: 0.68 }}>
              <span style={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 12, background: '#F1F5F9', color: '#64748B' }}><BarChart3 size={19} /></span>
              <span>
                <span style={{ display: 'block', color: '#0F172A', fontSize: 14, fontWeight: 700 }}>Analyze</span>
                <span style={{ display: 'block', marginTop: 4, color: '#64748B', fontSize: 11 }}>Study filters and analysis coming later</span>
              </span>
            </div>
          </section>

          <div style={{ marginBottom: 14 }}>
            <h2 style={{ margin: 0, color: '#0F172A', fontSize: 18 }}>Your library</h2>
            <p style={{ margin: '5px 0 0', color: '#64748B', fontSize: 13 }}>Browse available flashcards by subject or category.</p>
          </div>
          {sectionGroups.length === 0 ? (
            <section style={{ padding: '42px 24px', border: '1px solid #E2E8F0', borderRadius: 16, background: '#fff', textAlign: 'center' }}>
              <div style={{ width: 50, height: 50, margin: '0 auto 16px', display: 'grid', placeItems: 'center', borderRadius: 14, background: '#EFF6FF', color: '#1E3A5F' }}><BookOpen size={24} /></div>
              <h2 style={{ margin: '0 0 8px', color: '#0F172A', fontSize: 18 }}>Flashcards are being prepared</h2>
              <p style={{ margin: 0, color: '#64748B', fontSize: 13 }}>Your IMUCET flashcard library will appear here.</p>
            </section>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap: 14 }}>
              {sectionGroups.map(group => {
                const markedKnown = group.cards.filter(card => sectionProgress[card.id] === 'knew_it').length;
                const isCustom = group.name !== 'DNS' && group.name !== 'IMUCET';
                return (
                  <article key={group.name} style={{ padding: 20, border: '1px solid #E2E8F0', borderRadius: 15, background: '#fff' }}>
                    <div style={{ width: 42, height: 42, marginBottom: 14, display: 'grid', placeItems: 'center', borderRadius: 12, background: '#EFF6FF', color: '#1E3A5F' }}>
                      {group.name === 'DNS' ? <Layers size={20} /> : <BookOpen size={20} />}
                    </div>
                    <h3 style={{ margin: '0 0 5px', color: '#0F172A', fontSize: 15 }}>{group.name === 'DNS' ? 'DNS Interview Prep' : group.name === 'IMUCET' ? 'IMUCET Prep' : group.name}</h3>
                    <div style={{ marginBottom: 14, color: '#64748B', fontSize: 12 }}>{group.cards.length} {group.cards.length === 1 ? 'card' : 'cards'} available</div>
                    {progressLoaded && (
                      <div style={{ marginBottom: 14, color: '#64748B', fontSize: 11 }}>
                        {markedKnown}/{group.cards.length} marked “I Knew It”
                        <div style={{ height: 4, marginTop: 6, overflow: 'hidden', borderRadius: 999, background: '#E2E8F0' }}>
                          <div style={{ width: `${group.cards.length ? (markedKnown / group.cards.length) * 100 : 0}%`, height: '100%', background: '#1E3A5F' }} />
                        </div>
                      </div>
                    )}
                    <button type="button" onClick={() => {
                      if (!isCustom) setView(group.name);
                      else setView({ type: 'other-section', section: group.name, cards: group.cards });
                    }}
                      style={{ width: '100%', padding: '10px 12px', border: 0, borderRadius: 9, background: '#1E3A5F', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 650 }}>
                      Browse library
                    </button>
                  </article>
                );
              })}
            </div>
          )}
          {imucetCards.length === 0 && sectionGroups.length > 0 && (
            <section style={{ marginTop: 14, padding: '24px', border: '1px solid #E2E8F0', borderRadius: 15, background: '#fff' }}>
              <h3 style={{ margin: '0 0 6px', color: '#0F172A', fontSize: 15 }}>IMUCET Flashcards</h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: 12 }}>No IMUCET flashcards are available yet.</p>
            </section>
          )}
        </div>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          title="Unlock All Flashcards"
          subtitle="Upgrade to IMUpilot Pro to unlock complete DNS interview and IMUCET flashcards."
        />
      </FlashcardLayout>
    );
}
