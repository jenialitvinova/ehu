import { baseApi } from "./baseApi"
import type { Book, CreateBookRequest, UpdateBookRequest } from "./types"

export const booksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/books - Получение списка всех книг
    getBooks: builder.query<Book[], void>({
      query: () => "/api/books",
      providesTags: ["Book"],
    }),

    // GET /api/books/{id} - Получение информации о конкретной книге
    getBook: builder.query<Book, number>({
      query: (id) => `/api/books/${id}`,
      providesTags: (result, error, id) => [{ type: "Book", id }],
    }),

    // POST /api/books - Добавление новой книги (только для администратора)
    createBook: builder.mutation<Book, CreateBookRequest>({
      query: (book) => ({
        url: "/api/books",
        method: "POST",
        body: book,
      }),
      invalidatesTags: ["Book"],
    }),

    // PUT /api/books/{id} - Обновление информации о книге (только для администратора)
    updateBook: builder.mutation<Book, { id: number; book: UpdateBookRequest }>({
      query: ({ id, book }) => ({
        url: `/api/books/${id}`,
        method: "PUT",
        body: book,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Book", id }],
    }),

    // DELETE /api/books/{id} - Удаление книги (только для администратора)
    deleteBook: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/books/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Book"],
    }),

    // GET /api/books/qr/{qrToken} - Получение информации о книге по QR-токену
    getBookByQR: builder.query<Book, string>({
      query: (qrToken) => `/api/books/qr/${qrToken}`,
      providesTags: (result, error, qrToken) => [{ type: "Book", id: qrToken }],
    }),

    // GET /api/admin/books - Получение списка книг для администратора
    getAdminBooks: builder.query<Book[], void>({
      query: () => "/api/admin/books",
      providesTags: ["Book"],
    }),
  }),
})

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useGetBookByQRQuery,
  useGetAdminBooksQuery,
} = booksApi
