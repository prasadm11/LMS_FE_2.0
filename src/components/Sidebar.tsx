import { NavLink } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Library, Users, Settings as SettingsIcon, LogOut, Clock, Inbox, Sun, Moon, BookMarked, X } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { settings, updateSettings, currentUser, logout } = useLibrary();

  const adminNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Catalog', path: '/catalog', icon: <Library size={20} /> },
    { name: 'Members', path: '/members', icon: <Users size={20} /> },
    { name: 'Loans', path: '/loans', icon: <Clock size={20} /> },
    { name: 'Requests', path: '/requests', icon: <Inbox size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  const userNavItems = [
    { name: 'My Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Browse Catalog', path: '/catalog', icon: <Library size={20} /> },
    { name: 'My Loans', path: '/loans', icon: <Clock size={20} /> },
    { name: 'My Reservations', path: '/reservations', icon: <BookMarked size={20} /> },
  ];

  const publicNavItems = [
    { name: 'Browse Catalog', path: '/catalog', icon: <Library size={20} /> },
  ];

  const navItems = !currentUser ? publicNavItems : currentUser.role === 'Admin' ? adminNavItems : userNavItems;

  return (
    <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
      <div className="logo-container">
        <div className="logo-icon">
          <BookOpen size={24} color="var(--accent-blue)" />
        </div>
        <span className="logo-text">{settings.libraryName}</span>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="user-profile" style={{ flexDirection: !currentUser ? 'column' : 'row', gap: !currentUser ? '1rem' : '0.75rem', alignItems: !currentUser ? 'center' : 'center' }}>
        {currentUser ? (
          <>
            <img src={currentUser.avatar} alt="Profile" className="avatar" />
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role">{currentUser.role}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', marginLeft: 'auto' }}>
              <button
                className="logout-btn"
                onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="logout-btn" onClick={logout} title="Logout" style={{ marginLeft: 0 }}>
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <button
              className="logout-btn"
              onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
              style={{ padding: '0.5rem', borderRadius: '50%' }}
            >
              {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

