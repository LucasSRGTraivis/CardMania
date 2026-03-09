'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { supabase, type Friend, type Notification } from '@/lib/supabase'
import { LogOut, Users, Bell, Search, X, Trash2 } from 'lucide-react'

interface NavbarDesktopProps {
  userName?: string
  userId?: string
  onLogout: () => void
}

type FriendSearchResult = {
  id: string
  username: string
}

export default function NavbarDesktop({ userName, userId, onLogout }: NavbarDesktopProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const activeFriendId = searchParams.get('friend')
  const activeFriendName = searchParams.get('friendName')

  const isOnDashboard = pathname?.startsWith('/dashboard')
  const isOnWishlist = pathname === '/souhaits'

  const buildHref = (base: string) => {
    if (!activeFriendId) return base
    const params = new URLSearchParams()
    params.set('friend', activeFriendId)
    if (activeFriendName) params.set('friendName', activeFriendName)
    return `${base}?${params.toString()}`
  }

  const dashboardHref = buildHref('/dashboard')
  const wishlistHref = buildHref('/souhaits')

  const [friends, setFriends] = useState<Friend[]>([])
  const [friendSearch, setFriendSearch] = useState('')
  const [friendResults, setFriendResults] = useState<FriendSearchResult[]>([])
  const [friendError, setFriendError] = useState<string | null>(null)
  const [friendSuccess, setFriendSuccess] = useState<string | null>(null)
  const [friendToRemove, setFriendToRemove] = useState<Friend | null>(null)
  const [isFriendsOpen, setIsFriendsOpen] = useState(false)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [loadingFriendAction, setLoadingFriendAction] = useState(false)

  useEffect(() => {
    if (!userId) return

    const load = async () => {
      // Charger la liste d'amis
      const { data: friendsData } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', userId)
        .order('friend_username', { ascending: true })

      if (friendsData) {
        setFriends(friendsData as Friend[])
      }

      // Charger les notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (notifData) {
        setNotifications(notifData as Notification[])
        setHasUnreadNotifications(notifData.some((n) => !n.is_read))
      }
    }
    load()
  }, [userId])

  // Écouteur global pour ouvrir la liste d'amis depuis la nav mobile
  useEffect(() => {
    const openFriendsFromEvent = () => setIsFriendsOpen(true)
    if (typeof window !== 'undefined') {
      window.addEventListener('cardmania:openFriends', openFriendsFromEvent)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cardmania:openFriends', openFriendsFromEvent)
      }
    }
  }, [])

  // Recherche d'amis en "live" (auto au fil de la saisie)
  useEffect(() => {
    if (!userId) return

    const query = friendSearch.trim()
    if (!query) {
      setFriendResults([])
      setFriendError(null)
      return
    }

    const handler = setTimeout(async () => {
      setFriendError(null)

      const { data, error } = await supabase.rpc('search_profiles_by_username', {
        p_query: query,
      })

      if (error) {
        setFriendError("Impossible de rechercher pour le moment.")
        setFriendResults([])
        return
      }

      const results = (data || []) as FriendSearchResult[]
      const filtered = results.filter(
        (r) =>
          r.id !== userId &&
          !friends.some((f) => f.friend_id === r.id),
      )

      if (filtered.length === 0) {
        setFriendError('Aucun profil trouvé ou déjà dans ta liste.')
      } else {
        setFriendError(null)
      }

      setFriendResults(filtered)
    }, 250)

    return () => {
      clearTimeout(handler)
    }
  }, [friendSearch, userId, friends])

  const handleOpenNotifications = async () => {
    if (!userId) return
    setIsNotificationsOpen(true)

    if (hasUnreadNotifications) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      setHasUnreadNotifications(false)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }
  }

  const handleRemoveNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleRespondFriendRequest = async (notif: Notification, accept: boolean) => {
    if (!userId) return

    const payload = (notif.payload || {}) as any
    const requestId = payload.friend_request_id as string | undefined
    if (!requestId) return

    setLoadingFriendAction(true)
    try {
      const { data: request, error } = await supabase
        .from('friend_requests')
        .update({
          status: accept ? 'accepted' : 'declined',
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .select()
        .single()

      if (!error && request) {
        if (accept) {
          const requesterId = request.requester_id as string
          const requesterUsername = payload.requester_username as string | undefined
          const currentUsername = userName ?? ''

          await supabase.from('friends').insert([
            {
              user_id: userId,
              friend_id: requesterId,
              friend_username: requesterUsername || 'Ami',
            },
            {
              user_id: requesterId,
              friend_id: userId,
              friend_username: currentUsername || 'Ami',
            },
          ])

          // Recharger les amis
          const { data: friendsData } = await supabase
            .from('friends')
            .select('*')
            .eq('user_id', userId)
            .order('friend_username', { ascending: true })

          if (friendsData) {
            setFriends(friendsData as Friend[])
          }
        }

        await supabase.from('notifications').delete().eq('id', notif.id)
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
      }
    } finally {
      setLoadingFriendAction(false)
    }
  }

  const handleAddFriend = async (profile: FriendSearchResult) => {
    if (!userId) return

    setLoadingFriendAction(true)
    setFriendError(null)
    setFriendSuccess(null)

    try {
      // Vérifier s'il n'y a pas déjà une demande en cours dans un sens ou dans l'autre
      const { data: existing } = await supabase
        .from('friend_requests')
        .select('*')
        .or(
          `and(requester_id.eq.${userId},receiver_id.eq.${profile.id},status.eq.pending),and(requester_id.eq.${profile.id},receiver_id.eq.${userId},status.eq.pending)`,
        )
        .maybeSingle()

      if (existing) {
        setFriendError('Une demande est déjà en cours avec cet ami.')
        return
      }

      // Créer la demande d'ami
      const { data: request, error: requestError } = await supabase
        .from('friend_requests')
        .insert([
          {
            requester_id: userId,
            receiver_id: profile.id,
          },
        ])
        .select()
        .single()

      if (requestError || !request) {
        setFriendError("Impossible d'envoyer la demande d'ami.")
        return
      }

      // Créer la notification pour le destinataire
      const { error: notifError } = await supabase.from('notifications').insert([
        {
          user_id: profile.id,
          type: 'friend_request',
          payload: {
            friend_request_id: request.id,
            requester_id: userId,
            requester_username: userName ?? '',
          },
        },
      ])

      if (notifError) {
        setFriendError("La demande a été créée, mais la notification n'a pas pu être envoyée.")
      } else {
        setFriendSuccess("Demande d'ami envoyée.")
      }
    } finally {
      setLoadingFriendAction(false)
    }
  }

  const handleRemoveFriend = async () => {
    if (!userId || !friendToRemove) return

    setLoadingFriendAction(true)
    try {
      const { error } = await supabase.rpc('delete_friendship', {
        p_user_id: userId,
        p_friend_id: friendToRemove.friend_id,
      })

      if (!error) {
        setFriends((prev) =>
          prev.filter((f) => f.friend_id !== friendToRemove.friend_id),
        )
      }
    } finally {
      setLoadingFriendAction(false)
      setFriendToRemove(null)
    }
  }

  return (
    <>
      <nav className="hidden md:block fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-sm border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Colonne gauche : logo + titre */}
            <div className="flex items-center gap-3">
              <div className="w-90 h-90 flex items-center justify-center">
                <Image
                  src="/assets/Logo.png"
                  alt="CardMania"
                  width={75}
                  height={75}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-forest-900 tracking-tight">
                CardMania
              </h1>
            </div>

            {/* Colonne centrale : navigation centrée */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 rounded-full bg-cream-50 border border-cream-200 px-1 py-1">
                <Link
                  href={dashboardHref}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                    isOnDashboard
                      ? 'bg-forest-500 text-white shadow-sm'
                      : 'text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  Ma collection
                </Link>
                <Link
                  href={wishlistHref}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                    isOnWishlist
                      ? 'bg-forest-500 text-white shadow-sm'
                      : 'text-forest-700 hover:bg-cream-100'
                  }`}
                >
                  Souhaits
                </Link>
              </div>
            </div>

            {/* Colonne droite : amis, notifications, profil/déconnexion */}
            <div className="flex items-center gap-3">
              {/* Amis */}
              <button
                type="button"
                onClick={() => setIsFriendsOpen(true)}
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-cream-50 text-forest-700 hover:bg-cream-100 border border-cream-200 transition-colors"
                title="Liste d'amis"
              >
                <Users className="w-4 h-4" />
              </button>

              {/* Notifications */}
              <button
                type="button"
                onClick={handleOpenNotifications}
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-cream-50 text-forest-700 hover:bg-cream-100 border border-cream-200 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {hasUnreadNotifications && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
                )}
              </button>

              {/* Pseudo + icône déconnexion dans la même section */}
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-50 hover:bg-cream-100 border border-cream-200 text-forest-900 text-xs font-semibold max-w-[12rem] transition-colors"
              >
                {userName && (
                  <span className="truncate">{userName}</span>
                )}
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Actions mobile en haut à droite (notifications + logout) */}
      <div className="md:hidden fixed top-3 right-4 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={handleOpenNotifications}
          className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/90 border border-cream-200 text-forest-700 shadow-sm hover:bg-cream-50 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {hasUnreadNotifications && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/90 border border-cream-200 text-forest-700 shadow-sm hover:bg-cream-50 transition-colors"
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Modal amis */}
      {isFriendsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center overlay-fade-soft"
          onClick={() => setIsFriendsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl md:rounded-2xl shadow-2xl border border-cream-200 p-5 space-y-4 panel-slide-up-soft max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Poignée mobile */}
            <div className="md:hidden flex justify-center pt-1 pb-2 -mt-2">
              <div className="w-10 h-1.5 bg-cream-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-forest-900">
                Tes amis
              </h2>
              <button
                type="button"
                onClick={() => setIsFriendsOpen(false)}
                className="p-1 rounded-full hover:bg-cream-100 text-forest-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-forest-800">
                Rechercher un ami
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                <input
                  type="text"
                  value={friendSearch}
                  onChange={(e) => {
                    setFriendSearch(e.target.value)
                    setFriendError(null)
                    setFriendSuccess(null)
                  }}
                  placeholder="Pseudo de ton ami"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-cream-200 bg-cream-50 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent text-sm"
                />
              </div>
              {friendError && (
                <p className="text-xs text-red-600 mt-1">{friendError}</p>
              )}
              {friendSuccess && !friendError && (
                <p className="text-xs text-emerald-700 mt-1">
                  {friendSuccess}
                </p>
              )}
            </div>

            {friendResults.length > 0 && (
              <div className="mt-2 border border-cream-200 rounded-xl p-3 bg-cream-50 space-y-2 max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-forest-800 mb-1">
                  Résultats
                </p>
                {friendResults.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-2 py-1.5"
                  >
                    <span className="text-sm text-forest-900 truncate">
                      {r.username}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddFriend(r)}
                      disabled={loadingFriendAction}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-forest-500 hover:bg-forest-600 text-white disabled:opacity-60"
                    >
                      Ajouter cet ami
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-cream-200 mt-2 max-h-52 overflow-y-auto">
              <p className="text-xs font-semibold text-forest-800 mb-2">
                Amis actuels
              </p>
              {friends.length === 0 ? (
                <p className="text-xs text-forest-600">
                  Tu n&apos;as pas encore ajouté d&apos;amis.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {friends.map((f) => (
                    <li
                      key={f.id}
                      className="px-3 py-1.5 rounded-lg bg-cream-50 border border-cream-200 text-sm text-forest-900 flex items-center justify-between gap-2 hover:bg-cream-100 transition-colors"
                    >
                      <button
                        type="button"
                        className="flex-1 text-left truncate cursor-pointer hover:text-forest-800"
                        onClick={() => {
                          const base = pathname?.startsWith('/souhaits') ? '/souhaits' : '/dashboard'
                          const params = new URLSearchParams()
                          params.set('friend', f.friend_id)
                          params.set('friendName', f.friend_username)
                          router.push(`${base}?${params.toString()}`)
                          setIsFriendsOpen(false)
                        }}
                      >
                        {f.friend_username}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFriendToRemove(f)
                        }}
                        className="p-1.5 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                        title="Supprimer cet ami"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Centre de notifications */}
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-end pt-20 pr-6 overlay-fade-soft"
          onClick={() => setIsNotificationsOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-cream-200 p-4 space-y-3 panel-slide-up-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-forest-900">
                Notifications
              </h2>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 rounded-full hover:bg-cream-100 text-forest-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <p className="text-sm text-forest-600">
                Aucune notification pour le moment.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.map((notif) => {
                  if (notif.type === 'friend_request') {
                    const payload = (notif.payload || {}) as any
                    const requesterUsername =
                      payload.requester_username || 'Un utilisateur'
                    return (
                      <div
                        key={notif.id}
                        className="relative rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5 space-y-2"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveNotification(notif.id)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-cream-100 text-forest-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-sm text-forest-900 pr-5">
                          <span className="font-semibold">{requesterUsername}</span>{' '}
                          souhaite t&apos;ajouter comme ami.
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            disabled={loadingFriendAction}
                            onClick={() => handleRespondFriendRequest(notif, true)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-forest-500 hover:bg-forest-600 text-white font-semibold disabled:opacity-60"
                          >
                            Accepter
                          </button>
                          <button
                            type="button"
                            disabled={loadingFriendAction}
                            onClick={() => handleRespondFriendRequest(notif, false)}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-forest-900 font-semibold disabled:opacity-60"
                          >
                            Refuser
                          </button>
                        </div>
                      </div>
                    )
                  }

                  // Fallback générique
                  return (
                    <div
                      key={notif.id}
                      className="relative rounded-xl border border-cream-200 bg-cream-50 px-3 py-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveNotification(notif.id)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full hover:bg-cream-100 text-forest-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-sm text-forest-900">
                        Nouvelle notification.
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation déconnexion */}
      {isLogoutConfirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center overlay-fade-soft"
          onClick={() => setIsLogoutConfirmOpen(false)}
        >
          <div
            className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-cream-200 p-5 space-y-3 panel-slide-up-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-forest-900">
              Se déconnecter ?
            </h2>
            <p className="text-sm text-forest-700">
              Tu vas être déconnecté de CardMania.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 px-3 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-900 text-sm font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation suppression d'ami */}
      {friendToRemove && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center overlay-fade-soft"
          onClick={() => setFriendToRemove(null)}
        >
          <div
            className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-cream-200 p-5 space-y-3 panel-slide-up-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-forest-900">
              Supprimer cet ami ?
            </h2>
            <p className="text-sm text-forest-700">
              {friendToRemove.friend_username
                ? `Tu ne verras plus ${friendToRemove.friend_username} dans ta liste d'amis.`
                : "Tu ne verras plus cet ami dans ta liste."}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFriendToRemove(null)}
                className="flex-1 px-3 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-900 text-sm font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={loadingFriendAction}
                onClick={handleRemoveFriend}
                className="flex-1 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
