import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageCircle, HelpCircle, Book, Zap, Shield, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Logo from '../components/Logo';
import SEO, { SEOConfigs } from '../components/SEO';

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'normal'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: "How do I connect my bank account?",
      answer: "Go to Settings > Connected Accounts and click 'Add Account'. We use bank-level security to safely connect your accounts through our trusted partners."
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes! We use 256-bit encryption, multi-factor authentication, and follow strict security protocols. Your data is never shared with third parties without your consent."
    },
    {
      question: "How does the AI analysis work?",
      answer: "Our AI analyzes your spending patterns, categorizes transactions, and provides personalized insights to help you make better financial decisions."
    },
    {
      question: "Can I export my data?",
      answer: "Absolutely! You can export your data in various formats (CSV, PDF) from your account settings at any time."
    },
    {
      question: "What types of accounts can I connect?",
      answer: "We support most US banks, credit unions, credit cards, and investment accounts. If you have trouble connecting, contact us for assistance."
    }
  ];

  const quickHelp = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of finarro",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: CreditCard,
      title: "Account Connection",
      description: "Connect your bank accounts",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Understand our security measures",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Zap,
      title: "AI Features",
      description: "Maximize your AI insights",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-6 lg:px-8 py-8">
      <SEO {...SEOConfigs.support} />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <Logo showText={true} className="h-8 w-8" />
        </div>

        {/* Main Content */}
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8 shadow-lg">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl">
                <MessageCircle className="h-12 w-12 text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Support Center</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get help with finarro, find answers to common questions, or reach out to our support team
            </p>
          </div>

          {/* Quick Help Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <HelpCircle className="h-6 w-6 mr-3 text-blue-400" />
              Quick Help
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickHelp.map((item, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 cursor-pointer group">
                  <div className={`p-3 bg-gradient-to-r ${item.color} bg-opacity-10 rounded-xl inline-block mb-4 group-hover:bg-opacity-20 transition-all`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Send className="h-6 w-6 mr-3 text-blue-400" />
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70"
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70 cursor-pointer"
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="normal">Normal - Standard support</option>
                      <option value="high">High - Urgent issue</option>
                      <option value="critical">Critical - Account access</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-gray-800/70 resize-none"
                    placeholder="Please describe your issue or question in detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Phone className="h-6 w-6 mr-3 text-blue-400" />
                Contact Information
              </h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-500/20 rounded-xl mr-4">
                      <Mail className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Email Support</h3>
                      <p className="text-gray-400 text-sm">Get help via email</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300">📧 hello@finarro.com</p>
                    <p className="text-gray-400 text-sm">Response time: Within 24 hours</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl mr-4">
                      <Phone className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Phone Support</h3>
                      <p className="text-gray-400 text-sm">Speak with our team</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300">📱 +1 (408) 329-7788</p>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Mon-Fri: 9AM-6PM PST</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl mr-4">
                      <MapPin className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Office Address</h3>
                      <p className="text-gray-400 text-sm">Visit us in person</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-300">📍 21135 Hazelbrook Drive</p>
                    <p className="text-gray-300">Cupertino, CA</p>
                    <p className="text-gray-400 text-sm">By appointment only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <HelpCircle className="h-6 w-6 mr-3 text-blue-400" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
                  <h3 className="text-lg font-semibold text-white mb-3">{item.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-12 bg-blue-900/20 border border-blue-700/50 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Still Need Help?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you get the most out of finarro.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/about" 
                className="bg-gray-800/50 backdrop-blur border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/50 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Learn More About finarro
              </Link>
              <Link 
                to="/docs" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage; 