import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, ExternalLink, Calendar, DollarSign, Percent, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import PortfolioChart from './Charts/PortfolioChart';

interface PositionDetailsProps {
  position: {
    id: string;
    name: string;
    value: number;
    apy: number;
    risk: string;
    entryDate: Date;
    lastRebalance: Date;
    impermanentLoss: number;
    fees: number;
    volume24h: number;
  };
  onClose: () => void;
  onRebalance: () => void;
  onClosePosition: () => void;
}

const PositionDetails: React.FC<PositionDetailsProps> = ({
  position,
  onClose,
  onRebalance,
  onClosePosition
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'history'>('overview');

  const performanceData = [
    { date: '7D ago', value: position.value * 0.88 },
    { date: '5D ago', value: position.value * 0.92 },
    { date: '3D ago', value: position.value * 0.95 },
    { date: '1D ago', value: position.value * 0.98 },
    { date: 'Now', value: position.value }
  ];

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

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{position.name}</h2>
            <p className="text-gray-600">Position Details & Management</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'performance', label: 'Performance' },
            { id: 'history', label: 'History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">Current Value</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(position.value)}</p>
                  <p className="text-xs text-green-600 mt-1">+12.5% since entry</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Percent className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">APY</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">{formatPercentage(position.apy)}</p>
                  <p className="text-xs text-gray-500 mt-1">Above market avg</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getRiskColor(position.risk)}`}>
                      {position.risk}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Volatility: Medium</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">24h Volume</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(position.volume24h)}</p>
                  <p className="text-xs text-blue-600 mt-1">+8.2% vs yesterday</p>
                </div>
              </div>

              {/* Position Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Position Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Entry Date:</span>
                      <span className="font-medium flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{position.entryDate.toLocaleDateString()}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Rebalance:</span>
                      <span className="font-medium flex items-center space-x-1">
                        <RefreshCw className="w-3 h-3" />
                        <span>{position.lastRebalance.toLocaleDateString()}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pool Share:</span>
                      <span className="font-medium">0.025%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">LP Tokens:</span>
                      <span className="font-medium">1,250.45</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Risk Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impermanent Loss:</span>
                      <span className={`font-medium ${position.impermanentLoss < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatPercentage(position.impermanentLoss)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fees Earned:</span>
                      <span className="font-medium text-green-600">{formatCurrency(position.fees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Impact:</span>
                      <span className="font-medium text-blue-600">0.12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slippage Tolerance:</span>
                      <span className="font-medium">0.5%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {position.impermanentLoss < -5 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">High Impermanent Loss Warning</p>
                      <p className="text-sm text-red-700 mt-1">
                        Your position is experiencing significant impermanent loss. Consider rebalancing or closing the position.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Performance Chart</h4>
                <PortfolioChart type="line" data={performanceData} height={300} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-2">Total Returns</h5>
                  <p className="text-2xl font-bold text-green-900">+{formatCurrency(position.value * 0.12)}</p>
                  <p className="text-sm text-green-700">+12.5% since entry</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">Outperforming market by 3.2%</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Fees Collected</h5>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(position.fees)}</p>
                  <p className="text-sm text-blue-700">From trading fees</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-600">+15% this week</span>
                  </div>
                </div>
              </div>
              
              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h5 className="font-medium text-purple-900 mb-2">Token Ratio</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-700">USDC:</span>
                      <span className="font-medium text-purple-900">52.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-700">ETH:</span>
                      <span className="font-medium text-purple-900">47.7%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <h5 className="font-medium text-orange-900 mb-2">IL Protection</h5>
                  <p className="text-lg font-bold text-orange-900">Active</p>
                  <p className="text-sm text-orange-700">Max loss: 5%</p>
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h5 className="font-medium text-indigo-900 mb-2">Auto-Compound</h5>
                  <p className="text-lg font-bold text-indigo-900">Enabled</p>
                  <p className="text-sm text-indigo-700">Every 24h</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Transaction History</h4>
              <div className="space-y-3">
                {[
                  { type: 'Auto-Compound', date: '6 hours ago', amount: 12.50, status: 'Success', hash: '0x1234...5678' },
                  { type: 'Rebalance', date: '2 days ago', amount: 0, status: 'Success', hash: '0x2345...6789' },
                  { type: 'Fee Collection', date: '1 week ago', amount: 45.50, status: 'Success', hash: '0x3456...7890' },
                  { type: 'Position Entry', date: '1 month ago', amount: position.value * 0.9, status: 'Success', hash: '0x4567...8901' }
                ].map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        {tx.type === 'Rebalance' ? <RefreshCw className="w-4 h-4 text-blue-600" /> :
                         tx.type === 'Fee Collection' ? <DollarSign className="w-4 h-4 text-green-600" /> :
                         tx.type === 'Auto-Compound' ? <TrendingUp className="w-4 h-4 text-purple-600" /> :
                         <Activity className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tx.type}</p>
                        <p className="text-sm text-gray-600">{tx.date}</p>
                        {tx.hash && (
                          <p className="text-xs text-gray-500 font-mono">{tx.hash}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {tx.amount > 0 && (
                        <p className="font-medium text-gray-900">{formatCurrency(tx.amount)}</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {tx.status}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700">
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-gray-200 bg-gray-50 gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClosePosition}
              className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors font-medium"
            >
              Close Position
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors font-medium">
              Pause Auto-Compound
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
              <ExternalLink className="w-4 h-4" />
              <span>View on Explorer</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors font-medium">
              <Activity className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={onRebalance}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rebalance Now</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PositionDetails;