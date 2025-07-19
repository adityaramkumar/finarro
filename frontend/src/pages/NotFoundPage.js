import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search, FileQuestion, Sparkles, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* Animated Logo */}
        <div className="mb-8">
          <Logo className="h-16 w-16 mx-auto animate-pulse" showText={false} />
        </div>

        {/* 404 Number with Gradient */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text animate-pulse">
            404
          </h1>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl">
              <FileQuestion className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Oops! Page Not Found
          </h2>
          
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, it happens to the best of us!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 group"
          >
            <Home className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            Go to Dashboard
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center w-full bg-gray-800/50 backdrop-blur border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/50 text-gray-300 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Error Code: 404 • Page Not Found
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 