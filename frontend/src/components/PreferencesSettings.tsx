import React, { useEffect, useState } from 'react';

// Props for future extensibility (e.g., custom download URL)
interface PreferencesSettingsProps {
  mobileAppUrl?: string;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
];

const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({
  mobileAppUrl = 'https://myapp.com/download',
}) => {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  // Language state
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  });

  // Sync dark mode with localStorage and document
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync language with localStorage (ready for i18n integration)
  useEffect(() => {
    localStorage.setItem('language', language);
    // Here you can add i18n logic, e.g. i18n.changeLanguage(language)
  }, [language]);

  // Handlers
  const handleDarkModeToggle = () => setDarkMode((prev) => !prev);
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value);
  const handleDownload = () => window.open(mobileAppUrl, '_blank');

  return (
    <div className="space-y-4">
      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">Dark Mode</p>
          <p className="text-sm text-gray-600">Switch between light and dark themes</p>
        </div>
        <button
          onClick={handleDarkModeToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <span className="text-sm font-medium">
            {darkMode ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>

      {/* Language Dropdown */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">Language</p>
          <p className="text-sm text-gray-600">Choose your preferred language</p>
        </div>
        <select
          value={language}
          onChange={handleLanguageChange}
          className="px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
      </div>

      {/* Mobile App Download Button */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="font-medium text-gray-900">Mobile App</p>
          <p className="text-sm text-gray-600">Download our mobile app for the best experience</p>
        </div>
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
        >
          Download App
        </button>
      </div>
    </div>
  );
};

export default PreferencesSettings; 