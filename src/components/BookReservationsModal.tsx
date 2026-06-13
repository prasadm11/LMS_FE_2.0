import { useState, useEffect, useCallback } from 'react';
import { X, BookMarked, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import type { Reservation } from '../context/LibraryContext';
import PageLoader from './PageLoader';
import Pagination from './Pagination';
import './BookReservationsModal.css';

interface BookReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: number;
  bookTitle: string;
}

export default function BookReservationsModal({ isOpen, onClose, bookId, bookTitle }: BookReservationsModalProps) {
  const { getBookReservations } = useLibrary();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    const data = await getBookReservations(bookId, currentPage, pageSize);
    if (data && data.data) {
      setReservations(data.data);
    }
    setIsLoading(false);
  }, [bookId, getBookReservations, currentPage, pageSize]);

  useEffect(() => {
    if (isOpen) {
      fetchReservations();
    }
  }, [isOpen, fetchReservations]);

  if (!isOpen) return null;

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

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel reservations-modal">
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BookMarked size={20} /> Reservations for "{bookTitle}"
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="reservations-list-container">
          <div className="paginated-list-container" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '2rem' }}>
                <PageLoader message="Loading reservations..." />
              </div>
            ) : reservations.length === 0 ? (
              <div className="reservations-empty" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>No reservations found for this book.</p>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                {reservations.map((res) => (
                  <div key={res.reservationId} className="reservation-item">
                    <img
                      src={res.profileImageUrl || `https://i.pravatar.cc/150?u=${res.userId}`}
                      alt={res.userName}
                      className="reservation-user-avatar"
                    />
                    <div className="reservation-user-info">
                      <div className="reservation-user-name">{res.userName || 'Unknown User'}</div>
                      <div className="reservation-date">Reserved: {new Date(res.reservedAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      {getStatusBadge(res)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(reservations.length > 0 || currentPage > 1) && (
              <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
