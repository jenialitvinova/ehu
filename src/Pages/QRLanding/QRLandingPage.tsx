import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useAppSelector } from "../../store/hooks"
import { useGetQRBookStatusQuery } from "../../api/qrApi"
import { useTakeBookByQRMutation, useMarkReturnByQRMutation } from "../../api/loansApi"
import "./QRLandingPage.scss"
import { useEffect } from "react"


export function QRLandingPage() {
  const location = useLocation()
  const { qrToken } = useParams<{ qrToken: string }>()
  const navigate = useNavigate()
  const { user } = useAppSelector((s) => s.auth)
  // если не авторизован — редиректим на /login и сохраняем текущий путь в state.from
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: location }, replace: true })
    }
  }, [user, navigate, location])

  const { data, isLoading, error } = useGetQRBookStatusQuery(qrToken ?? "", { skip: !qrToken })
  const [takeBookByQR, { isLoading: taking }] = useTakeBookByQRMutation()
  const [markReturnByQR, { isLoading: marking }] = useMarkReturnByQRMutation()

  const close = () => navigate("/", { replace: true })

  const handleTake = async () => {
    if (!qrToken) return
    try {
      await takeBookByQR(qrToken).unwrap()
      alert("Книга выдана")
      navigate("/library")
    } catch (err: any) {
      alert(err?.data?.message || "Ошибка взятия книги")
    }
  }

  const handleReturn = async () => {
    if (!qrToken) return
    try {
      await markReturnByQR(qrToken).unwrap()
      alert("Запрос на возврат отправлен")
      navigate("/library")
    } catch (err: any) {
      alert(err?.data?.message || "Ошибка возврата")
    }
  }

  return (
    <div className="qr-landing-page">
      <div className="qr-scanner-modal">
        <div className="qr-scanner-content">
          <button className="close-button" aria-label="Закрыть" onClick={close}>✕</button>

          {isLoading && <div>Загрузка...</div>}
          {error && <div>Не удалось получить информацию по QR</div>}

          {!isLoading && data && (
            <>
              <h3>{data.title ?? "Книга"}</h3>
              <p>{data.author ?? ""} {data.year ? `• ${data.year}` : ""}</p>
              <p style={{ color: "#374151", fontSize: 14 }}>{data.status ? `Статус: ${data.status}` : ""}</p>

              {/* Для админа действий нет */}
              {user?.role?.toLowerCase() === "admin" ? (
                <div style={{ marginTop: 12 }}>Администратор не может брать/сдавать книги через эту страницу</div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {data.canBorrow && (
                    <button className="close-scanner" onClick={handleTake} disabled={taking}>
                      {taking ? "Обработка..." : "Взять книгу"}
                    </button>
                  )}
                  {data.mine && (
                    <button className="close-scanner" onClick={handleReturn} disabled={marking}>
                      {marking ? "Обработка..." : "Сдать книгу"}
                    </button>
                  )}
                  {!data.canBorrow && !data.mine && (
                    <div style={{ color: "#666" }}>{data.pendingReturn ? "Книга ожидает возврата" : "Нельзя взять/сдать эту книгу"}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
