import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import './AddBookModal.css'; // Reusing styles

export default function EditBookModal() {
  const { isEditBookModalOpen, setEditBookModalOpen, selectedBook, updateBook } = useLibrary();
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [copies, setCopies] = useState(1);
  const [cover, setCover] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (selectedBook) {
      setTitle(selectedBook.title);
      setAuthor(selectedBook.author);
      setIsbn(selectedBook.isbn || '');
      setGenre(selectedBook.genre || '');
      setYear(selectedBook.publishedYear || new Date().getFullYear());
      setCopies(selectedBook.totalCopies || 1);
      setCover(selectedBook.cover || selectedBook.imageUrl || '');
      setDescription(selectedBook.description || '');
      setImageFile(null);
    }
  }, [selectedBook]);

  if (!isEditBookModalOpen || !selectedBook) return null;

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

    const copiesDifference = copies - (selectedBook.totalCopies || 0);
    const newAvailableCopies = (selectedBook.availableCopies || 0) + copiesDifference;

    await updateBook(selectedBook.id, {
      title,
      author,
      isbn,
      genre,
      description,
      publishedYear: year,
      totalCopies: copies,
      availableCopies: newAvailableCopies > 0 ? newAvailableCopies : 0,
      cover: uploadedUrl,
      imageUrl: uploadedUrl
    });
    setIsUploading(false);
    setEditBookModalOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>Edit Book</h2>
          <button className="close-btn" onClick={() => setEditBookModalOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                className="input-glass" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Author</label>
              <input 
                type="text" 
                className="input-glass" 
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                required 
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
              />
            </div>
            
            <div className="form-group">
              <label>Genre</label>
              <input 
                type="text" 
                className="input-glass" 
                value={genre} 
                onChange={e => setGenre(e.target.value)} 
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
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setEditBookModalOpen(false)} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
