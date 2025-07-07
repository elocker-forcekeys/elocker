// Service d'internationalisation
export type Language = 'fr' | 'en' | 'es' | 'de';

export interface TranslationKeys {
  // Navigation
  'nav.overview': string;
  'nav.companies': string;
  'nav.users': string;
  'nav.lockers': string;
  'nav.deliveries': string;
  'nav.settings': string;
  'nav.logout': string;

  // Login
  'login.title': string;
  'login.subtitle': string;
  'login.email': string;
  'login.password': string;
  'login.submit': string;
  'login.loading': string;
  'login.error.invalid': string;
  'login.demo.accounts': string;

  // Dashboard
  'dashboard.title': string;
  'dashboard.welcome': string;
  'dashboard.stats.deliveries': string;
  'dashboard.stats.lockers': string;
  'dashboard.stats.compartments': string;
  'dashboard.stats.pending': string;
  'dashboard.recent.activity': string;
  'dashboard.locker.status': string;

  // Common
  'common.loading': string;
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.create': string;
  'common.search': string;
  'common.filter': string;
  'common.status': string;
  'common.actions': string;
  'common.yes': string;
  'common.no': string;

  // Status
  'status.online': string;
  'status.offline': string;
  'status.maintenance': string;
  'status.active': string;
  'status.inactive': string;

  // Backend status
  'backend.available': string;
  'backend.unavailable': string;
  'backend.mock.mode': string;
  'backend.check.again': string;
}

const translations: Record<Language, TranslationKeys> = {
  fr: {
    // Navigation
    'nav.overview': 'Vue d\'ensemble',
    'nav.companies': 'Sociétés',
    'nav.users': 'Utilisateurs',
    'nav.lockers': 'Armoires',
    'nav.deliveries': 'Livraisons',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',

    // Login
    'login.title': 'Smart Lockers',
    'login.subtitle': 'Connectez-vous à votre compte',
    'login.email': 'Adresse email',
    'login.password': 'Mot de passe',
    'login.submit': 'Se connecter',
    'login.loading': 'Connexion...',
    'login.error.invalid': 'Identifiants invalides',
    'login.demo.accounts': 'Comptes de démonstration :',

    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue',
    'dashboard.stats.deliveries': 'Total Livraisons',
    'dashboard.stats.lockers': 'Armoires Actives',
    'dashboard.stats.compartments': 'Casiers Disponibles',
    'dashboard.stats.pending': 'En Attente',
    'dashboard.recent.activity': 'Activité Récente',
    'dashboard.locker.status': 'État des Armoires',

    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.create': 'Créer',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.status': 'Statut',
    'common.actions': 'Actions',
    'common.yes': 'Oui',
    'common.no': 'Non',

    // Status
    'status.online': 'En ligne',
    'status.offline': 'Hors ligne',
    'status.maintenance': 'Maintenance',
    'status.active': 'Actif',
    'status.inactive': 'Inactif',

    // Backend status
    'backend.available': 'Serveur connecté',
    'backend.unavailable': 'Serveur non disponible',
    'backend.mock.mode': 'Mode simulation activé',
    'backend.check.again': 'Vérifier à nouveau',
  },

  en: {
    // Navigation
    'nav.overview': 'Overview',
    'nav.companies': 'Companies',
    'nav.users': 'Users',
    'nav.lockers': 'Lockers',
    'nav.deliveries': 'Deliveries',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Login
    'login.title': 'Smart Lockers',
    'login.subtitle': 'Sign in to your account',
    'login.email': 'Email address',
    'login.password': 'Password',
    'login.submit': 'Sign in',
    'login.loading': 'Signing in...',
    'login.error.invalid': 'Invalid credentials',
    'login.demo.accounts': 'Demo accounts:',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.stats.deliveries': 'Total Deliveries',
    'dashboard.stats.lockers': 'Active Lockers',
    'dashboard.stats.compartments': 'Available Compartments',
    'dashboard.stats.pending': 'Pending',
    'dashboard.recent.activity': 'Recent Activity',
    'dashboard.locker.status': 'Locker Status',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.yes': 'Yes',
    'common.no': 'No',

    // Status
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.maintenance': 'Maintenance',
    'status.active': 'Active',
    'status.inactive': 'Inactive',

    // Backend status
    'backend.available': 'Server connected',
    'backend.unavailable': 'Server unavailable',
    'backend.mock.mode': 'Simulation mode enabled',
    'backend.check.again': 'Check again',
  },

  es: {
    // Navigation
    'nav.overview': 'Resumen',
    'nav.companies': 'Empresas',
    'nav.users': 'Usuarios',
    'nav.lockers': 'Casilleros',
    'nav.deliveries': 'Entregas',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar sesión',

    // Login
    'login.title': 'Smart Lockers',
    'login.subtitle': 'Inicia sesión en tu cuenta',
    'login.email': 'Dirección de correo',
    'login.password': 'Contraseña',
    'login.submit': 'Iniciar sesión',
    'login.loading': 'Iniciando sesión...',
    'login.error.invalid': 'Credenciales inválidas',
    'login.demo.accounts': 'Cuentas de demostración:',

    // Dashboard
    'dashboard.title': 'Panel de control',
    'dashboard.welcome': 'Bienvenido',
    'dashboard.stats.deliveries': 'Total Entregas',
    'dashboard.stats.lockers': 'Casilleros Activos',
    'dashboard.stats.compartments': 'Compartimentos Disponibles',
    'dashboard.stats.pending': 'Pendientes',
    'dashboard.recent.activity': 'Actividad Reciente',
    'dashboard.locker.status': 'Estado de Casilleros',

    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.status': 'Estado',
    'common.actions': 'Acciones',
    'common.yes': 'Sí',
    'common.no': 'No',

    // Status
    'status.online': 'En línea',
    'status.offline': 'Fuera de línea',
    'status.maintenance': 'Mantenimiento',
    'status.active': 'Activo',
    'status.inactive': 'Inactivo',

    // Backend status
    'backend.available': 'Servidor conectado',
    'backend.unavailable': 'Servidor no disponible',
    'backend.mock.mode': 'Modo simulación activado',
    'backend.check.again': 'Verificar de nuevo',
  },

  de: {
    // Navigation
    'nav.overview': 'Übersicht',
    'nav.companies': 'Unternehmen',
    'nav.users': 'Benutzer',
    'nav.lockers': 'Schließfächer',
    'nav.deliveries': 'Lieferungen',
    'nav.settings': 'Einstellungen',
    'nav.logout': 'Abmelden',

    // Login
    'login.title': 'Smart Lockers',
    'login.subtitle': 'Melden Sie sich in Ihrem Konto an',
    'login.email': 'E-Mail-Adresse',
    'login.password': 'Passwort',
    'login.submit': 'Anmelden',
    'login.loading': 'Anmeldung...',
    'login.error.invalid': 'Ungültige Anmeldedaten',
    'login.demo.accounts': 'Demo-Konten:',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Willkommen',
    'dashboard.stats.deliveries': 'Gesamte Lieferungen',
    'dashboard.stats.lockers': 'Aktive Schließfächer',
    'dashboard.stats.compartments': 'Verfügbare Fächer',
    'dashboard.stats.pending': 'Ausstehend',
    'dashboard.recent.activity': 'Letzte Aktivität',
    'dashboard.locker.status': 'Schließfach-Status',

    // Common
    'common.loading': 'Laden...',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.create': 'Erstellen',
    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.status': 'Status',
    'common.actions': 'Aktionen',
    'common.yes': 'Ja',
    'common.no': 'Nein',

    // Status
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.maintenance': 'Wartung',
    'status.active': 'Aktiv',
    'status.inactive': 'Inaktiv',

    // Backend status
    'backend.available': 'Server verbunden',
    'backend.unavailable': 'Server nicht verfügbar',
    'backend.mock.mode': 'Simulationsmodus aktiviert',
    'backend.check.again': 'Erneut prüfen',
  }
};

class I18nService {
  private currentLanguage: Language = 'fr';
  private listeners: Array<(language: Language) => void> = [];

  constructor() {
    // Charger la langue depuis le localStorage ou détecter la langue du navigateur
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && this.isValidLanguage(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else {
      // Détecter la langue du navigateur
      const browserLang = navigator.language.split('-')[0] as Language;
      if (this.isValidLanguage(browserLang)) {
        this.currentLanguage = browserLang;
      }
    }
  }

  private isValidLanguage(lang: string): lang is Language {
    return ['fr', 'en', 'es', 'de'].includes(lang);
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    this.notifyListeners();
  }

  getAvailableLanguages(): Array<{ code: Language; name: string; flag: string }> {
    return [
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
    ];
  }

  t(key: keyof TranslationKeys): string {
    return translations[this.currentLanguage][key] || key;
  }

  // Hook pour React
  subscribe(callback: (language: Language) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }
}

export const i18nService = new I18nService();

// Hook React pour utiliser les traductions
import { useState, useEffect } from 'react';

export function useTranslation() {
  const [language, setLanguage] = useState(i18nService.getCurrentLanguage());

  useEffect(() => {
    const unsubscribe = i18nService.subscribe(setLanguage);
    return unsubscribe;
  }, []);

  return {
    t: i18nService.t.bind(i18nService),
    language,
    setLanguage: i18nService.setLanguage.bind(i18nService),
    availableLanguages: i18nService.getAvailableLanguages()
  };
}