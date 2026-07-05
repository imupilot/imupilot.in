import { useState } from 'react';
import { Mail, MapPin, Clock, Send } from 'lucide-react';
import IMUpilotSidebar from '../components/IMUpilotSidebar';

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.4 8.38 8.38 0 0 1 3.8.9L21 3.5Z"/>
  </svg>
);

const INFO = [
  { icon: <Mail size={18} />,      title: 'Email Us',      value: 'imupilot@gmail.com',      link: 'mailto:imupilot@gmail.com', color: '#1B3A6B' },
  { icon: <WhatsAppIcon />,        title: 'WhatsApp',      value: '+91 70776 64992',           link: 'https://wa.me/917077664992', color: '#25D366' },
  { icon: <MapPin size={18} />,    title: 'Location',      value: 'India',                    link: null,                        color: '#E8630A' },
  { icon: <Clock size={18} />,     title: 'Support Hours', value: 'Mon–Sat: 9AM – 6PM IST',   link: null,                        color: '#F59E0B' },
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
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #ECEAE4', background: '#F7F6F3',
    fontSize: 13, fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', color: '#1A1A18',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600,
    color: '#9CA3AF', marginBottom: 5,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: '#F7F6F3', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <IMUpilotSidebar />

      <main style={{ flex: 1, overflowY: 'auto' }}>
        {/* Topbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #ECEAE4', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: '#1A1A18' }}>Contact Us</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>We're here to help you succeed</div>
          </div>
        </div>

        <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* FORM */}
          <div style={{ background: '#fff', border: '1px solid #ECEAE4', borderRadius: 16, padding: '28px' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A18', marginBottom: 4 }}>Send us a Message</div>
            <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>Fill out the form and we'll get back to you as soon as possible.</div>

            {status === 'success' && (
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#065F46', fontWeight: 500 }}>
                ✓ Message sent successfully! We'll get back to you soon.
              </div>
            )}
            {status === 'error' && (
              <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: '#C53030', fontWeight: 500 }}>
                ✕ Something went wrong. Please try again or WhatsApp us directly.
              </div>
            )}

            <form onSubmit={submit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input type="text" required placeholder="Your name" value={form.name}
                    onChange={e => set('name', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#1B3A6B'}
                    onBlur={e => e.target.style.borderColor = '#ECEAE4'}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input type="email" required placeholder="name@example.com" value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#1B3A6B'}
                    onBlur={e => e.target.style.borderColor = '#ECEAE4'}
                    style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" placeholder="+91 98765 43210" value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#1B3A6B'}
                    onBlur={e => e.target.style.borderColor = '#ECEAE4'}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Subject *</label>
                  <input type="text" required placeholder="How can we help?" value={form.subject}
                    onChange={e => set('subject', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#1B3A6B'}
                    onBlur={e => e.target.style.borderColor = '#ECEAE4'}
                    style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Message *</label>
                <textarea required rows={5} placeholder="Type your message here..." value={form.message}
                  onChange={e => set('message', e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#1B3A6B'}
                  onBlur={e => e.target.style.borderColor = '#ECEAE4'}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>

              <button type="submit" disabled={status === 'sending'}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: status === 'sending' ? '#9CA3AF' : '#1B3A6B',
                  color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                  cursor: status === 'sending' ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                {status === 'sending' ? 'Sending...' : <><Send size={14} /> Send Message</>}
              </button>
            </form>
          </div>

          {/* INFO */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INFO.map(item => (
              <div key={item.title} style={{ background: '#fff', border: '1px solid #ECEAE4', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: item.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{item.title}</div>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18', textDecoration: 'none' }}>{item.value}</a>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>{item.value}</div>
                  )}
                </div>
              </div>
            ))}

            <div style={{ background: '#1B3A6B', borderRadius: 14, padding: '20px', marginTop: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 6 }}>Priority Support</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 16, lineHeight: 1.6 }}>
                Pro members get priority support and faster responses.
              </div>
              <button style={{ width: '100%', padding: '10px', borderRadius: 8, background: '#E8630A', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
