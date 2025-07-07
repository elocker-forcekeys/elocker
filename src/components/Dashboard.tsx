import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Users, 
  MapPin, 
  Activity, 
  Bell,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { User } from '../services/apiService';
import { apiService, DashboardStats } from '../services/apiService';
import { useTranslation } from '../services/i18n';
import CompanyManagement from './CompanyManagement';
import UserManagement from './UserManagement';
import LockerManagement from './LockerManagement';
import DeliveryManagement from './DeliveryManagement';
import CompartmentConfiguration from './CompartmentConfiguration';
import Plans from './Plans';
import Settings from './Settings';
import APIDocumentation from './APIDocumentation';
import HelpdeskManagement from './HelpdeskManagement';
import LanguageSelector from './LanguageSelector';
import BackendStatusIndicator from './BackendStatusIndicator';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalDeliveries: 0,
    activeLockers: 0,
    availableCompartments: 0,
    pendingPickups: 0
  });
  const [loading, setLoading] = useState(false);

  const roleBasedTabs = {
    superadmin: [
      { id: 'overview', label: t('nav.overview'), icon: <Activity className="w-4 h-4" /> },
      { id: 'companies', label: t('nav.companies'), icon: <Users className="w-4 h-4" /> },
      { id: 'users', label: t('nav.users'), icon: <Users className="w-4 h-4" /> },
      { id: 'lockers', label: t('nav.lockers'), icon: <MapPin className="w-4 h-4" /> },
      { id: 'deliveries', label: t('nav.deliveries'), icon: <Package className="w-4 h-4" /> },
      { id: 'compartments', label: 'Configuration Casiers', icon: <SettingsIcon className="w-4 h-4" /> },
      { id: 'plans', label: 'Plans Tarifaires', icon: <Package className="w-4 h-4" /> },
      { id: 'settings', label: t('nav.settings'), icon: <SettingsIcon className="w-4 h-4" /> },
      { id: 'api', label: 'Documentation API', icon: <Activity className="w-4 h-4" /> }
    ],
    admin: [
      { id: 'overview', label: t('nav.overview'), icon: <Activity className="w-4 h-4" /> },
      { id: 'users', label: t('nav.users'), icon: <Users className="w-4 h-4" /> },
      { id: 'lockers', label: 'Mes Armoires', icon: <MapPin className="w-4 h-4" /> },
      { id: 'deliveries', label: t('nav.deliveries'), icon: <Package className="w-4 h-4" /> },
      { id: 'compartments', label: 'Configuration Casiers', icon: <SettingsIcon className="w-4 h-4" /> }
    ],
    delivery: [
      { id: 'overview', label: t('dashboard.title'), icon: <Activity className="w-4 h-4" /> },
      { id: 'deliveries', label: 'Mes Livraisons', icon: <Package className="w-4 h-4" /> },
      { id: 'lockers', label: t('nav.lockers'), icon: <MapPin className="w-4 h-4" /> }
    ],
    client: [
      { id: 'packages', label: 'Mes Colis', icon: <Package className="w-4 h-4" /> },
      { id: 'pickup', label: 'Retirer un Colis', icon: <Search className="w-4 h-4" /> }
    ],
    helpdesk: [
      { id: 'overview', label: 'Support', icon: <Activity className="w-4 h-4" /> },
      { id: 'tickets', label: 'Tickets Support', icon: <Bell className="w-4 h-4" /> },
      { id: 'lockers', label: t('nav.lockers'), icon: <MapPin className="w-4 h-4" /> }
    ]
  };

  const currentTabs = roleBasedTabs[user.role as keyof typeof roleBasedTabs] || [];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await apiService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">{t('common.loading')}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.stats.deliveries')}
          value={stats.totalDeliveries}
          icon={<Package className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title={t('dashboard.stats.lockers')}
          value={stats.activeLockers}
          icon={<MapPin className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title={t('dashboard.stats.compartments')}
          value={stats.availableCompartments}
          icon={<Activity className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title={t('dashboard.stats.pending')}
          value={stats.pendingPickups}
          icon={<Bell className="w-6 h-6" />}
          color="bg-orange-500"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.recent.activity')}</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Nouveau colis déposé</p>
                  <p className="text-xs text-gray-600">Armoire Central - Casier 5</p>
                </div>
                <span className="text-xs text-gray-500">Il y a 2min</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.locker.status')}</h3>
          <div className="space-y-4">
            {[
              { name: 'Armoire Central', status: 'online', compartments: 12, available: 8 },
              { name: 'Armoire Nord', status: 'online', compartments: 8, available: 3 },
              { name: 'Armoire Sud', status: 'maintenance', compartments: 10, available: 0 },
              { name: 'Armoire Est', status: 'online', compartments: 6, available: 6 }
            ].map((locker, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    locker.status === 'online' ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{locker.name}</p>
                    <p className="text-xs text-gray-600">{locker.available}/{locker.compartments} casiers disponibles</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  locker.status === 'online' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {locker.status === 'online' ? t('status.online') : t('status.maintenance')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent />;
      case 'companies':
        return <CompanyManagement user={user} />;
      case 'users':
        return <UserManagement user={user} />;
      case 'lockers':
        return <LockerManagement user={user} />;
      case 'deliveries':
        return <DeliveryManagement user={user} />;
      case 'compartments':
        return <CompartmentConfiguration user={user} />;
      case 'plans':
        return <Plans user={user} />;
      case 'settings':
        return <Settings user={user} />;
      case 'api':
        return <APIDocumentation user={user} />;
      case 'tickets':
        return <HelpdeskManagement user={user} />;
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Section: {activeTab}</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-800">En Développement</span>
              </div>
              <p className="text-sm text-gray-600">
                Cette section est en cours de développement et sera disponible prochainement.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">{t('login.title')}</h1>
                <p className="text-sm text-gray-600">{t('dashboard.title')} {user.role}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <BackendStatusIndicator />
              <LanguageSelector />
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <SettingsIcon className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-600">{user.company_name}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
              <nav className="space-y-2">
                {currentTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;