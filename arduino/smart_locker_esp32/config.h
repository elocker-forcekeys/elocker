/*
  Configuration pour Smart Locker ESP32
*/

#ifndef CONFIG_H
#define CONFIG_H

// Configuration WiFi
#define WIFI_SSID "SmartLocker_WiFi"
#define WIFI_PASSWORD "SmartLocker2024"

// Configuration API
#define API_BASE_URL "http://your-server.com/api"
#define CABINET_ID "ESP32_CENTRAL_001"

// Configuration matériel
#define RELAY_PIN_START 2        // Premier pin des relais (GPIO 2-17)
#define NUM_COMPARTMENTS 16      // Nombre de casiers
#define QR_READER_RX 16         // Pin RX pour lecteur QR GM65
#define QR_READER_TX 17         // Pin TX pour lecteur QR GM65
#define GSM_RX 25               // Pin RX pour module GSM SIM7600
#define GSM_TX 26               // Pin TX pour module GSM SIM7600
#define LED_STATUS 18           // LED de statut
#define BUZZER_PIN 19           // Buzzer pour notifications

// Configuration temporelle
#define SESSION_TIMEOUT 120000   // 2 minutes en millisecondes
#define MONITORING_INTERVAL 60000 // 1 minute pour le monitoring
#define QR_SCAN_INTERVAL 1000    // 1 seconde pour le scan QR

// Configuration des tailles de casiers
#define SMALL_COMPARTMENTS 6     // Casiers 1-6
#define MEDIUM_COMPARTMENTS 8    // Casiers 7-14
#define LARGE_COMPARTMENTS 2     // Casiers 15-16

// Configuration GSM
#define GSM_BAUD_RATE 115200
#define QR_BAUD_RATE 9600

// Configuration serveur web
#define WEB_SERVER_PORT 80

#endif