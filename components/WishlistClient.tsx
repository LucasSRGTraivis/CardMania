'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Wish } from '@/lib/supabase'
import { Plus, Search, Trash2, Edit } from 'lucide-react'
import NavbarDesktop from './NavbarDesktop'
import NavbarMobile from './NavbarMobile'
import WishModal from './WishModal'
import ConfirmDialog from './ConfirmDialog'

export default function WishlistClient() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [filteredWishes, setFilteredWishes] = useState<Wish[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingUser, setLoadingUser] = useState(true)
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
  const [wishIdToDelete, setWishIdToDelete] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const friendIdParam = searchParams.get('friend')
  const friendNameParam = searchParams.get('friendName')
  const [viewingUserId, setViewingUserId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setCurrentUser(user)

      const targetUserId =
        friendIdParam && friendIdParam !== user.id ? friendIdParam : user.id

      setViewingUserId(targetUserId)

      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setWishes(data as Wish[])
        setFilteredWishes(data as Wish[])
      }

      setLoadingUser(false)
    }

    load()
  }, [friendIdParam, router])

  useEffect(() => {
    let result = [...wishes]
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter((wish) =>
        [wish.name, wish.series, wish.club ?? '']
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term)),
      )
    }
    setFilteredWishes(result)
  }, [searchTerm, wishes])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleAddWish = () => {
    if (isFriendView) return
    setSelectedWish(null)
    setIsModalOpen(true)
  }

  const handleEditWish = (wish: Wish) => {
    if (isFriendView) return
    setSelectedWish(wish)
    setIsModalOpen(true)
  }

  const handleSaveWish = async (data: Partial<Wish>) => {
    if (!currentUser) return

    if (isFriendView) return

    if (selectedWish) {
      const { data: updated, error } = await supabase
        .from('wishes')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', selectedWish.id)
        .select()
        .single()

      if (!error && updated) {
        setWishes((prev) => prev.map((w) => (w.id === updated.id ? (updated as Wish) : w)))
      }
    } else {
      const { data: inserted, error } = await supabase
        .from('wishes')
        .insert([{ ...data, user_id: currentUser.id }])
        .select()
        .single()

      if (!error && inserted) {
        setWishes((prev) => [inserted as Wish, ...prev])
      }
    }

    setIsModalOpen(false)
    setSelectedWish(null)
  }

  const performDeleteWish = async (id: string) => {
    if (isFriendView) return
    const { error } = await supabase.from('wishes').delete().eq('id', id)
    if (!error) {
      setWishes((prev) => prev.filter((w) => w.id !== id))
    }
  }

  const username =
    (currentUser as any)?.user_metadata?.username ??
    (currentUser as any)?.email?.split?.('@')?.[0]
  const isFriendView =
    viewingUserId !== null && currentUser && viewingUserId !== currentUser.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-forest-50">
      <NavbarDesktop userName={username} userId={currentUser?.id} onLogout={handleLogout} />

      {/* Header mobile avec logo */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-cream-200 sticky top-0 z-40 md:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 flex items-center justify-center">
                <Image
                  src="/assets/Logo.png"
                  alt="CardMania"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-forest-900">CardMania</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-24 pb-16">
        {isFriendView && (
          <div className="mb-4 rounded-xl bg-forest-900 text-cream-50 px-4 py-3 flex items-center justify-between text-sm">
            <span>
              Tu consultes la liste de souhaits de{' '}
              <span className="font-semibold">
                {friendNameParam || 'ton ami'}
              </span>
            </span>
            <button
              type="button"
              onClick={() => router.push('/souhaits')}
              className="ml-3 inline-flex items-center px-3 py-1.5 rounded-full bg-cream-50 text-forest-900 text-xs font-semibold hover:bg-cream-100"
            >
              Quitter cette vue
            </button>
          </div>
        )}
        {/* Section titre + CTA uniquement sur desktop */}
        <section className="mb-8 hidden md:block">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-cream-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {loadingUser ? (
              <>
                <div className="flex-1 space-y-2 animate-pulse">
                  <div className="h-6 sm:h-8 bg-cream-200 rounded w-2/3" />
                  <div className="h-4 bg-cream-100 rounded w-full sm:w-3/4" />
                </div>
                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="h-10 sm:h-11 bg-cream-200 rounded-xl w-full sm:w-44" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-forest-900">
                    Liste de souhaits
                  </h1>
                  <p className="text-forest-700 mt-1 text-sm sm:text-base">
                    Note ici toutes les cartes que tu rêves d&apos;ajouter un jour à ta collection.
                  </p>
                </div>
                <button
                  onClick={handleAddWish}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Ajouter un souhait</span>
                </button>
              </>
            )}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex gap-3 items-stretch">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans tes souhaits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        <section>
          {loadingUser ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-cream-200 px-4 py-3 flex items-start gap-3 animate-pulse"
                >
                  <div className="mt-1 h-9 w-9 rounded-xl bg-cream-200 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-cream-200 rounded w-3/4" />
                        <div className="h-3 bg-cream-100 rounded w-1/2" />
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="h-6 w-20 bg-cream-200 rounded-full" />
                        <div className="h-5 w-20 bg-cream-100 rounded-full" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-4 w-16 bg-cream-100 rounded-full" />
                      <div className="h-4 w-20 bg-cream-100 rounded-full" />
                    </div>
                    <div className="h-3 w-32 bg-cream-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredWishes.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-cream-200">
              <div className="flex justify-center mb-4">
                <Image
                  src="/assets/Logo.png"
                  alt="CardMania"
                  width={75}
                  height={75}
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-semibold text-forest-900 mb-2">
                {searchTerm ? 'Aucun souhait trouvé' : 'Aucun souhait pour le moment'}
              </h3>
              <p className="text-forest-600 mb-6">
                {searchTerm
                  ? 'Essaie de modifier ta recherche.'
                  : isFriendView
                    ? 'Ton ami n’a pas encore ajouté de souhait.'
                    : 'Ajoute ta première carte de rêve à suivre facilement.'}
              </p>
              {!searchTerm && !isFriendView && (
                <button
                  onClick={handleAddWish}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un souhait
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredWishes.map((wish) => (
                <article
                  key={wish.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 border border-cream-200 flex flex-col justify-between px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-forest-900 truncate">
                        {wish.name}
                      </h2>
                      <p className="text-[11px] text-forest-600 truncate">
                        {wish.series}
                      </p>
                      {wish.card_type === 'topps' && wish.club?.trim() && (
                        <p className="text-[11px] text-forest-700 truncate">
                          {wish.club.trim()}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <button
                        onClick={() => handleEditWish(wish)}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-forest-800 hover:text-forest-900 px-2 py-0.5 rounded-full bg-cream-100 hover:bg-cream-200 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => setWishIdToDelete(wish.id)}
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-red-700 hover:text-red-800 px-2 py-0.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Suppr.
                      </button>
                    </div>
                  </div>

                  <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] text-forest-700 min-h-[1.5rem]">
                    {wish.is_signed && (
                      <span className="px-2 py-0.5 rounded-full bg-forest-50 border border-forest-100">
                        Signée
                      </span>
                    )}
                    {wish.is_numbered && wish.numbering && (
                      <span className="px-2 py-0.5 rounded-full bg-forest-50 border border-forest-100">
                        {wish.numbering}
                      </span>
                    )}
                    {wish.is_special && (
                      <span className="px-2 py-0.5 rounded-full bg-forest-50 border border-forest-100">
                        Spéciale
                      </span>
                    )}
                  </div>

                  <a
                    href={wish.link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-forest-500 to-forest-600 text-[11px] font-semibold text-white shadow-sm hover:shadow-md hover:from-forest-600 hover:to-forest-700 transition-all w-full"
                  >
                    Ouvrir le lien de la carte
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <WishModal
          wish={selectedWish}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedWish(null)
          }}
          onSave={handleSaveWish}
        />
      )}

      {wishIdToDelete && (
        <ConfirmDialog
          open
          title="Supprimer ce souhait ?"
          description={
            (() => {
              const wish = wishes.find((w) => w.id === wishIdToDelete)
              if (!wish) return 'Ce souhait sera définitivement supprimé.'
              return `Le souhait "${wish.name}" (${wish.series}) sera définitivement supprimé de ta liste.`
            })()
          }
          tone="danger"
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          icon={<Trash2 className="w-6 h-6" />}
          onCancel={() => setWishIdToDelete(null)}
          onConfirm={async () => {
            if (wishIdToDelete) {
              await performDeleteWish(wishIdToDelete)
            }
            setWishIdToDelete(null)
          }}
        />
      )}

      {!isModalOpen && !wishIdToDelete && (
        <NavbarMobile
          onAdd={handleAddWish}
          onSearch={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            setTimeout(() => searchInputRef.current?.focus(), 300)
          }}
        />
      )}
    </div>
  )
}

