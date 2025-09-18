import { Routes, Route } from "react-router-dom"
import {
  WelcomePage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  VerifyEmailPage,
  ResetPasswordPage,
  PasswordChangedPage,
  MainPage,
  LibraryPage,
  ProfilePage,
  BookDetailPage,
  BookReturnedPage,
} from "../Pages"
import { CatalogPage } from "../Pages/CatalogPage"
import { AdminPage } from "../Pages/AdminPage"
import { AdminLoansPage } from "../Pages/AdminLoansPage/AdminLoansPage"
import { ProtectedRoute } from "./ProtectedRoute"

export function AppRoutes() {
  return (
    <Routes>
      {/* публичные страницы */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* остальное — только для авторизованных */}
      <Route path="/main" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/book/:bookId" element={<ProtectedRoute><BookDetailPage /></ProtectedRoute>} />
      <Route path="/book-returned" element={<ProtectedRoute><BookReturnedPage /></ProtectedRoute>} />
      <Route path="/catalog" element={<ProtectedRoute><CatalogPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/admin/loans" element={<ProtectedRoute><AdminLoansPage /></ProtectedRoute>} />

      {/* вспомогательные, можно оставить публичными по необходимости */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/password-changed" element={<PasswordChangedPage />} />

      <Route path="*" element={<WelcomePage />} />
    </Routes>
  )
}
