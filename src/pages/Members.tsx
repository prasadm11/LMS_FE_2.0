import { Mail, Calendar, Circle, Trash2, Phone, MapPin, AtSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext';
import PageLoader from '../components/PageLoader';
import Pagination from '../components/Pagination';
import './Members.css';

export default function Members() {
  const { members, deleteMember, fetchMembers } = useLibrary();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      await fetchMembers(currentPage, pageSize);
      setIsLoading(false);
    };
    loadMembers();
  }, [fetchMembers, currentPage, pageSize]);

  const handleDeleteMember = (memberId: number) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      deleteMember(memberId);
    }
  };

  return (
    <div className="members page-content">


      <div className="member-grid paginated-list-container">
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <PageLoader message="Loading members..." />
          </div>
        ) : members.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            No members found.
          </div>
        ) : members.map(member => (
          <div key={member.id} className="member-card glass-card">
            <div className="member-header">
              <img src={member.avatar} alt={member.name} className="member-avatar" />
              <div className="member-status-badge">
                <Circle size={10} className={member.status === 'Active' ? 'active-dot' : 'inactive-dot'} fill="currentColor" />
                <span className={member.status === 'Active' ? 'active-text' : 'inactive-text'}>{member.status}</span>
              </div>
            </div>

            <div className="member-info">
              <h3 className="member-name">{member.name}</h3>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '-0.25rem', marginBottom: '0.75rem'}}>
                <AtSign size={12} style={{display: 'inline', verticalAlign: 'middle'}} /> {member.username}
              </p>

              <div className="member-detail">
                <Mail size={14} className="detail-icon" />
                <span>{member.email}</span>
              </div>

              <div className="member-detail">
                <Phone size={14} className="detail-icon" />
                <span>{member.phoneNumber}</span>
              </div>

              <div className="member-detail">
                <MapPin size={14} className="detail-icon" />
                <span>{member.city}</span>
              </div>

              <div className="member-detail">
                <Calendar size={14} className="detail-icon" />
                <span>Joined {member.joinDate}</span>
              </div>
            </div>

            <div className="member-actions">
              <Link to={`/members/${member.id}`} className="btn btn-view-profile">
                View Profile
              </Link>
              <button
                className="btn btn-delete-member"
                onClick={() => handleDeleteMember(member.id)}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {(members.length > 0 || currentPage > 1) && (
        <Pagination 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          hasNextPage={members.length === pageSize}
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
