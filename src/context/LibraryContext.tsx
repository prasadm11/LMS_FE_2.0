import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../api/endpoints';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';

export type Role = 'Admin' | 'User';

export interface AuthUser {
  id: number;
  name: string;
  role: Role;
  avatar: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating?: number;
  averageRating?: number;
  totalRatings?: number;
  status: 'Available' | 'On Loan' | 'Pending Approval';
  isbn?: string;
  genre?: string;
  description?: string;
  publishedYear?: number;
  totalCopies?: number;
  availableCopies?: number;
  imageUrl?: string;
}

export interface Member {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  avatar: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  city?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export interface Loan {
  id: number;
  borrowId?: number;
  bookId: number;
  memberId: number;
  issueDate: string;
  dueDate: string;
  status: 'Active' | 'Returned' | 'Overdue' | 'ReturnedLate';
}

export interface ActivityRequest {
  id: number;
  type: 'Borrow' | 'Return' | 'Renew';
  bookId: number;
  borrowRecordId?: number;
  memberId: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  notes?: string;
}

export interface LibrarySettings {
  libraryName: string;
  defaultLoanPeriod: number;
  lateFeePerDay: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark';
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Reservation {
  reservationId: number;
  userId?: number;
  userName?: string;
  profileImageUrl?: string | null;
  bookId?: number;
  bookTitle?: string;
  bookImageUrl?: string | null;
  reservedAt: string;
  expiryDate?: string;
  isFulfilled: boolean;
  isCancelled: boolean;
}

export interface LibraryContextType {
  currentUser: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoginModalOpen: boolean;
  setLoginModalOpen: (isOpen: boolean) => void;

  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => Promise<void>;
  updateBook: (id: number, book: Partial<Book>) => Promise<void>;
  deleteBook: (id: number) => Promise<void>;
  isAddModalOpen: boolean;
  setAddModalOpen: (isOpen: boolean) => void;

  members: Member[];
  addMember: (member: Omit<Member, 'id'>) => Promise<void>;
  updateMember: (id: number, member: Partial<Member>) => Promise<void>;
  deleteMember: (id: number) => Promise<void>;
  isAddMemberModalOpen: boolean;
  setAddMemberModalOpen: (isOpen: boolean) => void;

  loans: Loan[];
  issueBook: (loan: Omit<Loan, 'id'>) => Promise<void>;
  returnBook: (loanId: number) => Promise<void>;
  renewBook: (borrowId: number) => Promise<void>;
  payFine: (borrowId: number) => Promise<void>;
  isIssueModalOpen: boolean;
  setIssueModalOpen: (isOpen: boolean) => void;

  requests: ActivityRequest[];
  createRequest: (req: Omit<ActivityRequest, 'id' | 'status' | 'date'>) => Promise<void>;
  approveRequest: (reqId: number) => Promise<void>;
  rejectRequest: (reqId: number) => Promise<void>;

  borrowSummary: any;
  overdueBooks: any[];
  dueSoonBooks: any[];

  fetchBooks: (pageNumber?: number, pageSize?: number) => Promise<void>;
  fetchMembers: (pageNumber?: number, pageSize?: number) => Promise<void>;
  fetchMemberById: (id: number) => Promise<Member | null>;
  fetchBookById: (id: number) => Promise<Book | null>;
  fetchLoans: (status?: string, pageNumber?: number, pageSize?: number) => Promise<void>;
  fetchRequests: (pageNumber?: number, pageSize?: number) => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchUserHistory: (pageNumber?: number, pageSize?: number) => Promise<void>;
  fetchMemberHistory: (userId: number, pageNumber?: number, pageSize?: number) => Promise<any[]>;
  checkBorrowEligibility: () => Promise<void>;
  fetchNotifications: (pageNumber?: number, pageSize?: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  searchBooks: (keyword: string, pageNumber?: number, pageSize?: number) => Promise<void>;
  fetchAllData: () => Promise<void>;
  userHistory: any[];
  userEligibility: any;
  showToast: (message: string, type?: ToastType) => void;

  settings: LibrarySettings;
  updateSettings: (newSettings: Partial<LibrarySettings>) => void;
  isEditBookModalOpen: boolean;
  setEditBookModalOpen: (open: boolean) => void;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
  notifications: Notification[];
  loading: boolean;

  rateBook: (bookId: number, rating: number, review: string) => Promise<void>;
  getBookRatings: (bookId: number, pageNumber?: number, pageSize?: number) => Promise<any[]>;
  isRateBookModalOpen: boolean;
  setRateBookModalOpen: (open: boolean) => void;
  isBookReviewsModalOpen: boolean;
  setBookReviewsModalOpen: (open: boolean) => void;
  selectedBorrowRecordId: number | null;
  setSelectedBorrowRecordId: (id: number | null) => void;

  createReservation: (bookId: number) => Promise<void>;
  getUserReservations: (userId: number, pageNumber?: number, pageSize?: number) => Promise<any>;
  getBookReservations: (bookId: number, pageNumber?: number, pageSize?: number) => Promise<any>;
  cancelReservation: (reservationId: number) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const defaultSettings: LibrarySettings = {
  libraryName: 'Libris',
  defaultLoanPeriod: 14,
  lateFeePerDay: 0.50,
  emailNotifications: true,
  pushNotifications: false,
  theme: 'light',
};

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('library_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [requests, setRequests] = useState<ActivityRequest[]>([]);
  const [borrowSummary, setBorrowSummary] = useState<any>(null);
  const [overdueBooks, setOverdueBooks] = useState<any[]>([]);
  const [dueSoonBooks, setDueSoonBooks] = useState<any[]>([]);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [userEligibility, setUserEligibility] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  }, []);

  const [settings, setSettings] = useState<LibrarySettings>(() => {
    const saved = localStorage.getItem('library_settings');
    if (saved) return JSON.parse(saved);
    return defaultSettings;
  });

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [isIssueModalOpen, setIssueModalOpen] = useState(false);
  const [isEditBookModalOpen, setEditBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [isRateBookModalOpen, setRateBookModalOpen] = useState(false);
  const [isBookReviewsModalOpen, setBookReviewsModalOpen] = useState(false);
  const [selectedBorrowRecordId, setSelectedBorrowRecordId] = useState<number | null>(null);

  const fetchBooks = useCallback(async (pageNumber: number = 1, pageSize: number = 10) => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.BOOKS.GET_ALL_BOOKS}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (res.data.isSuccess) {
        const booksData = res.data.data || [];
        const mapped = booksData.map((b: any) => ({
          ...b,
          cover: b.imageUrl || (b.id === 1 ? 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=450' :
            b.id === 5 ? 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300&h=450' :
              `https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=450`),
          rating: b.averageRating || 0,
          averageRating: b.averageRating,
          totalRatings: b.totalRatings,
          status: b.availableCopies > 0 ? 'Available' : 'On Loan'
        }));
        setBooks(mapped);
      } else {
        showToast(res.data.message || "Failed to fetch books", "error");
      }
    } catch (err) { console.error("Fetch books failed", err); }
  }, []);

  const fetchBookById = useCallback(async (id: number) => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.BOOKS.GET_BOOK_BY_ID}${id}`);
      if (res.data.isSuccess) {
        const b = res.data.data;
        if (!b) return null;
        return {
          ...b,
          cover: b.imageUrl || (b.id === 1 ? 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=450' :
            b.id === 5 ? 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300&h=450' :
              `https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=450`),
          rating: b.averageRating || 0,
          averageRating: b.averageRating,
          totalRatings: b.totalRatings,
          status: b.availableCopies > 0 ? 'Available' : 'On Loan'
        } as Book;
      } else {
        showToast(res.data.message || "Failed to fetch book", "error");
        return null;
      }
    } catch (err) {
      console.error("Fetch book by id failed", err);
      return null;
    }
  }, []);

  const fetchMembers = useCallback(async (pageNumber: number = 1, pageSize: number = 10) => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.USER.GET_ALL_USERS}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (res.data.isSuccess) {
        const usersData = res.data.data || [];
        const mapped = usersData.map((u: any) => ({
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Unknown',
          firstName: u.firstName,
          lastName: u.lastName,
          username: u.username,
          email: u.email,
          avatar: u.profileImageUrl || `https://i.pravatar.cc/150?u=${u.id}`,
          status: String(u.isActive).toLowerCase() === 'false' || String(u.isactive).toLowerCase() === 'false' || String(u.IsActive).toLowerCase() === 'false' ? 'Inactive' : 'Active',
          joinDate: new Date().toISOString().split('T')[0],
          city: u.city,
          phoneNumber: u.phoneNumber
        }));
        setMembers(mapped);
      } else {
        showToast(res.data.message || "Failed to fetch members", "error");
      }
    } catch (err) { console.error("Fetch members failed", err); }
  }, []);

  const fetchMemberById = useCallback(async (id: number) => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.USER.GET_USER_BY_ID}/${id}`);
      if (res.data.isSuccess) {
        const u = res.data.data;
        if (!u) return null;
        return {
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Unknown',
          firstName: u.firstName,
          lastName: u.lastName,
          username: u.username,
          email: u.email,
          avatar: u.profileImageUrl || `https://i.pravatar.cc/150?u=${u.id}`,
          status: String(u.isActive).toLowerCase() === 'false' || String(u.isactive).toLowerCase() === 'false' || String(u.IsActive).toLowerCase() === 'false' ? 'Inactive' : 'Active',
          joinDate: new Date().toISOString().split('T')[0],
          city: u.city,
          phoneNumber: u.phoneNumber
        } as Member;
      } else {
        showToast(res.data.message || "Failed to fetch member", "error");
        return null;
      }
    } catch (err) {
      console.error("Fetch member by id failed", err);
      return null;
    }
  }, []);

  const fetchLoans = useCallback(async (status: string = 'Active', pageNumber: number = 1, pageSize: number = 10) => {
    try {
      if (status === 'overdue') {
        const res = await axiosInstance.get(`${API_ENDPOINTS.BORROW.GET_OVERDUE_BOOKS}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        if (res.data.isSuccess) setOverdueBooks(res.data.data || []);
        else showToast(res.data.message || "Failed to fetch overdue books", "error");
        return;
      }

      if (status === 'soon') {
        const res = await axiosInstance.get(`${API_ENDPOINTS.BORROW.GET_DUEBOOK_SOON}?days=3&pageNumber=${pageNumber}&pageSize=${pageSize}`);
        if (res.data.isSuccess) setDueSoonBooks(res.data.data || []);
        else showToast(res.data.message || "Failed to fetch due soon books", "error");
        return;
      }

      if (status === 'all') {
        // Fetching "all" with pagination is complex since it's multiple endpoints in the original code,
        // we'll just fetch a generic combined state if possible, or if not supported, we assume Active for now.
        // For simplicity, we just fetch one status or all unpaginated if really needed, but let's paginate the active one by default.
        const statuses = ['Active', 'Returned', 'Overdue', 'ReturnedLate'];
        const responses = await Promise.all(
          statuses.map(s => axiosInstance.get(`${API_ENDPOINTS.BORROW.GET_BOOK_BY_STATUS}?status=${s}&pageNumber=1&pageSize=50`))
        );
        const allLoans: any[] = [];
        responses.forEach((res, idx) => {
          if (res.data.isSuccess) {
            const loansData = res.data.data || [];
            allLoans.push(...loansData.map((l: any) => ({ ...l, status: statuses[idx] })));
          }
        });
        setLoans(allLoans.map(l => ({
          id: l.borrowId || l.id,
          borrowId: l.borrowId,
          bookId: l.bookId,
          memberId: l.userId,
          issueDate: l.borrowedAt || l.borrowDate,
          dueDate: l.dueDate,
          status: l.status
        })));
        return;
      }

      const res = await axiosInstance.get(`${API_ENDPOINTS.BORROW.GET_BOOK_BY_STATUS}?status=${status}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (res.data.isSuccess) {
        const loansData = res.data.data || [];
        const mapped = loansData.map((l: any) => ({
          id: l.borrowId || l.id,
          borrowId: l.borrowId,
          bookId: l.bookId,
          memberId: l.userId,
          issueDate: l.borrowedAt || l.borrowDate,
          dueDate: l.dueDate,
          status: status
        }));
        setLoans(mapped);
      } else {
        showToast(res.data.message || `Failed to fetch loans for ${status}`, "error");
      }
    } catch (err) { console.error(`Fetch loans for ${status} failed`, err); }
  }, []);

  const fetchRequests = useCallback(async (pageNumber: number = 1, pageSize: number = 10) => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.BORROW_REQUEST.GET_ALL_PENDING}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (res.data.isSuccess) {
        const requestsData = res.data.data || [];
        const mapped = requestsData.map((r: any) => ({
          id: r.id,
          type: r.type || 'Borrow',
          bookId: r.bookId,
          borrowRecordId: r.borrowRecordId,
          memberId: r.userId,
          status: r.status || 'Pending',
          date: r.createdAt ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          notes: r.notes
        }));
        setRequests(mapped);
      } else {
        showToast(res.data.message || "Failed to fetch requests", "error");
      }
    } catch (err) { console.error("Fetch requests failed", err); }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    if (currentUser?.role !== 'Admin') return;
    try {
      const [summary, overdue, soon] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.BORROW.GET_BORROW_SUMMARY),
        axiosInstance.get(`${API_ENDPOINTS.BORROW.GET_OVERDUE_BOOKS}?pageNumber=1&pageSize=5`),
        axiosInstance.get(`${API_ENDPOINTS.BORROW.GET_DUEBOOK_SOON}?days=3&pageNumber=1&pageSize=5`)
      ]);
      if (summary.data.isSuccess) setBorrowSummary(summary.data.data);
      if (overdue.data.isSuccess) setOverdueBooks(overdue.data.data || []);
      if (soon.data.isSuccess) setDueSoonBooks(soon.data.data || []);
    } catch (err) { console.error("Fetch dashboard stats failed", err); }
  }, [currentUser]);

  const fetchUserHistory = useCallback(async (pageNumber: number = 1, pageSize: number = 10) => {
    if (!currentUser || currentUser.role !== 'User') return;
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.BORROW.GET_USER_BORROW_HISTORY}?UserId=${currentUser.id}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (res.data.isSuccess) setUserHistory(res.data.data || []);
      else showToast(res.data.message || "Failed to fetch user history", "error");
    } catch (err) { console.error("Fetch user history failed", err); }
  }, [currentUser]);

  const fetchMemberHistory = useCallback(async (userId: number, pageNumber: number = 1, pageSize: number = 10) => {
    if (currentUser?.role !== 'Admin') return [];
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.BORROW.GET_USER_BORROW_HISTORY}?UserId=${userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (res.data.isSuccess) return res.data.data || [];
      else {
        showToast(res.data.message || "Failed to fetch member history", "error");
        return [];
      }
    } catch (err) {
      console.error("Fetch member history failed", err);
      return [];
    }
  }, [currentUser]);

  const fetchNotifications = useCallback(async (pageNumber: number = 1, pageSize: number = 10) => {
    if (!currentUser) return;
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.NOTIFICATION.GET_BY_USER}?userId=${currentUser.id}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (res.data.isSuccess) {
        // If loading page 1, replace. Otherwise append for "Load More" functionality, though the consumer might handle that if they pass state up. 
        // We'll manage it by either replacing (if caller expects replacement) or letting the consumer handle it.
        // Wait, Header component probably just calls it and reads `notifications` state. If so, "Load More" requires appending.
        if (pageNumber === 1) {
          setNotifications(res.data.data || []);
        } else {
          setNotifications(prev => [...prev, ...(res.data.data || [])]);
        }
      } else {
        showToast(res.data.message || "Failed to fetch notifications", "error");
      }
    } catch (err) { console.error("Fetch notifications failed", err); }
  }, [currentUser]);

  const markAsRead = async (id: number) => {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.NOTIFICATION.MARK_AS_READ}?id=${id}`);
      if (response.data.isSuccess) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      } else {
        showToast(response.data.message || "Failed to mark as read", "error");
      }
    } catch (err) { console.error("Mark as read failed", err); }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.NOTIFICATION.MARK_AS_READ}?userId=${currentUser.id}`);
      if (response.data.isSuccess) {
        showToast(response.data.message || "All notifications marked as read", "success");
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } else {
        showToast(response.data.message || "Failed to mark all as read", "error");
      }
    } catch (err) { console.error("Mark all as read failed", err); }
  };

  const checkBorrowEligibility = useCallback(async () => {
    if (currentUser?.role !== 'User') return;
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.BORROW.CHECK_BORROW_ELIGIBILITY}?UserId=${currentUser.id}`);
      if (res.data.isSuccess) setUserEligibility(res.data.data);
      else showToast(res.data.message || "Failed to check eligibility", "error");
    } catch (err) { console.error("Check eligibility failed", err); }
  }, [currentUser]);

  const searchBooks = useCallback(async (keyword: string, pageNumber: number = 1, pageSize: number = 10) => {
    if (!keyword.trim()) {
      await fetchBooks(pageNumber, pageSize);
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${API_ENDPOINTS.BORROW.SEARCH_BOOKS}?Keyword=${encodeURIComponent(keyword)}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (res.data.isSuccess) {
        const searchData = res.data.data || [];
        const mapped = searchData.map((b: any) => ({
          ...b,
          cover: b.imageUrl || (b.id === 1 ? 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=450' :
            b.id === 5 ? 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300&h=450' :
              `https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=450`),
          rating: 4.5,
          status: b.availableCopies > 0 ? 'Available' : 'On Loan'
        }));
        setBooks(mapped);
      } else {
        showToast(res.data.message || "Failed to search books", "error");
      }
    } catch (err) {
      console.error("Search books failed", err);
    } finally {
      setLoading(false);
    }
  }, [fetchBooks]);

  const fetchAllData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const tasks = [fetchBooks(), fetchLoans('all'), fetchNotifications()];
    if (currentUser.role === 'Admin') {
      tasks.push(fetchMembers(), fetchRequests(), fetchDashboardStats());
    } else {
      tasks.push(fetchUserHistory(), checkBorrowEligibility());
    }
    await Promise.all(tasks);
    setLoading(false);
  }, [currentUser, fetchBooks, fetchLoans, fetchMembers, fetchRequests, fetchDashboardStats, fetchUserHistory, checkBorrowEligibility, fetchNotifications]);

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    } else {
      const loadPublicData = async () => {
        setLoading(true);
        await fetchBooks();
        setLoading(false);
      };
      loadPublicData();
    }
  }, [currentUser, fetchAllData, fetchBooks]);

  useEffect(() => {
    localStorage.setItem('library_settings', JSON.stringify(settings));
    if (currentUser) {
      localStorage.setItem('library_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('library_user');
    }

    if (settings.theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [settings, currentUser]);

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    const { token } = response.data;

    if (token) {
      localStorage.setItem('token', token);
      const decoded: any = jwtDecode(token);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 'User';
      const name = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      const id = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      const profileImageUrl = decoded["ProfileImageUrl"];

      const user: AuthUser = {
        id: id ? Number(id) : 0,
        name: name || email.split('@')[0],
        role: role as Role,
        avatar: profileImageUrl && profileImageUrl.trim() !== ''
          ? profileImageUrl
          : ('https://i.pravatar.cc/150?u=' + (id || email))
      };
      setCurrentUser(user);
    } else {
      throw new Error("No token received from server");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const addBook = async (newBookData: Omit<Book, 'id'>) => {
    try {
      const payload = {
        title: newBookData.title,
        author: newBookData.author,
        isbn: newBookData.isbn || `TEMP-${Date.now()}`,
        genre: newBookData.genre || 'General',
        description: newBookData.description || '',
        publishedYear: newBookData.publishedYear || new Date().getFullYear(),
        totalCopies: newBookData.totalCopies || 1,
        availableCopies: newBookData.totalCopies || 1,
        imageUrl: newBookData.imageUrl || newBookData.cover || null
      };
      const response = await axiosInstance.post(API_ENDPOINTS.BOOKS.ADD_BOOK, payload);
      if (response.data.isSuccess) {
        showToast(response.data.message || "Book added successfully!");
        await fetchBooks();
      } else {
        showToast(response.data.message || "Failed to add book", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to add book", "error");
      console.error("Failed to add book", err);
    }
  };

  const updateBook = async (id: number, bookData: Partial<Book>) => {
    try {
      const payload = { id, ...bookData, imageUrl: bookData.imageUrl || bookData.cover || undefined };
      const response = await axiosInstance.put(`${API_ENDPOINTS.BOOKS.UPDATE_BOOK}`, payload);
      if (response.data.isSuccess) {
        showToast(response.data.message || "Book updated successfully!");
        await fetchBooks();
      } else {
        showToast(response.data.message || "Failed to update book", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update book", "error");
      console.error("Failed to update book", err);
    }
  };

  const deleteBook = async (id: number) => {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINTS.BOOKS.DELETE_BOOK}/${id}`);
      if (response.data.isSuccess) {
        showToast(response.data.message || "Book deleted successfully!");
        await fetchBooks();
      } else {
        showToast(response.data.message || "Failed to delete book", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to delete book", "error");
      console.error("Failed to delete book", err);
    }
  };

  const addMember = async (newMemberData: Omit<Member, 'id'>) => {
    try {
      const payload = {
        username: newMemberData.username || newMemberData.name.replace(/\s+/g, '').toLowerCase() + Date.now().toString().slice(-4),
        email: newMemberData.email,
        password: "DefaultPassword123!",
        firstName: newMemberData.firstName || newMemberData.name.split(' ')[0] || '',
        lastName: newMemberData.lastName || newMemberData.name.split(' ').slice(1).join(' ') || '',
        city: newMemberData.city || "Unknown",
        phoneNumber: newMemberData.phoneNumber || "0000000000",
        role: "User",
        profileImageUrl: newMemberData.profileImageUrl || newMemberData.avatar || null
      };
      const response = await axiosInstance.post(API_ENDPOINTS.USER.CREATE_USER, payload);
      if (response.data.isSuccess) {
        showToast(response.data.message || "Member added successfully!");
        await fetchMembers();
      } else {
        showToast(response.data.message || "Failed to add member", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to add member", "error");
      console.error("Failed to add user", err);
    }
  };

  const updateMember = async (id: number, memberData: Partial<Member>) => {
    try {
      const payload = { id, ...memberData, profileImageUrl: memberData.profileImageUrl || memberData.avatar || undefined };
      const response = await axiosInstance.put(`${API_ENDPOINTS.USER.UPDATE_USER}`, payload);
      if (response.data.isSuccess) {
        showToast(response.data.message || "Member updated successfully!");
        await fetchMembers();
      } else {
        showToast(response.data.message || "Failed to update member", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update member", "error");
      console.error("Failed to update member", err);
    }
  };

  const deleteMember = async (id: number) => {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINTS.USER.DELETE_USER}/${id}`);
      if (response.data.isSuccess) {
        showToast(response.data.message || "Member deleted successfully!");
        await fetchMembers();
      } else {
        showToast(response.data.message || "Failed to delete member", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to delete member", "error");
      console.error("Failed to delete member", err);
    }
  };

  const issueBook = async (newLoanData: Omit<Loan, 'id'>) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.BORROW.BORROW_BOOK, {
        bookId: newLoanData.bookId,
        userId: newLoanData.memberId
      });
      if (response.data.isSuccess) {
        await Promise.all([fetchLoans(), fetchBooks()]);
      } else {
        showToast(response.data.message || "Failed to issue book", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to issue book", "error");
      console.error("Failed to issue book directly", err);
    }
  };

  const returnBook = async (loanId: number) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.BORROW.RETURN_BOOK, { borrowId: loanId });
      if (response.data.isSuccess) {
        showToast(response.data.message || "Book returned successfully!");
        await Promise.all([fetchLoans(), fetchBooks()]);
      } else {
        showToast(response.data.message || "Failed to return book", "error");
      }
    } catch (err: any) {
      console.error("Failed to return book directly", err);
      showToast("Failed to return book", "error");
    }
  };

  const renewBook = async (borrowId: number) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.BORROW.RENEW_BOOK, { borrowId });
      if (response.data.isSuccess) {
        showToast(response.data.message || "Book renewed successfully!");
        await Promise.all([fetchLoans(), fetchBooks()]);
      } else {
        showToast(response.data.message || "Failed to renew book", "error");
      }
    } catch (err: any) {
      console.error("Failed to renew book directly", err);
      showToast("Failed to renew book", "error");
    }
  };

  const payFine = async (borrowId: number) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.BORROW.PAY_FINE, { borrowId });
      if (response.data.isSuccess) {
        showToast(response.data.message || "Fine paid successfully!");
        await fetchLoans();
      } else {
        showToast(response.data.message || "Failed to pay fine", "error");
      }
    } catch (err: any) {
      console.error("Failed to pay fine directly", err);
      showToast("Failed to pay fine", "error");
    }
  };

  const createRequest = async (reqData: Omit<ActivityRequest, 'id' | 'status' | 'date'>) => {
    try {
      const payload = {
        bookId: reqData.bookId,
        userId: currentUser?.id || reqData.memberId,
        requestDate: new Date().toISOString(),
        notes: reqData.notes || `${reqData.type} request from UI`
      };

      let response;
      if (reqData.type === 'Borrow') {
        response = await axiosInstance.post(API_ENDPOINTS.BORROW_REQUEST.CREATE_BORROW_REQUEST, payload);
      } else if (reqData.type === 'Return') {
        response = await axiosInstance.post(API_ENDPOINTS.BORROW_REQUEST.CREATE_RETURN_REQUEST, { borrowRecordId: reqData.borrowRecordId || reqData.bookId });
      } else if (reqData.type === 'Renew') {
        response = await axiosInstance.post(API_ENDPOINTS.BORROW_REQUEST.CREATE_RENEW_REQUEST, { borrowRecordId: reqData.borrowRecordId || reqData.bookId });
      }

      if (response?.data?.isSuccess) {
        showToast(response.data.message || `${reqData.type} request submitted successfully!`, 'success');
        await fetchRequests();
      } else {
        showToast(response?.data?.message || `Failed to submit ${reqData.type} request.`, 'error');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || `Failed to submit ${reqData.type} request.`;
      showToast(errorMsg, 'error');
      console.error("Failed to create request", err);
    }
  };

  const createReservation = useCallback(async (bookId: number) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.BOOK_RESERVATION.CREATE_RESERVATION, {
        userId: currentUser?.id,
        bookId
      });
      if (response.data.isSuccess) {
        showToast(response.data.message || "Reservation created successfully!", "success");
      } else {
        showToast(response.data.message || "Failed to create reservation", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to create reservation", "error");
      console.error("Failed to create reservation", err);
    }
  }, [currentUser?.id, showToast]);

  const getUserReservations = useCallback(async (userId: number, pageNumber: number = 1, pageSize: number = 10) => {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.BOOK_RESERVATION.GET_USER_RESERVATIONS}?userId=${userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (response.data.isSuccess) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to get user reservations", err);
      return null;
    }
  }, []);

  const getBookReservations = useCallback(async (bookId: number, pageNumber: number = 1, pageSize: number = 10) => {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.BOOK_RESERVATION.GET_BOOK_RESERVATIONS}?bookId=${bookId}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (response.data.isSuccess) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to get book reservations", err);
      return null;
    }
  }, []);

  const cancelReservation = useCallback(async (reservationId: number) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.BOOK_RESERVATION.CANCEL_RESERVATION, {
        reservationId
      });
      if (response.data.isSuccess) {
        showToast(response.data.message || "Reservation cancelled successfully!", "success");
      } else {
        showToast(response.data.message || "Failed to cancel reservation", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to cancel reservation", "error");
      console.error("Failed to cancel reservation", err);
    }
  }, [showToast]);

  const approveRequest = async (reqId: number) => {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.BORROW_REQUEST.APPROVE_REQUEST}?id=${reqId}`);
      if (response.data.isSuccess) {
        showToast(response.data.message || "Request approved successfully!", 'success');
        await Promise.all([fetchRequests(), fetchLoans(), fetchBooks()]);
      } else {
        showToast(response.data.message || "Failed to approve request.", 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to approve request.", 'error');
      console.error("Failed to approve request", err);
    }
  };

  const rejectRequest = async (reqId: number) => {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.BORROW_REQUEST.REJECT_REQUEST}?id=${reqId}`);
      if (response.data.isSuccess) {
        showToast(response.data.message || "Request rejected successfully!", 'success');
        await fetchRequests();
      } else {
        showToast(response.data.message || "Failed to reject request.", 'error');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to reject request.", 'error');
      console.error("Failed to reject request", err);
    }
  };

  const updateSettings = (newSettings: Partial<LibrarySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const rateBook = async (bookId: number, rating: number, review: string) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.BOOK_RATING.RATE_BOOK, {
        userId: currentUser?.id,
        bookId,
        rating,
        review
      });

      if (response.data.isSuccess) {
        showToast(response.data.message || "Book rated successfully!", "success");
        await fetchBooks();
        if (selectedBook && selectedBook.id === bookId) {
          const b = await fetchBookById(bookId);
          if (b) setSelectedBook(b);
        }
      } else {
        showToast(response.data.message || "Failed to rate book.", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to rate book.", "error");
      console.error("Failed to rate book", err);
    }
  };

  const getBookRatings = async (bookId: number, pageNumber: number = 1, pageSize: number = 5) => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.BOOK_RATING.GET_RATINGS}?bookId=${bookId}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
      if (res.data.isSuccess) return res.data.data || [];
      else {
        showToast(res.data.message || "Failed to get book ratings", "error");
        return [];
      }
    } catch (err) {
      console.error("Failed to get book ratings", err);
      return [];
    }
  };

  return (
    <LibraryContext.Provider value={{
      currentUser, login, logout,
      isLoginModalOpen, setLoginModalOpen,
      books, addBook, updateBook, deleteBook, isAddModalOpen, setAddModalOpen,
      members, addMember, updateMember, deleteMember, isAddMemberModalOpen, setAddMemberModalOpen,
      loans, issueBook, returnBook, renewBook, payFine, isIssueModalOpen, setIssueModalOpen,
      requests, createRequest, approveRequest, rejectRequest,
      borrowSummary, overdueBooks, dueSoonBooks,
      userHistory, userEligibility,
      fetchBooks, fetchMembers, fetchMemberById, fetchLoans, fetchRequests,
      fetchDashboardStats, fetchUserHistory, fetchMemberHistory, checkBorrowEligibility, searchBooks, fetchAllData,
      showToast,
      isEditBookModalOpen, setEditBookModalOpen, selectedBook, setSelectedBook, fetchBookById,
      notifications, fetchNotifications, markAsRead, markAllAsRead,
      loading,
      settings, updateSettings,
      rateBook, getBookRatings,
      isRateBookModalOpen, setRateBookModalOpen,
      isBookReviewsModalOpen, setBookReviewsModalOpen,
      selectedBorrowRecordId, setSelectedBorrowRecordId,
      createReservation, getUserReservations, getBookReservations, cancelReservation
    }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
