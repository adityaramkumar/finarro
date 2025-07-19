import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Globe, Mail } from 'lucide-react';
import Logo from '../components/Logo';

const PrivacyPolicyPage = () => {
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
              <div className="p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl">
                <Shield className="h-12 w-12 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-400 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Eye className="h-6 w-6 mr-3 text-indigo-400" />
                  Introduction
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  At finarro, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                  disclose, and safeguard your information when you use our financial management platform. 
                  Please read this privacy policy carefully.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Database className="h-6 w-6 mr-3 text-indigo-400" />
                  Information We Collect
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Personal Information</h3>
                    <ul className="text-gray-300 space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Name, email address, and contact information</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Account credentials and authentication data</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Financial account information (bank accounts, credit cards)</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Transaction data and spending patterns</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Documents you upload to our platform</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Technical Information</h3>
                    <ul className="text-gray-300 space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>IP address and device information</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Browser type and version</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Usage patterns and app interactions</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Cookies and similar tracking technologies</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <UserCheck className="h-6 w-6 mr-3 text-indigo-400" />
                  How We Use Your Information
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <ul className="text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Financial Management:</strong> Analyze your spending patterns and provide insights</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>AI Analysis:</strong> Process documents and transactions for personalized recommendations</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Account Management:</strong> Maintain your account and provide customer support</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Security:</strong> Protect against fraud and unauthorized access</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Communication:</strong> Send important updates and notifications</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Improvement:</strong> Enhance our services and user experience</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Lock className="h-6 w-6 mr-3 text-indigo-400" />
                  Data Security
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <p className="text-gray-300 mb-4">
                    We implement industry-standard security measures to protect your personal information:
                  </p>
                  <ul className="text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>End-to-end encryption for all data transmission</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Secure data storage with regular backups</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Multi-factor authentication options</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Regular security audits and penetration testing</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Staff training on data protection best practices</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Globe className="h-6 w-6 mr-3 text-indigo-400" />
                  Information Sharing
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <p className="text-gray-300 mb-4">
                    We do not sell, trade, or rent your personal information to third parties. We may share 
                    information only in the following circumstances:
                  </p>
                  <ul className="text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>With your explicit consent</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>To comply with legal obligations</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>To protect our rights and prevent fraud</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>With trusted service providers who assist in our operations</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>In case of business merger or acquisition</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <UserCheck className="h-6 w-6 mr-3 text-indigo-400" />
                  Your Rights
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <p className="text-gray-300 mb-4">You have the following rights regarding your personal data:</p>
                  <ul className="text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Access and review your personal information</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Request correction of inaccurate data</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Request deletion of your account and data</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Export your data in a portable format</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Opt-out of marketing communications</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Withdraw consent for data processing</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Mail className="h-6 w-6 mr-3 text-indigo-400" />
                  Contact Us
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <p className="text-gray-300 mb-4">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="text-gray-300 space-y-2">
                    <p>📧 Email: hello@finarro.com</p>
                    <p>📱 Phone: +1 (408) 329-7788</p>
                    <p>📍 Address: 21135 Hazelbrook Drive, Cupertino, CA</p>
                  </div>
                </div>
              </section>

              {/* Updates */}
              <section>
                <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Policy Updates</h3>
                  <p className="text-gray-300">
                    We may update this Privacy Policy from time to time. We will notify you of any changes 
                    by posting the new Privacy Policy on this page and updating the "Last updated" date. 
                    We encourage you to review this Privacy Policy periodically.
                  </p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 