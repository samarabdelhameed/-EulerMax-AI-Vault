import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  getDefaultWallets,
  RainbowKitProvider
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import '@rainbow-me/rainbowkit/styles.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import VaultManager from './components/VaultManager';
import AIAdvisor from './components/AIAdvisor';
import Settings from './components/Settings';
import TransactionHistory from './components/TransactionHistory';
import Support from './components/Support';
import Onboarding from './components/Onboarding';
import NotFound from './components/NotFound';
import NotificationCenter from './components/NotificationCenter';

const { chains, publicClient } = configureChains(
  [mainnet, sepolia],
  [publicProvider()]
);
const { connectors } = getDefaultWallets({
  appName: 'EulerMax AI',
  projectId: 'eulermax-ai',
  chains
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  // Check if user is new (in real app, this would check localStorage or user data)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && !isConnected) {
      setShowOnboarding(true);
    }
  }, [isConnected]);

  // Mock data - In a real app, this would come from your blockchain/API
  const mockVaultData = {
    totalAssets: 125000,
    totalReturns: 8750,
    apy: 12.5,
    riskScore: 4,
    activePositions: 3,
    rebalanceNeeded: true,
    availableBalance: 45000,
    lockedBalance: 80000,
    pendingRewards: 250
  };

  const handleConnect = () => {
    // Simulate wallet connection
    setIsConnected(true);
    setAddress('0x742d35Cc6634C0532925a3b8D9A8d92Cf28a5c98');
    setShowOnboarding(false);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress('');
  };

  const handleDeposit = (amount: number, token: string) => {
    console.log(`Depositing ${amount} ${token}`);
    // Implement deposit logic
  };

  const handleWithdraw = (amount: number, token: string) => {
    console.log(`Withdrawing ${amount} ${token}`);
    // Implement withdraw logic
  };

  const handleRebalance = () => {
    console.log('Rebalancing portfolio...');
    // Implement rebalance logic
  };

  const handleAskAI = () => {
    setCurrentPage('ai-advisor');
  };

  const handleSendMessage = (message: string) => {
    console.log('Sending message to AI:', message);
    // Implement AI message logic
  };

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleNavigateHome = () => {
    setCurrentPage('dashboard');
  };

  const handleNavigateBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setCurrentPage('dashboard');
    }
  };

  // Show onboarding if needed
  if (showOnboarding) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            vaultData={mockVaultData}
            onRebalance={handleRebalance}
            onAskAI={handleAskAI}
          />
        );
      case 'vault':
        return (
          <VaultManager
            vaultData={mockVaultData}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />
        );
      case 'ai-advisor':
        return (
          <AIAdvisor
            onSendMessage={handleSendMessage}
          />
        );
      case 'settings':
        return (
          <Settings
            isConnected={isConnected}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        );
      case 'history':
        return <TransactionHistory />;
      case 'support':
        return <Support />;
      case '404':
        return (
          <NotFound
            onNavigateHome={handleNavigateHome}
            onNavigateBack={handleNavigateBack}
          />
        );
      default:
        return (
          <NotFound
            onNavigateHome={handleNavigateHome}
            onNavigateBack={handleNavigateBack}
          />
        );
    }
  };

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <div className="min-h-screen bg-gray-900">
          <Navbar
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            isConnected={isConnected}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            address={address}
            onShowNotifications={() => setShowNotifications(true)}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900">
            {renderCurrentPage()}
          </main>
          <NotificationCenter
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;