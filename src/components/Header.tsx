import { useState, useEffect } from 'react';
import { Search, Bell, AlertCircle, Info, Filter, UserPlus, BookPlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import './Header.css';

export default function Header() {
  const {
    setAddModalOpen, currentUser, searchBooks,
    notifications, markAllAsRead, setLoginModalOpen, fetchNotifications, setAddMemberModalOpen
  } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPage, setNotificationPage] = useState(1);
  const notificationPageSize = 10;
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        searchBooks(searchQuery);
        if (location.pathname !== '/catalog') {
          navigate('/catalog');
        }
      } else if (location.pathname === '/catalog') {
        searchBooks('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchBooks, navigate, location.pathname]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleLoadMoreNotifications = async () => {
    const nextPage = notificationPage + 1;
    await fetchNotifications(nextPage, notificationPageSize);
    setNotificationPage(nextPage);
  };

  return (
    <header className="header glass-panel">
      <div className="search-bar">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search books, authors, ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="header-actions">
        {currentUser?.role === 'Admin' && location.pathname === '/catalog' && (
          <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
            <BookPlus size={18} />
            New Book
          </button>
        )}
        {location.pathname === '/catalog' && (
          <button className="btn btn-outline">
            <Filter size={18} />
            {/* Filters */}
          </button>
        )}
        {currentUser?.role === 'Admin' && location.pathname === '/members' && (
          <button className="btn btn-primary" onClick={() => setAddMemberModalOpen(true)}>
            <UserPlus size={18} />
            New Member
          </button>
        )}
        {currentUser ? (
          <div className="notification-wrapper">
            <button
              className={`icon-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="notification-dropdown glass-card">
                <div className="dropdown-header flex-between">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && (
                    <button className="text-btn" onClick={handleMarkAllAsRead}>
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="dropdown-content">
                  {notifications.length === 0 ? (
                    <div className="empty-state">
                      <Bell size={40} className="empty-icon" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(n => (
                      <div
                        key={n.id}
                        className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                      >
                        <div className="notification-icon-wrapper">
                          {n.type === 'Overdue' ? <AlertCircle size={18} color="#ef4444" /> : <Info size={18} color="var(--accent-blue)" />}
                        </div>
                        <div className="notification-body">
                          <div className="notification-title">{n.title}</div>
                          <div className="notification-msg">{n.message}</div>
                          <div className="notification-meta">
                            <span className="notification-time">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                            {!n.isRead && <span className="unread-dot"></span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {notifications.length >= notificationPage * notificationPageSize && (
                    <div style={{ textAlign: 'center', padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                      <button className="text-btn" onClick={handleLoadMoreNotifications} style={{ fontSize: '0.85rem' }}>
                        Load More
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setLoginModalOpen(true)}
            style={{ padding: '0.6rem 1.5rem', fontWeight: 600 }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
