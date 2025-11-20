import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { reportsApi } from '../services/api';
import Layout from '../components/Layout/Layout';
import StatCard from '../components/Cards/StatCard';
import CustomPieChart from '../components/Charts/PieChart';
import CustomBarChart from '../components/Charts/BarChart';
import { 
  DollarSign, 
  TrendingUp, 
  Target,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatIndianCurrency } from '../utils/currency';

const Reports: React.FC = () => {
  const location = useLocation();
  const [reportsData, setReportsData] = useState<any>(null);
  const [spendingTrendData, setSpendingTrendData] = useState<any>(null);
  const [categorySummaryData, setCategorySummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewType, setViewType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState(12);

  useEffect(() => {
    fetchAllReportsData();
  }, [viewType, selectedPeriod]);

  // Refresh reports when user navigates to this page
  useEffect(() => {
    if (location.pathname === '/reports') {
      fetchAllReportsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const fetchAllReportsData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch all reports data in parallel
      const [reports, spendingTrend, categorySummary] = await Promise.all([
        reportsApi.getReports(),
        reportsApi.getSpendingTrend(viewType, selectedPeriod),
        reportsApi.getCategorySummary()
      ]);
      
      setReportsData(reports);
      setSpendingTrendData(spendingTrend);
      setCategorySummaryData(categorySummary);
    } catch (err) {
      setError('Failed to fetch reports data');
      toast.error('Failed to fetch reports data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAllReportsData();
    toast.success('Reports refreshed!');
  };

  const handleExport = async () => {
    try {
      // Create CSV content with all data
      const csvContent = [
        ['Report Type', 'Period', 'Amount', 'Details'],
        ['Total Expenses', 'All Time', reportsData?.total_expenses || 0, ''],
        ['Daily Average', 'All Time', reportsData?.daily_average || 0, ''],
        ...(spendingTrendData?.trend_data || []).map((item: any) => [
          'Spending Trend',
          item.period,
          item.amount,
          viewType === 'monthly' ? 'Monthly' : 'Yearly'
        ]),
        ...(categorySummaryData?.category_data || []).map((item: any) => [
          'Category Summary',
          item.category,
          item.amount,
          `${item.percentage.toFixed(1)}% (${item.count} expenses)`
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense_reports_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Reports exported successfully!');
    } catch (error) {
      toast.error('Failed to export reports');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  if (!reportsData) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">No data available</h2>
            <p className="text-gray-600">Add some expenses to see reports.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Prepare chart data
  const pieChartData = (categorySummaryData?.category_data || []).map((item: any) => ({
    name: item.category,
    value: item.amount,
    color: '#3B82F6'
  }));

  const barChartData = (spendingTrendData?.trend_data || []).map((item: any) => ({
    name: item.period,
    amount: item.amount
  }));

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Expense Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analyze your spending patterns and financial trends
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Refresh</span>
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Export CSV</span>
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chart View Options</h3>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Period:</span>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  title="Select number of periods to display"
                >
                  <option value={6}>Last 6 {viewType === 'monthly' ? 'Months' : 'Years'}</option>
                  <option value={12}>Last 12 {viewType === 'monthly' ? 'Months' : 'Years'}</option>
                  <option value={24}>Last 24 {viewType === 'monthly' ? 'Months' : 'Years'}</option>
                </select>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewType('monthly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'monthly'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setViewType('yearly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewType === 'yearly'
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="Total Expenses"
            value={formatIndianCurrency(reportsData.total_expenses)}
            icon={DollarSign}
            color="blue"
            subtitle={`${reportsData.total_count} transactions`}
          />
          <StatCard
            title="Daily Average"
            value={formatIndianCurrency(reportsData.daily_average)}
            icon={TrendingUp}
            color="green"
            subtitle="Per day spending"
          />
          <StatCard
            title="Top Category"
            value={reportsData.top_category?.name || 'N/A'}
            icon={Target}
            color="purple"
            subtitle={reportsData.top_category ? formatIndianCurrency(reportsData.top_category.amount) : 'No data'}
          />
          <StatCard
            title="Periods Analyzed"
            value={spendingTrendData?.total_periods || 0}
            icon={Calendar}
            color="orange"
            subtitle={`${viewType === 'monthly' ? 'Months' : 'Years'} tracked`}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Spending Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 flex-shrink-0" />
                <span className="whitespace-nowrap">Spending Trend ({viewType === 'monthly' ? 'Monthly' : 'Yearly'})</span>
              </h3>
            </div>
            {barChartData.length > 0 ? (
              <CustomBarChart 
                data={barChartData} 
                title=""
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No spending data available for the selected period
              </div>
            )}
          </div>

          {/* Category Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 flex-shrink-0" />
                Category Distribution
              </h3>
            </div>
            {pieChartData.length > 0 ? (
              <CustomPieChart 
                data={pieChartData} 
                title=""
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Table */}
        {categorySummaryData?.category_data && categorySummaryData.category_data.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Transactions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {categorySummaryData.category_data.map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.category}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-semibold">
                          {formatIndianCurrency(item.amount)}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(item.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {item.count}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Total Amount Analyzed:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {formatIndianCurrency(categorySummaryData?.total_amount || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Categories Tracked:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {categorySummaryData?.total_categories || 0}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">View Type:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white capitalize">
                {viewType} ({selectedPeriod} periods)
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;