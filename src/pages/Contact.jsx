import { useState } from 'react';
import { Mail, MapPin, Clock, Send, ShieldCheck, ArrowRight } from 'lucide-react';
import IMUpilotSidebar from '../components/IMUpilotSidebar';

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.4 8.38 8.38 0 0 1 3.8.9L21 3.5Z"/>
  </svg>
);

const INFO = [
  { icon: <Mail size={18} />,      title: 'Email Us',      value: 'imupilot@gmail.com',      link: 'mailto:imupilot@gmail.com' },
  { icon: <WhatsAppIcon />,        title: 'WhatsApp',      value: '+91 70776 64992',           link: 'https://wa.me/917077664992' },
  { icon: <MapPin size={18} />,    title: 'Location',      value: 'India',                    link: null },
  { icon: <Clock size={18} />,     title: 'Support Hours', value: 'Mon–Sat: 9AM – 6PM IST',   link: null },
];

const FORMSPREE_URL = 'https://formspree.io/f/mkoawaen';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 9,
    border: '1px solid #E2E8F0',
    background: '#F8FAFC',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0F172A',
    transition: 'all 0.15s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  return (
    <>
      <style>{`
        .contact-layout {
          padding: 28px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }
        .contact-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 900px) {
          .contact-layout {
            grid-template-columns: 1fr !important;
            padding: 20px !important;
          }
        }
        @media (max-width: 600px) {
          .contact-row {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          fontFamily: "'DM Sans','Segoe UI',sans-serif",
          background: '#F8FAFC',
          color: '#0F172A',
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <IMUpilotSidebar />

        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          {/* Topbar */}
          <div
            style={{
              background: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0',
              padding: '0 28px',
              height: 58,
              display: 'flex',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 19,
                  letterSpacing: '-0.02em',
                  color: '#0F172A',
                }}
              >
                Contact Us
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                We're here to help you succeed
              </div>
            </div>
          </div>

          <div className="contact-layout">
            {/* FORM */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                padding: '28px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 17,
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                  marginBottom: 4,
                }}
              >
                Send us a Message
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>
                Fill out the form and we'll get back to you as soon as possible.
              </div>

              {status === 'success' && (
                <div
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #0F172A',
                    borderRadius: 10,
                    padding: '14px 16px',
                    marginBottom: 20,
                    fontSize: 13,
                    color: '#0F172A',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <ShieldCheck size={16} /> Message sent successfully! We'll get back to you soon.
                </div>
              )}
              {status === 'error' && (
                <div
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #94A3B8',
                    borderRadius: 10,
                    padding: '14px 16px',
                    marginBottom: 20,
                    fontSize: 13,
                    color: '#0F172A',
                    fontWeight: 600,
                  }}
                >
                  ✕ Something went wrong. Please try again or WhatsApp us directly.
                </div>
              )}

              <form onSubmit={submit}>
                <div className="contact-row">
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0F172A';
                        e.target.style.background = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.background = '#F8FAFC';
                      }}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0F172A';
                        e.target.style.background = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.background = '#F8FAFC';
                      }}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="contact-row">
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0F172A';
                        e.target.style.background = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.background = '#F8FAFC';
                      }}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={(e) => set('subject', e.target.value)}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0F172A';
                        e.target.style.background = '#FFFFFF';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.background = '#F8FAFC';
                      }}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={labelStyle}>Message *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Type your message here..."
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0F172A';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.background = '#F8FAFC';
                    }}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: 10,
                    border: 'none',
                    background: status === 'sending' ? '#64748B' : '#0F172A',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: status === 'sending' ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (status !== 'sending') e.currentTarget.style.background = '#1E293B';
                  }}
                  onMouseLeave={(e) => {
                    if (status !== 'sending') e.currentTarget.style.background = '#0F172A';
                  }}
                >
                  {status === 'sending' ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={15} /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* INFO SIDEBAR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {INFO.map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 14,
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0F172A',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#64748B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 3,
                      }}
                    >
                      {item.title}
                    </div>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0F172A',
                          textDecoration: 'none',
                        }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0F172A',
                        }}
                      >
                        {item.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Priority Support Card */}
              <div
                style={{
                  background: '#0F172A',
                  border: '1px solid #1E293B',
                  borderRadius: 16,
                  padding: '22px 20px',
                  marginTop: 6,
                  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.15)',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#FFFFFF',
                    marginBottom: 6,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Priority Support
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#94A3B8',
                    marginBottom: 18,
                    lineHeight: 1.6,
                  }}
                >
                  Pro members get dedicated priority support and rapid query responses.
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: 9,
                    background: '#FFFFFF',
                    color: '#0F172A',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                >
                  <span>Upgrade to Pro</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
