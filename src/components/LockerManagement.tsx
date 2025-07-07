import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Building2,
  Wifi,
  WifiOff,
  Settings,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Power,
  PowerOff
} from 'lucide-react';
import { User } from '../services/mockAuth';

interface LockerCabinet {
  id: number;
  name: string;
  location_address: string;
  company_name: string;
  company_id: number;
  esp32_id: string;
  total_compartments: number;
  available_compartments: number;
  occupied_compartments: number;
  maintenance_compartments: number;
  status: 'online' | 'offline' | 'maintenance';
  created_at: string;
}

interface Compartment {
  id: number;
  compartment_number: number;
  size: 'small' | 'medium' | 'large';
  gpio_pin: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  tracking_number?: string;
  recipient_name?: string;
}

interface LockerManagementProps {
  user: User;
}

const LockerManagement: React.FC<LockerManagementProps> = ({ user }) => {
  const [cabinets, setCabinets] = useState<LockerCabinet[]>([]);
  const [selectedCabinet, setSelectedCabinet] = useState<LockerCabinet | null>(null);
  const [compartments, setCompartments] = useState<Compartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showCompartmentModal, setShowCompartmentModal] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState<LockerCabinet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location_address: '',
    esp32_id: '',
    total_compartments: 16,
    company_id: 0
  });

  // Mock companies for dropdown
  const companies = [
    { id: 1, name: 'Smart Lockers Corp' },
    { id: 2, name: 'Delivery Express' },
    { id: 3, name: 'Quick Transport' }
  ];

  // Mock cabinets data
  const mockCabinets: LockerCabinet[] = [
    {
      id: 1,
      name: 'Armoire Central',
      location_address: '123 Rue de la Paix, 75001 Paris',
      company_name: 'Delivery Express',
      company_id: 2,
      esp32_id: 'ESP32_CENTRAL_001',
      total_compartments: 16,
      available_compartments: 8,
      occupied_compartments: 6,
      maintenance_compartments: 2,
      status: 'online',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Armoire Nord',
      location_address: '456 Avenue du Nord, 75018 Paris',
      company_name: 'Delivery Express',
      company_id: 2,
      esp32_id: 'ESP32_NORD_002',
      total_compartments: 12,
      available_compartments: 5,
      occupied_compartments: 7,
      maintenance_compartments: 0,
      status: 'online',
      created_at: '2024-01-10T00:00:00Z'
    },
    {
      id: 3,
      name: 'Armoire Sud',
      location_address: '789 Boulevard du Sud, 75013 Paris',
      company_name: 'Delivery Express',
      company_id: 2,
      esp32_id: 'ESP32_SUD_003',
      total_compartments: 20,
      available_compartments: 0,
      occupied_compartments: 0,
      maintenance_compartments: 20,
      status: 'maintenance',
      created_at: '2024-01-15T00:00:00Z'
    }
  ];

  // Mock compartments data
  const generateMockCompartments = (cabinetId: number, totalCompartments: number): Compartment[] => {
    const compartments: Compartment[] = [];
    for (let i = 1; i <= totalCompartments; i++) {
      const statuses: ('available' | 'occupied' | 'maintenance')[] = ['available', 'occupied', 'maintenance'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      compartments.push({
        id: cabinetId * 100 + i,
        compartment_number: i,
        size: i <= 6 ? 'small' : i <= 12 ? 'medium' : 'large',
        gpio_pin: i,
        status,
        tracking_number: status === 'occupied' ? `TRK${Date.now()}${i}` : undefined,
        recipient_name: status === 'occupied' ? `Client ${i}` : undefined
      });
    }
    return compartments;
  };

  useEffect(() => {
    loadCabinets();
  }, []);

  const loadCabinets = async () => {
    setLoading(true);
    setTimeout(() => {
      // Filter cabinets based on user role
      let filteredCabinets = mockCabinets;
      if (user.role !== 'superadmin') {
        filteredCabinets = mockCabinets.filter(c => c.company_id === user.company_id);
      }
      setCabinets(filteredCabinets);
      setLoading(false);
    }, 500);
  };

  const loadCompartments = async (cabinet: LockerCabinet) => {
    setLoading(true);
    setSelectedCabinet(cabinet);
    setTimeout(() => {
      const mockCompartments = generateMockCompartments(cabinet.id, cabinet.total_compartments);
      setCompartments(mockCompartments);
      setShowCompartmentModal(true);
      setLoading(false);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCabinet) {
        // Update cabinet
        const updatedCabinets = cabinets.map(c =>
          c.id === editingCabinet.id
            ? { 
                ...c, 
                ...formData,
                company_name: companies.find(comp => comp.id === formData.company_id)?.name || c.company_name
              }
            : c
        );
        setCabinets(updatedCabinets);
      } else {
        // Create new cabinet
        const newCabinet: LockerCabinet = {
          id: Math.max(...cabinets.map(c => c.id)) + 1,
          ...formData,
          company_name: companies.find(comp => comp.id === formData.company_id)?.name || '',
          available_compartments: formData.total_compartments,
          occupied_compartments: 0,
          maintenance_compartments: 0,
          status: 'offline',
          created_at: new Date().toISOString()
        };
        setCabinets([newCabinet, ...cabinets]);
      }

      setShowModal(false);
      setEditingCabinet(null);
      resetForm();
    } catch (error) {
      console.error('Error saving cabinet:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location_address: '',
      esp32_id: '',
      total_compartments: 16,
      company_id: user.role === 'superadmin' ? 0 : user.company_id
    });
  };

  const handleEdit = (cabinet: LockerCabinet) => {
    setEditingCabinet(cabinet);
    setFormData({
      name: cabinet.name,
      location_address: cabinet.location_address,
      esp32_id: cabinet.esp32_id,
      total_compartments: cabinet.total_compartments,
      company_id: cabinet.company_id
    });
    setShowModal(true);
  };

  const handleDelete = async (cabinetId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette armoire ?')) {
      setCabinets(cabinets.filter(c => c.id !== cabinetId));
    }
  };

  const handleStatusToggle = async (cabinetId: number, newStatus: 'online' | 'offline' | 'maintenance') => {
    const updatedCabinets = cabinets.map(c =>
      c.id === cabinetId ? { ...c, status: newStatus } : c
    );
    setCabinets(updatedCabinets);
  };

  const handleCompartmentControl = async (compartmentId: number, action: 'open' | 'close') => {
    // Simulate MQTT command
    console.log(`Sending ${action} command to compartment ${compartmentId}`);
    // In real implementation, this would send MQTT command to ESP32
  };

  const handleCompartmentStatusChange = async (compartmentId: number, newStatus: 'available' | 'occupied' | 'maintenance') => {
    const updatedCompartments = compartments.map(c =>
      c.id === compartmentId ? { ...c, status: newStatus } : c
    );
    setCompartments(updatedCompartments);
  };

  const filteredCabinets = cabinets.filter(cabinet => {
    const matchesSearch = cabinet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cabinet.location_address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cabinet.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'offline': return 'Hors ligne';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="w-4 h-4" />;
      case 'offline': return <WifiOff className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const getCompartmentStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'reserved': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompartmentIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Lock className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      case 'reserved': return <XCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const canManageCabinet = (cabinet: LockerCabinet) => {
    if (user.role === 'superadmin') return true;
    if (user.role === 'admin' && cabinet.company_id === user.company_id) return true;
    return false;
  };

  const canControlCompartments = () => {
    return ['superadmin', 'admin', 'helpdesk'].includes(user.role);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Armoires</h2>
          <p className="text-gray-600">Gérez vos armoires intelligentes et leurs casiers</p>
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
            Nouvelle Armoire
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
                placeholder="Rechercher une armoire..."
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
              <option value="online">En ligne</option>
              <option value="offline">Hors ligne</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cabinets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        ) : (
          filteredCabinets.map((cabinet) => (
            <div key={cabinet.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{cabinet.name}</h3>
                    <p className="text-sm text-gray-600">{cabinet.company_name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(cabinet.status)}`}>
                  {getStatusIcon(cabinet.status)}
                  {getStatusText(cabinet.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {cabinet.location_address}
                </p>
                <p className="text-sm text-gray-600">
                  ESP32 ID: {cabinet.esp32_id}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="text-lg font-bold text-green-600">{cabinet.available_compartments}</p>
                  <p className="text-xs text-green-600">Disponibles</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <p className="text-lg font-bold text-blue-600">{cabinet.occupied_compartments}</p>
                  <p className="text-xs text-blue-600">Occupés</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded">
                  <p className="text-lg font-bold text-orange-600">{cabinet.maintenance_compartments}</p>
                  <p className="text-xs text-orange-600">Maintenance</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => loadCompartments(cabinet)}
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Voir Casiers
                </button>
                {canManageCabinet(cabinet) && (
                  <>
                    <button
                      onClick={() => handleEdit(cabinet)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {cabinet.status === 'online' ? (
                      <button
                        onClick={() => handleStatusToggle(cabinet.id, 'maintenance')}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                        title="Maintenance"
                      >
                        <PowerOff className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusToggle(cabinet.id, 'online')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="Activer"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cabinet.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cabinet Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingCabinet ? 'Modifier l\'armoire' : 'Nouvelle armoire'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'armoire
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
                  Adresse
                </label>
                <textarea
                  required
                  value={formData.location_address}
                  onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ESP32 ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.esp32_id}
                  onChange={(e) => setFormData({ ...formData, esp32_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ESP32_UNIQUE_ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de casiers
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={formData.total_compartments}
                  onChange={(e) => setFormData({ ...formData, total_compartments: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCabinet(null);
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

      {/* Compartments Modal */}
      {showCompartmentModal && selectedCabinet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Casiers - {selectedCabinet.name}
                </h3>
                <p className="text-sm text-gray-600">{selectedCabinet.location_address}</p>
              </div>
              <button
                onClick={() => {
                  setShowCompartmentModal(false);
                  setSelectedCabinet(null);
                  setCompartments([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {compartments.map((compartment) => (
                <div
                  key={compartment.id}
                  className={`border-2 rounded-lg p-4 ${getCompartmentStatusColor(compartment.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">#{compartment.compartment_number}</span>
                    {getCompartmentIcon(compartment.status)}
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <p className="text-xs">Taille: {compartment.size}</p>
                    <p className="text-xs">Pin: {compartment.gpio_pin}</p>
                    {compartment.tracking_number && (
                      <p className="text-xs font-medium">{compartment.tracking_number}</p>
                    )}
                    {compartment.recipient_name && (
                      <p className="text-xs">{compartment.recipient_name}</p>
                    )}
                  </div>

                  {canControlCompartments() && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleCompartmentControl(compartment.id, 'open')}
                          className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 flex items-center justify-center gap-1"
                          title="Ouvrir"
                        >
                          <Unlock className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleCompartmentControl(compartment.id, 'close')}
                          className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 flex items-center justify-center gap-1"
                          title="Fermer"
                        >
                          <Lock className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <select
                        value={compartment.status}
                        onChange={(e) => handleCompartmentStatusChange(compartment.id, e.target.value as any)}
                        className="w-full text-xs border border-gray-300 rounded px-1 py-1"
                      >
                        <option value="available">Disponible</option>
                        <option value="occupied">Occupé</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="reserved">Réservé</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LockerManagement;