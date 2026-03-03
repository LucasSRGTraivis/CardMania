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
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-cream-200 group cursor-pointer"
          onClick={() => onEdit(card)}
        >
          <div className="aspect-[7/10] bg-gradient-to-br from-cream-100 to-forest-50 flex items-center justify-center relative overflow-hidden">
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={card.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl">🃏</div>
            )}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-forest-900 shadow-md">
              ×{card.quantity}
            </div>

            {/* Overlay infos au survol */}
            <div className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-full bg-gradient-to-t from-black/80 via-black/60 to-transparent px-3 py-3 space-y-1 text-xs text-white">
                <div>
                  <p className="font-semibold truncate">{card.name}</p>
                  <p className="text-[11px] text-white/80 truncate">{card.set_name}</p>
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
                    <div className="flex flex-wrap gap-1">
                      {chips.map((label) => (
                        <span
                          key={label}
                          className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px]"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )
                })()}

                <p className="text-[11px] font-semibold">
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
              </div>
            </div>
          </div>

          {/* Barre actions en bas (edit / delete) */}
          <div className="flex gap-2 p-2 border-t border-cream-200 bg-white">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(card)
              }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-forest-100 hover:bg-forest-200 text-forest-900 rounded-lg text-xs transition-colors"
            >
              <Edit className="w-3 h-3" />
              Modifier
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(card.id)
              }}
              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
