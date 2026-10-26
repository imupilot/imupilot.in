import { useEffect } from 'react';
import { Check, X, Sparkles, MessageCircle } from 'lucide-react';

export default function UpgradeModal({ isOpen, onClose, title = "Unlock IMUpilot Pro", subtitle = "One-time upgrade. Lifetime access to all premium features." }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const features = [
    "All 19 full-length mock tests (latest pattern & CBT engine)",
    "Full chapter notes & study materials library",
    "Complete company interview & IMUCET flashcard decks",
    "Advanced performance analytics & subject accuracy breakdown",
    "Unlimited re-attempts with complete solutions & explanations",
  ];

  const whatsappUrl = "https://wa.me/919876543210?text=" + encodeURIComponent("Hi IMUpilot team, I would like to upgrade my account to IMUpilot Pro (₹999). Please share payment details.");

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'background 0.15s',
          }}
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ padding: '28px 28px 20px', textAlign: 'center', background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)', borderBottom: '1px solid #F1F5F9' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#0F172A',
              color: '#F8FAFC',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            }}
          >
            <Sparkles size={22} color="#FBBF24" />
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 750, color: '#0F172A', letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
            {subtitle}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '8px 18px' }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#0F172A' }}>₹999</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>/ lifetime</span>
          </div>
        </div>

        {/* Features List */}
        <div style={{ padding: '20px 28px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', marginBottom: 12 }}>
            What you get with Pro:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {features.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '0 28px 26px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '13px 20px',
              background: '#0F172A',
              color: '#FFFFFF',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
              boxSizing: 'border-box',
              transition: 'background 0.15s, transform 0.1s',
            }}
          >
            <MessageCircle size={18} color="#22C55E" />
            Contact us to upgrade
          </a>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
