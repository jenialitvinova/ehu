import { useNavigate } from "react-router-dom"
import "./BookReturnedPage.scss"

export function BookReturnedPage() {
  const navigate = useNavigate()

  const handleBackToLogin = () => {
    navigate("/main")
  }

  return (
    <div className="book-returned-page">
      <div className="book-returned-content">
        <div className="success-section">
          <h1 className="success-title">Книга успешно сдана</h1>

          <div className="success-icon">
            <div className="check-circle">✓</div>
          </div>
        </div>

        <button className="returned-back-button" onClick={handleBackToLogin}>
          Назад ко входу
        </button>
      </div>
    </div>
  )
}
