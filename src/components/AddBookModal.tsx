import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import './AddBookModal.css';

export default function AddBookModal() {
  const { isAddModalOpen, setAddModalOpen, addBook } = useLibrary();
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [cover, setCover] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [copies, setCopies] = useState(1);
  const [status, setStatus] = useState<'Available' | 'On Loan'>('Available');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');

  // Define unified suggestion type
  interface BookSuggestion {
    id: string;
    source: 'google' | 'openlibrary';
    title: string;
    author: string;
    isbn: string;
    genre: string;
    year: number;
    cover: string;       // Large image for form cover
    thumbnail: string;   // Medium image for suggestion dropdown item
  }

  // Suggestions state
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fallback to Open Library search if Google Books is blocked/rate-limited
  const fetchOpenLibrary = async (query: string): Promise<BookSuggestion[]> => {
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=title:${encodeURIComponent(query)}&limit=5&fields=title,author_name,isbn,first_publish_year,subject,cover_i,cover_edition_key,key`);
      const data = await response.json();
      if (data.docs) {
        return data.docs.map((doc: any) => {
          const coverLarge = doc.cover_i 
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` 
            : (doc.cover_edition_key ? `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-L.jpg` : '');
          
          const coverMedium = doc.cover_i 
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` 
            : (doc.cover_edition_key ? `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-M.jpg` : '');
          
          return {
            id: doc.key || Math.random().toString(),
            source: 'openlibrary',
            title: doc.title,
            author: doc.author_name?.join(', ') || '',
            isbn: doc.isbn?.[0] || '',
            genre: doc.subject?.slice(0, 3).join(', ') || '',
            year: doc.first_publish_year || new Date().getFullYear(),
            cover: coverLarge,
            thumbnail: coverMedium
          };
        });
      }
    } catch (err) {
      console.error("Error fetching from Open Library:", err);
    }
    return [];
  };

  // Debounced effect to fetch suggestions
  useEffect(() => {
    if (!showSuggestions || !title.trim() || title.length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const olResults = await fetchOpenLibrary(title);
        setSuggestions(olResults);
      } catch (error) {
        console.error("Error fetching book suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [title, showSuggestions]);

  const handleSelectSuggestion = async (suggestion: BookSuggestion) => {
    setTitle(suggestion.title);
    setAuthor(suggestion.author);
    setIsbn(suggestion.isbn);
    setGenre(suggestion.genre);
    setYear(suggestion.year);
    setCover(suggestion.cover);
    
    setSuggestions([]);
    setShowSuggestions(false);

    // Fetch full description in the background from Open Library Works API
    if (suggestion.id.startsWith('/works/')) {
      try {
        const response = await fetch(`https://openlibrary.org${suggestion.id}.json`);
        const data = await response.json();
        
        let descriptionText = '';
        if (typeof data.description === 'string') {
          descriptionText = data.description;
        } else if (data.description && typeof data.description === 'object' && data.description.value) {
          descriptionText = data.description.value;
        }
        
        setDescription(descriptionText.trim());
      } catch (error) {
        console.error("Error fetching work description:", error);
      }
    }
  };

  if (!isAddModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let uploadedUrl = cover;
    if (imageFile) {
        try {
            uploadedUrl = await uploadToCloudinary(imageFile);
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Image upload failed. Please try again.");
            setIsUploading(false);
            return;
        }
    }

    await addBook({
      title,
      author,
      cover: uploadedUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300&h=450',
      rating: 0,
      status,
      isbn,
      genre,
      description,
      publishedYear: year,
      totalCopies: copies
    });
    
    setTitle('');
    setAuthor('');
    setCover('');
    setImageFile(null);
    setIsbn('');
    setGenre('');
    setDescription('');
    setYear(new Date().getFullYear());
    setCopies(1);
    setStatus('Available');
    setIsUploading(false);
    setAddModalOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>Add New Book</h2>
          <button className="close-btn" onClick={() => setAddModalOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="form-row">
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Title</label>
              <input 
                type="text" 
                className="input-glass" 
                value={title} 
                onChange={e => {
                  setTitle(e.target.value);
                  setShowSuggestions(true);
                }} 
                onBlur={() => {
                  // Let the click on suggestions execute before closing
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                required 
                placeholder="e.g. The Hobbit"
                autoComplete="off"
              />
              
              {showSuggestions && (suggestions.length > 0 || isSearching) && (
                <ul className="suggestions-list">
                  {isSearching ? (
                    <li className="loading-suggestions">
                      <Loader2 className="spinner" size={16} /> Searching suggestions...
                    </li>
                  ) : (
                    suggestions.map((suggestion) => {
                      return (
                        <li 
                          key={suggestion.id} 
                          className="suggestion-item" 
                          onClick={() => handleSelectSuggestion(suggestion)}
                        >
                          {suggestion.thumbnail && <img src={suggestion.thumbnail} alt={suggestion.title} className="suggestion-thumb" />}
                          <div className="suggestion-info">
                            <span className="suggestion-title">{suggestion.title}</span>
                            {suggestion.author && (
                              <span className="suggestion-author">{suggestion.author}</span>
                            )}
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
            </div>
            
            <div className="form-group">
              <label>Author</label>
              <input 
                type="text" 
                className="input-glass" 
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                required 
                placeholder="e.g. J.R.R. Tolkien"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ISBN</label>
              <input 
                type="text" 
                className="input-glass" 
                value={isbn} 
                onChange={e => setIsbn(e.target.value)} 
                placeholder="e.g. ENG001"
              />
            </div>
            
            <div className="form-group">
              <label>Genre</label>
              <input 
                type="text" 
                className="input-glass" 
                value={genre} 
                onChange={e => setGenre(e.target.value)} 
                placeholder="e.g. Fantasy"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Published Year</label>
              <input 
                type="number" 
                className="input-glass" 
                value={year} 
                onChange={e => setYear(parseInt(e.target.value))} 
              />
            </div>
            
            <div className="form-group">
              <label>Total Copies</label>
              <input 
                type="number" 
                className="input-glass" 
                value={copies} 
                onChange={e => setCopies(parseInt(e.target.value))} 
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="input-glass" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Enter book description..."
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>
          
          <div className="form-group">
            <label>Cover Image</label>
            <input 
              type="file" 
              accept="image/*"
              className="input-glass" 
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }} 
            />
            <small style={{display: 'block', margin: '0.5rem 0', color: 'var(--text-secondary)'}}>Or enter URL below:</small>
            <input 
              type="url" 
              className="input-glass" 
              value={cover} 
              onChange={e => setCover(e.target.value)} 
              placeholder="https://example.com/cover.jpg"
            />
          </div>
          
          <div className="form-group">
            <label>Initial Status</label>
            <select 
              className="input-glass" 
              value={status} 
              onChange={e => setStatus(e.target.value as 'Available' | 'On Loan')}
            >
              <option value="Available">Available</option>
              <option value="On Loan">On Loan</option>
            </select>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setAddModalOpen(false)} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
