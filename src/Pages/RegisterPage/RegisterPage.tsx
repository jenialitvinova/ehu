import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "../../store/hooks"
import { authApi } from "../../api/authApi"
import { login } from "../../store/slices/authSlice"
import { useRegisterMutation } from "../../api/authApi"
import "./RegisterPage.scss"

export function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [registerUser, { isLoading, error }] = useRegisterMutation()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState("")

  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

    // Очищаем localStorage в начале, чтобы избежать остатков старых данных
    localStorage.clear()

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setLocalError("Введите корректный адрес электронной почты")
      return
    }

    // Валидация пароля (минимум 8 символов)
    if (password.length < 8) {
      setLocalError("Пароль должен содержать не менее 8 символов")
      return
    }

    if (password !== confirmPassword) {
      setLocalError("Пароли не совпадают")
      return
    }

    // Валидация имени пользователя
    if (!username.trim()) {
      setLocalError("Имя пользователя обязательно")
      return
    }

    try {
      const result = await registerUser({
        username,
        email,
        password,
      }).unwrap()

      // Backend returns { token: "string" }, so handle token and fetch profile
      if ((result as any).token) {
        const token = (result as any).token as string
        // Clear localStorage before setting new token
        localStorage.clear()
        localStorage.setItem("token", token) // Save token for baseApi to use

        // Fetch user profile using the token
        try {
          const profile = await dispatch(authApi.endpoints.getMe.initiate(undefined)).unwrap()
          dispatch(
            login({
              id: profile.id,
              firstName: profile.firstName || "",
              lastName: profile.lastName || "",
              email: profile.email,
              role: profile.role || "USER",
              token, // Include token in state
            }),
          )
          navigate("/main") // Navigate to main page after login
          return
        } catch (profileErr) {
          console.error("Failed to fetch profile after registration:", profileErr)
          setLocalError("Регистрация успешна, но не удалось загрузить профиль. Попробуйте войти вручную.")
          navigate("/login") // Fallback to login page
          return
        }
      }

      // Fallback for unexpected responses
      setLocalError("Неожиданный ответ от сервера")
    } catch (err: any) {
      console.error("register error:", err)
      setLocalError(err.data?.message || err.error || "Ошибка регистрации")
    }
  }

  const handleLogin = () => {
    navigate("/login")
  }

  return (
    <div className="register">
      <div className="register-content">
        <h1 className="register-title">Регистрация</h1>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label className="form-label">Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Уникальное имя пользователя"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Почта</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="example@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Создайте пароль</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="должно быть 8 символов"
                required
              />
              <button type="button" className="input-icon eye-icon" onClick={() => setShowPassword(!showPassword)}>
                <img src="/images/eye.svg" alt="IEHUI Library" />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Подтвердите пароль</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="повторить пароль"
                required
              />
              <button
                type="button"
                className="input-icon eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <img src="/images/eye.svg" alt="IEHUI Library" />
              </button>
            </div>
          </div>

          {passwordsMatch && <div className="password-match success">пароли совпадают</div>}
          {passwordsDontMatch && <div className="password-match error">пароли не совпадают</div>}

          {(localError || error) && (
            <div className="password-match error">
              {localError || (error as any)?.data?.message || "Ошибка регистрации"}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={
              !passwordsMatch ||
              isLoading ||
              password.length < 8 ||
              !username
            }
          >
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>
        </form>

        <div className="login-link">
          У вас уже есть учетная запись?{" "}
          <button onClick={handleLogin} className="link-button">
            Войти
          </button>
        </div>
      </div>
    </div>
  )
}
