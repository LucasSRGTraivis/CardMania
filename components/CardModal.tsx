'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/lib/supabase'
import { X } from 'lucide-react'

interface CardModalProps {
  card: Card | null
  onClose: () => void
  onSave: (card: Partial<Card>) => void
}

export default function CardModal({ card, onClose, onSave }: CardModalProps) {
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
    }
  }, [card])

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
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
                Extension *
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
                Numéro de carte
              </label>
              <input
                type="text"
                value={formData.card_number}
                onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                placeholder="Ex: 11/108"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                Rareté *
              </label>
              <select
                required
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                État *
              </label>
              <select
                required
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              >
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                Quantité *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                URL de l&apos;image
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                placeholder="https://exemple.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-forest-900 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent resize-none"
                placeholder="Ajoutez des notes sur cette carte..."
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
