'use client'

import { Card } from '@/lib/supabase'
import { Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface CardListProps {
  cards: Card[]
  onEdit: (card: Card) => void
  onDelete: (cardId: string) => void
}

export default function CardList({ cards, onEdit, onDelete }: CardListProps) {
  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      'Commune': 'bg-gray-100 text-gray-700',
      'Peu commune': 'bg-green-100 text-green-700',
      'Rare': 'bg-blue-100 text-blue-700',
      'Ultra rare': 'bg-purple-100 text-purple-700',
      'Secrète': 'bg-yellow-100 text-yellow-700',
    }
    return colors[rarity] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-cream-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-forest-100 border-b border-cream-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">Nom</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">Extension</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">N°</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">Rareté</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">État</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-forest-900">Quantité</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-forest-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-cream-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 bg-gradient-to-br from-cream-100 to-forest-50 rounded-lg flex items-center justify-center text-2xl relative overflow-hidden">
                      {card.image_url ? (
                        <Image
                          src={card.image_url}
                          alt={card.name}
                          fill
                          className="object-cover rounded-lg"
                          sizes="48px"
                        />
                      ) : (
                        '🃏'
                      )}
                    </div>
                    <span className="font-medium text-forest-900">{card.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-forest-600">{card.set_name}</td>
                <td className="px-6 py-4 text-sm text-forest-600">{card.card_number || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRarityColor(card.rarity)}`}>
                    {card.rarity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-forest-600">{card.condition}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block bg-forest-100 text-forest-900 px-3 py-1 rounded-full text-sm font-semibold">
                    {card.quantity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(card)}
                      className="p-2 bg-forest-100 hover:bg-forest-200 text-forest-900 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(card.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
