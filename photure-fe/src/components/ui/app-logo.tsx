import { Camera } from "lucide-react"

import { SidebarMenuButton } from "./sidebar"

export function AppLogo() {

  return (
    <SidebarMenuButton
      size="lg"
      className="group relative data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
      onClick={() => window.location.href = "/"}
    >
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
        <Camera className="size-4 group-hover:scale-110 transition-transform duration-200" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Photure
        </span>
        <span className="truncate text-xs text-muted-foreground">
          Photo Management Application
        </span>
      </div>
    </SidebarMenuButton>
  )
}