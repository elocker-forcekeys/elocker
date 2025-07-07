import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiService, User } from '../services/apiService';
import { useTranslation } from '../services/i18n';
import LanguageSelector from './LanguageSelector';
import BackendStatusIndicator from './BackendStatusIndicator';

interface LoginProps {
  onLogin: (token: string, user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.login(formData.email, formData.password);
      
      if (response.success) {
        onLogin(response.data.token, response.data.user);
      } else {
        setError(response.message || t('login.error.invalid'));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : t('login.error.invalid'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header avec sélecteur de langue et statut backend */}
        <div className="flex justify-between items-center mb-8">
          <LanguageSelector />
          <BackendStatusIndicator />
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="bg-blue-500 text-white p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('login.title')}</h1>
          <p className="text-gray-600">{t('login.subtitle')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('login.loading') : t('login.submit')}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">{t('login.demo.accounts')}</p>
            <div className="space-y-2 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">Superadmin</p>
                <p className="text-gray-600">superadmin@smartlockers.com</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">Admin</p>
                <p className="text-gray-600">admin@company.com</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">Livreur</p>
                <p className="text-gray-600">delivery@company.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Smart Lockers System © 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;