import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Target, Users, Sparkles, Shield, Globe, Zap, TrendingUp, MessageCircle } from 'lucide-react';
import Logo from '../components/Logo';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
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
              <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl">
                <Heart className="h-12 w-12 text-green-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">About finarro</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Empowering individuals to take control of their financial future through intelligent 
              automation and AI-powered insights.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            
            {/* Our Story */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Sparkles className="h-6 w-6 mr-3 text-green-400" />
                Our Story
              </h2>
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-8">
                <p className="text-gray-300 leading-relaxed mb-6">
                  finarro was born from a simple observation: managing personal finances shouldn't be 
                  overwhelming or time-consuming. Founded in 2025, we set out to create a platform that 
                  combines the power of artificial intelligence with intuitive design to make financial 
                  management accessible to everyone.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Our team of financial experts, data scientists, and designers came together with a shared 
                  vision: to democratize financial intelligence and help people make better financial decisions 
                  through technology. Today, we're proud to serve thousands of users who trust us with their 
                  financial journey.
                </p>
              </div>
            </section>

            {/* Mission & Vision */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-xl mr-4">
                      <Target className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Our Mission</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    To empower individuals with intelligent financial tools that simplify money management, 
                    provide actionable insights, and help build lasting financial wellness through innovation 
                    and accessibility.
                  </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-xl mr-4">
                      <Globe className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Our Vision</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    A world where everyone has access to personalized financial guidance, where making 
                    smart money decisions is effortless, and where financial stress is replaced with 
                    confidence and clarity.
                  </p>
                </div>
              </div>
            </section>

            {/* Core Values */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Heart className="h-6 w-6 mr-3 text-green-400" />
                Our Core Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group">
                  <div className="p-3 bg-green-500/20 rounded-xl inline-block mb-4 group-hover:bg-green-500/30 transition-colors">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Security First</h3>
                  <p className="text-gray-300 text-sm">
                    Your financial data is sacred. We implement bank-level security measures and 
                    maintain the highest standards of data protection.
                  </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group">
                  <div className="p-3 bg-blue-500/20 rounded-xl inline-block mb-4 group-hover:bg-blue-500/30 transition-colors">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">User-Centric</h3>
                  <p className="text-gray-300 text-sm">
                    Every feature we build starts with understanding your needs. We listen, learn, 
                    and iterate based on real user feedback.
                  </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group">
                  <div className="p-3 bg-purple-500/20 rounded-xl inline-block mb-4 group-hover:bg-purple-500/30 transition-colors">
                    <Zap className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Innovation</h3>
                  <p className="text-gray-300 text-sm">
                    We leverage cutting-edge AI and machine learning to provide insights that 
                    were previously available only to financial professionals.
                  </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group">
                  <div className="p-3 bg-orange-500/20 rounded-xl inline-block mb-4 group-hover:bg-orange-500/30 transition-colors">
                    <Globe className="h-6 w-6 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Accessibility</h3>
                  <p className="text-gray-300 text-sm">
                    Financial wellness should be available to everyone, regardless of income level 
                    or financial background. We build inclusive tools for all.
                  </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group">
                  <div className="p-3 bg-pink-500/20 rounded-xl inline-block mb-4 group-hover:bg-pink-500/30 transition-colors">
                    <Heart className="h-6 w-6 text-pink-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Transparency</h3>
                  <p className="text-gray-300 text-sm">
                    We believe in clear communication about how we handle your data, what our 
                    algorithms do, and how we make money.
                  </p>
                </div>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 group">
                  <div className="p-3 bg-cyan-500/20 rounded-xl inline-block mb-4 group-hover:bg-cyan-500/30 transition-colors">
                    <TrendingUp className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">Growth Mindset</h3>
                  <p className="text-gray-300 text-sm">
                    We're constantly learning and improving. Your financial journey is a marathon, 
                    not a sprint, and we're here for the long haul.
                  </p>
                </div>
              </div>
            </section>

            {/* What We Do */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                <Sparkles className="h-6 w-6 mr-3 text-green-400" />
                What We Do
              </h2>
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">AI-Powered Analysis</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Our sophisticated AI engine analyzes your financial patterns, identifies opportunities 
                      for improvement, and provides personalized recommendations tailored to your unique situation.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Smart Automation</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Automate tedious financial tasks like expense categorization, document processing, 
                      and transaction analysis so you can focus on what matters most.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Comprehensive Insights</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Get a complete picture of your financial health with detailed reports, spending 
                      analysis, and trend identification that help you make informed decisions.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Secure Platform</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Bank-level security, end-to-end encryption, and strict privacy controls ensure 
                      your financial data remains safe and confidential at all times.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-8 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <MessageCircle className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Get in Touch</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Have questions about finarro? Want to learn more about our mission? 
                  We'd love to hear from you and help you on your financial journey.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link 
                    to="/signup" 
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 hover:scale-105 active:scale-95"
                  >
                    Get Started Today
                  </Link>
                  <div className="text-gray-300 text-sm">
                    📧 hello@finarro.com
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 