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

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/password-changed" element={<PasswordChangedPage />} />
      <Route path="/main" element={<MainPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/book/:bookId" element={<BookDetailPage />} />
      <Route path="/book-returned" element={<BookReturnedPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<WelcomePage />} />
    </Routes>
  )
}
