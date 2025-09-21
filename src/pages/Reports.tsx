import React, { useState, useEffect } from 'react';
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
  Filter
} from 'lucide-react';

const Reports: React.FC = () => {
  const [reportsData, setReportsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const handleFilter = () => {
    // Implement filter functionality
    toast.success('Filter functionality coming soon!');
  };

  const handleExport = async () => {
    try {
      await expenseApi.exportCSV();
      toast.success('Reports exported successfully!');
    } catch (error) {
      toast.error('Failed to export reports');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await reportsApi.getReports();
      setReportsData(data);
    } catch (err) {
      setError('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!reportsData) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">No data available</h2>
            <p className="text-gray-600">Add some expenses to see reports.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Prepare chart data
  const pieChartData = Object.entries(reportsData.category_breakdown || {}).map(([name, data]: [string, any]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: data.amount,
    color: '#3B82F6'
  }));

  // Category breakdown with percentages
  const categoryBreakdown = Object.entries(reportsData.category_breakdown || {}).map(([category, data]: [string, any]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount: data.amount,
    percentage: data.percentage
  })).sort((a, b) => b.amount - a.amount);
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Analyze your spending patterns and financial trends
            </h1>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => toast.success('Filter functionality coming soon!')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button 
              onClick={() => {
                const csvContent = [
                  ['Category', 'Amount', 'Percentage'],
                  ...Object.entries(reportsData?.category_breakdown || {}).map(([category, data]: [string, any]) => [
                    category,
                    data.amount.toString(),
                    data.percentage.toFixed(1) + '%'
                  ])
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast.success('Reports exported successfully!');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Spent"
            value={`₹${reportsData.total_expenses.toFixed(2)}`}
            icon={DollarSign}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="Daily Average"
            value={`₹${reportsData.daily_average.toFixed(2)}`}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="Top Category"
            value={reportsData.top_category ? reportsData.top_category.name.charAt(0).toUpperCase() + reportsData.top_category.name.slice(1) : 'N/A'}
            subtitle={reportsData.top_category ? `₹${reportsData.top_category.amount.toFixed(2)}` : ''}
            icon={Target}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="Transactions"
            value={reportsData.total_count.toString()}
            icon={Calendar}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Category */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
            </div>
            {pieChartData.length > 0 ? (
              <CustomPieChart data={pieChartData} />
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Spending Trend */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Spending Trend</h3>
            </div>
            <CustomBarChart data={reportsData.monthly_trend || []} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h3>
          <div className="space-y-4">
            {categoryBreakdown.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 
                    index === 2 ? 'bg-orange-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium text-gray-900">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">₹{item.amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">({item.percentage.toFixed(1)}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;