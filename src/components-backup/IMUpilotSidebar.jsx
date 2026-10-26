import { useNavigate, useLocation } from "react-router-dom";
import { Anchor, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const IC = ({ path, size = 16 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  analytics:  "M4 20V14M9 20V8M14 20V12M19 20V4",
  revision:   "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  planner:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  purchases:  "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  notes:      "M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z M8 7h8M8 11h8M8 15h5",
  flashcard:  "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  mock:       "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  pyq:        "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0",
  sectional:  "M4 6h16M4 10h16M4 14h10M4 18h6",
  contact:    "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  logout:     "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  menu:       "M4 6h16M4 12h16M4 18h16",
  close:      "M6 18L18 6M6 6l12 12",
};

const NAV = [
  { section: "DASHBOARD", items: [
    { id: "dashboard", label: "Dashboard",       icon: "dashboard", path: "/dashboard" },
    { id: "analytics", label: "Analytics",       icon: "analytics", path: "/analytics" },
    { id: "flashcard", label: "Flashcards",      icon: "flashcard", path: "/revise" },
    { id: "planner",   label: "Planner",         icon: "planner",   path: "/planner" },
    { id: "purchases", label: "Purchases",       icon: "purchases", path: null, soon: true },
  ]},
  { section: "PRACTICE", items: [
    { id: "notes",     label: "Topic Notes",     icon: "notes",     path: "/learn" },
    { id: "mock",      label: "Mock Tests",      icon: "mock",      path: "/test", newTab: true },
    { id: "pyq",       label: "Past Papers",     icon: "pyq",       path: null, soon: true },
    { id: "sectional", label: "Sectional Tests", icon: "sectional", path: "/test/sectional", newTab: true },
  ]},
];

// Bottom nav items for mobile (most used only)
const BOTTOM_NAV = [
  { id: "dashboard", label: "Home",      icon: "dashboard", path: "/dashboard" },
  { id: "flashcard", label: "Flashcards",icon: "flashcard", path: "/revise" },
  { id: "mock",      label: "Tests",     icon: "mock",      path: "/test", newTab: true },
  { id: "analytics", label: "Analytics", icon: "analytics", path: "/analytics" },
  { id: "notes",     label: "Notes",     icon: "notes",     path: "/learn" },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function IMUpilotSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isActive = (path) => path && location.pathname === path;

  const handleNav = (item) => {
    if (item.soon || !item.path) return;
    if (item.newTab) {
      window.open(item.path, "_blank");
    } else {
      navigate(item.path);
    }
    setMenuOpen(false);
  };

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
            <div style={{ width: 32, height: 32, background: "var(--accent-navy)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <Anchor size={16} strokeWidth={2.5} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>IMUpilot</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={toggleTheme} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 6 }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 6, borderRadius: 8 }}>
              <IC path={menuOpen ? ICONS.close : ICONS.menu} size={22} />
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {menuOpen && (
          <div style={{ position: "fixed", top: 52, left: 0, right: 0, bottom: 0, zIndex: 99, background: "rgba(0,0,0,0.6)" }} onClick={() => setMenuOpen(false)}>
            <div style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)", padding: "12px 16px 16px", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
              {NAV.map(group => (
                <div key={group.section} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", padding: "0 4px 6px", textTransform: "uppercase" }}>
                    {group.section}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {group.items.map(item => {
                      const active = isActive(item.path);
                      return (
                        <button key={item.id} onClick={() => handleNav(item)}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid", borderColor: active ? "var(--accent-primary)" : "var(--border-subtle)", cursor: item.soon ? "default" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 500, background: active ? "var(--accent-primary-subtle)" : "var(--bg-primary)", color: active ? "var(--accent-primary)" : item.soon ? "var(--text-muted)" : "var(--text-secondary)", textAlign: "left", opacity: item.soon ? 0.6 : 1 }}>
                          <IC path={ICONS[item.icon]} size={15} />
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {item.soon && <span style={{ fontSize: 8, fontWeight: 700, background: "var(--surface-3)", color: "var(--text-tertiary)", padding: "2px 5px", borderRadius: 999 }}>SOON</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* User + logout */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 12, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                    {(user.name || 'S')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{user.name || 'Student'}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{user.phone || ''}</div>
                  </div>
                </div>
                <button onClick={() => { navigate("/"); setMenuOpen(false); }}
                  style={{ background: "var(--accent-danger-subtle)", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--accent-danger)", fontFamily: "inherit" }}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom nav bar */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "var(--bg-elevated)", borderTop: "1px solid var(--border-subtle)", display: "flex", height: 60 }}>
          {BOTTOM_NAV.map(item => {
            const active = isActive(item.path);
            return (
              <button key={item.id} onClick={() => handleNav(item)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", color: active ? "var(--accent-primary)" : "var(--text-tertiary)", transition: "color 0.15s" }}>
                <IC path={ICONS[item.icon]} size={20} />
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500 }}>{item.label}</span>
                {active && <div style={{ position: "absolute", bottom: 0, width: 24, height: 2, background: "var(--accent-primary)", borderRadius: 999 }} />}
              </button>
            );
          })}
        </div>

        {/* Spacer so content isn't hidden behind top/bottom bars */}
        <div style={{ height: 52 }} />
      </>
    );
  }

  // ── DESKTOP SIDEBAR ───────────────────────────────────────────────────────
  return (
    <aside style={{ width: 232, flexShrink: 0, height: "100vh", background: "var(--bg-elevated)", borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", overflow: "hidden", position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          <div style={{ width: 36, height: 36, background: "var(--accent-navy)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Anchor size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>IMUpilot</div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 500 }}>IMUCET Prep</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 12px" }}>
        {NAV.map(group => (
          <div key={group.section} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)", padding: "0 8px 7px", textTransform: "uppercase" }}>
              {group.section}
            </div>
            {group.items.map(item => {
              const active = isActive(item.path);
              return (
                <button key={item.id} onClick={() => handleNav(item)}
                  title={item.soon ? "Coming soon" : ""}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", borderRadius: 9, border: "none", cursor: item.soon ? "default" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 500, background: active ? "var(--accent-primary-subtle)" : "transparent", color: active ? "var(--accent-primary)" : item.soon ? "var(--text-muted)" : "var(--text-secondary)", transition: "all 0.15s", textAlign: "left", marginBottom: 2, opacity: item.soon ? 0.6 : 1 }}>
                  <span style={{ flexShrink: 0, color: active ? "var(--accent-primary)" : item.soon ? "var(--text-muted)" : "var(--text-tertiary)" }}>
                    <IC path={ICONS[item.icon]} size={15} />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.soon && <span style={{ fontSize: 9, fontWeight: 700, background: "var(--surface-3)", color: "var(--text-tertiary)", padding: "2px 6px", borderRadius: 999 }}>SOON</span>}
                  {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent-primary)", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "12px 14px" }}>
        <button onClick={toggleTheme}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 4, textAlign: "left" }}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button onClick={() => navigate("/contact")}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8, textAlign: "left" }}>
          <IC path={ICONS.contact} size={15} />
          Contact Us
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {(user.name || 'S')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name || 'Student'}</div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.phone || ''}</div>
          </div>
          <button onClick={() => navigate("/")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: 4, borderRadius: 6, display: "flex" }} title="Log out">
            <IC path={ICONS.logout} size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
