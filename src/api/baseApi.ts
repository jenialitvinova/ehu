import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// Base URL - now uses VITE_API_URL for production
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"


export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Prefer token from Redux state; fallback to localStorage
      const tokenFromState = (getState() as any).auth?.token
      const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const token = tokenFromState || tokenFromStorage
      console.log("Using token in prepareHeaders:", token)  // Добавлено: отладка

      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      headers.set("Content-Type", "application/json")
      return headers
    },
  }),
  tagTypes: ["Book", "Loan", "User"],
  endpoints: () => ({}),
})
