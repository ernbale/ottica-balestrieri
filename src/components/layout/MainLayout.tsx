'use client'

import { useState, ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface MainLayoutProps {
  children: ReactNode
  title?: string
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="md:ml-[260px]">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
