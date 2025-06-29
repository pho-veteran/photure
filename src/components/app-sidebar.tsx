import * as React from "react"
import {
  Images,
  Trash2,
  UserRound,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { AppLogo } from "./ui/app-logo"
import { ThemeToggle } from "./theme-toggle"
import { UserButton } from "@clerk/clerk-react"

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
      url: "/",
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
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

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
        {!isCollapsed && (
          <SidebarMenu className="mt-4 mb-2">
            <SidebarMenuItem
              className="justify-center flex items-center bg-neutral-200 p-2 rounded-md"
            >
              <UserButton showName={true} />
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain navs={data.navs} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
