import { useNavigate } from "react-router-dom"
import "./PasswordChangedPage.scss"

export function PasswordChangedPage() {
  const navigate = useNavigate()

  const handleBackToLogin = () => {
    navigate("/login")
  }

  return (
    <div className="password-changed-page">
      <div className="password-changed-content">
        <h1 className="password-changed-title">Пароль изменен</h1>

        <p className="password-changed-description">Ваш пароль был успешно изменен</p>

        <button className="back-to-login-button" onClick={handleBackToLogin}>
          Назад ко входу
        </button>
      </div>
    </div>
  )
}
