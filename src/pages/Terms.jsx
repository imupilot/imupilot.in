import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  ChevronLeft,
  ArrowRight,
  Shield,
  Clock,
  BookOpen,
  CreditCard,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { LogoIcon } from '../components/Icons';
import { Footer } from '../components/Footer';

export default function Terms() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          <FileText size={14} color="#1B3A6B" /> Terms of Service
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 38px)',
          fontWeight: 800,
          color: '#0F172A',
          letterSpacing: '-0.03em',
          margin: '0 0 10px',
        }}>
          Terms &amp; Conditions
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

      {/* ── CONTENT CONTAINER ── */}
      <main style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '40px 24px 80px',
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '20px 24px',
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#1B3A6B', margin: '0 0 8px' }}>
              Welcome to IMUPilot
            </h2>
            <p style={{ margin: 0, fontSize: '14.5px', color: '#334155' }}>
              By accessing or using the IMUPilot online platform, you agree to comply with and be bound by these Terms and Conditions. Please read them carefully before using our learning and test simulation services.
            </p>
          </div>

          <section>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px' }}>
              1. Educational Service
            </h3>
            <p style={{ margin: 0, color: '#334155', fontSize: '14.5px' }}>
              IMUPilot provides preparatory Computer-Based Test (CBT) mock simulations, syllabus notes, practice tests, and DNS sponsorship preparation materials for IMUCET candidates. IMUPilot is an independent educational preparatory service and is not affiliated with the Indian Maritime University.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px' }}>
              2. User Accounts &amp; Access
            </h3>
            <p style={{ margin: 0, color: '#334155', fontSize: '14.5px' }}>
              You are responsible for maintaining the confidentiality of your account credentials. Each account is for individual student use only. Sharing account credentials or granting unauthorized third-party access to mock examinations may result in suspension or termination of access.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px' }}>
              3. Subscriptions &amp; Payments
            </h3>
            <p style={{ margin: 0, color: '#334155', fontSize: '14.5px' }}>
              Subscription plans grant access to the full mock test catalog, curated chapters, and analytics. Payments are processed securely via Razorpay. Pricing, feature availability, and payment terms are presented at the time of purchase.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px' }}>
              4. Mock Test Integrity
            </h3>
            <p style={{ margin: 0, color: '#334155', fontSize: '14.5px' }}>
              During mock exams, our platform may monitor fullscreen status and browser tab switching to simulate exam conditions and encourage honest self-assessment. Users agree not to attempt to circumvent test timing or integrity checks.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px' }}>
              5. Intellectual Property
            </h3>
            <p style={{ margin: 0, color: '#334155', fontSize: '14.5px' }}>
              All questions, solutions, analytics engines, designs, and content provided on IMUPilot are the intellectual property of IMUPilot. Unauthorized reproduction, distribution, scraping, or commercial resale of any content is strictly prohibited.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px' }}>
              6. Limitation of Liability
            </h3>
            <p style={{ margin: 0, color: '#334155', fontSize: '14.5px' }}>
              IMUPilot practice questions and mock examinations are provided for study and training purposes only. IMUPilot does not guarantee admission, ranks, or selection in official examinations or sponsorship interviews.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px' }}>
              7. Contact &amp; Inquiries
            </h3>
            <p style={{ margin: '0 0 12px', color: '#334155', fontSize: '14.5px' }}>
              If you have any questions regarding these Terms, please contact us:
            </p>
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '14px 18px',
              fontSize: '14px',
              color: '#334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div><strong>Email:</strong> <a href="mailto:imupilot@gmail.com" style={{ color: '#1B3A6B', fontWeight: 600 }}>imupilot@gmail.com</a></div>
              <div><strong>WhatsApp Support:</strong> <a href="https://wa.me/917606963299" target="_blank" rel="noopener noreferrer" style={{ color: '#16A34A', fontWeight: 600 }}>+91 76069 63299</a></div>
              <div><strong>Location:</strong> India</div>
            </div>
          </section>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}
