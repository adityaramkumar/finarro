import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Bot, 
  MessageSquare, 
  CreditCard, 
  BarChart3, 
  FileText,
  CheckCircle,
  Play,
  Star,
  Users,
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo className="h-8 w-8" showText={true} textClassName="text-xl font-bold text-white ml-3" />
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-indigo-500/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gray-900">

        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-600/10 text-indigo-400 border border-indigo-600/20">
              <Star className="w-4 h-4 mr-2" />
              AI-Powered Financial Intelligence
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Your AI-Powered
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {" "}Financial Assistant
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform how you manage money with AI-powered insights. Chat with your finances, 
            connect bank accounts, analyze documents, and make smarter financial decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/signup"
              className="bg-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all duration-200 flex items-center shadow-xl hover:shadow-indigo-500/25 hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-gray-600 text-gray-300 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-800 hover:border-gray-500 transition-all duration-200 flex items-center"
            >
              <Play className="mr-3 h-5 w-5" />
              Watch Demo
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-400" />
              <span className="text-sm">10,000+ Users</span>
            </div>
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              <span className="text-sm">Bank-Level Security</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything you need to manage your finances
            </h2>
            <p className="text-gray-400 text-xl max-w-3xl mx-auto">
              Powerful features designed to give you complete control over your financial life with AI assistance
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-indigo-600/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-indigo-600/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600/20 transition-colors">
                <MessageSquare className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Chat</h3>
              <p className="text-gray-400 leading-relaxed">
                Ask questions about your spending, get insights, and receive personalized financial advice
              </p>
            </div>
            
            <div className="group bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-green-600/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-green-600/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600/20 transition-colors">
                <CreditCard className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Bank Integration</h3>
              <p className="text-gray-400 leading-relaxed">
                Securely connect your bank accounts and credit cards for automatic transaction syncing
              </p>
            </div>
            
            <div className="group bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-purple-600/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-purple-600/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Visual dashboards and reports to track spending patterns and financial goals
              </p>
            </div>
            
            <div className="group bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-yellow-600/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-yellow-600/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-600/20 transition-colors">
                <FileText className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Document Analysis</h3>
              <p className="text-gray-400 leading-relaxed">
                Upload financial documents and get AI-powered summaries and categorization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-400 mb-2">$2.5B+</div>
              <div className="text-gray-400">Tracked Transactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">10,000+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">
                Your security is our top priority
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                We use industry-leading security measures to protect your financial data. 
                Your information is encrypted, secure, and never shared with third parties.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-4" />
                  <span className="text-gray-300">Bank-level 256-bit encryption</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-4" />
                  <span className="text-gray-300">Real-time transaction monitoring and alerts</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-4" />
                  <span className="text-gray-300">AI-powered insights and recommendations</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-4" />
                  <span className="text-gray-300">Connect unlimited bank accounts and cards</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-4" />
                  <span className="text-gray-300">Document analysis and categorization</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
                <div className="text-center">
                  <Shield className="h-20 w-20 text-green-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">Enterprise Security</h3>
                  <p className="text-gray-400">
                    SOC 2 compliant with multi-factor authentication and advanced threat protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo className="h-8 w-8" showText={true} textClassName="text-xl font-bold text-white ml-3" />
            </div>
            <p className="text-gray-400 mb-6">
              AI-powered financial intelligence for everyone
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/support" className="hover:text-white transition-colors">Support</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/careers" className="hover:text-white transition-colors">Careers</Link>
            </div>
            <p className="text-gray-500 mt-8">
              © 2025 finarro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 