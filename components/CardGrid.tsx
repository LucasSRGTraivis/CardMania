'use client'

import { Card } from '@/lib/supabase'
import { Edit, Trash2, Package } from 'lucide-react'
import Image from 'next/image'

interface CardGridProps {
  cards: Card[]
  onEdit: (card: Card) => void
  onDelete: (cardId: string) => void
}

export default function CardGrid({ cards, onEdit, onDelete }: CardGridProps) {
  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      'Commune': 'bg-gray-100 text-gray-700 border-gray-300',
      'Peu commune': 'bg-green-100 text-green-700 border-green-300',
      'Rare': 'bg-blue-100 text-blue-700 border-blue-300',
      'Ultra rare': 'bg-purple-100 text-purple-700 border-purple-300',
      'Secrète': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    }
    return colors[rarity] || 'bg-gray-100 text-gray-700 border-gray-300'
  }

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      'Mint': 'text-green-600',
      'Near Mint': 'text-green-500',
      'Excellent': 'text-blue-500',
      'Good': 'text-yellow-600',
      'Played': 'text-orange-600',
      'Poor': 'text-red-600',
    }
    return colors[condition] || 'text-gray-600'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-cream-200 group"
        >
          <div className="aspect-[3/4] bg-gradient-to-br from-cream-100 to-forest-50 flex items-center justify-center relative overflow-hidden">
            {card.image_url ? (
              <Image
                src={card.image_url}
                alt={card.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="text-6xl">🃏</div>
            )}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-forest-900 shadow-md">
              ×{card.quantity}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-bold text-lg text-forest-900 line-clamp-1">
                {card.name}
              </h3>
              <p className="text-sm text-forest-600 line-clamp-1">
                {card.set_name}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-lg border font-medium ${getRarityColor(card.rarity)}`}>
                {card.rarity}
              </span>
              <span className={`font-medium ${getConditionColor(card.condition)}`}>
                {card.condition}
              </span>
            </div>

            {card.card_number && (
              <p className="text-sm text-forest-600">
                N° {card.card_number}
              </p>
            )}

            {card.notes && (
              <p className="text-sm text-forest-600 line-clamp-2 italic">
                {card.notes}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onEdit(card)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-forest-100 hover:bg-forest-200 text-forest-900 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
