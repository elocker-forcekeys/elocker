import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Plus, 
  Search, 
  Filter,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Settings,
  Wifi,
  WifiOff,
  Battery,
  Thermometer,
  Activity,
  Eye,
  Edit,
  Send,
  Paperclip,
  Star,
  MoreVertical
} from 'lucide-react';
import { User as UserType } from '../services/mockAuth';

interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  category: 'technical' | 'delivery' | 'account' | 'hardware' | 'other';
  reporter_name: string;
  reporter_email: string;
  reporter_phone?: string;
  company_name: string;
  assigned_to?: string;
  cabinet_id?: number;
  cabinet_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  rating?: number;
  comments: TicketComment[];
}

interface TicketComment {
  id: number;
  ticket_id: number;
  author_name: string;
  author_role: string;
  message: string;
  is_internal: boolean;
  attachments?: string[];
  created_at: string;
}

interface CabinetStatus {
  id: number;
  name: string;
  location: string;
  company_name: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  last_ping: string;
  temperature?: number;
  battery_level?: number;
  wifi_signal?: number;
  compartments_status: {
    available: number;
    occupied: number;
    maintenance: number;
    error: number;
  };
  alerts: string[];
}

interface HelpdeskManagementProps {
  user: UserType;
}

const HelpdeskManagement: React.FC<HelpdeskManagementProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cabinetStatuses, setCabinetStatuses] = useState<CabinetStatus[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  // Mock tickets data
  const mockTickets: Ticket[] = [
    {
      id: 1,
      ticket_number: 'TKT-2024-001',
      title: 'Casier bloqué - Armoire Central',
      description: 'Le casier numéro 5 de l\'armoire Central ne s\'ouvre plus. Le client ne peut pas récupérer son colis.',
      priority: 'high',
      status: 'open',
      category: 'hardware',
      reporter_name: 'Jean Livreur',
      reporter_email: 'jean.livreur@company.com',
      reporter_phone: '+33123456789',
      company_name: 'Delivery Express',
      cabinet_id: 1,
      cabinet_name: 'Armoire Central',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      comments: [
        {
          id: 1,
          ticket_id: 1,
          author_name: 'Jean Livreur',
          author_role: 'delivery',
          message: 'Le casier ne répond pas aux commandes d\'ouverture. J\'ai essayé plusieurs fois.',
          is_internal: false,
          created_at: '2024-01-15T10:30:00Z'
        }
      ]
    },
    {
      id: 2,
      ticket_number: 'TKT-2024-002',
      title: 'Problème de connexion MQTT',
      description: 'L\'armoire Nord n\'envoie plus de données de statut depuis ce matin.',
      priority: 'medium',
      status: 'in_progress',
      category: 'technical',
      reporter_name: 'Admin Company',
      reporter_email: 'admin@company.com',
      company_name: 'Delivery Express',
      assigned_to: 'Support Technique',
      cabinet_id: 2,
      cabinet_name: 'Armoire Nord',
      created_at: '2024-01-15T08:15:00Z',
      updated_at: '2024-01-15T09:45:00Z',
      comments: [
        {
          id: 2,
          ticket_id: 2,
          author_name: 'Admin Company',
          author_role: 'admin',
          message: 'Plus de données reçues depuis 8h ce matin. Tous les casiers semblent hors ligne.',
          is_internal: false,
          created_at: '2024-01-15T08:15:00Z'
        },
        {
          id: 3,
          ticket_id: 2,
          author_name: 'Support Technique',
          author_role: 'helpdesk',
          message: 'Vérification en cours. Problème probable au niveau du broker MQTT.',
          is_internal: true,
          created_at: '2024-01-15T09:45:00Z'
        }
      ]
    },
    {
      id: 3,
      ticket_number: 'TKT-2024-003',
      title: 'Demande d\'ajout d\'utilisateur',
      description: 'Besoin d\'ajouter 3 nouveaux livreurs à notre compte.',
      priority: 'low',
      status: 'resolved',
      category: 'account',
      reporter_name: 'Admin Company',
      reporter_email: 'admin@company.com',
      company_name: 'Delivery Express',
      assigned_to: 'Support Technique',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T16:30:00Z',
      resolved_at: '2024-01-14T16:30:00Z',
      rating: 5,
      comments: [
        {
          id: 4,
          ticket_id: 3,
          author_name: 'Admin Company',
          author_role: 'admin',
          message: 'Nous avons embauché 3 nouveaux livreurs et avons besoin de créer leurs comptes.',
          is_internal: false,
          created_at: '2024-01-14T14:20:00Z'
        },
        {
          id: 5,
          ticket_id: 3,
          author_name: 'Support Technique',
          author_role: 'helpdesk',
          message: 'Les 3 comptes ont été créés avec succès. Mots de passe temporaires envoyés par email.',
          is_internal: false,
          created_at: '2024-01-14T16:30:00Z'
        }
      ]
    }
  ];

  // Mock cabinet statuses
  const mockCabinetStatuses: CabinetStatus[] = [
    {
      id: 1,
      name: 'Armoire Central',
      location: '123 Rue de la Paix, Paris',
      company_name: 'Delivery Express',
      status: 'warning',
      last_ping: '2024-01-15T10:25:00Z',
      temperature: 23.5,
      battery_level: 85,
      wifi_signal: 75,
      compartments_status: {
        available: 8,
        occupied: 6,
        maintenance: 1,
        error: 1
      },
      alerts: ['Casier 5 ne répond pas', 'Température élevée détectée']
    },
    {
      id: 2,
      name: 'Armoire Nord',
      location: '456 Avenue du Nord, Paris',
      company_name: 'Delivery Express',
      status: 'error',
      last_ping: '2024-01-15T07:45:00Z',
      temperature: 22.1,
      battery_level: 45,
      wifi_signal: 30,
      compartments_status: {
        available: 0,
        occupied: 0,
        maintenance: 0,
        error: 8
      },
      alerts: ['Connexion MQTT perdue', 'Signal WiFi faible', 'Batterie faible']
    },
    {
      id: 3,
      name: 'Armoire Sud',
      location: '789 Boulevard du Sud, Paris',
      company_name: 'Delivery Express',
      status: 'online',
      last_ping: '2024-01-15T10:29:00Z',
      temperature: 21.8,
      battery_level: 95,
      wifi_signal: 90,
      compartments_status: {
        available: 10,
        occupied: 0,
        maintenance: 0,
        error: 0
      },
      alerts: []
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setTimeout(() => {
      setTickets(mockTickets);
      setCabinetStatuses(mockCabinetStatuses);
      setLoading(false);
    }, 500);
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    const comment: TicketComment = {
      id: Date.now(),
      ticket_id: selectedTicket.id,
      author_name: `${user.first_name} ${user.last_name}`,
      author_role: user.role,
      message: newComment,
      is_internal: isInternal,
      created_at: new Date().toISOString()
    };

    const updatedTicket = {
      ...selectedTicket,
      comments: [...selectedTicket.comments, comment],
      updated_at: new Date().toISOString()
    };

    setSelectedTicket(updatedTicket);
    setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setNewComment('');
  };

  const handleStatusChange = async (ticketId: number, newStatus: Ticket['status']) => {
    const updatedTickets = tickets.map(ticket =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status: newStatus,
            updated_at: new Date().toISOString(),
            resolved_at: newStatus === 'resolved' ? new Date().toISOString() : ticket.resolved_at
          }
        : ticket
    );
    setTickets(updatedTickets);

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(updatedTickets.find(t => t.id === ticketId) || null);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.reporter_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'waiting_customer': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCabinetStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'waiting_customer': return 'En attente client';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return priority;
    }
  };

  const tabs = [
    { id: 'tickets', label: 'Tickets Support', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'monitoring', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> },
    { id: 'diagnostics', label: 'Diagnostics', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Centre d'Assistance</h2>
          <p className="text-gray-600">Gestion des tickets et monitoring des armoires</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Headphones className="w-4 h-4" />
          Support Technique
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un ticket..."
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
                    <option value="open">Ouvert</option>
                    <option value="in_progress">En cours</option>
                    <option value="waiting_customer">En attente client</option>
                    <option value="resolved">Résolu</option>
                    <option value="closed">Fermé</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Toutes priorités</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">Élevée</option>
                    <option value="medium">Moyenne</option>
                    <option value="low">Faible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                    selectedTicket?.id === ticket.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-blue-600">{ticket.ticket_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityText(ticket.priority)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {getStatusText(ticket.status)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2">{ticket.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {ticket.reporter_name}
                      </span>
                      <span>{ticket.company_name}</span>
                      {ticket.cabinet_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ticket.cabinet_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.comments.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Détails du Ticket</h3>
                  <div className="flex items-center gap-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Statut</label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as Ticket['status'])}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="open">Ouvert</option>
                      <option value="in_progress">En cours</option>
                      <option value="waiting_customer">En attente client</option>
                      <option value="resolved">Résolu</option>
                      <option value="closed">Fermé</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Priorité:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedTicket.priority)}`}>
                        {getPriorityText(selectedTicket.priority)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Catégorie:</span>
                      <span className="ml-2 text-gray-900">{selectedTicket.category}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">Rapporteur:</span>
                    <div className="mt-1">
                      <p className="font-medium">{selectedTicket.reporter_name}</p>
                      <p className="text-gray-600">{selectedTicket.reporter_email}</p>
                      {selectedTicket.reporter_phone && (
                        <p className="text-gray-600">{selectedTicket.reporter_phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-3">Commentaires</h4>
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {selectedTicket.comments.map((comment) => (
                      <div key={comment.id} className={`p-3 rounded-lg ${comment.is_internal ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{comment.author_name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.message}</p>
                        {comment.is_internal && (
                          <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Note interne
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="internal"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="internal" className="text-sm text-gray-700">
                          Note interne
                        </label>
                      </div>
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        Envoyer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Sélectionnez un ticket pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Armoires En Ligne</p>
                  <p className="text-2xl font-bold text-green-600">
                    {cabinetStatuses.filter(c => c.status === 'online').length}
                  </p>
                </div>
                <Wifi className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertes Actives</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {cabinetStatuses.reduce((sum, c) => sum + c.alerts.length, 0)}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hors Ligne</p>
                  <p className="text-2xl font-bold text-red-600">
                    {cabinetStatuses.filter(c => c.status === 'offline' || c.status === 'error').length}
                  </p>
                </div>
                <WifiOff className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tickets Ouverts</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Cabinet Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {cabinetStatuses.map((cabinet) => (
              <div key={cabinet.id} className={`bg-white rounded-lg shadow-sm border-2 p-6 ${getCabinetStatusColor(cabinet.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{cabinet.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCabinetStatusColor(cabinet.status)}`}>
                    {cabinet.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{cabinet.location}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Thermometer className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium">{cabinet.temperature}°C</p>
                    <p className="text-xs text-gray-500">Température</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Battery className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-sm font-medium">{cabinet.battery_level}%</p>
                    <p className="text-xs text-gray-500">Batterie</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Wifi className="w-4 h-4 text-purple-500" />
                    </div>
                    <p className="text-sm font-medium">{cabinet.wifi_signal}%</p>
                    <p className="text-xs text-gray-500">WiFi</p>
                  </div>
                </div>

                {/* Compartments Status */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="text-sm font-bold text-green-600">{cabinet.compartments_status.available}</p>
                    <p className="text-xs text-green-600">Libres</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="text-sm font-bold text-blue-600">{cabinet.compartments_status.occupied}</p>
                    <p className="text-xs text-blue-600">Occupés</p>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <p className="text-sm font-bold text-orange-600">{cabinet.compartments_status.maintenance}</p>
                    <p className="text-xs text-orange-600">Maintenance</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <p className="text-sm font-bold text-red-600">{cabinet.compartments_status.error}</p>
                    <p className="text-xs text-red-600">Erreur</p>
                  </div>
                </div>

                {/* Alerts */}
                {cabinet.alerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-800">Alertes:</h4>
                    {cabinet.alerts.map((alert, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700">{alert}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Dernière connexion: {new Date(cabinet.last_ping).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostics Tab */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Outils de Diagnostic</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Test de Connectivité</h4>
                <p className="text-sm text-gray-600 mb-4">Vérifier la connexion MQTT avec les armoires</p>
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  Lancer le Test
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Diagnostic Matériel</h4>
                <p className="text-sm text-gray-600 mb-4">Analyser l'état des composants physiques</p>
                <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
                  Analyser
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Logs Système</h4>
                <p className="text-sm text-gray-600 mb-4">Consulter les journaux d'événements</p>
                <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
                  Voir les Logs
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Redémarrage à Distance</h4>
                <p className="text-sm text-gray-600 mb-4">Redémarrer une armoire spécifique</p>
                <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                  Redémarrer
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Calibrage Capteurs</h4>
                <p className="text-sm text-gray-600 mb-4">Recalibrer les capteurs de température et humidité</p>
                <button className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                  Calibrer
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Rapport de Santé</h4>
                <p className="text-sm text-gray-600 mb-4">Générer un rapport complet du système</p>
                <button className="w-full bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600">
                  Générer
                </button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Outils Avancés</span>
            </div>
            <p className="text-sm text-yellow-700">
              Les outils de diagnostic avancés seront disponibles dans une prochaine version.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpdeskManagement;