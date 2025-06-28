import * as React from "react"
import {
  Images,
  Trash2,
  UserRound,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { AppLogo } from "./ui/app-logo"
import { ThemeToggle } from "./theme-toggle"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navs: [
    {
      name: "Albums",
      url: "/albums",
      icon: Images,
    },
    {
      name: "Peoples",
      url: "/peoples",
      icon: UserRound,
    },
    {
      name: "Trash",
      url: "/trash",
      icon: Trash2,
    }

  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <AppLogo />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain navs={data.navs} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
