import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { RootState } from "../../store/store"
import { MainHeader } from "../../Components/MainHeader/MainHeader"
import "./MainPage.scss"

// Добавлено: импорт для QR-сканера
import QrScanner from "qr-scanner"
// (убрал WORKER_PATH — не поддерживается в новой версии, worker должен загружаться автоматически)
import { useTakeBookByQRMutation, useMarkReturnByQRMutation } from "../../api/loansApi"

export function MainPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [showQRScanner, setShowQRScanner] = useState(false)
  // scannedQR удалён — не используется
  // ручной ввод токена убран

  // Добавлено: ref для видео-элемента
  const videoRef = useRef<HTMLVideoElement>(null)
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null)
  const [takeBookByQR] = useTakeBookByQRMutation()
  const [isProcessingScan, setIsProcessingScan] = useState(false)
  const [scannedOnce, setScannedOnce] = useState(false) // Добавлено: флаг для предотвращения повторных сканов
  // Состояние для сканера сдачи книги
  const [showReturnScanner, setShowReturnScanner] = useState(false)
  const returnVideoRef = useRef<HTMLVideoElement>(null)
  const [returnQrScanner, setReturnQrScanner] = useState<QrScanner | null>(null)
  const [markReturnByQR] = useMarkReturnByQRMutation()
  const [isProcessingReturn, setIsProcessingReturn] = useState(false)
  const [scannedReturnOnce, setScannedReturnOnce] = useState(false)

  // handleQRScan вынесен до эффекта, т.к. QrScanner вызывает колбэк напрямую
  const handleQRScan = async (data: string) => {
    console.log("handleQRScan called with data:", data, "user:", user) // для отладки
    if (!data) return
    if (!user) {
      alert("Пользователь не авторизован. Войдите в систему.")
      return
    }
    console.log("Scanned QR data:", data) // Добавлено: логирование для отладки

    // защита от повторных чтений
    if (isProcessingScan) return
    setIsProcessingScan(true)

    // остановим сканер, чтобы не читать дубли (убрал из колбэка, но оставил здесь для безопасности)
    try {
      if (qrScanner) {
        qrScanner.stop()
      }
    } catch {}

    // Admins should use admin panel to create loans for other users
    const role = (user.role || "").toString().toUpperCase()
    if (role === "ADMIN") {
      alert("Вы — администратор. Для выдачи книги используйте админскую панель (POST /api/loans).")
      setIsProcessingScan(false)
      setShowQRScanner(false)
      navigate("/admin")
      return
    }

    try {
      // Вызываем POST /api/loans/qr/{qrToken}/take
      const loan = await takeBookByQR(data).unwrap()
      alert(`Книга выдана. Статус: ${loan.status}. Срок до: ${loan.dueDate || "—"}`)
      setShowQRScanner(false)
      navigate("/library")
    } catch (err: any) {
      console.error("takeBookByQR error:", err)
      const serverData = err?.data ?? err
      let message = "Не удалось взять книгу"
      if (serverData?.message) message = serverData.message
      else if (serverData) {
        try { message = JSON.stringify(serverData) } catch { message = String(serverData) }
      }
      alert(`Ошибка: ${message}`)
      // при ошибке можно вернуть сканер для повторной попытки
      setShowQRScanner(true)
    } finally {
      setIsProcessingScan(false)
      setScannedOnce(false) // Сброс флага после обработки
    }
  }

  // Добавлено: инициализация сканера при открытии модала
  useEffect(() => {
    let mounted = true
    setScannedOnce(false) // Сброс флага при открытии модала
    if (showQRScanner && videoRef.current) {
      console.log("Starting QR scanner...")

      // жёсткая проверка secure context — камера работает только на HTTPS или localhost
      const isSecure =
        window.isSecureContext ||
        location.protocol === "https:" ||
        location.hostname === "localhost" ||
        location.hostname.startsWith("127.")
      if (!isSecure) {
        console.warn("Camera blocked: insecure context")
        alert("Камера доступна только по HTTPS или на localhost. Введите QR-токен вручную ниже.")
        // не стартуем сканер, но оставляем модал открытым для ручного ввода
        return
      }

      // подготовка video для мобильных браузеров
      try {
        videoRef.current.setAttribute("playsinline", "true")
        videoRef.current.muted = true
        // @ts-ignore
        videoRef.current.autoplay = true
      } catch {}

      // Определяем колбэк и сканер
      let scanner: QrScanner | null = null
      const onDecode = (result: QrScanner.ScanResult) => {
        if (!mounted || scannedOnce) return
        console.log("QR scanned:", result)
        setScannedOnce(true)
        // Останавливаем сканер сразу после первого скана
        try { if (scanner) scanner.stop() } catch {}
        // Сохраняем в переменную и отправляем
        handleQRScan(result.data)
      }
      scanner = new QrScanner(
        videoRef.current,
        onDecode,
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          onDecodeError: () => {
            return
          },
        }
      )
      setQrScanner(scanner)
      scanner.start().then(() => {
        console.log("QR scanner started successfully")
      }).catch((err) => {
        console.error("Failed to start QR scanner:", err)
        alert("Не удалось запустить камеру. Проверьте разрешения. Используйте ручной ввод QR.")
        // при ошибке — оставляем модал для ручного ввода
      })
    } else if (!showQRScanner && qrScanner) {
      try { qrScanner.stop() } catch {}
      setQrScanner(null)
    }

    // Очистка при размонтировании
    return () => {
      mounted = false
      if (qrScanner) {
        try { qrScanner.stop() } catch {}
      }
    }
  }, [showQRScanner])

  const handleBorrowBook = () => {
    setShowQRScanner(true)
  }

  // Открываем попап для сдачи книги по QR
  const handleReturnBook = () => {
    setShowReturnScanner(true)
  }

  const handleAdminPanel = () => {
    navigate("/admin")
  }

  // Обработчик скана для сдачи книги
  const handleReturnScan = async (data: string) => {
    console.log("handleReturnScan:", data, "user:", user)
    if (!data) return
    if (!user) {
      alert("Пользователь не авторизован. Войдите в систему.")
      return
    }
    if (isProcessingReturn) return
    setIsProcessingReturn(true)

    try {
      if (returnQrScanner) {
        try { returnQrScanner.stop() } catch {}
      }
    } catch {}

    try {
      const res = await markReturnByQR(data).unwrap()
      alert(`Запрос на возврат отправлен. Статус: ${res.status}`)
      setShowReturnScanner(false)
      navigate("/library")
    } catch (err: any) {
      console.error("markReturnByQR error:", err)
      const serverData = err?.data ?? err
      let message = "Не удалось отправить запрос на возврат"
      if (serverData?.message) message = serverData.message
      else if (serverData) {
        try { message = JSON.stringify(serverData) } catch { message = String(serverData) }
      }
      alert(`Ошибка: ${message}`)
      const status = err?.status || serverData?.status
      if (status && status >= 400 && status < 500) {
        setShowReturnScanner(true)
      }
    } finally {
      setIsProcessingReturn(false)
      setScannedReturnOnce(false)
    }
  }

  // Добавлено: инициализация сканера для возврата
  useEffect(() => {
    let mounted = true
    setScannedReturnOnce(false)
    if (showReturnScanner && returnVideoRef.current) {
      console.log("Starting return QR scanner...")

      const isSecure =
        window.isSecureContext ||
        location.protocol === "https:" ||
        location.hostname === "localhost" ||
        location.hostname.startsWith("127.")
      if (!isSecure) {
        console.warn("Camera blocked: insecure context")
        alert("Камера доступна только по HTTPS или на localhost. Введите QR-токен вручную ниже.")
        return
      }

      try {
        returnVideoRef.current.setAttribute("playsinline", "true")
        returnVideoRef.current.muted = true
        // @ts-ignore
        returnVideoRef.current.autoplay = true
      } catch {}

      let scanner: QrScanner | null = null
      const onDecode = (result: QrScanner.ScanResult) => {
        if (!mounted || scannedReturnOnce) return
        console.log("Return QR scanned:", result)
        setScannedReturnOnce(true)
        try { if (scanner) scanner.stop() } catch {}
        handleReturnScan(result.data)
      }
      scanner = new QrScanner(
        returnVideoRef.current,
        onDecode,
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          onDecodeError: () => {
            return
          },
        }
      )
      setReturnQrScanner(scanner)
      scanner.start().then(() => {
        console.log("Return QR scanner started successfully")
      }).catch((err) => {
        console.error("Failed to start return QR scanner:", err)
        alert("Не удалось запустить камеру для возврата. Проверьте разрешения. Используйте ручной ввод QR.")
      })
    } else if (!showReturnScanner && returnQrScanner) {
      try { returnQrScanner.stop() } catch {}
      setReturnQrScanner(null)
    }

    return () => {
      mounted = false
      if (returnQrScanner) {
        try { returnQrScanner.stop() } catch {}
      }
    }
  }, [showReturnScanner])

  return (
    <div className="main-page">
      <MainHeader />
      <div className="main-content">
        <div className="photo-placeholder">
          <div className="banner-container">
            <img className="banner-image" src="/images/banner.png" alt="Banner" />
          </div>
        </div>

        <div className="action-buttons">
          {user?.role?.toLowerCase() !== "admin" && (
            <>
              <button className="action-button borrow" onClick={handleBorrowBook}>
                Взять книгу
              </button>

              <button className="action-button return" onClick={handleReturnBook}>
                Сдать книгу
              </button>
            </>
          )}

          {user?.role?.toLowerCase() === "admin" && (
            <button className="action-button admin" onClick={handleAdminPanel}>
              Админ панель
            </button>
          )}
        </div>

        {showQRScanner && (
          <div className="qr-scanner-modal">
            <div className="qr-scanner-content">
              <button
                className="close-button"
                aria-label="Закрыть"
                onClick={() => {
                  try {
                    if (qrScanner) qrScanner.stop()
                  } catch {}
                  setShowQRScanner(false)
                }}
              >
                ✕
              </button>
              <h3>Сканирование QR кода</h3>
              {/* Изменено: заменяем на видео-элемент для qr-scanner */}
              <video ref={videoRef} style={{ width: "100%", height: "300px" }} />
              {/* Футер с кнопкой и текстом удалён — закрытие выполняется крестиком */}
            </div>
          </div>
        )}

        {/* Попап для сдачи книги по QR */}
        {showReturnScanner && (
          <div className="qr-scanner-modal">
            <div className="qr-scanner-content">
              <button
                className="close-button"
                aria-label="Закрыть"
                onClick={() => {
                  try { if (returnQrScanner) returnQrScanner.stop() } catch {}
                  setShowReturnScanner(false)
                }}
              >
                ✕
              </button>
              <h3>Сдать книгу — сканирование QR</h3>
              <video ref={returnVideoRef} style={{ width: "100%", height: "300px" }} />
              {/* Футер с кнопкой и текстом удалён — закрытие через крестик */}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
