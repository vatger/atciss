import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./app/store"
import "./index.css"
import { ThemeUIProvider } from "theme-ui"
import { theme } from "./app/theme"
import { App } from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeUIProvider theme={theme}>
        <App />
      </ThemeUIProvider>
    </Provider>
  </React.StrictMode>,
)
