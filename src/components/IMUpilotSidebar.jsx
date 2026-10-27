import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogoIcon } from "./Icons";
import { supabase } from "../supabaseClient";

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
  { section: "OVERVIEW", items: [
    { id: "dashboard", label: "Dashboard",       icon: "dashboard", path: "/dashboard" },
    { id: "analytics", label: "Analytics",       icon: "analytics", path: "/analytics" },
    { id: "learn",     label: "Learn",           icon: "notes",     path: "/learn" },
    { id: "planner",   label: "Planner",         icon: "planner",   path: "/planner" },
  ]},
  { section: "PRACTICE", items: [
    { id: "mock",      label: "Mock Tests",      icon: "mock",      path: "/test" },
    { id: "pyq",       label: "PYQs",            icon: "pyq",       path: null, soon: true },
    { id: "sectional", label: "Sectionals",      icon: "sectional", path: "/test/sectional" },
    { id: "flashcard", label: "Flashcards",      icon: "flashcard", path: "/revise" },
  ]},
  { section: "PREPARATION", items: [
    { id: "dns",       label: "DNS Prep",        icon: "planner",   path: null, soon: true },
    { id: "predictor", label: "College Predictor", icon: "analytics", path: null, soon: true },
  ]},
];

// Bottom nav items for mobile (most used only)
const BOTTOM_NAV = [
  { id: "dashboard", label: "Home",      icon: "dashboard", path: "/dashboard" },
  { id: "learn",     label: "Learn",     icon: "notes",     path: "/learn" },
  { id: "mock",      label: "Tests",     icon: "mock",      path: "/test" },
  { id: "planner",   label: "Planner",   icon: "planner",   path: "/planner" },
  { id: "analytics", label: "Analytics", icon: "analytics", path: "/analytics" },
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      localStorage.removeItem("user");
      setMenuOpen(false);
      navigate("/auth", { replace: true });
    }
  };

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #E2E8F0", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
            <span style={{ display: "flex", color: "#0F172A" }}><LogoIcon /></span>
            <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em", color: "#0F172A" }}>IMUPilot</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 6, borderRadius: 8 }}>
              <IC path={menuOpen ? ICONS.close : ICONS.menu} size={22} />
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {menuOpen && (
          <div style={{ position: "fixed", top: 56, left: 0, right: 0, bottom: 0, zIndex: 99, background: "rgba(15,23,42,0.35)" }} onClick={() => setMenuOpen(false)}>
            <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "12px 16px 16px", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
              {NAV.map(group => (
                <div key={group.section} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#94A3B8", padding: "0 4px 6px", textTransform: "uppercase" }}>
                    {group.section}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {group.items.map(item => {
                      const active = isActive(item.path);
                      return (
                        <button key={item.id} onClick={() => handleNav(item)}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, border: "1px solid", borderColor: active ? "#0F172A" : "#E2E8F0", cursor: item.soon ? "default" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 500, background: active ? "#0F172A" : "#fff", color: active ? "#fff" : item.soon ? "#CBD5E1" : "#475569", textAlign: "left", opacity: item.soon ? 0.65 : 1 }}>
                          <IC path={ICONS[item.icon]} size={15} />
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {item.soon && <span style={{ fontSize: 8, fontWeight: 700, background: "#F1F5F9", color: "#94A3B8", padding: "2px 5px", borderRadius: 999 }}>SOON</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* User + logout */}
              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 12, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0F172A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                    {(user.name || 'S')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{user.name || 'Student'}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{user.phone || ''}</div>
                  </div>
                </div>
                <button onClick={handleLogout}
                  style={{ background: "var(--accent-danger-subtle)", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--accent-danger)", fontFamily: "inherit" }}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom nav bar */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderTop: "1px solid #E2E8F0", display: "flex", height: 60 }}>
          {BOTTOM_NAV.map(item => {
            const active = isActive(item.path);
            return (
              <button key={item.id} onClick={() => handleNav(item)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", color: active ? "#0F172A" : "#64748B", transition: "color 0.15s" }}>
                <IC path={ICONS[item.icon]} size={20} />
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500 }}>{item.label}</span>
                {active && <div style={{ position: "absolute", bottom: 0, width: 24, height: 2, background: "#0F172A", borderRadius: 999 }} />}
              </button>
            );
          })}
        </div>

        {/* Spacer so content isn't hidden behind top/bottom bars */}
        <div style={{ height: 56 }} />
      </>
    );
  }

  // ── DESKTOP SIDEBAR ───────────────────────────────────────────────────────
  return (
    <aside className="imupilot-sidebar" style={{ width: 232, flexShrink: 0, height: "100vh", background: "#fff", borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", overflow: "hidden", position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
          <span style={{ display: "flex", color: "#0F172A" }}><LogoIcon /></span>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#0F172A", letterSpacing: "-0.03em" }}>IMUPilot</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="imupilot-sidebar-nav" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 12px" }}>
        {NAV.map(group => (
          <div key={group.section} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#94A3B8", padding: "0 8px 7px", textTransform: "uppercase" }}>
              {group.section}
            </div>
            {group.items.map(item => {
              const active = isActive(item.path);
              return (
                <button key={item.id} onClick={() => handleNav(item)}
                  title={item.soon ? "Coming soon" : ""}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: 10, border: "none", cursor: item.soon ? "default" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 500, background: active ? "#0F172A" : "transparent", color: active ? "#fff" : item.soon ? "#CBD5E1" : "#475569", transition: "all 0.15s", textAlign: "left", marginBottom: 3, opacity: item.soon ? 0.65 : 1 }}>
                  <span style={{ flexShrink: 0, color: active ? "#fff" : item.soon ? "#CBD5E1" : "#64748B" }}>
                    <IC path={ICONS[item.icon]} size={15} />
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.soon && <span style={{ fontSize: 9, fontWeight: 700, background: "#F1F5F9", color: "#94A3B8", padding: "2px 6px", borderRadius: 999 }}>SOON</span>}
                  {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid #E2E8F0", padding: "12px 14px" }}>
        <button onClick={() => navigate("/contact")}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#475569", textAlign: "left" }}>
          <IC path={ICONS.contact} size={15} />
          Help &amp; Support
        </button>
        <button onClick={() => navigate("/privacy")}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6, textAlign: "left" }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Privacy Policy
        </button>
        {user.id && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderTop: "1px solid #F1F5F9", paddingTop: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#0F172A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {(user.name || 'S')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name || 'Student'}</div>
            </div>
            <button onClick={handleLogout}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: 4, borderRadius: 6, display: "flex", alignItems: "center" }} title="Log out">
              <IC path={ICONS.logout} size={15} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
