'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react'
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

interface GestureState {
  mode: 'none' | 'pan' | 'pinch'
  startOffset: Point
  startScale: number
  startPoint?: Point
  startDistance?: number
}

export default function CardCropperModal({ image, onCancel, onConfirm }: CardCropperModalProps) {
  const frameRef = useRef<HTMLDivElement | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const [frameSize, setFrameSize] = useState<{ width: number; height: number } | null>(null)
  const [baseScale, setBaseScale] = useState(1)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })

  const pointersRef = useRef<Map<number, Point>>(new Map())
  const gestureRef = useRef<GestureState>({
    mode: 'none',
    startOffset: { x: 0, y: 0 },
    startScale: 1,
  })

  useEffect(() => {
    const img = new Image()
    img.src = image
    img.onload = () => {
      const nat = { width: img.naturalWidth, height: img.naturalHeight }
      setNaturalSize(nat)

      if (frameRef.current) {
        const { clientWidth, clientHeight } = frameRef.current
        const frame = { width: clientWidth, height: clientHeight }
        setFrameSize(frame)
        const base = Math.max(frame.width / nat.width, frame.height / nat.height)
        setBaseScale(base)
        setScale(1)
        setOffset({ x: 0, y: 0 })
      }
    }
  }, [image])

  const updatePointer = (id: number, point: Point) => {
    const next = new Map(pointersRef.current)
    next.set(id, point)
    pointersRef.current = next
  }

  const removePointer = (id: number) => {
    const next = new Map(pointersRef.current)
    next.delete(id)
    pointersRef.current = next
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!frameRef.current) return
    frameRef.current.setPointerCapture(e.pointerId)
    const p = { x: e.clientX, y: e.clientY }
    updatePointer(e.pointerId, p)

    const pointers = Array.from(pointersRef.current.values())

    if (pointers.length === 1) {
      gestureRef.current = {
        mode: 'pan',
        startOffset: { ...offset },
        startScale: scale,
        startPoint: p,
      }
    } else if (pointers.length === 2) {
      const [p1, p2] = pointers
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const distance = Math.hypot(dx, dy)

      gestureRef.current = {
        mode: 'pinch',
        startOffset: { ...offset },
        startScale: scale,
        startDistance: distance,
      }
    }
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!frameRef.current) return
    if (pointersRef.current.size === 0) return

    const p = { x: e.clientX, y: e.clientY }
    updatePointer(e.pointerId, p)

    const gesture = gestureRef.current
    const pointers = Array.from(pointersRef.current.values())

    if (gesture.mode === 'pan' && gesture.startPoint && pointers.length === 1) {
      const dx = p.x - gesture.startPoint.x
      const dy = p.y - gesture.startPoint.y
      setOffset({
        x: gesture.startOffset.x + dx,
        y: gesture.startOffset.y + dy,
      })
    } else if (gesture.mode === 'pinch' && pointers.length >= 2 && gesture.startDistance) {
      const [p1, p2] = pointers
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const distance = Math.hypot(dx, dy)

      const scaleFactor = distance / gesture.startDistance
      const nextScale = Math.min(3, Math.max(0.8, gesture.startScale * scaleFactor))
      setScale(nextScale)
    }
  }

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!frameRef.current) return
    frameRef.current.releasePointerCapture(e.pointerId)
    removePointer(e.pointerId)

    const pointers = Array.from(pointersRef.current.values())
    if (pointers.length === 0) {
      gestureRef.current = {
        mode: 'none',
        startOffset: { ...offset },
        startScale: scale,
      }
    } else if (pointers.length === 1) {
      const p = pointers[0]
      gestureRef.current = {
        mode: 'pan',
        startOffset: { ...offset },
        startScale: scale,
        startPoint: p,
      }
    }
  }

  const handleConfirm = () => {
    if (!naturalSize || !frameSize) return

    const img = new Image()
    img.src = image
    img.onload = () => {
      const { width: imgW, height: imgH } = naturalSize
      const { width: cw, height: ch } = frameSize

      const displayScale = baseScale * scale

      // 1) On dessine d'abord sur un canvas "plein cadre" qui correspond exactement
      // à la zone grisée + cadre vert que l'utilisateur voit.
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = cw
      tempCanvas.height = ch
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      tempCtx.clearRect(0, 0, cw, ch)
      tempCtx.save()
      tempCtx.translate(cw / 2 + offset.x, ch / 2 + offset.y)
      tempCtx.scale(displayScale, displayScale)
      tempCtx.drawImage(img, -imgW / 2, -imgH / 2)
      tempCtx.restore()

      // 2) La zone réellement visible pour la carte est le cadre vert,
      // qui occupe 80% de la largeur et 86% de la hauteur du cadre.
      const frameW = cw * 0.8
      const frameH = ch * 0.86
      const frameX = (cw - frameW) / 2
      const frameY = (ch - frameH) / 2

      const finalCanvas = document.createElement('canvas')
      // On exporte en plus haute résolution que l'aperçu visuel
      const scaleForExport = 3
      const outW = Math.round(frameW * scaleForExport)
      const outH = Math.round(frameH * scaleForExport)
      finalCanvas.width = outW
      finalCanvas.height = outH
      const finalCtx = finalCanvas.getContext('2d')
      if (!finalCtx) return

      finalCtx.clearRect(0, 0, outW, outH)
      finalCtx.drawImage(
        tempCanvas,
        frameX,
        frameY,
        frameW,
        frameH,
        0,
        0,
        outW,
        outH
      )

      const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.95)
      onConfirm(dataUrl)
    }
  }

  const displayScale = baseScale * scale

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center sm:justify-center sm:p-4 z-50 overlay-fade-soft">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border border-cream-200">
        <div className="sm:hidden flex justify-center pt-3 pb-1 bg-white">
          <div className="w-10 h-1 bg-cream-300 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-white">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-500">
              Recadrage de la photo
            </p>
            <h2 className="mt-1 text-lg sm:text-xl font-bold text-forest-900">
              Place ta carte dans le cadre
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors text-forest-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-5 pt-4 bg-cream-50">
          <div
            ref={frameRef}
            className="relative mx-auto w-full max-w-[320px] aspect-[63/88] bg-forest-900/5 rounded-2xl overflow-hidden touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={(e: ReactWheelEvent<HTMLDivElement>) => {
              e.preventDefault()
              const delta = -e.deltaY
              const zoomFactor = 1 + delta * 0.0015
              if (!Number.isFinite(zoomFactor) || zoomFactor <= 0) return
              setScale((prev) => {
                const next = prev * zoomFactor
                return Math.min(3, Math.max(0.8, next))
              })
            }}
          >
            {naturalSize && (
              <div className="absolute inset-0">
                <img
                  src={image}
                  alt="Ajuster la carte"
                  className="absolute top-1/2 left-1/2 select-none pointer-events-none max-w-none max-h-none"
                  style={{
                    width: naturalSize.width * displayScale,
                    height: naturalSize.height * displayScale,
                    transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                  }}
                  draggable={false}
                />
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[80%] h-[86%] rounded-[1.25rem] border-[3px] border-forest-500/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] bg-transparent" />
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-cream-100 hover:bg-cream-200 text-forest-900 font-semibold rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Valider le cadrage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

