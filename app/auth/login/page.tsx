'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log('[Auth][Username] Start', { mode: isSignUp ? 'signup' : 'login', username })
      setLoading(true)
      setError(null)

      if (isSignUp) {
        // Vérifier que le nom d'utilisateur n'est pas déjà pris
        const { data: existing, error: existingError } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', username)
          .maybeSingle()

        if (existingError) {
          console.error('[Auth][Username][Signup] Check existing error', existingError)
        }

        if (existing) {
          setError("Ce nom d'utilisateur est déjà pris. Choisissez-en un autre.")
          return
        }

        // On génère un email interne basé sur le username, uniquement pour Supabase Auth
        const internalEmail = `${username}@cardmania.local`

        const { data, error } = await supabase.auth.signUp({
          email: internalEmail,
          password,
          options: {
            data: {
              username,
            },
          },
        })
        console.log('[Auth][Username][Signup] Result', { data, error })
        if (error) throw error

        if (data.session) {
          console.log('[Auth][Username][Signup] Session active, redirect to /dashboard')
          window.location.href = '/dashboard'
        } else {
          // Si les emails de confirmation sont encore activés côté Supabase
          setError("Compte créé. Si nécessaire, vérifiez l'email associé à votre compte.")
        }
      } else {
        // Connexion : on récupère d'abord l'email associé à ce username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', username)
          .maybeSingle()

        if (profileError) {
          console.error('[Auth][Username][Login] Lookup error', profileError)
          throw profileError
        }

        if (!profile) {
          setError("Nom d'utilisateur ou mot de passe incorrect.")
          return
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password,
        })
        console.log('[Auth][Username][Login] Result', { data, error })
        if (error) throw error
        console.log('[Auth][Username][Login] Redirect to /dashboard')
        window.location.href = '/dashboard'
      }
    } catch (error: any) {
      console.error('[Auth][Username] Error', error)
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
                src="/assets/Logo.png"
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

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-900 mb-2">
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                  placeholder="Votre pseudo (ex : Pikachu42)"
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
                <LogIn className="w-5 h-5" />
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
