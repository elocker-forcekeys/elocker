import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Mail,
  Phone,
  MapPin,
  Users,
  Power,
  PowerOff
} from 'lucide-react';
import { User } from '../services/mockAuth';

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'suspended';
  userCount: number;
  lockerCount: number;
  created_at: string;
}

interface CompanyManagementProps {
  user: User;
}

const CompanyManagement: React.FC<CompanyManagementProps> = ({ user }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as const
  });

  // Mock data
  const mockCompanies: Company[] = [
    {
      id: 1,
      name: 'Smart Lockers Corp',
      email: 'contact@smartlockers.com',
      phone: '+33123456789',
      address: '123 Tech Street, Paris',
      status: 'active',
      userCount: 5,
      lockerCount: 0,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Delivery Express',
      email: 'info@deliveryexpress.com',
      phone: '+33987654321',
      address: '456 Logistics Ave, Lyon',
      status: 'active',
      userCount: 12,
      lockerCount: 3,
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 3,
      name: 'Quick Transport',
      email: 'contact@quicktransport.com',
      phone: '+33555666777',
      address: '789 Speed Road, Marseille',
      status: 'suspended',
      userCount: 8,
      lockerCount: 2,
      created_at: '2024-02-01T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCompanies(mockCompanies);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCompany) {
        // Update company
        const updatedCompanies = companies.map(company =>
          company.id === editingCompany.id
            ? { ...company, ...formData }
            : company
        );
        setCompanies(updatedCompanies);
      } else {
        // Create new company
        const newCompany: Company = {
          id: Math.max(...companies.map(c => c.id)) + 1,
          ...formData,
          userCount: 0,
          lockerCount: 0,
          created_at: new Date().toISOString()
        };
        setCompanies([newCompany, ...companies]);
      }

      setShowModal(false);
      setEditingCompany(null);
      setFormData({ name: '', email: '', phone: '', address: '', status: 'active' });
    } catch (error) {
      console.error('Error saving company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      status: company.status
    });
    setShowModal(true);
  };

  const handleDelete = async (companyId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette société ?')) {
      setCompanies(companies.filter(c => c.id !== companyId));
    }
  };

  const handleStatusToggle = async (companyId: number, newStatus: 'active' | 'inactive' | 'suspended') => {
    const updatedCompanies = companies.map(company =>
      company.id === companyId
        ? { ...company, status: newStatus }
        : company
    );
    setCompanies(updatedCompanies);
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Sociétés</h2>
          <p className="text-gray-600">Gérez les sociétés clientes de votre plateforme</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Société
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une société..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
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

      {/* Companies List */}
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
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Société</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Statistiques</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{company.name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {company.address}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-800 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {company.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {company.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-800 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {company.userCount} utilisateurs
                        </p>
                        <p className="text-sm text-gray-600">
                          {company.lockerCount} armoires
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                        {getStatusText(company.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {company.status === 'active' ? (
                          <button
                            onClick={() => handleStatusToggle(company.id, 'suspended')}
                            className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                            title="Suspendre"
                          >
                            <PowerOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusToggle(company.id, 'active')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Activer"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingCompany ? 'Modifier la société' : 'Nouvelle société'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la société
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                  Adresse
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
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
                    setEditingCompany(null);
                    setFormData({ name: '', email: '', phone: '', address: '', status: 'active' });
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

export default CompanyManagement;