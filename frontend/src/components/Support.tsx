import React, { useState } from 'react';
import { Send, MessageCircle, Mail, Phone, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Support: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'medium'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const faqItems = [
    {
      question: "How does AI portfolio optimization work?",
      answer: "Our AI analyzes market conditions, your risk profile, and historical data to automatically rebalance your portfolio for optimal returns while minimizing impermanent loss."
    },
    {
      question: "What fees does EulerMax AI charge?",
      answer: "We charge a 1% management fee on profits only. There are no upfront fees, and you only pay when you earn returns."
    },
    {
      question: "How secure is my wallet connection?",
      answer: "We use industry-standard security practices including smart account abstraction, passkey authentication, and never store your private keys."
    },
    {
      question: "Can I withdraw my funds at any time?",
      answer: "Yes, you can withdraw your funds at any time. Some positions may have a small delay due to DeFi protocol requirements."
    },
    {
      question: "What blockchains do you support?",
      answer: "Currently we support Ethereum mainnet with plans to expand to Polygon, Arbitrum, and other major L2 solutions."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-600 mt-2">Get help with your EulerMax AI experience</p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
          <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-blue-900 mb-2">Live Chat</h3>
          <p className="text-sm text-blue-700 mb-4">Get instant help from our support team</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Start Chat
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
          <Mail className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-green-900 mb-2">Email Support</h3>
          <p className="text-sm text-green-700 mb-4">Send us a detailed message</p>
          <a 
            href="mailto:support@eulermax.ai"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
          >
            Send Email
          </a>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center">
          <Phone className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-purple-900 mb-2">Phone Support</h3>
          <p className="text-sm text-purple-700 mb-4">Speak with our experts directly</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Schedule Call
          </button>
        </div>
      </div>

      {/* Support Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Send us a Message</h3>
          
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h4>
              <p className="text-gray-600">We'll get back to you within 24 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing & Fees</option>
                    <option value="security">Security Concern</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please describe your issue or question in detail..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details key={index} className="group">
                <summary className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-900">{item.question}</span>
                  <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2 p-3 text-gray-600 text-sm">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Response Times */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>Expected Response Times</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Live Chat</p>
              <p className="text-sm text-gray-600">Usually within 5 minutes</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Email Support</p>
              <p className="text-sm text-gray-600">Within 24 hours</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div>
              <p className="font-medium text-gray-900">Phone Support</p>
              <p className="text-sm text-gray-600">Same day callback</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
          <div>
            <h4 className="font-semibold text-red-900 mb-2">Emergency Support</h4>
            <p className="text-red-700 mb-3">
              If you're experiencing a security issue or urgent problem that requires immediate attention:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Emergency Contact
              </button>
              <a 
                href="mailto:emergency@eulermax.ai"
                className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-center"
              >
                emergency@eulermax.ai
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;