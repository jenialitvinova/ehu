import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./ResetPasswordPage.scss"

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleBack = () => {
    navigate("/verify-email")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      return
    }

    // Здесь будет логика сброса пароля
    console.log("Reset password:", newPassword)

    // Переход на страницу успешного изменения
    navigate("/password-changed")
  }

  const handleLogin = () => {
    navigate("/login")
  }

  return (
    <div className="reset-password">
      <div className="reset-password-content">
        <button className="back-button" onClick={handleBack}>
          ←
        </button>

        <h1 className="reset-password-title">Сброс пароля</h1>

        <p className="reset-password-description">Пожалуйста, придумайте новый пароль</p>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label className="form-label">Новый пароль</label>
            <div className="input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="должно быть 8 символов"
                required
              />
              <button
                type="button"
                className="input-icon eye-icon"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                                                          <img src="/images/eye.svg" alt="IEHUI Library" />

              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Подтвердите новый пароль</label>
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

          <button
            type="submit"
            className="submit-button"
            disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            Сброс пароля
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
