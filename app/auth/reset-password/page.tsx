'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const bootstrapRecoverySession = async () => {
      try {
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')

        if (type === 'recovery' && accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (sessionError) throw sessionError
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (!session) {
            throw new Error('Lien de réinitialisation invalide ou expiré.')
          }
        }

        if (isMounted) {
          setReady(true)
        }
      } catch (bootstrapError: any) {
        if (isMounted) {
          setError(bootstrapError.message ?? 'Impossible de préparer la réinitialisation du mot de passe.')
        }
      }
    }

    bootstrapRecoverySession()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready) return

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      setSuccess(null)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      setSuccess(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) throw updateError

      setSuccess('Mot de passe mis à jour. Redirection vers la connexion...')
      setTimeout(() => {
        router.push('/auth/login')
      }, 1200)
    } catch (submitError: any) {
      setError(submitError.message ?? 'Impossible de mettre à jour le mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-forest-50 flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-white/85 backdrop-blur-sm rounded-2xl border border-cream-200 shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-forest-900">Réinitialiser le mot de passe</h1>
        <p className="mt-2 text-sm text-forest-700">
          Choisis un nouveau mot de passe pour ton compte.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-forest-900 mb-2">Nouveau mot de passe</label>
            <input
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent disabled:opacity-70"
              placeholder="Au moins 6 caractères"
              disabled={!ready || loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-900 mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              minLength={6}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent disabled:opacity-70"
              placeholder="Retape le mot de passe"
              disabled={!ready || loading}
            />
          </div>

          <button
            type="submit"
            disabled={!ready || loading}
            className="w-full bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mise à jour...' : 'Valider le nouveau mot de passe'}
          </button>
        </form>
      </section>
    </main>
  )
}
