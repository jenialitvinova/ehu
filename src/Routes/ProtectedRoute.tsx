import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAppSelector } from "../store/hooks"

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const location = useLocation()

  // если авторизован — рендерим потомка, иначе перенаправляем на /login
  if (isAuthenticated) return children

  return <Navigate to="/login" replace state={{ from: location }} />
}