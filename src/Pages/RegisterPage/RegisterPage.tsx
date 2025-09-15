import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch } from "../../store/hooks"
import { authApi } from "../../api/authApi" // <-- добавлено, путь может отличаться
import { login } from "../../store/slices/authSlice" // пример, если login action в этом файле
import { useRegisterMutation } from "../../api/authApi"
import "./RegisterPage.scss"

export function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [registerUser, { isLoading, error }] = useRegisterMutation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("") // Новое состояние для имени пользователя
  const [localError, setLocalError] = useState("")

  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")

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

    // Валидация имени и фамилии
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError("Имя и фамилия обязательны")
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
        firstName,
        lastName,
      }).unwrap()

      // Если backend вернул сразу user (LoginResponse)
      if ((result as any).user) {
        const lr = result as LoginResponse
        dispatch(
          login({
            id: lr.user.id,
            firstName: lr.user.firstName,
            lastName: lr.user.lastName,
            email: lr.user.email,
            role: lr.user.role || "USER",
          }),
        )
        // Сохраняем токен, если есть
        if (lr.token) localStorage.setItem("token", lr.token)
        navigate("/main")
        return
      }

      // Если backend вернул только { token: "..." }
      if ((result as any).token) {
        const token = (result as any).token as string
        localStorage.setItem("token", token) // чтобы baseApi мог поставить Authorization
        try {
          // вручную инициализируем запрос профиля через RTK endpoint
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
          console.error("Failed to load profile after register:", errProfile)
          // fallback — перейти на логин (пользователь создан, но профиль не получен)
          navigate("/login")
          return
        }
      }

      // иное поведение
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
            <label className="form-label">Имя</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input"
              placeholder="Ваше имя"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Фамилия</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input"
              placeholder="Ваша фамилия"
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
              !firstName ||
              !lastName ||
              password.length < 8 ||
              !username // Добавлено условие для имени пользователя
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
