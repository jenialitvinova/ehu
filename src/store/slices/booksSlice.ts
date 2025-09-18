import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface Book {
  id: string
  title: string
  author: string
  cover: string
  description: string
  isBorrowed: boolean
  borrowDate?: string
  genre?: string
  year?: number
}

export interface CartItem {
  bookId: string
  requestDate: string
}

export interface ReturnRequest {
  id: string
  userId: string
  books: string[]
  status: "pending" | "approved" | "rejected"
  requestDate: string
  qrCode: string
}

export interface BorrowRequest {
  id: string
  userId: string
  books: string[]
  status: "pending" | "approved" | "rejected"
  requestDate: string
  qrCode: string
}

export interface BooksState { // Add export
  books: Book[]
  myBooks: Book[]
  cart: CartItem[]
  returnCart: CartItem[]
  borrowRequests: BorrowRequest[]
  returnRequests: ReturnRequest[]
  allBooks: Book[]
}

const initialState: BooksState = {
  books: [
    {
      id: "1",
      title: "CLR via C#. Программирование на платформе Microsoft .NET Framework 4.5 на языке C#. 4-е изд.",
      author: "Рихтер Д.",
      cover: "/images/clr-book.png",
      description: "Программирование на платформе Microsoft .NET Framework 4.5 на языке C#",
      isBorrowed: true,
      borrowDate: "2024-01-15",
      genre: "Программирование",
      year: 2013,
    },
    {
      id: "2",
      title: "Java для всех",
      author: "Васильев А. Н.",
      cover: "/placeholder.svg?height=200&width=150",
      description: "Полное руководство по программированию на Java",
      isBorrowed: false,
      genre: "Программирование",
      year: 2020,
    },
    {
      id: "3",
      title: "Типы и грамматические конструкции",
      author: "Симпсон К.",
      cover: "/placeholder.svg?height=200&width=150",
      description: "Изучение типов и грамматических конструкций в программировании",
      isBorrowed: false,
      genre: "Программирование",
      year: 2019,
    },
    {
      id: "4",
      title: "Война и мир",
      author: "Толстой Л. Н.",
      cover: "/placeholder.svg?height=200&width=150",
      description: "Классическое произведение русской литературы",
      isBorrowed: false,
      genre: "Классика",
      year: 1869,
    },
    {
      id: "5",
      title: "Преступление и наказание",
      author: "Достоевский Ф. М.",
      cover: "/placeholder.svg?height=200&width=150",
      description: "Психологический роман о преступлении и его последствиях",
      isBorrowed: false,
      genre: "Классика",
      year: 1866,
    },
    {
      id: "6",
      title: "Алгоритмы. Построение и анализ",
      author: "Кормен Т.",
      cover: "/placeholder.svg?height=200&width=150",
      description: "Фундаментальный учебник по алгоритмам и структурам данных",
      isBorrowed: false,
      genre: "Программирование",
      year: 2009,
    },
  ],
  myBooks: [],
  cart: [],
  returnCart: [],
  borrowRequests: [],
  returnRequests: [],
  allBooks: [],
}

initialState.myBooks = initialState.books.filter((book) => book.isBorrowed)
initialState.allBooks = [...initialState.books]

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    borrowBook: (state, action: PayloadAction<string>) => {
      const book = state.books.find((b) => b.id === action.payload)
      if (book && !book.isBorrowed) {
        book.isBorrowed = true
        book.borrowDate = new Date().toISOString().split("T")[0]
        state.myBooks.push(book)
      }
    },
    returnBook: (state, action: PayloadAction<string>) => {
      const book = state.books.find((b) => b.id === action.payload)
      if (book && book.isBorrowed) {
        book.isBorrowed = false
        book.borrowDate = undefined
        state.myBooks = state.myBooks.filter((b) => b.id !== action.payload)
      }
    },
    setMyBooks: (state) => {
      state.myBooks = state.books.filter((book) => book.isBorrowed)
    },
    addToCart: (state, action: PayloadAction<string>) => {
      const bookId = action.payload
      const existsInCart = state.cart.some((item) => item.bookId === bookId)
      const book = state.books.find((b) => b.id === bookId)

      if (!existsInCart && book && !book.isBorrowed) {
        state.cart.push({
          bookId,
          requestDate: new Date().toISOString(),
        })
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item.bookId !== action.payload)
    },
    clearCart: (state) => {
      state.cart = []
    },
    addToReturnCart: (state, action: PayloadAction<string>) => {
      const bookId = action.payload
      const existsInReturnCart = state.returnCart.some((item) => item.bookId === bookId)
      const book = state.books.find((b) => b.id === bookId)

      if (!existsInReturnCart && book && book.isBorrowed) {
        state.returnCart.push({
          bookId,
          requestDate: new Date().toISOString(),
        })
      }
    },
    removeFromReturnCart: (state, action: PayloadAction<string>) => {
      state.returnCart = state.returnCart.filter((item) => item.bookId !== action.payload)
    },
    clearReturnCart: (state) => {
      state.returnCart = []
    },
    createBorrowRequest: (state, action: PayloadAction<{ userId: string }>) => {
      if (state.cart.length > 0) {
        const request: BorrowRequest = {
          id: Date.now().toString(),
          userId: action.payload.userId,
          books: state.cart.map((item) => item.bookId),
          status: "pending",
          requestDate: new Date().toISOString(),
          qrCode: `QR-${Date.now()}`,
        }
        state.borrowRequests.push(request)
        state.cart = []
      }
    },
    createReturnRequest: (state, action: PayloadAction<{ userId: string }>) => {
      if (state.returnCart.length > 0) {
        const request: ReturnRequest = {
          id: Date.now().toString(),
          userId: action.payload.userId,
          books: state.returnCart.map((item) => item.bookId),
          status: "pending",
          requestDate: new Date().toISOString(),
          qrCode: `RETURN-QR-${Date.now()}`,
        }
        state.returnRequests.push(request)
        state.returnCart = []
      }
    },
    approveRequest: (state, action: PayloadAction<string>) => {
      const request = state.borrowRequests.find((r) => r.id === action.payload)
      if (request) {
        request.status = "approved"
        // Помечаем книги как взятые
        request.books.forEach((bookId) => {
          const book = state.books.find((b) => b.id === bookId)
          if (book) {
            book.isBorrowed = true
            book.borrowDate = new Date().toISOString().split("T")[0]
            state.myBooks.push(book)
          }
        })
      }
    },
    rejectRequest: (state, action: PayloadAction<string>) => {
      const request = state.borrowRequests.find((r) => r.id === action.payload)
      if (request) {
        request.status = "rejected"
      }
    },
    approveReturnRequest: (state, action: PayloadAction<string>) => {
      const request = state.returnRequests.find((r) => r.id === action.payload)
      if (request) {
        request.status = "approved"
        // Помечаем книги как возвращенные
        request.books.forEach((bookId) => {
          const book = state.books.find((b) => b.id === bookId)
          if (book) {
            book.isBorrowed = false
            book.borrowDate = undefined
            state.myBooks = state.myBooks.filter((b) => b.id !== bookId)
          }
        })
      }
    },
    rejectReturnRequest: (state, action: PayloadAction<string>) => {
      const request = state.returnRequests.find((r) => r.id === action.payload)
      if (request) {
        request.status = "rejected"
      }
    },
    addBook: (state, action: PayloadAction<Omit<Book, "id">>) => {
      const newBook: Book = {
        ...action.payload,
        id: Date.now().toString(),
        isBorrowed: false,
      }
      state.books.push(newBook)
      state.allBooks.push(newBook)
    },
    updateBook: (state, action: PayloadAction<Book>) => {
      const index = state.books.findIndex((book) => book.id === action.payload.id)
      if (index !== -1) {
        state.books[index] = action.payload
        const allBooksIndex = state.allBooks.findIndex((book) => book.id === action.payload.id)
        if (allBooksIndex !== -1) {
          state.allBooks[allBooksIndex] = action.payload
        }
      }
    },
    deleteBook: (state, action: PayloadAction<string>) => {
      state.books = state.books.filter((book) => book.id !== action.payload)
      state.allBooks = state.allBooks.filter((book) => book.id !== action.payload)
      state.myBooks = state.myBooks.filter((book) => book.id !== action.payload)
      state.cart = state.cart.filter((item) => item.bookId !== action.payload)
      state.returnCart = state.returnCart.filter((item) => item.bookId !== action.payload)
    },
    scanQRForBorrow: (state, action: PayloadAction<{ qrData: string; userId: string }>) => {
      // Simulate QR scanning - in real app this would decode QR and process book borrowing
      console.log(`[v0] QR scanned for borrowing: ${action.payload.qrData}`)
      // For now, just create a mock borrow request
      const mockRequest: BorrowRequest = {
        id: Date.now().toString(),
        userId: action.payload.userId,
        books: [], // Would be populated from QR data
        status: "pending",
        requestDate: new Date().toISOString(),
        qrCode: action.payload.qrData,
      }
      state.borrowRequests.push(mockRequest)
    },
  },
})

export const {
  borrowBook,
  returnBook,
  setMyBooks,
  addToCart,
  removeFromCart,
  clearCart,
  addToReturnCart,
  removeFromReturnCart,
  clearReturnCart,
  createBorrowRequest,
  createReturnRequest,
  approveRequest,
  rejectRequest,
  approveReturnRequest,
  rejectReturnRequest,
  addBook,
  updateBook,
  deleteBook,
  scanQRForBorrow,
} = booksSlice.actions
export default booksSlice.reducer
