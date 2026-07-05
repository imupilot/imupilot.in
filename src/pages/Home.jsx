import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, ChevronLeft, ChevronRight, Check, Menu, X } from 'lucide-react';

const C = {
  primary: '#002452',
  primaryContainer: '#1b3a6b',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#89a5dd',
  secondary: '#a04100',
  secondaryContainer: '#fc721e',
  secondaryFixed: '#ffdbcc',
  onSecondaryFixed: '#351000',
  surface: '#f7f9fb',
  surfaceLow: '#f2f4f6',
  surfaceHigh: '#e6e8ea',
  surfaceLowest: '#ffffff',
  surfaceContainer: '#eceef0',
  onSurface: '#191c1e',
  onSurfaceVariant: '#44474f',
  outlineVariant: '#c4c6d0',
  outline: '#747780',
  primaryFixed: '#d7e2ff',
  primaryFixedDim: '#acc7ff',
  secondaryFixedDim: '#ffb693',
  tertiary: '#1d2538',
};

const MI = ({ icon, fill, className = '', style = {} }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`, ...style }}
  >
    {icon}
  </span>
);

const testimonials = [
  {
    name: 'Aryan Sharma',
    subtitle: 'Cleared IMU-CET 2023 (Rank 412)',
    quote: 'The mock tests here are a notch above the rest. The UI felt exactly like the actual exam center, which really helped calm my nerves on the final day.',
  },
  {
    name: 'Karthik R.',
    subtitle: 'Sponsored by Synergy Marine',
    quote: 'Highly recommend the DNS Company prep pack. The interview tips and the Great Eastern mock papers were instrumental for my selection.',
  },
  {
    name: 'Sneha S.',
    subtitle: 'Cleared Anglo-Eastern DNS',
    quote: "Flashcards for Physics were a life-saver for last-minute revisions. IMUpilot is the only platform that truly understands the merchant navy path.",
  },
];

const plans = [
  {
    name: 'Basic',
    price: '999',
    popular: false,
    features: ['20 full-length mock tests', 'Chapter-wise tests', 'Basic flashcard deck', 'Basic analytics dashboard'],
  },
  {
    name: 'Pro',
    price: '1,999',
    popular: true,
    features: ['Everything in Basic', 'Previous year papers', 'DNS company packs', 'Psychometric test prep', 'Advanced analytics'],
  },
  {
    name: 'Interview Pack',
    price: '499',
    popular: false,
    features: ['6 mock interviews', 'With real serving cadets', 'Company-specific Q&A', 'Feedback & improvement tips'],
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    const link2 = document.createElement('link');
    link2.href = 'https://fonts.cdnfonts.com/css/metropolis';
    link2.rel = 'stylesheet';
    document.head.appendChild(link2);
    return () => { document.head.removeChild(link); document.head.removeChild(link2); };
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navTo = (path) => { setMobileMenuOpen(false); navigate(path); };

  const hFont = { fontFamily: 'Metropolis, sans-serif' };
  const bFont = { fontFamily: "'Public Sans', sans-serif" };

  return (
    <div className="min-h-screen" style={{ ...bFont, backgroundColor: C.surface, color: C.onSurface }}>
      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: C.surfaceLowest, borderColor: C.outlineVariant }}>
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <MI icon="anchor" fill style={{ color: C.primary, fontSize: 28 }} />
            <span className="font-bold text-2xl" style={{ ...hFont, color: C.primary }}>IMUpilot</span>
          </div>

          <div className="hidden md:flex gap-6 items-center">
            <button onClick={() => scrollTo('features')} className="font-bold border-b-2 transition-colors" style={{ color: C.secondary, borderColor: C.secondary, ...bFont }}>Courses</button>
            <button onClick={() => navTo('/test')} className="font-medium transition-colors hover:opacity-80" style={{ color: C.onSurfaceVariant, ...bFont }}>Mock Tests</button>
            <button onClick={() => navTo('/revise')} className="font-medium transition-colors hover:opacity-80" style={{ color: C.onSurfaceVariant, ...bFont }}>Flashcards</button>
            <button onClick={() => scrollTo('pricing')} className="font-medium transition-colors hover:opacity-80" style={{ color: C.onSurfaceVariant, ...bFont }}>Pricing</button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navTo('/auth')}
              className="px-6 py-2 text-xs font-bold uppercase tracking-wider rounded hover:opacity-80 transition-all"
              style={{ ...hFont, color: C.primary, letterSpacing: '0.08em' }}
            >
              Login
            </button>
            <button
              onClick={() => navTo('/auth')}
              className="px-6 py-2 text-xs font-bold uppercase tracking-wider rounded text-white hover:opacity-90 transition-all"
              style={{ ...hFont, backgroundColor: C.primary, letterSpacing: '0.08em' }}
            >
              Sign Up
            </button>
          </div>

          <button className="md:hidden p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} style={{ color: C.primary }} /> : <Menu size={24} style={{ color: C.primary }} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t px-6 pb-4 flex flex-col gap-3" style={{ backgroundColor: C.surfaceLowest, borderColor: C.outlineVariant }}>
            <button onClick={() => scrollTo('features')} className="py-2 text-left font-bold" style={{ color: C.secondary }}>Courses</button>
            <button onClick={() => navTo('/test')} className="py-2 text-left font-medium" style={{ color: C.onSurfaceVariant }}>Mock Tests</button>
            <button onClick={() => navTo('/revise')} className="py-2 text-left font-medium" style={{ color: C.onSurfaceVariant }}>Flashcards</button>
            <button onClick={() => scrollTo('pricing')} className="py-2 text-left font-medium" style={{ color: C.onSurfaceVariant }}>Pricing</button>
            <div className="flex gap-2 pt-2">
              <button onClick={() => navTo('/auth')} className="flex-1 py-2 rounded text-xs font-bold uppercase tracking-wider" style={{ color: C.primary }}>Login</button>
              <button onClick={() => navTo('/auth')} className="flex-1 py-2 rounded text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: C.primary }}>Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ─── */}
      <header className="overflow-hidden" style={{ backgroundColor: C.surfaceLow }}>
        <div className="max-w-[1280px] mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ ...hFont, backgroundColor: C.secondaryFixed, color: C.onSecondaryFixed, letterSpacing: '0.08em' }}
            >
              #1 PLATFORM FOR IMU-CET
            </span>
            <h1 className="text-[40px] leading-[1.2] font-bold max-w-xl" style={{ ...hFont, color: C.primary, letterSpacing: '-0.02em' }}>
              Navigate Your Way to IMU Excellence
            </h1>
            <p className="text-lg leading-relaxed max-w-lg" style={{ color: C.onSurfaceVariant }}>
              Master the merchant navy entrance exams with the industry's most precise mock tests, company-specific modules, and smart flashcards designed by deck officers.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => navTo('/auth')}
                className="px-12 py-4 text-2xl font-semibold rounded-lg text-white hover:opacity-90 transition-all"
                style={{ ...hFont, backgroundColor: C.secondary, lineHeight: '1.3' }}
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navTo('/test')}
                className="px-12 py-4 text-2xl font-semibold rounded-lg border-2 hover:text-white transition-all"
                style={{ ...hFont, borderColor: C.primary, color: C.primary, lineHeight: '1.3' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = C.primary; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.primary; }}
              >
                View Mock Tests
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full">
            <div
              className="w-full aspect-[4/3] rounded-xl overflow-hidden border shadow-lg"
              style={{
                borderColor: C.outlineVariant,
                background: `linear-gradient(135deg, ${C.primaryContainer} 0%, #0f2d55 30%, #1a4070 50%, #0d2040 70%, ${C.primary} 100%)`,
              }}
            >
              <div className="absolute inset-0" style={{
                background: `
                  radial-gradient(ellipse 60% 40% at 30% 60%, rgba(172,199,255,0.08) 0%, transparent 70%),
                  radial-gradient(ellipse 50% 30% at 70% 40%, rgba(255,255,255,0.04) 0%, transparent 60%),
                  linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.25) 100%)
                `,
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <MI icon="sailing" style={{ fontSize: 140, color: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-2/5" style={{ background: 'linear-gradient(0deg, rgba(0,20,50,0.5) 0%, transparent 100%)' }} />
            </div>

            <div
              className="absolute -bottom-6 -left-6 flex items-center gap-6 p-6 rounded shadow-md"
              style={{ backgroundColor: C.surfaceLowest, border: `1px solid ${C.outlineVariant}` }}
            >
              <div className="p-3 rounded-full" style={{ backgroundColor: C.secondaryFixed }}>
                <MI icon="verified" style={{ color: C.secondary }} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ ...hFont, color: C.onSurfaceVariant, letterSpacing: '0.08em' }}>SUCCESS RATE</p>
                <p className="text-2xl font-semibold" style={{ ...hFont, color: C.primary }}>94.2%</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── STATS BAR ─── */}
      <section className="py-12" style={{ backgroundColor: C.primary }}>
        <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { value: '35,000+', label: 'Aspirants Trusted', first: true },
            { value: '20', label: 'Full Length Mocks' },
            { value: '2,000+', label: 'Smart Flashcards' },
            { value: 'DNS', label: 'Company Packs' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`text-center ${!stat.first ? 'md:border-l' : ''}`}
              style={{ borderColor: C.primaryContainer }}
            >
              <p className="text-[32px] font-bold leading-[1.2]" style={{ ...hFont, color: C.onPrimary, letterSpacing: '-0.01em' }}>{stat.value}</p>
              <p className="text-base" style={{ color: C.onPrimaryContainer }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES BENTO GRID ─── */}
      <section id="features" className="py-20" style={{ backgroundColor: C.surface }}>
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-[32px] font-bold mb-2" style={{ ...hFont, color: C.primary, letterSpacing: '-0.01em' }}>Precision-Engineered Prep</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: C.onSurfaceVariant }}>
              Our features are designed to mimic the exact pressure and technicality of the actual IMU-CET and Company Sponsorship exams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Feature 1 — 8 col */}
            <div
              className="md:col-span-8 border p-12 rounded-xl flex flex-col justify-between transition-all hover:border-orange-500"
              style={{ backgroundColor: C.surfaceLowest, borderColor: C.outlineVariant }}
            >
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded mb-6" style={{ backgroundColor: C.primaryFixed }}>
                  <MI icon="analytics" style={{ color: C.primary }} />
                </div>
                <h3 className="text-2xl font-semibold mb-2" style={{ ...hFont, color: C.primary }}>Mock Tests with Real-Time Analytics</h3>
                <p className="text-base max-w-lg" style={{ color: C.onSurfaceVariant }}>
                  Get access to simulated exams that reflect current trends. Our AI-driven analytics pinpoint your weaknesses across Physics, Math, and General Knowledge with nautical precision.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-6">
                <div className="h-1 rounded-full" style={{ backgroundColor: C.secondary }} />
                <div className="h-1 rounded-full" style={{ backgroundColor: C.outlineVariant }} />
                <div className="h-1 rounded-full" style={{ backgroundColor: C.outlineVariant }} />
              </div>
            </div>

            {/* Feature 2 — 4 col orange */}
            <div
              className="md:col-span-4 p-12 rounded-xl text-white flex flex-col justify-between"
              style={{ backgroundColor: C.secondary }}
            >
              <div>
                <div className="w-12 h-12 flex items-center justify-center rounded mb-6 bg-white">
                  <MI icon="style" style={{ color: C.secondary }} />
                </div>
                <h3 className="text-2xl font-semibold mb-2" style={hFont}>Smart Flashcards</h3>
                <p className="text-base opacity-90">
                  Spaced repetition algorithms help you memorize complex technical formulas and maritime terms 3x faster.
                </p>
              </div>
              <button
                onClick={() => navTo('/revise')}
                className="w-full py-2 bg-white rounded text-xs font-bold uppercase tracking-wider mt-6"
                style={{ ...hFont, color: C.secondary, letterSpacing: '0.08em' }}
              >
                OPEN DECK
              </button>
            </div>

            {/* Feature 3 — 4 col */}
            <div
              className="md:col-span-4 border p-12 rounded-xl"
              style={{ backgroundColor: C.surfaceHigh, borderColor: C.outlineVariant }}
            >
              <div className="w-12 h-12 flex items-center justify-center rounded mb-6" style={{ backgroundColor: C.tertiary }}>
                <MI icon="anchor" style={{ color: '#fff' }} />
              </div>
              <h3 className="text-2xl font-semibold mb-2" style={{ ...hFont, color: C.primary }}>DNS Company Prep</h3>
              <p className="text-base" style={{ color: C.onSurfaceVariant }}>
                Specific prep modules for Anglo-Eastern, Synergy, Great Eastern, and more. Including psychometric test patterns.
              </p>
            </div>

            {/* Feature 4 — 8 col navy */}
            <div
              className="md:col-span-8 p-12 rounded-xl text-white overflow-hidden relative"
              style={{ backgroundColor: C.primary }}
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-2xl font-semibold mb-2" style={hFont}>Officer Mentorship</h3>
                  <p className="text-base opacity-80 max-w-md">
                    Connect with currently serving Deck Officers and Engineers who have walked the same path. Personalized strategy sessions for your cadetship voyage.
                  </p>
                </div>
                <div className="flex -space-x-4 mt-6">
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs" style={{ borderColor: C.primary, backgroundColor: C.surfaceHigh }}>
                    <MI icon="person" style={{ color: C.onSurfaceVariant, fontSize: 20 }} />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs" style={{ borderColor: C.primary, backgroundColor: C.surfaceHigh }}>
                    <MI icon="person" style={{ color: C.onSurfaceVariant, fontSize: 20 }} />
                  </div>
                  <div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold uppercase tracking-wider text-white"
                    style={{ ...hFont, borderColor: C.primary, backgroundColor: C.secondary, letterSpacing: '0.08em' }}
                  >
                    +12
                  </div>
                </div>
              </div>
              <MI
                icon="sailing"
                className="absolute -right-8 -bottom-8 rotate-12"
                style={{ fontSize: 180, color: 'rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 border-t" style={{ borderColor: C.outlineVariant }}>
        <div className="max-w-[1280px] mx-auto px-8">
          <h2 className="text-[32px] font-bold text-center mb-20" style={{ ...hFont, color: C.primary, letterSpacing: '-0.01em' }}>
            Your Voyage to the Merchant Navy
          </h2>

          <div className="flex flex-col md:flex-row gap-12 items-start">
            {/* Step 1 */}
            <div className="flex-1 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[32px] font-bold border"
                style={{ ...hFont, backgroundColor: C.surfaceHigh, color: C.primary, borderColor: C.outline }}
              >
                1
              </div>
              <h4 className="text-2xl font-semibold mb-3" style={{ ...hFont, color: C.primary }}>Syllabus Mapping</h4>
              <p className="text-base" style={{ color: C.onSurfaceVariant }}>
                We break down the IMU-CET syllabus into bite-sized modules across 6 core subjects.
              </p>
            </div>

            <div className="hidden md:flex items-center justify-center pt-8">
              <MI icon="trending_flat" style={{ color: C.outlineVariant, fontSize: 28 }} />
            </div>

            {/* Step 2 */}
            <div className="flex-1 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[32px] font-bold border"
                style={{ ...hFont, backgroundColor: C.surfaceHigh, color: C.primary, borderColor: C.outline }}
              >
                2
              </div>
              <h4 className="text-2xl font-semibold mb-3" style={{ ...hFont, color: C.primary }}>Drill &amp; Practice</h4>
              <p className="text-base" style={{ color: C.onSurfaceVariant }}>
                Master thousands of questions and timed mock tests designed for accuracy and speed.
              </p>
            </div>

            <div className="hidden md:flex items-center justify-center pt-8">
              <MI icon="trending_flat" style={{ color: C.outlineVariant, fontSize: 28 }} />
            </div>

            {/* Step 3 — highlighted */}
            <div className="flex-1 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[32px] font-bold border"
                style={{ ...hFont, backgroundColor: C.secondaryFixed, color: C.secondary, borderColor: C.secondary }}
              >
                3
              </div>
              <h4 className="text-2xl font-semibold mb-3" style={{ ...hFont, color: C.primary }}>Company Sponsorship</h4>
              <p className="text-base" style={{ color: C.onSurfaceVariant }}>
                Clear the hurdle of major shipping company interviews with specialized mock panels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20" style={{ backgroundColor: C.surfaceLow }}>
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <h2 className="text-[32px] font-bold" style={{ ...hFont, color: C.primary, letterSpacing: '-0.01em' }}>Voices of Future Officers</h2>
            <div className="flex gap-2">
              <button className="p-2 border rounded-full transition-colors hover:bg-gray-100" style={{ borderColor: C.outline }}>
                <ChevronLeft size={20} style={{ color: C.onSurface }} />
              </button>
              <button className="p-2 border rounded-full transition-colors hover:bg-gray-100" style={{ borderColor: C.outline }}>
                <ChevronRight size={20} style={{ color: C.onSurface }} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-12 border rounded shadow-sm"
                style={{ backgroundColor: C.surfaceLowest, borderColor: C.outlineVariant }}
              >
                <div className="flex mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <MI key={i} icon="star" fill style={{ color: C.secondary, fontSize: 20 }} />
                  ))}
                </div>
                <p className="text-base italic mb-6" style={{ color: C.onSurfaceVariant }}>
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full" style={{ backgroundColor: C.surfaceHigh }} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ ...hFont, color: C.primary, letterSpacing: '0.08em' }}>{t.name}</p>
                    <p className="text-[10px] uppercase" style={{ color: C.onSurfaceVariant }}>{t.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="pricing" className="py-20 border-t" style={{ backgroundColor: C.surface, borderColor: C.outlineVariant }}>
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-[32px] font-bold mb-2" style={{ ...hFont, color: C.primary, letterSpacing: '-0.01em' }}>Choose Your Plan</h2>
            <p className="text-lg" style={{ color: C.onSurfaceVariant }}>Invest in your maritime career today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-10 relative ${plan.popular ? 'text-white shadow-2xl md:scale-[1.03]' : 'border'
                  } transition-all`}
                style={plan.popular
                  ? { backgroundColor: C.primary }
                  : { backgroundColor: C.surfaceLowest, borderColor: C.outlineVariant }
                }
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                    style={{ ...hFont, backgroundColor: C.secondaryContainer, letterSpacing: '0.08em' }}
                  >
                    POPULAR
                  </span>
                )}
                <h3
                  className="text-2xl font-semibold mb-2"
                  style={{ ...hFont, color: plan.popular ? C.onPrimary : C.primary }}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span
                    className="text-[40px] font-bold"
                    style={{ ...hFont, color: plan.popular ? C.onPrimary : C.primary }}
                  >
                    ₹{plan.price}
                  </span>
                </div>
                <ul className="space-y-3 mb-10">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check size={18} className="mt-0.5 flex-shrink-0" style={{ color: plan.popular ? '#4ade80' : C.secondary }} />
                      <span className="text-base" style={{ color: plan.popular ? 'rgba(255,255,255,0.8)' : C.onSurfaceVariant }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navTo('/auth')}
                  className="w-full py-3 rounded font-bold text-xs uppercase tracking-wider transition-all hover:opacity-90"
                  style={plan.popular
                    ? { ...hFont, backgroundColor: C.onPrimary, color: C.primary, letterSpacing: '0.08em' }
                    : { ...hFont, backgroundColor: C.secondary, color: C.onPrimary, letterSpacing: '0.08em' }
                  }
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ backgroundColor: C.primary }}>
        <div className="max-w-[1280px] mx-auto px-8 py-20 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2" style={{ ...hFont, color: C.onPrimary }}>
              <MI icon="anchor" style={{ fontSize: 24 }} />
              <span className="text-2xl font-semibold">IMUpilot</span>
            </div>
            <p className="text-base max-w-xs" style={{ color: C.primaryFixedDim }}>
              Building the next generation of merchant navy officers with precision education and digital tools.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-12">
            <div className="space-y-1">
              <p className="font-bold text-white mb-2">Platform</p>
              <ul className="space-y-1">
                <li><button onClick={() => scrollTo('pricing')} className="text-base transition-colors hover:opacity-80" style={{ color: C.primaryFixedDim }}>Pricing</button></li>
                <li><button onClick={() => navTo('/test')} className="text-base transition-colors hover:opacity-80" style={{ color: C.primaryFixedDim }}>Mock Tests</button></li>
                <li><button onClick={() => navTo('/revise')} className="text-base transition-colors hover:opacity-80" style={{ color: C.primaryFixedDim }}>Flashcards</button></li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-white mb-2">Support</p>
              <ul className="space-y-1">
                <li><span className="text-base" style={{ color: C.primaryFixedDim }}>Contact Support</span></li>
                <li><span className="text-base" style={{ color: C.primaryFixedDim }}>Terms of Service</span></li>
                <li><span className="text-base" style={{ color: C.primaryFixedDim }}>Privacy Policy</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-8 border-t py-2" style={{ borderColor: C.primaryContainer }}>
          <p className="text-base text-center md:text-left" style={{ color: C.primaryFixedDim }}>
            © 2026 IMUpilot. Maritime Excellence Guaranteed.
          </p>
        </div>
      </footer>
    </div>
  );
}
