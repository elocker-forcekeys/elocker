import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  QrCode,
  Calendar
} from 'lucide-react';
import { User as UserType } from '../services/mockAuth';

interface Delivery {
  id: number;
  tracking_number: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone?: string;
  delivery_person_name: string;
  cabinet_name: string;
  compartment_number: number;
  compartment_size: 'small' | 'medium' | 'large';
  status: 'pending' | 'delivered' | 'picked_up' | 'returned' | 'expired';
  pickup_code?: string;
  qr_code?: string;
  notes?: string;
  created_at: string;
  delivery_date?: string;
  pickup_date?: string;
  expiry_date: string;
}

interface DeliveryManagementProps {
  user: UserType;
}

const DeliveryManagement: React.FC<DeliveryManagementProps> = ({ user }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    compartment_size: 'medium' as const,
    notes: ''
  });

  // Mock deliveries data
  const mockDeliveries: Delivery[] = [
    {
      id: 1,
      tracking_number: 'TRK1704123456ABCD',
      recipient_name: 'Pierre Dupont',
      recipient_email: 'pierre.dupont@email.com',
      recipient_phone: '+33123456789',
      delivery_person_name: 'Jean Livreur',
      cabinet_name: 'Armoire Central',
      compartment_number: 5,
      compartment_size: 'medium',
      status: 'delivered',
      pickup_code: 'ABC123XY',
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      notes: 'Fragile - Manipuler avec précaution',
      created_at: '2024-01-15T10:30:00Z',
      delivery_date: '2024-01-15T10:30:00Z',
      expiry_date: '2024-01-18T10:30:00Z'
    },
    {
      id: 2,
      tracking_number: 'TRK1704123457EFGH',
      recipient_name: 'Sophie Martin',
      recipient_email: 'sophie.martin@email.com',
      recipient_phone: '+33987654321',
      delivery_person_name: 'Jean Livreur',
      cabinet_name: 'Armoire Nord',
      compartment_number: 3,
      compartment_size: 'large',
      status: 'picked_up',
      pickup_code: 'DEF456ZW',
      created_at: '2024-01-15T09:15:00Z',
      delivery_date: '2024-01-15T09:15:00Z',
      pickup_date: '2024-01-15T14:20:00Z',
      expiry_date: '2024-01-18T09:15:00Z'
    },
    {
      id: 3,
      tracking_number: 'TRK1704123458IJKL',
      recipient_name: 'Marc Leblanc',
      recipient_email: 'marc.leblanc@email.com',
      delivery_person_name: 'Jean Livreur',
      cabinet_name: 'Armoire Central',
      compartment_number: 8,
      compartment_size: 'small',
      status: 'pending',
      notes: 'Livraison urgente',
      created_at: '2024-01-15T08:45:00Z',
      expiry_date: '2024-01-18T08:45:00Z'
    }
  ];

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setLoading(true);
    setTimeout(() => {
      // Filter deliveries based on user role
      let filteredDeliveries = mockDeliveries;
      if (user.role === 'delivery') {
        filteredDeliveries = mockDeliveries.filter(d => d.delivery_person_name.includes(user.first_name));
      } else if (user.role !== 'superadmin') {
        // Filter by company for non-superadmin users
        filteredDeliveries = mockDeliveries;
      }
      setDeliveries(filteredDeliveries);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate tracking number and pickup code
      const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const pickupCode = Math.random().toString(36).substr(2, 8).toUpperCase();

      const newDelivery: Delivery = {
        id: Math.max(...deliveries.map(d => d.id)) + 1,
        tracking_number: trackingNumber,
        ...formData,
        delivery_person_name: `${user.first_name} ${user.last_name}`,
        cabinet_name: 'Armoire Central', // Default cabinet
        compartment_number: Math.floor(Math.random() * 16) + 1,
        status: 'pending',
        pickup_code: pickupCode,
        created_at: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() // 72h from now
      };

      setDeliveries([newDelivery, ...deliveries]);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating delivery:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      recipient_name: '',
      recipient_email: '',
      recipient_phone: '',
      compartment_size: 'medium',
      notes: ''
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      
      // Parse CSV for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
            return obj;
          }, {} as any);
        });
        setCsvPreview(preview);
      };
      reader.readAsText(file);
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) return;

    setLoading(true);
    try {
      // Simulate CSV import
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock deliveries from CSV
      const newDeliveries = csvPreview.map((row, index) => ({
        id: Math.max(...deliveries.map(d => d.id)) + index + 1,
        tracking_number: `TRK${Date.now()}${index}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        recipient_name: row['Nom'] || row['recipient_name'] || `Client ${index + 1}`,
        recipient_email: row['Email'] || row['recipient_email'] || `client${index + 1}@email.com`,
        recipient_phone: row['Téléphone'] || row['recipient_phone'] || '',
        delivery_person_name: `${user.first_name} ${user.last_name}`,
        cabinet_name: 'Armoire Central',
        compartment_number: Math.floor(Math.random() * 16) + 1,
        compartment_size: (row['Taille'] || row['compartment_size'] || 'medium') as 'small' | 'medium' | 'large',
        status: 'pending' as const,
        pickup_code: Math.random().toString(36).substr(2, 8).toUpperCase(),
        notes: row['Notes'] || row['notes'] || '',
        created_at: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
      }));

      setDeliveries([...newDeliveries, ...deliveries]);
      setShowImportModal(false);
      setCsvFile(null);
      setCsvPreview([]);
    } catch (error) {
      console.error('Error importing CSV:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = `Nom,Email,Téléphone,Taille,Notes
Pierre Dupont,pierre.dupont@email.com,+33123456789,medium,Fragile
Sophie Martin,sophie.martin@email.com,+33987654321,large,Livraison urgente
Marc Leblanc,marc.leblanc@email.com,,small,`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_livraisons.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.recipient_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-orange-100 text-orange-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'delivered': return 'Livré';
      case 'picked_up': return 'Récupéré';
      case 'returned': return 'Retourné';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'picked_up': return <CheckCircle className="w-4 h-4" />;
      case 'returned': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'large': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeText = (size: string) => {
    switch (size) {
      case 'small': return 'Petit';
      case 'medium': return 'Moyen';
      case 'large': return 'Grand';
      default: return size;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Livraisons</h2>
          <p className="text-gray-600">Gérez les livraisons et importez en masse</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadCSVTemplate}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Template CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importer CSV
          </button>
          {['superadmin', 'admin', 'delivery'].includes(user.role) && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Livraison
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par numéro de suivi, nom ou email..."
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
              <option value="pending">En attente</option>
              <option value="delivered">Livré</option>
              <option value="picked_up">Récupéré</option>
              <option value="returned">Retourné</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
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
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Livraison</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Destinataire</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Emplacement</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Dates</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{delivery.tracking_number}</p>
                          <p className="text-sm text-gray-600">Par {delivery.delivery_person_name}</p>
                          {delivery.pickup_code && (
                            <p className="text-xs text-blue-600 font-mono">Code: {delivery.pickup_code}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-800 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {delivery.recipient_name}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {delivery.recipient_email}
                        </p>
                        {delivery.recipient_phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {delivery.recipient_phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {delivery.cabinet_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Casier #{delivery.compartment_number}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSizeColor(delivery.compartment_size)}`}>
                          {getSizeText(delivery.compartment_size)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        {getStatusText(delivery.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Créé: {new Date(delivery.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        {delivery.delivery_date && (
                          <p>Livré: {new Date(delivery.delivery_date).toLocaleDateString('fr-FR')}</p>
                        )}
                        {delivery.pickup_date && (
                          <p>Récupéré: {new Date(delivery.pickup_date).toLocaleDateString('fr-FR')}</p>
                        )}
                        <p className="text-orange-600">
                          Expire: {new Date(delivery.expiry_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDelivery(delivery)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {delivery.qr_code && (
                          <button
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        )}
                        {['superadmin', 'admin'].includes(user.role) && (
                          <>
                            <button
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Delivery Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nouvelle Livraison</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du destinataire
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipient_name}
                  onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email du destinataire
                </label>
                <input
                  type="email"
                  required
                  value={formData.recipient_email}
                  onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={formData.recipient_phone}
                  onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taille du casier
                </label>
                <select
                  value={formData.compartment_size}
                  onChange={(e) => setFormData({ ...formData, compartment_size: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="small">Petit</option>
                  <option value="medium">Moyen</option>
                  <option value="large">Grand</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
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
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Importer des Livraisons (CSV)</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Format attendu: Nom, Email, Téléphone, Taille, Notes
                </p>
              </div>

              {csvPreview.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu des données</h4>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(csvPreview[0]).map(header => (
                            <th key={header} className="px-3 py-2 text-left font-medium text-gray-700">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {csvPreview.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value: any, i) => (
                              <td key={i} className="px-3 py-2 text-gray-600">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {csvPreview.length} lignes détectées (aperçu des 5 premières)
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setCsvFile(null);
                    setCsvPreview([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleImportCSV}
                  disabled={!csvFile || loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Importation...' : 'Importer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Détails de la Livraison</h3>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Numéro de suivi</label>
                  <p className="text-gray-900 font-mono">{selectedDelivery.tracking_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Code de retrait</label>
                  <p className="text-blue-600 font-mono font-bold">{selectedDelivery.pickup_code}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Destinataire</label>
                <p className="text-gray-900">{selectedDelivery.recipient_name}</p>
                <p className="text-gray-600 text-sm">{selectedDelivery.recipient_email}</p>
                {selectedDelivery.recipient_phone && (
                  <p className="text-gray-600 text-sm">{selectedDelivery.recipient_phone}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Armoire</label>
                  <p className="text-gray-900">{selectedDelivery.cabinet_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Casier</label>
                  <p className="text-gray-900">#{selectedDelivery.compartment_number}</p>
                </div>
              </div>

              {selectedDelivery.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-gray-900">{selectedDelivery.notes}</p>
                </div>
              )}

              {selectedDelivery.qr_code && (
                <div className="text-center">
                  <label className="text-sm font-medium text-gray-700">QR Code</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="w-32 h-32 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;