import React from 'react';
import { Home, ArrowLeft, Search, HelpCircle, Compass, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotFoundProps {
  onNavigateHome: () => void;
  onNavigateBack: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onNavigateHome, onNavigateBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Animation */}
          <div className="mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-9xl font-bold text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text mb-4"
            >
              404
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-40 h-40 mx-auto mb-6"
            >
              <div className="relative">
                <div className="w-40 h-40 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-lg">
                  <Compass className="w-20 h-20 text-gray-400" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-purple-600 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 border-2 border-transparent border-b-pink-500 rounded-full"
                />
              </div>
            </motion.div>
          </div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Lost in the DeFi Universe? 🌌
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              The page you're looking for seems to have been liquidated! 
              Don't worry, your portfolio is safe and we'll help you navigate back to your assets.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <button
              onClick={onNavigateHome}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <Home className="w-5 h-5" />
              <span>Return to Dashboard</span>
            </button>
            
            <button
              onClick={onNavigateBack}
              className="flex items-center justify-center space-x-2 bg-white text-gray-700 border-2 border-gray-300 px-8 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-105 shadow-md"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center space-x-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>Maybe you were looking for:</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={onNavigateHome}
                className="text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all group border border-transparent hover:border-blue-200"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Home className="w-4 h-4 text-blue-600" />
                  <p className="font-medium text-blue-600 group-hover:text-blue-700">Portfolio Dashboard</p>
                </div>
                <p className="text-sm text-gray-600">View your DeFi portfolio overview</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/vault'}
                className="text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all group border border-transparent hover:border-green-200"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Search className="w-4 h-4 text-green-600" />
                  <p className="font-medium text-green-600 group-hover:text-green-700">Vault Management</p>
                </div>
                <p className="text-sm text-gray-600">Deposit and withdraw funds</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/ai-advisor'}
                className="text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all group border border-transparent hover:border-purple-200"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <p className="font-medium text-purple-600 group-hover:text-purple-700">AI Advisor</p>
                </div>
                <p className="text-sm text-gray-600">Get intelligent portfolio insights</p>
              </button>
              
              <button
                onClick={() => window.location.href = '/support'}
                className="text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all group border border-transparent hover:border-orange-200"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Compass className="w-4 h-4 text-orange-600" />
                  <p className="font-medium text-orange-600 group-hover:text-orange-700">Support Center</p>
                </div>
                <p className="text-sm text-gray-600">Get help and contact support</p>
              </button>
            </div>
          </motion.div>

          {/* Fun Fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-blue-200"
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🤖</div>
              <div>
                <p className="text-sm text-gray-700 font-medium mb-1">
                  <strong>AI Insight:</strong> Portfolio Optimization in Progress
                </p>
                <p className="text-sm text-gray-600">
                  While you're here, our AI is continuously optimizing portfolios across the DeFi ecosystem, 
                  generating returns for thousands of users 24/7! Your portfolio is being monitored and optimized even now.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-6 grid grid-cols-3 gap-4"
          >
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-blue-600">24/7</p>
              <p className="text-xs text-gray-600">AI Monitoring</p>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-green-600">12.5%</p>
              <p className="text-xs text-gray-600">Avg APY</p>
            </div>
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-purple-600">1000+</p>
              <p className="text-xs text-gray-600">Active Users</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;