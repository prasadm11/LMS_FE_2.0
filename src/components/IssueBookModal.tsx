import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import './AddBookModal.css';

export default function IssueBookModal() {
  const { isIssueModalOpen, setIssueModalOpen, issueBook, books, members, settings } = useLibrary();
  
  const [bookId, setBookId] = useState('');
  const [memberId, setMemberId] = useState('');

  if (!isIssueModalOpen) return null;

  // Filter only available books and active members
  const availableBooks = books.filter(b => b.status === 'Available');
  const activeMembers = members.filter(m => m.status === 'Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId || !memberId) return;

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + settings.defaultLoanPeriod);

    issueBook({
      bookId: Number(bookId),
      memberId: Number(memberId),
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Active'
    });
    
    setBookId('');
    setMemberId('');
    setIssueModalOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>Issue Book</h2>
          <button className="close-btn" onClick={() => setIssueModalOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="form-group">
            <label>Select Member</label>
            <select 
              className="input-glass" 
              value={memberId} 
              onChange={e => setMemberId(e.target.value)}
              required
            >
              <option value="">-- Choose a member --</option>
              {activeMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Select Book</label>
            <select 
              className="input-glass" 
              value={bookId} 
              onChange={e => setBookId(e.target.value)}
              required
            >
              <option value="">-- Choose a book --</option>
              {availableBooks.map(b => (
                <option key={b.id} value={b.id}>{b.title} by {b.author}</option>
              ))}
            </select>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setIssueModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!bookId || !memberId}>
              Issue Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
