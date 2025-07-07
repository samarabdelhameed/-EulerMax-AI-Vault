import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Wallet, Shield, Bot, TrendingUp, Check, Zap, Star, Users, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to EulerMax AI Vault",
      description: "The future of intelligent DeFi portfolio management is here",
      icon: <div className="relative">
        <Bot className="w-16 h-16 text-blue-600" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
        >
          <Zap className="w-3 h-3 text-white" />
        </motion.div>
      </div>,
      content: (
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Experience the next generation of DeFi with AI-powered portfolio optimization, 
            automated rebalancing, and intelligent risk management - all in one platform.
          </p>
          
          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4 my-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3">
              <Star className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-900">12.5%</p>
              <p className="text-xs text-blue-700">Average APY</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3">
              <Users className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-900">1000+</p>
              <p className="text-xs text-green-700">Active Users</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3">
              <Award className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-900">$50M+</p>
              <p className="text-xs text-purple-700">TVL Managed</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
            >
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900">Smart Optimization</h4>
              <p className="text-sm text-blue-700">AI-powered portfolio management</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200"
            >
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900">Risk Management</h4>
              <p className="text-sm text-green-700">Advanced risk assessment tools</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
            >
              <Bot className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900">AI Advisor</h4>
              <p className="text-sm text-purple-700">24/7 intelligent guidance</p>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: "Connect Your Web3 Wallet",
      description: "Secure, seamless connection to your favorite wallet",
      icon: <div className="relative">
        <Wallet className="w-16 h-16 text-green-600" />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -inset-2 bg-green-200 rounded-full -z-10"
        />
      </div>,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Choose your preferred wallet to connect to EulerMax AI. We support all major Web3 wallets 
              with enterprise-grade security.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'MetaMask', icon: '🦊', popular: true, users: '100M+' },
              { name: 'WalletConnect', icon: '🔗', popular: false, users: '50M+' },
              { name: 'Coinbase Wallet', icon: '🔵', popular: false, users: '30M+' },
              { name: 'Rainbow', icon: '🌈', popular: false, users: '5M+' }
            ].map((wallet) => (
              <motion.button
                key={wallet.name}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-4 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all shadow-sm hover:shadow-md"
              >
                <span className="text-3xl">{wallet.icon}</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{wallet.name}</p>
                  <p className="text-xs text-gray-500">{wallet.users} users</p>
                  {wallet.popular && (
                    <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-2 py-1 rounded-full mt-1 inline-block">
                      Most Popular
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-900">Security First</h4>
            </div>
            <p className="text-sm text-green-700">
              Your private keys never leave your wallet. We use read-only connections and smart contract interactions only.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Advanced Security Setup",
      description: "Enable cutting-edge security features for maximum protection",
      icon: <div className="relative">
        <Shield className="w-16 h-16 text-purple-600" />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-3 border-2 border-dashed border-purple-300 rounded-full"
        />
      </div>,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-start space-x-4 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200"
            >
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center mt-1">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-purple-900">Passkey Authentication</h4>
                <p className="text-sm text-purple-700">
                  Use biometric authentication (Face ID, Touch ID, or Windows Hello) for secure, passwordless access.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">WebAuthn</span>
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">FIDO2</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Smart Account</h4>
                <p className="text-sm text-blue-700">
                  Account abstraction (ERC-4337) for gasless transactions, batch operations, and social recovery.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">ERC-4337</span>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Gasless</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200"
            >
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-1">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-green-900">Multi-Signature Protection</h4>
                <p className="text-sm text-green-700">
                  Additional security layer for large transactions (&gt;$10K) and sensitive operations with time delays.
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Multi-Sig</span>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Time Lock</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium text-orange-900">Pro Tip</h4>
            </div>
            <p className="text-sm text-orange-700">
              Enable all security features for maximum protection. You can always adjust these settings later in your account preferences.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "🎉 Welcome to the Future!",
      description: "Your AI-powered DeFi journey begins now",
      icon: <div className="relative">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <TrendingUp className="w-16 h-16 text-green-600" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -inset-4 bg-green-200 rounded-full -z-10 opacity-30"
        />
      </div>,
      content: (
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-xl p-6 border border-green-200"
          >
            <h4 className="font-semibold text-gray-900 mb-4">What's Next?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="space-y-2 p-4 bg-white/50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <p className="font-medium text-gray-900">1. Deposit Funds</p>
                </div>
                <p className="text-sm text-gray-600">Add your crypto assets to start earning</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="space-y-2 p-4 bg-white/50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                <p className="font-medium text-gray-900">2. Set Strategy</p>
                </div>
                <p className="text-sm text-gray-600">Choose your risk level and goals</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="space-y-2 p-4 bg-white/50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                <p className="font-medium text-gray-900">3. AI Optimization</p>
                </div>
                <p className="text-sm text-gray-600">Let AI manage your portfolio</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="space-y-2 p-4 bg-white/50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                <p className="font-medium text-gray-900">4. Track Performance</p>
                </div>
                <p className="text-sm text-gray-600">Monitor your returns and insights</p>
              </motion.div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">💡</span>
                <h5 className="font-medium text-yellow-900">Pro Tip</h5>
              </div>
              <p className="text-sm text-yellow-800">
                Start with a small amount ($100-500) to familiarize yourself with the platform.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">🎯</span>
                <h5 className="font-medium text-blue-900">Quick Start</h5>
              </div>
              <p className="text-sm text-blue-800">
                Our AI will suggest optimal strategies based on your risk profile.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length} • Getting Started
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="p-8 md:p-12"
            >
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {steps[currentStep].icon}
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 text-xl">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className="mb-8">
                {steps[currentStep].content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-white rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 scale-110' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="font-medium">
                {currentStep === steps.length - 1 ? '🚀 Launch Dashboard' : 'Continue'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;