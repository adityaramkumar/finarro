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
  Star,
  Users,
  DollarSign,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  ChevronDown,
  Quote,
  PlayCircle
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
      <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden bg-gray-900">
        
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
              Sign In
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              <span className="text-sm">Bank-Level Security</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              <span className="text-sm">Free to Start</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-400" />
              <span className="text-sm">2-Minute Setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-gray-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How it works
            </h2>
            <p className="text-gray-400 text-xl max-w-3xl mx-auto">
              Get personalized financial insights in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <div className="text-center group">
              <div className="mb-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-110 relative">
                  <CreditCard className="h-12 w-12 text-white" />
                  <div className="absolute -top-3 -left-3 bg-gray-900 border-4 border-indigo-500 text-indigo-400 text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center">
                    1
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Connect Your Accounts</h3>
              <p className="text-gray-400 leading-relaxed">
                Securely link your bank accounts and credit cards. We use bank-level encryption to keep your data safe.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mb-6">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-green-500/50 transition-all duration-300 group-hover:scale-110 relative">
                  <Bot className="h-12 w-12 text-white" />
                  <div className="absolute -top-3 -left-3 bg-gray-900 border-4 border-green-500 text-green-400 text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center">
                    2
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Analyzes Everything</h3>
              <p className="text-gray-400 leading-relaxed">
                Our AI categorizes transactions, identifies patterns, and finds opportunities to save money.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110 relative">
                  <TrendingUp className="h-12 w-12 text-white" />
                  <div className="absolute -top-3 -left-3 bg-gray-900 border-4 border-purple-500 text-purple-400 text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center">
                    3
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Get Actionable Insights</h3>
              <p className="text-gray-400 leading-relaxed">
                Receive personalized recommendations to reduce expenses, increase savings, and improve your financial health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-gray-900 relative">
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
              <h3 className="text-xl font-semibold text-white mb-3">AI Financial Chat</h3>
              <p className="text-gray-400 leading-relaxed">
                "Why did I spend so much last month?" Get instant answers about your finances in plain English.
              </p>
            </div>
            
            <div className="group bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-green-600/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-green-600/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600/20 transition-colors">
                <CreditCard className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Automatic Tracking</h3>
              <p className="text-gray-400 leading-relaxed">
                Stop manually entering expenses. Connect your accounts once and never think about it again.
              </p>
            </div>
            
            <div className="group bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-purple-600/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-purple-600/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Money-Saving Insights</h3>
              <p className="text-gray-400 leading-relaxed">
                "You're spending 40% more on food than similar users." Get alerts that actually save you money.
              </p>
            </div>
            
            <div className="group bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-yellow-600/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-yellow-600/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-yellow-600/20 transition-colors">
                <FileText className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Document Reading</h3>
              <p className="text-gray-400 leading-relaxed">
                Upload receipts, statements, or contracts. AI reads them and updates your financial picture automatically.
              </p>
            </div>
          </div>
        </div>
      </section>



      
             

             {/* Final CTA Section */}
       <section className="py-16 md:py-24 lg:py-32 bg-gray-950">
         <div className="max-w-7xl mx-auto px-6">
                     <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur border border-indigo-500/20 rounded-3xl p-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-green-600/20 text-green-400 border border-green-600/30 mb-6">
                <Shield className="w-5 h-5 mr-2" />
                Bank-Level Security
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to take control of your finances?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of people who've already started saving money and making smarter financial decisions with finarro.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <Link
                to="/signup"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-5 rounded-2xl text-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-indigo-500/50 hover:scale-105 flex items-center"
              >
                Start Saving Money Today
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
              <div className="text-gray-400 text-center">
                <div className="text-sm font-medium">Free to start • No credit card required</div>
                <div className="text-xs">Setup takes less than 2 minutes</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-400">2 min</div>
                <div className="text-gray-400">Average setup time</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-blue-400">$200+</div>
                <div className="text-gray-400">Average monthly savings</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-400">24/7</div>
                <div className="text-gray-400">AI monitoring</div>
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