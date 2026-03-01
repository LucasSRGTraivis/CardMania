-- ============================================
-- CARDMANIA - CONFIGURATION BASE DE DONNÉES
-- ============================================
-- Ce fichier contient toutes les requêtes SQL nécessaires
-- pour configurer votre base de données Supabase

-- ============================================
-- 1. CRÉATION DE LA TABLE PROFILES
-- ============================================
-- Cette table stocke les informations des utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Activer Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Politique : Les utilisateurs peuvent insérer leur propre profil
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. CRÉATION DE LA TABLE CARDS
-- ============================================
-- Cette table stocke toutes les cartes de la collection
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    set_name TEXT NOT NULL,
    card_number TEXT,
    rarity TEXT NOT NULL,
    condition TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS cards_created_at_idx ON public.cards(created_at DESC);
CREATE INDEX IF NOT EXISTS cards_name_idx ON public.cards(name);
CREATE INDEX IF NOT EXISTS cards_set_name_idx ON public.cards(set_name);

-- Activer Row Level Security
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres cartes
CREATE POLICY "Users can view own cards"
    ON public.cards
    FOR SELECT
    USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent insérer leurs propres cartes
CREATE POLICY "Users can insert own cards"
    ON public.cards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres cartes
CREATE POLICY "Users can update own cards"
    ON public.cards
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres cartes
CREATE POLICY "Users can delete own cards"
    ON public.cards
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 3. FONCTION POUR CRÉER UN PROFIL AUTOMATIQUEMENT
-- ============================================
-- Cette fonction crée automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour appeler la fonction lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. FONCTION POUR METTRE À JOUR LE TIMESTAMP
-- ============================================
-- Cette fonction met à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer les triggers pour mettre à jour updated_at
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_cards ON public.cards;
CREATE TRIGGER set_updated_at_cards
    BEFORE UPDATE ON public.cards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 5. DONNÉES DE TEST (OPTIONNEL)
-- ============================================
-- Décommentez les lignes ci-dessous pour ajouter des données de test
-- Remplacez 'YOUR_USER_ID' par votre ID utilisateur réel

/*
INSERT INTO public.cards (user_id, name, set_name, card_number, rarity, condition, quantity, notes)
VALUES
    ('YOUR_USER_ID', 'Dracaufeu', 'Évolutions', '11/108', 'Ultra rare', 'Near Mint', 1, 'Ma carte préférée !'),
    ('YOUR_USER_ID', 'Pikachu', 'Évolutions', '35/108', 'Commune', 'Mint', 3, 'Plusieurs exemplaires'),
    ('YOUR_USER_ID', 'Mewtwo', 'Évolutions', '51/108', 'Rare', 'Excellent', 1, 'Belle carte holographique');
*/

-- ============================================
-- FIN DE LA CONFIGURATION
-- ============================================
-- Votre base de données est maintenant prête !
-- N'oubliez pas de configurer l'authentification Google dans Supabase :
-- 1. Allez dans Authentication > Providers
-- 2. Activez Google
-- 3. Ajoutez vos identifiants OAuth Google
