import React, { useState } from 'react';
import { Send, Bot, User, TrendingUp, AlertTriangle, Lightbulb, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAdvisorProps {
  onSendMessage: (message: string) => void;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI advisor. I can help you optimize your DeFi portfolio, analyze market conditions, and provide personalized investment strategies. How can I assist you today?",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      suggestions: [
        "Analyze my current portfolio risk",
        "Suggest optimal rebalancing strategy",
        "What's the market outlook for ETH?",
        "Show me high-yield opportunities"
      ]
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Empty state for no messages
  const EmptyChat = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
        <Bot className="w-8 h-8 text-purple-600" />
      </div>
      <h4 className="text-lg font-medium text-gray-900 mb-2">Start a Conversation</h4>
      <p className="text-gray-600 mb-4">Ask me anything about your portfolio, market conditions, or DeFi strategies</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          "Analyze my portfolio risk",
          "What's the market outlook?",
          "Suggest rebalancing strategy"
        ].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(currentMessage),
        timestamp: new Date(),
        suggestions: getAISuggestions(currentMessage)
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);

    onSendMessage(currentMessage);
  };

  const getAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('portfolio')) {
      return "Based on your current portfolio analysis, you have a moderate risk profile with 65% in stable LP positions and 35% in volatile assets. Your impermanent loss exposure is currently 3.2%, which is within acceptable limits. I recommend maintaining your current allocation but consider reducing ETH exposure by 10% if volatility increases.";
    }
    
    if (lowerMessage.includes('rebalance') || lowerMessage.includes('optimize')) {
      return "I've analyzed your positions and identified several optimization opportunities:\n\n1. Move 15% from USDC/ETH LP to USDC/USDT for lower IL risk\n2. Increase WBTC exposure by 5% given current market conditions\n3. Consider yield farming opportunities in Compound V3\n\nExpected APY improvement: +2.3% with similar risk profile.";
    }
    
    if (lowerMessage.includes('market') || lowerMessage.includes('outlook')) {
      return "Current market analysis shows:\n\n📈 ETH: Bullish momentum with strong support at $1,800\n📊 BTC: Consolidating, expect breakout above $28,000\n🏦 DeFi: TVL growing 15% monthly, stablecoin yields stable\n⚠️ Risk: Fed policy uncertainty, monitor closely\n\nRecommendation: Maintain current strategy with slight tilt toward blue-chip assets.";
    }
    
    return "I understand you're looking for guidance. Could you be more specific about what aspect of your portfolio you'd like me to analyze? I can help with risk assessment, yield optimization, market analysis, or strategic rebalancing.";
  };

  const getAISuggestions = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('risk')) {
      return [
        "How can I reduce impermanent loss?",
        "What's my maximum drawdown risk?",
        "Suggest hedging strategies"
      ];
    }
    
    if (lowerMessage.includes('rebalance')) {
      return [
        "Execute recommended rebalancing",
        "Show me the transaction preview",
        "What are the gas costs?"
      ];
    }
    
    return [
      "Analyze yield opportunities",
      "Check for arbitrage possibilities",
      "Review my transaction history"
    ];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        className="flex items-center space-x-3"
      >
        <motion.div 
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
        >
          <Bot className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Advisor</h1>
          <p className="text-gray-600">Get personalized DeFi insights and strategies</p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, title: "Portfolio Score", value: "8.5/10", color: "blue", delay: 0.1 },
          { icon: Lightbulb, title: "Active Strategies", value: "3", color: "green", delay: 0.2 },
          { icon: AlertTriangle, title: "Risk Level", value: "Medium", color: "orange", delay: 0.3 }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`bg-gradient-to-r from-${stat.color}-50 to-${stat.color}-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300`}
            >
          <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Icon className={`w-6 h-6 text-${stat.color}-600`} />
              </motion.div>
            <div>
                <p className={`text-sm text-${stat.color}-600`}>{stat.title}</p>
                <motion.p 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: stat.delay + 0.2 }}
                  className={`text-xl font-bold text-${stat.color}-900`}
                >
                  {stat.value}
                </motion.p>
            </div>
          </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chat Interface */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ scale: 1.005 }}
        className="bg-white rounded-xl border border-gray-200 flex flex-col h-96 hover:shadow-xl transition-all duration-300"
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <EmptyChat />
          ) : (
            messages.map((message, index) => (
              <motion.div 
                key={message.id} 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-900'
                  } hover:shadow-md transition-all duration-200`}
                >
                <div className="flex items-center space-x-2 mb-1">
                  {message.type === 'ai' ? (
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Bot className="w-4 h-4 text-purple-600" />
                    </motion.div>
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                  <span className="text-xs opacity-75">{formatTime(message.timestamp)}</span>
                </div>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                
                {message.suggestions && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 text-xs bg-white/10 rounded-md hover:bg-white/20 transition-all duration-200"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                )}
                </motion.div>
              </motion.div>
            ))
          )}
          
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Bot className="w-4 h-4 text-purple-600" />
                    </motion.div>
                  <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -8, 0] }}
                          transition={{ 
                            duration: 0.6, 
                            repeat: Infinity, 
                            delay: i * 0.2 
                          }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      ))}
                  </div>
                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t border-gray-200 p-4"
        >
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <motion.input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask me anything about your portfolio..."
              whileFocus={{ scale: 1.02 }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!currentMessage.trim() || isTyping}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      {/* Recent Insights */}
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        whileHover={{ scale: 1.005 }}
        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
        <div className="space-y-3">
          {[
            {
              title: "Yield Optimization Opportunity",
              description: "Move 20% of USDC to Compound V3 for +3.2% APY",
              time: "5 minutes ago",
              type: "opportunity"
            },
            {
              title: "Risk Alert",
              description: "ETH volatility increasing - consider hedging",
              time: "1 hour ago",
              type: "warning"
            },
            {
              title: "Market Analysis",
              description: "DeFi TVL growing 15% - bullish sentiment",
              time: "3 hours ago",
              type: "info"
            }
          ].map((insight, index) => (
            <motion.div 
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
              whileHover={{ x: 5, scale: 1.02 }}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-2 h-2 rounded-full mt-2 ${
                insight.type === 'opportunity' ? 'bg-green-500' : 
                insight.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                }`}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{insight.title}</p>
                <p className="text-sm text-gray-600">{insight.description}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{insight.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIAdvisor;