import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  X
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { useTranslation } from '../services/i18n';

const BackendStatusIndicator: React.FC = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState(apiService.getBackendStatus());
  const [checking, setChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(apiService.getBackendStatus());
    }, 5000); // Vérifier toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await apiService.forceBackendCheck();
      setStatus(apiService.getBackendStatus());
    } finally {
      setChecking(false);
    }
  };

  const getStatusColor = () => {
    return status.available ? 'bg-green-500' : 'bg-orange-500';
  };

  const getStatusIcon = () => {
    if (checking) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    return status.available ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />;
  };

  const getStatusText = () => {
    return status.available ? t('backend.available') : t('backend.unavailable');
  };

  return (
    <>
      {/* Indicateur dans la barre de navigation */}
      <div className="relative">
        <button
          onClick={() => setShowDetails(true)}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium transition-colors ${getStatusColor()} hover:opacity-80`}
          title={getStatusText()}
        >
          {getStatusIcon()}
          <span className="hidden sm:inline">{getStatusText()}</span>
        </button>

        {/* Indicateur de mode mock */}
        {!status.available && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
        )}
      </div>

      {/* Modal de détails */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">État du Serveur</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Statut actuel */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className={`p-2 rounded-full text-white ${getStatusColor()}`}>
                  {getStatusIcon()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{getStatusText()}</p>
                  <p className="text-sm text-gray-600">
                    Dernière vérification: {status.lastCheck.toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Mode simulation */}
              {!status.available && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      {t('backend.mock.mode')}
                    </span>
                  </div>
                  <p className="text-sm text-orange-700">
                    L'application utilise des données simulées. Pour accéder aux vraies données, 
                    assurez-vous que le serveur backend est démarré.
                  </p>
                </div>
              )}

              {/* Serveur connecté */}
              {status.available && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Serveur Backend Connecté
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    L'application est connectée au serveur backend et utilise les vraies données.
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Pour démarrer le serveur backend:
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><code className="bg-blue-100 px-1 rounded">npm run server</code></p>
                  <p>ou</p>
                  <p><code className="bg-blue-100 px-1 rounded">npm run dev:full</code></p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={checking}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                  {t('backend.check.again')}
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BackendStatusIndicator;