import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "../../store/hooks"
import { updateProfile, logout } from "../../store/slices/authSlice"
import { MainHeader } from "../../Components/MainHeader"
import "./ProfilePage.scss"
import { useGetMeQuery } from "../../api/authApi"
import { baseApi } from "../../api/baseApi"

export function ProfilePage() {
  const navigate = useNavigate()  // Add navigate hook
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  // get authoritative profile from server
  const { data: me, isLoading: isMeLoading } = useGetMeQuery()

  // initialize form from server response when available
  useEffect(() => {
    if (!me) return

    // Обновляем store с authoritative данными от сервера
    dispatch(
      updateProfile({
        firstName: me.firstName || "",
        lastName: me.lastName || "",
        email: me.email || "",
      }),
    )
  }, [me, dispatch])

  // Add logout handler
  const handleLogout = () => {
    console.log("Logging out...")  // Добавлено: отладка
    // Clear entire localStorage to remove all residual data
    localStorage.clear()
    console.log("localStorage cleared")  // Добавлено: отладка
    // Dispatch logout action to clear state
    dispatch(logout())
    // Reset RTK Query cache/subscriptions so old token / cached responses are cleared
    dispatch(baseApi.util.resetApiState())
    console.log("RTK Query state reset")
    console.log("Redux state cleared")  // Добавлено: отладка
    // Navigate to login page
    navigate("/login")
  }

  if (isMeLoading) {
    return (
      <div className="profile-page">
        <MainHeader title="Профиль" showProfile={false} />
        <div className="profile-content">
          <p>Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  // no local editing UI — показываем authoritative данные из /api/me
  const displayRole = (me?.role ?? user?.role ?? "USER").toString().toUpperCase()
  const displayUsername = me?.username ?? me?.login ?? me?.email ?? user?.email ?? ""
  const displayEmail = me?.email ?? user?.email ?? ""

  return (
    <div className="profile-page">
      <MainHeader title="Профиль" showProfile={false} />
      <div className="profile-content">
        <div className="avatar-section">
          {/* Всегда показываем статичную картинку студента */}
          <img src="/images/student.png" alt="student" className="avatar-image" />
        </div>

        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Роль</label>
            <div className="profile-value">{displayRole}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Ник</label>
            <div className="profile-value">{displayUsername}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Студенческая почта</label>
            <div className="profile-value">{displayEmail}</div>
          </div>
        </div>

        {/* Новая кнопка — перейти в "Моя библиотека" (скрыта для админа) */}
        {user?.role?.toLowerCase() !== "admin" && (
          <div className="library-link" style={{ marginTop: 12 }}>
            <button
              className="library-button"
              onClick={() => {
                navigate("/library")
              }}
            >
              Моя библиотека
            </button>
          </div>
        )}

        {/* Add logout button */}
        <div className="logout-section">
          <button className="logout-button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  )
}
