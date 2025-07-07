import React, { useState } from 'react';
import { Shield, Key, Bell, Globe, Moon, Sun, Smartphone, Eye, EyeOff } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import NotificationsSettings from './NotificationsSettings';
import PreferencesSettings from './PreferencesSettings';

interface SettingsProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  isConnected: _isConnected,
  onConnect: _onConnect,
  onDisconnect: _onDisconnect,
  darkMode,
  onToggleDarkMode
}) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [notifications, setNotifications] = useState({
    portfolio: true,
    rebalance: true,
    market: false,
    security: true
  });
  const [showPasskey, setShowPasskey] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState<'none' | 'setup' | 'active'>('none');

  // Helper to shorten address
  const shortAddress = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  // Passkey registration logic
  const handlePasskeySetup = async () => {
    setPasskeyStatus('setup');
    try {
      const publicKeyCredentialCreationOptions = {
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: 'EulerMax AI' },
          user: {
            id: new Uint8Array(16),
            name: address || 'user',
            displayName: address || 'user',
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: { userVerification: 'preferred' },
          timeout: 60000,
          attestation: 'none',
        },
      };
      await navigator.credentials.create(publicKeyCredentialCreationOptions as any);
      setPasskeyStatus('active');
      window.alert('Passkey setup successful!');
    } catch (err) {
      setPasskeyStatus('none');
      window.alert('Passkey setup failed. Please try again.');
    }
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
                {isConnected
                  ? `Connected: ${shortAddress(address)}`
                  : 'Connect your wallet to get started'}
              </p>
            </div>
            <div>
              {isConnected ? (
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-500 text-white hover:bg-red-600"
                >
                  Disconnect
                </button>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Connect
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
            </div>
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
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700">Active</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-700">Inactive</span>
                </>
              )}
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
        {/* Replace old notification toggles with the new component */}
        <NotificationsSettings />
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>Preferences</span>
        </h3>
        {/* Replace old preferences with the new component */}
        <PreferencesSettings />
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