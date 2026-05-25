import { useState, useEffect, useCallback } from 'react';
import { Bookmark, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import type { Reservation } from '../context/LibraryContext';
import PageLoader from '../components/PageLoader';
import Pagination from '../components/Pagination';
import './Reservations.css';

export default function Reservations() {
  const { currentUser, getUserReservations, cancelReservation } = useLibrary();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'fulfilled' | 'cancelled'>('all');

  const fetchReservations = useCallback(async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    const data = await getUserReservations(currentUser.id, currentPage, pageSize);
    if (data && data.data) {
      setReservations(data.data);
    }
    setIsLoading(false);
  }, [currentUser, getUserReservations, currentPage, pageSize]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleCancel = async (reservationId: number) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      await cancelReservation(reservationId);
      fetchReservations();
    }
  };

  if (!currentUser) {
    return <div className="page-content"><p>Please log in to view your reservations.</p></div>;
  }

  const getStatusBadge = (res: Reservation) => {
    const isCancelled = res.isCancelled;
    const isFulfilled = res.isFulfilled;
    const isExpired = !isCancelled && !isFulfilled && res.expiryDate && new Date() > new Date(res.expiryDate);

    if (isFulfilled) {
      return (
        <span className="status-badge status-fulfilled">
          <CheckCircle size={14} /> Fulfilled
        </span>
      );
    }
    if (isCancelled) {
      return (
        <span className="status-badge status-cancelled">
          <AlertCircle size={14} /> Cancelled
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="status-badge status-expired">
          <Clock size={14} /> Expired
        </span>
      );
    }
    return (
      <span className="status-badge status-active">
        <Clock size={14} /> Active
      </span>
    );
  };

  const getFilteredReservations = () => {
    if (activeTab === 'all') return reservations;
    return reservations.filter(res => {
      const isExpired = !res.isCancelled && !res.isFulfilled && res.expiryDate && new Date() > new Date(res.expiryDate);
      if (activeTab === 'cancelled') return res.isCancelled;
      if (activeTab === 'fulfilled') return res.isFulfilled;
      if (activeTab === 'active') return !res.isCancelled && !res.isFulfilled && !isExpired;
      return true;
    });
  };

  const isCancelable = (res: Reservation) => {
    const isExpired = !res.isCancelled && !res.isFulfilled && res.expiryDate && new Date() > new Date(res.expiryDate);
    return !res.isCancelled && !res.isFulfilled && !isExpired;
  };

  const filteredReservations = getFilteredReservations();

  return (
    <div className="reservations-page page-content">


      <div className="loans-tabs" style={{ marginBottom: '2rem' }}>
        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
        <button className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Active</button>
        <button className={`tab-btn ${activeTab === 'fulfilled' ? 'active' : ''}`} onClick={() => setActiveTab('fulfilled')}>Fulfilled</button>
        <button className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>Cancelled</button>
      </div>

      <div className="reservations-grid paginated-list-container">
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <PageLoader message="Loading reservations..." />
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="empty-state glass-card" style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', opacity: 0.7 }}>
            <Bookmark size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No reservations found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You don't have any book reservations at the moment.</p>
          </div>
        ) : (
          filteredReservations.map((res) => {
            const coverUrl = res.bookImageUrl || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=450';
            return (
              <div key={res.reservationId} className="reservation-card glass-card">
                <div className="res-cover-container">
                  <img src={coverUrl} alt={res.bookTitle} className="res-cover" />
                </div>
                <div className="res-details">
                  <h3 className="res-title">{res.bookTitle || 'Unknown Book'}</h3>
                  
                  <div className="res-dates">
                    <div className="res-date-row">
                      <span className="res-date-label">Reserved:</span>
                      <span className="res-date-val">{new Date(res.reservedAt).toLocaleDateString()}</span>
                    </div>
                    {res.expiryDate && (
                      <div className="res-date-row">
                        <span className="res-date-label">Expires:</span>
                        <span className="res-date-val">{new Date(res.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="res-footer flex-between">
                    {getStatusBadge(res)}
                    
                    {isCancelable(res) && (
                      <button 
                        className="btn btn-outline btn-sm btn-cancel" 
                        onClick={() => handleCancel(res.reservationId)}
                        style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      >
                        <Trash2 size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {(isLoading || reservations.length > 0 || currentPage > 1) && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          hasNextPage={reservations.length === pageSize}
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
