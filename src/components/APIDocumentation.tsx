import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  CheckCircle, 
  Key, 
  Globe, 
  Shield,
  Book,
  Terminal,
  Database,
  Zap,
  Users,
  Package,
  MapPin,
  Settings
} from 'lucide-react';
import { User } from '../services/mockAuth';

interface APIDocumentationProps {
  user: User;
}

const APIDocumentation: React.FC<APIDocumentationProps> = ({ user }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <Book className="w-4 h-4" /> },
    { id: 'authentication', label: 'Authentification', icon: <Shield className="w-4 h-4" /> },
    { id: 'users', label: 'Utilisateurs', icon: <Users className="w-4 h-4" /> },
    { id: 'lockers', label: 'Armoires', icon: <MapPin className="w-4 h-4" /> },
    { id: 'deliveries', label: 'Livraisons', icon: <Package className="w-4 h-4" /> },
    { id: 'webhooks', label: 'Webhooks', icon: <Zap className="w-4 h-4" /> },
    { id: 'errors', label: 'Codes d\'erreur', icon: <Terminal className="w-4 h-4" /> }
  ];

  const CodeBlock = ({ code, language = 'javascript', id }: { code: string; language?: string; id: string }) => (
    <div className="relative bg-gray-900 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center gap-1 text-gray-400 hover:text-white text-xs"
        >
          {copiedCode === id ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Copié
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copier
            </>
          )}
        </button>
      </div>
      <pre className="text-sm text-gray-100 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">API Smart Lockers</h3>
              <p className="text-gray-600 mb-4">
                L'API Smart Lockers vous permet d'intégrer facilement notre système de casiers intelligents 
                dans vos applications. Cette API RESTful offre un accès complet à toutes les fonctionnalités 
                de la plateforme.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">URL de Base</h4>
                </div>
                <code className="text-sm text-blue-700">https://api.smartlockers.com/v1</code>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Authentification</h4>
                </div>
                <p className="text-sm text-green-700">Bearer Token (JWT)</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Fonctionnalités Principales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Gestion des utilisateurs</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Contrôle des armoires</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Gestion des livraisons</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span className="text-gray-700">Webhooks en temps réel</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Exemple de Requête</h4>
              <CodeBlock
                id="overview-example"
                code={`// Récupérer la liste des armoires
fetch('https://api.smartlockers.com/v1/lockers', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}
              />
            </div>
          </div>
        );

      case 'authentication':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Authentification</h3>
              <p className="text-gray-600 mb-4">
                L'API utilise l'authentification JWT (JSON Web Token). Vous devez inclure votre token 
                dans l'en-tête Authorization de chaque requête.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Connexion</h4>
              <CodeBlock
                id="auth-login"
                code={`POST /auth/login

{
  "email": "user@example.com",
  "password": "your_password"
}

// Réponse
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin",
    "company_id": 2
  }
}`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Utilisation du Token</h4>
              <CodeBlock
                id="auth-usage"
                code={`// Inclure le token dans chaque requête
fetch('https://api.smartlockers.com/v1/endpoint', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
});`}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Sécurité</h4>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Les tokens expirent après 24 heures</li>
                <li>• Stockez vos tokens de manière sécurisée</li>
                <li>• Ne partagez jamais vos identifiants</li>
                <li>• Utilisez HTTPS pour toutes les requêtes</li>
              </ul>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Gestion des Utilisateurs</h3>
              <p className="text-gray-600 mb-4">
                Endpoints pour gérer les utilisateurs de votre organisation.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Lister les utilisateurs</h4>
              <CodeBlock
                id="users-list"
                code={`GET /users?page=1&limit=10&role=admin

// Réponse
{
  "users": [
    {
      "id": 1,
      "email": "admin@company.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin",
      "status": "active",
      "company_name": "My Company",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Créer un utilisateur</h4>
              <CodeBlock
                id="users-create"
                code={`POST /users

{
  "email": "newuser@company.com",
  "password": "securepassword",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "delivery",
  "phone": "+33123456789"
}

// Réponse
{
  "message": "User created successfully",
  "user_id": 42
}`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Mettre à jour un utilisateur</h4>
              <CodeBlock
                id="users-update"
                code={`PUT /users/42

{
  "first_name": "Jane",
  "last_name": "Doe",
  "status": "inactive"
}

// Réponse
{
  "message": "User updated successfully"
}`}
              />
            </div>
          </div>
        );

      case 'lockers':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Gestion des Armoires</h3>
              <p className="text-gray-600 mb-4">
                Endpoints pour contrôler vos armoires et casiers intelligents.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Lister les armoires</h4>
              <CodeBlock
                id="lockers-list"
                code={`GET /lockers?status=online

// Réponse
{
  "cabinets": [
    {
      "id": 1,
      "name": "Armoire Central",
      "location_address": "123 Rue de la Paix, Paris",
      "esp32_id": "ESP32_CENTRAL_001",
      "status": "online",
      "total_compartments": 16,
      "available_compartments": 8,
      "occupied_compartments": 6,
      "maintenance_compartments": 2
    }
  ]
}`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Détails d'une armoire</h4>
              <CodeBlock
                id="lockers-details"
                code={`GET /lockers/1

// Réponse
{
  "cabinet": {
    "id": 1,
    "name": "Armoire Central",
    "location_address": "123 Rue de la Paix, Paris",
    "esp32_id": "ESP32_CENTRAL_001",
    "status": "online"
  },
  "compartments": [
    {
      "id": 1,
      "compartment_number": 1,
      "size": "medium",
      "status": "available",
      "gpio_pin": 1
    },
    {
      "id": 2,
      "compartment_number": 2,
      "size": "large",
      "status": "occupied",
      "gpio_pin": 2,
      "tracking_number": "TRK123456",
      "recipient_name": "John Doe"
    }
  ]
}`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Contrôler un casier</h4>
              <CodeBlock
                id="lockers-control"
                code={`POST /lockers/1/compartments/2/control

{
  "action": "open"
}

// Réponse
{
  "message": "Compartment open command sent successfully",
  "command": {
    "action": "open",
    "compartment": 2,
    "gpio_pin": 2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}`}
              />
            </div>
          </div>
        );

      case 'deliveries':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Gestion des Livraisons</h3>
              <p className="text-gray-600 mb-4">
                Endpoints pour créer et gérer les livraisons dans vos casiers.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Créer une livraison</h4>
              <CodeBlock
                id="deliveries-create"
                code={`POST /deliveries

{
  "recipient_name": "John Doe",
  "recipient_email": "john@example.com",
  "recipient_phone": "+33123456789",
  "compartment_id": 5,
  "notes": "Fragile package"
}

// Réponse
{
  "message": "Delivery created successfully",
  "delivery_id": 123,
  "tracking_number": "TRK1704123456ABCD",
  "pickup_code": "ABC123XY"
}`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Récupération par le client</h4>
              <CodeBlock
                id="deliveries-pickup"
                code={`POST /deliveries/pickup

{
  "tracking_number": "TRK1704123456ABCD",
  "pickup_code": "ABC123XY"
}

// Réponse
{
  "message": "Pickup successful",
  "compartment_number": 5
}`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Récupération par QR Code</h4>
              <CodeBlock
                id="deliveries-qr"
                code={`POST /deliveries/pickup/qr

{
  "qr_data": "{\\"tracking_number\\":\\"TRK1704123456ABCD\\",\\"pickup_code\\":\\"ABC123XY\\"}"
}

// Réponse
{
  "message": "Pickup successful",
  "compartment_number": 5
}`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Lister les livraisons</h4>
              <CodeBlock
                id="deliveries-list"
                code={`GET /deliveries?status=delivered&page=1&limit=10

// Réponse
{
  "deliveries": [
    {
      "id": 123,
      "tracking_number": "TRK1704123456ABCD",
      "recipient_name": "John Doe",
      "recipient_email": "john@example.com",
      "status": "delivered",
      "delivery_person_name": "Jane Smith",
      "cabinet_name": "Armoire Central",
      "compartment_number": 5,
      "pickup_code": "ABC123XY",
      "created_at": "2024-01-15T10:30:00Z",
      "expiry_date": "2024-01-18T10:30:00Z"
    }
  ]
}`}
              />
            </div>
          </div>
        );

      case 'webhooks':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Webhooks</h3>
              <p className="text-gray-600 mb-4">
                Recevez des notifications en temps réel pour les événements importants.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Configuration</h4>
              <p className="text-gray-600 mb-3">
                Configurez votre URL de webhook dans les paramètres de votre compte pour recevoir 
                les notifications automatiquement.
              </p>
              <CodeBlock
                id="webhooks-config"
                code={`// Votre endpoint doit accepter les requêtes POST
POST https://your-domain.com/webhooks/smartlockers

Headers:
- Content-Type: application/json
- X-SmartLockers-Signature: sha256=...`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Événement: Livraison créée</h4>
              <CodeBlock
                id="webhooks-delivery-created"
                code={`{
  "event": "delivery.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "delivery_id": 123,
    "tracking_number": "TRK1704123456ABCD",
    "recipient_name": "John Doe",
    "recipient_email": "john@example.com",
    "cabinet_name": "Armoire Central",
    "compartment_number": 5,
    "pickup_code": "ABC123XY"
  }
}`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Événement: Colis récupéré</h4>
              <CodeBlock
                id="webhooks-pickup"
                code={`{
  "event": "delivery.picked_up",
  "timestamp": "2024-01-15T14:20:00Z",
  "data": {
    "delivery_id": 123,
    "tracking_number": "TRK1704123456ABCD",
    "recipient_name": "John Doe",
    "pickup_date": "2024-01-15T14:20:00Z",
    "compartment_number": 5
  }
}`}
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Événement: Statut armoire</h4>
              <CodeBlock
                id="webhooks-locker-status"
                code={`{
  "event": "locker.status_changed",
  "timestamp": "2024-01-15T15:00:00Z",
  "data": {
    "cabinet_id": 1,
    "cabinet_name": "Armoire Central",
    "esp32_id": "ESP32_CENTRAL_001",
    "old_status": "online",
    "new_status": "maintenance",
    "compartments": [
      {
        "number": 1,
        "status": "available"
      },
      {
        "number": 2,
        "status": "occupied"
      }
    ]
  }
}`}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Sécurité des Webhooks</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Vérifiez la signature X-SmartLockers-Signature</li>
                <li>• Utilisez HTTPS pour votre endpoint</li>
                <li>• Implémentez une logique d'idempotence</li>
                <li>• Répondez avec un status 200 pour confirmer la réception</li>
              </ul>
            </div>
          </div>
        );

      case 'errors':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Codes d'Erreur</h3>
              <p className="text-gray-600 mb-4">
                L'API utilise les codes de statut HTTP standard pour indiquer le succès ou l'échec d'une requête.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">200</span>
                  <span className="font-semibold">OK</span>
                </div>
                <p className="text-gray-600 text-sm">La requête a été traitée avec succès.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">201</span>
                  <span className="font-semibold">Created</span>
                </div>
                <p className="text-gray-600 text-sm">La ressource a été créée avec succès.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-mono">400</span>
                  <span className="font-semibold">Bad Request</span>
                </div>
                <p className="text-gray-600 text-sm">La requête est malformée ou contient des paramètres invalides.</p>
                <CodeBlock
                  id="error-400"
                  code={`{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}`}
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">401</span>
                  <span className="font-semibold">Unauthorized</span>
                </div>
                <p className="text-gray-600 text-sm">Token d'authentification manquant ou invalide.</p>
                <CodeBlock
                  id="error-401"
                  code={`{
  "error": "Unauthorized",
  "message": "Invalid token"
}`}
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">403</span>
                  <span className="font-semibold">Forbidden</span>
                </div>
                <p className="text-gray-600 text-sm">Permissions insuffisantes pour accéder à cette ressource.</p>
                <CodeBlock
                  id="error-403"
                  code={`{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}`}
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">404</span>
                  <span className="font-semibold">Not Found</span>
                </div>
                <p className="text-gray-600 text-sm">La ressource demandée n'existe pas.</p>
                <CodeBlock
                  id="error-404"
                  code={`{
  "error": "Not Found",
  "message": "User not found"
}`}
                />
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-mono">500</span>
                  <span className="font-semibold">Internal Server Error</span>
                </div>
                <p className="text-gray-600 text-sm">Erreur interne du serveur.</p>
                <CodeBlock
                  id="error-500"
                  code={`{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}`}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Documentation API</h2>
          <p className="text-gray-600">Guide complet pour intégrer l'API Smart Lockers</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Database className="w-4 h-4" />
          Version 1.0
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {section.icon}
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;