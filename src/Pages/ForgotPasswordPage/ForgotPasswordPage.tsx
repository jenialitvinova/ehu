import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./ForgotPasswordPage.scss"

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Здесь будет логика отправки кода
    console.log("Send code to:", email)

    // Переход на страницу проверки email
    navigate("/verify-email", { state: { email } })
  }

  const handleBack = () => {
    navigate("/login")
  }

  const handleLogin = () => {
    navigate("/login")
  }

  return (
    <div className="forgot-password">
      <div className="forgot-password-content">
        <button className="back-button" onClick={handleBack}>
          ←
        </button>

        <h1 className="forgot-password-title">Забыли пароль?</h1>

        <p className="forgot-password-description">
          Не волнуйтесь! Пожалуйста, введите адрес электронной почты, связанный с вашей учетной записью
        </p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label className="form-label">Адрес электронной почты</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Введите адрес электронной почты"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Отправить код
          </button>
        </form>

        <div className="login-link">
          Вспомнили пароль?{" "}
          <button onClick={handleLogin} className="link-button">
            Войти
          </button>
        </div>
      </div>
    </div>
  )
}
