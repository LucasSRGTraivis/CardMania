'use client'

import { Card } from '@/lib/supabase'
import { Edit, Trash2 } from 'lucide-react'

interface CardListProps {
  cards: Card[]
  onEdit: (card: Card) => void
  onDelete: (cardId: string) => void
}

type CardMeta = {
  cardType?: 'pokemon' | 'topps'
  isSigned?: boolean
  isNumbered?: boolean
  isSpecial?: boolean
  numbering?: string
}

export default function CardList({ cards, onEdit, onDelete }: CardListProps) {
  const parseMeta = (card: Card): CardMeta | null => {
    try {
      if (!card.notes) return null
      return JSON.parse(card.notes) as CardMeta
    } catch {
      return null
    }
  }

  const getPrice = (card: Card): number | null => {
    const raw = (card.card_number || '').toString().replace(',', '.')
    const numeric = parseFloat(raw.replace(/[^0-9.]/g, ''))
    if (Number.isNaN(numeric)) return null
    return numeric
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-cream-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-forest-100 border-b border-cream-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">Nom</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">Prix</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-forest-900">Quantité</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-forest-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {cards.map((card) => (
              <tr key={card.id} className="hover:bg-cream-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-forest-900">{card.name}</span>
                    <span className="text-xs text-forest-600">{card.set_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-forest-600">
                  {(() => {
                    const meta = parseMeta(card)
                    if (!meta) return '—'
                    const bits: string[] = []
                    if (meta.cardType === 'pokemon') bits.push('Pokémon')
                    if (meta.cardType === 'topps') bits.push('Topps')
                    if (meta.isSigned) bits.push('Signée')
                    if (meta.isNumbered) bits.push(meta.numbering ? `Numérotée ${meta.numbering}` : 'Numérotée')
                    if (meta.isSpecial) bits.push('Spéciale')
                    if (bits.length === 0) return '—'
                    return bits.join(' • ')
                  })()}
                </td>
                <td className="px-6 py-4 text-sm text-forest-600">
                  {(() => {
                    const price = getPrice(card)
                    if (price == null) return '—'
                    return price.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 2,
                    })
                  })()}
                </td>
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
