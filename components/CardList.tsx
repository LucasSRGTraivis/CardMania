'use client'

import { Card } from '@/lib/supabase'
import { Edit, Trash2 } from 'lucide-react'

interface CardListProps {
  cards: Card[]
  onEdit: (card: Card) => void
  onDelete: (cardId: string) => void
}

export default function CardList({ cards, onEdit, onDelete }: CardListProps) {
  const getPrice = (card: Card): number | null => {
    if (card.purchase_price == null) return null
    return Number(card.purchase_price)
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-cream-200">
      {/* Vue compacte pour mobile : cartes empilées */}
      <div className="md:hidden divide-y divide-cream-200">
        {cards.map((card) => {
          const price = getPrice(card)
          const priceLabel =
            price == null
              ? '—'
              : price.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 2,
                })

          let typeLabel = '—'
          const bits: string[] = []
          if (card.card_type === 'pokemon') bits.push('Pokémon')
          if (card.card_type === 'topps') bits.push('Topps')
          if (card.is_signed) bits.push('Signée')
          if (card.is_numbered) bits.push(card.numbering ? `Numérotée ${card.numbering}` : 'Numérotée')
          if (card.is_special) bits.push('Spéciale')
          if (bits.length > 0) typeLabel = bits.join(' • ')

          const dateLabel = (() => {
            if (!card.purchase_date) return '—'
            const d = new Date(card.purchase_date)
            if (isNaN(d.getTime())) return '—'
            return d.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          })()

          return (
            <div key={card.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-forest-900 truncate">{card.name}</p>
                  <p className="text-xs text-forest-600 truncate">{card.series}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-xs font-semibold">
                  x{card.quantity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-forest-700">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-forest-500">Prix</p>
                  <p className="font-medium">{priceLabel}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-forest-500">Date d&apos;achat</p>
                  <p className="font-medium">{dateLabel}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] uppercase tracking-wide text-forest-500">Type</p>
                  <p className="font-medium">{typeLabel}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => onEdit(card)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-forest-100 text-forest-900 text-xs font-medium hover:bg-forest-200 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(card.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vue tableau pour desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-forest-100 border-b border-cream-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">Nom</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">Prix</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-forest-900">Date d&apos;achat</th>
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
                    <span className="text-xs text-forest-600">{card.series}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-forest-600">
                  {(() => {
                    const bits: string[] = []
                    if (card.card_type === 'pokemon') bits.push('Pokémon')
                    if (card.card_type === 'topps') bits.push('Topps')
                    if (card.is_signed) bits.push('Signée')
                    if (card.is_numbered) bits.push(card.numbering ? `Numérotée ${card.numbering}` : 'Numérotée')
                    if (card.is_special) bits.push('Spéciale')
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
                <td className="px-6 py-4 text-sm text-forest-600">
                  {(() => {
                    if (!card.purchase_date) return '—'
                    const d = new Date(card.purchase_date)
                    if (isNaN(d.getTime())) return '—'
                    return d.toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
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
