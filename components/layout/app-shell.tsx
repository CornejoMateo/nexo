"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useStore } from "@/lib/store"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { isDarkMode, sidebarOpen } = useStore()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pb-20 transition-all duration-300 md:pb-0",
          sidebarOpen ? "md:pl-64" : "md:pl-16"
        )}
      >
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
