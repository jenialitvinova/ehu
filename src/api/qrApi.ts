import { baseApi } from "./baseApi"
import type { QRBookStatus } from "./types"

export const qrApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/qr/{qrToken} - Получение статуса книги по QR-коду
    getQRBookStatus: builder.query<QRBookStatus, string>({
      query: (qrToken) => `/api/qr/${qrToken}`,
      providesTags: (result, error, qrToken) => [{ type: "Book", id: qrToken }],
    }),

    // GET /l/{qrToken} - Короткая ссылка по QR-коду (редирект)
    getShortLink: builder.query<void, string>({
      query: (qrToken) => `/l/${qrToken}`,
    }),

    // POST /api/qr/generate - Генерация QR-кода для займов (добавлено)
    generateQrCode: builder.mutation<{ qrCode: string }, { userId: number; bookIds: number[] }>({
      query: (body) => ({
        url: "/api/qr/generate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Loan"],  // Инвалидируем теги, если QR влияет на займы
    }),
  }),
})

export const {
  useGetQRBookStatusQuery,
  useGetShortLinkQuery,
  useGenerateQrCodeMutation,  // Добавлено
} = qrApi
