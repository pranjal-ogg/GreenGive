'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Reports', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/draw', label: 'Draw Management', icon: '🎰' },
  { href: '/admin/charities', label: 'Charities', icon: '💚' },
  { href: '/admin/winners', label: 'Winners', icon: '🏆' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
          <div>
            <p className="font-bold text-white text-sm">Admin Panel</p>
            <p className="text-slate-500 text-xs">Digital Horse</p>
          </div>
        </div>
      </div>

      <nav className="flex-grow p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all">
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </aside>
  )
}
