// Service de mock pour l'authentification
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'superadmin' | 'admin' | 'delivery' | 'client' | 'helpdesk';
  company_name: string;
  company_id: number;
}

// Utilisateurs de démonstration
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

// Simulation d'un délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    await delay(800); // Simule un délai réseau

    const mockUser = mockUsers[email.toLowerCase()];
    
    if (!mockUser || mockUser.password !== password) {
      throw new Error('Identifiants invalides');
    }

    // Génère un token factice
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Stocke le token et l'utilisateur dans le localStorage
    localStorage.setItem('mock_token', token);
    localStorage.setItem('mock_user', JSON.stringify(mockUser.user));

    return {
      token,
      user: mockUser.user
    };
  },

  async verifyToken(token: string): Promise<{ user: User }> {
    await delay(300);

    const storedToken = localStorage.getItem('mock_token');
    const storedUser = localStorage.getItem('mock_user');

    if (!storedToken || !storedUser || storedToken !== token) {
      throw new Error('Token invalide');
    }

    return {
      user: JSON.parse(storedUser)
    };
  },

  logout(): void {
    localStorage.removeItem('mock_token');
    localStorage.removeItem('mock_user');
  }
};