'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Wish } from '@/lib/supabase'

interface WishModalProps {
  wish: Wish | null
  onClose: () => void
  onSave: (data: Partial<Wish>) => void
}

export default function WishModal({ wish, onClose, onSave }: WishModalProps) {
  const [name, setName] = useState('')
  const [serie, setSerie] = useState('')
  const [cardType, setCardType] = useState<'pokemon' | 'topps'>('pokemon')
  const [club, setClub] = useState('')
  const [isSigned, setIsSigned] = useState(false)
  const [isNumbered, setIsNumbered] = useState(false)
  const [numbering, setNumbering] = useState('')
  const [isSpecial, setIsSpecial] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  useEffect(() => {
    if (!wish) return

    setName(wish.name)
    setSerie(wish.series)
    setCardType(wish.card_type)
    setClub(wish.club ?? '')
    setIsSigned(wish.is_signed)
    setIsNumbered(wish.is_numbered)
    setNumbering(wish.numbering ?? '')
    setIsSpecial(wish.is_special)
    setLinkUrl(wish.link_url)
  }, [wish])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload: Partial<Wish> = {
      name,
      series: serie,
      card_type: cardType,
      club: cardType === 'topps' && club.trim() ? club.trim() : null,
      is_signed: isSigned,
      is_numbered: isNumbered,
      numbering: isNumbered ? numbering || null : null,
      is_special: isSpecial,
      link_url: linkUrl.trim(),
    }

    onSave(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center sm:justify-center sm:p-4 z-50 overlay-fade-soft">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto panel-slide-up-soft">
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-cream-300 rounded-full" />
        </div>

        <div className="sticky top-0 bg-white border-b border-cream-200 px-6 py-4 flex items-center justify-between sm:rounded-t-2xl">
          <h2 className="text-2xl font-bold text-forest-900">
            {wish ? 'Modifier le souhait' : 'Ajouter un souhait'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-forest-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                Topps / Panini
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

            {cardType === 'topps' && (
              <div className="space-y-3 border border-cream-200 rounded-xl p-4 bg-cream-50">
                <p className="text-sm font-semibold text-forest-900 mb-1">
                  Détails
                </p>
                <div>
                  <label className="block text-xs font-semibold text-forest-900 mb-1">
                    Club
                  </label>
                  <input
                    type="text"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-cream-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent text-sm"
                    placeholder="Ex: Marseille, PSG, Real Madrid..."
                  />
                </div>
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
                Lien vers l&apos;annonce / le visuel *
              </label>
              <input
                type="url"
                required
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                placeholder="https://..."
              />
              <p className="mt-1 text-xs text-forest-600">
                Tu peux coller un lien CardMarket, eBay, Google Images, YouTube, etc.
              </p>
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
              {wish ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

