import { Suspense } from 'react'
import WishlistClient from '@/components/WishlistClient'

export default function SouhaitsPage() {
  return (
    <Suspense fallback={null}>
      <WishlistClient />
    </Suspense>
  )
}

