'use client'

import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
  icon?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  tone = 'default',
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  const confirmClasses =
    tone === 'danger'
      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
      : 'bg-forest-500 hover:bg-forest-600 text-white shadow-lg hover:shadow-xl'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 overlay-fade-soft">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-cream-200 overflow-hidden panel-slide-up-soft">
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
          {icon && (
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm">
              {icon}
            </div>
          )}
          <h2 className="text-lg font-semibold text-forest-900">{title}</h2>
          {description && (
            <p className="text-sm text-forest-700 leading-relaxed">{description}</p>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-900 font-semibold transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

