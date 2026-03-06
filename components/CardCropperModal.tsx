'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Check } from 'lucide-react'

interface CardCropperModalProps {
  image: string
  onCancel: () => void
  onConfirm: (croppedDataUrl: string) => void
}

interface Point {
  x: number
  y: number
}

export default function CardCropperModal({ image, onCancel, onConfirm }: CardCropperModalProps) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const imgElRef = useRef<HTMLImageElement | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null)
  const [baseScale, setBaseScale] = useState(1)
  const [scale, setScale] = useState(1.1)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const dragStartRef = useRef<{ pointerId: number; startPoint: Point; startOffset: Point } | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = image
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
      if (frameRef.current) {
        const { clientWidth, clientHeight } = frameRef.current
        setFrameSize({ width: clientWidth, height: clientHeight })
        const base = Math.max(clientWidth / img.naturalWidth, clientHeight / img.naturalHeight)
        setBaseScale(base)
      }
    }
  }, [image])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!frameRef.current) return
    frameRef.current.setPointerCapture(e.pointerId)
    dragStartRef.current = {
      pointerId: e.pointerId,
      startPoint: { x: e.clientX, y: e.clientY },
      startOffset: { ...offset },
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return
    const { startPoint, startOffset } = dragStartRef.current
    const dx = e.clientX - startPoint.x
    const dy = e.clientY - startPoint.y
    setOffset({
      x: startOffset.x + dx,
      y: startOffset.y + dy,
    })
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return
    if (dragStartRef.current.pointerId === e.pointerId && frameRef.current) {
      frameRef.current.releasePointerCapture(e.pointerId)
      dragStartRef.current = null
    }
  }

  const handleConfirm = () => {
    if (!naturalSize || !frameSize) return

    const img = new Image()
    img.src = image
    img.onload = () => {
      const { width: imgW, height: imgH } = naturalSize
      const { width: cw, height: ch } = frameSize
      const canvas = document.createElement('canvas')
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const displayScale = baseScale * scale

      ctx.clearRect(0, 0, cw, ch)
      ctx.save()
      ctx.translate(cw / 2 + offset.x, ch / 2 + offset.y)
      ctx.scale(displayScale, displayScale)
      ctx.drawImage(img, -imgW / 2, -imgH / 2)
      ctx.restore()

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      onConfirm(dataUrl)
    }
  }

  const displayScale = baseScale * scale

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/60">
              Recadrage précis
            </p>
            <h2 className="mt-1 text-lg sm:text-xl font-semibold text-white">
              Aligne ta carte dans le cadre
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-3 space-y-3 text-xs text-white/70">
          <p>
            Glisse la photo pour centrer ta carte, utilise le zoom pour remplir le cadre doré. Tout ce
            qui sort du cadre sera coupé.
          </p>
        </div>

        <div className="px-5 pb-4">
          <div
            ref={frameRef}
            className="relative mx-auto w-full max-w-[320px] aspect-[63/88] bg-slate-900/80 rounded-2xl overflow-hidden touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Image sous-jacente, manipulable */}
            {naturalSize && (
              <div className="absolute inset-0">
                <img
                  ref={imgElRef}
                  src={image}
                  alt="Ajuster la carte"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
                  style={{
                    width: naturalSize.width * displayScale,
                    height: naturalSize.height * displayScale,
                    transform: `translate(calc(-50%px + ${offset.x}px), calc(-50%px + ${offset.y}px))`,
                  }}
                  draggable={false}
                />
              </div>
            )}

            {/* Cadre de la carte avec assombrissement autour */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[78%] h-[84%] rounded-[1.25rem] border-[3px] border-amber-300/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]">
                <div className="absolute inset-[10%] border border-amber-200/60 rounded-[0.85rem] border-dashed" />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-white/60">
              <span>Zoom</span>
              <span className="tabular-nums">{scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={2.2}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-amber-300"
            />
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/40 hover:shadow-amber-400/50 hover:brightness-105 transition-all"
            >
              <Check className="h-5 w-5" />
              Valider le cadrage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

