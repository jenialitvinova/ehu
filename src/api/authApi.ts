import { baseApi } from "./baseApi"
import type { LoginRequest, LoginResponse, RegisterRequest, User } from "./types"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /auth/register - Регистрация нового пользователя
    // ожидаем LoginResponse (token + user) если бэкенд вернет оба поля
    register: builder.mutation<LoginResponse | { token: string }, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: {
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
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
          username: credentials.username,
          password: credentials.password,
        },
      }),
    }),

    // GET /api/persons/me - Получение профиля текущего пользователя
    getProfile: builder.query<User, void>({
      query: () => "/api/persons/me",
      providesTags: ["User"],
    }),

    // GET /api/me - Новый endpoint для профиля (используем для проверки роли)
    getMe: builder.query<User, void>({
      query: () => "/api/me",
      providesTags: ["User"],
    }),
  }),
})

export const { useRegisterMutation, useLoginMutation, useGetProfileQuery, useGetMeQuery } = authApi
