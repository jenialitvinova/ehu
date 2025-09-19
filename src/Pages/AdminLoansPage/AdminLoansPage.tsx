import { useState, useRef, useEffect, useCallback } from "react"
import { MainHeader } from "../../Components/MainHeader"
import { useGetAllLoansQuery, useUpdateLoanMutation, useConfirmReturnByQRMutation } from "../../api/loansApi"
import QrScanner from "qr-scanner"  // Убедитесь, что библиотека установлена
import { extractQrToken } from "../../utils/qr"
import "./AdminLoansPage.scss"

export function AdminLoansPage() {
  const { data: loans = [], isLoading, refetch } = useGetAllLoansQuery()
  const [updateLoan, { isLoading: isUpdating }] = useUpdateLoanMutation()
  const [confirmReturn, { isLoading: isConfirming }] = useConfirmReturnByQRMutation()

  // Добавлено: состояния для QR-сканера
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [manualQR, setManualQR] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [qrScanner, setQrScanner] = useState<QrScanner | null>(null)

  const handleChangeStatus = async (loanId: number, status: string) => {
    try {
      await updateLoan({ id: loanId, loan: { status } }).unwrap()
      refetch()
    } catch (err) {
      console.error("updateLoan error:", err)
      alert("Ошибка при обновлении статуса")
    }
  }

  // Изменено: обработчик для подтверждения возврата по QR
  const handleConfirmReturn = useCallback(async (qrToken?: string, loanId?: number) => {
    try {
      if (qrToken) {
        // Вызываем POST /api/loans/qr/{qrToken}/confirm-return
        const result = await confirmReturn(qrToken).unwrap()
        alert(`Возврат подтвержден. Статус займа: ${result.status}`)
        setShowQRScanner(false)  // Закрываем сканер после успеха
        refetch()
      } else if (loanId) {
        // Альтернативный способ через PATCH (если QR не используется)
        await updateLoan({ id: loanId, loan: { status: "RETURNED" } }).unwrap()
        alert("Возврат подтвержден через ID займа")
        refetch()
      }
    } catch (err: any) {
      console.error("confirmReturn error:", err)
      const serverData = err?.data ?? err
      let message = "Ошибка подтверждения возврата"
      if (serverData?.message) message = serverData.message
      else if (serverData) {
        try { message = JSON.stringify(serverData) } catch { message = String(serverData) }
      }
      alert(`Ошибка: ${message}`)
      // При ошибке оставляем сканер открытым для повторной попытки
    }
  }, [confirmReturn, updateLoan, refetch])

  // Добавлено: обработка сканирования QR-кода
  const handleScan = useCallback((result: string | null) => {
    if (result) {
      setManualQR(result)
      handleConfirmReturn(result)
      setShowQRScanner(false)
    }
  }, [handleConfirmReturn])

  useEffect(() => {
    let qrScannerInstance: QrScanner | null = null

    if (showQRScanner && videoRef.current) {
      qrScannerInstance = new QrScanner(videoRef.current, handleScan)
      qrScannerInstance.start()
    }

    return () => {
      if (qrScannerInstance) {
        qrScannerInstance.stop()
      }
    }
  }, [showQRScanner, handleScan])

  // Добавлено: инициализация сканера при открытии модала
  useEffect(() => {
    let mounted = true
    if (showQRScanner && videoRef.current) {
      console.log("Starting QR scanner for confirm return...")

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
        videoRef.current.setAttribute("playsinline", "true")
        videoRef.current.muted = true
        // @ts-ignore
        videoRef.current.autoplay = true
      } catch {}

      const scanner = new QrScanner(
        videoRef.current,
        (result: QrScanner.ScanResult) => {
          if (!mounted) return
          console.log("QR scanned for admin confirm:", result)
          scanner.stop()
          const token = extractQrToken(result.data)
          if (token) {
            handleConfirmReturn(token)
          } else {
            setManualQR(result.data ?? "")
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          onDecodeError: () => {
            return
          },
        }
      )
      setQrScanner(scanner)
      scanner.start().catch((err) => {
        console.error("Failed to start QR scanner:", err)
        alert("Не удалось запустить камеру. Проверьте разрешения. Используйте ручной ввод QR.")
      })
    } else if (!showQRScanner && qrScanner) {
      try { qrScanner.stop() } catch {}
      setQrScanner(null)
    }

    return () => {
      mounted = false
      if (qrScanner) {
        try { qrScanner.stop() } catch {}
      }
    }
  }, [showQRScanner, handleConfirmReturn])

  // when user pastes/scans into manual input, normalize it too
  const onManualChange = (val: string) => {
    const token = extractQrToken(val)
    setManualQR(token ?? val)
  }

  if (isLoading) {
    return (
      <div className="admin-loans-page">
        <MainHeader title="Займы — админ" />
        <div className="admin-content">
          <p>Загрузка займов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-loans-page">
      <MainHeader title="Займы — админ" />
      <div className="admin-content">
        {/* Добавлено: кнопка для открытия QR-сканера */}
        <button onClick={() => setShowQRScanner(true)} style={{ marginBottom: 16, padding: "8px 12px" }}>
          Сканировать QR для подтверждения возврата
        </button>

        {/* Существующая таблица займов */}
        <table className="loans-table">
          <thead>
            <tr>
              <th>Книга</th>
              <th>Пользователь</th>
              <th>Статус</th>
              <th>QR</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.book?.title ?? "—"}</td>
                <td>{loan.user?.firstName ?? loan.user?.email ?? "—"}</td>
                <td>{loan.status}</td>
                <td>{loan.qrToken ?? "—"}</td>
                <td>
                  <button onClick={() => handleChangeStatus(loan.id, "ACTIVE")} disabled={isUpdating}>
                    Одобрить
                  </button>
                  <button onClick={() => handleChangeStatus(loan.id, "REJECTED")} disabled={isUpdating}>
                    Отклонить
                  </button>
                  <button onClick={() => handleConfirmReturn(undefined, loan.id)} disabled={isUpdating}>
                    Подтвердить возврат (по ID)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Добавлено: модал для сканирования QR */}
        {showQRScanner && (
          <div className="qr-scanner-modal" style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="qr-scanner-content" style={{ background: "white", padding: 20, borderRadius: 8, maxWidth: 400 }}>
              <h3>Сканирование QR для подтверждения возврата</h3>
              <video ref={videoRef} style={{ width: "100%", height: 300 }} />
              <div style={{ marginTop: 12 }}>
                <label style={{ display: "block", marginBottom: 4 }}>Или введите QR-токен вручную:</label>
                <input
                  type="text"
                  value={manualQR}
                  onChange={(e) => onManualChange(e.target.value)}
                  placeholder="QR-токен"
                  style={{ width: "100%", padding: "8px", marginBottom: 8 }}
                />
                <button onClick={() => handleConfirmReturn(manualQR)} disabled={isConfirming} style={{ padding: "8px 12px" }}>
                  Подтвердить возврат
                </button>
                <button onClick={() => setShowQRScanner(false)} style={{ marginLeft: 8, padding: "8px 12px" }}>
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
