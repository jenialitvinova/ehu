import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://library-backend-app-chhrddcxavgvf2c6.polandcentral-01.azurewebsites.net",
        changeOrigin: true,
        secure: true,
      },
      "/auth": {
        target: "https://library-backend-app-chhrddcxavgvf2c6.polandcentral-01.azurewebsites.net",
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
