import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, BarChart3, Loader2 } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import PageLoader from '../components/PageLoader';
import Pagination from '../components/Pagination';
import './Loans.css';

export default function Loans() {
  const {
    loans, books, members, currentUser, createRequest,
    borrowSummary, overdueBooks, dueSoonBooks, fetchDashboardStats,
    fetchLoans, userHistory, fetchUserHistory,
    setRateBookModalOpen, setSelectedBook, fetchBookById
  } = useLibrary();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const lastUserRef = useRef<number | null>(null);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Load data for the dashboard stats and loans based on role
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        lastUserRef.current = null;
        return;
      }

      const isInitial = lastUserRef.current !== currentUser.id;
      if (isInitial) {
        setIsInitialLoading(true);
        lastUserRef.current = currentUser.id;
      } else {
        setIsTabLoading(true);
      }

      if (currentUser.role === 'Admin') {
        if (isInitial) {
          await Promise.all([
            fetchDashboardStats(),
            fetchLoans(activeTab, currentPage, pageSize)
          ]);
        } else {
          await fetchLoans(activeTab, currentPage, pageSize);
        }
      } else if (currentUser.role === 'User') {
        await fetchUserHistory(currentPage, pageSize);
      }

      if (isInitial) {
        setIsInitialLoading(false);
      } else {
        setIsTabLoading(false);
      }
    };

    loadData();
  }, [currentUser, activeTab, currentPage, pageSize, fetchDashboardStats, fetchLoans, fetchUserHistory]);

  const isUser = currentUser?.role === 'User';

  const getFilteredLoans = () => {
    let baseLoans = isUser ? [...userHistory] : [...loans];

    if (activeTab === 'overdue') return overdueBooks;
    if (activeTab === 'soon') return dueSoonBooks;

    if (activeTab !== 'all') {
      baseLoans = baseLoans.filter(l => l.status === activeTab);
    }

    return baseLoans;
  };

  const filteredData = getFilteredLoans();

  const handleUserRequest = (type: 'Return' | 'Renew', bookId: number, borrowRecordId?: number) => {
    if (!currentUser) return;
    createRequest({
      type,
      bookId,
      memberId: currentUser.id,
      borrowRecordId
    });
  };

  const handleRateBookClick = async (bookId: number) => {
    const bookData = await fetchBookById(bookId);
    if (bookData) {
      setSelectedBook(bookData);
      setRateBookModalOpen(true);
    }
  };

  return (
    <div className="loans page-content">


      {borrowSummary && !isUser && (
        <div className="loans-summary-grid">
          <div className="summary-card glass-panel">
            <BarChart3 className="summary-icon blue" size={20} />
            <div className="summary-info">
              <span className="summary-label">Total Borrowed</span>
              <span className="summary-value">{borrowSummary.totalBorrowed}</span>
            </div>
          </div>
          <div className="summary-card glass-panel">
            <Clock className="summary-icon purple" size={20} />
            <div className="summary-info">
              <span className="summary-label">Active Loans</span>
              <span className="summary-value">{borrowSummary.active}</span>
            </div>
          </div>
          <div className="summary-card glass-panel">
            <AlertCircle className="summary-icon red" size={20} />
            <div className="summary-info">
              <span className="summary-label">Overdue</span>
              <span className="summary-value" style={{ color: '#ef4444' }}>{borrowSummary.overdue}</span>
            </div>
          </div>
          <div className="summary-card glass-panel">
            <CheckCircle className="summary-icon green" size={20} />
            <div className="summary-info">
              <span className="summary-label">Returned</span>
              <span className="summary-value">{borrowSummary.returned}</span>
            </div>
          </div>
        </div>
      )}

      <div className="loans-tabs">
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
        <button className={`tab-btn ${activeTab === 'Active' ? 'active' : ''}`} onClick={() => setActiveTab('Active')}>Active</button>
        <button className={`tab-btn ${activeTab === 'Returned' ? 'active' : ''}`} onClick={() => setActiveTab('Returned')}>Returned</button>
        {!isUser && (
          <>
            <button className={`tab-btn ${activeTab === 'overdue' ? 'active' : ''}`} onClick={() => setActiveTab('overdue')}>Overdue</button>
            <button className={`tab-btn ${activeTab === 'ReturnedLate' ? 'active' : ''}`} onClick={() => setActiveTab('ReturnedLate')}>Late Returns</button>
            <button className={`tab-btn ${activeTab === 'soon' ? 'active' : ''}`} onClick={() => setActiveTab('soon')}>Due Soon</button>
          </>
        )}
      </div>

      {isInitialLoading ? (
        <PageLoader message="Loading loans data..." />
      ) : (
        <>
          <div className="loans-table-container glass-panel paginated-list-container">
            <table className="loans-table">
              <thead>
                <tr>
                  <th>Book</th>
                  {!isUser && <th>Member</th>}
                  <th>{activeTab === 'overdue' ? 'Days Late' : activeTab === 'soon' ? 'Days Remaining' : 'Due Date'}</th>
                  <th>Status</th>
                  {isUser && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {isTabLoading ? (
                  <tr>
                    <td colSpan={isUser ? 4 : 5} style={{ textAlign: 'center', padding: '4rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                        <Loader2 className="spinner" size={32} style={{ color: 'var(--accent-blue)' }} />
                        <span>Loading loans...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length > 0 ? filteredData.map((loan: any) => {
                  const bookId = loan.bookId;
                  const bookTitle = loan.bookTitle || books.find(b => b.id === bookId)?.title || 'Unknown Book';
                  const memberName = loan.firstName ? `${loan.firstName} ${loan.lastName}` : members.find(m => m.id === loan.userId || m.id === loan.memberId)?.name || 'Unknown User';

                  const status = loan.status || (activeTab === 'overdue' ? 'Overdue' : 'Active');

                  return (
                    <tr key={loan.borrowId || loan.id} className={(status === 'Returned' || status === 'ReturnedLate') ? 'row-dimmed' : ''}>
                      <td>
                        <div className="table-cell-book">
                          <span className="table-book-title">{bookTitle}</span>
                        </div>
                      </td>
                      {!isUser && (
                        <td>
                          <Link
                            to={`/members/${loan.memberId || loan.userId}`}
                            className="table-member-name text-accent"
                            style={{ textDecoration: 'none', fontWeight: 500 }}
                          >
                            {memberName}
                          </Link>
                        </td>
                      )}
                      <td>
                        {activeTab === 'overdue' ? (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>{loan.daysLate} days late</span>
                        ) : activeTab === 'soon' ? (
                          <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{loan.daysRemaining} days remaining</span>
                        ) : (
                          loan.dueDate ? loan.dueDate.split('T')[0] : '—'
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${status.toLowerCase()}`}>
                          {status === 'Active' && <Clock size={14} />}
                          {(status === 'Returned' || status === 'ReturnedLate') && <CheckCircle size={14} />}
                          {status === 'Overdue' && <AlertCircle size={14} />}
                          {status}
                        </span>
                      </td>
                      {isUser && (
                        <td>
                          {(status !== 'Returned' && status !== 'ReturnedLate') ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-outline btn-sm" onClick={() => handleUserRequest('Return', bookId, loan.borrowId)}>Return</button>
                              <button className="btn btn-primary btn-sm" onClick={() => handleUserRequest('Renew', bookId, loan.borrowId)}>Renew</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handleRateBookClick(bookId)}
                              >
                                Rate Book
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No loans found for this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {!isInitialLoading && (filteredData.length > 0 || currentPage > 1) && (
              <Pagination
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                hasNextPage={filteredData.length === pageSize}
                isLoading={isInitialLoading || isTabLoading}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
