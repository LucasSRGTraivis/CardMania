'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/lib/supabase'
import { X } from 'lucide-react'

interface CardModalProps {
  card: Card | null
  imageUrl?: string | null
  onClose: () => void
  onSave: (card: Partial<Card>) => void
}

export default function CardModal({ card, imageUrl, onClose, onSave }: CardModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    set_name: '',
    card_number: '',
    rarity: 'Commune',
    condition: 'Near Mint',
    quantity: 1,
    image_url: '',
    notes: '',
  })

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        set_name: card.set_name,
        card_number: card.card_number,
        rarity: card.rarity,
        condition: card.condition,
        quantity: card.quantity,
        image_url: card.image_url || '',
        notes: card.notes || '',
      })
    } else if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        image_url: imageUrl
      }))
    }
  }, [card, imageUrl])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
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
          {formData.image_url && (
            <div className="flex justify-center">
              <div className="w-48 h-64 bg-gradient-to-br from-cream-100 to-forest-50 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={formData.image_url}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                Nom de la carte *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                value={formData.set_name}
                onChange={(e) => setFormData({ ...formData, set_name: e.target.value })}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                placeholder="Ex: Évolutions"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                Prix d&apos;achat *
              </label>
              <input
                type="text"
                required
                value={formData.card_number}
                onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                placeholder="Ex: 25€"
              />
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
