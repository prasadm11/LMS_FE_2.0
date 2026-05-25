import { BookUp, Clock, Edit, Trash2, BookMarked, List } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext';
import PageLoader from '../components/PageLoader';
import Pagination from '../components/Pagination';
import BookReservationsModal from '../components/BookReservationsModal';
import './Catalog.css';

export default function Catalog() {
  const {
    books, currentUser, createRequest, deleteBook,
    fetchBookById, setSelectedBook, setEditBookModalOpen,
    setBookReviewsModalOpen, setLoginModalOpen,
    fetchBooks, loading, createReservation
  } = useLibrary();

  const [isReservationsModalOpen, setIsReservationsModalOpen] = useState(false);
  const [reservationBookId, setReservationBookId] = useState<number>(0);
  const [reservationBookTitle, setReservationBookTitle] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const loadCatalog = async () => {
      setIsLoading(true);
      await fetchBooks(currentPage, pageSize);
      setIsLoading(false);
    };
    loadCatalog();
  }, [fetchBooks, currentPage, pageSize]);



  const handleBorrowRequest = (bookId: number) => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }
    createRequest({
      type: 'Borrow',
      bookId,
      memberId: currentUser.id
    });
  };

  const handleReserve = async (bookId: number) => {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }
    await createReservation(bookId);
  };

  const handleViewReservations = (bookId: number, title: string) => {
    setReservationBookId(bookId);
    setReservationBookTitle(title);
    setIsReservationsModalOpen(true);
  };

  const handleEditBook = async (bookId: number) => {
    const bookData = await fetchBookById(bookId);
    if (bookData) {
      setSelectedBook(bookData);
      setEditBookModalOpen(true);
    }
  };

  const handleDeleteBook = (bookId: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      deleteBook(bookId);
    }
  };

  return (
    <div className="catalog page-content">

      <div className="books-grid paginated-list-container">
        {(isLoading || loading) ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <PageLoader message="Searching catalog..." />
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', opacity: 0.7 }}>
            <BookUp size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No books found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or browse our collection.</p>
          </div>
        ) : (
          books.map(book => (
            <div key={book.id} className="book-card glass-card">
              <div
                className="book-cover-wrapper"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedBook(book);
                  setBookReviewsModalOpen(true);
                }}
              >
                <img src={book.cover} alt={book.title} className="book-cover" />
                <div className={`book-status status-${book.status.toLowerCase().replace(' ', '-')}`}>
                  {book.status}
                </div>
              </div>

              <div className="book-info">
                <h3
                  className="book-title"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedBook(book);
                    setBookReviewsModalOpen(true);
                  }}
                >
                  {book.title}
                </h3>
                <p className="book-author">{book.author}</p>

                <div className="book-meta" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span>{book.genre || 'General'}</span> • <span>{book.publishedYear || 'N/A'}</span>
                </div>

                <div style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: (book.availableCopies ?? 0) > 0 ? '#22c55e' : '#ef4444', fontWeight: 500 }}>
                    {book.availableCopies ?? 0} of {book.totalCopies ?? 0} available
                  </span>
                </div>

                <div className="book-footer">
                  <div
                    className="book-rating"
                    style={{ cursor: 'pointer', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      setSelectedBook(book);
                      setBookReviewsModalOpen(true);
                    }}
                    title="View Reviews"
                  >
                    <span style={{ color: '#f59e0b' }}>★</span>
                    <span>{book.averageRating?.toFixed(1) || '0.0'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({book.totalRatings || 0})</span>
                  </div>
                  <div className="book-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                    {(!currentUser || currentUser.role === 'User') && book.status === 'Available' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleBorrowRequest(book.id)}>
                        <BookUp size={14} /> Request
                      </button>
                    )}

                    {(!currentUser || currentUser.role === 'User') && (book.status === 'On Loan' || (book.availableCopies ?? 0) === 0) && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleReserve(book.id)}>
                        <BookMarked size={14} /> Reserve
                      </button>
                    )}

                    {currentUser?.role === 'Admin' && (
                      <>
                        <button
                          className="btn btn-outline btn-sm"
                          title="View Reservations"
                          style={{ padding: '0.4rem', color: '#3b82f6' }}
                          onClick={() => handleViewReservations(book.id, book.title)}
                        >
                          <List size={14} />
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          title="Edit Book"
                          style={{ padding: '0.4rem' }}
                          onClick={() => handleEditBook(book.id)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          title="Delete Book"
                          style={{ padding: '0.4rem', color: '#ef4444' }}
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}

                    {book.status === 'Pending Approval' && currentUser?.role === 'User' && (
                      <span className="text-muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )))}
      </div>

      {(books.length > 0 || currentPage > 1) && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          hasNextPage={books.length === pageSize}
          isLoading={isLoading || loading}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}

      <BookReservationsModal 
        isOpen={isReservationsModalOpen} 
        onClose={() => setIsReservationsModalOpen(false)} 
        bookId={reservationBookId} 
        bookTitle={reservationBookTitle} 
      />
    </div>
  );
}
