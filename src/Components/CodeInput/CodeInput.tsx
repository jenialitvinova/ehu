import type React from "react"

import { useRef } from "react"
import "./CodeInput.scss"

interface CodeInputProps {
  code: string[]
  onChange: (code: string[]) => void
}

export function CodeInput({ code, onChange }: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newCode = [...code]
    newCode[index] = value
    onChange(newCode)

    // Автоматический переход к следующему полю
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="code">
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          value={digit}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={`code-digit ${index === 3 ? "active" : ""}`}
          maxLength={1}
        />
      ))}
    </div>
  )
}
