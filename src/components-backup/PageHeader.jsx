import { Bell, Search, Menu } from 'lucide-react';

export default function PageHeader({ title, subtitle, onMenuClick }) {
  return (
    <header className="page-header" id="page-header">
      <div className="page-header-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="page-header-right">
        <button
          className="header-btn mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
          id="open-sidebar-btn"
        >
          <Menu />
        </button>
        <button className="header-btn" aria-label="Search" id="search-btn">
          <Search />
        </button>
        <button className="header-btn" aria-label="Notifications" id="notification-btn">
          <Bell />
          <span className="notification-dot" />
        </button>
      </div>
    </header>
  );
}
