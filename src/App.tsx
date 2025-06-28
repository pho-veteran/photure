import { ThemeProvider } from "./components/providers/theme-provider"
import SidebarLayout from "./layouts/sidebar-layout"
import { AppRoutes } from "./routes"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SidebarLayout>
        <AppRoutes />
      </SidebarLayout>
    </ThemeProvider>
  )
}

export default App