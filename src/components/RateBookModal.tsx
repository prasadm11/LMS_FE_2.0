import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import './RateBookModal.css';

export default function RateBookModal() {
  const { 
    isRateBookModalOpen, 
    setRateBookModalOpen, 
    selectedBook, 
    rateBook,
    setSelectedBook
  } = useLibrary();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isRateBookModalOpen || !selectedBook) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmitting(true);
    await rateBook(selectedBook.id, rating, review);
    setIsSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setRateBookModalOpen(false);
    setSelectedBook(null);
    setRating(0);
    setHoverRating(0);
    setReview('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel add-book-modal rate-book-modal">
        <div className="modal-header">
          <div>
            <h2>Rate & Review</h2>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Share your thoughts on "{selectedBook.title}"</p>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group rating-group">
            <label>Your Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star size={32} fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="review">Your Review (Optional)</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think of the book?"
              rows={4}
              className="input-glass"
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={handleClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
