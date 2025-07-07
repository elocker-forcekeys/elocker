# Guide d'Installation - Smart Lockers

## 📋 Prérequis

### Système
- **Node.js** 18+ 
- **MySQL** 8.0+
- **Git**
- **Navigateur web moderne**

### Optionnel (pour fonctionnalités avancées)
- **Broker MQTT** (Mosquitto recommandé)
- **Serveur SMTP** (pour les notifications email)

## 🚀 Installation Rapide

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd smart-lockers
```

### 2. Installation des Dépendances
```bash
# Installation des dépendances
npm install
```

### 3. Configuration de la Base de Données

#### Option A: Configuration MySQL Locale
```bash
# Démarrer MySQL
sudo systemctl start mysql

# Se connecter à MySQL
mysql -u root -p

# Exécuter le script de création
mysql -u root -p < database/smart_lockers_schema.sql
```

#### Option B: Configuration avec Docker
```bash
# Démarrer MySQL avec Docker
docker run --name mysql-smartlockers \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=smart_lockers \
  -p 3306:3306 \
  -d mysql:8.0

# Attendre que MySQL soit prêt (30 secondes)
sleep 30

# Importer le schéma
docker exec -i mysql-smartlockers mysql -uroot -ppassword smart_lockers < database/smart_lockers_schema.sql
```

### 4. Configuration de l'Environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer les variables d'environnement
nano .env
```

**Variables importantes à configurer:**
```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_lockers

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 5. Initialisation des Données de Démonstration
```bash
# Créer les utilisateurs de test
npm run setup:demo
```

### 6. Démarrage de l'Application

#### Mode Développement (Frontend + Backend)
```bash
npm run dev:full
```

#### Mode Frontend Uniquement
```bash
npm run dev
```

#### Mode Backend Uniquement
```bash
npm run server
```

## 🌐 Accès à l'Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 👥 Comptes de Démonstration

| Email | Mot de passe | Rôle | Description |
|-------|--------------|------|-------------|
| `superadmin@smartlockers.com` | `password123` | Super Admin | Accès complet au système |
| `admin@company.com` | `password123` | Administrateur | Gestion de l'entreprise |
| `delivery@company.com` | `password123` | Livreur | Création et gestion des livraisons |
| `client@company.com` | `password123` | Client | Récupération des colis |
| `helpdesk@smartlockers.com` | `password123` | Support | Assistance technique |

## 🔧 Configuration Avancée

### MQTT (Optionnel)
Pour activer la communication avec les armoires physiques:

```bash
# Installation de Mosquitto (Ubuntu/Debian)
sudo apt update
sudo apt install mosquitto mosquitto-clients

# Démarrage du service
sudo systemctl start mosquitto
sudo systemctl enable mosquitto

# Test de connexion
mosquitto_pub -h localhost -t test/topic -m "Hello MQTT"
```

### Notifications Email (Optionnel)
1. Créer un compte Gmail ou utiliser un serveur SMTP
2. Générer un mot de passe d'application
3. Configurer les variables EMAIL_* dans `.env`

## 🐛 Résolution des Problèmes

### Erreur de Connexion à la Base de Données
```bash
# Vérifier que MySQL est démarré
sudo systemctl status mysql

# Vérifier les permissions
mysql -u root -p -e "SHOW GRANTS FOR 'root'@'localhost';"
```

### Port Déjà Utilisé
```bash
# Trouver le processus utilisant le port 3001
lsof -i :3001

# Tuer le processus si nécessaire
kill -9 <PID>
```

### Erreurs MQTT
Les erreurs MQTT sont normales si aucun broker n'est installé. L'application fonctionne en mode simulation.

## 📱 Déploiement en Production

### Variables d'Environnement Production
```env
NODE_ENV=production
JWT_SECRET=your-very-secure-production-secret
DB_HOST=your-production-db-host
# ... autres variables
```

### Sécurité
- Changer tous les mots de passe par défaut
- Utiliser HTTPS en production
- Configurer un firewall approprié
- Sauvegarder régulièrement la base de données

## 📞 Support

En cas de problème:
1. Vérifier les logs: `npm run server` pour voir les erreurs backend
2. Consulter la console du navigateur pour les erreurs frontend
3. Vérifier que tous les services (MySQL, MQTT) sont démarrés

## 🔄 Mise à Jour

```bash
# Sauvegarder la base de données
mysqldump -u root -p smart_lockers > backup_$(date +%Y%m%d).sql

# Mettre à jour le code
git pull origin main

# Installer les nouvelles dépendances
npm install

# Redémarrer l'application
npm run dev:full
```