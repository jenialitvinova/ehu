import { useState, useEffect, useCallback } from "react"

export function useTimer(initialTime: number) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let interval: number | null = null

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false)
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const restart = useCallback(() => {
    setTimeLeft(initialTime)
    setIsActive(true)
  }, [initialTime])

  return { timeLeft, isActive, restart }
}
