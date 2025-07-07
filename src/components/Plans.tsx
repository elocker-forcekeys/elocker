import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Check,
  X,
  Star,
  Users,
  Package,
  MapPin,
  Zap
} from 'lucide-react';
import { User } from '../services/mockAuth';

interface Plan {
  id: number;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  limits: {
    max_users: number;
    max_lockers: number;
    max_deliveries_per_month: number;
    api_calls_per_month: number;
  };
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
}

interface PlansProps {
  user: User;
}

const Plans: React.FC<PlansProps> = ({ user }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    features: [''],
    max_users: 10,
    max_lockers: 5,
    max_deliveries_per_month: 1000,
    api_calls_per_month: 10000,
    is_popular: false,
    is_active: true
  });

  // Mock plans data
  const mockPlans: Plan[] = [
    {
      id: 1,
      name: 'Starter',
      description: 'Parfait pour les petites entreprises qui débutent',
      price_monthly: 29,
      price_yearly: 290,
      features: [
        'Jusqu\'à 10 utilisateurs',
        'Jusqu\'à 5 armoires',
        '1 000 livraisons/mois',
        'Support email',
        'API de base',
        'Rapports mensuels'
      ],
      limits: {
        max_users: 10,
        max_lockers: 5,
        max_deliveries_per_month: 1000,
        api_calls_per_month: 10000
      },
      is_popular: false,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Professional',
      description: 'Idéal pour les entreprises en croissance',
      price_monthly: 79,
      price_yearly: 790,
      features: [
        'Jusqu\'à 50 utilisateurs',
        'Jusqu\'à 20 armoires',
        '5 000 livraisons/mois',
        'Support prioritaire',
        'API avancée',
        'Rapports en temps réel',
        'Intégrations tierces',
        'Notifications SMS'
      ],
      limits: {
        max_users: 50,
        max_lockers: 20,
        max_deliveries_per_month: 5000,
        api_calls_per_month: 50000
      },
      is_popular: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Enterprise',
      description: 'Solution complète pour les grandes entreprises',
      price_monthly: 199,
      price_yearly: 1990,
      features: [
        'Utilisateurs illimités',
        'Armoires illimitées',
        'Livraisons illimitées',
        'Support 24/7',
        'API complète',
        'Rapports personnalisés',
        'Intégrations sur mesure',
        'Manager dédié',
        'SLA garanti',
        'Sécurité renforcée'
      ],
      limits: {
        max_users: -1, // -1 = illimité
        max_lockers: -1,
        max_deliveries_per_month: -1,
        api_calls_per_month: -1
      },
      is_popular: false,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setTimeout(() => {
      setPlans(mockPlans);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPlan) {
        // Update plan
        const updatedPlans = plans.map(plan =>
          plan.id === editingPlan.id
            ? {
                ...plan,
                ...formData,
                features: formData.features.filter(f => f.trim() !== ''),
                limits: {
                  max_users: formData.max_users,
                  max_lockers: formData.max_lockers,
                  max_deliveries_per_month: formData.max_deliveries_per_month,
                  api_calls_per_month: formData.api_calls_per_month
                }
              }
            : plan
        );
        setPlans(updatedPlans);
      } else {
        // Create new plan
        const newPlan: Plan = {
          id: Math.max(...plans.map(p => p.id)) + 1,
          ...formData,
          features: formData.features.filter(f => f.trim() !== ''),
          limits: {
            max_users: formData.max_users,
            max_lockers: formData.max_lockers,
            max_deliveries_per_month: formData.max_deliveries_per_month,
            api_calls_per_month: formData.api_calls_per_month
          },
          created_at: new Date().toISOString()
        };
        setPlans([...plans, newPlan]);
      }

      setShowModal(false);
      setEditingPlan(null);
      resetForm();
    } catch (error) {
      console.error('Error saving plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      features: [''],
      max_users: 10,
      max_lockers: 5,
      max_deliveries_per_month: 1000,
      api_calls_per_month: 10000,
      is_popular: false,
      is_active: true
    });
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      features: [...plan.features, ''],
      max_users: plan.limits.max_users,
      max_lockers: plan.limits.max_lockers,
      max_deliveries_per_month: plan.limits.max_deliveries_per_month,
      api_calls_per_month: plan.limits.api_calls_per_month,
      is_popular: plan.is_popular,
      is_active: plan.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (planId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
      setPlans(plans.filter(p => p.id !== planId));
    }
  };

  const handleToggleStatus = async (planId: number) => {
    const updatedPlans = plans.map(plan =>
      plan.id === planId ? { ...plan, is_active: !plan.is_active } : plan
    );
    setPlans(updatedPlans);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const formatLimit = (value: number) => {
    if (value === -1) return 'Illimité';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Plans Tarifaires</h2>
          <p className="text-gray-600">Gérez les plans d'abonnement de votre plateforme</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau Plan
        </button>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annuel
            <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                plan.is_popular
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200'
              } ${!plan.is_active ? 'opacity-60' : ''}`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Populaire
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      €{billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly}
                    </span>
                    <span className="text-gray-600 ml-1">
                      /{billingPeriod === 'monthly' ? 'mois' : 'an'}
                    </span>
                  </div>

                  {billingPeriod === 'yearly' && (
                    <div className="text-sm text-green-600 font-medium">
                      Économisez €{(plan.price_monthly * 12) - plan.price_yearly} par an
                    </div>
                  )}
                </div>

                {/* Limits */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">
                      {formatLimit(plan.limits.max_users)}
                    </div>
                    <div className="text-xs text-gray-600">Utilisateurs</div>
                  </div>
                  <div className="text-center">
                    <MapPin className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">
                      {formatLimit(plan.limits.max_lockers)}
                    </div>
                    <div className="text-xs text-gray-600">Armoires</div>
                  </div>
                  <div className="text-center">
                    <Package className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">
                      {formatLimit(plan.limits.max_deliveries_per_month)}
                    </div>
                    <div className="text-xs text-gray-600">Livraisons/mois</div>
                  </div>
                  <div className="text-center">
                    <Zap className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-gray-900">
                      {formatLimit(plan.limits.api_calls_per_month)}
                    </div>
                    <div className="text-xs text-gray-600">API/mois</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Admin Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleToggleStatus(plan.id)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      plan.is_active
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                    title={plan.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {plan.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingPlan ? 'Modifier le plan' : 'Nouveau plan'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du plan
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
                    Prix mensuel (€)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price_monthly}
                    onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix annuel (€)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price_yearly}
                  onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max utilisateurs (-1 = illimité)
                  </label>
                  <input
                    type="number"
                    value={formData.max_users}
                    onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max armoires (-1 = illimité)
                  </label>
                  <input
                    type="number"
                    value={formData.max_lockers}
                    onChange={(e) => setFormData({ ...formData, max_lockers: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Livraisons/mois (-1 = illimité)
                  </label>
                  <input
                    type="number"
                    value={formData.max_deliveries_per_month}
                    onChange={(e) => setFormData({ ...formData, max_deliveries_per_month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appels API/mois (-1 = illimité)
                  </label>
                  <input
                    type="number"
                    value={formData.api_calls_per_month}
                    onChange={(e) => setFormData({ ...formData, api_calls_per_month: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonctionnalités
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Nouvelle fonctionnalité..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter une fonctionnalité
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_popular"
                    checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_popular" className="text-sm text-gray-700">
                    Plan populaire
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Plan actif
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPlan(null);
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

export default Plans;