import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  TrendingUp, 
  Shield, 
  BarChart3,
  Check,
  ArrowRight,
  PieChart,
  Target,
  Smartphone,
  Zap,
  Globe,
  Bell,
  Menu,
  X
} from 'lucide-react';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: CreditCard,
      title: 'Smart Expense Tracking',
      description: 'Track your expenses with intelligent categorization and real-time insights in Indian Rupees.',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      icon: TrendingUp,
      title: 'Financial Analytics',
      description: 'Visualize your spending patterns with beautiful charts and detailed reports.',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and stored securely with top-tier protection.',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      icon: BarChart3,
      title: 'Budget Management',
      description: 'Set budgets, track goals, and get alerts to stay on top of your finances.',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    }
  ];

  const benefits = [
    'Track unlimited expenses and income',
    'Set up recurring transactions',
    'Export data to CSV and PDF',
    'Beautiful visual reports and charts',
    'Multi-device synchronization',
    'Advanced filtering and search'
  ];

  const testimonials = [
    {
      name: 'Rohit Sharma',
      role: 'Software Engineer',
      feedback: 'This app helped me save 30% of my income every month! The insights are amazing.',
      avatar: 'RS'
    },
    {
      name: 'Priya Patel',
      role: 'Business Owner',
      feedback: 'Beautiful UI and accurate reports. The recurring expense feature is a game-changer!',
      avatar: 'PP'
    },
    {
      name: 'Amit Verma',
      role: 'Freelancer',
      feedback: 'Makes tracking expenses simple and smart. I love the mobile-friendly interface.',
      avatar: 'AV'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 scroll-smooth">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            {/* Logo - Centered on mobile */}
            <div className="flex items-center flex-1 justify-center sm:justify-start">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ExpenseTracker
                </span>
              </Link>
            </div>
            
            {/* Desktop buttons - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile hamburger menu */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg text-center transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden transition-colors">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-screen-lg mx-auto px-4 sm:px-6 md:px-12 lg:px-24 text-center">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-fade-in">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="whitespace-nowrap">Trusted by thousands of users across India</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight animate-slide-up px-2">
            Take Control of Your <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Finances
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in px-2">
            Track expenses, analyze spending patterns, and achieve your financial goals with 
            our comprehensive expense management platform designed for India.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-12 animate-slide-up px-4">
            <Link
              to="/signup"
              className="group w-full sm:w-auto max-w-xs sm:max-w-none inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-sm sm:text-base"
            >
              Start Free Today
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto max-w-xs sm:max-w-none inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold rounded-xl transition-all text-sm sm:text-base"
            >
              Sign In
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
            <div className="flex items-center">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">No credit card required</span>
            </div>
            <div className="flex items-center">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">Free forever</span>
            </div>
            <div className="flex items-center">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1.5 sm:mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">Secure & encrypted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-2">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2">
              Powerful features designed to make expense tracking effortless and insightful.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group text-center p-8 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-750 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-2">
                Why Choose ExpenseTracker?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 md:mb-10 leading-relaxed px-2">
                Join thousands of users who have transformed their financial habits 
                with our intuitive expense tracking platform.
              </p>
              
              <div className="space-y-5">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                
                <div className="relative">
                  <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                    <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="whitespace-nowrap">Start Your Journey</span>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-5">Ready to Get Started?</h3>
                  <p className="text-blue-100 dark:text-blue-50 mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg">
                    Create your free account today and start taking control of your 
                    finances with our powerful expense tracking tools.
                  </p>
                  
                  <Link
                    to="/signup"
                    className="group inline-flex items-center justify-center w-full sm:w-auto max-w-xs sm:max-w-none px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <div className="mt-4 sm:mt-6 text-blue-100 dark:text-blue-50 text-xs sm:text-sm">
                    <span className="whitespace-nowrap">No credit card required</span> <span className="hidden sm:inline">•</span> <span className="whitespace-nowrap">Free forever</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-2">
              What Our Users Say
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
              Thousands of users trust ExpenseTracker to manage their finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="group p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{testimonial.feedback}"
                </p>
                <div className="flex mt-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 text-center text-white">
            <div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">10K+</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm sm:text-base md:text-lg">Active Users</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">₹50Cr+</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm sm:text-base md:text-lg">Expenses Tracked</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100 dark:text-blue-200 text-sm sm:text-base md:text-lg">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 text-white transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            Ready to Transform Your Financial Life?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 dark:text-blue-200 mb-6 sm:mb-8 md:mb-10 leading-relaxed px-2">
            Join thousands of users who are already saving more and stressing less.
          </p>
          
          <Link
            to="/signup"
            className="inline-flex items-center justify-center w-full sm:w-auto max-w-xs sm:max-w-none px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-white text-blue-700 font-bold text-base sm:text-lg rounded-xl hover:bg-gray-100 transition-all shadow-2xl transform hover:scale-105"
          >
            Create Free Account
            <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          
          <p className="mt-4 sm:mt-6 text-blue-200 dark:text-blue-300 text-xs sm:text-sm px-2">
            <span className="whitespace-nowrap">No credit card required</span> <span className="hidden sm:inline">•</span> <span className="whitespace-nowrap">Set up in under 2 minutes</span>
          </p>
        </div>
      </section>

      {/* Demo Account Info */}
      <section className="py-12 sm:py-16 bg-blue-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border border-gray-200 dark:border-gray-700 text-center">
            <Target className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Try Demo Account
            </h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6">
              Experience all features without creating an account
            </p>
            <div className="inline-block bg-gray-50 dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-gray-200 dark:border-gray-700 max-w-full overflow-x-auto">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                <strong className="text-blue-600 dark:text-blue-400">Email:</strong> demo@example.com 
                <span className="mx-2 sm:mx-3 text-gray-400">|</span>
                <strong className="text-blue-600 dark:text-blue-400">Password:</strong> demo123
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 sm:py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">ExpenseTracker</span>
              </div>
              <p className="text-gray-400 dark:text-gray-500 leading-relaxed">
                Your trusted partner for smart financial management and expense tracking.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400 dark:text-gray-500">
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-blue-400 transition-colors">Sign Up</Link></li>
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-4">Get in Touch</h4>
              <p className="text-gray-400 dark:text-gray-500 mb-3">
                Have questions? We're here to help!
              </p>
              <a href="mailto:support@expensetracker.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@expensetracker.com
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © 2025 ExpenseTracker. All rights reserved. Made with ❤️ in India.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400 dark:text-gray-500">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default Landing;