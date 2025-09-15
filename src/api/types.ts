// Authentication types
export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: "USER" | "ADMIN"
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  username: string  // Добавлено: обязательное поле для бэкенда
  email: string
  password: string
  firstName: string
  lastName: string
}

// Book types
export interface Book {
  id: number
  title: string
  author: string
  year: number
  inventoryCode: string
  qrToken: string
  status: "AVAILABLE" | "BORROWED" | "PENDING_RETURN" | "LOST"
  addedByAdminId: number
}

export interface CreateBookRequest {
  title: string
  author: string
  year: number
  inventoryCode: string
}

export interface UpdateBookRequest {
  title?: string
  author?: string
  year?: number
  inventoryCode?: string
  status?: "AVAILABLE" | "BORROWED" | "PENDING_RETURN" | "LOST"
}

// Loan types
export interface Loan {
  id: number
  userId: number
  bookId: number
  status: "ACTIVE" | "RETURN_REQUESTED" | "RETURNED" | "OVERDUE"
  loanDate: string
  dueDate: string
  returnDate?: string
  book: Book
}

export interface CreateLoanRequest {
  userId: number
  bookId: number
  dueDate: string
}

export interface UpdateLoanRequest {
  status?: "ACTIVE" | "RETURN_REQUESTED" | "RETURNED" | "OVERDUE"
  returnDate?: string
}

// QR types
export interface QRBookStatus {
  bookId: number
  title: string
  author: string
  status: "AVAILABLE" | "BORROWED" | "PENDING_RETURN" | "LOST"
  qrToken: string
}

// API Error type
export interface ApiError {
  message: string
  status: number
}
