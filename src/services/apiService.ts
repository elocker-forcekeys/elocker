// Service API avec détection automatique backend/mock
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  isUsingMock?: boolean;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'superadmin' | 'admin' | 'delivery' | 'client' | 'helpdesk';
  company_name: string;
  company_id: number;
}

export interface DashboardStats {
  totalDeliveries: number;
  activeLockers: number;
  availableCompartments: number;
  pendingPickups: number;
}

class ApiService {
  private baseURL: string;
  private isBackendAvailable: boolean = false;
  private checkingBackend: boolean = false;
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 secondes

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.checkBackendAvailability();
  }

  private async checkBackendAvailability(): Promise<boolean> {
    if (this.checkingBackend || (Date.now() - this.lastCheck < this.checkInterval)) {
      return this.isBackendAvailable;
    }

    this.checkingBackend = true;
    this.lastCheck = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout

      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.isBackendAvailable = true;
        console.log('✅ Backend disponible - Mode API');
      } else {
        throw new Error('Backend not responding');
      }
    } catch (error) {
      this.isBackendAvailable = false;
      console.warn('⚠️ Backend non disponible - Mode Mock activé');
      console.log('💡 Pour utiliser le backend, assurez-vous que le serveur est démarré sur', this.baseURL);
    } finally {
      this.checkingBackend = false;
    }

    return this.isBackendAvailable;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    mockFallback: () => Promise<T>
  ): Promise<ApiResponse<T>> {
    const isAvailable = await this.checkBackendAvailability();

    if (!isAvailable) {
      // Utiliser le mock
      try {
        const data = await mockFallback();
        return {
          data,
          success: true,
          isUsingMock: true,
          message: 'Données simulées - Backend non disponible'
        };
      } catch (error) {
        throw new Error(`Erreur mock: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }

    // Utiliser l'API backend
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        data: result.data || result,
        success: true,
        isUsingMock: false,
        message: result.message
      };
    } catch (error) {
      console.error('Erreur API, fallback vers mock:', error);
      // Fallback vers mock en cas d'erreur
      try {
        const data = await mockFallback();
        return {
          data,
          success: true,
          isUsingMock: true,
          message: 'Fallback vers données simulées'
        };
      } catch (mockError) {
        throw new Error(`Erreur API et Mock: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  }

  // Authentification
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.makeRequest(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      async () => {
        // Mock login
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockUsers: Record<string, { user: User; password: string }> = {
          'superadmin@smartlockers.com': {
            password: 'password123',
            user: {
              id: 1,
              email: 'superadmin@smartlockers.com',
              first_name: 'Super',
              last_name: 'Admin',
              role: 'superadmin',
              company_name: 'Smart Lockers Corp',
              company_id: 1
            }
          },
          'admin@company.com': {
            password: 'password123',
            user: {
              id: 2,
              email: 'admin@company.com',
              first_name: 'Admin',
              last_name: 'Company',
              role: 'admin',
              company_name: 'Delivery Express',
              company_id: 2
            }
          },
          'delivery@company.com': {
            password: 'password123',
            user: {
              id: 3,
              email: 'delivery@company.com',
              first_name: 'Jean',
              last_name: 'Livreur',
              role: 'delivery',
              company_name: 'Delivery Express',
              company_id: 2
            }
          },
          'client@company.com': {
            password: 'password123',
            user: {
              id: 4,
              email: 'client@company.com',
              first_name: 'Marie',
              last_name: 'Client',
              role: 'client',
              company_name: 'Delivery Express',
              company_id: 2
            }
          },
          'helpdesk@smartlockers.com': {
            password: 'password123',
            user: {
              id: 5,
              email: 'helpdesk@smartlockers.com',
              first_name: 'Support',
              last_name: 'Technique',
              role: 'helpdesk',
              company_name: 'Smart Lockers Corp',
              company_id: 1
            }
          }
        };

        const mockUser = mockUsers[email.toLowerCase()];
        
        if (!mockUser || mockUser.password !== password) {
          throw new Error('Identifiants invalides');
        }

        const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('auth_token', token);
        
        return { token, user: mockUser.user };
      }
    );
  }

  async verifyToken(token: string): Promise<ApiResponse<{ user: User }>> {
    return this.makeRequest(
      '/auth/verify',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
      async () => {
        // Mock verify
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const storedToken = localStorage.getItem('auth_token');
        if (!storedToken || storedToken !== token) {
          throw new Error('Token invalide');
        }

        // Retourner un utilisateur mock basé sur le token
        return {
          user: {
            id: 1,
            email: 'superadmin@smartlockers.com',
            first_name: 'Super',
            last_name: 'Admin',
            role: 'superadmin',
            company_name: 'Smart Lockers Corp',
            company_id: 1
          }
        };
      }
    );
  }

  // Statistiques du dashboard
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return this.makeRequest(
      '/dashboard/stats',
      { method: 'GET' },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          totalDeliveries: 156,
          activeLockers: 12,
          availableCompartments: 89,
          pendingPickups: 23
        };
      }
    );
  }

  // Gestion des utilisateurs
  async getUsers(params?: { page?: number; limit?: number; role?: string }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);

    return this.makeRequest(
      `/users?${queryParams.toString()}`,
      { method: 'GET' },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
          users: [
            {
              id: 1,
              email: 'admin@company.com',
              first_name: 'Admin',
              last_name: 'Company',
              role: 'admin',
              status: 'active',
              company_name: 'Delivery Express',
              created_at: '2024-01-01T00:00:00Z'
            }
          ],
          pagination: { page: 1, limit: 10, total: 1, pages: 1 }
        };
      }
    );
  }

  // Gestion des armoires
  async getLockers(): Promise<ApiResponse<any>> {
    return this.makeRequest(
      '/lockers',
      { method: 'GET' },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          cabinets: [
            {
              id: 1,
              name: 'Armoire Central',
              location_address: '123 Rue de la Paix, Paris',
              status: 'online',
              total_compartments: 16,
              available_compartments: 8,
              occupied_compartments: 6
            }
          ]
        };
      }
    );
  }

  // Gestion des livraisons
  async getDeliveries(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    return this.makeRequest(
      `/deliveries?${queryParams.toString()}`,
      { method: 'GET' },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 700));
        return {
          deliveries: [
            {
              id: 1,
              tracking_number: 'TRK1704123456ABCD',
              recipient_name: 'Pierre Dupont',
              recipient_email: 'pierre.dupont@email.com',
              status: 'delivered',
              delivery_person_name: 'Jean Livreur',
              cabinet_name: 'Armoire Central',
              compartment_number: 5,
              created_at: '2024-01-15T10:30:00Z'
            }
          ]
        };
      }
    );
  }

  async createDelivery(data: any): Promise<ApiResponse<any>> {
    return this.makeRequest(
      '/deliveries',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          deliveryId: Date.now(),
          trackingNumber: `TRK${Date.now()}`,
          pickupCode: Math.random().toString(36).substr(2, 8).toUpperCase()
        };
      }
    );
  }

  // Méthode pour vérifier le statut du backend
  getBackendStatus(): { available: boolean; lastCheck: Date } {
    return {
      available: this.isBackendAvailable,
      lastCheck: new Date(this.lastCheck)
    };
  }

  // Forcer une nouvelle vérification du backend
  async forceBackendCheck(): Promise<boolean> {
    this.lastCheck = 0; // Reset le cache
    return await this.checkBackendAvailability();
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }
}

export const apiService = new ApiService();