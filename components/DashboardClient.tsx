"use client"

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Card } from '@/lib/supabase'
import { Search, Edit, Trash2, Grid, List, Plus, SlidersHorizontal, Trash2 as TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
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

type SortMode = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc'

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
  const [isSortOverlayOpen, setIsSortOverlayOpen] = useState(false)
  const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null)
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      console.log('[Dashboard] Check auth')
      const { data: { user: supaUser }, error } = await supabase.auth.getUser()
      console.log('[Dashboard] Auth result', { user: supaUser, error })
      if (!supaUser) {
        router.push('/auth/login')
        return
      }

      setCurrentUser(supaUser)

      if (initialCards.length === 0) {
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', supaUser.id)
          .order('created_at', { ascending: false })

        console.log('[Dashboard] Cards fetch', { cardsError, count: cardsData?.length })
        if (!cardsError && cardsData) {
          setCards(cardsData)
          setFilteredCards(cardsData)
        }
      }

      setLoadingUser(false)
    }

    checkAuthAndLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        card.series.toLowerCase().includes(term)
      )
    }

    filtered.sort((a, b) => {
      if (sortMode === 'price_desc' || sortMode === 'price_asc') {
        const pa = getPurchasePrice(a) ?? 0
        const pb = getPurchasePrice(b) ?? 0
        return sortMode === 'price_desc' ? pb - pa : pa - pb
      }

      // tri par date
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
    setSelectedCard(null)
    setIsModalOpen(true)
  }

  const handleEditCard = (card: Card) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  const requestDeleteCard = (cardId: string) => {
    setCardIdToDelete(cardId)
  }

  const performDeleteCard = async (cardId: string) => {
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

    setIsModalOpen(false)
  }

  const computeCardTotalPrice = (card: Card) => {
    const price = card.purchase_price != null ? Number(card.purchase_price) : 0
    return price * (card.quantity || 1)
  }

  const totalCards = cards.reduce((sum, card) => sum + (card.quantity || 1), 0)
  const totalSpent = cards.reduce((sum, card) => sum + computeCardTotalPrice(card), 0)
  const averagePrice = totalCards > 0 ? totalSpent / totalCards : 0

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-cream-100 to-forest-50">
        <div className="text-center space-y-4">
          <div className="text-5xl">🃏</div>
          <p className="text-forest-700 font-medium">Chargement de votre collection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-forest-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-cream-200 sticky top-0 z-40 md:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center shadow-md transform rotate-6">
                <span className="text-2xl transform -rotate-6">🃏</span>
              </div>
              <h1 className="text-2xl font-bold text-forest-900">CardMania</h1>
            </div>
            
            {currentUser && (
              <p className="text-sm text-forest-600 truncate max-w-[160px]">{currentUser.email}</p>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-24 pb-28">
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-cream-200">
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
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-3 items-stretch">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une carte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
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

              <button
                onClick={handleAddCard}
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
            </div>
          </div>
        </div>

        <div
          key={`${viewMode}-${sortMode}-${searchTerm}-${filteredCards.length}`}
          className="fade-soft"
        >
          {filteredCards.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-cream-200">
              <div className="text-6xl mb-4">🃏</div>
              <h3 className="text-2xl font-semibold text-forest-900 mb-2">
                {searchTerm ? 'Aucune carte trouvée' : 'Aucune carte dans ta collection'}
              </h3>
              <p className="text-forest-600 mb-6">
                {searchTerm 
                  ? 'Essaie de modifier tes filtres de recherche' 
                  : 'Ajoute ta première carte coup de cœur (Pokémon, Topps, etc.)'}
              </p>
              {!searchTerm && (
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
            />
          ) : (
            <CardList 
              cards={filteredCards} 
              onEdit={handleEditCard} 
              onDelete={requestDeleteCard} 
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
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 border border-cream-200 panel-slide-up-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-forest-900">
                Trier les cartes
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
          }}
          onSave={handleSaveCard}
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
                <div className="text-8xl">🃏</div>
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
                <p className="text-sm text-white/70 truncate">{previewCard.series}</p>
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
            userEmail={currentUser?.email}
            onLogout={handleLogout}
          />

          <NavbarMobile
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onAddCard={handleAddCard}
            onSearch={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' })
              setTimeout(() => searchInputRef.current?.focus(), 300)
            }}
            onLogout={handleLogout}
          />
        </>
      )}
    </div>
  )
}
