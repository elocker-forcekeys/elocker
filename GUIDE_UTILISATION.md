# Guide d'Utilisation - Smart Lockers

## 🎯 Vue d'Ensemble

Smart Lockers est un système complet de gestion de casiers intelligents permettant de gérer les livraisons, les utilisateurs, et le monitoring des armoires connectées.

## 🔐 Connexion au Système

### Accès à l'Interface
1. Ouvrir votre navigateur web
2. Aller à l'adresse: `http://localhost:5173`
3. Utiliser un des comptes de démonstration

### Comptes de Test Disponibles

| Compte | Rôle | Fonctionnalités |
|--------|------|-----------------|
| `superadmin@smartlockers.com` | Super Administrateur | Accès complet, gestion multi-entreprises |
| `admin@company.com` | Administrateur | Gestion de l'entreprise et des utilisateurs |
| `delivery@company.com` | Livreur | Création et suivi des livraisons |
| `client@company.com` | Client | Récupération des colis |
| `helpdesk@smartlockers.com` | Support Technique | Assistance et monitoring |

**Mot de passe pour tous les comptes:** `password123`

## 👑 Guide Super Administrateur

### Fonctionnalités Principales
- **Gestion des Sociétés**: Créer, modifier, suspendre des entreprises clientes
- **Gestion Globale des Utilisateurs**: Voir et gérer tous les utilisateurs
- **Configuration Système**: Paramètres globaux et plans tarifaires
- **Monitoring Global**: Vue d'ensemble de toutes les armoires
- **Documentation API**: Accès complet à la documentation

### Actions Courantes

#### Créer une Nouvelle Société
1. Aller dans **Sociétés** → **Nouvelle Société**
2. Remplir les informations:
   - Nom de la société
   - Email de contact
   - Téléphone et adresse
3. Définir le statut (Actif/Inactif/Suspendu)
4. Cliquer sur **Enregistrer**

#### Gérer les Plans Tarifaires
1. Aller dans **Plans Tarifaires**
2. Créer ou modifier un plan:
   - Définir les limites (utilisateurs, armoires, livraisons)
   - Configurer les prix (mensuel/annuel)
   - Ajouter les fonctionnalités incluses
3. Marquer comme "Populaire" si nécessaire

## 🏢 Guide Administrateur d'Entreprise

### Tableau de Bord
- **Vue d'ensemble**: Statistiques de votre entreprise
- **Activité récente**: Dernières actions et livraisons
- **État des armoires**: Monitoring en temps réel

### Gestion des Utilisateurs

#### Créer un Nouvel Utilisateur
1. **Utilisateurs** → **Nouvel Utilisateur**
2. Remplir le formulaire:
   - Informations personnelles
   - Rôle (Admin/Livreur/Client/Support)
   - Statut du compte
3. Le mot de passe temporaire sera envoyé par email

#### Modifier un Utilisateur
1. Cliquer sur l'icône **Modifier** dans la liste
2. Mettre à jour les informations
3. Changer le statut si nécessaire (Actif/Suspendu)

### Gestion des Armoires

#### Ajouter une Nouvelle Armoire
1. **Armoires** → **Nouvelle Armoire**
2. Configurer:
   - Nom et localisation
   - ID ESP32 unique
   - Nombre de compartiments
3. L'armoire apparaîtra en statut "Hors ligne" jusqu'à connexion

#### Monitoring des Armoires
- **Statut en temps réel**: En ligne/Hors ligne/Maintenance
- **Occupation des casiers**: Disponibles/Occupés/Maintenance
- **Contrôle à distance**: Ouverture/fermeture des casiers

### Configuration des Casiers
1. **Configuration Casiers**
2. Définir la répartition par taille:
   - Petits casiers (documents, petits objets)
   - Casiers moyens (colis standards)
   - Grands casiers (gros colis)
3. Configurer les dimensions et poids maximum

## 🚚 Guide Livreur

### Créer une Livraison

#### Livraison Simple
1. **Livraisons** → **Nouvelle Livraison**
2. Remplir les informations destinataire:
   - Nom complet
   - Email (obligatoire pour notifications)
   - Téléphone (optionnel)
3. Choisir la taille du casier nécessaire
4. Ajouter des notes si nécessaire
5. Cliquer sur **Créer**

#### Import en Masse (CSV)
1. **Livraisons** → **Importer CSV**
2. Télécharger le template CSV
3. Remplir le fichier avec vos livraisons:
   ```csv
   Nom,Email,Téléphone,Taille,Notes
   Pierre Dupont,pierre@email.com,+33123456789,medium,Fragile
   Sophie Martin,sophie@email.com,,large,Livraison urgente
   ```
4. Importer le fichier
5. Vérifier l'aperçu et confirmer

### Après Création d'une Livraison
- **Code de retrait** généré automatiquement
- **QR Code** créé pour faciliter la récupération
- **Email automatique** envoyé au destinataire
- **Numéro de suivi** unique attribué

### Suivi des Livraisons
- **Statuts disponibles**:
  - 🟡 En attente (créée mais pas encore déposée)
  - 🔵 Livrée (déposée dans le casier)
  - 🟢 Récupérée (retirée par le client)
  - 🟠 Retournée (non récupérée, retour expéditeur)
  - 🔴 Expirée (délai de récupération dépassé)

## 👤 Guide Client

### Récupération d'un Colis

#### Méthode 1: Code de Retrait
1. Aller sur l'interface client
2. **Retirer un Colis**
3. Saisir:
   - Numéro de suivi (reçu par email)
   - Code de retrait (6-8 caractères)
4. Le casier s'ouvre automatiquement

#### Méthode 2: QR Code
1. Utiliser l'appareil photo du téléphone
2. Scanner le QR Code reçu par email
3. Le casier s'ouvre automatiquement

### Notifications Reçues
- **Email de livraison**: Contient le code et le QR code
- **Rappels**: Si le colis n'est pas récupéré
- **Confirmation**: Quand le colis est retiré

## 🛠️ Guide Support Technique

### Centre d'Assistance

#### Gestion des Tickets
1. **Tickets Support** pour voir tous les tickets
2. **Créer un ticket** pour les problèmes internes
3. **Répondre aux tickets**:
   - Commentaires publics (visibles par le client)
   - Notes internes (équipe support uniquement)

#### Monitoring des Armoires
1. **Monitoring** pour vue d'ensemble
2. Surveiller:
   - **Connexions**: Armoires en ligne/hors ligne
   - **Alertes**: Problèmes détectés automatiquement
   - **Métriques**: Température, batterie, signal WiFi
   - **Compartiments**: État de chaque casier

#### Outils de Diagnostic
1. **Diagnostics** pour outils avancés
2. Fonctionnalités disponibles:
   - Test de connectivité MQTT
   - Diagnostic matériel
   - Consultation des logs
   - Redémarrage à distance
   - Calibrage des capteurs

### Résolution des Problèmes Courants

#### Casier Bloqué
1. Identifier l'armoire et le casier
2. Utiliser **Contrôle à distance** → **Ouvrir**
3. Si échec, créer un ticket de maintenance
4. Marquer le casier en "Maintenance"

#### Armoire Hors Ligne
1. Vérifier la connectivité réseau
2. Redémarrer l'armoire à distance
3. Contacter l'équipe technique si nécessaire

#### Client ne Peut pas Récupérer
1. Vérifier le code de retrait
2. Contrôler manuellement l'ouverture
3. Vérifier l'expiration du colis

## 📊 Rapports et Statistiques

### Métriques Disponibles
- **Livraisons**: Total, par statut, par période
- **Utilisation**: Taux d'occupation des casiers
- **Performance**: Temps de récupération moyen
- **Incidents**: Nombre de tickets, résolution

### Export de Données
- **Format CSV**: Pour analyse externe
- **Rapports PDF**: Pour présentation
- **API**: Pour intégration avec autres systèmes

## 🔧 Paramètres et Configuration

### Paramètres Système (Super Admin)
- **Délai d'expiration**: Durée avant expiration des colis
- **Notifications**: Activation email/SMS
- **Maintenance**: Mode maintenance global

### Paramètres Entreprise (Admin)
- **Informations société**: Coordonnées, adresse
- **Utilisateurs**: Gestion des accès
- **Armoires**: Configuration et monitoring

## 📱 Utilisation Mobile

L'interface est responsive et fonctionne sur:
- **Smartphones**: Interface adaptée tactile
- **Tablettes**: Vue optimisée
- **Ordinateurs**: Interface complète

### Fonctionnalités Mobiles
- Scan QR Code natif
- Notifications push (à venir)
- Mode hors ligne (à venir)

## 🆘 Support et Assistance

### En Cas de Problème
1. **Vérifier les statuts**: Armoires et connexions
2. **Consulter les logs**: Messages d'erreur
3. **Créer un ticket**: Si problème persistant
4. **Contacter l'équipe**: support@smartlockers.com

### Maintenance Préventive
- **Vérification hebdomadaire**: État des armoires
- **Nettoyage mensuel**: Casiers et capteurs
- **Mise à jour trimestrielle**: Firmware et logiciel

## 📈 Bonnes Pratiques

### Pour les Livreurs
- Vérifier l'email du destinataire
- Choisir la bonne taille de casier
- Ajouter des notes pour colis spéciaux
- Confirmer la livraison dans le système

### Pour les Administrateurs
- Surveiller régulièrement les armoires
- Gérer proactivement les utilisateurs
- Analyser les rapports d'utilisation
- Maintenir les informations à jour

### Pour le Support
- Répondre rapidement aux tickets
- Documenter les solutions
- Surveiller les alertes système
- Former les utilisateurs

Cette documentation couvre l'utilisation complète du système Smart Lockers. Pour des questions spécifiques, consultez la documentation API ou contactez le support technique.