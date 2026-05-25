import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, Circle, BookOpen, Phone, MapPin, AtSign, Edit, Key, UserMinus, UserCheck, Loader2 } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import type { Member } from '../context/LibraryContext';
import Pagination from '../components/Pagination';
import PageLoader from '../components/PageLoader';
import './MemberProfile.css';

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchMemberById, fetchMemberHistory, updateMember, showToast } = useLibrary();
  const [member, setMember] = useState<Member | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when member ID changes
  useEffect(() => {
    setCurrentPage(1);
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const isInitial = !member || member.id !== Number(id);
        if (isInitial) {
          setLoading(true);
        } else {
          setHistoryLoading(true);
        }
        
        const [memberData, historyData] = await Promise.all([
          fetchMemberById(Number(id)),
          fetchMemberHistory(Number(id), currentPage, pageSize)
        ]);
        
        setMember(memberData);
        setHistory(historyData);
        
        if (isInitial) {
          setLoading(false);
        } else {
          setHistoryLoading(false);
        }
      }
    };
    loadData();
  }, [id, fetchMemberById, fetchMemberHistory, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="glass-panel" style={{ padding: '3rem 2rem', display: 'flex', justifyContent: 'center' }}>
          <PageLoader message="Loading profile..." />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="page-content">
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Member not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/members')} style={{ marginTop: '1rem' }}>
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  const handleToggleStatus = async () => {
    if (!member) return;
    const newIsActive = member.status === 'Inactive';
    
    await updateMember(member.id, {
      username: member.username,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      city: member.city,
      phoneNumber: member.phoneNumber,
      isActive: newIsActive,
      avatar: member.avatar
    } as any);
    
    const updated = await fetchMemberById(member.id);
    setMember(updated);
  };

  const handleComingSoon = () => {
    showToast("This feature will be available in a future update.", "info");
  };

  // Real history is now loaded directly from backend

  return (
    <div className="member-profile page-content">
      <div className="profile-header-actions">
        <Link to="/members" className="btn btn-outline back-btn">
          <ArrowLeft size={18} />
          Back to Members
        </Link>
      </div>

      <div className="profile-hero glass-panel" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          
          <div className="icon-btn-wrapper">
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }} 
              onClick={handleComingSoon}
            >
              <Edit size={16} />
            </button>
            <span className="tooltip-text">Edit Profile</span>
          </div>

          <div className="icon-btn-wrapper">
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }} 
              onClick={handleComingSoon}
            >
              <Key size={16} />
            </button>
            <span className="tooltip-text">Reset Password</span>
          </div>

          <div className="icon-btn-wrapper">
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', color: member.status === 'Active' ? '#ef4444' : '#10b981', borderColor: member.status === 'Active' ? '#ef4444' : '#10b981' }}
              onClick={handleToggleStatus}
            >
              {member.status === 'Active' ? <UserMinus size={16} /> : <UserCheck size={16} />}
            </button>
            <span className="tooltip-text">{member.status === 'Active' ? 'Suspend Account' : 'Activate Account'}</span>
          </div>

        </div>
        <img src={member.avatar} alt={member.name} className="profile-avatar-large" />
        <div className="profile-details">
          <div className="profile-title-row">
            <div>
              <h1 className="profile-name">{member.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <AtSign size={14} /> {member.username}
              </div>
            </div>
            <div className="member-status-badge">
              <Circle size={10} className={member.status === 'Active' ? 'active-dot' : 'inactive-dot'} fill="currentColor" />
              <span className={member.status === 'Active' ? 'active-text' : 'inactive-text'}>{member.status}</span>
            </div>
          </div>

          <div className="profile-meta" style={{marginTop: '1.5rem'}}>
            <div className="member-detail">
              <Mail size={16} className="detail-icon" />
              <span>{member.email}</span>
            </div>
            <div className="member-detail">
              <Phone size={16} className="detail-icon" />
              <span>{member.phoneNumber}</span>
            </div>
            <div className="member-detail">
              <MapPin size={16} className="detail-icon" />
              <span>{member.city}</span>
            </div>
            <div className="member-detail">
              <Calendar size={16} className="detail-icon" />
              <span>Member since {member.joinDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="glass-card profile-section" style={{ gridColumn: '1 / -1' }}>
          <div className="section-header">
            <BookOpen size={20} className="section-icon" />
            <h2>Borrowing History</h2>
          </div>
          
          {history.length === 0 && !historyLoading ? (
            <div className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>
              No borrowing history found for this user.
            </div>
          ) : (
            <div className="table-responsive paginated-list-container">
              <table className="loans-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Book Title</th>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Borrowed At</th>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Due / Returned</th>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '4rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                          <Loader2 className="spinner" size={32} style={{ color: 'var(--accent-blue)' }} />
                          <span>Loading history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    history.map((loan, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{loan.bookTitle}</td>
                        <td style={{ padding: '0.75rem' }}>{new Date(loan.borrowedAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem' }}>
                          {loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString() : (loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '—')}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`status-badge status-${loan.status?.toLowerCase()}`}>
                            {loan.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: loan.fineAmount > 0 ? '#ef4444' : 'inherit' }}>
                          {loan.fineAmount > 0 ? `₹${loan.fineAmount}` : 'None'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {(history.length > 0 || currentPage > 1) && (
                <Pagination 
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  hasNextPage={history.length === pageSize}
                  isLoading={historyLoading}
                  pageSize={pageSize}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
