'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Card } from '@/lib/supabase'
import { Plus, LogOut, Search, Filter, Grid, List, Upload, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CardModal from './CardModal'
import CardGrid from './CardGrid'
import CardList from './CardList'

interface DashboardClientProps {
  user: any
  initialCards: Card[]
}

export default function DashboardClient({ user, initialCards }: DashboardClientProps) {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [filteredCards, setFilteredCards] = useState<Card[]>(initialCards)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterRarity, setFilterRarity] = useState<string>('all')
  const [isDragging, setIsDragging] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      console.log('[Dashboard] Check auth')
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('[Dashboard] Auth result', { user, error })
      if (!user) {
        router.push('/auth/login')
        return
      }

      if (initialCards.length === 0) {
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', user.id)
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

  useEffect(() => {
    let filtered = cards

    if (searchTerm) {
      filtered = filtered.filter(card =>
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.set_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterRarity !== 'all') {
      filtered = filtered.filter(card => card.rarity === filterRarity)
    }

    setFilteredCards(filtered)
  }, [searchTerm, filterRarity, cards])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleAddCard = () => {
    setSelectedCard(null)
    setSelectedImage(null)
    setIsModalOpen(true)
  }

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result as string)
      setIsModalOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleEditCard = (card: Card) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return

    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (!error) {
      setCards(cards.filter(c => c.id !== cardId))
    }
  }

  const handleSaveCard = async (cardData: Partial<Card>) => {
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
      const { data, error } = await supabase
        .from('cards')
        .insert([{ ...cardData, user_id: user.id }])
        .select()
        .single()

      if (!error && data) {
        setCards([data, ...cards])
      }
    }

    setIsModalOpen(false)
  }

  const rarities = ['Commune', 'Peu commune', 'Rare', 'Ultra rare', 'Secrète']
  const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0)

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
      <nav className="bg-white/80 backdrop-blur-sm border-b border-cream-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center shadow-md transform rotate-6">
                <span className="text-2xl transform -rotate-6">🃏</span>
              </div>
              <h1 className="text-2xl font-bold text-forest-900">CardMania</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-forest-600">Bienvenue,</p>
                <p className="text-sm font-semibold text-forest-900">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-forest-100 hover:bg-forest-200 text-forest-900 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-cream-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-forest-50 to-forest-100 rounded-xl">
                <p className="text-3xl font-bold text-forest-900">{cards.length}</p>
                <p className="text-sm text-forest-600">Cartes uniques</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-cream-100 to-cream-200 rounded-xl">
                <p className="text-3xl font-bold text-forest-900">{totalCards}</p>
                <p className="text-sm text-forest-600">Total en collection</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-forest-100 to-cream-100 rounded-xl">
                <p className="text-3xl font-bold text-forest-900">{new Set(cards.map(c => c.set_name)).size}</p>
                <p className="text-sm text-forest-600">Extensions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une carte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              >
                <option value="all">Toutes les raretés</option>
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>

              <div className="flex bg-white/80 backdrop-blur-sm border border-cream-200 rounded-xl overflow-hidden">
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
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
            </div>
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 ${isDragging ? 'border-forest-500 bg-forest-50' : 'border-cream-200'} border-dashed transition-all`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-6xl mb-4">🃏</div>
            <h3 className="text-2xl font-semibold text-forest-900 mb-2">
              {searchTerm || filterRarity !== 'all' ? 'Aucune carte trouvée' : 'Aucune carte dans votre collection'}
            </h3>
            <p className="text-forest-600 mb-6">
              {searchTerm || filterRarity !== 'all' 
                ? 'Essayez de modifier vos filtres de recherche' 
                : 'Glissez une image ici ou prenez une photo'}
            </p>
            {!searchTerm && filterRarity === 'all' && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Upload className="w-5 h-5" />
                  <span className="hidden sm:inline">Choisir une image</span>
                  <span className="sm:hidden">Photo/Image</span>
                </button>
                <button
                  onClick={handleAddCard}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-cream-50 text-forest-900 font-semibold rounded-xl border-2 border-forest-200 hover:border-forest-400 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter manuellement
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <CardGrid 
            cards={filteredCards} 
            onEdit={handleEditCard} 
            onDelete={handleDeleteCard} 
          />
        ) : (
          <CardList 
            cards={filteredCards} 
            onEdit={handleEditCard} 
            onDelete={handleDeleteCard} 
          />
        )}
      </main>

      {isModalOpen && (
        <CardModal
          card={selectedCard}
          imageUrl={selectedImage}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedImage(null)
          }}
          onSave={handleSaveCard}
        />
      )}
    </div>
  )
}
