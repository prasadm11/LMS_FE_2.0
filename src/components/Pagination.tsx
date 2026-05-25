import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  isLoading?: boolean;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({ currentPage, onPageChange, hasNextPage, isLoading = false, pageSize, onPageSizeChange }: PaginationProps) {
  return (
    <div className="pagination-container">
      <select 
        className="pagination-select"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        disabled={isLoading}
      >
        <option value={10}>10 / page</option>
        <option value={20}>20 / page</option>
        <option value={50}>50 / page</option>
        <option value={100}>100 / page</option>
      </select>
      <div className="pagination-divider" />
      <button 
        className="btn btn-outline btn-sm pagination-btn" 
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
        Previous
      </button>
      
      <span className="pagination-current">
        Page {currentPage}
      </span>
      
      <button 
        className="btn btn-outline btn-sm pagination-btn" 
        disabled={!hasNextPage || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
