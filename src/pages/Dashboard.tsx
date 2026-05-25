import { useState, useEffect, useRef } from 'react';
import { BookOpen, Users, Clock, TrendingUp, AlertCircle, Calendar, CheckCircle, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useLibrary } from '../context/LibraryContext';
import PageLoader from '../components/PageLoader';
import Pagination from '../components/Pagination';
import './Dashboard.css';

export default function Dashboard() {
  const {
    books, members, loans, requests, currentUser, borrowSummary,
    overdueBooks, dueSoonBooks, fetchDashboardStats,
    userHistory, userEligibility, fetchUserHistory, checkBorrowEligibility,
    payFine
  } = useLibrary();

  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isFirstMount = useRef(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      if (currentUser?.role === 'Admin') {
        await fetchDashboardStats();
      } else if (currentUser?.role === 'User') {
        await Promise.all([fetchUserHistory(1, 10), checkBorrowEligibility()]);
      }
      setIsLoading(false);
    };
    loadDashboardData();
  }, [currentUser, fetchDashboardStats, fetchUserHistory, checkBorrowEligibility]);

  useEffect(() => {
    if (currentUser?.role !== 'User') return;

    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const loadHistory = async () => {
      setIsHistoryLoading(true);
      await fetchUserHistory(currentPage, pageSize);
      setIsHistoryLoading(false);
    };
    loadHistory();
  }, [currentPage, pageSize, fetchUserHistory, currentUser]);

  const handlePayFine = async (borrowId: number) => {
    if (window.confirm('Are you sure you want to pay the fine for this book?')) {
      setIsHistoryLoading(true);
      await payFine(borrowId);
      await Promise.all([
        fetchUserHistory(currentPage, pageSize),
        checkBorrowEligibility()
      ]);
      setIsHistoryLoading(false);
    }
  };

  if (currentUser?.role === 'User') {
    const myLoans = loans.filter(l => l.memberId === currentUser.id);
    const myActiveLoans = myLoans.filter(l => l.status === 'Active' || l.status === 'Overdue');
    const myRequests = requests.filter(r => r.memberId === currentUser.id && r.status === 'Pending');

    return (
      <div className="dashboard page-content">


        {isLoading ? (
          <PageLoader message="Loading dashboard data..." />
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper blue">
                  <BookOpen size={24} className="stat-icon" />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Currently Borrowed</span>
                  <span className="stat-value">{myActiveLoans.length}</span>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper purple">
                  <Clock size={24} className="stat-icon" />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Pending Requests</span>
                  <span className="stat-value">{myRequests.length}</span>
                </div>
              </div>
              {userEligibility && (
                <div className={`stat-card glass-panel ${userEligibility.isEligible ? 'eligible' : 'not-eligible'}`} style={{ borderColor: userEligibility.isEligible ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}>
                  <div className="stat-icon-wrapper" style={{ background: userEligibility.isEligible ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: userEligibility.isEligible ? '#22c55e' : '#ef4444' }}>
                    {userEligibility.isEligible ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Borrowing Status</span>
                    <span className="stat-value" style={{ fontSize: '1.1rem', color: userEligibility.isEligible ? '#22c55e' : '#ef4444' }}>
                      {userEligibility.isEligible ? 'Eligible' : 'Restricted'}
                    </span>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{userEligibility.message}</small>
                  </div>
                </div>
              )}
            </div>

            <div className="dashboard-sections" style={{ marginTop: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} className="text-accent" /> Borrowing History
                </h3>
                {userHistory.length === 0 ? (
                  <p className="text-muted">No borrowing history found.</p>
                ) : (
                  <div className="table-responsive paginated-list-container">
                    <table className="loans-table">
                      <thead>
                        <tr>
                          <th>Book Title</th>
                          <th>Borrowed Date</th>
                          <th>Due Date</th>
                          <th>Return Date</th>
                          <th>Status</th>
                          <th>Fine</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isHistoryLoading ? (
                          <tr>
                            <td colSpan={6} style={{ padding: 0 }}>
                              <PageLoader message="Loading borrowing history..." />
                            </td>
                          </tr>
                        ) : (
                          userHistory.map((item: any) => (
                            <tr key={item.borrowId}>
                              <td style={{ fontWeight: 600 }}>{item.bookTitle}</td>
                              <td>{new Date(item.borrowedAt).toLocaleDateString()}</td>
                              <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                              <td>{item.returnedAt ? new Date(item.returnedAt).toLocaleDateString() : '-'}</td>
                              <td>
                                <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td>
                                {item.fineAmount > 0 ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: item.finePaid ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                      ₹{item.fineAmount} {item.finePaid ? '(Paid)' : ''}
                                    </span>
                                    {!item.finePaid && (
                                      <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handlePayFine(item.borrowId)}
                                      >
                                        Pay
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted">None</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {(userHistory.length > 0 || currentPage > 1) && (
                      <Pagination
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        hasNextPage={userHistory.length === pageSize}
                        isLoading={isLoading || isHistoryLoading}
                        pageSize={pageSize}
                        onPageSizeChange={(size) => {
                          setPageSize(size);
                          setCurrentPage(1);
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Prepare Chart Data
  const borrowDistributionData = borrowSummary ? [
    { name: 'Active', value: borrowSummary.active, color: 'var(--accent-blue)' },
    { name: 'Returned', value: borrowSummary.totalBorrowed - borrowSummary.active - borrowSummary.overdue, color: '#22c55e' },
    { name: 'Overdue', value: borrowSummary.overdue, color: '#ef4444' },
    { name: 'Late', value: borrowSummary.returnedLate, color: '#f59e0b' }
  ] : [];

  const availabilityData = [
    { name: 'Available', value: books.reduce((acc, b) => acc + (b.availableCopies || 0), 0), color: '#22c55e' },
    { name: 'On Loan', value: books.reduce((acc, b) => acc + ((b.totalCopies || 0) - (b.availableCopies || 0)), 0), color: 'var(--accent-blue)' }
  ];

  const activeLoansCount = borrowSummary?.active || 0;
  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;

  return (
    <div className="dashboard page-content">


      {isLoading ? (
        <PageLoader message="Loading dashboard data..." />
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card glass-panel">
              <div className="stat-icon-wrapper blue">
                <BookOpen size={24} className="stat-icon" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Books</span>
                <span className="stat-value">{books.length}</span>
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-icon-wrapper green">
                <Users size={24} className="stat-icon" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Users</span>
                <span className="stat-value">{members.length}</span>
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-icon-wrapper purple">
                <Clock size={24} className="stat-icon" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Active Loans</span>
                <span className="stat-value">{activeLoansCount}</span>
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-icon-wrapper orange" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <TrendingUp size={24} className="stat-icon" />
              </div>
              <div className="stat-info">
                <span className="stat-label">Pending Requests</span>
                <span className="stat-value">{pendingRequestsCount}</span>
              </div>
            </div>
          </div>

          {borrowSummary && (
            <>
              <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
                <div className="stat-card glass-panel" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <div className="stat-info">
                    <span className="stat-label">Overdue Books</span>
                    <span className="stat-value" style={{ color: '#ef4444' }}>{borrowSummary.overdue}</span>
                  </div>
                </div>
                <div className="stat-card glass-panel" style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                  <div className="stat-info">
                    <span className="stat-label">Total Borrowed</span>
                    <span className="stat-value" style={{ color: 'var(--accent-blue)' }}>{borrowSummary.totalBorrowed}</span>
                  </div>
                </div>
                <div className="stat-card glass-panel" style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                  <div className="stat-info">
                    <span className="stat-label">Fines Collected</span>
                    <span className="stat-value" style={{ color: '#22c55e' }}>₹{borrowSummary.totalFineCollected}</span>
                  </div>
                </div>
                <div className="stat-card glass-panel">
                  <div className="stat-info">
                    <span className="stat-label">Returned Late</span>
                    <span className="stat-value" style={{ color: '#f59e0b' }}>{borrowSummary.returnedLate}</span>
                  </div>
                </div>
              </div>

              <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                <div className="chart-card glass-panel" style={{ padding: '2rem', height: '400px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600 }}>
                    <BarChart2 size={20} style={{ color: 'var(--accent-blue)' }} /> Borrowing Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={borrowDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        {borrowDistributionData.map((_entry, index) => (
                          <linearGradient key={`grad-${index}`} id={`colorBar-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={_entry.color} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={_entry.color} stopOpacity={0.2} />
                          </linearGradient>
                        ))}
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ fontSize: '0.9rem', fontWeight: 500 }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {borrowDistributionData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#colorBar-${index})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card glass-panel" style={{ padding: '2rem', height: '400px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                  <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', fontWeight: 600 }}>
                    <PieChartIcon size={20} style={{ color: 'var(--accent-blue)' }} /> Book Availability
                  </h3>
                  <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {books.reduce((acc, b) => acc + (b.totalCopies || 0), 0)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Books</div>
                  </div>
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <defs>
                        {availabilityData.map((_entry, index) => (
                          <linearGradient key={`pie-grad-${index}`} id={`pieGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={_entry.color} stopOpacity={0.9} />
                            <stop offset="95%" stopColor={_entry.color} stopOpacity={0.5} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={availabilityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={75}
                        outerRadius={95}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {availabilityData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#pieGrad-${index})`} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          <div className="dashboard-sections" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            {overdueBooks.length > 0 && (
              <div className="overdue-alerts glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={20} /> Overdue Alerts
                </h3>
                <div className="overdue-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {overdueBooks.slice(0, 5).map((item: any) => (
                    <div key={item.borrowId} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.bookTitle}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Borrowed by: {item.firstName} {item.lastName}</div>
                      </div>
                      <div style={{ color: '#ef4444', fontWeight: 500 }}>
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dueSoonBooks.length > 0 && (
              <div className="due-soon glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--accent-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} /> Returns Due Soon
                </h3>
                <div className="due-soon-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {dueSoonBooks.slice(0, 5).map((item: any) => (
                    <div key={item.borrowId} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.bookTitle}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Member: {item.firstName} {item.lastName}</div>
                      </div>
                      <div style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>
                        Date: {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
