import React, { useState } from 'react';
import { Shield, Key, Bell, Globe, Moon, Sun, Smartphone, Eye, EyeOff } from 'lucide-react';

interface SettingsProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  isConnected,
  onConnect,
  onDisconnect,
  darkMode,
  onToggleDarkMode
}) => {
  const [notifications, setNotifications] = useState({
    portfolio: true,
    rebalance: true,
    market: false,
    security: true
  });

  const [showPasskey, setShowPasskey] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState<'none' | 'setup' | 'active'>('none');

  const handlePasskeySetup = async () => {
    setPasskeyStatus('setup');
    // Simulate passkey setup process
    setTimeout(() => {
      setPasskeyStatus('active');
    }, 2000);
  };

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account, security, and preferences</p>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Account & Security</span>
        </h3>
        
        <div className="space-y-4">
          {/* Wallet Connection */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Wallet Connection</p>
              <p className="text-sm text-gray-600">
                {isConnected ? 'Connected to MetaMask' : 'Connect your wallet to get started'}
              </p>
            </div>
            <button
              onClick={isConnected ? onDisconnect : onConnect}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isConnected
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* Passkey Authentication */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Passkey Authentication</p>
              <p className="text-sm text-gray-600">
                {passkeyStatus === 'active' 
                  ? 'Secure biometric authentication enabled' 
                  : 'Enable passwordless login with your device'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPasskey(!showPasskey)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={handlePasskeySetup}
                disabled={passkeyStatus === 'setup'}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  passkeyStatus === 'active'
                    ? 'bg-green-500 text-white'
                    : passkeyStatus === 'setup'
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {passkeyStatus === 'active' ? 'Active' : 
                 passkeyStatus === 'setup' ? 'Setting up...' : 'Setup'}
              </button>
            </div>
          </div>

          {/* Smart Account */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Smart Account</p>
              <p className="text-sm text-gray-600">
                Account abstraction for gasless transactions
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <span>Notifications</span>
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'portfolio', label: 'Portfolio Updates', description: 'Get notified about portfolio performance' },
            { key: 'rebalance', label: 'Rebalance Alerts', description: 'Notifications when rebalancing is recommended' },
            { key: 'market', label: 'Market News', description: 'Important market updates and analysis' },
            { key: 'security', label: 'Security Alerts', description: 'Critical security notifications' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>Preferences</span>
        </h3>
        
        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Dark Mode</p>
              <p className="text-sm text-gray-600">Switch between light and dark themes</p>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {darkMode ? 'Light' : 'Dark'}
              </span>
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Language</p>
              <p className="text-sm text-gray-600">Choose your preferred language</p>
            </div>
            <select className="px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>English</option>
              <option>العربية</option>
              <option>Español</option>
              <option>Français</option>
            </select>
          </div>

          {/* Mobile App */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Mobile App</p>
              <p className="text-sm text-gray-600">Download our mobile app for better experience</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors">
              <Smartphone className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Key className="w-5 h-5 text-blue-600" />
          <span>Advanced</span>
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 mb-2">Gas Settings</p>
            <div className="grid grid-cols-3 gap-3">
              {['Slow', 'Standard', 'Fast'].map((speed) => (
                <button
                  key={speed}
                  className="px-3 py-2 text-sm bg-gray-600 text-white border border-gray-500 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 mb-2">Slippage Tolerance</p>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                defaultValue="0.5"
                className="flex-1"
              />
              <span className="text-sm text-gray-600">0.5%</span>
            </div>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="font-medium text-red-900 mb-2">Danger Zone</p>
            <button className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors text-sm">
              Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;