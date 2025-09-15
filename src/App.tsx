import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "./store/store"
import "./Styles/Styles.scss"
import { AppRoutes } from "./Routes/AppRoutes"

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="app">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </Provider>
  )
}

export default App
