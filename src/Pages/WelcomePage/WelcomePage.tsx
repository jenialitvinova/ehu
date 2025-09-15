import { useNavigate } from "react-router-dom"
import "./WelcomePage.scss"

export function WelcomePage() {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate("/login")
  }

  const handleRegister = () => {
    navigate("/register")
  }

  return (
    <div className="welcome">
      <div className="welcome-content">
        <div className="logo-section">
          <img src="/images/library-logo.png" alt="IEHUI Library" className="library-logo" />
        </div>

        <h1 className="welcome-title">Библиотека</h1>

        <div className="button-section">
          <button className="login-button" onClick={handleLogin}>
            Войти
          </button>

          <button className="register-button" onClick={handleRegister}>
            Создать аккаунт
          </button>
        </div>
      </div>
    </div>
  )
}
