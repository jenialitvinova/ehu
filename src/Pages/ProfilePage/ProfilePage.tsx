import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppSelector, useAppDispatch } from "../../store/hooks"
import { updateProfile } from "../../store/slices/authSlice"
import { MainHeader } from "../../Components/MainHeader"
import "./ProfilePage.scss"

export function ProfilePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [email, setEmail] = useState(user?.email || "")

  const handleSave = () => {
    dispatch(
      updateProfile({
        firstName,
        lastName,
        email,
      }),
    )
    navigate(-1)
  }

  return (
    <div className="profile-page">
      <MainHeader title="Профиль" showProfile={false} />
      <div className="profile-content">
        <div className="avatar-section">
          <div className="avatar-placeholder">
              <img className="camera-icon" src="/images/camera.svg" alt="Camera" />
          </div>
          <p className="avatar-text">Добавить фото</p>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label className="form-label">
              Имя <span className="required">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input"
              placeholder="Евгения Литвинова"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Фамилия <span className="required">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input"
              placeholder="Литвинова"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Студенческая почта</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="litvinova.evgeniya@student.ehu.lt"
            />
          </div>

          <button className="save-button" onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}
