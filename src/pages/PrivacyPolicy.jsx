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
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { LogoIcon } from '../components/Icons';

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

  useEffect(() => {
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
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      lineHeight: 1.65,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

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
              transition: 'all 0.15s ease',
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
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '50px 24px 44px',
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
          <Shield size={14} color="#1B3A6B" /> Official Privacy Policy
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 38px)',
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.03em',
          margin: '0 0 12px',
        }}>
          Privacy &amp; Data Protection
        </h1>

        <p style={{
          fontSize: '15px',
          color: '#64748B',
          maxWidth: '620px',
          margin: '0 auto 18px',
          lineHeight: 1.6,
        }}>
          How IMUpilot collects, protects, and manages your personal information, test attempt history, and payment transactions.
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: '12px',
          color: '#64748B',
          background: '#F8FAFC',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={13} /> Effective: October 2026
          </span>
          <span>•</span>
          <span>Compliant with Indian IT Act &amp; DPDP Act</span>
        </div>
      </div>

      {/* ── MAIN CONTENT LAYOUT ── */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px 80px',
        display: 'grid',
        gridTemplateColumns: '270px 1fr',
        gap: '36px',
        alignItems: 'start',
      }}>
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
                onClick={() => scrollTo(sec.id)}
                style={{
                  textAlign: 'left',
                  background: isCurrent ? '#1B3A6B' : 'transparent',
                  color: isCurrent ? '#FFFFFF' : '#475569',
                  border: 'none',
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
              </button>
            );
          })}

          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9',
            fontSize: '12px',
            color: '#64748B',
          }}>
            Support: <a href="mailto:imupilot@gmail.com" style={{ color: '#1B3A6B', fontWeight: 600, textDecoration: 'none' }}>imupilot@gmail.com</a>
          </div>
        </aside>

        {/* POLICY ARTICLES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* 1. Introduction */}
          <section id="introduction" style={cardStyle}>
            <div style={badgeStyle}>
              <FileText size={15} color="#1B3A6B" />
              <span>Section 1</span>
            </div>
            <h2 style={h2Style}>1. Introduction &amp; Overview</h2>
            <p style={pStyle}>
              Welcome to <strong>IMUpilot</strong> (operated as "IMUpilot", "we", "our", or "us"), powered by TMM. We provide an online preparation ecosystem for the Indian Maritime University Common Entrance Test (<strong>IMUCET</strong>) and Diploma in Nautical Science (<strong>DNS</strong>) company sponsorship examinations accessible via <a href="https://imupilot.in" target="_blank" rel="noreferrer" style={{ color: '#1B3A6B', fontWeight: 600 }}>https://imupilot.in</a>.
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
              <Database size={15} color="#1B3A6B" />
              <span>Section 2</span>
            </div>
            <h2 style={h2Style}>2. Information We Collect</h2>
            <p style={pStyle}>
              We collect information that is strictly necessary to provide an authentic, personalized, and secure testing environment:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '16px' }}>
              <div style={subCardStyle}>
                <div style={iconBoxStyle}><UserCheck size={18} color="#1B3A6B" /></div>
                <h3 style={h3Style}>Account &amp; Profile Data</h3>
                <p style={pSmallStyle}>
                  Your full name, email address, mobile phone number, avatar/profile image, target examination year, and authentication credentials managed securely via Supabase Auth.
                </p>
              </div>

              <div style={subCardStyle}>
                <div style={iconBoxStyle}><CheckCircle2 size={18} color="#16A34A" /></div>
                <h3 style={h3Style}>Academic &amp; Test Engine Data</h3>
                <p style={pSmallStyle}>
                  Mock test answer selections, section timing, accuracy percentages, test attempt histories, smart revision bookmark states, and score cards.
                </p>
              </div>

              <div style={subCardStyle}>
                <div style={iconBoxStyle}><CreditCard size={18} color="#D97706" /></div>
                <h3 style={h3Style}>Payment Metadata</h3>
                <p style={pSmallStyle}>
                  Transaction amount (₹999), payment status, Razorpay Order ID, and Razorpay Payment ID. <em>We never store credit card numbers, CVVs, or bank net banking credentials.</em>
                </p>
              </div>

              <div style={subCardStyle}>
                <div style={iconBoxStyle}><Eye size={18} color="#1B3A6B" /></div>
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
              <Sparkles size={15} color="#1B3A6B" />
              <span>Section 3</span>
            </div>
            <h2 style={h2Style}>3. How We Use Your Information</h2>
            <p style={pStyle}>
              The collected information is used solely for educational, analytical, and operational purposes:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
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
              <CreditCard size={15} color="#1B3A6B" />
              <span>Section 4</span>
            </div>
            <h2 style={h2Style}>4. Payments &amp; Razorpay Integration</h2>
            <p style={pStyle}>
              We use <strong>Razorpay Software Private Limited</strong> ("Razorpay") as our third-party payment gateway for processing transactions for IMUpilot Pro (₹999 one-time).
            </p>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px', margin: '14px 0' }}>
              <div style={{ fontWeight: 700, color: '#1B3A6B', fontSize: '14px', marginBottom: '6px' }}>
                PCI-DSS Level 1 Compliant Checkout
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
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
              <Eye size={15} color="#1B3A6B" />
              <span>Section 5</span>
            </div>
            <h2 style={h2Style}>5. CBT Exam Environment &amp; Anti-Cheat Proctoring</h2>
            <p style={pStyle}>
              To simulate the actual Indian Maritime University examination, our mock test interface implements client-side proctoring controls:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <li><strong>Auto Fullscreen:</strong> Tests request standard HTML5 fullscreen mode to prevent background app interference.</li>
              <li><strong>Tab Switching Monitor:</strong> If a candidate switches browser tabs or navigates away from the examination window, warning strikes are tallied. Repeated violations trigger automatic test submission.</li>
              <li><strong>Proctoring Integrity:</strong> We do NOT capture webcams, audio recordings, or desktop screen recordings. Only browser visibility state transitions are recorded.</li>
            </ul>
          </section>

          {/* 6. Storage & Security */}
          <section id="data-storage" style={cardStyle}>
            <div style={badgeStyle}>
              <Lock size={15} color="#1B3A6B" />
              <span>Section 6</span>
            </div>
            <h2 style={h2Style}>6. Data Storage &amp; Security Measures</h2>
            <p style={pStyle}>
              We implement industry-standard security safeguards to prevent unauthorized access, accidental alteration, or disclosure of your data:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <li><strong>Cloud Storage:</strong> Application data is hosted securely in cloud databases managed by Supabase, with encrypted connections over TLS 1.3.</li>
              <li><strong>Row Level Security (RLS):</strong> User profiles and test attempt records are isolated using database-level policies ensuring students can only read and write their own data.</li>
              <li><strong>HTTPS Encryption:</strong> All data transmitted between your browser and our servers is encrypted using Secure Sockets Layer (SSL).</li>
            </ul>
          </section>

          {/* 7. Cookies & Local Storage */}
          <section id="cookies-localstorage" style={cardStyle}>
            <div style={badgeStyle}>
              <Database size={15} color="#1B3A6B" />
              <span>Section 7</span>
            </div>
            <h2 style={h2Style}>7. Cookies &amp; Local Storage</h2>
            <p style={pStyle}>
              IMUpilot uses standard browser <code>localStorage</code> and session tokens:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
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
              <UserCheck size={15} color="#1B3A6B" />
              <span>Section 8</span>
            </div>
            <h2 style={h2Style}>8. Third-Party Services &amp; Data Sharing</h2>
            <p style={pStyle}>
              <strong>We never sell, rent, or trade your personal data to advertisers or telemarketers.</strong>
            </p>
            <p style={pStyle}>
              We only share relevant information with trusted service providers who help us operate the platform under strict confidentiality agreements:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <li><strong>Razorpay:</strong> Payment processing and dispute resolution.</li>
              <li><strong>Supabase:</strong> Authentication, relational database hosting, and secure file storage.</li>
              <li><strong>Vercel:</strong> Cloud hosting, serverless functions, and content delivery network (CDN).</li>
              <li><strong>Legal Compliance:</strong> If required by Indian law, judicial summons, or government authorities to comply with statutory legal processes.</li>
            </ul>
          </section>

          {/* 9. User Rights */}
          <section id="user-rights" style={cardStyle}>
            <div style={badgeStyle}>
              <Shield size={15} color="#1B3A6B" />
              <span>Section 9</span>
            </div>
            <h2 style={h2Style}>9. Your Rights &amp; Data Control</h2>
            <p style={pStyle}>
              Under applicable Indian data protection laws, you possess the following rights regarding your personal information:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '14px' }}>
              <div style={miniFeatureStyle}>
                <strong style={{ color: '#0F172A' }}>Right to Access:</strong> View all mock attempts, profile details, and test scores in your personal analytics dashboard.
              </div>
              <div style={miniFeatureStyle}>
                <strong style={{ color: '#0F172A' }}>Right to Correction:</strong> Update your profile name, contact phone, or password at any time via Account Settings.
              </div>
              <div style={miniFeatureStyle}>
                <strong style={{ color: '#0F172A' }}>Right to Deletion:</strong> Request full erasure of your account and test history by emailing our support team.
              </div>
              <div style={miniFeatureStyle}>
                <strong style={{ color: '#0F172A' }}>Right to Withdraw Consent:</strong> Opt out of optional reminders or update notification settings.
              </div>
            </div>
          </section>

          {/* 10. Contact & Grievance */}
          <section id="contact-us" style={cardStyle}>
            <div style={badgeStyle}>
              <Mail size={15} color="#1B3A6B" />
              <span>Section 10</span>
            </div>
            <h2 style={h2Style}>10. Grievance Redressal &amp; Contact Us</h2>
            <p style={pStyle}>
              If you have any questions, concerns, or requests regarding this Privacy Policy, your personal data, or payment verification, please reach out to our team:
            </p>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#0F172A', minWidth: '120px' }}>Platform:</span>
                <span style={{ color: '#475569' }}>IMUpilot (Powered by TMM)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#0F172A', minWidth: '120px' }}>Email:</span>
                <a href="mailto:imupilot@gmail.com" style={{ color: '#1B3A6B', textDecoration: 'none', fontWeight: 600 }}>
                  imupilot@gmail.com
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#0F172A', minWidth: '120px' }}>WhatsApp / Tel:</span>
                <a href="https://wa.me/917077664992" target="_blank" rel="noreferrer" style={{ color: '#16A34A', textDecoration: 'none', fontWeight: 600 }}>
                  +91 70776 64992
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#0F172A', minWidth: '120px' }}>Location:</span>
                <span style={{ color: '#475569' }}>India</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#0F172A', minWidth: '120px' }}>Response Time:</span>
                <span style={{ color: '#475569' }}>Within 24 to 48 business hours</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to="/contact"
                style={{
                  background: '#1B3A6B',
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
                  background: '#F1F5F9',
                  color: '#334155',
                  border: '1px solid #E2E8F0',
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
        borderTop: '1px solid #E2E8F0',
        background: '#FFFFFF',
        padding: '30px 24px',
        textAlign: 'center',
        color: '#64748B',
        fontSize: '13px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            © 2026 IMUpilot. Powered by TMM. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/privacy" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/contact" style={{ color: '#64748B', textDecoration: 'none' }}>Contact Us</Link>
            <Link to="/auth" style={{ color: '#64748B', textDecoration: 'none' }}>Candidate Portal</Link>
          </div>
        </div>
      </footer>

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 860px) {
          .privacy-toc-sidebar {
            display: none !important;
          }
          div[style*="gridTemplateColumns: '270px 1fr'"],
          div[style*="grid-template-columns: 270px 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Shared Inline Styles matching IMUpilot Theme ──
const cardStyle = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '16px',
  padding: '30px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: '#F1F5F9',
  border: '1px solid #E2E8F0',
  padding: '4px 10px',
  borderRadius: '6px',
  color: '#1B3A6B',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '12px',
};

const h2Style = {
  fontSize: '20px',
  fontWeight: 800,
  color: '#0F172A',
  letterSpacing: '-0.02em',
  margin: '0 0 14px',
};

const h3Style = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#0F172A',
  margin: '0 0 6px',
};

const pStyle = {
  fontSize: '14.5px',
  color: '#334155',
  lineHeight: 1.7,
  margin: '0 0 14px',
};

const pSmallStyle = {
  fontSize: '13px',
  color: '#64748B',
  lineHeight: 1.55,
  margin: 0,
};

const subCardStyle = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '18px',
};

const iconBoxStyle = {
  width: 34,
  height: 34,
  borderRadius: '8px',
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '10px',
};

const miniFeatureStyle = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '10px',
  padding: '14px',
  fontSize: '13px',
  color: '#475569',
  lineHeight: 1.5,
};
