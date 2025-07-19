import React from 'react';
import { TrendingUp, Shield, Zap } from 'lucide-react';
import Logo from '../components/Logo';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="mb-6">
              <Logo
                className="h-12 w-12"
                showText={true}
                textClassName="text-4xl font-bold text-white ml-4"
              />
            </div>
            <p className="text-xl text-gray-300 mb-8">
              Your AI-powered financial assistant for smarter money management
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Smart Insights</h3>
                <p className="text-gray-400">
                  Get personalized financial advice powered by AI
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Bank-Level Security</h3>
                <p className="text-gray-400">
                  Your data is protected with enterprise-grade encryption
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Zap className="h-8 w-8 text-yellow-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold">Real-Time Sync</h3>
                <p className="text-gray-400">
                  Connect your accounts for instant financial updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
