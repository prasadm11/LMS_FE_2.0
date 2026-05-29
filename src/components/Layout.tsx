import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AddBookModal from './AddBookModal';
import AddMemberModal from './AddMemberModal';
import IssueBookModal from './IssueBookModal';
import EditBookModal from './EditBookModal';
import RateBookModal from './RateBookModal';
import BookReviewsModal from './BookReviewsModal';
import LoginModal from './LoginModal';
import './Layout.css';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout-container">
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-wrapper">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <AddBookModal />
      <AddMemberModal />
      <IssueBookModal />
      <EditBookModal />
      <RateBookModal />
      <BookReviewsModal />
      <LoginModal />
    </div>
  );
}

