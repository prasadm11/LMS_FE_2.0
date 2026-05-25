import { useEffect, useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import Pagination from './Pagination';
import PageLoader from './PageLoader';
import './BookReviewsModal.css';

export default function BookReviewsModal() {
  const {
    isBookReviewsModalOpen,
    setBookReviewsModalOpen,
    selectedBook,
    getBookRatings,
    setSelectedBook
  } = useLibrary();

  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastBookId, setLastBookId] = useState<number | null>(null);

  useEffect(() => {
    if (!isBookReviewsModalOpen || !selectedBook) return;

    if (selectedBook.id !== lastBookId) {
      setLastBookId(selectedBook.id);
      setCurrentPage(1);
      setReviews([]);
      return;
    }

    const fetchReviews = async () => {
      setIsLoading(true);
      const data = await getBookRatings(selectedBook.id, currentPage, pageSize);
      setReviews(data);
      setIsLoading(false);
    };
    fetchReviews();
  }, [isBookReviewsModalOpen, selectedBook, currentPage, pageSize, lastBookId, getBookRatings]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  if (!isBookReviewsModalOpen || !selectedBook) return null;

  const handleClose = () => {
    setBookReviewsModalOpen(false);
    setSelectedBook(null);
    setReviews([]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel reviews-modal">
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>Book Details</h2>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-split">
          {/* Left Column: Book Details */}
          <div className="book-details-col">
            <div className="book-details-header">
              <img src={selectedBook.cover} alt={selectedBook.title} className="details-cover" />
              <div className="details-info">
                <h3 className="details-title">{selectedBook.title}</h3>
                <p className="details-author">by {selectedBook.author}</p>
                <div className="details-meta">
                  <span className="meta-badge">{selectedBook.genre || 'General'}</span>
                  <span className="meta-badge">{selectedBook.publishedYear || 'N/A'}</span>
                </div>
                <div className="details-status" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                  <span style={{ color: (selectedBook.availableCopies ?? 0) > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                    {selectedBook.availableCopies ?? 0} of {selectedBook.totalCopies ?? 0} copies available
                  </span>
                </div>
              </div>
            </div>

            <div className="details-description">
              <h4>About this book</h4>
              <p>{selectedBook.description || 'No description available for this book.'}</p>
            </div>
          </div>

          {/* Right Column: Ratings & Reviews */}
          <div className="reviews-col">
            <div className="reviews-header-block">
              <h3>Ratings & Reviews</h3>
              <div className="book-overall-rating" style={{ margin: 0 }}>
                <span className="rating-score" style={{ fontSize: '1.1rem' }}>★ {selectedBook.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="rating-count" style={{ fontSize: '0.85rem' }}>({selectedBook.totalRatings || 0} reviews)</span>
              </div>
            </div>

            <div className="reviews-list-container">
              {isLoading ? (
                <PageLoader message="Loading reviews..." />
              ) : reviews.length === 0 ? (
                <div className="empty-reviews">
                  <MessageSquare size={32} className="text-muted" />
                  <p>No reviews yet. Be the first to review this book!</p>
                </div>
              ) : (
                <div className="reviews-scroll-list">
                  {reviews.map((review, index) => (
                    <div key={index} className="review-card glass-card">
                      <div className="review-header flex-between">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar" style={{ overflow: 'hidden' }}>
                            {review.userProfileImageUrl ? (
                              <img
                                src={review.userProfileImageUrl}
                                alt={review.username || 'User'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              review.username?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <h4 className="reviewer-name">{review.username || 'Anonymous User'}</h4>
                            <div className="review-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="review-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < review.rating ? '#f59e0b' : 'none'}
                              color={i < review.rating ? '#f59e0b' : 'var(--text-muted)'}
                            />
                          ))}
                        </div>
                      </div>
                      {review.review && (
                        <div className="review-content">
                          <p>{review.review}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && reviews.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <Pagination
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    hasNextPage={reviews.length === pageSize}
                    isLoading={isLoading}
                    pageSize={pageSize}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
