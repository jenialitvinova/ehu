import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: "user" | "admin"
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    loginAsAdmin: (state) => {
      state.isAuthenticated = true
      state.user = {
        id: "admin",
        firstName: "Admin",
        lastName: "User",
        email: "admin@admin.admin",
        role: "admin",
      }
      state.token = "mock-admin-token"
    },
  },
})

export const { login, logout, updateProfile, loginAsAdmin } = authSlice.actions
export default authSlice.reducer
