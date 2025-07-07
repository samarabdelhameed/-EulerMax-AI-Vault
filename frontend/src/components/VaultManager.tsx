import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, TrendingUp, Shield, AlertCircle, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultManagerProps {
  vaultData: {
    totalAssets: number;
    availableBalance: number;
    lockedBalance: number;
    pendingRewards: number;
    apy: number;
    riskScore: number;
  };
  onDeposit: (amount: number, token: string) => void;
  onWithdraw: (amount: number, token: string) => void;
}

const VaultManager: React.FC<VaultManagerProps> = ({ vaultData, onDeposit, onWithdraw }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');

  const tokens = [
    { symbol: 'USDC', name: 'USD Coin', balance: 1250.50, icon: '🪙' },
    { symbol: 'USDT', name: 'Tether', balance: 890.25, icon: '💰' },
    { symbol: 'ETH', name: 'Ethereum', balance: 2.45, icon: '⟠' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', balance: 0.125, icon: '₿' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Empty state for transactions
  const EmptyTransactions = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-gray-400" />
      </div>
      <h4 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h4>
      <p className="text-gray-600 mb-4">Your transaction history will appear here once you start using the vault</p>
      <button className="text-blue-600 hover:text-blue-700 font-medium">
        Make Your First Deposit
      </button>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNumber = parseFloat(amount);
    if (amountNumber > 0) {
      if (activeTab === 'deposit') {
        onDeposit(amountNumber, selectedToken);
      } else {
        onWithdraw(amountNumber, selectedToken);
      }
      setAmount('');
    }
  };

  const handleMaxClick = () => {
    const selectedTokenData = tokens.find(t => t.symbol === selectedToken);
    if (selectedTokenData) {
      if (activeTab === 'deposit') {
        setAmount(selectedTokenData.balance.toString());
      } else {
        setAmount((vaultData.availableBalance * 0.9).toString());
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Vault Management</h1>
        <p className="text-gray-600 mt-1">Deposit, withdraw, and manage your DeFi positions</p>
      </motion.div>

      {/* Vault Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Total Assets",
            value: formatCurrency(vaultData.totalAssets),
            icon: TrendingUp,
            color: "blue",
            delay: 0.1
          },
          {
            title: "Available Balance", 
            value: formatCurrency(vaultData.availableBalance),
            icon: ArrowUpRight,
            color: "green",
            delay: 0.2
          },
          {
            title: "Locked Balance",
            value: formatCurrency(vaultData.lockedBalance),
            icon: Clock,
            color: "orange", 
            delay: 0.3
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <motion.p 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: stat.delay + 0.2 }}
                    className="text-2xl font-bold text-gray-900 mt-1"
                  >
                    {stat.value}
                  </motion.p>
                </div>
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-12 h-12 bg-${stat.color}-50 rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Deposit/Withdraw Interface */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center space-x-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('deposit')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'deposit'
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Deposit</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('withdraw')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'withdraw'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Minus className="w-4 h-4" />
              <span>Withdraw</span>
            </motion.button>
          </div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Token
              </label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                {tokens.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.icon} {token.name} ({token.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  MAX
                </motion.button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Available: {tokens.find(t => t.symbol === selectedToken)?.balance} {selectedToken}
              </p>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'deposit'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
              }`}
            >
              {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
            </motion.button>
          </motion.form>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Preview</h3>
          <div className="space-y-3">
            {[
              { label: "Amount", value: `${amount || '0'} ${selectedToken}` },
              { label: "Gas Fee", value: "~$2.50" },
              { label: "Network", value: "Ethereum" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className="flex justify-between items-center py-2"
              >
                <span className="text-gray-600">{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </motion.div>
            ))}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="border-t pt-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-medium">Total:</span>
                <motion.span 
                  key={amount}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="font-bold text-lg"
                >
                  {amount ? parseFloat(amount) + 2.50 : '2.50'} USD
                </motion.span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="mt-6 p-4 bg-blue-50 rounded-lg"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {activeTab === 'deposit' ? 'Deposit Info' : 'Withdrawal Info'}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {activeTab === 'deposit' 
                    ? 'Funds will be available for trading after 1 block confirmation.'
                    : 'Withdrawals are processed immediately but may take 1-3 blocks to confirm.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        whileHover={{ scale: 1.005 }}
        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        {(() => {
          const transactions = [
            { type: 'Deposit', amount: 1000, token: 'USDC', time: '2 hours ago', status: 'Confirmed' },
            { type: 'Withdraw', amount: 500, token: 'USDT', time: '1 day ago', status: 'Confirmed' },
            { type: 'Deposit', amount: 0.5, token: 'ETH', time: '3 days ago', status: 'Confirmed' },
          ];
          
          return transactions.length === 0 ? (
            <EmptyTransactions />
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <motion.div 
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                  whileHover={{ x: 5, scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'Deposit' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      {tx.type === 'Deposit' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                    </motion.div>
                    <div>
                      <p className="font-medium text-gray-900">{tx.type}</p>
                      <p className="text-sm text-gray-600">{tx.amount} {tx.token}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{tx.time}</p>
                    <motion.p 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-medium text-green-600"
                    >
                      {tx.status}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })()}
      </motion.div>
    </motion.div>
  );
};

export default VaultManager;