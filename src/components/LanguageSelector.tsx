import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '../services/i18n';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, availableLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = availableLanguages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="Changer de langue"
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium">{currentLang?.flag}</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu déroulant */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1 text-sm font-medium text-gray-700">
                    {lang.name}
                  </span>
                  {language === lang.code && (
                    <Check className="w-4 h-4 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;