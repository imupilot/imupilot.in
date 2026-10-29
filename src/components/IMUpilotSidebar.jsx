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
  pricing:    "M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  logout:     "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  menu:       "M4 6h16M4 12h16M4 18h16",
  close:      "M6 18L18 6M6 6l12 12",
  interview:  "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
  lock:       "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
};

const NAV = [
  { section: "OVERVIEW", items: [
    { id: "dashboard", label: "Dashboard",       icon: "dashboard", path: "/dashboard" },
    { id: "notes",     label: "Notes",           icon: "notes",     path: "/notes" },
    { id: "pricing",   label: "Pricing",         icon: "pricing",   path: "/pricing" },
    { id: "analytics", label: "Analytics",       icon: "analytics", path: "/analytics" },
    { id: "learn",     label: "Learn",           icon: "notes",     path: "/learn" },
    { id: "planner",   label: "Planner",         icon: "planner",   path: "/planner" },
  ]},
  { section: "PRACTICE", items: [
    { id: "mock",      label: "Mock Tests",      icon: "mock",      path: "/test" },
    { id: "pyq",       label: "PYQs",            icon: "pyq",       path: null, soon: true },
    { id: "sectional", label: "Sectionals",      icon: "sectional", path: "/test/sectional" },
    { id: "flashcard", label: "Flashcards",      icon: "flashcard", path: "/revise" },
    { id: "interview", label: "Mock Interview",  icon: "interview", path: "/interview", pro: true },
  ]},
  { section: "PREPARATION", items: [
    { id: "dns",       label: "DNS Prep",        icon: "planner",   path: null, soon: true },
    { id: "predictor", label: "College Predictor", icon: "analytics", path: null, soon: true },
  ]},
];


function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export function MobileTopBar({ onOpen }) {
  return (
    <div
      style={{
        display: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      className="mobile-topbar"
    >
      <span style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>IMUpilot</span>
      <button
        onClick={onOpen}
        type="button"
        aria-label="Open menu"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#0F172A',
          fontSize: 22,
          lineHeight: 1,
        }}
      >
        ☰
      </button>
    </div>
  );
}

export default function IMUpilotSidebar({ mobileOpen: externalOpen, setMobileOpen: externalSetOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = useState(false);

  const mobileOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setMobileOpen = externalSetOpen || setInternalOpen;

  const isActive = (path) => path && location.pathname === path;

  const handleNav = (item) => {
    if (item.soon || !item.path) return;
    if (item.newTab) {
      window.open(item.path, "_blank");
    } else {
      navigate(item.path);
    }
    setMobileOpen(false);
  };

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();
  const userIsPro = user?.plan === 'pro' || user?.plan === 'pro_max';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      localStorage.removeItem("user");
      setMobileOpen(false);
      navigate("/auth", { replace: true });
    }
  };

  return (
    <>
      {/* Overlay when mobile menu is open */}
      <div 
        style={{
          display: mobileOpen ? 'block' : 'none',
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 40
        }}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar itself */}
      <aside
        className="imupilot-sidebar"
        style={{
          position: (isMobile || (typeof window !== 'undefined' && window.innerWidth < 768)) ? 'fixed' : 'relative',
          left: (isMobile || (typeof window !== 'undefined' && window.innerWidth < 768)) ? (mobileOpen ? 0 : '-280px') : 0,
          top: 0,
          bottom: 0,
          width: 260,
          flexShrink: 0,
          zIndex: 50,
          transition: 'left 0.25s ease',
          height: "100vh",
          background: "#fff",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {/* Logo */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}>
            <span style={{ display: "flex", color: "#0F172A" }}><LogoIcon /></span>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#0F172A", letterSpacing: "-0.03em" }}>IMUpilot</div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            type="button"
            className="mobile-close-btn"
            aria-label="Close menu"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748B",
              padding: 4,
              display: "flex",
              alignItems: "center",
              borderRadius: 6,
            }}
          >
            <IC path={ICONS.close} size={20} />
          </button>
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
                    title={item.soon ? "Coming soon" : item.pro && !userIsPro ? "Pro only" : ""}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: 10, border: "none", cursor: item.soon ? "default" : "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 500, background: active ? "#0F172A" : "transparent", color: active ? "#fff" : item.soon ? "#CBD5E1" : "#475569", transition: "all 0.15s", textAlign: "left", marginBottom: 3, opacity: item.soon ? 0.65 : 1 }}>
                    <span style={{ flexShrink: 0, color: active ? "#fff" : item.soon ? "#CBD5E1" : "#64748B" }}>
                      <IC path={ICONS[item.icon]} size={15} />
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.soon && <span style={{ fontSize: 9, fontWeight: 700, background: "#F1F5F9", color: "#94A3B8", padding: "2px 6px", borderRadius: 999 }}>SOON</span>}
                    {item.pro && !userIsPro && (
                      <span style={{ fontSize: 9, fontWeight: 700, background: "rgba(26,47,90,0.1)", color: "#1a2f5a", padding: "2px 6px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 3 }}>
                        PRO <IC path={ICONS.lock} size={9} />
                      </span>
                    )}
                    {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #E2E8F0", padding: "12px 14px" }}>
          <button onClick={() => { navigate("/contact"); setMobileOpen(false); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6, textAlign: "left" }}>
            <IC path={ICONS.contact} size={15} />
            Help &amp; Support
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
    </>
  );
}
