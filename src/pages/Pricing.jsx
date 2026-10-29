import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X, Sparkles, Shield, ChevronLeft, ArrowRight, Zap, Crown } from 'lucide-react';
import UpgradeModal from '../components/UpgradeModal';
import IMUpilotSidebar from '../components/IMUpilotSidebar';
import { LogoIcon } from '../components/Icons';
import { Footer } from '../components/Footer';
import { supabase } from '../supabaseClient';

export default function Pricing() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [plan, setPlan] = useState('free');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const localUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  const fetchUserPlan = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentAuthUser = authData?.user;

      if (currentAuthUser) {
        setUserId(currentAuthUser.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', currentAuthUser.id)
          .maybeSingle();

        if (profile?.plan) {
          setPlan(profile.plan.toLowerCase());
          return;
        }
      }

      if (localUser?.plan) {
        setPlan(localUser.plan.toLowerCase());
      }
      if (localUser?.id) {
        setUserId(localUser.id);
      }
    } catch (err) {
      console.error('Error fetching user plan:', err);
      if (localUser?.plan) {
        setPlan(localUser.plan.toLowerCase());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPlan();
  }, []);

  const isPro = plan === 'pro' || plan === 'pro_max';

  const handleProAction = () => {
    if (!userId && !localUser) {
      navigate('/auth');
      return;
    }
    setShowUpgrade(true);
  };

  const pricingCards = (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
      gap: '28px',
      maxWidth: '880px',
      margin: '0 auto',
      width: '100%',
      alignItems: 'stretch',
    }}>
      {/* ── FREE CARD ── */}
      <div style={{
        background: 'var(--bg-elevated, #FFFFFF)',
        border: '1px solid var(--border-subtle, #E2E8F0)',
        borderRadius: '20px',
        padding: '36px 30px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: '999px',
            background: 'var(--surface-2, #F1F5F9)',
            color: 'var(--text-secondary, #64748B)',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            Free Plan
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text-primary, #0F172A)',
            margin: '0 0 6px',
          }}>
            Free
          </h3>
          <p style={{
            fontSize: '13.5px',
            color: 'var(--text-secondary, #64748B)',
            margin: 0,
            minHeight: '40px',
          }}>
            Essential tools to begin your preparation journey.
          </p>
        </div>

        {/* Price */}
        <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle, #E2E8F0)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '42px', fontWeight: 800, color: 'var(--text-primary, #0F172A)', letterSpacing: '-0.02em' }}>
              ₹0
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', fontWeight: 500 }}>
              forever
            </span>
          </div>
        </div>

        {/* Features list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          {[
            { text: '1 Free Mock Test', included: true },
            { text: 'Limited Flashcards', included: true },
            { text: 'Dashboard & Analytics', included: true },
            { text: 'Study Planner', included: true },
            { text: 'All Mock Tests (19+ sets)', included: false },
            { text: 'Sectional Tests', included: false },
            { text: 'Notes & Blueprints', included: false },
            { text: '10 Complimentary Mock Interviews', included: false },
          ].map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '11px',
              fontSize: '14px',
              color: item.included ? 'var(--text-primary, #1E293B)' : 'var(--text-muted, #94A3B8)',
            }}>
              {item.included ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(22, 163, 74, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}>
                  <Check size={13} color="#16A34A" strokeWidth={3} />
                </div>
              ) : (
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}>
                  <X size={13} color="#EF4444" strokeWidth={2.5} />
                </div>
              )}
              <span style={{ textDecoration: item.included ? 'none' : 'line-through', opacity: item.included ? 1 : 0.75 }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Free Plan Button / Status */}
        {localUser || userId ? (
          <div style={{
            textAlign: 'center',
            padding: '12px',
            borderRadius: '10px',
            background: 'var(--surface-2, #F8FAFC)',
            color: 'var(--text-secondary, #64748B)',
            fontSize: '13.5px',
            fontWeight: 600,
            border: '1px solid var(--border-subtle, #E2E8F0)',
          }}>
            {!isPro ? 'Current Plan' : 'Standard Baseline'}
          </div>
        ) : (
          <Link
            to="/auth"
            style={{
              textAlign: 'center',
              padding: '12px',
              borderRadius: '10px',
              background: 'var(--surface-2, #F1F5F9)',
              color: 'var(--text-primary, #0F172A)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid var(--border-subtle, #E2E8F0)',
              transition: 'all 0.15s ease',
            }}
          >
            Get Started Free
          </Link>
        )}
      </div>

      {/* ── PRO CARD (HIGHLIGHTED) ── */}
      <div style={{
        background: 'var(--bg-elevated, #FFFFFF)',
        border: '2px solid var(--accent-navy, #1B3A6B)',
        borderRadius: '20px',
        padding: '36px 30px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 36px rgba(27, 58, 107, 0.12)',
        position: 'relative',
        transform: 'scale(1.02)',
      }}>
        {/* Most Popular Badge */}
        <div style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #1B3A6B 0%, #2D5299 100%)',
          color: '#FFFFFF',
          padding: '5px 16px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 4px 12px rgba(27, 58, 107, 0.25)',
        }}>
          <Sparkles size={13} color="#FBBF24" /> Most Popular
        </div>

        <div style={{ marginBottom: '20px', marginTop: '6px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            background: 'rgba(27, 58, 107, 0.08)',
            color: 'var(--accent-navy, #1B3A6B)',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            <Crown size={13} color="#1B3A6B" /> Full Access
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--text-primary, #0F172A)',
            margin: '0 0 6px',
          }}>
            Pro Plan
          </h3>
          <p style={{
            fontSize: '13.5px',
            color: 'var(--text-secondary, #64748B)',
            margin: 0,
            minHeight: '40px',
          }}>
            The complete IMUCET &amp; DNS sponsorship mastery toolkit.
          </p>
        </div>

        {/* Price */}
        <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle, #E2E8F0)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '42px', fontWeight: 800, color: 'var(--accent-navy, #1B3A6B)', letterSpacing: '-0.02em' }}>
              ₹999
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary, #64748B)', fontWeight: 600 }}>
              one-time
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>
            Unlimited lifetime validity • No recurring subscriptions
          </div>
        </div>

        {/* Features list */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
          {[
            'All Mock Tests (19+ sets, updated regularly)',
            'Sectional Tests',
            'Full Notes & Chapter PDFs',
            'All Flashcards',
            'Dashboard & Analytics',
            'Study Planner',
            '10 Complimentary Mock Interviews',
            'Priority Support',
          ].map((feature, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '11px',
              fontSize: '14px',
              color: 'var(--text-primary, #0F172A)',
              fontWeight: 500,
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(22, 163, 74, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
              }}>
                <Check size={13} color="#16A34A" strokeWidth={3} />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button / Badge */}
        {isPro ? (
          <div style={{
            textAlign: 'center',
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(22, 163, 74, 0.12)',
            color: '#15803D',
            fontSize: '15px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: '1px solid rgba(22, 163, 74, 0.25)',
          }}>
            <Check size={18} color="#16A34A" strokeWidth={3} />
            You're on Pro
          </div>
        ) : (
          <button
            type="button"
            onClick={handleProAction}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #1B3A6B 0%, #2D5299 100%)',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(27, 58, 107, 0.25)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(27, 58, 107, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(27, 58, 107, 0.25)';
            }}
          >
            <Zap size={16} /> Upgrade to Pro — ₹999
          </button>
        )}
      </div>
    </div>
  );

  // Content body
  const mainContent = (
    <div style={{ padding: '40px 24px 80px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Page Heading */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--surface-2, #F1F5F9)',
          border: '1px solid var(--border-subtle, #E2E8F0)',
          padding: '6px 14px',
          borderRadius: '999px',
          color: 'var(--accent-navy, #1B3A6B)',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '14px',
        }}>
          <Shield size={14} /> Transparent &amp; Affordable
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 800,
          color: 'var(--text-primary, #0F172A)',
          letterSpacing: '-0.03em',
          margin: '0 0 12px',
        }}>
          Simple Pricing
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary, #64748B)',
          maxWidth: '540px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Everything you need to crack IMUCET
        </p>
      </div>

      {pricingCards}

      {/* Guarantee & FAQs note */}
      <div style={{
        marginTop: '56px',
        background: 'var(--bg-elevated, #FFFFFF)',
        border: '1px solid var(--border-subtle, #E2E8F0)',
        borderRadius: '16px',
        padding: 'clamp(12px, 4vw, 28px)',
        textAlign: 'center',
        maxWidth: '880px',
        margin: '56px auto 0',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #0F172A)', marginBottom: '6px' }}>
          Need assistance or group institutional access?
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)' }}>
          Reach out directly to our student support team via{' '}
          <Link to="/contact" style={{ color: 'var(--accent-navy, #1B3A6B)', fontWeight: 600, textDecoration: 'none' }}>
            Help &amp; Support
          </Link>
          {' '}or WhatsApp at <a href="https://wa.me/917606963299" target="_blank" rel="noopener noreferrer" style={{ color: '#16A34A', fontWeight: 600, textDecoration: 'none' }}>+91 76069 63299</a>.
        </div>
      </div>
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {localUser ? (
        // Logged-in view: integrated with sidebar
        <div style={{
          display: 'flex',
          height: '100vh',
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          background: 'var(--bg-secondary, #F8FAFC)',
          overflow: 'hidden',
        }}>
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

            {/* Topbar header */}
            <div style={{
              background: 'var(--bg-elevated, #FFFFFF)',
              borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
              padding: '0 28px',
              height: '58px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '19px', letterSpacing: '-0.02em', color: 'var(--text-primary, #0F172A)' }}>
                  Pricing Plans
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)' }}>
                  Manage or upgrade your IMUPilot student membership
                </div>
              </div>

              {isPro && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(22, 163, 74, 0.1)',
                  color: '#15803D',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}>
                  <Check size={14} color="#16A34A" strokeWidth={3} /> Pro Active
                </div>
              )}
            </div>

            {mainContent}
          </main>
        </div>
      ) : (
        // Public / Guest view: clean standalone layout with header and footer
        <div style={{
          minHeight: '100vh',
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          background: 'var(--bg-secondary, #F8FAFC)',
          color: 'var(--text-primary, #0F172A)',
        }}>
          {/* Header */}
          <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: 'var(--bg-elevated, #FFFFFF)',
            borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{
                  background: 'var(--surface-2, #F1F5F9)',
                  border: '1px solid var(--border-subtle, #E2E8F0)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary, #334155)',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={16} /> Back
              </button>

              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                <span style={{ display: 'flex' }}><LogoIcon /></span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #0F172A)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    IMUPilot
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary, #64748B)', fontWeight: 500 }}>
                    Powered by TMM
                  </span>
                </div>
              </Link>
            </div>

            <Link
              to="/auth"
              style={{
                background: 'var(--accent-navy, #1B3A6B)',
                color: '#FFFFFF',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Sign In <ArrowRight size={14} />
            </Link>
          </header>

          {mainContent}

          <Footer />
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => {
          setShowUpgrade(false);
          fetchUserPlan();
        }}
        userId={userId}
        title="Upgrade to IMUPilot Pro"
        subtitle="Instant access to all 19+ mock tests, notes, sectional tests, and mock interviews"
      />
    </>
  );
}
