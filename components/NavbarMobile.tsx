'use client'

import { Grid, List, Plus, Search, LogOut } from 'lucide-react'

interface NavbarMobileProps {
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onAddCard: () => void
  onSearch: () => void
  onLogout: () => void
}

export default function NavbarMobile({
  viewMode,
  onViewModeChange,
  onAddCard,
  onSearch,
  onLogout,
}: NavbarMobileProps) {
  return (
    <nav className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center">
      <div className="w-full max-w-md px-4">
        <div className="relative bg-white/90 backdrop-blur-2xl border border-cream-300/80 rounded-full px-6 pt-2.5 pb-3 shadow-[0_22px_55px_rgba(28,59,49,0.22),0_10px_30px_rgba(28,59,49,0.12)]">
          <div className="flex items-end justify-between text-forest-600/60 text-[11px] font-medium">
            {/* Vue grille */}
            <button
              onClick={() => onViewModeChange('grid')}
              className="flex flex-col items-center gap-1 min-w-[3.5rem]"
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-forest-500 text-white shadow-md'
                    : 'text-forest-500/50 hover:bg-cream-100'
                }`}
              >
                <Grid className="w-4 h-4" />
              </div>
              <span
                className={`transition-colors ${
                  viewMode === 'grid'
                    ? 'text-forest-800'
                    : 'text-forest-500/60'
                }`}
              >
                Grille
              </span>
            </button>
 
            {/* Vue liste */}
            <button
              onClick={() => onViewModeChange('list')}
              className="flex flex-col items-center gap-1 min-w-[3.5rem]"
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-forest-500 text-white shadow-md'
                    : 'text-forest-500/50 hover:bg-cream-100'
                }`}
              >
                <List className="w-4 h-4" />
              </div>
              <span
                className={`transition-colors ${
                  viewMode === 'list'
                    ? 'text-forest-800'
                    : 'text-forest-500/60'
                }`}
              >
                Liste
              </span>
            </button>

            {/* Bouton central flottant (ajouter) */}
            <button
              onClick={onAddCard}
              className="relative flex flex-col items-center gap-1 min-w-[3.5rem] pt-2"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 text-white shadow-[0_22px_45px_rgba(28,59,49,0.55)] border-4 border-white flex items-center justify-center active:scale-95 transition-transform duration-150">
                  <Plus className="w-6 h-6" />
                </div>
              </div>
              <span className="mt-8 text-forest-800">Ajouter</span>
            </button>

            {/* Recherche */}
            <button
              onClick={onSearch}
              className="flex flex-col items-center gap-1 min-w-[3.5rem]"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-full text-forest-500/50 hover:bg-cream-100 hover:text-forest-700 transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <span className="text-forest-500/60">Recherche</span>
            </button>
 
            {/* Profil / quitter */}
            <button
              onClick={onLogout}
              className="flex flex-col items-center gap-1 min-w-[3.5rem]"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-full text-forest-500/50 hover:bg-red-50 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-forest-500/60">Quitter</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
