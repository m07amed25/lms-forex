"use client";

import * as React from "react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ListIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Courses",
      url: "/admin/courses",
      icon: <ListIcon />,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: <UsersIcon />,
    },
  ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link className="flex items-center gap-2.5" href="/">
                <div className="flex size-9 items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="logo"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground/90">
                  Forex<span className="text-foreground">With</span>
                  <span className="mx-[2px] text-primary">.</span>
                  <span className="bg-linear-to-tr from-primary to-primary/60 bg-clip-text font-extrabold text-transparent">
                    Salma
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
