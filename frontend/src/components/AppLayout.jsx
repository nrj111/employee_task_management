import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Activity, Bell, ChevronDown, LayoutDashboard, Search, Settings2, UsersRound, CheckSquare, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navigation = [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }, { to: '/employees', label: 'Employees', icon: UsersRound }, { to: '/tasks', label: 'Tasks', icon: CheckSquare }];
export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = location.pathname.startsWith('/employees') ? 'Employees' : location.pathname.startsWith('/tasks') ? 'Tasks' : 'Dashboard';
  const close = () => setMobileOpen(false);
  return <div className="app-shell">
    {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={close} />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark">NJ</span><div><strong>roots</strong><small>PEOPLE &amp; WORK</small></div><button className="mobile-close" onClick={close} aria-label="Close menu"><X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <button className="workspace-switch"><span className="workspace-avatar">R</span><span><strong>Roots Media</strong><small>Company workspace</small></span><ChevronDown size={15} /></button>
      <div className="nav-label">MENU</div>
      <nav className="main-nav">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={close} className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}><Icon size={18} strokeWidth={1.9} /><span>{label}</span>{label === 'Tasks' && <span className="nav-pip" />}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="nav-label">PREFERENCES</div><button className="nav-item"><Settings2 size={18} /><span>Settings</span></button><div className="help-card"><span className="help-orb"><Activity size={17} /></span><strong>Need a hand?</strong><p>Our team is here to help you.</p><button>Visit help center <span>↗</span></button></div><div className="profile"><span className="avatar avatar-lilac">NJ</span><span className="profile-copy"><strong>Neeraj Jalodiya</strong><small>Workspace admin</small></span><button aria-label="Profile options"><ChevronDown size={16} /></button></div></div>
    </aside>
    <section className="main-column"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div className="crumb"><span>Workspace</span><b>/</b><strong>{title}</strong></div><div className="top-actions"><button className="top-search" onClick={() => document.querySelector('.filter-search')?.focus()}><Search size={16} /><span>Search anything</span><kbd>⌘ K</kbd></button><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><span className="top-divider" /><button className="top-user"><span className="avatar avatar-lilac">AM</span><ChevronDown size={15} /></button></div></header><main className="page-content"><Outlet /></main><footer className="app-footer"><span>© 2025 Roots Media</span><span><i /> All systems operational</span></footer></section>
  </div>;
}
