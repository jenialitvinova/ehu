import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "../../store/hooks"
import { login, loginAsAdmin } from "../../store/slices/authSlice"
import { useLoginMutation } from "../../api/authApi"
import { authApi } from "../../api/authApi"
import "./LoginPage.scss"

// Функция для декодирования JWT (без верификации, только payload)
function decodeJwt(token: string) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (e) {
    console.error("Failed to decode JWT:", e)
    return null
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [loginUser, { isLoading, error }] = useLoginMutation()

  const [username, setUsername] = useState("litvinova.evgeniya@student.ehu.lt")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLocalError("")

    if (username === "admin@admin.admin" && password === "admin") {
      dispatch(loginAsAdmin())
      navigate("/main")
      return
    }

    try {
      // send username (backend expects LoginRequest.username)
      const result = await loginUser({ username, password }).unwrap()

      // если backend вернул user внутри ответа (редко)
      if ((result as any).user) {
        const lr = result as any
        console.log("Login result user:", lr.user) // Добавлено: логируем user
        dispatch(
          login({
            id: lr.user.id,
            firstName: lr.user.firstName,
            lastName: lr.user.lastName,
            email: lr.user.email,
            role: lr.user.role || "user",
          }),
        )
        if (lr.token) localStorage.setItem("token", lr.token)
        navigate("/main")
        return
      }

      // если backend вернул только { token: "..." } - декодируем и берем user из токена
      if ((result as any).token) {
        const token = (result as any).token as string
        localStorage.setItem("token", token)
        
        // Декодируем токен для получения user данных
        const decoded = decodeJwt(token)
        console.log("Decoded JWT:", decoded) // Добавлено: логируем декодированный токен
        if (decoded && decoded.sub) { // sub обычно содержит username или id
          // Предполагаем, что токен содержит user поля (firstName, lastName, email, role)
          // Если нет - запросите бэкендера добавить их в токен или вернуть user в ответе
          dispatch(
            login({
              id: decoded.id || decoded.sub,
              firstName: decoded.firstName || "Unknown",
              lastName: decoded.lastName || "User",
              email: decoded.email || username,
              role: decoded.role || "USER",
            }),
          )
          navigate("/main")
          return
        } else {
          // Если токен не содержит user данных - fallback на запрос профиля (если исправлен 500)
          try {
            const profile = await dispatch(authApi.endpoints.getProfile.initiate(undefined)).unwrap()
            dispatch(
              login({
                id: profile.id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                role: profile.role || "USER",
              }),
            )
            navigate("/main")
            return
          } catch (errProfile) {
            console.error("Failed to load profile after login:", errProfile)
            setLocalError("Не удалось загрузить профиль. Попробуйте позже.")
            return
          }
        }
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

        <div className="admin-hint">
          <small>Для входа как админ: admin@admin.admin / admin</small>
        </div>
      </div>
    </div>
  )
}
