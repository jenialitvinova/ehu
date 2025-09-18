import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "../../store/hooks"
import { login } from "../../store/slices/authSlice"
import { useLoginMutation } from "../../api/authApi"
import { authApi } from "../../api/authApi"
import "./LoginPage.scss"



export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [loginUser, { isLoading, error }] = useLoginMutation()

  const [username, setUsername] = useState("11111111")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    // Очищаем localStorage в начале, чтобы избежать остатков старых данных
    localStorage.clear()

    try {
      const result = await loginUser({ username, password }).unwrap()

      // extract token if present and persist
      const token = (result as any).token || (result as any).access_token || (result as any).user?.token
      console.log("Token from backend:", token)
      if (token) {
        localStorage.setItem("token", token)
        console.log("Token saved to localStorage:", token)
      }

      // optimistically set token in redux so baseApi can use it for /api/me
      dispatch(
        login({
          id: (result as any).user?.id || 0,
          firstName: (result as any).user?.firstName || "",
          lastName: (result as any).user?.lastName || "",
          email: (result as any).user?.email || username,
          role: ((result as any).user?.role || "USER").toString().toUpperCase(),
          token,
        } as any),
      )

      // get authoritative profile from backend
      try {
        const profile = await dispatch(authApi.endpoints.getMe.initiate(undefined)).unwrap()
        dispatch(
          login({
            id: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            role: (profile.role || "USER").toString().toUpperCase(),
            token,
          } as any),
        )
        navigate((profile.role || "USER").toString().toUpperCase() === "ADMIN" ? "/admin" : "/main")
        return
      } catch (meErr) {
        // fallback: use already-dispatched user + token
        console.warn("GET /api/me failed, proceeding with token/user payload:", meErr)
        navigate("/main")
        return
      }
    } catch (err: any) {
      setLocalError(err.data?.message || "Ошибка входа")
    }
  }

  const handleForgotPassword = () => {
    navigate("/forgot-password")
  }

  const handleRegister = () => {
    navigate("/register")
  }

  return (
    <div className="login">
      <div className="login-content">
        <h1 className="login-title">Войти</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Имя пользователя</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
              <div className="input-icon check-icon">✓</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <div className={`input-wrapper ${localError || error ? "error" : ""}`}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setLocalError("")
                }}
                className="form-input"
                placeholder="••••••••"
                required
              />
              <button type="button" className="input-icon eye-icon" onClick={() => setShowPassword(!showPassword)}>
                <img src="/images/eye.svg" alt="IEHUI Library" />
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-wrapper">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span className="checkbox-text">Запомнить меня</span>
            </label>

            <button type="button" className="forgot-password-link" onClick={handleForgotPassword}>
              Забыли пароль?
            </button>
          </div>

          {(localError || error) && (
            <div className="error-message">{localError || (error as any)?.data?.message || "Ошибка входа"}</div>
          )}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Вход..." : "Вход"}
          </button>
        </form>

        <div className="register-link">
          У вас нет учетной записи?{" "}
          <button onClick={handleRegister} className="link-button">
            Зарегистрируйтесь
          </button>
        </div>
      </div>
    </div>
  )
}
