# 📋 Instructions de configuration Supabase

## 🔑 Informations de connexion

**URL de la base de données :** `postgresql://postgres:aqMd22S1SPwRIHFM@db.ynbwxfjuywwlnwpnjuer.supabase.co:5432/postgres`

**URL du projet :** `https://ynbwxfjuywwlnwpnjuer.supabase.co`

## 📝 Étapes de configuration

### 1️⃣ Récupérer les clés API

1. Connectez-vous à [Supabase](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** (⚙️) > **API**
4. Copiez les clés suivantes :
   - **Project URL** : `https://ynbwxfjuywwlnwpnjuer.supabase.co`
   - **anon public** : Cette clé commence généralement par `eyJ...`
   - **service_role** : Cette clé commence aussi par `eyJ...` (à garder secrète !)

5. Mettez à jour le fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://ynbwxfjuywwlnwpnjuer.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

### 2️⃣ Exécuter le script SQL

1. Dans Supabase, allez dans **SQL Editor** (icône 📝)
2. Cliquez sur **New query**
3. Copiez-collez **tout le contenu** du fichier `supabase-setup.sql`
4. Cliquez sur **Run** (▶️)
5. Vérifiez qu'il n'y a pas d'erreurs

✅ Vous devriez voir un message de succès !

### 3️⃣ Configurer l'authentification Google

#### A. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Dans le menu, allez dans **APIs & Services** > **Credentials**
4. Cliquez sur **Create Credentials** > **OAuth client ID**
5. Si demandé, configurez l'écran de consentement OAuth :
   - Type d'application : **Externe**
   - Nom de l'application : **CardMania**
   - Email de support : votre email
   - Domaines autorisés : `ynbwxfjuywwlnwpnjuer.supabase.co`
   - Enregistrez

6. Créez les identifiants OAuth :
   - Type d'application : **Application Web**
   - Nom : **CardMania**
   - URIs de redirection autorisés :
     ```
     https://ynbwxfjuywwlnwpnjuer.supabase.co/auth/v1/callback
     ```
   - Cliquez sur **Créer**

7. **Copiez le Client ID et le Client Secret** (vous en aurez besoin !)

#### B. Configurer dans Supabase

1. Dans Supabase, allez dans **Authentication** (🔐) > **Providers**
2. Trouvez **Google** dans la liste
3. Activez le toggle **Enable Sign in with Google**
4. Remplissez les champs :
   - **Client ID** : collez le Client ID de Google
   - **Client Secret** : collez le Client Secret de Google
5. Cliquez sur **Save**

✅ L'authentification Google est maintenant configurée !

### 4️⃣ Vérifier la configuration

1. Dans Supabase, allez dans **Table Editor**
2. Vous devriez voir deux tables :
   - ✅ `profiles`
   - ✅ `cards`

3. Cliquez sur chaque table pour vérifier les colonnes

### 5️⃣ Tester l'application

1. Dans le terminal, lancez :
   ```bash
   npm run dev
   ```

2. Ouvrez [http://localhost:3000](http://localhost:3000)

3. Cliquez sur **Continuer avec Google**

4. Connectez-vous avec votre compte Google

5. Vous devriez être redirigé vers le dashboard ! 🎉

## 🔍 Vérifications

### Vérifier que le profil est créé

1. Dans Supabase, allez dans **Table Editor** > **profiles**
2. Vous devriez voir votre profil avec votre email

### Vérifier les politiques de sécurité (RLS)

1. Dans Supabase, allez dans **Authentication** > **Policies**
2. Sélectionnez la table `cards`
3. Vous devriez voir 4 politiques :
   - ✅ Users can view own cards
   - ✅ Users can insert own cards
   - ✅ Users can update own cards
   - ✅ Users can delete own cards

## 🐛 Résolution de problèmes

### Erreur : "Invalid API key"
➡️ Vérifiez que vous avez bien copié la clé `anon public` dans `.env.local`

### Erreur : "OAuth error"
➡️ Vérifiez que :
- L'URI de redirection est correct dans Google Cloud Console
- Le Client ID et Secret sont corrects dans Supabase
- L'authentification Google est bien activée dans Supabase

### Erreur : "relation does not exist"
➡️ Vous n'avez pas exécuté le script SQL. Retournez à l'étape 2️⃣

### Erreur : "Row Level Security policy violation"
➡️ Les politiques RLS ne sont pas correctement configurées. Réexécutez le script SQL.

## 📚 Ressources utiles

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentation Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Documentation Next.js](https://nextjs.org/docs)

## 🎉 C'est terminé !

Votre application CardMania est maintenant prête à l'emploi. Vous pouvez :
- ➕ Ajouter des cartes
- ✏️ Modifier vos cartes
- 🗑️ Supprimer des cartes
- 🔍 Rechercher et filtrer votre collection
- 📊 Voir les statistiques de votre collection

Amusez-vous bien ! 🃏
