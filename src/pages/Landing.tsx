import React from 'react';
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
  Smartphone
} from 'lucide-react';
import { useEffect } from 'react';

const Landing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: TrendingUp,
      title: 'Financial Analytics',
      description: 'Visualize your spending patterns with beautiful charts and detailed reports.',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and stored securely with top-tier protection.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: BarChart3,
      title: 'Budget Management',
      description: 'Set budgets, track goals, and get alerts to stay on top of your finances.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ExpenseTracker</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Take Control of Your <span className="text-blue-600">Finances</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Track expenses, analyze spending patterns, and achieve your financial goals with 
            our comprehensive expense management platform designed for India.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make expense tracking effortless and insightful.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose ExpenseTracker?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Join thousands of users who have transformed their financial habits 
                with our intuitive expense tracking platform.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Create your free account today and start taking control of your 
                finances with our powerful expense tracking tools.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Account Section */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Try Demo Account</h3>
            <p className="text-gray-600 mb-4">
              Experience all features without creating an account
            </p>
            <div className="text-sm text-gray-500">
              <p><strong>Email:</strong> demo@example.com | <strong>Password:</strong> demo123</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ExpenseTracker</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400 leading-relaxed">
                © 2025 ExpenseTracker. All rights reserved. Built with modern web technologies for India.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;