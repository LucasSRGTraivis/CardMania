'use client'

import { useRouter, usePathname } from 'next/navigation'
import { LayoutGrid, Heart, Plus, Search, Users } from 'lucide-react'

interface NavbarMobileProps {
  onAdd: () => void
  onSearch: () => void
}

export default function NavbarMobile({
  onAdd,
  onSearch,
}: NavbarMobileProps) {
  const router = useRouter()
  const pathname = usePathname()

  const onDashboard = pathname?.startsWith('/dashboard')
  const onWishlist = pathname === '/souhaits'

  return (
    <nav className="md:hidden fixed bottom-4 inset-x-0 z-40 flex justify-center">
      <div className="w-full max-w-md px-4">
        <div className="relative bg-white/90 backdrop-blur-2xl border border-cream-300/80 rounded-full px-6 pt-2.5 pb-3 shadow-[0_22px_55px_rgba(28,59,49,0.22),0_10px_30px_rgba(28,59,49,0.12)]">
          <div className="flex items-end justify-between text-forest-600/60 text-[11px] font-medium">
            {/* Collection */}
            <button
              onClick={() => router.push('/dashboard')}
              className="flex flex-col items-center gap-1 min-w-[3.5rem]"
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
                  onDashboard
                    ? 'bg-forest-500 text-white shadow-md'
                    : 'text-forest-500/50 hover:bg-cream-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </div>
              <span
                className={`transition-colors ${
                  onDashboard ? 'text-forest-800' : 'text-forest-500/60'
                }`}
              >
                Collection
              </span>
            </button>

            {/* Souhaits */}
            <button
              onClick={() => router.push('/souhaits')}
              className="flex flex-col items-center gap-1 min-w-[3.5rem]"
            >
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 ${
                  onWishlist
                    ? 'bg-forest-500 text-white shadow-md'
                    : 'text-forest-500/50 hover:bg-cream-100'
                }`}
              >
                <Heart className="w-4 h-4" />
              </div>
              <span
                className={`transition-colors ${
                  onWishlist ? 'text-forest-800' : 'text-forest-500/60'
                }`}
              >
                Souhaits
              </span>
            </button>

            {/* Bouton central flottant (ajouter) */}
            <button
              onClick={onAdd}
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

            {/* Amis */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('cardmania:openFriends'))
                }
              }}
              className="flex flex-col items-center gap-1 min-w-[3.5rem]"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-full text-forest-500/50 hover:bg-cream-100 hover:text-forest-700 transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-forest-500/60">Amis</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
