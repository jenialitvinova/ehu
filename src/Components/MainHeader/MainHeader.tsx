import { useNavigate } from "react-router-dom"
import "./MainHeader.scss"

interface MainHeaderProps {
  title?: string
  showBack?: boolean
  showHome?: boolean
  showProfile?: boolean
  onBack?: () => void
  onHome?: () => void
  onProfile?: () => void
}

export function MainHeader({
  title,
  showBack = true,
  showHome = true,
  showProfile = true,
  onBack,
  onHome,
  onProfile,
}: MainHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="main-header">
      {showBack && (
        <button className="main-back-button" onClick={onBack ?? (() => navigate(-1))}>
          ←
        </button>
      )}
      {title && <h1 className="main-title">{title}</h1>}
      <div className="header-icons">
        {showHome && (
          <button className="home-icon" onClick={onHome ?? (() => navigate("/main"))}>
            <img src="/images/home.svg" alt="IEHUI Library" />
          </button>
        )}
        {showProfile && (
          <button className="profile-icon" onClick={onProfile ?? (() => navigate("/profile"))}>
            <img src="/images/profile.svg" alt="Profile" />
          </button>
        )}
      </div>
    </div>
  )
}
