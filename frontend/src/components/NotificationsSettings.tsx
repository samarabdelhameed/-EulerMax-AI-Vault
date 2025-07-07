import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../i18n';

const defaultPrefs = {
  portfolio: true,
  rebalance: true,
  market: false,
  security: true,
};

const NOTIF_LABELS: Record<keyof typeof defaultPrefs, string> = {
  portfolio: 'Portfolio Updates',
  rebalance: 'Rebalance Alerts',
  market: 'Market News',
  security: 'Security Alerts',
};

const NOTIF_DESCRIPTIONS: Record<keyof typeof defaultPrefs, string> = {
  portfolio: 'Get notified about portfolio performance',
  rebalance: 'Notifications when rebalancing is recommended',
  market: 'Important market updates and analysis',
  security: 'Critical security notifications',
};

const NOTIF_KEYS = Object.keys(defaultPrefs) as (keyof typeof defaultPrefs)[];

const NotificationsSettings: React.FC = () => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : defaultPrefs;
  });
  const [loading, setLoading] = useState(true);

  // Fetch preferences from backend on mount
  useEffect(() => {
    axios.get('/api/user/preferences')
      .then(res => {
        setPrefs(res.data);
        localStorage.setItem('notifications', JSON.stringify(res.data));
      })
      .catch(() => {
        toast.error(t('Failed to load preferences'), { position: 'bottom-right' });
      })
      .finally(() => setLoading(false));
  }, [t]);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(prefs));
  }, [prefs]);

  // Handle toggle change
  const handleToggle = async (key: keyof typeof defaultPrefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    toast.info(
      `${t(NOTIF_LABELS[key])} ${newPrefs[key] ? t('turned on') : t('turned off')}`,
      { position: 'bottom-right', autoClose: 2000 }
    );
    try {
      await axios.post('/api/user/preferences', newPrefs);
    } catch {
      toast.error(t('Failed to save preferences'), { position: 'bottom-right' });
    }
  };

  // Turn All On/Off logic
  const allOn = NOTIF_KEYS.every((key) => prefs[key]);
  const toggleAll = async () => {
    const newValue = !allOn;
    const newPrefs = NOTIF_KEYS.reduce((acc, key) => ({ ...acc, [key]: newValue }), {} as typeof prefs);
    setPrefs(newPrefs);
    toast.info(
      `${newValue ? t('All notifications turned on') : t('All notifications turned off')}`,
      { position: 'bottom-right', autoClose: 2000 }
    );
    try {
      await axios.post('/api/user/preferences', newPrefs);
    } catch {
      toast.error(t('Failed to save preferences'), { position: 'bottom-right' });
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-4">{t('Loading...')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <button
          onClick={toggleAll}
          className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          {allOn ? t('Turn All Off') : t('Turn All On')}
        </button>
      </div>
      {NOTIF_KEYS.map((key) => (
        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{t(NOTIF_LABELS[key])}</p>
            <p className="text-sm text-gray-600">{t(NOTIF_DESCRIPTIONS[key])}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={() => handleToggle(key)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      ))}
      <ToastContainer />
    </div>
  );
};

export default NotificationsSettings; 