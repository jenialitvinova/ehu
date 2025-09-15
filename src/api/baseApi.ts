import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { RootState } from "../store/store"

// Base URL - should be configured based on environment
// If VITE_API_URL is set, use it. Otherwise, in dev use relative URL ("")
// so Vite dev server proxy (vite.config.ts) can forward requests and avoid CORS.
const BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "" : "http://localhost:8080")

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
