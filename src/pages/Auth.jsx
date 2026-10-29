import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LogoIcon } from '../components/Icons';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboarding, setOnboarding] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_status: '',
    imucet_target: '',
    career_targets: [],
  });
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [onboardingPlan, setOnboardingPlan] = useState('free');
  const processingUser = useRef(null);
  const handledAuthUser = useRef(null);

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const validatePhone = phone => /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
  const normalizePhone = phone => phone.replace(/\s/g, '');

  const saveLocalUser = (user, profile, values = {}) => {
    const localUser = {
      id: user.id,
      email: values.email || profile?.email || user.email || '',
      name: values.full_name || profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
      phone: values.phone || profile?.phone || '',
      plan: profile?.plan || 'free',
    };
    const picture = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    if (picture) localUser.avatar_url = picture;
    localStorage.setItem('user', JSON.stringify(localUser));
  };

  const beginOnboarding = (user, profile) => {
    const metadata = user.user_metadata || {};
    setAuthenticatedUser(user);
    setOnboardingPlan(profile?.plan || 'free');
    setOnboarding({
      full_name: profile?.full_name || metadata.full_name || metadata.name || '',
      email: profile?.email || user.email || '',
      phone: profile?.phone || '',
      current_status: profile?.current_status || '',
      imucet_target: profile?.imucet_target || '',
      career_targets: Array.isArray(profile?.career_targets) ? profile.career_targets : [],
    });
    setOnboardingStep(1);
    setError('');
    setMode('onboarding');
  };

  const checkProfileAndContinue = async (user, fallbackPhone = '') => {
    if (!user?.id) return;
    if (processingUser.current === user.id) return;
    processingUser.current = user.id;
    setLoading(true);
    setError('');
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id,full_name,email,phone,plan,current_status,imucet_target,career_targets,onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      // Check if profile/onboarding is complete:
      // Use onboarding_completed (or onboarding_complete), with full_name as the proxy if columns are absent.
      const isOnboardingComplete = Boolean(
        profile?.onboarding_completed || profile?.onboarding_complete
      ) && Boolean(profile?.full_name?.trim());

      if (!isOnboardingComplete) {
        // New user - show onboarding
        beginOnboarding(user, profile);
      } else {
        // Existing user - go to dashboard
        saveLocalUser(user, profile, { phone: profile?.phone || fallbackPhone });
        navigate('/dashboard', { replace: true });
      }
    } catch (profileError) {
      console.error('Unable to check your student profile:', profileError);
      beginOnboarding(user, null);
    } finally {
      processingUser.current = null;
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Listen for SIGNED_IN event instead of checking session on mount to avoid OAuth race condition
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session?.user)) && session?.user) {
        if (!mounted) return;
        await checkProfileAndContinue(session.user);
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          handledAuthUser.current = null;
          setAuthenticatedUser(null);
          setMode('login');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignup = async () => {
    if (!form.full_name.trim()) { setError('Full name is required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }
    if (!validatePhone(form.phone)) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const phone = form.phone.replace(/\s/g, '');
      const { data: existing } = await supabase.from('profiles').select('phone').eq('phone', phone).single();
      if (existing) {
        setError('This phone number is already registered. Please log in.');
        setLoading(false);
        return;
      }
      const { data, error: signupError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { full_name: form.full_name.trim(), phone } },
      });
      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: form.full_name.trim(),
          phone,
          email: form.email.trim(),
          plan: 'free',
          onboarding_completed: false,
        });
        if (profileError) throw profileError;
      }
      setMode('verify');
      setInfo(`We've sent a verification email to ${form.email}. Please confirm it before logging in.`);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!validatePhone(form.phone)) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    if (!form.password) { setError('Password is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const phone = form.phone.replace(/\s/g, '');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', phone)
        .single();
      if (profileError || !profile) {
        setError('No account found with this phone number. Please sign up first.');
        setLoading(false);
        return;
      }
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: form.password,
      });
      if (loginError) {
        setError(loginError.message.includes('Email not confirmed')
          ? 'Please verify your email first. Check your inbox.'
          : 'Incorrect password. Please try again.');
        setLoading(false);
        return;
      }
      await checkProfileAndContinue(data.user, phone);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth',
        },
      });
      if (oauthError) throw oauthError;
    } catch (oauthError) {
      console.error('Unable to start Google sign-in.', oauthError);
      setError(oauthError.message || 'Google sign-in could not be started. Please try again.');
      setLoading(false);
    }
  };

  const handleOnboardingChange = event => {
    const { name, value } = event.target;
    setOnboarding(current => ({ ...current, [name]: value }));
    if (error) setError('');
  };

  const toggleCareerTarget = value => {
    setOnboarding(current => ({
      ...current,
      career_targets: current.career_targets.includes(value)
        ? current.career_targets.filter(target => target !== value)
        : [...current.career_targets, value],
    }));
    if (error) setError('');
  };

  const validateOnboardingStep = () => {
    if (onboardingStep === 1) {
      if (!onboarding.full_name.trim()) return 'Full name is required.';
      if (!onboarding.email.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(onboarding.email.trim())) return 'Enter a valid email address.';
      if (!validatePhone(onboarding.phone)) return 'Enter a valid 10-digit Indian mobile number.';
    }
    if (onboardingStep === 2 && !onboarding.current_status) return 'Please select your current status.';
    if (onboardingStep === 3 && !onboarding.imucet_target) return 'Please select your IMUCET target.';
    if (onboardingStep === 4 && onboarding.career_targets.length === 0) return 'Select at least one career target.';
    return '';
  };

  const continueOnboarding = () => {
    const validationError = validateOnboardingStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setOnboardingStep(step => Math.min(4, step + 1));
  };

  const handleOnboardingSubmit = async () => {
    const validationError = validateOnboardingStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!authenticatedUser?.id) {
      setError('Your sign-in has expired. Please sign in again.');
      return;
    }
    setLoading(true);
    setError('');
    const values = {
      full_name: onboarding.full_name.trim(),
      email: onboarding.email.trim(),
      phone: normalizePhone(onboarding.phone),
      current_status: onboarding.current_status,
      imucet_target: onboarding.imucet_target,
      career_targets: onboarding.career_targets,
      onboarding_completed: true,
    };
    try {
      const { data: profile, error: saveError } = await supabase
        .from('profiles')
        .upsert({
          id: authenticatedUser.id,
          ...values,
          plan: onboardingPlan,
        }, { onConflict: 'id' })
        .select('id,full_name,email,phone,plan')
        .single();
      if (saveError) throw saveError;
      saveLocalUser(authenticatedUser, profile, values);
      navigate('/dashboard', { replace: true });
    } catch (saveError) {
      console.error('Unable to save your onboarding profile.', saveError);
      setError(saveError.message || 'We could not save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = event => {
    set(event.target.name, event.target.value);
    if (error) setError('');
  };

  const renderField = ({ label, name, type = 'text', placeholder, autoComplete, maxLength }) => (
    <label key={name} className="auth-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        inputMode={name === 'phone' ? 'numeric' : undefined}
        value={form[name]}
        onChange={handleFieldChange}
        onKeyDown={name === 'password' ? event => {
          if (event.key === 'Enter') (mode === 'login' ? handleLogin() : handleSignup());
        } : undefined}
      />
    </label>
  );

  return (
    <div className="auth-page">
      <style>{`
        .auth-page { min-height: 100vh; display: flex; flex-direction: column; background: #f8fafc; color: #111827; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        .auth-header { height: 72px; width: 100%; border-bottom: 1px solid #e2e8f0; background: rgba(255,255,255,.92); }
        .auth-header-inner { width: min(100% - 48px, 1280px); height: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .auth-brand { display: inline-flex; align-items: center; color: #111827; text-decoration: none; font-size: 20px; font-weight: 700; letter-spacing: -.03em; }
        .auth-brand svg { width: 24px; height: 24px; margin-right: 8px; color: #1b3a6b; }
        .auth-home-link { color: #475569; text-decoration: none; font-size: 14px; font-weight: 500; }
        .auth-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 20px; }
        .auth-card { width: 100%; max-width: 440px; padding: clamp(24px, 5vw, 40px); background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 16px 40px rgba(15,23,42,.06); }
        .auth-eyebrow { margin: 0 0 10px; color: #1b3a6b; font-size: 12px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
        .auth-title { margin: 0 0 8px; color: #111827; font-size: 30px; line-height: 1.2; letter-spacing: -.04em; font-weight: 700; }
        .auth-description { margin: 0; color: #64748b; font-size: 14px; line-height: 1.6; }
        .auth-intro { margin-bottom: 28px; }
        .auth-field { display: block; margin-bottom: 16px; color: #334155; font-size: 13px; font-weight: 600; }
        .auth-field span { display: block; margin-bottom: 6px; }
        .auth-field input { width: 100%; padding: 12px 14px; border: 1px solid #d8e0ea; border-radius: 10px; font-size: 14px; outline: none; font-family: inherit; background: #fff; color: #111827; box-sizing: border-box; transition: border-color .15s, box-shadow .15s; }
        .auth-field input:focus { border-color: #1b3a6b !important; box-shadow: 0 0 0 3px rgba(27,58,107,.1); }
        .auth-field input::placeholder { color: #94a3b8; }
        .auth-submit { width: 100%; margin-top: 4px; padding: 13px 16px; color: #fff; background: #111827; border: 0; border-radius: 999px; box-shadow: 0 4px 12px rgba(15,23,42,.12); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .2s, transform .2s; }
        .auth-submit:hover:not(:disabled) { background: #1b3a6b; transform: translateY(-1px); }
        .auth-submit:disabled { background: #94a3b8; cursor: default; }
        .auth-error { margin-bottom: 16px; padding: 11px 13px; border: 1px solid #fecaca; border-radius: 10px; color: #b91c1c; background: #fef2f2; font-size: 13px; }
        .auth-switch { margin: 24px 0 0; color: #64748b; text-align: center; font-size: 14px; }
        .auth-switch button { padding: 0; color: #e8630a; background: none; border: 0; font: inherit; font-weight: 600; cursor: pointer; }
        .auth-footer { padding: 0 20px 24px; color: #94a3b8; text-align: center; font-size: 12px; }
        .auth-verify { text-align: center; }
        .auth-mail-icon { width: 56px; height: 56px; margin: 0 auto 20px; display: grid; place-items: center; border-radius: 16px; background: #eff6ff; color: #1b3a6b; font-size: 26px; }
        .auth-verify .auth-description { margin-bottom: 24px; }
        @media (max-width: 480px) { .auth-header-inner { width: calc(100% - 32px); } .auth-main { align-items: flex-start; padding: 32px 16px; } .auth-card { border-radius: 16px; } .auth-title { font-size: 27px; } }
        .auth-google { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 16px; padding: 12px 16px; color: #1f2937; background: #fff; border: 1px solid #d8e0ea; border-radius: 999px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
        .auth-google:disabled { opacity: .65; cursor: default; }
        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0 2px; color: #94a3b8; font-size: 12px; }
        .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
        .auth-progress { display: flex; align-items: center; justify-content: space-between; gap: 5px; margin: 0 0 24px; }
        .auth-progress-step { display: flex; align-items: center; gap: 4px; color: #94a3b8; font-size: 10px; white-space: nowrap; }
        .auth-progress-step.active { color: #1b3a6b; font-weight: 650; }
        .auth-progress-number { width: 19px; height: 19px; display: grid; place-items: center; border: 1px solid #cbd5e1; border-radius: 50%; color: #64748b; font-size: 10px; }
        .auth-progress-step.active .auth-progress-number { border-color: #1b3a6b; color: #fff; background: #1b3a6b; }
        .auth-progress-arrow { color: #cbd5e1; font-size: 11px; }
        .auth-question { margin: 0 0 14px; color: #334155; font-size: 14px; font-weight: 650; }
        .auth-choice-list { display: grid; gap: 9px; margin-bottom: 18px; }
        .auth-choice { display: flex; align-items: center; gap: 10px; padding: 12px 13px; color: #334155; background: #fff; border: 1px solid #d8e0ea; border-radius: 10px; cursor: pointer; font-size: 14px; }
        .auth-choice.selected { border-color: #1b3a6b; background: #f3f7fc; color: #1b3a6b; }
        .auth-choice input { accent-color: #1b3a6b; }
        .auth-onboarding-actions { display: flex; gap: 10px; margin-top: 18px; }
        .auth-onboarding-actions .auth-submit { margin: 0; }
        .auth-back { flex: 1; padding: 12px 16px; color: #334155; background: #fff; border: 1px solid #d8e0ea; border-radius: 999px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
        .auth-onboarding-actions .auth-submit { flex: 2; }
      `}</style>
      <header className="auth-header">
        <div className="auth-header-inner">
          <Link to="/" className="auth-brand"><LogoIcon />IMUPilot</Link>
          <Link to="/" className="auth-home-link">Back to home</Link>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-card">
          {mode === 'verify' ? (
            <div className="auth-verify">
              <div className="auth-mail-icon" aria-hidden="true">✉</div>
              <h1 className="auth-title" style={{ fontSize: 26, marginBottom: 10 }}>Check your email</h1>
              <p className="auth-description">{info}</p>
              <button type="button" className="auth-submit" onClick={() => setMode('login')}>Go to Login</button>
            </div>
          ) : mode === 'onboarding' ? (
            <>
              <div className="auth-intro">
                <p className="auth-eyebrow">PERSONALIZE YOUR PREPARATION</p>
                <h1 className="auth-title">Let’s get you started</h1>
                <p className="auth-description">A few details will help us tailor IMUPilot to your goals.</p>
              </div>
              <div className="auth-progress" aria-label={`Step ${onboardingStep} of 4`}>
                {['Basic Info', 'Student', 'Target', 'Career'].map((label, index) => (
                  <span key={label} style={{ display: 'contents' }}>
                    <span className={`auth-progress-step${index + 1 <= onboardingStep ? ' active' : ''}`} aria-current={onboardingStep === index + 1 ? 'step' : undefined}>
                      <span className="auth-progress-number">{index + 1}</span>{label}
                    </span>
                    {index < 3 && <span className="auth-progress-arrow" aria-hidden="true">→</span>}
                  </span>
                ))}
              </div>

              {onboardingStep === 1 && (
                <>
                  <label className="auth-field"><span>Full name</span><input name="full_name" autoComplete="name" placeholder="Your full name" value={onboarding.full_name} onChange={handleOnboardingChange} /></label>
                  <label className="auth-field"><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="name@example.com" value={onboarding.email} onChange={handleOnboardingChange} /></label>
                  <label className="auth-field"><span>Mobile number</span><input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="10-digit mobile number" value={onboarding.phone} onChange={handleOnboardingChange} /></label>
                </>
              )}

              {onboardingStep === 2 && (
                <>
                  <p className="auth-question">What are you currently studying?</p>
                  <div className="auth-choice-list">
                    {[['class_11', 'Class 11'], ['class_12', 'Class 12'], ['dropper', 'Dropper'], ['college_other', 'College / Other']].map(([value, label]) => (
                      <label key={value} className={`auth-choice${onboarding.current_status === value ? ' selected' : ''}`}><input type="radio" name="current_status" value={value} checked={onboarding.current_status === value} onChange={handleOnboardingChange} />{label}</label>
                    ))}
                  </div>
                </>
              )}

              {onboardingStep === 3 && (
                <>
                  <p className="auth-question">Which IMUCET attempt are you targeting?</p>
                  <div className="auth-choice-list">
                    {[['2027', 'IMUCET 2027'], ['2028', 'IMUCET 2028'], ['2029', 'IMUCET 2029'], ['exploring', 'Just exploring']].map(([value, label]) => (
                      <label key={value} className={`auth-choice${onboarding.imucet_target === value ? ' selected' : ''}`}><input type="radio" name="imucet_target" value={value} checked={onboarding.imucet_target === value} onChange={handleOnboardingChange} />{label}</label>
                    ))}
                  </div>
                </>
              )}

              {onboardingStep === 4 && (
                <>
                  <p className="auth-question">What are you planning to pursue?</p>
                  <div className="auth-choice-list">
                    {[['dns', 'DNS'], ['bsc_nautical_science', 'B.Sc Nautical Science'], ['btech_marine_engineering', 'B.Tech Marine Engineering'], ['undecided', "I'm not sure yet"]].map(([value, label]) => (
                      <label key={value} className={`auth-choice${onboarding.career_targets.includes(value) ? ' selected' : ''}`}><input type="checkbox" checked={onboarding.career_targets.includes(value)} onChange={() => toggleCareerTarget(value)} />{label}</label>
                    ))}
                  </div>
                </>
              )}

              {error && <div role="alert" className="auth-error">{error}</div>}
              <div className="auth-onboarding-actions">
                {onboardingStep > 1 && <button type="button" className="auth-back" onClick={() => { setError(''); setOnboardingStep(step => step - 1); }}>Back</button>}
                {onboardingStep < 4
                  ? <button type="button" className="auth-submit" onClick={continueOnboarding}>Continue</button>
                  : <button type="button" className="auth-submit" onClick={handleOnboardingSubmit} disabled={loading}>{loading ? 'Saving...' : 'Complete Setup'}</button>}
              </div>
            </>
          ) : (
            <>
              <div className="auth-intro">
                <p className="auth-eyebrow">IMUCET + DNS preparation</p>
                <h1 className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
                <p className="auth-description">
                  {mode === 'login' ? 'Log in to continue your preparation.' : 'Start your IMUCET preparation today.'}
                </p>
              </div>
              {mode === 'login' ? (
                <>
                  {renderField({ label: 'Mobile number', name: 'phone', type: 'tel', placeholder: '10-digit mobile number', autoComplete: 'tel-national', maxLength: 10 })}
                  {renderField({ label: 'Password', name: 'password', type: 'password', placeholder: 'Enter your password', autoComplete: 'current-password' })}
                  {error && <div role="alert" className="auth-error">{error}</div>}
                  <button type="button" className="auth-submit" onClick={handleLogin} disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
                  <div className="auth-divider">or</div>
                  <button type="button" className="auth-google" onClick={handleGoogleSignIn} disabled={loading}>
                    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" transform="translate(0 5)"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.12 7.14-10.2 7.14-17.56z"/><path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1-.76-4.59c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z" transform="translate(0 5)"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.26-8.28 2.26-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" transform="translate(0 -5)"/></svg>
                    Continue with Google
                  </button>
                  <p className="auth-switch">New here?{' '}<button type="button" onClick={() => { setMode('signup'); setError(''); }}>Create account</button></p>
                </>
              ) : (
                <>
                  {[
                    { label: 'Full name', name: 'full_name', placeholder: 'Your full name', autoComplete: 'name' },
                    { label: 'Email address', name: 'email', type: 'email', placeholder: 'name@example.com', autoComplete: 'email' },
                    { label: 'Mobile number', name: 'phone', type: 'tel', placeholder: '10-digit mobile number', autoComplete: 'tel-national', maxLength: 10 },
                    { label: 'Password', name: 'password', type: 'password', placeholder: 'At least 6 characters', autoComplete: 'new-password' },
                  ].map(renderField)}
                  {error && <div role="alert" className="auth-error">{error}</div>}
                  <button type="button" className="auth-submit" onClick={handleSignup} disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</button>
                  <p className="auth-switch">Already have an account?{' '}<button type="button" onClick={() => { setMode('login'); setError(''); }}>Log in</button></p>
                </>
              )}
            </>
          )}
        </section>
      </main>
      <footer className="auth-footer">© 2026 IMUPilot. All rights reserved.</footer>
    </div>
  );
}
