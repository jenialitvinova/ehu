import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { CodeInput } from "../../Components/CodeInput"
import { useTimer } from "../../Hooks/useTimer"
import "./VerifyEmailPage.scss"

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || "litvinova.evgeniya@student.ehu.lt"

  const [code, setCode] = useState(["3", "8", "5", ""])
  const { timeLeft, isActive, restart } = useTimer(20)

  const handleBack = () => {
    navigate("/forgot-password")
  }

  const handleCodeChange = (newCode: string[]) => {
    setCode(newCode)
  }

  

  

  const handleVerify = () => {
    const fullCode = code.join("")
    if (fullCode.length === 4) {
      console.log("Verify code:", fullCode)
      navigate("/reset-password")
    }
  }

  const handleResendCode = () => {
    console.log("Resend code to:", email)
    restart()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="verify-email">
      <div className="verify-email-content">
        <button className="back-button" onClick={handleBack}>
          ←
        </button>

        <h1 className="verify-email-title">Проверьте свою электронную почту</h1>

        <p className="verify-email-description">
          Мы отправили код на
          <br />
          {email}
        </p>

        <div className="code-section">
          <CodeInput code={code} onChange={handleCodeChange} />

          <button className="verify-button" onClick={handleVerify} disabled={code.join("").length !== 4}>
            Проверить
          </button>
        </div>

        <div className="resend-section">
          <div className="resend-text">Отправьте код еще раз</div>
          {isActive ? (
            <div className="timer">{formatTime(timeLeft)}</div>
          ) : (
            <button className="resend-button" onClick={handleResendCode}>
              Отправить
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
