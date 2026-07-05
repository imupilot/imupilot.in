import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const IS = {
  width: '100%', padding: '11px 16px 11px 44px',
  border: '1px solid #E4E1D9', borderRadius: 9,
  fontSize: 14, outline: 'none', fontFamily: "\'DM Sans\',sans-serif",
  background: '#F7F6F3', color: '#1A1A18', transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

const IC = ({ d, size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
    <path d={d} />
  </svg>
);

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const validatePhone = (p) => /^[6-9]\d{9}$/.test(p.replace(/\s/g, ''));

  const handleSignup = async () => {
    if (!form.full_name.trim()) { setError('Full name is required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }
    if (!validatePhone(form.phone)) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const { data: existing } = await supabase.from('profiles').select('phone').eq('phone', form.phone.replace(/\s/g, '')).single();
      if (existing) { setError('This phone number is already registered. Please log in.'); setLoading(false); return; }
      const { data, error: signupError } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { data: { full_name: form.full_name.trim(), phone: form.phone.replace(/\s/g, '') } } });
      if (signupError) { setError(signupError.message); setLoading(false); return; }
      if (data.user) { await supabase.from('profiles').upsert({ id: data.user.id, full_name: form.full_name.trim(), phone: form.phone.replace(/\s/g, ''), email: form.email.trim(), plan: 'free' }); }
      setMode('verify');
      setInfo(`We\'ve sent a verification email to ${form.email}. Please confirm it before logging in.`);
    } catch (e) { setError('Something went wrong. Please try again.'); }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!validatePhone(form.phone)) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    if (!form.password) { setError('Password is required.'); return; }
    setLoading(true); setError('');
    try {
      const { data: profile, error: profileError } = await supabase.from('profiles').select('email').eq('phone', form.phone.replace(/\s/g, '')).single();
      if (profileError || !profile) { setError('No account found with this phone number. Please sign up first.'); setLoading(false); return; }
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: profile.email, password: form.password });
      if (loginError) { setError(loginError.message.includes('Email not confirmed') ? 'Please verify your email first. Check your inbox.' : 'Incorrect password. Please try again.'); setLoading(false); return; }
      localStorage.setItem('user', JSON.stringify({ id: data.user.id, email: data.user.email, name: data.user.user_metadata?.full_name || '', phone: form.phone.replace(/\s/g, ''), plan: 'free' }));
      navigate('/dashboard');
    } catch (e) { setError('Something went wrong. Please try again.'); }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .auth-left { display: none !important; }
          .auth-right { padding: 32px 20px !important; justify-content: flex-start !important; padding-top: 10vh !important; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "\'DM Sans\',\'Segoe UI\',sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* LEFT PANEL */}
        <div className="auth-left" style={{ flex: 1, background: '#1B3A6B', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 40px)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 36, height: 36, background: '#E8630A', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚓</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>IMUpilot</span>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.03em' }}>Ace Your Maritime<br />Entrance Exam.</h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 32, maxWidth: 360 }}>Join thousands of aspirants preparing with real exam-level mocks, chapter-wise tests, and smart analytics.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Full-length IMUCET simulations', 'Subject-wise sectional tests', 'Detailed solutions for every question', 'Smart analytics to track progress'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2026 IMUpilot. All rights reserved.</div>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', background: '#fff' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Mobile logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }} className="auth-mobile-logo">
              <style>{`.auth-mobile-logo { display: none; } @media (max-width: 767px) { .auth-mobile-logo { display: flex !important; } }`}</style>
              <div style={{ width: 32, height: 32, background: '#E8630A', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚓</div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1B3A6B' }}>IMUpilot</span>
            </div>

            {mode === 'verify' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A18', marginBottom: 10 }}>Check your email</h2>
                <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.7, marginBottom: 28 }}>{info}</p>
                <button onClick={() => setMode('login')} style={{ width: '100%', padding: '12px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Go to Login</button>
              </div>
            )}

            {mode === 'login' && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A18', marginBottom: 6, letterSpacing: '-0.02em' }}>Welcome back</h2>
                  <p style={{ fontSize: 14, color: '#9CA3AF' }}>Login with your mobile number and password.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4A5568', marginBottom: 5 }}>Mobile Number</label>
                    <div style={{ position: 'relative' }}>
                      <IC d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      <input type="tel" placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} onFocus={e => e.target.style.borderColor = '#1B3A6B'} onBlur={e => e.target.style.borderColor = '#E4E1D9'} style={IS} maxLength={10} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4A5568', marginBottom: 5 }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <IC d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} onFocus={e => e.target.style.borderColor = '#1B3A6B'} onBlur={e => e.target.style.borderColor = '#E4E1D9'} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={IS} />
                    </div>
                  </div>
                  {error && <div style={{ fontSize: 13, color: '#DC2626', fontWeight: 500, background: '#FFF5F5', padding: '10px 12px', borderRadius: 8 }}>{error}</div>}
                  <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#9CA3AF' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
                    {loading ? 'Logging in...' : 'Log In →'}
                  </button>
                </div>
                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#9CA3AF' }}>
                  New here?{' '}<button onClick={() => { setMode('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: '#E8630A', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Create account</button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A18', marginBottom: 6, letterSpacing: '-0.02em' }}>Create your account</h2>
                  <p style={{ fontSize: 14, color: '#9CA3AF' }}>Start your IMUCET preparation today.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Full Name *', key: 'full_name', type: 'text', placeholder: 'Arjun Menon', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                    { label: 'Email Address *', key: 'email', type: 'email', placeholder: 'name@example.com', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                    { label: 'Mobile Number *', key: 'phone', type: 'tel', placeholder: '9876543210', maxLength: 10, icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                    { label: 'Password *', key: 'password', type: 'password', placeholder: 'Min 6 characters', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4A5568', marginBottom: 5 }}>{field.label}</label>
                      <div style={{ position: 'relative' }}>
                        <IC d={field.icon} />
                        <input type={field.type} placeholder={field.placeholder} value={form[field.key]} maxLength={field.maxLength}
                          onChange={e => set(field.key, e.target.value)}
                          onFocus={e => e.target.style.borderColor = '#1B3A6B'}
                          onBlur={e => e.target.style.borderColor = '#E4E1D9'}
                          onKeyDown={field.key === 'password' ? e => e.key === 'Enter' && handleSignup() : undefined}
                          style={IS} />
                      </div>
                    </div>
                  ))}
                  {error && <div style={{ fontSize: 13, color: '#DC2626', fontWeight: 500, background: '#FFF5F5', padding: '10px 12px', borderRadius: 8 }}>{error}</div>}
                  <button onClick={handleSignup} disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#9CA3AF' : '#1B3A6B', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
                    {loading ? 'Creating account...' : 'Create Account →'}
                  </button>
                </div>
                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#9CA3AF' }}>
                  Already have an account?{' '}<button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: '#E8630A', fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Log in</button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
