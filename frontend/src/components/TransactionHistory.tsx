import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Bot, Filter, Search, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'rebalance' | 'ai-advice';
  amount: number;
  token: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: Date;
  hash?: string;
  gasUsed?: number;
}

const TransactionHistory: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'deposit',
      amount: 1000,
      token: 'USDC',
      status: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      hash: '0x1234...5678',
      gasUsed: 21000
    },
    {
      id: '2',
      type: 'rebalance',
      amount: 0,
      token: '',
      status: 'success',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      hash: '0x2345...6789',
      gasUsed: 45000
    },
    {
      id: '3',
      type: 'withdraw',
      amount: 500,
      token: 'ETH',
      status: 'pending',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      hash: '0x3456...7890'
    },
    {
      id: '4',
      type: 'ai-advice',
      amount: 0,
      token: '',
      status: 'success',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: '5',
      type: 'deposit',
      amount: 2500,
      token: 'USDT',
      status: 'failed',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      hash: '0x4567...8901'
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'withdraw':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      case 'rebalance':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'ai-advice':
        return <Bot className="w-4 h-4 text-purple-600" />;
      default:
        return <ArrowUpRight className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = tx.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1">Track all your vault activities and transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdraw">Withdrawals</option>
              <option value="rebalance">Rebalances</option>
              <option value="ai-advice">AI Advice</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {transaction.type.replace('-', ' ')}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{formatTime(transaction.timestamp)}</span>
                      {transaction.hash && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{transaction.hash}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {transaction.amount > 0 && (
                    <p className="font-medium text-gray-900">
                      {transaction.amount} {transaction.token}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                    {transaction.gasUsed && (
                      <span className="text-xs text-gray-500">
                        Gas: {transaction.gasUsed.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
          <h4 className="font-medium text-green-900 mb-2">Total Deposits</h4>
          <p className="text-2xl font-bold text-green-900">$3,500</p>
          <p className="text-sm text-green-700">+12% this month</p>
        </div>
        
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6">
          <h4 className="font-medium text-red-900 mb-2">Total Withdrawals</h4>
          <p className="text-2xl font-bold text-red-900">$500</p>
          <p className="text-sm text-red-700">-5% this month</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
          <h4 className="font-medium text-blue-900 mb-2">Gas Fees Paid</h4>
          <p className="text-2xl font-bold text-blue-900">$45.50</p>
          <p className="text-sm text-blue-700">15 transactions</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;