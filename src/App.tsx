import { ThemeProvider } from "./components/providers/theme-provider"
import { AppRoutes } from "./routes"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppRoutes />
    </ThemeProvider>
  )
}

export default App