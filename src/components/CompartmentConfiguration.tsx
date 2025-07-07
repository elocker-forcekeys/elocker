import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Package, 
  Ruler,
  Grid,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { User } from '../services/mockAuth';

interface CompartmentConfig {
  id: number;
  compartment_number: number;
  size: 'small' | 'medium' | 'large';
  gpio_pin: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  max_weight: number;
  is_active: boolean;
}

interface CompartmentConfigurationProps {
  user: User;
}

const CompartmentConfiguration: React.FC<CompartmentConfigurationProps> = ({ user }) => {
  const [totalCompartments, setTotalCompartments] = useState(16);
  const [compartments, setCompartments] = useState<CompartmentConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sizeDistribution, setSizeDistribution] = useState({
    small: 6,
    medium: 8,
    large: 2
  });

  // Default dimensions for each size
  const defaultDimensions = {
    small: { width: 20, height: 15, depth: 30 },
    medium: { width: 30, height: 25, depth: 40 },
    large: { width: 40, height: 35, depth: 50 }
  };

  // Default max weight for each size (in kg)
  const defaultMaxWeight = {
    small: 5,
    medium: 15,
    large: 30
  };

  useEffect(() => {
    generateCompartments();
  }, [totalCompartments, sizeDistribution]);

  const generateCompartments = () => {
    const newCompartments: CompartmentConfig[] = [];
    let currentNumber = 1;

    // Generate small compartments
    for (let i = 0; i < sizeDistribution.small; i++) {
      newCompartments.push({
        id: currentNumber,
        compartment_number: currentNumber,
        size: 'small',
        gpio_pin: currentNumber,
        dimensions: { ...defaultDimensions.small },
        max_weight: defaultMaxWeight.small,
        is_active: true
      });
      currentNumber++;
    }

    // Generate medium compartments
    for (let i = 0; i < sizeDistribution.medium; i++) {
      newCompartments.push({
        id: currentNumber,
        compartment_number: currentNumber,
        size: 'medium',
        gpio_pin: currentNumber,
        dimensions: { ...defaultDimensions.medium },
        max_weight: defaultMaxWeight.medium,
        is_active: true
      });
      currentNumber++;
    }

    // Generate large compartments
    for (let i = 0; i < sizeDistribution.large; i++) {
      newCompartments.push({
        id: currentNumber,
        compartment_number: currentNumber,
        size: 'large',
        gpio_pin: currentNumber,
        dimensions: { ...defaultDimensions.large },
        max_weight: defaultMaxWeight.large,
        is_active: true
      });
      currentNumber++;
    }

    setCompartments(newCompartments);
  };

  const handleSizeDistributionChange = (size: 'small' | 'medium' | 'large', value: number) => {
    const newDistribution = { ...sizeDistribution, [size]: value };
    const total = newDistribution.small + newDistribution.medium + newDistribution.large;
    
    if (total <= totalCompartments) {
      setSizeDistribution(newDistribution);
    }
  };

  const handleCompartmentChange = (id: number, field: string, value: any) => {
    setCompartments(prev => prev.map(comp => 
      comp.id === id 
        ? { ...comp, [field]: value }
        : comp
    ));
  };

  const handleDimensionChange = (id: number, dimension: 'width' | 'height' | 'depth', value: number) => {
    setCompartments(prev => prev.map(comp => 
      comp.id === id 
        ? { 
            ...comp, 
            dimensions: { ...comp.dimensions, [dimension]: value }
          }
        : comp
    ));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSizeDistribution({
      small: 6,
      medium: 8,
      large: 2
    });
    setTotalCompartments(16);
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'large': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const totalConfigured = sizeDistribution.small + sizeDistribution.medium + sizeDistribution.large;
  const isValidConfiguration = totalConfigured === totalCompartments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Configuration des Casiers</h2>
          <p className="text-gray-600">Configurez la taille et les dimensions des casiers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !isValidConfiguration}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-800">
            Configuration sauvegardée avec succès !
          </span>
        </div>
      )}

      {/* Configuration Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Configuration Générale</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre total de casiers
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={totalCompartments}
              onChange={(e) => setTotalCompartments(parseInt(e.target.value) || 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut de la configuration
            </label>
            <div className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
              isValidConfiguration 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {isValidConfiguration ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isValidConfiguration 
                  ? 'Configuration valide' 
                  : `${totalConfigured}/${totalCompartments} casiers configurés`
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Size Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Grid className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">Répartition par Taille</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="font-medium text-gray-800">Petits Casiers</span>
            </div>
            <input
              type="number"
              min="0"
              max={totalCompartments}
              value={sizeDistribution.small}
              onChange={(e) => handleSizeDistributionChange('small', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-sm text-gray-600">
              <p>Dimensions: {defaultDimensions.small.width} × {defaultDimensions.small.height} × {defaultDimensions.small.depth} cm</p>
              <p>Poids max: {defaultMaxWeight.small} kg</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="font-medium text-gray-800">Casiers Moyens</span>
            </div>
            <input
              type="number"
              min="0"
              max={totalCompartments}
              value={sizeDistribution.medium}
              onChange={(e) => handleSizeDistributionChange('medium', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-sm text-gray-600">
              <p>Dimensions: {defaultDimensions.medium.width} × {defaultDimensions.medium.height} × {defaultDimensions.medium.depth} cm</p>
              <p>Poids max: {defaultMaxWeight.medium} kg</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="font-medium text-gray-800">Grands Casiers</span>
            </div>
            <input
              type="number"
              min="0"
              max={totalCompartments}
              value={sizeDistribution.large}
              onChange={(e) => handleSizeDistributionChange('large', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="text-sm text-gray-600">
              <p>Dimensions: {defaultDimensions.large.width} × {defaultDimensions.large.height} × {defaultDimensions.large.depth} cm</p>
              <p>Poids max: {defaultMaxWeight.large} kg</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Total configuré:</span>
            <span className={`font-bold ${isValidConfiguration ? 'text-green-600' : 'text-red-600'}`}>
              {totalConfigured} / {totalCompartments}
            </span>
          </div>
        </div>
      </div>

      {/* Compartments Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Configuration Détaillée</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {compartments.map((compartment) => (
            <div
              key={compartment.id}
              className={`border-2 rounded-lg p-4 ${getSizeColor(compartment.size)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-lg">#{compartment.compartment_number}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                  {getSizeText(compartment.size)}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Pin GPIO</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={compartment.gpio_pin}
                    onChange={(e) => handleCompartmentChange(compartment.id, 'gpio_pin', parseInt(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Dimensions (cm)</label>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="number"
                      min="1"
                      value={compartment.dimensions.width}
                      onChange={(e) => handleDimensionChange(compartment.id, 'width', parseInt(e.target.value))}
                      className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="L"
                    />
                    <input
                      type="number"
                      min="1"
                      value={compartment.dimensions.height}
                      onChange={(e) => handleDimensionChange(compartment.id, 'height', parseInt(e.target.value))}
                      className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="H"
                    />
                    <input
                      type="number"
                      min="1"
                      value={compartment.dimensions.depth}
                      onChange={(e) => handleDimensionChange(compartment.id, 'depth', parseInt(e.target.value))}
                      className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="P"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Poids max (kg)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={compartment.max_weight}
                    onChange={(e) => handleCompartmentChange(compartment.id, 'max_weight', parseInt(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`active-${compartment.id}`}
                    checked={compartment.is_active}
                    onChange={(e) => handleCompartmentChange(compartment.id, 'is_active', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`active-${compartment.id}`} className="text-xs text-gray-700">
                    Actif
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Ruler className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-800">Résumé de la Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{sizeDistribution.small}</div>
            <div className="text-sm text-green-700">Petits Casiers</div>
            <div className="text-xs text-gray-600 mt-1">
              {defaultDimensions.small.width}×{defaultDimensions.small.height}×{defaultDimensions.small.depth}cm
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{sizeDistribution.medium}</div>
            <div className="text-sm text-blue-700">Casiers Moyens</div>
            <div className="text-xs text-gray-600 mt-1">
              {defaultDimensions.medium.width}×{defaultDimensions.medium.height}×{defaultDimensions.medium.depth}cm
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{sizeDistribution.large}</div>
            <div className="text-sm text-purple-700">Grands Casiers</div>
            <div className="text-xs text-gray-600 mt-1">
              {defaultDimensions.large.width}×{defaultDimensions.large.height}×{defaultDimensions.large.depth}cm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompartmentConfiguration;