import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Eye,
  Database,
  CreditCard,
  UserCheck,
  Mail,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { LogoIcon } from '../components/Icons';
import { Footer } from '../components/Footer';

const SECTIONS = [
  { id: 'privacy-commitment', label: 'Privacy Commitment' },
  { id: 'information-we-collect', label: '1. Information We Collect' },
  { id: 'how-we-use-information', label: '2. How We Use Your Information' },
  { id: 'payments-razorpay', label: '3. Payments Through Razorpay' },
  { id: 'anti-cheat-monitoring', label: '4. Mock Test Monitoring & Anti-Cheat' },
  { id: 'data-storage-security', label: '5. Data Storage and Security' },
  { id: 'third-party-services', label: '6. Third-Party Services' },
  { id: 'data-retention-deletion', label: '7. Data Retention and Deletion' },
  { id: 'privacy-choices-requests', label: '8. Your Privacy Choices & Requests' },
  { id: 'childrens-privacy', label: "9. Children's Privacy" },
  { id: 'policy-changes', label: '10. Changes to This Policy' },
  { id: 'contact-us', label: '11. Contact Us' },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('privacy-commitment');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 140;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      lineHeight: 1.65,
    }}>
      {/* ── TOPBAR NAVIGATION ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => navigate(-1)}
            type="button"
            style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              color: '#334155',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#E2E8F0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#F1F5F9')}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#0F172A' }}>
            <span style={{ display: 'flex', color: '#0F172A' }}><LogoIcon /></span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                IMUPilot
              </span>
              <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>Powered by TMM</span>
            </div>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user ? (
            <Link
              to="/dashboard"
              style={{
                background: '#1B3A6B',
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
              Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              to="/auth"
              style={{
                background: '#1B3A6B',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Candidate Portal
            </Link>
          )}
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '48px 24px 40px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#F1F5F9',
          border: '1px solid #E2E8F0',
          padding: '6px 14px',
          borderRadius: '999px',
          color: '#1B3A6B',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '14px',
        }}>
          <Shield size={14} color="#1B3A6B" /> IMUPilot Legal &amp; Compliance
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 38px)',
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.03em',
          margin: '0 0 10px',
        }}>
          Privacy Policy
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#64748B',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <Clock size={14} /> Last Updated: 28 October 2026
        </p>
      </section>

      {/* ── MAIN CONTENT LAYOUT ── */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px 80px',
        display: 'grid',
        gridTemplateColumns: '270px 1fr',
        gap: '36px',
        alignItems: 'start',
      }} className="privacy-grid-container">

        {/* SIDEBAR NAVIGATION (STICKY) */}
        <aside style={{
          position: 'sticky',
          top: '84px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '16px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }} className="privacy-toc-sidebar">
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px',
            paddingLeft: '10px',
          }}>
            Contents
          </div>
          {SECTIONS.map((sec) => {
            const isCurrent = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollTo(sec.id)}
                style={{
                  textAlign: 'left',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isCurrent ? '#F1F5F9' : 'transparent',
                  color: isCurrent ? '#1B3A6B' : '#475569',
                  fontWeight: isCurrent ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  borderLeft: isCurrent ? '3px solid #1B3A6B' : '3px solid transparent',
                }}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sec.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* CONTENT ARTICLES */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
        }} className="privacy-content-card">

          {/* ── PRIVACY COMMITMENT ── */}
          <section id="privacy-commitment" style={{ scrollMarginTop: '100px' }}>
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#1B3A6B',
                margin: '0 0 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Shield size={18} color="#1B3A6B" /> Privacy Commitment
              </h2>
              <p style={{ margin: '0 0 12px', fontSize: '15px', color: '#334155', lineHeight: 1.7 }}>
                At IMUPilot, we respect your privacy. This Privacy Policy explains what personal information we collect, how we use it, how it is protected, and how you can contact us about your data.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#0F172A',
              }}>
                <CheckCircle2 size={16} color="#16A34A" /> We do not sell your personal information to third parties.
              </div>
            </div>
          </section>

          {/* ── 1. INFORMATION WE COLLECT ── */}
          <section id="information-we-collect" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              1. Information We Collect
            </h2>
            <p style={{ margin: '0 0 16px', color: '#475569', fontSize: '14.5px' }}>
              Depending on how you use IMUPilot, we may collect:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 18px' }}>
                <strong style={{ color: '#0F172A' }}>Account information:</strong>{' '}
                <span style={{ color: '#334155' }}>Name, email address, mobile number, and account details.</span>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 18px' }}>
                <strong style={{ color: '#0F172A' }}>Learning information:</strong>{' '}
                <span style={{ color: '#334155' }}>Mock test answers, scores, time taken, accuracy, topic performance, and revision progress.</span>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 18px' }}>
                <strong style={{ color: '#0F172A' }}>Payment information:</strong>{' '}
                <span style={{ color: '#334155' }}>Subscription plan, payment status, transaction references, and relevant order or payment IDs.</span>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px 18px' }}>
                <strong style={{ color: '#0F172A' }}>Technical information:</strong>{' '}
                <span style={{ color: '#334155' }}>Information needed to operate and secure the platform, such as browser visibility changes during mock tests, fullscreen events, and technical error logs, where these features are enabled.</span>
              </div>
            </div>
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13.5px',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertCircle size={16} color="#D97706" />
              <span>Please do not share passwords, payment credentials, or other sensitive information in support messages.</span>
            </div>
          </section>

          {/* ── 2. HOW WE USE YOUR INFORMATION ── */}
          <section id="how-we-use-information" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              2. How We Use Your Information
            </h2>
            <p style={{ margin: '0 0 14px', color: '#475569', fontSize: '14.5px' }}>
              We use collected information to:
            </p>
            <ul style={{
              margin: '0 0 16px',
              paddingLeft: '22px',
              color: '#334155',
              fontSize: '14.5px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <li>Create and manage your account.</li>
              <li>Deliver mock tests, learning resources, and subscription features.</li>
              <li>Calculate scores and provide performance analytics.</li>
              <li>Recommend topics for revision based on your learning activity.</li>
              <li>Process payments and manage subscriptions.</li>
              <li>Respond to support requests and resolve technical issues.</li>
              <li>Maintain platform security, prevent misuse, and improve our services.</li>
            </ul>
            <p style={{ margin: 0, color: '#64748B', fontSize: '13.5px', fontStyle: 'italic' }}>
              We use your information for these purposes and other purposes disclosed to you when applicable.
            </p>
          </section>

          {/* ── 3. PAYMENTS THROUGH RAZORPAY ── */}
          <section id="payments-razorpay" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              3. Payments Through Razorpay
            </h2>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              IMUPilot uses Razorpay to process subscription payments.
            </p>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              Payment processing is handled through Razorpay's payment systems. We do not intend to store your full card number, CVV, or net banking password on IMUPilot's servers.
            </p>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              We may retain transaction references, payment status, order IDs, and other information necessary to verify payments, manage subscriptions, handle refunds, and maintain required records.
            </p>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
              Your payment information is also subject to the applicable terms and privacy practices of Razorpay.
            </p>
          </section>

          {/* ── 4. MOCK TEST MONITORING AND ANTI-CHEAT FEATURES ── */}
          <section id="anti-cheat-monitoring" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              4. Mock Test Monitoring and Anti-Cheat Features
            </h2>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              During mock examinations, certain test features may monitor browser visibility and fullscreen status to support exam integrity.
            </p>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              Depending on the features enabled, relevant events may be recorded to identify when a test page loses visibility or fullscreen mode changes.
            </p>
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '12px',
              color: '#1B3A6B',
              fontSize: '14px',
            }}>
              <strong>Clear Monitoring Boundaries:</strong> IMUPilot does not use webcam or microphone recording as part of these monitoring features. We do not claim to monitor other desktop applications unless such a feature is explicitly introduced and disclosed.
            </div>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
              Monitoring information may be used to review suspicious test activity and maintain the integrity of practice examinations.
            </p>
          </section>

          {/* ── 5. DATA STORAGE AND SECURITY ── */}
          <section id="data-storage-security" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              5. Data Storage and Security
            </h2>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              IMUPilot uses cloud services, including Supabase where configured, to support account management and data storage.
            </p>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              We take reasonable technical and organisational measures to protect personal information against unauthorised access, disclosure, alteration, or loss.
            </p>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
              Access controls and database security policies are intended to restrict access to student records to authorised purposes. However, no online service can guarantee absolute security.
            </p>
          </section>

          {/* ── 6. THIRD-PARTY SERVICES ── */}
          <section id="third-party-services" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              6. Third-Party Services
            </h2>
            <p style={{ margin: '0 0 14px', color: '#475569', fontSize: '14.5px' }}>
              We may use third-party service providers to operate IMUPilot, including services for:
            </p>
            <ul style={{
              margin: '0 0 16px',
              paddingLeft: '22px',
              color: '#334155',
              fontSize: '14.5px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <li>Authentication and database hosting.</li>
              <li>Payment processing.</li>
              <li>Email delivery and customer support.</li>
              <li>Website hosting, diagnostics, and analytics, where enabled.</li>
            </ul>
            <p style={{ margin: '0 0 12px', color: '#475569', fontSize: '14px' }}>
              These providers may process information as needed to deliver their services, subject to their applicable terms and privacy practices.
            </p>
            <div style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13.5px',
              fontWeight: 600,
              color: '#1B3A6B',
            }}>
              We do not sell student personal information to these providers.
            </div>
          </section>

          {/* ── 7. DATA RETENTION AND DELETION ── */}
          <section id="data-retention-deletion" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              7. Data Retention and Deletion
            </h2>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              We retain personal information for as long as reasonably necessary to provide our services, maintain your account and learning history, resolve disputes, protect platform security, and meet applicable legal or accounting requirements.
            </p>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              You may request account deletion or deletion of eligible personal information by contacting us using the details below.
            </p>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
              Some information may need to be retained where required by law or for legitimate transaction, security, or dispute-resolution purposes. We will explain any applicable limitations when responding to a request.
            </p>
          </section>

          {/* ── 8. YOUR PRIVACY CHOICES AND REQUESTS ── */}
          <section id="privacy-choices-requests" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              8. Your Privacy Choices and Requests
            </h2>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              You may contact us to request access to, correction of, or deletion of your personal information, subject to applicable law.
            </p>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              You may also contact us with questions about how your information is used or to raise a privacy concern.
            </p>
            <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
              We will review requests and respond in accordance with applicable requirements. Identity verification may be necessary before we make changes to an account or disclose account information.
            </p>
          </section>

          {/* ── 9. CHILDREN'S PRIVACY ── */}
          <section id="childrens-privacy" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              9. Children's Privacy
            </h2>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              IMUPilot is an educational platform that may be used by students, including students under 18.
            </p>
            <p style={{ margin: 0, color: '#334155', fontSize: '14.5px' }}>
              Where applicable law requires parental or guardian consent or additional safeguards for a minor's personal information, we will follow the requirements applicable to our service.
            </p>
          </section>

          {/* ── 10. CHANGES TO THIS POLICY ── */}
          <section id="policy-changes" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              10. Changes to This Policy
            </h2>
            <p style={{ margin: 0, color: '#334155', fontSize: '14.5px' }}>
              We may update this Privacy Policy as our services, technology, or legal obligations change. The latest version will be published on this page with its updated date.
            </p>
          </section>

          {/* ── 11. CONTACT US ── */}
          <section id="contact-us" style={{ scrollMarginTop: '100px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 14px',
              paddingBottom: '8px',
              borderBottom: '1px solid #F1F5F9',
            }}>
              11. Contact Us
            </h2>
            <p style={{ margin: '0 0 18px', color: '#475569', fontSize: '14.5px' }}>
              For privacy questions, account deletion requests, or complaints, contact IMUPilot:
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}>
              {/* Email Card */}
              <a
                href="mailto:imupilot@gmail.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#1B3A6B';
                  e.currentTarget.style.background = '#F1F5F9';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.background = '#F8FAFC';
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#1B3A6B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    Email Support
                  </div>
                  <div style={{ fontSize: '15px', color: '#1B3A6B', fontWeight: 700 }}>
                    imupilot@gmail.com
                  </div>
                </div>
              </a>

              {/* WhatsApp Card */}
              <a
                href="https://wa.me/917606963299"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#16A34A';
                  e.currentTarget.style.background = '#F0FDF4';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.background = '#F8FAFC';
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                    WhatsApp Support
                  </div>
                  <div style={{ fontSize: '15px', color: '#16A34A', fontWeight: 700 }}>
                    +91 76069 63299
                  </div>
                </div>
              </a>
            </div>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '12px 18px',
              fontSize: '13.5px',
              color: '#475569',
              marginBottom: '16px',
            }}>
              <strong>Location:</strong> India
            </div>

            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13.5px',
              color: '#991B1B',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertCircle size={16} color="#DC2626" />
              <span>Please do not share your password, CVV, or full payment credentials when contacting support.</span>
            </div>
          </section>
        </div>
      </main>

      {/* ── RESPONSIVE STYLE TWEAKS ── */}
      <style>{`
        @media (max-width: 900px) {
          .privacy-grid-container {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding: 24px 16px 60px !important;
          }
          .privacy-toc-sidebar {
            display: none !important;
          }
          .privacy-content-card {
            padding: 24px 18px !important;
          }
        }
      `}</style>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
