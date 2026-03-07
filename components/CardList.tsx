'use client'

import { Fragment } from 'react'
import { Card } from '@/lib/supabase'
import { Edit, Trash2 } from 'lucide-react'

interface CardListProps {
  cards: Card[]
  onEdit: (card: Card) => void
  onDelete: (cardId: string) => void
  groupByClub?: boolean
}

function CardRow({
  card,
  onEdit,
  onDelete,
  getPrice,
}: {
  card: Card
  onEdit: (card: Card) => void
  onDelete: (cardId: string) => void
  getPrice: (card: Card) => number | null
}) {
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
  if (card.is_numbered) bits.push(card.numbering ? `${card.numbering}` : 'Numérotée')
  if (card.is_special) bits.push('Spéciale')
  if (bits.length > 0) typeLabel = bits.join(' • ')
  const dateLabel = (() => {
    if (!card.purchase_date) return '—'
    const d = new Date(card.purchase_date)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  })()

  return (
    <div className="px-3 py-2.5 flex gap-2.5 items-start min-w-0">
      {card.main_image_url && (
        <div className="w-12 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-cream-100 to-forest-50 shrink-0">
          <img src={card.main_image_url} alt={card.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-semibold text-forest-900 truncate leading-tight">{card.name}</p>
        <p className="text-[11px] text-forest-600 truncate leading-tight">{card.series}</p>
        {card.card_type === 'topps' && card.club?.trim() && (
          <p className="text-[11px] text-forest-700 leading-tight">{card.club.trim()}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-forest-600 leading-tight">
          <span className="font-medium text-forest-800">{priceLabel}</span>
          <span className="text-cream-500">·</span>
          <span>{dateLabel}</span>
          {typeLabel !== '—' && (
            <>
              <span className="text-cream-500">·</span>
              <span className="break-words">{typeLabel}</span>
            </>
          )}
        </div>
        <div className="flex gap-1.5 pt-1">
          <button
            onClick={() => onEdit(card)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-forest-100 text-forest-900 text-[10px] font-medium hover:bg-forest-200 transition-colors"
          >
            <Edit className="w-3 h-3 shrink-0" />
            Modifier
          </button>
          <button
            onClick={() => onDelete(card.id)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 text-[10px] font-medium hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3 shrink-0" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CardList({ cards, onEdit, onDelete, groupByClub }: CardListProps) {
  const getPrice = (card: Card): number | null => {
    if (card.purchase_price == null) return null
    return Number(card.purchase_price)
  }

  const groups: { clubLabel: string; cards: Card[] }[] = groupByClub
    ? (() => {
        const map = new Map<string, Card[]>()
        for (const card of cards) {
          const label = card.club?.trim() || 'Sans club'
          if (!map.has(label)) map.set(label, [])
          map.get(label)!.push(card)
        }
        return Array.from(map.entries())
          .sort(([a], [b]) => (a === 'Sans club' ? 1 : b === 'Sans club' ? -1 : a.localeCompare(b)))
          .map(([clubLabel, cardsInGroup]) => ({ clubLabel, cards: cardsInGroup }))
      })()
    : [{ clubLabel: '', cards }]

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-cream-200">
      {/* Vue compacte pour mobile : cartes empilées */}
      <div className="md:hidden divide-y divide-cream-200">
        {groups.map(({ clubLabel, cards: groupCards }) => (
          <div key={clubLabel || 'all'}>
            {groupByClub && (
              <div className="px-3 py-2 bg-forest-100 border-b border-cream-200">
                <p className="text-sm font-semibold text-forest-900">{clubLabel}</p>
              </div>
            )}
            {groupCards.map((card) => (
              <CardRow key={card.id} card={card} onEdit={onEdit} onDelete={onDelete} getPrice={getPrice} />
            ))}
          </div>
        ))}
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
              <th className="px-6 py-4 text-right text-sm font-semibold text-forest-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {groups.map(({ clubLabel, cards: groupCards }) => (
              <Fragment key={clubLabel || 'all'}>
                {groupByClub && (
                  <tr className="bg-forest-100">
                    <td colSpan={5} className="px-6 py-2 text-sm font-semibold text-forest-900">
                      {clubLabel}
                    </td>
                  </tr>
                )}
                {groupCards.map((card) => (
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
                        if (card.is_numbered) bits.push(card.numbering ? `${card.numbering}` : 'Numérotée')
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
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
