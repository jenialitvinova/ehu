import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "../store/store"

// Base URL - now uses VITE_API_URL for production
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux state, fallback to localStorage (useful immediately after register)
      const tokenFromState = (getState() as RootState).auth.token
      const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const token = tokenFromState || tokenFromStorage

      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }

      headers.set("content-type", "application/json")
      return headers
    },
  }),
  tagTypes: ["Book", "Loan", "User"],
  endpoints: () => ({}),
})
