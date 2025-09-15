import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../../store/store"
import { scanQRForBorrow } from "../../store/slices/booksSlice"
import { MainHeader } from "../../Components/MainHeader"
import "./MainPage.scss"

export function MainPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [scannedQR, setScannedQR] = useState("")

  const handleBorrowBook = () => {
    setShowQRScanner(true)
  }

  const handleReturnBook = () => {
    navigate("/library")
  }

  const handleAdminPanel = () => {
    navigate("/admin")
  }

  const handleQRScan = () => {
    if (scannedQR.trim() && user) {
      dispatch(scanQRForBorrow({ qrData: scannedQR, userId: user.id }))
      setShowQRScanner(false)
      setScannedQR("")
      alert("QR код отсканирован! Запрос на выдачу книги отправлен администратору.")
    }
  }

  return (
    <div className="main-page">
      <MainHeader />
      <div className="main-content">
        <div className="photo-placeholder">
          <div className="photo-circle">
            <img className="camera-icon" src="/images/camera.svg" alt="Camera" />
          </div>
        </div>

        <div className="action-buttons">
          {user?.role !== "admin" && (
            <>
              <button className="action-button borrow" onClick={handleBorrowBook}>
                Взять книгу
              </button>

              <button className="action-button return" onClick={handleReturnBook}>
                Сдать книгу
              </button>
            </>
          )}

          {user?.role === "admin" && (
            <button className="action-button admin" onClick={handleAdminPanel}>
              Админ панель
            </button>
          )}
        </div>

        {showQRScanner && (
          <div className="qr-scanner-modal">
            <div className="qr-scanner-content">
              <h3>Сканирование QR кода</h3>
              <div className="camera-placeholder">
                <p>📷 Камера для сканирования QR кода</p>
                <p>Наведите камеру на QR код книги</p>
              </div>
              <div className="qr-input">
                <input
                  type="text"
                  placeholder="Или введите код вручную..."
                  value={scannedQR}
                  onChange={(e) => setScannedQR(e.target.value)}
                />
                <button onClick={handleQRScan} disabled={!scannedQR.trim()}>
                  Подтвердить
                </button>
              </div>
              <button className="close-scanner" onClick={() => setShowQRScanner(false)}>
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
