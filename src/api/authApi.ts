import { baseApi } from "./baseApi"
import type { LoginRequest, LoginResponse, RegisterRequest, User, Loan } from "./types"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /auth/register - Регистрация нового пользователя
    // ожидаем LoginResponse (token + user) если бэкенд вернет оба поля
    register: builder.mutation<LoginResponse | { token: string }, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: {
          username: credentials.username, // Отправляем username из формы
          email: credentials.email,
          password: credentials.password,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
        },
      }),
      invalidatesTags: ["User"],
    }),

    // POST /auth/login - Вход пользователя
    login: builder.mutation<LoginResponse | { token: string }, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          username: credentials.username, // важно: отправляем username, не email
          password: credentials.password,
        },
      }),
    }),

    // GET current user/profile - используем, если register вернул только token
    getProfile: builder.query<User, void>({
      query: () => "/api/persons/me", // <- проверьте в Swagger правильный путь ("/api/persons/me" или "/persons/me")
      providesTags: ["User"],
    }),

    // GET /api/me/loans - Получение списка книг, взятых текущим пользователем
    getMyLoans: builder.query<Loan[], void>({
      query: () => "/api/me/loans",
      providesTags: ["Loan"],
    }),
  }),
})

export const { useRegisterMutation, useLoginMutation, useGetMyLoansQuery, useGetProfileQuery } = authApi
