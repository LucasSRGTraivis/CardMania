'use client'

import { useState } from 'react'
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

  const handleGoogleLogin = async () => {
    try {
      console.log('[Auth][Google] Start')
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log('[Auth][Google] Result', { data, error })
      if (error) throw error
    } catch (error: any) {
      console.error('[Auth][Google] Error', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

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
            <div className="w-20 h-20 bg-gradient-to-br from-forest-500 to-forest-700 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6">
              <span className="text-4xl text-white transform -rotate-6">🃏</span>
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cream-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-forest-600">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-cream-50 text-forest-900 font-semibold py-4 px-6 rounded-xl border-2 border-forest-200 hover:border-forest-400 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

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
