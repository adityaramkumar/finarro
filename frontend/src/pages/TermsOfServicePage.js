import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Scale,
  AlertTriangle,
  Users,
  CreditCard,
  Shield,
  Globe,
} from 'lucide-react';
import Logo from '../components/Logo';

const TermsOfServicePage = () => {
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
              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl">
                <Scale className="h-12 w-12 text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-400 text-lg">
              Last updated:{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-blue-400" />
                  Agreement to Terms
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Welcome to finarro! These Terms of Service ("Terms") govern
                  your use of our financial management platform and services. By
                  accessing or using finarro, you agree to be bound by these
                  Terms. If you disagree with any part of these terms, then you
                  may not access the Service.
                </p>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Globe className="h-6 w-6 mr-3 text-blue-400" />
                  Service Description
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <p className="text-gray-300 mb-4">
                    finarro provides a comprehensive financial management
                    platform that includes:
                  </p>
                  <ul className="text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>
                        Personal financial tracking and budgeting tools
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>AI-powered financial analysis and insights</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Document upload and processing capabilities</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>
                        Bank account integration and transaction categorization
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Financial reporting and analytics</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Personalized recommendations and guidance</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-blue-400" />
                  User Accounts
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Account Creation
                    </h3>
                    <ul className="text-gray-300 space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>
                          You must provide accurate and complete information
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>
                          You are responsible for maintaining account security
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>
                          You must be at least 18 years old to use our services
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>One account per person is allowed</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Account Security
                    </h3>
                    <ul className="text-gray-300 space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Keep your login credentials confidential</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>
                          Enable two-factor authentication when available
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>
                          Notify us immediately of any unauthorized access
                        </span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>
                          You are responsible for all activities under your
                          account
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Acceptable Use */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-blue-400" />
                  Acceptable Use
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <p className="text-gray-300 mb-4">
                    You agree NOT to use finarro for any of the following:
                  </p>
                  <ul className="text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Illegal activities or fraud</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>
                        Uploading malicious software or harmful content
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>
                        Attempting to gain unauthorized access to our systems
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>
                        Interfering with the proper functioning of the service
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Violating any applicable laws or regulations</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Sharing your account with others</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Financial Information */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <CreditCard className="h-6 w-6 mr-3 text-blue-400" />
                  Financial Information
                </h2>
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Important Notice
                      </h3>
                      <ul className="text-gray-300 space-y-3">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>
                            We provide financial information and analysis tools,
                            not financial advice
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>
                            All financial decisions are your responsibility
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>
                            We are not liable for any financial losses or
                            decisions
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>
                            Consult with qualified financial advisors for
                            important decisions
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span>
                            Our AI analysis is for informational purposes only
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-blue-400" />
                  Intellectual Property
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Our Rights
                      </h3>
                      <p className="text-gray-300">
                        All content, features, and functionality of finarro are
                        owned by us and protected by intellectual property laws.
                        This includes our software, designs, text, and
                        trademarks.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Your Rights
                      </h3>
                      <p className="text-gray-300">
                        You retain ownership of all financial data and documents
                        you upload to finarro. You grant us a license to use
                        this data solely to provide our services to you.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-3 text-blue-400" />
                  Limitation of Liability
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <p className="text-gray-300 mb-4">
                    finarro is provided "as is" without warranties of any kind.
                    We are not liable for:
                  </p>
                  <ul className="text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Any financial losses or damages</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Interruption of service or data loss</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Errors in financial calculations or analysis</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Third-party integrations or bank connections</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Unauthorized access to your account</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-blue-400" />
                  Termination
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        By You
                      </h3>
                      <p className="text-gray-300">
                        You may terminate your account at any time by contacting
                        us or using the account deletion feature in your
                        settings.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        By Us
                      </h3>
                      <p className="text-gray-300">
                        We may terminate your account if you violate these Terms
                        or engage in harmful activities. We will provide
                        reasonable notice when possible.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-blue-400" />
                  Changes to Terms
                </h2>
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6">
                  <p className="text-gray-300">
                    We reserve the right to modify these Terms at any time. We
                    will notify you of significant changes by email or through
                    the platform. Your continued use of finarro after changes
                    constitutes acceptance of the new Terms.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Contact Us
                  </h3>
                  <p className="text-gray-300 mb-4">
                    If you have any questions about these Terms of Service,
                    please contact us:
                  </p>
                  <div className="text-gray-300 space-y-2">
                    <p>📧 Email: hello@finarro.com</p>
                    <p>📱 Phone: +1 (408) 329-7788</p>
                    <p>📍 Address: 21135 Hazelbrook Drive, Cupertino, CA</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
