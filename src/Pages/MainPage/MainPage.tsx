import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../../store/store"
import { scanQRForBorrow } from "../../store/slices/booksSlice"
import { MainHeader } from "../../Components/MainHeader/MainHeader"
import "./MainPage.scss"

// Добавлено: импорт для QR-сканера
import QrScanner from "qr-scanner"

export function MainPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [scannedQR, setScannedQR] = useState("")

  // Добавлено: ref для видео-элемента
  const videoRef = useRef<HTMLVideoElement>(null)
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null)

  // Добавлено: инициализация сканера при открытии модала
  useEffect(() => {
    if (showQRScanner && videoRef.current) {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => handleQRScan(result.data),
        { highlightScanRegion: true, highlightCodeOutline: true }
      )
      setQrScanner(scanner)
      scanner.start().catch((err) => {
        console.error("Failed to start QR scanner:", err)
        alert("Не удалось запустить камеру. Проверьте разрешения.")
      })
    } else if (!showQRScanner && qrScanner) {
      qrScanner.stop()
      setQrScanner(null)
    }

    // Очистка при размонтировании
    return () => {
      if (qrScanner) qrScanner.stop()
    }
  }, [showQRScanner])

  const handleBorrowBook = () => {
    setShowQRScanner(true)
  }

  const handleReturnBook = () => {
    navigate("/library")
  }

  const handleAdminPanel = () => {
    navigate("/admin")
  }

  const handleQRScan = (data: string) => {
    if (data && user) {
      dispatch(scanQRForBorrow({ qrData: data, userId: user.id }))
      setShowQRScanner(false)
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
          {user?.role !== "ADMIN" && user?.role !== "admin" && (
            <>
              <button className="action-button borrow" onClick={handleBorrowBook}>
                Взять книгу
              </button>

              <button className="action-button return" onClick={handleReturnBook}>
                Сдать книгу
              </button>
            </>
          )}

          {(user?.role === "ADMIN" || user?.role === "admin") && (
            <button className="action-button admin" onClick={handleAdminPanel}>
              Админ панель
            </button>
          )}
        </div>

        {showQRScanner && (
          <div className="qr-scanner-modal">
            <div className="qr-scanner-content">
              <h3>Сканирование QR кода</h3>
              {/* Изменено: заменяем на видео-элемент для qr-scanner */}
              <video ref={videoRef} style={{ width: "100%", height: "300px" }} />
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
