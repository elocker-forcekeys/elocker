/*
  Smart Lockers ESP32 - Système de Casiers Intelligents
  
  Matériel utilisé:
  - ESP32 DevKit
  - Module Relais 16 canaux 5V
  - Module GSM SIM7600 5V
  - Lecteur QR Code GM65 1D/2D 5V
  - Serrures électriques Titanmuscle DC3-5V
  - Tablette Android (Interface utilisateur via WiFi)
  
  Fonctionnalités:
  - Interface web pour tablette
  - Authentification livreur
  - Dépôt et retrait de colis
  - Scan QR Code et saisie manuelle
  - Gestion des casiers automatique
  - Notifications SMS/Email
  - Session timeout sécurisé
*/

#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>
#include <HardwareSerial.h>

// Configuration WiFi
const char* ssid = "SmartLocker_WiFi";
const char* password = "SmartLocker2024";

// Configuration API
const char* api_base_url = "http://your-server.com/api";
String cabinet_id = "ESP32_CENTRAL_001";

// Configuration matériel
#define RELAY_PIN_START 2    // Premier pin des relais (2-17 pour 16 relais)
#define NUM_COMPARTMENTS 16  // Nombre de casiers
#define QR_READER_RX 16     // Pin RX pour lecteur QR
#define QR_READER_TX 17     // Pin TX pour lecteur QR
#define GSM_RX 25           // Pin RX pour module GSM
#define GSM_TX 26           // Pin TX pour module GSM
#define LED_STATUS 18       // LED de statut
#define BUZZER_PIN 19       // Buzzer pour notifications

// Objets série
HardwareSerial qrSerial(1);
HardwareSerial gsmSerial(2);

// Serveur web
WebServer server(80);

// Variables globales
struct CompartmentStatus {
  bool isOccupied;
  String trackingNumber;
  String recipientCode;
  unsigned long lastActivity;
};

CompartmentStatus compartments[NUM_COMPARTMENTS];
String currentUser = "";
String currentUserRole = "";
unsigned long sessionStartTime = 0;
const unsigned long SESSION_TIMEOUT = 120000; // 2 minutes en millisecondes
bool isSessionActive = false;

// Structure pour les requêtes API
struct APIResponse {
  bool success;
  String message;
  int compartmentNumber;
  String trackingNumber;
};

void setup() {
  Serial.begin(115200);
  
  // Initialisation EEPROM
  EEPROM.begin(512);
  
  // Configuration des pins
  setupPins();
  
  // Initialisation des modules série
  qrSerial.begin(9600, SERIAL_8N1, QR_READER_RX, QR_READER_TX);
  gsmSerial.begin(115200, SERIAL_8N1, GSM_RX, GSM_TX);
  
  // Initialisation WiFi
  setupWiFi();
  
  // Configuration serveur web
  setupWebServer();
  
  // Initialisation GSM
  setupGSM();
  
  // Chargement de la configuration depuis EEPROM
  loadConfiguration();
  
  // Test initial des relais
  testRelays();
  
  Serial.println("Smart Locker ESP32 initialisé avec succès!");
  blinkLED(3); // Signal de démarrage
}

void loop() {
  server.handleClient();
  
  // Vérification du timeout de session
  checkSessionTimeout();
  
  // Lecture du lecteur QR
  handleQRReader();
  
  // Gestion des commandes GSM
  handleGSM();
  
  // Monitoring des casiers
  monitorCompartments();
  
  delay(100);
}

void setupPins() {
  // Configuration des relais
  for (int i = 0; i < NUM_COMPARTMENTS; i++) {
    pinMode(RELAY_PIN_START + i, OUTPUT);
    digitalWrite(RELAY_PIN_START + i, HIGH); // Relais inactif (HIGH)
    compartments[i].isOccupied = false;
    compartments[i].lastActivity = 0;
  }
  
  // Configuration des autres pins
  pinMode(LED_STATUS, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  digitalWrite(LED_STATUS, LOW);
  digitalWrite(BUZZER_PIN, LOW);
}

void setupWiFi() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, password);
  
  Serial.println("Point d'accès WiFi créé");
  Serial.print("SSID: ");
  Serial.println(ssid);
  Serial.print("IP: ");
  Serial.println(WiFi.softAPIP());
}

void setupWebServer() {
  // Page principale
  server.on("/", handleRoot);
  
  // API endpoints
  server.on("/api/login", HTTP_POST, handleLogin);
  server.on("/api/logout", HTTP_POST, handleLogout);
  server.on("/api/deposit", HTTP_POST, handleDeposit);
  server.on("/api/pickup", HTTP_POST, handlePickup);
  server.on("/api/scan", HTTP_POST, handleScan);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/compartments", HTTP_GET, handleCompartments);
  
  // Fichiers statiques
  server.on("/style.css", handleCSS);
  server.on("/script.js", handleJS);
  
  server.begin();
  Serial.println("Serveur web démarré");
}

void setupGSM() {
  Serial.println("Initialisation du module GSM...");
  
  gsmSerial.println("AT");
  delay(1000);
  
  gsmSerial.println("AT+CPIN?");
  delay(1000);
  
  gsmSerial.println("AT+CREG?");
  delay(1000);
  
  gsmSerial.println("AT+CMGF=1"); // Mode texte SMS
  delay(1000);
  
  Serial.println("Module GSM initialisé");
}

void handleRoot() {
  String html = generateMainHTML();
  server.send(200, "text/html", html);
}

String generateMainHTML() {
  return R"(
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Lockers</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🔒 Smart Lockers</h1>
            <div class="status-indicator" id="status"></div>
        </header>
        
        <main id="main-content">
            <!-- Écran principal -->
            <div id="home-screen" class="screen active">
                <div class="welcome">
                    <h2>Bienvenue</h2>
                    <p>Choisissez votre action</p>
                </div>
                
                <div class="main-buttons">
                    <button class="action-btn deposit-btn" onclick="showDepositScreen()">
                        📦 Déposer
                    </button>
                    <button class="action-btn pickup-btn" onclick="showPickupScreen()">
                        📤 Retirer
                    </button>
                </div>
            </div>
            
            <!-- Écran de dépôt -->
            <div id="deposit-screen" class="screen">
                <div class="screen-header">
                    <button class="back-btn" onclick="showHomeScreen()">← Retour</button>
                    <h2>Dépôt de Colis</h2>
                </div>
                
                <div id="login-form" class="form-container">
                    <h3>Connexion Livreur</h3>
                    <form onsubmit="loginDelivery(event)">
                        <input type="tel" id="phone" placeholder="Numéro de téléphone" required>
                        <input type="password" id="password" placeholder="Mot de passe" required>
                        <button type="submit">Se connecter</button>
                    </form>
                </div>
                
                <div id="deposit-actions" class="form-container" style="display:none;">
                    <div class="user-info">
                        <span id="user-name"></span>
                        <button onclick="logout()" class="logout-btn">Déconnexion</button>
                    </div>
                    
                    <div class="action-buttons">
                        <button onclick="showQRScanner()" class="scan-btn">
                            📱 Scanner QR Code
                        </button>
                        <button onclick="showManualEntry()" class="manual-btn">
                            ✏️ Saisie Manuelle
                        </button>
                    </div>
                    
                    <div id="qr-scanner" style="display:none;">
                        <h4>Scanner le QR Code du colis</h4>
                        <div class="scanner-area">
                            <div class="scanner-frame"></div>
                            <p>Placez le QR Code devant le lecteur</p>
                        </div>
                        <button onclick="cancelScan()">Annuler</button>
                    </div>
                    
                    <div id="manual-entry" style="display:none;">
                        <h4>Saisie Manuelle</h4>
                        <form onsubmit="processDeposit(event)">
                            <input type="text" id="tracking-ref" placeholder="Référence du colis" required>
                            <button type="submit">Valider</button>
                        </form>
                        <button onclick="cancelManualEntry()">Annuler</button>
                    </div>
                </div>
            </div>
            
            <!-- Écran de retrait -->
            <div id="pickup-screen" class="screen">
                <div class="screen-header">
                    <button class="back-btn" onclick="showHomeScreen()">← Retour</button>
                    <h2>Retrait de Colis</h2>
                </div>
                
                <div class="pickup-options">
                    <button onclick="showPickupForm()" class="option-btn">
                        ✏️ Saisir Code
                    </button>
                    <button onclick="showQRPickup()" class="option-btn">
                        📱 Scanner QR Code
                    </button>
                </div>
                
                <div id="pickup-form" class="form-container" style="display:none;">
                    <h3>Informations de Retrait</h3>
                    <form onsubmit="processPickup(event)">
                        <input type="text" id="pickup-tracking" placeholder="Référence du colis" required>
                        <input type="text" id="pickup-code" placeholder="Code de retrait" required>
                        <button type="submit">Retirer le Colis</button>
                    </form>
                    <button onclick="cancelPickup()">Annuler</button>
                </div>
                
                <div id="qr-pickup" style="display:none;">
                    <h4>Scanner le QR Code</h4>
                    <div class="scanner-area">
                        <div class="scanner-frame"></div>
                        <p>Placez le QR Code devant le lecteur</p>
                    </div>
                    <button onclick="cancelQRPickup()">Annuler</button>
                </div>
            </div>
            
            <!-- Écran de statut -->
            <div id="status-screen" class="screen">
                <div class="status-content">
                    <div class="status-icon" id="status-icon">⏳</div>
                    <h3 id="status-title">Traitement en cours...</h3>
                    <p id="status-message">Veuillez patienter</p>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
            
            <!-- Écran de succès -->
            <div id="success-screen" class="screen">
                <div class="success-content">
                    <div class="success-icon">✅</div>
                    <h3 id="success-title">Opération Réussie</h3>
                    <p id="success-message">Le casier s'ouvre automatiquement</p>
                    <div class="compartment-info">
                        <span>Casier N°</span>
                        <span id="compartment-number">--</span>
                    </div>
                    <button onclick="showHomeScreen()" class="continue-btn">Continuer</button>
                </div>
            </div>
            
            <!-- Écran d'erreur -->
            <div id="error-screen" class="screen">
                <div class="error-content">
                    <div class="error-icon">❌</div>
                    <h3>Erreur</h3>
                    <p id="error-message">Une erreur s'est produite</p>
                    <button onclick="showHomeScreen()" class="retry-btn">Retour à l'accueil</button>
                </div>
            </div>
        </main>
        
        <footer>
            <div class="session-info" id="session-info" style="display:none;">
                <span id="session-user"></span>
                <span id="session-timer"></span>
            </div>
        </footer>
    </div>
    
    <script src="/script.js"></script>
</body>
</html>
)";
}

void handleCSS() {
  String css = R"(
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    min-height: 100vh;
    background: white;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
}

header {
    background: #2c3e50;
    color: white;
    padding: 20px;
    text-align: center;
    position: relative;
}

header h1 {
    font-size: 2.5em;
    margin-bottom: 10px;
}

.status-indicator {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #27ae60;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}

main {
    flex: 1;
    padding: 20px;
}

.screen {
    display: none;
    animation: fadeIn 0.3s ease-in;
}

.screen.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.welcome {
    text-align: center;
    margin-bottom: 40px;
}

.welcome h2 {
    font-size: 2em;
    color: #2c3e50;
    margin-bottom: 10px;
}

.main-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    max-width: 600px;
    margin: 0 auto;
}

.action-btn {
    padding: 40px 20px;
    font-size: 1.5em;
    border: none;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.deposit-btn {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: white;
}

.pickup-btn {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
}

.action-btn:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.screen-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 2px solid #ecf0f1;
}

.back-btn {
    background: #95a5a6;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 8px;
    cursor: pointer;
    margin-right: 20px;
    font-size: 1em;
}

.back-btn:hover {
    background: #7f8c8d;
}

.form-container {
    background: #f8f9fa;
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 20px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.form-container h3 {
    margin-bottom: 20px;
    color: #2c3e50;
    text-align: center;
}

.form-container input {
    width: 100%;
    padding: 15px;
    margin-bottom: 15px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1.1em;
}

.form-container input:focus {
    outline: none;
    border-color: #3498db;
}

.form-container button {
    width: 100%;
    padding: 15px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1em;
    cursor: pointer;
    transition: background 0.3s ease;
}

.form-container button:hover {
    background: #2980b9;
}

.user-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: #e8f5e8;
    border-radius: 8px;
}

.logout-btn {
    background: #e74c3c !important;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 5px;
    cursor: pointer;
    width: auto !important;
}

.action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.scan-btn, .manual-btn, .option-btn {
    padding: 20px;
    border: none;
    border-radius: 10px;
    font-size: 1.1em;
    cursor: pointer;
    transition: all 0.3s ease;
}

.scan-btn {
    background: #27ae60;
    color: white;
}

.manual-btn {
    background: #f39c12;
    color: white;
}

.option-btn {
    background: #3498db;
    color: white;
    margin-bottom: 15px;
}

.scanner-area {
    text-align: center;
    padding: 40px;
    border: 3px dashed #3498db;
    border-radius: 15px;
    margin: 20px 0;
}

.scanner-frame {
    width: 200px;
    height: 200px;
    border: 4px solid #3498db;
    border-radius: 15px;
    margin: 0 auto 20px;
    position: relative;
    animation: scannerPulse 2s infinite;
}

@keyframes scannerPulse {
    0%, 100% { border-color: #3498db; }
    50% { border-color: #27ae60; }
}

.status-content, .success-content, .error-content {
    text-align: center;
    padding: 60px 20px;
}

.status-icon, .success-icon, .error-icon {
    font-size: 4em;
    margin-bottom: 20px;
}

.success-icon {
    color: #27ae60;
}

.error-icon {
    color: #e74c3c;
}

.compartment-info {
    background: #3498db;
    color: white;
    padding: 20px;
    border-radius: 10px;
    margin: 20px 0;
    font-size: 1.5em;
}

.continue-btn, .retry-btn {
    background: #27ae60;
    color: white;
    border: none;
    padding: 15px 30px;
    border-radius: 8px;
    font-size: 1.1em;
    cursor: pointer;
    margin-top: 20px;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #ecf0f1;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 20px;
}

.progress-fill {
    height: 100%;
    background: #3498db;
    width: 0%;
    animation: progress 3s infinite;
}

@keyframes progress {
    0% { width: 0%; }
    50% { width: 70%; }
    100% { width: 100%; }
}

footer {
    background: #34495e;
    color: white;
    padding: 15px;
    text-align: center;
}

.session-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

@media (max-width: 768px) {
    .main-buttons {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .action-buttons {
        grid-template-columns: 1fr;
    }
    
    header h1 {
        font-size: 2em;
    }
}
)";
  
  server.send(200, "text/css", css);
}

void handleJS() {
  String js = R"(
let currentSession = null;
let sessionTimer = null;
let qrScanActive = false;

// Gestion des écrans
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showHomeScreen() {
    showScreen('home-screen');
    clearSession();
}

function showDepositScreen() {
    showScreen('deposit-screen');
}

function showPickupScreen() {
    showScreen('pickup-screen');
}

// Gestion de la session livreur
async function loginDelivery(event) {
    event.preventDefault();
    
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    
    showStatusScreen('Connexion en cours...', 'Vérification des identifiants');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentSession = {
                user: result.user,
                startTime: Date.now()
            };
            
            document.getElementById('user-name').textContent = result.user.name;
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('deposit-actions').style.display = 'block';
            
            startSessionTimer();
            showDepositScreen();
        } else {
            showErrorScreen(result.message);
        }
    } catch (error) {
        showErrorScreen('Erreur de connexion');
    }
}

function logout() {
    fetch('/api/logout', { method: 'POST' });
    clearSession();
    showHomeScreen();
}

function clearSession() {
    currentSession = null;
    if (sessionTimer) {
        clearInterval(sessionTimer);
        sessionTimer = null;
    }
    document.getElementById('session-info').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('deposit-actions').style.display = 'none';
}

function startSessionTimer() {
    const sessionInfo = document.getElementById('session-info');
    const sessionUser = document.getElementById('session-user');
    const sessionTimerEl = document.getElementById('session-timer');
    
    sessionInfo.style.display = 'flex';
    sessionUser.textContent = currentSession.user.name;
    
    sessionTimer = setInterval(() => {
        const elapsed = Date.now() - currentSession.startTime;
        const remaining = Math.max(0, 120000 - elapsed); // 2 minutes
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        sessionTimerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (remaining <= 0) {
            logout();
            showErrorScreen('Session expirée');
        }
    }, 1000);
}

// Gestion du dépôt
function showQRScanner() {
    document.getElementById('qr-scanner').style.display = 'block';
    qrScanActive = true;
    startQRScan();
}

function showManualEntry() {
    document.getElementById('manual-entry').style.display = 'block';
}

function cancelScan() {
    document.getElementById('qr-scanner').style.display = 'none';
    qrScanActive = false;
}

function cancelManualEntry() {
    document.getElementById('manual-entry').style.display = 'none';
    document.getElementById('tracking-ref').value = '';
}

async function processDeposit(event) {
    event.preventDefault();
    
    const trackingRef = document.getElementById('tracking-ref').value;
    
    showStatusScreen('Traitement du dépôt...', 'Vérification du colis et recherche de casier disponible');
    
    try {
        const response = await fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                trackingNumber: trackingRef,
                deliveryPerson: currentSession.user.phone 
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccessScreen('Dépôt réussi', `Le colis a été déposé dans le casier ${result.compartmentNumber}`, result.compartmentNumber);
            // Réinitialiser le formulaire
            document.getElementById('tracking-ref').value = '';
            cancelManualEntry();
        } else {
            showErrorScreen(result.message);
        }
    } catch (error) {
        showErrorScreen('Erreur lors du dépôt');
    }
}

// Gestion du retrait
function showPickupForm() {
    document.getElementById('pickup-form').style.display = 'block';
}

function showQRPickup() {
    document.getElementById('qr-pickup').style.display = 'block';
    qrScanActive = true;
    startQRScan();
}

function cancelPickup() {
    document.getElementById('pickup-form').style.display = 'none';
    document.getElementById('pickup-tracking').value = '';
    document.getElementById('pickup-code').value = '';
}

function cancelQRPickup() {
    document.getElementById('qr-pickup').style.display = 'none';
    qrScanActive = false;
}

async function processPickup(event) {
    event.preventDefault();
    
    const trackingNumber = document.getElementById('pickup-tracking').value;
    const pickupCode = document.getElementById('pickup-code').value;
    
    showStatusScreen('Traitement du retrait...', 'Vérification du code et ouverture du casier');
    
    try {
        const response = await fetch('/api/pickup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackingNumber, pickupCode })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccessScreen('Retrait autorisé', `Votre colis se trouve dans le casier ${result.compartmentNumber}`, result.compartmentNumber);
            // Réinitialiser le formulaire
            cancelPickup();
        } else {
            showErrorScreen(result.message);
        }
    } catch (error) {
        showErrorScreen('Erreur lors du retrait');
    }
}

// Gestion du scan QR
function startQRScan() {
    // Démarrer l'écoute du lecteur QR
    const checkQR = setInterval(async () => {
        if (!qrScanActive) {
            clearInterval(checkQR);
            return;
        }
        
        try {
            const response = await fetch('/api/scan');
            const result = await response.json();
            
            if (result.qrData) {
                clearInterval(checkQR);
                qrScanActive = false;
                processQRData(result.qrData);
            }
        } catch (error) {
            console.error('Erreur scan QR:', error);
        }
    }, 1000);
}

function processQRData(qrData) {
    try {
        const data = JSON.parse(qrData);
        
        if (data.trackingNumber && data.pickupCode) {
            // QR Code de retrait
            document.getElementById('pickup-tracking').value = data.trackingNumber;
            document.getElementById('pickup-code').value = data.pickupCode;
            cancelQRPickup();
            processPickup({ preventDefault: () => {} });
        } else if (data.trackingNumber) {
            // QR Code de dépôt
            document.getElementById('tracking-ref').value = data.trackingNumber;
            cancelScan();
            processDeposit({ preventDefault: () => {} });
        }
    } catch (error) {
        // QR Code simple (référence directe)
        if (document.getElementById('qr-scanner').style.display !== 'none') {
            document.getElementById('tracking-ref').value = qrData;
            cancelScan();
        } else if (document.getElementById('qr-pickup').style.display !== 'none') {
            document.getElementById('pickup-tracking').value = qrData;
            cancelQRPickup();
        }
    }
}

// Écrans de statut
function showStatusScreen(title, message) {
    document.getElementById('status-title').textContent = title;
    document.getElementById('status-message').textContent = message;
    showScreen('status-screen');
}

function showSuccessScreen(title, message, compartmentNumber) {
    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;
    document.getElementById('compartment-number').textContent = compartmentNumber;
    showScreen('success-screen');
}

function showErrorScreen(message) {
    document.getElementById('error-message').textContent = message;
    showScreen('error-screen');
}

// Mise à jour du statut
async function updateStatus() {
    try {
        const response = await fetch('/api/status');
        const result = await response.json();
        
        const statusIndicator = document.getElementById('status');
        statusIndicator.style.background = result.online ? '#27ae60' : '#e74c3c';
    } catch (error) {
        console.error('Erreur statut:', error);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    updateStatus();
    setInterval(updateStatus, 30000); // Mise à jour toutes les 30 secondes
});
)";
  
  server.send(200, "application/javascript", js);
}

void handleLogin() {
  if (server.method() != HTTP_POST) {
    server.send(405, "application/json", "{\"success\":false,\"message\":\"Method not allowed\"}");
    return;
  }
  
  String body = server.arg("plain");
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, body);
  
  String phone = doc["phone"];
  String password = doc["password"];
  
  // Appel API pour vérifier les identifiants
  APIResponse response = callAPI("/auth/login", "{\"email\":\"" + phone + "\",\"password\":\"" + password + "\"}");
  
  if (response.success) {
    currentUser = phone;
    currentUserRole = "delivery";
    sessionStartTime = millis();
    isSessionActive = true;
    
    server.send(200, "application/json", "{\"success\":true,\"user\":{\"name\":\"Livreur\",\"phone\":\"" + phone + "\"}}");
  } else {
    server.send(401, "application/json", "{\"success\":false,\"message\":\"Identifiants invalides\"}");
  }
}

void handleLogout() {
  currentUser = "";
  currentUserRole = "";
  isSessionActive = false;
  sessionStartTime = 0;
  
  server.send(200, "application/json", "{\"success\":true}");
}

void handleDeposit() {
  if (!isSessionActive) {
    server.send(401, "application/json", "{\"success\":false,\"message\":\"Session expirée\"}");
    return;
  }
  
  String body = server.arg("plain");
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, body);
  
  String trackingNumber = doc["trackingNumber"];
  String deliveryPerson = doc["deliveryPerson"];
  
  // Appel API pour vérifier le colis et trouver un casier
  String apiData = "{\"tracking_number\":\"" + trackingNumber + "\",\"delivery_person\":\"" + deliveryPerson + "\",\"cabinet_id\":\"" + cabinet_id + "\"}";
  APIResponse response = callAPI("/deliveries/deposit", apiData);
  
  if (response.success) {
    // Ouvrir le casier
    int compartmentIndex = response.compartmentNumber - 1;
    if (compartmentIndex >= 0 && compartmentIndex < NUM_COMPARTMENTS) {
      openCompartment(compartmentIndex);
      compartments[compartmentIndex].isOccupied = true;
      compartments[compartmentIndex].trackingNumber = trackingNumber;
      compartments[compartmentIndex].lastActivity = millis();
      
      // Notification sonore
      playSuccessSound();
      
      server.send(200, "application/json", "{\"success\":true,\"compartmentNumber\":" + String(response.compartmentNumber) + "}");
    } else {
      server.send(500, "application/json", "{\"success\":false,\"message\":\"Erreur casier\"}");
    }
  } else {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"" + response.message + "\"}");
  }
}

void handlePickup() {
  String body = server.arg("plain");
  DynamicJsonDocument doc(1024);
  deserializeJson(doc, body);
  
  String trackingNumber = doc["trackingNumber"];
  String pickupCode = doc["pickupCode"];
  
  // Appel API pour vérifier le code de retrait
  String apiData = "{\"tracking_number\":\"" + trackingNumber + "\",\"pickup_code\":\"" + pickupCode + "\"}";
  APIResponse response = callAPI("/deliveries/pickup", apiData);
  
  if (response.success) {
    // Ouvrir le casier
    int compartmentIndex = response.compartmentNumber - 1;
    if (compartmentIndex >= 0 && compartmentIndex < NUM_COMPARTMENTS) {
      openCompartment(compartmentIndex);
      compartments[compartmentIndex].isOccupied = false;
      compartments[compartmentIndex].trackingNumber = "";
      compartments[compartmentIndex].recipientCode = "";
      compartments[compartmentIndex].lastActivity = millis();
      
      // Notification sonore
      playSuccessSound();
      
      server.send(200, "application/json", "{\"success\":true,\"compartmentNumber\":" + String(response.compartmentNumber) + "}");
    } else {
      server.send(500, "application/json", "{\"success\":false,\"message\":\"Erreur casier\"}");
    }
  } else {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"" + response.message + "\"}");
  }
}

void handleScan() {
  String qrData = readQRCode();
  
  if (qrData.length() > 0) {
    server.send(200, "application/json", "{\"qrData\":\"" + qrData + "\"}");
  } else {
    server.send(200, "application/json", "{\"qrData\":\"\"}");
  }
}

void handleStatus() {
  DynamicJsonDocument doc(1024);
  doc["online"] = true;
  doc["cabinet_id"] = cabinet_id;
  doc["session_active"] = isSessionActive;
  doc["compartments_available"] = getAvailableCompartments();
  doc["compartments_occupied"] = getOccupiedCompartments();
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

void handleCompartments() {
  DynamicJsonDocument doc(2048);
  JsonArray compartmentsArray = doc.createNestedArray("compartments");
  
  for (int i = 0; i < NUM_COMPARTMENTS; i++) {
    JsonObject comp = compartmentsArray.createNestedObject();
    comp["number"] = i + 1;
    comp["occupied"] = compartments[i].isOccupied;
    comp["tracking"] = compartments[i].trackingNumber;
  }
  
  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

APIResponse callAPI(String endpoint, String data) {
  APIResponse response;
  response.success = false;
  response.message = "Erreur de connexion";
  
  HTTPClient http;
  http.begin(String(api_base_url) + endpoint);
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(data);
  
  if (httpResponseCode > 0) {
    String responseString = http.getString();
    
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, responseString);
    
    response.success = doc["success"];
    response.message = doc["message"];
    response.compartmentNumber = doc["compartmentNumber"];
    response.trackingNumber = doc["trackingNumber"];
  }
  
  http.end();
  return response;
}

void openCompartment(int compartmentIndex) {
  if (compartmentIndex >= 0 && compartmentIndex < NUM_COMPARTMENTS) {
    // Activer le relais (LOW pour activer)
    digitalWrite(RELAY_PIN_START + compartmentIndex, LOW);
    delay(500); // Maintenir ouvert 500ms
    digitalWrite(RELAY_PIN_START + compartmentIndex, HIGH);
    
    Serial.println("Casier " + String(compartmentIndex + 1) + " ouvert");
    
    // LED de confirmation
    blinkLED(2);
  }
}

String readQRCode() {
  String qrData = "";
  
  if (qrSerial.available()) {
    qrData = qrSerial.readStringUntil('\n');
    qrData.trim();
    
    if (qrData.length() > 0) {
      Serial.println("QR Code lu: " + qrData);
    }
  }
  
  return qrData;
}

void checkSessionTimeout() {
  if (isSessionActive && (millis() - sessionStartTime > SESSION_TIMEOUT)) {
    Serial.println("Session expirée");
    currentUser = "";
    currentUserRole = "";
    isSessionActive = false;
    sessionStartTime = 0;
  }
}

void handleQRReader() {
  // Lecture continue du lecteur QR
  if (qrSerial.available()) {
    String qrData = qrSerial.readStringUntil('\n');
    qrData.trim();
    
    if (qrData.length() > 0) {
      Serial.println("QR Code détecté: " + qrData);
      // Le QR Code sera récupéré par l'interface web via /api/scan
    }
  }
}

void handleGSM() {
  // Gestion des commandes GSM entrantes
  if (gsmSerial.available()) {
    String gsmData = gsmSerial.readString();
    Serial.println("GSM: " + gsmData);
  }
}

void monitorCompartments() {
  // Monitoring périodique des casiers
  static unsigned long lastMonitoring = 0;
  
  if (millis() - lastMonitoring > 60000) { // Toutes les minutes
    lastMonitoring = millis();
    
    // Envoyer le statut des casiers à l'API
    sendCompartmentStatus();
  }
}

void sendCompartmentStatus() {
  DynamicJsonDocument doc(2048);
  doc["cabinet_id"] = cabinet_id;
  doc["timestamp"] = millis();
  
  JsonArray compartmentsArray = doc.createNestedArray("compartments");
  
  for (int i = 0; i < NUM_COMPARTMENTS; i++) {
    JsonObject comp = compartmentsArray.createNestedObject();
    comp["number"] = i + 1;
    comp["occupied"] = compartments[i].isOccupied;
    comp["tracking"] = compartments[i].trackingNumber;
    comp["last_activity"] = compartments[i].lastActivity;
  }
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Envoyer à l'API
  callAPI("/cabinets/status", jsonString);
}

void sendSMS(String phoneNumber, String message) {
  gsmSerial.println("AT+CMGS=\"" + phoneNumber + "\"");
  delay(1000);
  gsmSerial.print(message);
  delay(1000);
  gsmSerial.write(26); // Ctrl+Z pour envoyer
  delay(5000);
  
  Serial.println("SMS envoyé à " + phoneNumber + ": " + message);
}

void playSuccessSound() {
  // Mélodie de succès
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}

void playErrorSound() {
  // Son d'erreur
  for (int i = 0; i < 5; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(50);
    digitalWrite(BUZZER_PIN, LOW);
    delay(50);
  }
}

void blinkLED(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_STATUS, HIGH);
    delay(200);
    digitalWrite(LED_STATUS, LOW);
    delay(200);
  }
}

void testRelays() {
  Serial.println("Test des relais...");
  
  for (int i = 0; i < NUM_COMPARTMENTS; i++) {
    digitalWrite(RELAY_PIN_START + i, LOW);
    delay(100);
    digitalWrite(RELAY_PIN_START + i, HIGH);
    delay(100);
  }
  
  Serial.println("Test des relais terminé");
}

int getAvailableCompartments() {
  int count = 0;
  for (int i = 0; i < NUM_COMPARTMENTS; i++) {
    if (!compartments[i].isOccupied) count++;
  }
  return count;
}

int getOccupiedCompartments() {
  int count = 0;
  for (int i = 0; i < NUM_COMPARTMENTS; i++) {
    if (compartments[i].isOccupied) count++;
  }
  return count;
}

void loadConfiguration() {
  // Charger la configuration depuis EEPROM
  // TODO: Implémenter le chargement de la configuration
}

void saveConfiguration() {
  // Sauvegarder la configuration dans EEPROM
  // TODO: Implémenter la sauvegarde de la configuration
}