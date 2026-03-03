'use client'

import { Card } from '@/lib/supabase'
import { Edit, Trash2 } from 'lucide-react'

interface CardGridProps {
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

export default function CardGrid({ cards, onEdit, onDelete }: CardGridProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-cream-200 group"
        >
          <div className="aspect-[3/4] bg-gradient-to-br from-cream-100 to-forest-50 flex items-center justify-center relative overflow-hidden">
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={card.name}
                className="w-full h-full object-cover"
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

            {(() => {
              const meta = parseMeta(card)
              if (!meta) return null
              const chips: string[] = []
              if (meta.cardType === 'pokemon') chips.push('Pokémon')
              if (meta.cardType === 'topps') chips.push('Topps')
              if (meta.isSigned) chips.push('Signée')
              if (meta.isNumbered) chips.push(meta.numbering ? `Numérotée ${meta.numbering}` : 'Numérotée')
              if (meta.isSpecial) chips.push('Spéciale')
              if (chips.length === 0) return null
              return (
                <div className="flex flex-wrap gap-2 text-xs">
                  {chips.map((label) => (
                    <span
                      key={label}
                      className="px-2 py-1 rounded-full bg-forest-50 text-forest-800 border border-forest-100"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )
            })()}

            <p className="text-sm text-forest-700 font-semibold">
              {(() => {
                const price = getPrice(card)
                if (price == null) return 'Prix : —'
                return `Prix : ${price.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 2,
                })}`
              })()}
            </p>

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
