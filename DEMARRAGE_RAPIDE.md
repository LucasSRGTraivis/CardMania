# 🚀 Démarrage rapide - CardMania

## ⚡ En 5 minutes chrono !

### 1️⃣ Récupérer vos clés Supabase (2 min)

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Sélectionnez votre projet
3. Cliquez sur **Settings** ⚙️ > **API**
4. Copiez ces deux clés :
   - **Project URL** : `https://ynbwxfjuywwlnwpnjuer.supabase.co`
   - **anon public** : Une longue clé qui commence par `eyJ...`

### 2️⃣ Configurer les variables d'environnement (30 sec)

Ouvrez le fichier `.env.local` et remplacez :

```env
NEXT_PUBLIC_SUPABASE_URL=https://ynbwxfjuywwlnwpnjuer.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=COLLEZ_VOTRE_CLE_ANON_ICI
SUPABASE_SERVICE_ROLE_KEY=COLLEZ_VOTRE_CLE_SERVICE_ROLE_ICI
```

### 3️⃣ Créer les tables dans Supabase (1 min)

1. Dans Supabase, cliquez sur **SQL Editor** 📝
2. Cliquez sur **New query**
3. Copiez-collez **tout** le contenu du fichier `supabase-setup.sql`
4. Cliquez sur **Run** ▶️

✅ Vous devriez voir "Success. No rows returned"

### 4️⃣ Configurer Google OAuth (2 min)

#### Option A : Configuration rapide

1. Dans Supabase : **Authentication** > **Providers** > **Google**
2. Activez le toggle
3. Utilisez les identifiants de test fournis par Supabase (pour le développement)

#### Option B : Configuration complète (production)

Suivez le guide complet dans `INSTRUCTIONS_SUPABASE.md` section 3️⃣

### 5️⃣ Lancer l'application (30 sec)

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

## ✅ Checklist de vérification

- [ ] Les dépendances sont installées (`node_modules` existe)
- [ ] Le fichier `.env.local` contient vos clés Supabase
- [ ] Les tables `profiles` et `cards` existent dans Supabase
- [ ] L'authentification Google est activée dans Supabase
- [ ] L'application tourne sur `http://localhost:3000`

## 🐛 Problèmes courants

### "Invalid API key"
➡️ Vérifiez que vous avez bien copié la clé `anon public` dans `.env.local`

### "relation does not exist"
➡️ Vous n'avez pas exécuté le script SQL. Retournez à l'étape 3️⃣

### "OAuth error"
➡️ L'authentification Google n'est pas activée. Retournez à l'étape 4️⃣

### Le serveur ne démarre pas
➡️ Vérifiez que le port 3000 n'est pas déjà utilisé :
```bash
lsof -ti:3000 | xargs kill -9  # Libérer le port 3000
npm run dev                     # Relancer
```

## 📚 Prochaines étapes

1. ✅ Connectez-vous avec Google
2. ➕ Ajoutez votre première carte
3. 🎨 Personnalisez les couleurs dans `tailwind.config.ts`
4. 📖 Lisez `README.md` pour plus de détails

## 💡 Astuces

- **Raccourci** : Appuyez sur `Ctrl+C` pour arrêter le serveur
- **Hot Reload** : Les modifications sont automatiquement rechargées
- **Logs** : Surveillez le terminal pour les erreurs
- **DevTools** : Ouvrez la console du navigateur (F12) pour déboguer

## 🎯 Objectif atteint !

Vous devriez maintenant avoir :
- ✅ Une application qui tourne
- ✅ Une page de connexion Google
- ✅ Un dashboard vide prêt à recevoir vos cartes

**Temps total** : ~5 minutes ⏱️

---

Besoin d'aide ? Consultez `INSTRUCTIONS_SUPABASE.md` pour plus de détails !
