'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogIn, Mail } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('[Auth][Email] Start', { mode: isSignUp ? 'signup' : 'login', email })
      setLoading(true)
      setError(null)

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        console.log('[Auth][Email][Signup] Result', { data, error })
        if (error) throw error
        if (data.session) {
          console.log('[Auth][Email][Signup] Session active, redirect to /dashboard')
          window.location.href = '/dashboard'
        } else {
          setError('Vérifiez votre email pour confirmer votre inscription !')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        console.log('[Auth][Email][Login] Result', { data, error })
        if (error) throw error
        console.log('[Auth][Email][Login] Redirect to /dashboard')
        window.location.href = '/dashboard'
      }
    } catch (error: any) {
      console.error('[Auth][Email] Error', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 via-cream-100 to-forest-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-90 h-90 flex items-center justify-center">
              <Image
                src="/assets/logo.png"
                alt="CardMania"
                width={220}
                height={220}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-forest-900 mb-2">
            CardMania
          </h1>
          <p className="text-lg text-forest-700">
            Gérez votre collection de cartes en toute simplicité
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-cream-200">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-forest-900 mb-2">
                {isSignUp ? 'Inscription' : 'Connexion'}
              </h2>
              <p className="text-forest-600">
                {isSignUp ? 'Créez votre compte' : 'Connectez-vous pour accéder à votre collection'}
              </p>
            </div>

            {error && (
              <div className={`${error.includes('Vérifiez') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded-lg`}>
                {error}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-900 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-forest-500 to-forest-600 hover:from-forest-600 hover:to-forest-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-5 h-5" />
                {loading ? 'Chargement...' : (isSignUp ? "S'inscrire" : 'Se connecter')}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                }}
                className="text-forest-600 hover:text-forest-800 text-sm font-medium"
              >
                {isSignUp ? 'Déjà un compte ? Connectez-vous' : "Pas de compte ? Inscrivez-vous"}
              </button>
            </div>

            <div className="text-center text-sm text-forest-600">
              <p>
                En vous connectant, vous acceptez nos conditions d&apos;utilisation
                et notre politique de confidentialité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
