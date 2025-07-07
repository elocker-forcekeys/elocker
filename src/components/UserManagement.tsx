import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Mail,
  Phone,
  Shield,
  Building2,
  Power,
  PowerOff,
  Eye,
  EyeOff
} from 'lucide-react';
import { User } from '../services/mockAuth';

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'superadmin' | 'admin' | 'delivery' | 'client' | 'helpdesk';
  status: 'active' | 'inactive' | 'suspended';
  company_name: string;
  company_id: number;
  last_login: string | null;
  created_at: string;
}

interface UserManagementProps {
  user: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ user }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'client' as const,
    company_id: 0,
    status: 'active' as const
  });

  // Mock companies for dropdown
  const companies = [
    { id: 1, name: 'Smart Lockers Corp' },
    { id: 2, name: 'Delivery Express' },
    { id: 3, name: 'Quick Transport' }
  ];

  // Mock users data
  const mockUsers: UserData[] = [
    {
      id: 1,
      email: 'superadmin@smartlockers.com',
      first_name: 'Super',
      last_name: 'Admin',
      phone: '+33100000001',
      role: 'superadmin',
      status: 'active',
      company_name: 'Smart Lockers Corp',
      company_id: 1,
      last_login: '2024-01-15T10:30:00Z',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      email: 'admin@company.com',
      first_name: 'Admin',
      last_name: 'Company',
      phone: '+33100000002',
      role: 'admin',
      status: 'active',
      company_name: 'Delivery Express',
      company_id: 2,
      last_login: '2024-01-15T09:15:00Z',
      created_at: '2024-01-10T00:00:00Z'
    },
    {
      id: 3,
      email: 'delivery@company.com',
      first_name: 'Jean',
      last_name: 'Livreur',
      phone: '+33100000003',
      role: 'delivery',
      status: 'active',
      company_name: 'Delivery Express',
      company_id: 2,
      last_login: '2024-01-15T08:45:00Z',
      created_at: '2024-01-12T00:00:00Z'
    },
    {
      id: 4,
      email: 'client@company.com',
      first_name: 'Marie',
      last_name: 'Client',
      phone: '+33100000004',
      role: 'client',
      status: 'active',
      company_name: 'Delivery Express',
      company_id: 2,
      last_login: null,
      created_at: '2024-01-14T00:00:00Z'
    },
    {
      id: 5,
      email: 'helpdesk@smartlockers.com',
      first_name: 'Support',
      last_name: 'Technique',
      phone: '+33100000005',
      role: 'helpdesk',
      status: 'active',
      company_name: 'Smart Lockers Corp',
      company_id: 1,
      last_login: '2024-01-14T16:20:00Z',
      created_at: '2024-01-05T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setTimeout(() => {
      // Filter users based on current user's role
      let filteredUsers = mockUsers;
      if (user.role !== 'superadmin') {
        filteredUsers = mockUsers.filter(u => u.company_id === user.company_id);
      }
      setUsers(filteredUsers);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        // Update user
        const updatedUsers = users.map(u =>
          u.id === editingUser.id
            ? { 
                ...u, 
                ...formData,
                company_name: companies.find(c => c.id === formData.company_id)?.name || u.company_name
              }
            : u
        );
        setUsers(updatedUsers);
      } else {
        // Create new user
        const newUser: UserData = {
          id: Math.max(...users.map(u => u.id)) + 1,
          ...formData,
          company_name: companies.find(c => c.id === formData.company_id)?.name || '',
          last_login: null,
          created_at: new Date().toISOString()
        };
        setUsers([newUser, ...users]);
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'client',
      company_id: user.role === 'superadmin' ? 0 : user.company_id,
      status: 'active'
    });
  };

  const handleEdit = (userData: UserData) => {
    setEditingUser(userData);
    setFormData({
      email: userData.email,
      password: '',
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      role: userData.role,
      company_id: userData.company_id,
      status: userData.status
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleStatusToggle = async (userId: number, newStatus: 'active' | 'inactive' | 'suspended') => {
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, status: newStatus } : u
    );
    setUsers(updatedUsers);
  };

  const filteredUsers = users.filter(userData => {
    const matchesSearch = 
      userData.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userData.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || userData.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || userData.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'delivery': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-gray-100 text-gray-800';
      case 'helpdesk': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Super Admin';
      case 'admin': return 'Administrateur';
      case 'delivery': return 'Livreur';
      case 'client': return 'Client';
      case 'helpdesk': return 'Support';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const canManageUser = (targetUser: UserData) => {
    if (user.role === 'superadmin') return true;
    if (user.role === 'admin' && targetUser.company_id === user.company_id && targetUser.role !== 'superadmin') return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
          <p className="text-gray-600">Gérez les utilisateurs de votre plateforme</p>
        </div>
        {(user.role === 'superadmin' || user.role === 'admin') && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvel Utilisateur
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Administrateur</option>
              <option value="delivery">Livreur</option>
              <option value="client">Client</option>
              <option value="helpdesk">Support</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Rôle</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Société</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Dernière connexion</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {userData.first_name} {userData.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{userData.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-800 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {userData.email}
                        </p>
                        {userData.phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {userData.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getRoleColor(userData.role)}`}>
                        <Shield className="w-3 h-3" />
                        {getRoleText(userData.role)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-800 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {userData.company_name}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userData.status)}`}>
                        {getStatusText(userData.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-600">
                        {userData.last_login 
                          ? new Date(userData.last_login).toLocaleDateString('fr-FR')
                          : 'Jamais connecté'
                        }
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {canManageUser(userData) && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(userData)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {userData.status === 'active' ? (
                            <button
                              onClick={() => handleStatusToggle(userData.id, 'suspended')}
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                              title="Suspendre"
                            >
                              <PowerOff className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusToggle(userData.id, 'active')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Activer"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(userData.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {user.role === 'superadmin' && <option value="superadmin">Super Admin</option>}
                  <option value="admin">Administrateur</option>
                  <option value="delivery">Livreur</option>
                  <option value="client">Client</option>
                  <option value="helpdesk">Support</option>
                </select>
              </div>
              {user.role === 'superadmin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Société
                  </label>
                  <select
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={0}>Sélectionner une société</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;