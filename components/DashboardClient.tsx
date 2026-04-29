"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Card } from '@/lib/supabase'
import { Search, Edit, Trash2, Grid, List, Plus, SlidersHorizontal, Trash2 as TrashIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import CardModal from './CardModal'
import CardGrid from './CardGrid'
import CardList from './CardList'
import NavbarDesktop from './NavbarDesktop'
import NavbarMobile from './NavbarMobile'
import ConfirmDialog from './ConfirmDialog'

interface DashboardClientProps {
  user?: any
  initialCards: Card[]
}

type SortMode = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc' | 'numbering_asc' | 'numbering_desc' | 'club'
const CARD_LIST_SELECT = 'id,user_id,name,series,card_type,club,purchase_price,purchase_date,is_signed,is_numbered,numbering,is_special,quantity,main_image_url,created_at,updated_at'
const CARD_DETAILS_SELECT = `${CARD_LIST_SELECT},images`

export default function DashboardClient({ user, initialCards }: DashboardClientProps) {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [filteredCards, setFilteredCards] = useState<Card[]>(initialCards)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [previewCard, setPreviewCard] = useState<Card | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortMode, setSortMode] = useState<SortMode>('date_desc')
  const [loadingUser, setLoadingUser] = useState(true)
  const [currentUser, setCurrentUser] = useState<any | null>(user ?? null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSortOverlayOpen, setIsSortOverlayOpen] = useState(false)
  const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const friendIdParam = searchParams.get('friend')
  const friendNameParam = searchParams.get('friendName')

  const parseNumberingTotal = (numbering: string | null): number | null => {
    if (!numbering?.trim()) return null
    const match = numbering.trim().match(/\/\s*(\d+)\s*$/)
    return match ? parseInt(match[1], 10) : null
  }
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [openCameraOnNextModal, setOpenCameraOnNextModal] = useState(false)
  const [viewingUserId, setViewingUserId] = useState<string | null>(null)

  const withTimeout = <T,>(promise: PromiseLike<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(timeoutMessage))
      }, timeoutMs)

      Promise.resolve(promise)
        .then((value) => {
          clearTimeout(timeoutId)
          resolve(value)
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const loadCards = useCallback(async () => {
      // Evite l'impression de "page figée" sur mobile quand le reseau est lent.
      setLoadError(null)
      setLoadingUser(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        let supaUser = session?.user ?? null

        if (!supaUser) {
          const {
            data: { user },
          } = await withTimeout(
            supabase.auth.getUser(),
            8000,
            "La session met trop de temps a se verifier. Reessaye."
          )
          supaUser = user
        }

        if (!supaUser) {
          router.push('/auth/login')
          return
        }

        setCurrentUser(supaUser)

        const targetUserId =
          friendIdParam && friendIdParam !== supaUser.id ? friendIdParam : supaUser.id

        setViewingUserId(targetUserId)

        let cardsData: Card[] | null = null
        let cardsError: { message?: string; code?: string; details?: string; hint?: string } | null = null

        for (let attempt = 1; attempt <= 2; attempt += 1) {
          const { data, error } = await withTimeout(
            supabase
              .from('cards')
              .select(CARD_LIST_SELECT)
              .eq('user_id', targetUserId)
              .order('created_at', { ascending: false }),
            12000,
            "Le chargement des cartes est trop long. Verifie ta connexion puis reessaye."
          )

          cardsData = (data as Card[] | null) ?? null
          cardsError = error

          if (!cardsError) break

          // Apres un projet Supabase en pause, la 1ere requete peut rater/lentement repondre.
          if (attempt < 2) {
            await sleep(1200)
          }
        }

        if (cardsError) {
          console.error('[Dashboard] Error loading cards', {
            message: cardsError.message,
            code: cardsError.code,
            details: cardsError.details,
            hint: cardsError.hint,
            targetUserId,
          })
          setLoadError(cardsError.message ?? "Impossible de charger tes cartes.")
          return
        }

        if (cardsData) {
          const normalizedCards = cardsData.map((card) => ({
            ...card,
            images: card.images ?? null,
          }))
          setCards(normalizedCards)
          setFilteredCards(normalizedCards)
        }
      } catch (error: any) {
        console.error('[Dashboard] Unexpected loadCards error', error)
        setLoadError(error?.message ?? "Impossible de charger tes cartes.")
      } finally {
        setLoadingUser(false)
      }
    }, [friendIdParam, router])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }

    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
    return () => window.removeEventListener('resize', updateIsMobile)
  }, [])

  const getPurchasePrice = (card: Card): number | null => {
    if (card.purchase_price == null) return null
    return Number(card.purchase_price)
  }

  const getPurchaseDate = (card: Card): Date | null => {
    if (!card.purchase_date) return null
    const d = new Date(card.purchase_date)
    if (isNaN(d.getTime())) return null
    return d
  }

  useEffect(() => {
    let filtered = [...cards]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(term) ||
        card.series.toLowerCase().includes(term) ||
        (card.club && card.club.toLowerCase().includes(term)) ||
        (card.numbering && card.numbering.toLowerCase().includes(term))
      )
    }

    filtered.sort((a, b) => {
      if (sortMode === 'price_desc' || sortMode === 'price_asc') {
        const pa = getPurchasePrice(a) ?? 0
        const pb = getPurchasePrice(b) ?? 0
        return sortMode === 'price_desc' ? pb - pa : pa - pb
      }

      if (sortMode === 'numbering_asc' || sortMode === 'numbering_desc') {
        const na = parseNumberingTotal(a.numbering)
        const nb = parseNumberingTotal(b.numbering)
        const hasA = na != null
        const hasB = nb != null
        if (!hasA && !hasB) return 0
        if (!hasA) return 1
        if (!hasB) return -1
        return sortMode === 'numbering_asc' ? na - nb : nb - na
      }

      if (sortMode === 'club') {
        const clubA = (a.club?.trim() ?? '').toLowerCase()
        const clubB = (b.club?.trim() ?? '').toLowerCase()
        const hasA = clubA.length > 0
        const hasB = clubB.length > 0
        if (!hasA && !hasB) return 0
        if (!hasA) return 1
        if (!hasB) return -1
        return clubA.localeCompare(clubB)
      }

      const da = getPurchaseDate(a)?.getTime() ?? 0
      const db = getPurchaseDate(b)?.getTime() ?? 0
      return sortMode === 'date_desc' ? db - da : da - db
    })

    setFilteredCards(filtered)
  }, [searchTerm, sortMode, cards])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleAddCard = () => {
    if (isFriendView) return
    setSelectedCard(null)
    if (isMobile) {
      setOpenCameraOnNextModal(true)
    }
    setIsModalOpen(true)
  }

  const handleEditCard = async (card: Card) => {
    if (isFriendView) return
    const { data: fullCard, error } = await supabase
      .from('cards')
      .select(CARD_DETAILS_SELECT)
      .eq('id', card.id)
      .maybeSingle()

    if (error || !fullCard) {
      setSelectedCard(card)
    } else {
      setSelectedCard(fullCard as Card)
    }

    setIsModalOpen(true)
  }

  const requestDeleteCard = (cardId: string) => {
    if (isFriendView) return
    setCardIdToDelete(cardId)
  }

  const performDeleteCard = async (cardId: string) => {
    if (isFriendView) return
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (!error) {
      setCards(cards.filter(c => c.id !== cardId))
    }
  }

  const handleSaveCard = async (cardData: Partial<Card>) => {
    if (!currentUser) {
      console.warn('[Dashboard] handleSaveCard called without user')
      return
    }

    if (isFriendView) return

      if (selectedCard) {
      const { data, error } = await supabase
        .from('cards')
        .update({ ...cardData, updated_at: new Date().toISOString() })
        .eq('id', selectedCard.id)
        .select()
        .single()

      if (!error && data) {
        setCards(cards.map(c => c.id === data.id ? data : c))
      }
    } else {
      // On vérifie d'abord si une carte identique existe déjà pour cet utilisateur (nom + série)
      const { data: existing, error: existingError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('name', cardData.name as string)
        .eq('series', cardData.series as string)
        .maybeSingle()

      if (!existingError && existing) {
        const { data: updated, error: updateError } = await supabase
          .from('cards')
          .update({
            ...cardData,
            quantity: (existing.quantity || 1) + (cardData.quantity || 1),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (!updateError && updated) {
          setCards(cards.map(c => c.id === updated.id ? updated : c))
        }
      } else {
        const { data, error } = await supabase
          .from('cards')
          .insert([{ ...cardData, user_id: currentUser.id }])
          .select()
          .single()

        if (!error && data) {
          setCards([data, ...cards])
        }
      }
    }

    setOpenCameraOnNextModal(false)
    setIsModalOpen(false)
  }

  const computeCardTotalPrice = (card: Card) => {
    const price = card.purchase_price != null ? Number(card.purchase_price) : 0
    return price * (card.quantity || 1)
  }

  const totalCards = cards.reduce((sum, card) => sum + (card.quantity || 1), 0)
  const totalSpent = cards.reduce((sum, card) => sum + computeCardTotalPrice(card), 0)
  const averagePrice = totalCards > 0 ? totalSpent / totalCards : 0
  const username =
    (currentUser as any)?.user_metadata?.username ??
    (currentUser as any)?.email?.split?.('@')?.[0]
  const isFriendView =
    viewingUserId !== null && currentUser && viewingUserId !== currentUser.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-forest-50">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-24 pb-28">
        {isFriendView && (
          <div className="mb-4 rounded-xl bg-forest-900 text-cream-50 px-4 py-3 flex items-center justify-between text-sm">
            <span>
              Tu consultes la collection de{' '}
              <span className="font-semibold">
                {friendNameParam || 'ton ami'}
              </span>
            </span>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="ml-3 inline-flex items-center px-3 py-1.5 rounded-full bg-cream-50 text-forest-900 text-xs font-semibold hover:bg-cream-100"
            >
              Quitter cette vue
            </button>
          </div>
        )}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-cream-200">
            {loadingUser ? (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 animate-pulse">
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-cream-100 to-cream-200 rounded-xl">
                  <div className="h-6 sm:h-8 bg-cream-300 rounded mb-2" />
                  <div className="h-3 bg-cream-200 rounded w-3/4 mx-auto" />
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-cream-100 to-cream-200 rounded-xl">
                  <div className="h-6 sm:h-8 bg-cream-300 rounded mb-2" />
                  <div className="h-3 bg-cream-200 rounded w-3/4 mx-auto" />
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-cream-100 to-cream-200 rounded-xl">
                  <div className="h-6 sm:h-8 bg-cream-300 rounded mb-2" />
                  <div className="h-3 bg-cream-200 rounded w-3/4 mx-auto" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-forest-50 to-forest-100 rounded-xl">
                  <p className="text-xl sm:text-3xl font-bold text-forest-900 tabular-nums">{cards.length}</p>
                  <p className="text-[11px] sm:text-sm text-forest-600 leading-tight mt-0.5">
                    <span className="sm:hidden">Cartes</span>
                    <span className="hidden sm:inline">Cartes dans la collection</span>
                  </p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-cream-100 to-cream-200 rounded-xl">
                  <p className="text-sm sm:text-3xl font-bold text-forest-900 tabular-nums truncate">
                    {totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] sm:text-sm text-forest-600 leading-tight mt-0.5">Total dépensé</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-forest-100 to-cream-100 rounded-xl">
                  <p className="text-sm sm:text-3xl font-bold text-forest-900 tabular-nums truncate">
                    {averagePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] sm:text-sm text-forest-600 leading-tight mt-0.5">
                    <span className="sm:hidden">Prix moyen</span>
                    <span className="hidden sm:inline">Prix moyen par carte</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 space-y-4">
          {loadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-red-700">
                Erreur de chargement des cartes: {loadError}
              </p>
              <button
                type="button"
                onClick={() => loadCards()}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Reessayer
              </button>
            </div>
          )}

          <div className="flex gap-3 items-stretch">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
                className="w-full pl-4 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSortOverlayOpen(true)}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm border border-cream-200 text-forest-700 shadow-sm hover:bg-cream-50 active:scale-95 transition-all"
                aria-label="Filtrer / trier"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              {/* Vue grille / liste (mobile) */}
              <div className="flex md:hidden bg-white/80 backdrop-blur-sm border border-cream-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-xs ${
                    viewMode === 'grid'
                      ? 'bg-forest-500 text-white'
                      : 'text-forest-600 hover:bg-cream-100'
                  } transition-colors`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-xs ${
                    viewMode === 'list'
                      ? 'bg-forest-500 text-white'
                      : 'text-forest-600 hover:bg-cream-100'
                  } transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden md:flex bg-white/80 backdrop-blur-sm border border-cream-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-forest-500 text-white' : 'text-forest-600 hover:bg-cream-100'} transition-colors`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 ${viewMode === 'list' ? 'bg-forest-500 text-white' : 'text-forest-600 hover:bg-cream-100'} transition-colors`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {!isFriendView && (
                <button
                  onClick={handleAddCard}
                  className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          key={`${viewMode}-${sortMode}-${searchTerm}-${filteredCards.length}`}
          className="fade-soft"
        >
          {loadingUser ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-cream-200 p-3 animate-pulse"
                >
                  <div className="aspect-[5/7] rounded-xl bg-cream-200 mb-3" />
                  <div className="h-3 bg-cream-300 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-cream-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
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
                {searchTerm
                  ? 'Aucune carte trouvée'
                  : isFriendView
                    ? 'Aucune carte dans cette collection'
                    : 'Aucune carte dans ta collection'}
              </h3>
              <p className="text-forest-600 mb-6">
                {searchTerm 
                  ? 'Essaie de modifier tes filtres de recherche' 
                  : isFriendView
                    ? 'Ton ami n’a pas encore ajouté de cartes.'
                    : 'Ajoute ta première carte coup de cœur (Pokémon, Topps, etc.)'}
              </p>
              {!searchTerm && !isFriendView && (
                <button
                  onClick={handleAddCard}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter une carte
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <CardGrid 
              cards={filteredCards} 
              onEdit={handleEditCard} 
              onDelete={requestDeleteCard}
              onPreview={(card) => setPreviewCard(card)}
              groupByClub={sortMode === 'club'}
              readOnly={isFriendView}
            />
          ) : (
            <CardList 
              cards={filteredCards} 
              onEdit={handleEditCard} 
              onDelete={requestDeleteCard}
              groupByClub={sortMode === 'club'}
              readOnly={isFriendView}
            />
          )}
        </div>
      </main>

      {isSortOverlayOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center overlay-fade-soft"
          onClick={() => setIsSortOverlayOpen(false)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 border border-cream-200 panel-slide-up-soft max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-forest-900">
                Filtrer et trier
              </h2>
              <button
                type="button"
                onClick={() => setIsSortOverlayOpen(false)}
                className="px-2 py-1 text-forest-600 hover:text-forest-900"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {([
                { value: 'date_desc', label: "Date d'achat : plus récentes" },
                { value: 'date_asc', label: "Date d'achat : plus anciennes" },
                { value: 'price_desc', label: 'Prix : du plus cher au moins cher' },
                { value: 'price_asc', label: 'Prix : du moins cher au plus cher' },
                { value: 'numbering_asc', label: 'Numérotation : du plus petit au plus grand' },
                { value: 'numbering_desc', label: 'Numérotation : du plus grand au plus petit' },
                { value: 'club', label: 'Par club' },
              ] as { value: SortMode; label: string }[]).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSortMode(option.value)
                    setIsSortOverlayOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm ${
                    sortMode === option.value
                      ? 'bg-forest-500/10 border-forest-400 text-forest-900 font-semibold'
                      : 'bg-white border-cream-200 text-forest-800 hover:bg-cream-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <CardModal
          card={selectedCard}
          onClose={() => {
            setIsModalOpen(false)
            setOpenCameraOnNextModal(false)
          }}
          onSave={handleSaveCard}
          openCameraOnMount={openCameraOnNextModal}
        />
      )}

      {previewCard && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 overlay-fade-soft"
          onClick={() => setPreviewCard(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl z-10 w-10 h-10 flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); setPreviewCard(null) }}
            aria-label="Fermer"
          >
            ×
          </button>

          <div className="max-w-[95vw] max-h-[80vh] flex items-center justify-center p-4 panel-slide-up-soft">
            {previewCard.main_image_url ? (
              <img
                src={previewCard.main_image_url}
                alt={previewCard.name}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-white/60">
                <Image
                  src="/assets/Logo.png"
                  alt="CardMania"
                  width={75}
                  height={75}
                  className="object-contain drop-shadow-2xl"
                />
                <p className="text-lg">{previewCard.name}</p>
              </div>
            )}
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-6 pt-8 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-end justify-between gap-4 max-w-lg mx-auto">
              <div className="text-white min-w-0">
                <p className="font-semibold text-lg truncate">{previewCard.name}</p>
                <p className="text-sm text-white/70 truncate">
                  {previewCard.series}
                  {previewCard.card_type === 'topps' && previewCard.club?.trim() && (
                    <span className="text-white/90"> • {previewCard.club.trim()}</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { handleEditCard(previewCard); setPreviewCard(null) }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 active:bg-white/40 text-white rounded-xl backdrop-blur-sm transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Modifier</span>
                </button>
                <button
                  onClick={() => { requestDeleteCard(previewCard.id); setPreviewCard(null) }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500/60 hover:bg-red-500/80 active:bg-red-500/90 text-white rounded-xl backdrop-blur-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cardIdToDelete && (
        <ConfirmDialog
          open
          title="Supprimer cette carte ?"
          description={
            (() => {
              const card = cards.find(c => c.id === cardIdToDelete)
              if (!card) return "Cette carte sera définitivement supprimée de ta collection."
              return `La carte "${card.name}" (${card.series}) sera définitivement supprimée de ta collection.`
            })()
          }
          tone="danger"
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          icon={<TrashIcon className="w-6 h-6" />}
          onCancel={() => setCardIdToDelete(null)}
          onConfirm={async () => {
            if (cardIdToDelete) {
              await performDeleteCard(cardIdToDelete)
            }
            setCardIdToDelete(null)
          }}
        />
      )}

      {!isModalOpen && !previewCard && !isSortOverlayOpen && (
        <>
          <NavbarDesktop
            userName={username}
            userId={currentUser?.id}
            onLogout={handleLogout}
          />

          <NavbarMobile
            onAdd={handleAddCard}
            onSearch={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              setTimeout(() => searchInputRef.current?.focus(), 300)
            }}
          />
        </>
      )}
    </div>
  )
}
