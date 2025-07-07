import React from 'react';
import { useState } from 'react';
import { TrendingUp, TrendingDown, Shield, Zap, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PortfolioChart from './Charts/PortfolioChart';
import PositionDetails from './PositionDetails';

interface DashboardProps {
  vaultData: {
    totalAssets: number;
    totalReturns: number;
    apy: number;
    riskScore: number;
    activePositions: number;
    rebalanceNeeded: boolean;
  };
  onRebalance: () => void;
  onAskAI: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ vaultData, onRebalance, onAskAI }) => {
  const [selectedPosition, setSelectedPosition] = useState<any>(null);

  // Mock chart data
  const portfolioPerformanceData = [
    { date: '1W', value: 120000 },
    { date: '2W', value: 122000 },
    { date: '3W', value: 118000 },
    { date: '4W', value: 125000 },
    { date: 'Now', value: vaultData.totalAssets }
  ];

  const allocationData = [
    { name: 'USDC/ETH LP', value: 45 },
    { name: 'WBTC/USDT LP', value: 32 },
    { name: 'LINK/ETH LP', value: 18 },
    { name: 'Cash', value: 5 }
  ];

  const positions = [
    { 
      id: '1',
      name: 'USDC/ETH LP', 
      value: 45000, 
      apy: 12.5, 
      risk: 'Medium',
      entryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastRebalance: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      impermanentLoss: -3.2,
      fees: 450,
      volume24h: 2500000
    },
    { 
      id: '2',
      name: 'WBTC/USDT LP', 
      value: 32000, 
      apy: 8.7, 
      risk: 'Low',
      entryDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      lastRebalance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      impermanentLoss: -1.1,
      fees: 280,
      volume24h: 1800000
    },
    { 
      id: '3',
      name: 'LINK/ETH LP', 
      value: 18000, 
      apy: 15.2, 
      risk: 'High',
      entryDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastRebalance: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      impermanentLoss: -6.8,
      fees: 180,
      volume24h: 950000
    },
  ];

  // Empty state component
  const EmptyPositions = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Positions</h3>
      <p className="text-gray-600 mb-6">Start your DeFi journey by creating your first liquidity position</p>
      <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
        Create First Position
      </button>
    </div>
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-50';
    if (score <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 3) return 'Low Risk';
    if (score <= 6) return 'Medium Risk';
    return 'High Risk';
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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your DeFi investments with AI-powered insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAskAI}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Ask AI</span>
          </motion.button>
          {vaultData.rebalanceNeeded && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRebalance}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Rebalance</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Assets",
            value: formatCurrency(vaultData.totalAssets),
            icon: DollarSign,
            color: "blue",
            delay: 0.1
          },
          {
            title: "Total Returns",
            value: formatCurrency(vaultData.totalReturns),
            subtitle: formatPercentage(vaultData.totalReturns / vaultData.totalAssets * 100),
            icon: vaultData.totalReturns >= 0 ? TrendingUp : TrendingDown,
            color: vaultData.totalReturns >= 0 ? "green" : "red",
            delay: 0.2
          },
          {
            title: "Current APY",
            value: formatPercentage(vaultData.apy),
            icon: TrendingUp,
            color: "purple",
            delay: 0.3
          },
          {
            title: "Risk Score",
            value: `${vaultData.riskScore}/10`,
            subtitle: getRiskLabel(vaultData.riskScore),
            icon: Shield,
            color: "orange",
            delay: 0.4
          }
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: card.delay }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-gray-800/90 rounded-xl border border-gray-700/50 p-6 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer"
            >
          <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-400">{card.title}</p>
                <motion.p 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: card.delay + 0.2 }}
                  className="text-2xl font-bold text-white mt-1"
                >
                  {card.value}
                </motion.p>
                {card.subtitle && (
                  <p className={`text-sm font-medium mt-1 px-2 py-1 rounded-full ${
                    card.color === 'green' ? 'text-green-600' : 
                    card.color === 'red' ? 'text-red-600' : 
                    getRiskColor(vaultData.riskScore)
                  }`}>
                    {card.subtitle}
                  </p>
                )}
            </div>
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`w-12 h-12 bg-${card.color}-600/20 rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 text-${card.color}-600`} />
              </motion.div>
            </div>
            </motion.div>
          );
        })}
      </div>

      {/* Portfolio Overview */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Performance Chart */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="lg:col-span-2 bg-gray-800/90 rounded-xl border border-gray-700/50 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Performance</h3>
          <PortfolioChart type="line" data={portfolioPerformanceData} height={250} />
        </motion.div>

        {/* Asset Allocation */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-gray-800/90 rounded-xl border border-gray-700/50 p-6 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
          <PortfolioChart type="pie" data={allocationData} height={250} />
        </motion.div>
      </motion.div>

      {/* Positions and Activity */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-gray-800/90 rounded-xl border border-gray-700/50 p-6 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Active Positions</h3>
          {positions.length === 0 ? (
            <EmptyPositions />
          ) : (
            <div className="space-y-4">
              {positions.map((position, index) => (
                <motion.button
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  whileHover={{ x: 5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPosition(position)}
                  className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-all duration-300 text-left"
                >
                  <div>
                    <p className="font-medium text-white">{position.name}</p>
                    <p className="text-sm text-gray-300">{formatCurrency(position.value)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatPercentage(position.apy)}</p>
                    <p className="text-sm text-gray-300">{position.risk} Risk</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-gray-800/90 rounded-xl border border-gray-700/50 p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { type: 'Rebalance', time: '2 hours ago', status: 'Success' },
              { type: 'Deposit', time: '1 day ago', status: 'Success' },
              { type: 'AI Recommendation', time: '3 days ago', status: 'Pending' },
            ].map((activity, index) => (
              <motion.div 
                key={index}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
                whileHover={{ x: -5, scale: 1.02 }}
                className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-all duration-300"
              >
                <div>
                  <p className="font-medium text-white">{activity.type}</p>
                  <p className="text-sm text-gray-300">{activity.time}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activity.status === 'Success' 
                    ? 'bg-green-600/20 text-green-400'
                    : activity.status === 'Pending'
                    ? 'bg-yellow-600/20 text-yellow-400'
                    : 'bg-red-600/20 text-red-400'
                }`}>
                  {activity.status}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* AI Insights */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30 p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
      >
        <div className="flex items-center space-x-3 mb-4">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
          >
            <Zap className="w-4 h-4 text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        <div className="space-y-3">
          {[
            "Market Opportunity: USDC/ETH LP showing increased volatility. Consider reducing position size by 15% to maintain risk profile.",
            "Impermanent Loss Warning: LINK/ETH pair showing high divergence. Monitor closely or consider rebalancing."
          ].map((insight, index) => (
            <motion.div 
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 + index * 0.2 }}
              whileHover={{ x: 5 }}
              className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 hover:bg-gray-700/60 transition-all duration-300"
            >
            <p className="text-sm text-gray-200">
              <strong>{index === 0 ? 'Market Opportunity:' : 'Impermanent Loss Warning:'}</strong> {insight.split(': ')[1]}
            </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Position Details Modal */}
      <AnimatePresence>
        {selectedPosition && (
        <PositionDetails
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
          onRebalance={() => {
            onRebalance();
            setSelectedPosition(null);
          }}
          onClosePosition={() => {
            console.log('Closing position:', selectedPosition.name);
            setSelectedPosition(null);
          }}
        />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;