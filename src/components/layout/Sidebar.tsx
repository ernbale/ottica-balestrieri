'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  ShoppingCart,
  Briefcase,
  Calendar,
  Receipt,
  FileBarChart,
  Settings,
  Eye,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clienti', href: '/clienti', icon: Users },
  { name: 'Prescrizioni', href: '/prescrizioni', icon: Eye },
  { name: 'Magazzino', href: '/magazzino', icon: Package },
  { name: 'Ordini', href: '/ordini', icon: ShoppingCart },
  { name: 'Buste Lavoro', href: '/buste-lavoro', icon: Briefcase },
  { name: 'Appuntamenti', href: '/appuntamenti', icon: Calendar },
  { name: 'Vendite', href: '/vendite', icon: Receipt },
  { name: 'Fatture', href: '/fatture', icon: FileText },
  { name: 'Report', href: '/report', icon: FileBarChart },
]

const bottomNavigation = [
  { name: 'Impostazioni', href: '/impostazioni', icon: Settings },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'sidebar flex flex-col',
          isOpen ? 'open' : ''
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-stone-800">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">Ottica</h1>
              <p className="text-xs text-stone-400 -mt-0.5">Balestrieri</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 mb-2">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider px-3">
              Menu
            </p>
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={clsx('sidebar-item', isActive && 'active')}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom navigation */}
        <div className="border-t border-stone-800 py-4">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={clsx('sidebar-item', isActive && 'active')}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        {/* Store info */}
        <div className="p-4 border-t border-stone-800">
          <div className="px-3 py-2 rounded-lg bg-stone-800/50">
            <p className="text-xs text-stone-400">Punto Vendita</p>
            <p className="text-sm font-medium text-white truncate">Ottica Balestrieri</p>
          </div>
        </div>
      </aside>
    </>
  )
}
