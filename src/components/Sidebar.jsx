import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  RotateCcw,
  BarChart3,
  Settings,
  HelpCircle,
  Headphones,
  Sun,
  Moon,
  X,
  Anchor,
  Tag,
} from 'lucide-react';

const navigation = [
  {
    section: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/pricing', icon: Tag, label: 'Pricing' },
      { to: '/learn', icon: BookOpen, label: 'Learn', badge: 3 },
      { to: '/test', icon: FileText, label: 'Mock Tests' },
      { to: '/revise', icon: RotateCcw, label: 'Revision' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    section: 'Support',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
      { to: '/contact', icon: Headphones, label: 'Contact Support' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose, user }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        id="sidebar-overlay"
      />

      <motion.aside
        className={`sidebar ${isOpen ? 'open' : ''}`}
        initial={false}
        id="main-sidebar"
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Anchor size={16} strokeWidth={2.5} />
            </div>
            <div className="logo-text">
              <span className="logo-title">IMUPilot</span>
              <span className="logo-subtitle">IMUCET Prep Platform</span>
            </div>
            <button
              className="header-btn mobile-menu-btn"
              onClick={onClose}
              style={{ marginLeft: 'auto' }}
              aria-label="Close menu"
              id="close-sidebar-btn"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((section) => (
            <div className="nav-section" key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                  id={`nav-${item.label.toLowerCase().replace(/[^a-z]/g, '-')}`}
                  end={item.to === '/dashboard'}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            id="theme-toggle-btn"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* User */}
          <div className="sidebar-user" id="sidebar-user-info">
            <div className="user-avatar">{user.initials}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
