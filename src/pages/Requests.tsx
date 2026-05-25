import { useState, useEffect } from 'react';
import { Check, X, Clock, RefreshCw, BookUp, CornerDownLeft, AlertCircle } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import PageLoader from '../components/PageLoader';
import Pagination from '../components/Pagination';
import './Requests.css';

export default function Requests() {
  const { requests, books, members, loans, approveRequest, rejectRequest, fetchRequests, fetchLoans, fetchBooks, fetchMembers } = useLibrary();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchRequests(currentPage, pageSize),
        fetchLoans('all'),
        fetchBooks(),
        fetchMembers()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchRequests, fetchLoans, fetchBooks, fetchMembers, currentPage, pageSize]);

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const pastRequests = requests.filter(r => r.status !== 'Pending');

  return (
    <div className="requests page-content">


      <div className="requests-container paginated-list-container">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <PageLoader message="Loading requests..." />
          </div>
        ) : (
          <>
        <h2>Pending Approvals ({pendingRequests.length})</h2>
        {pendingRequests.length === 0 ? (
          <div className="empty-state glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <Clock size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
            <p>No pending requests at this time.</p>
          </div>
        ) : (
          <div className="requests-grid paginated-list-container">
            {pendingRequests.map(req => {
              // Smart book lookup
              let book = books.find(b => b.id === req.bookId);
              if (!book && req.borrowRecordId) {
                const loan = loans.find(l => l.borrowId === req.borrowRecordId);
                if (loan) {
                  book = books.find(b => b.id === loan.bookId);
                }
              }

              const member = members.find(m => m.id === req.memberId);
              
              return (
                <div key={req.id} className="request-card glass-card">
                  <div className="request-header">
                    <span className={`request-type type-${req.type.toLowerCase()}`}>
                      {req.type === 'Borrow' && <BookUp size={16} />}
                      {req.type === 'Return' && <CornerDownLeft size={16} />}
                      {req.type === 'Renew' && <RefreshCw size={16} />}
                      {req.type}
                    </span>
                    <span className="request-date">{req.date}</span>
                  </div>
                  
                  <div className="request-details">
                    <div className="request-member">
                      <img src={member?.avatar || 'https://i.pravatar.cc/150'} alt={member?.name} />
                      <div>
                        <strong>{member?.name || 'Unknown Member'}</strong>
                        <span>{member?.email || 'No email'}</span>
                      </div>
                    </div>
                    <div className="request-book">
                      {book ? (
                        <>
                          <strong>{book.title}</strong>
                          <span>by {book.author}</span>
                        </>
                      ) : (
                        <div style={{color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <AlertCircle size={14} /> <span>Book not found (ID: {req.bookId || 'N/A'})</span>
                        </div>
                      )}
                    </div>
                    {req.notes && (
                      <div className="request-notes">
                        <small>Note: {req.notes}</small>
                      </div>
                    )}
                  </div>

                  <div className="request-actions">
                    <button className="btn btn-outline request-reject" onClick={() => rejectRequest(req.id)}>
                      <X size={16} /> Reject
                    </button>
                    <button className="btn btn-primary request-approve" onClick={() => approveRequest(req.id)}>
                      <Check size={16} /> Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pastRequests.length > 0 && (
          <>
            <h2 style={{ marginTop: '3rem' }}>Recent History</h2>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <table className="loans-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Member</th>
                    <th>Book</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastRequests.slice(0, 10).map(req => {
                    let book = books.find(b => b.id === req.bookId);
                    if (!book && req.borrowRecordId) {
                      const loan = loans.find(l => l.borrowId === req.borrowRecordId);
                      if (loan) book = books.find(b => b.id === loan.bookId);
                    }
                    const member = members.find(m => m.id === req.memberId);
                    return (
                      <tr key={req.id}>
                        <td><strong>{req.type}</strong></td>
                        <td>{member?.name || 'Unknown'}</td>
                        <td>{book?.title || 'Unknown Book'}</td>
                        <td>{req.date}</td>
                        <td>
                          <span className={`status-badge status-${req.status.toLowerCase()}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
          </>
        )}
      </div>
      {(requests.length > 0 || currentPage > 1) && (
          <Pagination 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            hasNextPage={requests.length === pageSize}
            isLoading={isLoading}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
    </div>
  );
}
