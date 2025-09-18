import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App" // Removed .tsx extension
import "./Styles/Styles.scss"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
