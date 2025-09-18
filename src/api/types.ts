// Authentication types
export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: "USER" | "ADMIN"
  createdAt: string
  username?: string
  login?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

// Book types
export interface CreateBookRequest {
  title: string
  author: string
  year?: number
  inventoryCode?: string
  // Опционально: если фронт генерирует QR-токен локально, можно отправить его вместе с запросом
  qrToken?: string
}

export interface Book {
  id: number
  title: string
  author: string
  year?: number
  inventoryCode?: string
  cover?: string
  description?: string
  genre?: string
  status?: string
  // Опционально: QR-токен, может возвращать бэкенд или фронт при создании
  qrToken?: string
}

export interface UpdateBookRequest {
  title?: string
  author?: string
  year?: number
  inventoryCode?: string
  status?: string
}

// Loan types
export interface Loan {
  id: number
  userId: number
  bookId: number
  status: string
  loanDate: string
  dueDate: string
  returnDate?: string
  book: Book
  user?: User
  qrToken?: string
}

export interface CreateLoanRequest {
  userId: number
  bookId: number
  dueDate: string
}

export interface UpdateLoanRequest {
  status?: string
  returnDate?: string
}

// QR types
export interface QRBookStatus {
  bookId: number
  title: string
  author: string
  status: string
  qrToken: string
}

// API Error type
export interface ApiError {
  message: string
  status: number
}
