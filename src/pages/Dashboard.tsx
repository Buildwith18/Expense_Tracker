import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [budgetData, setBudgetData] = useState({
    monthlyBudget: 15000,
    currentMonthExpenses: 0,
    budgetRemaining: 0,
    budgetPercentage: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Calculate current month date range
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      // Fetch only current month's expenses (up to 100)
      const paged = await expenseApi.getExpensesPaginated({ page: 1, pageSize: 100, startDate, endDate });
      const expensesData = paged.results || [];
      setExpenses(expensesData);
      // Calculate current month expenses from fetched data
      const actualCurrentMonthTotal = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
      // Fetch user settings for budget
      try {
        const settings = await userApi.getSettings();
        const monthlyBudget = settings.monthly_budget || 15000;
        setBudgetData({
          monthlyBudget: monthlyBudget,
          currentMonthExpenses: actualCurrentMonthTotal,
          budgetRemaining: monthlyBudget - actualCurrentMonthTotal,
          budgetPercentage: (actualCurrentMonthTotal / monthlyBudget) * 100
        });
      } catch (settingsError) {
        console.warn('Failed to fetch settings, using defaults:', settingsError);
        setBudgetData({
          monthlyBudget: 15000,
          currentMonthExpenses: actualCurrentMonthTotal,
          budgetRemaining: 15000 - actualCurrentMonthTotal,
          budgetPercentage: (actualCurrentMonthTotal / 15000) * 100
        });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  };

  // Current date setup
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();

  // Filter current month expenses (recalculate to ensure accuracy)
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  // Use ONLY the calculated current month total
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetRemaining = budgetData.monthlyBudget - totalExpenses;
  const budgetPercentage = (totalExpenses / budgetData.monthlyBudget) * 100;

  // Daily average calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailyAverage = totalExpenses / currentDay;

  // Pie chart data by category (current month only)
  const categoryData = currentMonthExpenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: '#3B82F6'
  }));

  // Monthly trend mock data (replace with real API if needed)
  const monthlyTrendData = [
    { name: 'Jan', amount: 12000 },
    { name: 'Feb', amount: 15000 },
    { name: 'Mar', amount: 18000 },
    { name: 'Apr', amount: 14000 },
    { name: 'May', amount: 16000 },
    { name: 'Jun', amount: 19000 },
    { name: format(currentDate, 'MMM'), amount: totalExpenses },
  ];

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Here's your financial overview for {format(new Date(), 'MMMM yyyy')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current month expenses: {currentMonthExpenses.length} transactions totaling {formatIndianCurrency(totalExpenses)}
          </p>
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
            value={formatIndianCurrency(totalExpenses)}
            subtitle={`${budgetPercentage.toFixed(1)}% of budget`}
            icon={TrendingDown}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <StatCard
            title="Budget Remaining"
            value={formatIndianCurrency(budgetRemaining)}
            subtitle={`${(100 - budgetPercentage).toFixed(1)}% remaining`}
            icon={Target}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Daily Average"
            value={formatIndianCurrency(dailyAverage)}
            subtitle={`Projected: ${formatIndianCurrency(dailyAverage * daysInMonth)}`}
            icon={DollarSign}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Transactions (This Month)"
            value={currentMonthExpenses.length.toString()}
            subtitle={`${Math.ceil(currentMonthExpenses.length / currentDay)} per day avg`}
            icon={Calendar}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Budget Progress */}
        <ProgressBar
          title="Monthly Budget Progress"
          percentage={budgetPercentage}
          spent={totalExpenses}
          budget={budgetData.monthlyBudget}
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
                <span className="text-sm font-medium text-gray-900 dark:text-white">{budgetPercentage.toFixed(1)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    budgetPercentage > 100 ? 'bg-red-500' : 
                    budgetPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{formatIndianCurrency(totalExpenses)} spent</span>
                <span>{formatIndianCurrency(budgetData.monthlyBudget)} budget</span>
              </div>
              
              {budgetPercentage > 100 && (
                <div className="text-sm text-red-600 font-medium">
                  ⚠️ Over budget by {formatIndianCurrency(totalExpenses - budgetData.monthlyBudget)}
                </div>
              )}
              
              {budgetPercentage > 80 && budgetPercentage <= 100 && (
                <div className="text-sm text-yellow-600 font-medium">
                  ⚠️ Approaching budget limit
                </div>
              )}

              {/* Debug Info (remove in production) */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                <div>Debug Info:</div>
                <div>• Current Month Expenses: {currentMonthExpenses.length} items</div>
                <div>• Calculated Total: {formatIndianCurrency(totalExpenses)}</div>
                <div>• Monthly Budget: {formatIndianCurrency(budgetData.monthlyBudget)}</div>
                <div>• Budget Percentage: {budgetPercentage.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;