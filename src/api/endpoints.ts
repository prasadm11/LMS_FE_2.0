export const API_ENDPOINTS = {
  BOOKS: {
    GET_ALL_BOOKS: "/Books/GetAllBooks",
    GET_BOOK_BY_ID: "/Books/GetBookById/",
    ADD_BOOK: "/Books/AddBook",
    UPDATE_BOOK: "/Books/UpdateBook",
    DELETE_BOOK: "/Books/DeleteBook"
  },
  BORROW: {
    BORROW_BOOK: "Borrow/BorrowBook",
    RETURN_BOOK: "Borrow/ReturnBook",
    GET_BOOK_BY_STATUS: "Borrow/GetBooksByStatus",
    GET_USER_BORROW_HISTORY: "Borrow/GetUserBorrowHistory",
    GET_OVERDUE_BOOKS: "Borrow/GetOverdueBooks",
    RENEW_BOOK: "Borrow/RenewBook",
    SEARCH_BOOKS: "Borrow/SearchBooks",
    GET_BORROW_SUMMARY: "Borrow/GetBorrowSummary",
    CHECK_BORROW_ELIGIBILITY: "Borrow/CheckBorrowEligibility",
    PAY_FINE: "Borrow/PayFine",
    GET_DUEBOOK_SOON: "Borrow/GetDueBookSoon"
  },
  USER: {
    GET_ALL_USERS: "User/GetAllUsers",
    CREATE_USER: "User/CreateUser",
    UPDATE_USER: "User/UpdateUser",
    DELETE_USER: "User/DeleteUser",
    GET_USER_BY_ID: "User/GetUserById"
  },
  BORROW_REQUEST: {
    CREATE_BORROW_REQUEST: "BorrowRequest/CreateBorrowRequest",
    GET_ALL_PENDING: "BorrowRequest/GetAllPendingBorrowRequests",
    APPROVE_REQUEST: "BorrowRequest/ApproveRequest",
    REJECT_REQUEST: "BorrowRequest/RejectRequest",
    CREATE_RETURN_REQUEST: "BorrowRequest/CreateReturnBookRequest",
    CREATE_RENEW_REQUEST: "BorrowRequest/CreateRenewBookRequest"
  },
  AUTH: {
    LOGIN: "/Auth/LoginUser"
  },
  NOTIFICATION: {
    GET_BY_USER: "Notification/GetNotificationsByUserId",
    MARK_AS_READ: "Notification/MarkAsRead"
  },
  BOOK_RATING: {
    RATE_BOOK: "BookRating/RateBook",
    GET_RATINGS: "BookRating/GetBookRatings"
  },
  BOOK_RESERVATION: {
    CREATE_RESERVATION: "/BookReservation/CreateReservation",
    GET_BOOK_RESERVATIONS: "/BookReservation/GetBookReservations",
    GET_USER_RESERVATIONS: "/BookReservation/GetUserReservations",
    CANCEL_RESERVATION: "/BookReservation/CancelReservation"
  }
};
