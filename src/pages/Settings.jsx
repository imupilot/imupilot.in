import { useState } from 'react';
import { User, Bell, Monitor, Lock, Shield, Palette, Save, Camera, Moon, Sun, Zap, Check } from 'lucide-react';
import IMUpilotSidebar from '../components/IMUpilotSidebar';

const Toggle = ({ on, onToggle }) => (
  <button onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', background: on ? '#E8630A' : '#E4E1D9', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
    <span style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transition: 'left 0.2s' }} />
  </button>
);

const Section = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid #ECEAE4', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A18', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #ECEAE4' }}>{title}</div>
    {children}
  </div>
);

export default function Settings() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifs, setNotifs] = useState({ mockReminders: true, weakTopicAlerts: true, weeklyProgress: true, newTests: false, whatsapp: true, email: true });
  const [prefs, setPrefs] = useState({ autoNext: true, negativeMarking: true, timerWarning: true, keyboardShortcuts: true, fullscreen: false, autoSave: true });
  const [theme, setTheme] = useState('light');
  const [duration, setDuration] = useState('180');

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans','Segoe UI',sans-serif", background: '#F7F6F3', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <IMUpilotSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden', overflowY: 'auto' }}>
        {/* Mobile topbar */}
        <div style={{
          display: 'none', // hidden on desktop via CSS
          position: 'sticky', top: 0, zIndex: 30,
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }} className="mobile-topbar">
          <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>IMUpilot</span>
          <button onClick={() => setMobileOpen(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#0F172A', fontSize: 22
          }}>☰</button>
        </div>

        <div style={{ background: '#fff', borderBottom: '1px solid #ECEAE4', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: '#1A1A18' }}>Settings</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Manage your profile and preferences</div>
          </div>
          <button style={{ background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={14} /> Save Changes
          </button>
        </div>

        <div style={{ padding: 'clamp(12px, 4vw, 28px)', maxWidth: 800 }}>

          {/* PROFILE */}
          <Section title="👤 Profile Settings">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 72, height: 72, borderRadius: 16, background: '#1B3A6B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 700 }}>AM</div>
                <button style={{ position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: 8, background: '#E8630A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Camera size={12} />
                </button>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1A1A18' }}>Your Avatar</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>JPG, PNG. Max 800KB.</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[['Full Name','Arjun Menon','text'],['Email','arjun@example.com','email'],['Phone','+91 98765 43210','tel']].map(([l,v,t]) => (
                <div key={l}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</label>
                  <input type={t} defaultValue={v} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ECEAE4', background: '#F7F6F3', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target Year</label>
                <select style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ECEAE4', background: '#F7F6F3', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}>
                  <option>2026</option><option>2027</option>
                </select>
              </div>
            </div>
          </Section>

          {/* EXAM PREFS */}
          <Section title="⚙️ Exam Preferences">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
              {[
                ['autoNext','Auto-next question','Jump to next on answer'],
                ['negativeMarking','Show negative marking','Display penalty info'],
                ['timerWarning','Timer warning alerts','Alert at 30, 10, 5 min'],
                ['keyboardShortcuts','Keyboard shortcuts','Rapid navigation with keys'],
                ['fullscreen','Fullscreen test mode','Force fullscreen during exams'],
                ['autoSave','Auto-save answers','Backup answers every minute'],
              ].map(([k,l,d]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F7F6F3', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>{l}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{d}</div>
                  </div>
                  <Toggle on={prefs[k]} onToggle={() => setPrefs(p => ({...p,[k]:!p[k]}))} />
                </div>
              ))}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Default Duration</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['60','120','180'].map(m => (
                  <button key={m} onClick={() => setDuration(m)} style={{ padding: '8px 20px', borderRadius: 8, border: `1.5px solid ${duration === m ? '#E8630A' : '#ECEAE4'}`, background: duration === m ? '#E8630A' : '#fff', color: duration === m ? '#fff' : '#4A5568', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* NOTIFICATIONS */}
          <Section title="🔔 Notifications">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                ['mockReminders','Mock test reminders','Get notified of scheduled sessions'],
                ['weakTopicAlerts','Weak topic alerts','Automated performance suggestions'],
                ['weeklyProgress','Weekly progress reports','Detailed weekly analysis'],
                ['newTests','New test notifications','Alerts for new test papers'],
                ['whatsapp','WhatsApp notifications','Direct alerts to your mobile'],
                ['email','Email notifications','Detailed reports in inbox'],
              ].map(([k,l,d]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: 10, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F7F6F3'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>{l}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{d}</div>
                  </div>
                  <Toggle on={notifs[k]} onToggle={() => setNotifs(p => ({...p,[k]:!p[k]}))} />
                </div>
              ))}
            </div>
          </Section>

          {/* APPEARANCE */}
          <Section title="🎨 Appearance">
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Theme</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { id: 'light', label: 'Light',        bg: '#F7F6F3', icon: <Sun size={20} color="#E8630A" /> },
                { id: 'dark',  label: 'Dark',         bg: '#1A1A2E', icon: <Moon size={20} color="#fff" /> },
                { id: 'navy',  label: 'Navy Premium', bg: '#1B3A6B', icon: <Zap size={20} color="#fff" /> },
              ].map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)} style={{ padding: '16px 12px', borderRadius: 14, border: `2px solid ${theme === t.id ? '#E8630A' : '#ECEAE4'}`, background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 10, background: t.bg, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {theme === t.id && <div style={{ position: 'relative' }}>{t.icon}<span style={{ position: 'absolute', top: -6, right: -8, width: 14, height: 14, borderRadius: '50%', background: '#E8630A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={8} color="#fff" /></span></div>}
                    {theme !== t.id && t.icon}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A18' }}>{t.label}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* SECURITY */}
          <Section title="🔒 Security">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>Account Password</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Last changed 3 months ago</div>
              </div>
              <button style={{ background: '#F7F6F3', border: '1px solid #ECEAE4', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Change Password</button>
            </div>
            <div style={{ background: '#FFF5F5', border: '1px solid #FED7D7', borderRadius: 12, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#C53030' }}>Danger Zone</div>
                <div style={{ fontSize: 11, color: '#FC8181', marginTop: 2 }}>These actions cannot be undone.</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: '#fff', border: '1px solid #FEB2B2', color: '#C53030', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Logout All</button>
                <button style={{ background: '#C53030', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>Delete Account</button>
              </div>
            </div>
          </Section>

        </div>
      </main>
    </div>
  );
}
