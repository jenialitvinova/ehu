import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  role: "user" | "admin"
}

export interface AuthState {
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
    // login now accepts optional token and stores it in state
    login: (state, action: PayloadAction<{ id: any; firstName?: string; lastName?: string; email?: string; role?: string; token?: string }>) => {
      state.user = {
        id: action.payload.id,
        firstName: action.payload.firstName || "",
        lastName: action.payload.lastName || "",
        email: action.payload.email || "",
        role: (action.payload.role || "USER").toString().toUpperCase() as any,
      } as User
      if (action.payload.token) {
        state.token = action.payload.token
      }
      state.isAuthenticated = true
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
