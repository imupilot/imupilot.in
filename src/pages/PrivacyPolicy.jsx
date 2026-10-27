import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Eye,
  Database,
  CreditCard,
  UserCheck,
  Bell,
  HelpCircle,
  Mail,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

const SECTIONS = [
  { id: 'introduction', label: '1. Introduction' },
  { id: 'information-collected', label: '2. Information We Collect' },
  { id: 'how-we-use', label: '3. How We Use Information' },
  { id: 'payment-processing', label: '4. Payments & Razorpay' },
  { id: 'cbt-proctoring', label: '5. CBT Exam & Anti-Cheat' },
  { id: 'data-storage', label: '6. Storage & Security' },
  { id: 'cookies-localstorage', label: '7. Cookies & Local Storage' },
  { id: 'data-sharing', label: '8. Third-Party Sharing' },
  { id: 'user-rights', label: '9. Your Rights & Control' },
  { id: 'contact-us', label: '10. Contact & Grievances' },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('introduction');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'DM Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      backgroundColor: '#0A0F1D',
      color: '#E2E8F0',
      lineHeight: 1.65,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── TOP NAVIGATION BAR ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10, 15, 29, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#F8FAFC',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
            }}>
              <Shield size={18} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              IMUpilot
            </span>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {user ? (
            <Link
              to="/dashboard"
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                color: '#FFFFFF',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              }}
            >
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              to="/auth"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <div style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 99, 235, 0.25), transparent)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '60px 24px 50px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(37, 99, 235, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          padding: '6px 14px',
          borderRadius: '999px',
          color: '#60A5FA',
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '16px',
        }}>
          <Lock size={13} /> Official Privacy Policy
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.03em',
          margin: '0 0 14px',
        }}>
          Your Privacy & Data Protection
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#94A3B8',
          maxWidth: '640px',
          margin: '0 auto 20px',
          lineHeight: 1.6,
        }}>
          At IMUpilot, we are committed to safeguarding your personal information, exam performance data, and payment privacy.
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '13px',
          color: '#64748B',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '6px 16px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={13} /> Effective: October 2026
          </span>
          <span>•</span>
          <span>Compliant with Indian IT Act & DPDP Act</span>
        </div>
      </div>

      {/* ── MAIN CONTENT LAYOUT ── */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px 80px',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '40px',
        alignItems: 'start',
      }}>
        {/* SIDEBAR NAVIGATION (STICKY) */}
        <aside style={{
          position: 'sticky',
          top: '90px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '14px',
          padding: '16px',
        }} className="privacy-toc-sidebar">
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px',
            paddingLeft: '10px',
          }}>
            Quick Navigation
          </div>
          {SECTIONS.map((sec) => {
            const isCurrent = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                style={{
                  textAlign: 'left',
                  background: isCurrent ? 'rgba(37, 99, 235, 0.16)' : 'transparent',
                  color: isCurrent ? '#60A5FA' : '#94A3B8',
                  border: isCurrent ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '13px',
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{sec.label}</span>
                {isCurrent && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA' }} />}
              </button>
            );
          })}

          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '12px',
            color: '#64748B',
          }}>
            Questions? Contact <a href="mailto:imupilot@gmail.com" style={{ color: '#60A5FA', textDecoration: 'none' }}>imupilot@gmail.com</a>
          </div>
        </aside>

        {/* POLICY ARTICLES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

          {/* 1. Introduction */}
          <section id="introduction" style={cardStyle}>
            <div style={badgeStyle}>
              <FileText size={16} color="#60A5FA" />
              <span>Section 1</span>
            </div>
            <h2 style={h2Style}>1. Introduction & Overview</h2>
            <p style={pStyle}>
              Welcome to <strong>IMUpilot</strong> (operated as "IMUpilot", "we", "our", or "us"), powered by TMM. We provide an online preparation ecosystem for the Indian Maritime University Common Entrance Test (<strong>IMUCET</strong>) and Diploma in Nautical Science (<strong>DNS</strong>) company sponsorship examinations accessible via <a href="https://imupilot.in" target="_blank" rel="noreferrer" style={{ color: '#60A5FA' }}>https://imupilot.in</a>.
            </p>
            <p style={pStyle}>
              This Privacy Policy explains how we collect, store, process, and protect your information when you access our web application, practice mock examinations, browse syllabus blueprint notes, utilize smart flashcard revision, or purchase our Pro plan.
            </p>
            <p style={pStyle}>
              By creating an account, registering via phone/email, or using our services, you consent to the data practices described in this policy. If you do not agree with any part of this policy, please refrain from using the platform.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section id="information-collected" style={cardStyle}>
            <div style={badgeStyle}>
              <Database size={16} color="#60A5FA" />
              <span>Section 2</span>
            </div>
            <h2 style={h2Style}>2. Information We Collect</h2>
            <p style={pStyle}>
              We collect information that is strictly necessary to provide an authentic, personalized, and secure testing environment:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '16px' }}>
              <div style={subCardStyle}>
                <div style={iconBoxStyle}><UserCheck size={18} color="#38BDF8" /></div>
                <h3 style={h3Style}>Account & Profile Data</h3>
                <p style={pSmallStyle}>
                  Your full name, email address, mobile phone number, avatar/profile image, target examination year, and authentication credentials managed securely via Supabase Auth.
                </p>
              </div>

              <div style={subCardStyle}>
                <div style={iconBoxStyle}><CheckCircle2 size={18} color="#4ADE80" /></div>
                <h3 style={h3Style}>Academic & Test Engine Data</h3>
                <p style={pSmallStyle}>
                  Mock test answer selections, section timing, accuracy percentages, test attempt histories, smart revision bookmark states, and score cards.
                </p>
              </div>

              <div style={subCardStyle}>
                <div style={iconBoxStyle}><CreditCard size={18} color="#FBBF24" /></div>
                <h3 style={h3Style}>Payment Metadata</h3>
                <p style={pSmallStyle}>
                  Transaction amount (₹999), payment status, Razorpay Order ID, and Razorpay Payment ID. <em>We never store credit card numbers, CVVs, or bank net banking credentials.</em>
                </p>
              </div>

              <div style={subCardStyle}>
                <div style={iconBoxStyle}><Eye size={18} color="#A78BFA" /></div>
                <h3 style={h3Style}>Exam Proctoring Telemetry</h3>
                <p style={pSmallStyle}>
                  Browser environment telemetry during active Computer Based Tests (CBT), including fullscreen loss events, tab-switching violations, and session timestamps.
                </p>
              </div>
            </div>
          </section>

          {/* 3. How We Use Information */}
          <section id="how-we-use" style={cardStyle}>
            <div style={badgeStyle}>
              <Sparkles size={16} color="#60A5FA" />
              <span>Section 3</span>
            </div>
            <h2 style={h2Style}>3. How We Use Your Information</h2>
            <p style={pStyle}>
              The collected information is used solely for educational, analytical, and operational purposes:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <li><strong>To deliver simulated CBT mock examinations:</strong> Generating authentic 200-question, 180-minute tests with negative marking calculations and question randomization.</li>
              <li><strong>To generate performance insights:</strong> Computing subject-wise breakdowns in Physics, Chemistry, Mathematics, English, and General Aptitude.</li>
              <li><strong>To verify and activate Pro upgrades:</strong> Granting unlimited mock test re-attempts, downloadable chapter notes, formula sheets, and DNS company flashcards.</li>
              <li><strong>To detect unfair practices:</strong> Enforcing strict anti-cheat proctoring algorithms that automatically record tab-switching infractions.</li>
              <li><strong>To provide customer assistance:</strong> Answering inquiries and resolving payment or study planner issues via WhatsApp or email.</li>
            </ul>
          </section>

          {/* 4. Payments & Razorpay */}
          <section id="payment-processing" style={cardStyle}>
            <div style={badgeStyle}>
              <CreditCard size={16} color="#60A5FA" />
              <span>Section 4</span>
            </div>
            <h2 style={h2Style}>4. Payments & Razorpay Integration</h2>
            <p style={pStyle}>
              We use <strong>Razorpay Software Private Limited</strong> ("Razorpay") as our third-party payment gateway for processing transactions for IMUpilot Pro (₹999 one-time).
            </p>
            <div style={{ background: 'rgba(30, 58, 138, 0.15)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '16px 20px', margin: '14px 0' }}>
              <div style={{ fontWeight: 700, color: '#93C5FD', fontSize: '14px', marginBottom: '6px' }}>
                PCI-DSS Level 1 Compliant Checkout
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1' }}>
                When you initiate a payment, you are redirected to Razorpay's secure checkout. All payment transactions, UPI requests, debit/credit cards, and net banking operations are encrypted under standard 256-bit encryption and processed under Razorpay's PCI-DSS compliant infrastructure.
              </p>
            </div>
            <p style={pStyle}>
              IMUpilot does not store or process your bank account details, CVV, or card numbers. We only receive a cryptographic payment confirmation containing your <code>razorpay_order_id</code> and <code>razorpay_payment_id</code> to activate your Pro privileges.
            </p>
          </section>

          {/* 5. CBT Exam & Anti-Cheat */}
          <section id="cbt-proctoring" style={cardStyle}>
            <div style={badgeStyle}>
              <Eye size={16} color="#60A5FA" />
              <span>Section 5</span>
            </div>
            <h2 style={h2Style}>5. CBT Exam Environment & Anti-Cheat Proctoring</h2>
            <p style={pStyle}>
              To simulate the actual Indian Maritime University examination, our mock test interface implements client-side proctoring controls:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <li><strong>Auto Fullscreen:</strong> Tests request standard HTML5 fullscreen mode to prevent background app interference.</li>
              <li><strong>Tab Switching Monitor:</strong> If a candidate switches browser tabs or navigates away from the examination window, warning strikes are tallied. Repeated violations trigger automatic test submission.</li>
              <li><strong>Proctoring Integrity:</strong> We do NOT capture webcams, audio recordings, or desktop screen recordings. Only browser visibility state transitions are recorded.</li>
            </ul>
          </section>

          {/* 6. Storage & Security */}
          <section id="data-storage" style={cardStyle}>
            <div style={badgeStyle}>
              <Lock size={16} color="#60A5FA" />
              <span>Section 6</span>
            </div>
            <h2 style={h2Style}>6. Data Storage & Security Measures</h2>
            <p style={pStyle}>
              We implement state-of-the-art security safeguards to prevent unauthorized access, accidental alteration, or disclosure of your data:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <li><strong>Cloud Storage:</strong> Application data is hosted securely in cloud databases managed by Supabase, with encrypted connections over TLS 1.3.</li>
              <li><strong>Row Level Security (RLS):</strong> User profiles and test attempt records are isolated using database-level policies ensuring students can only read and write their own data.</li>
              <li><strong>HTTPS Encryption:</strong> All data transmitted between your browser and our servers is encrypted using Secure Sockets Layer (SSL).</li>
            </ul>
          </section>

          {/* 7. Cookies & Local Storage */}
          <section id="cookies-localstorage" style={cardStyle}>
            <div style={badgeStyle}>
              <Database size={16} color="#60A5FA" />
              <span>Section 7</span>
            </div>
            <h2 style={h2Style}>7. Cookies & Local Storage</h2>
            <p style={pStyle}>
              IMUpilot uses standard browser <code>localStorage</code> and session tokens:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <li><strong>Authentication Tokens:</strong> Storing JWT session tokens so you remain logged in across page refreshes.</li>
              <li><strong>Offline Attempt Fallback:</strong> Storing recent mock test answer sheets in local storage (e.g. <code>imupilot_test_history_*</code>) to protect your work against intermittent internet disconnections.</li>
              <li><strong>Preferences:</strong> Remembering your UI theme selection and interface adjustments.</li>
            </ul>
            <p style={pStyle}>
              You can clear your browser's local storage and cookies at any time through your browser settings, though doing so may log you out of your active session.
            </p>
          </section>

          {/* 8. Third-Party Sharing */}
          <section id="data-sharing" style={cardStyle}>
            <div style={badgeStyle}>
              <UserCheck size={16} color="#60A5FA" />
              <span>Section 8</span>
            </div>
            <h2 style={h2Style}>8. Third-Party Services & Data Sharing</h2>
            <p style={pStyle}>
              <strong>We never sell, rent, or trade your personal data to advertisers or telemarketers.</strong>
            </p>
            <p style={pStyle}>
              We only share relevant information with trusted service providers who help us operate the platform under strict confidentiality agreements:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <li><strong>Razorpay:</strong> Payment processing and dispute resolution.</li>
              <li><strong>Supabase:</strong> Authentication, relational database hosting, and secure file storage.</li>
              <li><strong>Vercel:</strong> Cloud hosting, serverless functions, and content delivery network (CDN).</li>
              <li><strong>Legal Compliance:</strong> If required by Indian law, judicial summons, or government authorities to comply with statutory legal processes.</li>
            </ul>
          </section>

          {/* 9. User Rights */}
          <section id="user-rights" style={cardStyle}>
            <div style={badgeStyle}>
              <Shield size={16} color="#60A5FA" />
              <span>Section 9</span>
            </div>
            <h2 style={h2Style}>9. Your Rights & Data Control</h2>
            <p style={pStyle}>
              Under applicable Indian data protection laws, you possess the following rights regarding your personal information:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '14px' }}>
              <div style={miniFeatureStyle}>
                <strong>Right to Access:</strong> View all mock attempts, profile details, and test scores in your personal analytics dashboard.
              </div>
              <div style={miniFeatureStyle}>
                <strong>Right to Correction:</strong> Update your profile name, contact phone, or password at any time via Account Settings.
              </div>
              <div style={miniFeatureStyle}>
                <strong>Right to Deletion:</strong> Request full erasure of your account and test history by emailing our support team.
              </div>
              <div style={miniFeatureStyle}>
                <strong>Right to Withdraw Consent:</strong> Opt out of optional reminders or update notification settings.
              </div>
            </div>
          </section>

          {/* 10. Contact & Grievance */}
          <section id="contact-us" style={{
            ...cardStyle,
            border: '1px solid rgba(59, 130, 246, 0.4)',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 29, 0.95) 100%)',
          }}>
            <div style={badgeStyle}>
              <Mail size={16} color="#60A5FA" />
              <span>Section 10</span>
            </div>
            <h2 style={h2Style}>10. Grievance Redressal & Contact Us</h2>
            <p style={pStyle}>
              If you have any questions, concerns, or requests regarding this Privacy Policy, your personal data, or payment verification, please reach out to our dedicated Grievance Officer:
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#FFFFFF', minWidth: '120px' }}>Platform:</span>
                <span style={{ color: '#94A3B8' }}>IMUpilot (Powered by TMM)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#FFFFFF', minWidth: '120px' }}>Email:</span>
                <a href="mailto:imupilot@gmail.com" style={{ color: '#60A5FA', textDecoration: 'none', fontWeight: 600 }}>
                  imupilot@gmail.com
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#FFFFFF', minWidth: '120px' }}>WhatsApp / Tel:</span>
                <a href="https://wa.me/917077664992" target="_blank" rel="noreferrer" style={{ color: '#34D399', textDecoration: 'none', fontWeight: 600 }}>
                  +91 70776 64992
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#FFFFFF', minWidth: '120px' }}>Location:</span>
                <span style={{ color: '#94A3B8' }}>India</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#FFFFFF', minWidth: '120px' }}>Response Time:</span>
                <span style={{ color: '#94A3B8' }}>Within 24 to 48 business hours</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to="/contact"
                style={{
                  background: '#2563EB',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Go to Contact Page <ArrowRight size={14} />
              </Link>
              <Link
                to="/"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#CBD5E1',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Back to Home
              </Link>
            </div>
          </section>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#070B14',
        padding: '32px 24px',
        textAlign: 'center',
        color: '#64748B',
        fontSize: '13px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            © 2026 IMUpilot. Powered by TMM. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/privacy" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/contact" style={{ color: '#94A3B8', textDecoration: 'none' }}>Contact Us</Link>
            <Link to="/auth" style={{ color: '#94A3B8', textDecoration: 'none' }}>Candidate Portal</Link>
          </div>
        </div>
      </footer>

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 860px) {
          .privacy-toc-sidebar {
            display: none !important;
          }
          div[style*="gridTemplateColumns: '280px 1fr'"],
          div[style*="grid-template-columns: 280px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Shared Inline Styles ──
const cardStyle = {
  background: 'rgba(15, 23, 42, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '16px',
  padding: '32px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(37, 99, 235, 0.15)',
  border: '1px solid rgba(59, 130, 246, 0.25)',
  padding: '4px 10px',
  borderRadius: '6px',
  color: '#60A5FA',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '12px',
};

const h2Style = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#FFFFFF',
  letterSpacing: '-0.02em',
  margin: '0 0 14px',
};

const h3Style = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#F8FAFC',
  margin: '0 0 6px',
};

const pStyle = {
  fontSize: '14.5px',
  color: '#94A3B8',
  lineHeight: 1.7,
  margin: '0 0 14px',
};

const pSmallStyle = {
  fontSize: '13px',
  color: '#94A3B8',
  lineHeight: 1.55,
  margin: 0,
};

const subCardStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '12px',
  padding: '18px',
};

const iconBoxStyle = {
  width: 34,
  height: 34,
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '10px',
};

const miniFeatureStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '10px',
  padding: '14px',
  fontSize: '13px',
  color: '#CBD5E1',
  lineHeight: 1.5,
};
