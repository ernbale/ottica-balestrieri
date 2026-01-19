'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Menu, Search, Sun, Moon, Bell, User } from 'lucide-react'
import { clsx } from 'clsx'

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <h1 className="text-xl font-semibold text-foreground hidden md:block">
            {title}
          </h1>
        )}

        {/* Search - Desktop */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Cerca clienti, prodotti, ordini..."
            className="w-80 pl-10 pr-4 py-2 bg-background-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted bg-surface px-1.5 py-0.5 rounded border border-border">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search - Mobile */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors"
          aria-label={theme === 'light' ? 'Attiva dark mode' : 'Attiva light mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* User menu */}
        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-background-secondary transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="hidden md:block text-sm font-medium text-foreground">
            Admin
          </span>
        </button>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 p-4 bg-surface border-b border-border md:hidden animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Cerca..."
              autoFocus
              className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  )
}
