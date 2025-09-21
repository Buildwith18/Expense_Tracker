import React, { useState, useEffect } from 'react';
import { userApi } from '../../services/api';
import { DollarSign, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const BudgetTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [budgetData, setBudgetData] = useState({
    monthlyBudget: 15000,
    alertThreshold: 80,
    enableAlerts: true,
    currentMonthExpenses: 0,
    budgetRemaining: 0,
  });

  useEffect(() => {
    fetchBudgetSettings();
  }, []);

  const fetchBudgetSettings = async () => {
    try {
      setIsInitialLoading(true);
      const data = await userApi.getSettings();
      
      // Use the fresh calculated values from the API
      setBudgetData({
        monthlyBudget: data.monthly_budget || 15000,
        alertThreshold: data.alert_threshold || 80,
        enableAlerts: data.enable_alerts !== false,
        // These are now always fresh from actual expense calculations
        currentMonthExpenses: data.current_month_expenses || 0,
        budgetRemaining: data.budget_remaining || 0,
      });
    } catch (error) {
      console.error('Failed to fetch budget settings:', error);
      toast.error('Failed to load budget settings');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setBudgetData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await userApi.updateSettings({
        monthly_budget: budgetData.monthlyBudget,
        alert_threshold: budgetData.alertThreshold,
        enable_alerts: budgetData.enableAlerts,
      });
      
      // Always refresh data from backend to get fresh calculations
      await fetchBudgetSettings();
      
      toast.success('Budget settings saved successfully!');
    } catch (error) {
      console.error('Failed to update budget settings:', error);
      toast.error('Failed to save budget settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const budgetPercentage = (budgetData.currentMonthExpenses / budgetData.monthlyBudget) * 100;
  const isOverBudget = budgetPercentage > 100;
  const isNearThreshold = budgetPercentage >= budgetData.alertThreshold;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Budget Settings</h3>
        <p className="text-sm text-gray-600">Set your monthly budget goals and spending limits.</p>
      </div>

      {/* Current Budget Status */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Current Month Overview</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Spent</p>
            <p className="text-2xl font-bold text-gray-900">₹{budgetData.currentMonthExpenses.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Budget</p>
            <p className="text-2xl font-bold text-gray-900">₹{budgetData.monthlyBudget.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ₹{budgetData.budgetRemaining.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-red-500' : isNearThreshold ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>0%</span>
          <span>{budgetPercentage.toFixed(1)}% used</span>
          <span>100%</span>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <div className="font-medium mb-1">Budget Calculation Details:</div>
          <div>• Monthly Budget: ₹{budgetData.monthlyBudget.toFixed(2)}</div>
          <div>• Current Month Expenses: ₹{budgetData.currentMonthExpenses.toFixed(2)}</div>
          <div>• Budget Remaining: ₹{budgetData.budgetRemaining.toFixed(2)}</div>
          <div>• Percentage Used: {budgetPercentage.toFixed(2)}%</div>
        </div>

        {/* Alert Messages */}
        {isOverBudget && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 text-sm">You have exceeded your monthly budget!</span>
          </div>
        )}
        
        {isNearThreshold && !isOverBudget && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700 text-sm">You're approaching your budget limit!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Monthly Budget */}
        <div>
          <label htmlFor="monthlyBudget" className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Budget (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">₹</span>
            <input
              type="number"
              id="monthlyBudget"
              name="monthlyBudget"
              value={budgetData.monthlyBudget}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="15000"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Set your monthly spending limit to track budget progress.
          </p>
        </div>

        {/* Alert Threshold */}
        <div>
          <label htmlFor="alertThreshold" className="block text-sm font-medium text-gray-700 mb-1">
            Alert Threshold (%)
          </label>
          <input
            type="number"
            id="alertThreshold"
            name="alertThreshold"
            value={budgetData.alertThreshold}
            onChange={handleChange}
            min="1"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Get notified when you reach this percentage of your budget.
          </p>
        </div>

        {/* Enable Alerts Checkbox */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="enableAlerts"
            name="enableAlerts"
            checked={budgetData.enableAlerts}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="enableAlerts" className="text-sm font-medium text-gray-700">
            Enable budget alerts and notifications
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Budget Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetTab;