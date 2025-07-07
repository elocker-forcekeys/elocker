# Smart Locker ESP32

## Description
Code Arduino pour ESP32 gérant un système de casiers intelligents avec interface web pour tablette.

## Matériel requis

### Composants principaux
- **ESP32 DevKit** - Microcontrôleur principal
- **Module Relais 16 canaux 5V** - Contrôle des serrures
- **Module GSM SIM7600 5V** - Notifications SMS
- **Lecteur QR Code GM65 1D/2D 5V** - Scan des colis
- **Serrures électriques Titanmuscle DC3-5V** - Verrouillage des casiers
- **Tablette Android** - Interface utilisateur

### Connexions

#### Module Relais 16 canaux
```
ESP32 GPIO 2-17  → Relais IN1-IN16
ESP32 5V         → Relais VCC
ESP32 GND        → Relais GND
```

#### Lecteur QR GM65
```
ESP32 GPIO 16 (RX) → GM65 TX
ESP32 GPIO 17 (TX) → GM65 RX
ESP32 5V           → GM65 VCC
ESP32 GND          → GM65 GND
```

#### Module GSM SIM7600
```
ESP32 GPIO 25 (RX) → SIM7600 TX
ESP32 GPIO 26 (TX) → SIM7600 RX
ESP32 5V           → SIM7600 VCC
ESP32 GND          → SIM7600 GND
```

#### Autres composants
```
ESP32 GPIO 18 → LED de statut
ESP32 GPIO 19 → Buzzer
```

## Installation

### 1. Bibliothèques Arduino requises
```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>
#include <HardwareSerial.h>
```

### 2. Configuration
1. Modifier `config.h` avec vos paramètres
2. Configurer l'URL de votre API backend
3. Ajuster les pins selon votre câblage

### 3. Upload du code
1. Connecter l'ESP32 via USB
2. Sélectionner la carte "ESP32 Dev Module"
3. Compiler et téléverser le code

## Fonctionnalités

### Interface Web
- **Point d'accès WiFi** : `SmartLocker_WiFi`
- **Mot de passe** : `SmartLocker2024`
- **IP d'accès** : `192.168.4.1`

### Écrans disponibles
1. **Accueil** - Choix Déposer/Retirer
2. **Dépôt** - Connexion livreur + scan/saisie
3. **Retrait** - Saisie code ou scan QR
4. **Statut** - Feedback des opérations

### Gestion des sessions
- **Timeout automatique** : 2 minutes d'inactivité
- **Déconnexion manuelle** disponible
- **Timer visible** pour l'utilisateur

### API Endpoints
- `POST /api/login` - Connexion livreur
- `POST /api/logout` - Déconnexion
- `POST /api/deposit` - Dépôt de colis
- `POST /api/pickup` - Retrait de colis
- `GET /api/scan` - Lecture QR Code
- `GET /api/status` - Statut du système

## Utilisation

### Pour les livreurs
1. Cliquer sur "Déposer"
2. Saisir téléphone + mot de passe
3. Scanner le QR Code ou saisir la référence
4. Le casier approprié s'ouvre automatiquement

### Pour les clients
1. Cliquer sur "Retirer"
2. Saisir référence + code de retrait OU scanner QR Code
3. Le casier contenant le colis s'ouvre

### Notifications
- **SMS automatiques** via module GSM
- **Sons de confirmation** via buzzer
- **LED de statut** pour feedback visuel

## Monitoring

### Données envoyées à l'API
- Statut de chaque casier (libre/occupé)
- Références des colis stockés
- Activité des utilisateurs
- État de connexion du système

### Logs série
- Connexions WiFi/GSM
- Opérations de dépôt/retrait
- Erreurs et diagnostics
- Scan QR Code

## Sécurité

### Authentification
- Vérification des identifiants via API
- Session timeout automatique
- Logs de toutes les opérations

### Communication
- Chiffrement WiFi WPA2
- Requêtes HTTPS vers l'API
- Validation des codes de retrait

## Dépannage

### Problèmes courants

#### WiFi ne se connecte pas
```cpp
// Vérifier dans le moniteur série
Serial.println(WiFi.softAPIP());
```

#### Module GSM ne répond pas
```cpp
// Test AT dans setup()
gsmSerial.println("AT");
// Vérifier la réponse
```

#### Lecteur QR ne fonctionne pas
```cpp
// Vérifier les connexions série
qrSerial.begin(9600, SERIAL_8N1, QR_READER_RX, QR_READER_TX);
```

#### Relais ne s'activent pas
```cpp
// Test manuel des relais
digitalWrite(RELAY_PIN_START + i, LOW);  // Activer
digitalWrite(RELAY_PIN_START + i, HIGH); // Désactiver
```

### Codes d'erreur LED
- **1 clignotement** : Erreur WiFi
- **2 clignotements** : Erreur GSM
- **3 clignotements** : Système OK
- **5 clignotements** : Erreur API

## Maintenance

### Mise à jour du firmware
1. Connecter l'ESP32 via USB
2. Compiler le nouveau code
3. Téléverser via Arduino IDE

### Sauvegarde de configuration
- Configuration stockée dans EEPROM
- Survit aux redémarrages
- Restauration automatique

### Logs et diagnostics
- Monitoring via port série (115200 baud)
- Logs d'activité envoyés à l'API
- Alertes automatiques en cas de problème

## Support

Pour toute question ou problème :
1. Vérifier les connexions matérielles
2. Consulter les logs série
3. Tester les modules individuellement
4. Vérifier la configuration réseau