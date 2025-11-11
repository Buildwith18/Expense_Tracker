import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { expenseApi, userApi } from '../services/api';
import { Expense } from '../types';
import Layout from '../components/Layout/Layout';
import StatCard from '../components/Cards/StatCard';
import ProgressBar from '../components/ProgressBar';
import CustomPieChart from '../components/Charts/PieChart';
import CustomBarChart from '../components/Charts/BarChart';
import { formatIndianCurrency } from '../utils/currency';
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { expenses: contextExpenses, refreshExpenses } = useExpenses();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [budgetData, setBudgetData] = useState({
    monthlyBudget: 15000,
    currentMonthExpenses: 0,
    budgetRemaining: 0,
    budgetPercentage: 0
  });

  // Fetch budget settings on mount and when user changes
  useEffect(() => {
    fetchBudgetSettings();
  }, [user]);

  // Refresh expenses when user navigates to dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      refreshDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Update dashboard when context expenses change (after add/edit/delete)
  useEffect(() => {
    updateBudgetFromExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextExpenses]);

  const fetchBudgetSettings = async () => {
    try {
      const settings = await userApi.getSettings();
      // Backend returns budget_stats, user, and alerts
      const monthlyBudget = settings.user?.monthly_budget || settings.monthly_budget || 15000;
      setBudgetData(prev => ({
        ...prev,
        monthlyBudget: monthlyBudget
      }));
      updateBudgetFromExpenses(monthlyBudget);
    } catch (settingsError) {
      console.warn('Failed to fetch settings, using defaults:', settingsError);
      // Use default budget if API fails
      updateBudgetFromExpenses(15000);
    }
  };

  const refreshDashboardData = async () => {
    try {
      setIsLoading(true);
      // Refresh expenses from context
      await refreshExpenses();
      // Also refresh budget settings
      await fetchBudgetSettings();
    } catch (err) {
      console.error('Failed to refresh dashboard data:', err);
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBudgetFromExpenses = (budget?: number) => {
    const currentMonthExpenses = getCurrentMonthExpenses(contextExpenses);
    const actualCurrentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyBudget = budget || budgetData.monthlyBudget;
    
    setBudgetData(prev => ({
      monthlyBudget: budget || prev.monthlyBudget,
      currentMonthExpenses: actualCurrentMonthTotal,
      budgetRemaining: monthlyBudget - actualCurrentMonthTotal,
      budgetPercentage: (actualCurrentMonthTotal / monthlyBudget) * 100
    }));
  };

  const getCurrentMonthExpenses = (expensesList: Expense[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return expensesList.filter(expense => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });
  };

  // Memoized calculations for current month expenses
  const currentMonthExpenses = useMemo(() => {
    return getCurrentMonthExpenses(contextExpenses);
  }, [contextExpenses]);

  // Current date setup
  const currentDate = useMemo(() => new Date(), []);
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();

  // Use ONLY the calculated current month total
  const totalExpenses = useMemo(() => {
    return currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [currentMonthExpenses]);

  const budgetRemaining = useMemo(() => {
    const budget = Number(budgetData.monthlyBudget) || 0;
    const spent = Number(totalExpenses) || 0;
    return budget - spent;
  }, [budgetData.monthlyBudget, totalExpenses]);

  const budgetPercentage = useMemo(() => {
    const budget = Number(budgetData.monthlyBudget) || 0;
    const spent = Number(totalExpenses) || 0;
    return budget > 0 ? (spent / budget) * 100 : 0;
  }, [totalExpenses, budgetData.monthlyBudget]);

  // Daily average calculations
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const dailyAverage = useMemo(() => {
    const spent = Number(totalExpenses) || 0;
    const days = Number(currentDay) || 1;
    return days > 0 ? spent / days : 0;
  }, [totalExpenses, currentDay]);

  // Pie chart data by category (current month only)
  const pieChartData = useMemo(() => {
    const categoryData = currentMonthExpenses.reduce((acc, expense) => {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: '#3B82F6'
    }));
  }, [currentMonthExpenses]);

  // Monthly trend mock data (replace with real API if needed)
  const monthlyTrendData = useMemo(() => [
    { name: 'Jan', amount: 12000 },
    { name: 'Feb', amount: 15000 },
    { name: 'Mar', amount: 18000 },
    { name: 'Apr', amount: 14000 },
    { name: 'May', amount: 16000 },
    { name: 'Jun', amount: 19000 },
    { name: format(currentDate, 'MMM'), amount: totalExpenses },
  ], [totalExpenses, currentDate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Here's your financial overview for {format(new Date(), 'MMMM yyyy')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current month expenses: {currentMonthExpenses.length} transactions totaling {formatIndianCurrency(totalExpenses)}
            </p>
          </div>
          <button
            onClick={refreshDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Spent (This Month)"
            value={formatIndianCurrency(Number(totalExpenses) || 0)}
            subtitle={`${Number(budgetPercentage || 0).toFixed(1)}% of budget`}
            icon={TrendingDown}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <StatCard
            title="Budget Remaining"
            value={formatIndianCurrency(Number(budgetRemaining) || 0)}
            subtitle={`${Number(100 - (budgetPercentage || 0)).toFixed(1)}% remaining`}
            icon={Target}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Daily Average"
            value={formatIndianCurrency(Number(dailyAverage) || 0)}
            subtitle={`Projected: ${formatIndianCurrency(Number(dailyAverage || 0) * Number(daysInMonth || 30))}`}
            icon={DollarSign}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Transactions (This Month)"
            value={currentMonthExpenses.length.toString()}
            subtitle={`${Math.ceil(currentMonthExpenses.length / (currentDay || 1))} per day avg`}
            icon={Calendar}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Budget Progress */}
        <ProgressBar
          title="Monthly Budget Progress"
          percentage={Number(budgetPercentage) || 0}
          spent={Number(totalExpenses) || 0}
          budget={Number(budgetData.monthlyBudget) || 0}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Spending by Category (This Month)
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            {pieChartData.length > 0 ? (
              <CustomPieChart data={pieChartData} />
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
                No expenses recorded for this month
              </div>
            )}
          </div>

          {/* Budget Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Overview</h3>
              <button 
                onClick={() => navigate('/settings?tab=budget')}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Manage Budget
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Month Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{Number(budgetPercentage || 0).toFixed(1)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (budgetPercentage || 0) > 100 ? 'bg-red-500' : 
                    (budgetPercentage || 0) > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(Number(budgetPercentage) || 0, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{formatIndianCurrency(Number(totalExpenses) || 0)} spent</span>
                <span>{formatIndianCurrency(Number(budgetData.monthlyBudget) || 0)} budget</span>
              </div>
              
              {(budgetPercentage || 0) > 100 && (
                <div className="text-sm text-red-600 font-medium">
                  ⚠️ Over budget by {formatIndianCurrency(Number(totalExpenses || 0) - Number(budgetData.monthlyBudget || 0))}
                </div>
              )}
              
              {(budgetPercentage || 0) > 80 && (budgetPercentage || 0) <= 100 && (
                <div className="text-sm text-yellow-600 font-medium">
                  ⚠️ Approaching budget limit
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;