'use client'

import { LogOut } from 'lucide-react'

interface NavbarDesktopProps {
  userEmail?: string
  onLogout: () => void
}

export default function NavbarDesktop({ userEmail, onLogout }: NavbarDesktopProps) {
  return (
    <nav className="hidden md:block fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-sm border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center shadow-md transform rotate-6">
              <span className="text-2xl transform -rotate-6">🃏</span>
            </div>
            <h1 className="text-2xl font-bold text-forest-900 tracking-tight">
              CardMania
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-forest-700 truncate max-w-xs">
                {userEmail}
              </span>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-900 text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

