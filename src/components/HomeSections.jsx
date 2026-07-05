import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  BookOpen,
  Languages,
  Check,
  CheckCircle2,
  PlayCircle,
  Clock,
  Anchor,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeUp, ParallaxHero, HoverCard, ScaleButton, AnimatedUnderlineLink } from './Motion';

const N = '#0B1F3A';
const N_HOVER = '#163661';
const N_DARK = '#061224';
const W = '#FFFFFF';
const BG = '#F8F9FA';
const T1 = '#1A2540';
const T2 = '#4B5563';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';

const btn = {
  primary: { backgroundColor: N, color: W, border: 'none', padding: '14px 32px', borderRadius: '6px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.2s', letterSpacing: '0.01em' },
  outline: { backgroundColor: W, color: N, border: `1.5px solid ${BD}`, padding: '14px 32px', borderRadius: '6px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s', letterSpacing: '0.01em' },
  accent: { backgroundColor: N_HOVER, color: W, border: 'none', padding: '14px 32px', borderRadius: '6px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.2s', letterSpacing: '0.01em' },
};

const card = { backgroundColor: W, border: `1px solid ${BD}`, borderRadius: '12px', padding: '32px' };

export default function HomeSections() {
  const navigate = useNavigate();

  return (
    <>
      {/* ── STATS STRIP ── */}
      <section style={{ backgroundColor: W, borderBottom: `1px solid ${BD}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', textAlign: 'center' }}>
          {[
            { val: '100+', label: 'Mock Tests' },
            { val: '1,300+', label: 'Idioms & Vocab' },
            { val: '5,000+', label: 'Aspirants Enrolled' },
            { val: '2023–25', label: 'Past Papers' },
          ].map((s, i) => (
            <FadeUp key={i} delay={0.1 * i} style={{ borderRight: i < 3 ? `1px solid ${BD}` : 'none', paddingRight: i < 3 ? '32px' : 0 }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: N, letterSpacing: '-1px', marginBottom: '4px' }}>{s.val}</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: T3, textTransform: 'uppercase', letterSpacing: '1.5px' }}>{s.label}</div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        id="features"
        style={{ padding: '100px 24px', backgroundColor: BG }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: N, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Platform Features</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800, color: T1, letterSpacing: '-1px', marginBottom: '12px' }}>Everything to rank higher</h2>
            <p style={{ fontSize: '17px', color: T2, maxWidth: '520px', lineHeight: 1.7 }}>Precision-crafted content that follows the latest IMUCET patterns from 2023 to 2025.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <FadeUp delay={0.1} style={{ gridColumn: 'span 2' }}>
              <HoverCard style={{ ...card, backgroundColor: N, border: 'none', padding: '40px', position: 'relative', overflow: 'hidden', height: '100%' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 32px)`, pointerEvents: 'none' }} />
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Updated 2025</div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: W, marginBottom: '12px', letterSpacing: '-0.5px' }}>Past Papers 2023–2025</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '16px', maxWidth: '400px', lineHeight: 1.7 }}>
                  Direct access to original exam questions with detailed solutions and concept breakdowns.
                </p>
                <ScaleButton
                  onClick={() => navigate('/auth')}
                  style={{ ...btn.accent, marginTop: '28px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = N}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = N_HOVER}
                >
                  Explore Papers <ArrowRight size={16} />
                </ScaleButton>
              </HoverCard>
            </FadeUp>

            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              className="hover:shadow-xl transition-all duration-300"
              style={{ ...card, display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}
            >
              <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(27,58,107,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: N }}>
                <Clock size={22} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: T1, letterSpacing: '-0.3px' }}>Chapter Tests</h3>
              <p style={{ color: T2, fontSize: '14px', lineHeight: 1.7 }}>Targeted practice for high-weightage PCM topics in a timed environment.</p>
            </motion.div>

            {[
              { icon: ClipboardList, title: 'Full-Length Mocks', desc: '3-hour IMUCET simulation with CBT interface and auto-evaluation.' },
              { icon: BookOpen, title: 'NCERT Notes', desc: 'Simplified and structured notes designed for rapid exam-day retention.' },
              { icon: Languages, title: 'English Module', desc: 'Vocabulary, idioms, grammar, and reading comprehension — all in one module.' },
            ].map((f, i) => (
              <FadeUp key={i} delay={0.1 * (i + 3)}>
                <HoverCard style={{ ...card, height: '100%' }}>
                  <div style={{ width: '44px', height: '44px', backgroundColor: i === 0 ? 'rgba(11, 31, 58, 0.1)' : 'rgba(11, 31, 58, 0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: N, marginBottom: '16px' }}>
                    <f.icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: T1, marginBottom: '8px', letterSpacing: '-0.3px' }}>{f.title}</h3>
                  <p style={{ color: T2, fontSize: '14px', lineHeight: 1.7 }}>{f.desc}</p>
                </HoverCard>
              </FadeUp>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── ANALYTICS SECTION ── */}
      <section id="analytics" style={{ backgroundColor: N_DARK, padding: '100px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <FadeUp delay={0.2} style={{ backgroundColor: N, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: W, marginBottom: '24px' }}>Performance Overview</div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '20px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Weak Chapter</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '28%', height: '100%', backgroundColor: '#EF4444' }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: W, whiteSpace: 'nowrap' }}>Wave Optics — 28%</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Improvement', value: '+22%', color: '#34D399' },
                { label: 'Avg Time / Q', value: '42s', color: W },
                { label: 'Tests Taken', value: '14', color: W },
                { label: 'Rank Est.', value: 'Top 8%', color: '#60A5FA' },
              ].map((m, i) => (
                <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>{m.label}</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>AI-Driven Insights</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: W, marginBottom: '20px', lineHeight: 1.1, letterSpacing: '-1px' }}>
              Stop guessing.<br />Start improving.
            </h2>
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', marginBottom: '36px', lineHeight: 1.7 }}>
              Our system detects patterns in your mistakes and tells you exactly where to focus to boost your rank.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Real-time performance benchmarking',
                'Topic-wise accuracy distribution',
                'Predictive rank estimation algorithm',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                  <CheckCircle2 size={18} color="#34D399" strokeWidth={2.5} /> {item}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '100px 24px', backgroundColor: W }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: N, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, color: T1, marginBottom: '12px', letterSpacing: '-1px' }}>Invest in your career</h2>
            <p style={{ fontSize: '16px', color: T2 }}>No hidden charges. Simple pricing for serious aspirants.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px', alignItems: 'start' }}>
            {[
              { name: 'Cadet Starter', sub: 'Perfect for self-paced revision', price: '₹1,500', features: ['50 Mock Tests', 'Chapter-wise PCM Tests', 'NCERT Short Notes'], cta: 'Choose Plan', featured: false },
              { name: 'Deck Officer Pro', sub: 'Complete suite for top rankers', price: '₹2,500', features: ['Unlimited Mock Tests', 'Weak Area Analytics', 'English Mastery Module', '2023–2025 Past Papers'], cta: 'Get Started Free', featured: true },
              { name: "Captain's Choice", sub: 'Mentorship and intensive prep', price: '₹3,500', features: ['Everything in Pro', '1-on-1 Strategy Session', 'Interview Guidance'], cta: 'Choose Plan', featured: false },
            ].map((plan, i) => (
              <div key={i} style={{ borderRadius: '12px', padding: '36px', border: plan.featured ? `2px solid ${N}` : `1px solid ${BD}`, backgroundColor: plan.featured ? N : W, position: 'relative' }}>
                {plan.featured && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', backgroundColor: N_HOVER, color: W, padding: '4px 16px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', color: plan.featured ? W : T1 }}>{plan.name}</div>
                <div style={{ fontSize: '13px', color: plan.featured ? 'rgba(255,255,255,0.6)' : T3, marginBottom: '24px' }}>{plan.sub}</div>
                <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '28px', color: plan.featured ? W : T1, letterSpacing: '-1px' }}>
                  {plan.price}
                  <span style={{ fontSize: '14px', fontWeight: 400, color: plan.featured ? 'rgba(255,255,255,0.5)' : T3 }}>/year</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 500, color: plan.featured ? 'rgba(255,255,255,0.85)' : T2 }}>
                      <Check size={16} color={plan.featured ? '#34D399' : '#16A34A'} strokeWidth={2.5} /> {f}
                    </div>
                  ))}
                </div>
                <ScaleButton
                  onClick={() => navigate('/auth')}
                  style={plan.featured ? { ...btn.accent, width: '100%', padding: '13px', backgroundColor: W, color: N } : { ...btn.outline, width: '100%', padding: '13px' }}
                  onMouseOver={e => { if (plan.featured) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'; } else e.currentTarget.style.borderColor = N; }}
                  onMouseOut={e => { if (plan.featured) { e.currentTarget.style.backgroundColor = W; } else e.currentTarget.style.borderColor = BD; }}
                >
                  {plan.cta}
                </ScaleButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '100px 24px', backgroundColor: BG }}>
        <FadeUp delay={0.2} style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: T1, marginBottom: '16px', letterSpacing: '-1.5px' }}>
            Ready to sail?
          </h2>
          <p style={{ fontSize: '18px', color: T2, marginBottom: '40px', lineHeight: 1.7 }}>
            Join 5,000+ aspirants who trust IMUPilot for their merchant navy entrance success.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <ScaleButton
              onClick={() => navigate('/auth')}
              style={{ ...btn.primary, fontSize: '16px', padding: '15px 40px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = N_HOVER}
              onMouseOut={e => e.currentTarget.style.backgroundColor = N}
            >
              Start Free Trial <ArrowRight size={18} />
            </ScaleButton>
            <ScaleButton style={{ ...btn.outline, fontSize: '16px', padding: '15px 36px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <PlayCircle size={20} /> Watch Demo
            </ScaleButton>
          </div>
        </FadeUp>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: N_DARK, padding: '60px 24px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', marginBottom: '48px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: 28, height: 28, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Anchor size={14} color="white" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: W, letterSpacing: '-0.3px' }}>IMUPilot</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', maxWidth: '260px', lineHeight: 1.7 }}>
                The digital curator for marine aspirants. Empowering the next generation of merchant mariners.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {['Privacy Policy', 'Terms', 'Curriculum', 'Contact'].map(link => (
                <AnimatedUnderlineLink key={link} href="#" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, transition: 'color 0.15s' }}
                  onMouseOver={e => e.target.style.color = W}
                  onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                >{link}</AnimatedUnderlineLink>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            © 2025 IMUPilot. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .home-nav-links { display: none !important; }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"],
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: repeat(3"],
          div[style*="gridTemplateColumns: 'repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: repeat(4"],
          div[style*="gridTemplateColumns: 'repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          div[style*="gridColumn: 'span 2'"] {
             grid-column: span 1 !important;
          }
        }
      `}</style>
    </>
  );
}
