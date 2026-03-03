'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/lib/supabase'
import { X } from 'lucide-react'

interface CardMeta {
  cardType: 'pokemon' | 'topps'
  isSigned: boolean
  isNumbered: boolean
  isSpecial: boolean
  numbering?: string
  images?: string[]
  purchaseDate?: string
}

interface CardModalProps {
  card: Card | null
  onClose: () => void
  onSave: (card: Partial<Card>) => void
}

export default function CardModal({ card, onClose, onSave }: CardModalProps) {
  const [name, setName] = useState('')
  const [serie, setSerie] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [cardType, setCardType] = useState<'pokemon' | 'topps'>('pokemon')
  const [isSigned, setIsSigned] = useState(false)
  const [isNumbered, setIsNumbered] = useState(false)
  const [numbering, setNumbering] = useState('')
  const [isSpecial, setIsSpecial] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [imagePreview, setImagePreview] = useState<string>('')
  const [purchaseDate, setPurchaseDate] = useState('')

  useEffect(() => {
    if (card) {
      setName(card.name)
      setSerie(card.set_name)
      setPurchasePrice(card.card_number || '')
      if (card.image_url) {
        setImages([card.image_url])
        setImagePreview(card.image_url)
      }

      if (card.notes) {
        try {
          const meta = JSON.parse(card.notes) as CardMeta
          if (meta.cardType) setCardType(meta.cardType)
          if (typeof meta.isSigned === 'boolean') setIsSigned(meta.isSigned)
          if (typeof meta.isNumbered === 'boolean') setIsNumbered(meta.isNumbered)
          if (typeof meta.isSpecial === 'boolean') setIsSpecial(meta.isSpecial)
          if (meta.numbering) setNumbering(meta.numbering)
          if (meta.purchaseDate) setPurchaseDate(meta.purchaseDate)
          if (meta.images && meta.images.length > 0) {
            setImages(meta.images)
            setImagePreview(meta.images[0])
          }
        } catch {
          // notes non JSON, on ignore
        }
      }
    }
  }, [card])

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const readers: Promise<string>[] = fileArray.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
    )

    Promise.all(readers).then((base64Images) => {
      setImages(base64Images)
      if (base64Images[0]) {
        setImagePreview(base64Images[0])
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const meta: CardMeta = {
      cardType,
      isSigned,
      isNumbered,
      isSpecial,
      numbering: isNumbered ? numbering : undefined,
      images,
      purchaseDate: purchaseDate || undefined,
    }

    const payload: Partial<Card> = {
      // champs existants de la table
      name,
      set_name: serie,
      // on réutilise card_number comme prix d'achat (en texte)
      card_number: purchasePrice,
      rarity: 'Commune',
      condition: 'Near Mint',
      quantity: 1,
      image_url: imagePreview || undefined,
      notes: JSON.stringify(meta),
    }

    onSave(payload)
  }

  const rarities = ['Commune', 'Peu commune', 'Rare', 'Ultra rare', 'Secrète']
  const conditions = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Played', 'Poor']

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-cream-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-forest-900">
            {card ? 'Modifier la carte' : 'Ajouter une carte'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-forest-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {imagePreview && (
            <div className="flex justify-center">
              <div className="w-48 h-64 bg-gradient-to-br from-cream-100 to-forest-50 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCardType('pokemon')}
                className={`flex-1 px-4 py-2 rounded-xl border text-sm font-semibold ${
                  cardType === 'pokemon'
                    ? 'bg-forest-500 text-white border-forest-500'
                    : 'bg-cream-50 text-forest-800 border-cream-200'
                }`}
              >
                Pokémon
              </button>
              <button
                type="button"
                onClick={() => setCardType('topps')}
                className={`flex-1 px-4 py-2 rounded-xl border text-sm font-semibold ${
                  cardType === 'topps'
                    ? 'bg-forest-500 text-white border-forest-500'
                    : 'bg-cream-50 text-forest-800 border-cream-200'
                }`}
              >
                Topps
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                Nom de la carte *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                placeholder="Ex: Dracaufeu"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                Série *
              </label>
              <input
                type="text"
                required
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                placeholder="Ex: Évolutions"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                Prix d&apos;achat *
              </label>
              <input
                type="number"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                placeholder="Ex: 25"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                Date d&apos;achat
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>

            {cardType === 'topps' && (
              <div className="space-y-3 border border-cream-200 rounded-xl p-4 bg-cream-50">
                <p className="text-sm font-semibold text-forest-900 mb-1">
                  Détails Topps
                </p>
                <label className="flex items-center gap-2 text-sm text-forest-800">
                  <input
                    type="checkbox"
                    checked={isSigned}
                    onChange={(e) => setIsSigned(e.target.checked)}
                    className="rounded border-cream-300 text-forest-600 focus:ring-forest-500"
                  />
                  Carte signée
                </label>
                <label className="flex items-center gap-2 text-sm text-forest-800">
                  <input
                    type="checkbox"
                    checked={isNumbered}
                    onChange={(e) => setIsNumbered(e.target.checked)}
                    className="rounded border-cream-300 text-forest-600 focus:ring-forest-500"
                  />
                  Carte numérotée
                </label>
                {isNumbered && (
                  <div className="pl-6">
                    <label className="block text-xs font-semibold text-forest-900 mb-1">
                      Numérotation
                    </label>
                    <input
                      type="text"
                      value={numbering}
                      onChange={(e) => setNumbering(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent text-sm"
                      placeholder="Ex: 12/99"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm text-forest-800">
                  <input
                    type="checkbox"
                    checked={isSpecial}
                    onChange={(e) => setIsSpecial(e.target.checked)}
                    className="rounded border-cream-300 text-forest-600 focus:ring-forest-500"
                  />
                  Carte spéciale (refractor, patch, etc.)
                </label>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                Photos (une ou plusieurs)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="block w-full text-sm text-forest-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-forest-50 file:text-forest-700 hover:file:bg-forest-100"
              />
              {images.length > 1 && (
                <p className="mt-2 text-xs text-forest-600">
                  Seule la première photo est utilisée comme visuel principal dans la grille, mais toutes sont sauvegardées dans la carte.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-cream-100 hover:bg-cream-200 text-forest-900 font-semibold rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {card ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
