import { baseApi } from "./baseApi"
import type { Loan, CreateLoanRequest, UpdateLoanRequest } from "./types"

export const loansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/loans - все займы (админ)
    getAllLoans: builder.query<Loan[], void>({
      query: () => "/api/loans",
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: "Loan" as const, id })), "Loan"] : ["Loan"],
    }),

    // POST /api/loans - Оформление выдачи книги пользователю (только для администратора)
    createLoan: builder.mutation<Loan, CreateLoanRequest>({
      query: (loan) => ({
        url: "/api/loans",
        method: "POST",
        body: loan,
      }),
      invalidatesTags: ["Loan", "Book"],
    }),

    // PATCH /api/loans/{id} - Обновление статуса займа
    updateLoan: builder.mutation<Loan, { id: number; loan: UpdateLoanRequest }>({
      query: ({ id, loan }) => ({
        url: `/api/loans/${id}`,
        method: "PATCH",
        body: loan,
      }),
      invalidatesTags: ["Loan", "Book"],
    }),

    // PATCH /api/loans/bulk - Массовое подтверждение возвратов (только для администратора)
    bulkConfirmReturns: builder.mutation<Loan[], number[]>({
      query: (loanIds) => ({
        url: "/api/loans/bulk",
        method: "PATCH",
        body: loanIds,
      }),
      invalidatesTags: ["Loan", "Book"],
    }),

    // POST /api/loans/qr/{qrToken}/take - Взять книгу по QR-коду
    takeBookByQR: builder.mutation<Loan, string>({
      query: (qrToken) => ({
        url: `/api/loans/qr/${qrToken}/take`,
        method: "POST",
      }),
      invalidatesTags: ["Loan", "Book"],
    }),

    // PATCH /api/loans/qr/{qrToken}/mark-return - Отметить возврат книги по QR-коду
    markReturnByQR: builder.mutation<Loan, string>({
      query: (qrToken) => ({
        url: `/api/loans/qr/${qrToken}/mark-return`,
        method: "PATCH",  // Changed from POST to PATCH
      }),
      invalidatesTags: ["Loan", "Book"],
    }),

    // PATCH /api/loans/qr/{qrToken}/confirm-return - Подтвердить возврат книги по QR-коду (только для администратора)
    confirmReturnByQR: builder.mutation<Loan, string>({
      query: (qrToken) => ({
        url: `/api/loans/qr/${qrToken}/confirm-return`,
        method: "PATCH",  // Изменено: с POST на PATCH, как указано в API
      }),
      invalidatesTags: ["Loan", "Book"],
    }),

    // Добавлено: GET /api/me/loans - Получение списка займов текущего пользователя
    getMyLoans: builder.query<Loan[], void>({
      query: () => "/api/me/loans",
      providesTags: ["Loan"],
    }),

    returnBookByQR: builder.mutation({
      query: (qrToken: string) => ({
        url: `/api/loans/qr/${qrToken}/return`,  // Добавлено: полный путь с /api
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useGetAllLoansQuery,
  useCreateLoanMutation,
  useUpdateLoanMutation,
  useBulkConfirmReturnsMutation,
  useTakeBookByQRMutation,
  useMarkReturnByQRMutation,
  useConfirmReturnByQRMutation,
  useGetMyLoansQuery,
  useReturnBookByQRMutation,
} = loansApi
