import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';
import './AddBookModal.css'; // Reusing the same modal CSS

export default function AddMemberModal() {
  const { isAddMemberModalOpen, setAddMemberModalOpen, addMember } = useLibrary();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isAddMemberModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let uploadedUrl = avatarUrl;
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

    await addMember({
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      username,
      email,
      city,
      phoneNumber: phone,
      avatar: uploadedUrl || `https://i.pravatar.cc/150?u=${Date.now()}`,
      status,
      joinDate: new Date().toISOString().split('T')[0]
    });

    setFirstName('');
    setLastName('');
    setUsername('');
    setEmail('');
    setCity('');
    setPhone('');
    setStatus('Active');
    setAvatarUrl('');
    setImageFile(null);
    setIsUploading(false);
    setAddMemberModalOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>Add New Member</h2>
          <button className="close-btn" onClick={() => setAddMemberModalOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-book-form">
          <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" className="input-glass" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" className="input-glass" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" className="input-glass" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="input-glass" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>City</label>
              <input type="text" className="input-glass" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" className="input-glass" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              className="input-glass"
              value={status}
              onChange={e => setStatus(e.target.value as 'Active' | 'Inactive')}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group">
            <label>Profile Image</label>
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
              value={avatarUrl} 
              onChange={e => setAvatarUrl(e.target.value)} 
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setAddMemberModalOpen(false)} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
