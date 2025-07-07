import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Mail, 
  MessageSquare, 
  Wifi, 
  TestTube,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Server,
  Database,
  Shield
} from 'lucide-react';
import { User } from '../services/mockAuth';

interface SettingsProps {
  user: User;
}

interface SMTPSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_name: string;
  from_email: string;
}

interface SMSSettings {
  provider: 'twilio' | 'aws' | 'other';
  account_sid: string;
  auth_token: string;
  from_number: string;
}

interface MQTTSettings {
  broker_url: string;
  port: number;
  username: string;
  password: string;
  client_id: string;
  keep_alive: number;
  clean_session: boolean;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('smtp');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // SMTP Settings
  const [smtpSettings, setSMTPSettings] = useState<SMTPSettings>({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    username: '',
    password: '',
    from_name: 'Smart Lockers',
    from_email: ''
  });

  // SMS Settings
  const [smsSettings, setSMSSettings] = useState<SMSSettings>({
    provider: 'twilio',
    account_sid: '',
    auth_token: '',
    from_number: ''
  });

  // MQTT Settings
  const [mqttSettings, setMQTTSettings] = useState<MQTTSettings>({
    broker_url: 'mqtt://localhost',
    port: 1883,
    username: '',
    password: '',
    client_id: 'smart_lockers_server',
    keep_alive: 60,
    clean_session: true
  });

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSMTPSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult({ type: 'success', message: 'Configuration SMTP sauvegardée avec succès' });
    } catch (error) {
      setTestResult({ type: 'error', message: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const handleSMTPTest = async () => {
    setLoading(true);
    try {
      // Simulate test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult({ type: 'success', message: 'Email de test envoyé avec succès !' });
    } catch (error) {
      setTestResult({ type: 'error', message: 'Échec de l\'envoi de l\'email de test' });
    } finally {
      setLoading(false);
    }
  };

  const handleSMSSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult({ type: 'success', message: 'Configuration SMS sauvegardée avec succès' });
    } catch (error) {
      setTestResult({ type: 'error', message: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const handleSMSTest = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult({ type: 'success', message: 'SMS de test envoyé avec succès !' });
    } catch (error) {
      setTestResult({ type: 'error', message: 'Échec de l\'envoi du SMS de test' });
    } finally {
      setLoading(false);
    }
  };

  const handleMQTTSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult({ type: 'success', message: 'Configuration MQTT sauvegardée avec succès' });
    } catch (error) {
      setTestResult({ type: 'error', message: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const handleMQTTTest = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult({ type: 'success', message: 'Connexion MQTT testée avec succès !' });
    } catch (error) {
      setTestResult({ type: 'error', message: 'Échec de la connexion MQTT' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'smtp', label: 'SMTP Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'sms', label: 'SMS Twilio', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'mqtt', label: 'MQTT', icon: <Wifi className="w-4 h-4" /> },
    { id: 'security', label: 'Sécurité', icon: <Shield className="w-4 h-4" /> },
    { id: 'system', label: 'Système', icon: <Server className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Paramètres Système</h2>
          <p className="text-gray-600">Configuration des services et intégrations</p>
        </div>
      </div>

      {/* Test Result Alert */}
      {testResult && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          testResult.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {testResult.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            testResult.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.message}
          </span>
          <button
            onClick={() => setTestResult(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-8">
            <nav className="space-y-2">
              {tabs.map((tab) => (
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            
            {/* SMTP Configuration */}
            {activeTab === 'smtp' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Configuration SMTP</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serveur SMTP
                    </label>
                    <input
                      type="text"
                      value={smtpSettings.host}
                      onChange={(e) => setSMTPSettings({...smtpSettings, host: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port
                    </label>
                    <input
                      type="number"
                      value={smtpSettings.port}
                      onChange={(e) => setSMTPSettings({...smtpSettings, port: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={smtpSettings.username}
                      onChange={(e) => setSMTPSettings({...smtpSettings, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.smtp ? 'text' : 'password'}
                        value={smtpSettings.password}
                        onChange={(e) => setSMTPSettings({...smtpSettings, password: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('smtp')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.smtp ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom expéditeur
                    </label>
                    <input
                      type="text"
                      value={smtpSettings.from_name}
                      onChange={(e) => setSMTPSettings({...smtpSettings, from_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email expéditeur
                    </label>
                    <input
                      type="email"
                      value={smtpSettings.from_email}
                      onChange={(e) => setSMTPSettings({...smtpSettings, from_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="secure"
                    checked={smtpSettings.secure}
                    onChange={(e) => setSMTPSettings({...smtpSettings, secure: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="secure" className="text-sm text-gray-700">
                    Connexion sécurisée (SSL/TLS)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSMTPSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={handleSMTPTest}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    <TestTube className="w-4 h-4" />
                    Tester
                  </button>
                </div>
              </div>
            )}

            {/* SMS Configuration */}
            {activeTab === 'sms' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Configuration SMS</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fournisseur SMS
                  </label>
                  <select
                    value={smsSettings.provider}
                    onChange={(e) => setSMSSettings({...smsSettings, provider: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="twilio">Twilio</option>
                    <option value="aws">AWS SNS</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                {smsSettings.provider === 'twilio' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account SID
                      </label>
                      <input
                        type="text"
                        value={smsSettings.account_sid}
                        onChange={(e) => setSMSSettings({...smsSettings, account_sid: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auth Token
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.sms ? 'text' : 'password'}
                          value={smsSettings.auth_token}
                          onChange={(e) => setSMSSettings({...smsSettings, auth_token: e.target.value})}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('sms')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.sms ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro expéditeur
                      </label>
                      <input
                        type="tel"
                        value={smsSettings.from_number}
                        onChange={(e) => setSMSSettings({...smsSettings, from_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSMSSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={handleSMSTest}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    <TestTube className="w-4 h-4" />
                    Tester
                  </button>
                </div>
              </div>
            )}

            {/* MQTT Configuration */}
            {activeTab === 'mqtt' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Wifi className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Configuration MQTT</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL du Broker
                    </label>
                    <input
                      type="text"
                      value={mqttSettings.broker_url}
                      onChange={(e) => setMQTTSettings({...mqttSettings, broker_url: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="mqtt://localhost"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port
                    </label>
                    <input
                      type="number"
                      value={mqttSettings.port}
                      onChange={(e) => setMQTTSettings({...mqttSettings, port: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={mqttSettings.username}
                      onChange={(e) => setMQTTSettings({...mqttSettings, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.mqtt ? 'text' : 'password'}
                        value={mqttSettings.password}
                        onChange={(e) => setMQTTSettings({...mqttSettings, password: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('mqtt')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.mqtt ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={mqttSettings.client_id}
                      onChange={(e) => setMQTTSettings({...mqttSettings, client_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keep Alive (secondes)
                    </label>
                    <input
                      type="number"
                      value={mqttSettings.keep_alive}
                      onChange={(e) => setMQTTSettings({...mqttSettings, keep_alive: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="clean_session"
                    checked={mqttSettings.clean_session}
                    onChange={(e) => setMQTTSettings({...mqttSettings, clean_session: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="clean_session" className="text-sm text-gray-700">
                    Session propre
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleMQTTSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                  <button
                    onClick={handleMQTTTest}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    <TestTube className="w-4 h-4" />
                    Tester Connexion
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Paramètres de Sécurité</h3>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">En Développement</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Les paramètres de sécurité avancés seront disponibles dans une prochaine version.
                  </p>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Server className="w-6 h-6 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Paramètres Système</h3>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Configuration Système</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Les paramètres système avancés seront disponibles dans une prochaine version.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;