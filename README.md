# 🃏 CardMania

> Application moderne et responsive pour gérer votre collection de cartes à collectionner

[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.7-3ecf8e)](https://supabase.com/)

---

## 🚀 Démarrage rapide

**Nouveau sur le projet ?** Commencez ici :

1. 📖 Lisez [`COMMENCER_ICI.md`](COMMENCER_ICI.md) - Point de départ
2. ⚡ Suivez [`DEMARRAGE_RAPIDE.md`](DEMARRAGE_RAPIDE.md) - Configuration en 5 minutes
3. 🎉 Lancez l'application !

**Temps total : ~5 minutes** ⏱️

---

## ✨ Fonctionnalités

- 🔐 **Authentification Google** via Supabase
- 📱 **Design responsive** parfait sur tous les appareils
- 🎨 **Interface moderne** avec palette crème et vert
- ➕ **Ajouter des cartes** avec toutes les informations (nom, extension, rareté, état, etc.)
- ✏️ **Modifier et supprimer** vos cartes
- 🔍 **Recherche et filtres** pour retrouver facilement vos cartes
- 📊 **Statistiques** de votre collection
- 👁️ **Deux modes d'affichage** : grille et liste

## 🚀 Installation

### Prérequis

- Node.js 18+ installé
- Un compte Supabase (gratuit)
- Un projet Google Cloud pour l'authentification OAuth

### Étape 1 : Installer les dépendances

```bash
npm install
```

### Étape 2 : Configuration Supabase

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans **SQL Editor** et exécutez le contenu du fichier `supabase-setup.sql`
4. Récupérez vos clés API :
   - Allez dans **Settings** > **API**
   - Copiez `Project URL` et `anon public` key

### Étape 3 : Configuration de l'authentification Google

1. Allez dans votre projet Supabase
2. **Authentication** > **Providers** > **Google**
3. Activez Google
4. Créez un projet sur [Google Cloud Console](https://console.cloud.google.com)
5. Activez l'API Google+ 
6. Créez des identifiants OAuth 2.0
7. Ajoutez les URIs de redirection :
   - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
8. Copiez le Client ID et Client Secret dans Supabase

### Étape 4 : Variables d'environnement

Modifiez le fichier `.env.local` avec vos clés :

```env
NEXT_PUBLIC_SUPABASE_URL=https://ynbwxfjuywwlnwpnjuer.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

### Étape 5 : Lancer l'application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📦 Structure du projet

```
CardMania/
├── app/
│   ├── auth/
│   │   ├── login/          # Page de connexion
│   │   ├── callback/       # Callback OAuth
│   │   └── logout/         # Route de déconnexion
│   ├── dashboard/          # Dashboard principal
│   ├── globals.css         # Styles globaux
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Page d'accueil (redirect)
├── components/
│   ├── CardGrid.tsx        # Affichage en grille
│   ├── CardList.tsx        # Affichage en liste
│   ├── CardModal.tsx       # Modal d'ajout/édition
│   └── DashboardClient.tsx # Composant principal du dashboard
├── lib/
│   ├── supabase.ts         # Client Supabase
│   └── supabase-server.ts  # Client Supabase côté serveur
├── middleware.ts           # Middleware d'authentification
├── supabase-setup.sql      # Script SQL pour la BDD
└── README.md
```

## 🎨 Palette de couleurs

- **Crème** : Tons chauds et doux (#fdfcfb à #6f5e47)
- **Vert forêt** : Tons naturels (#f0f7f4 à #1c3b31)

## 🗄️ Base de données

### Table `profiles`
- `id` : UUID (référence auth.users)
- `email` : Email de l'utilisateur
- `full_name` : Nom complet
- `avatar_url` : URL de l'avatar
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

### Table `cards`
- `id` : UUID
- `user_id` : UUID (référence profiles)
- `name` : Nom de la carte
- `set_name` : Nom de l'extension
- `card_number` : Numéro de la carte
- `rarity` : Rareté (Commune, Peu commune, Rare, Ultra rare, Secrète)
- `condition` : État (Mint, Near Mint, Excellent, Good, Played, Poor)
- `quantity` : Quantité possédée
- `image_url` : URL de l'image
- `notes` : Notes personnelles
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Authentification sécurisée via Supabase
- Middleware de protection des routes

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large desktop (1280px+)

## 🛠️ Technologies utilisées

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles utilitaires
- **Supabase** - Backend as a Service (Auth + PostgreSQL)
- **Lucide React** - Icônes modernes

## 📝 Scripts disponibles

```bash
npm run dev      # Lancer en mode développement
npm run build    # Construire pour la production
npm run start    # Lancer en mode production
npm run lint     # Vérifier le code
```

## 🤝 Support

Pour toute question ou problème, consultez la documentation :
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📄 Licence

Ce projet est sous licence MIT.

---

Fait avec ❤️ pour les collectionneurs de cartes
