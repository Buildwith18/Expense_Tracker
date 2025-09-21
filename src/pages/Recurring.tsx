import React, { useState } from 'react';
import { useEffect } from 'react';
import { recurringApi } from '../services/api';
import Layout from '../components/Layout/Layout';
import { Plus, RefreshCw, Edit, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatIndianCurrency } from '../utils/currency';

interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextDate: string;
  isActive: boolean;
}

const Recurring: React.FC = () => {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringExpense | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    frequency: 'monthly' as const,
    startDate: new Date().toISOString().split('T')[0]
  });

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Healthcare', 'Shopping', 'Other'];
  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  useEffect(() => {
    fetchRecurringExpenses();
  }, []);

  const fetchRecurringExpenses = async () => {
    try {
      setIsLoading(true);
      const data = await recurringApi.getRecurringExpenses();
      setRecurringExpenses(data);
    } catch (err) {
      setError('Failed to fetch recurring expenses');
      toast.error('Failed to fetch recurring expenses');
    } finally {
      setIsLoading(false);
    }
  };
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: 'bg-orange-100 text-orange-800',
      transport: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      utilities: 'bg-green-100 text-green-800',
      healthcare: 'bg-red-100 text-red-800',
      shopping: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-red-100 text-red-800',
      weekly: 'bg-yellow-100 text-yellow-800',
      monthly: 'bg-green-100 text-green-800'
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recurringData = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category.toLowerCase(),
      frequency: formData.frequency,
      start_date: formData.startDate,
      next_date: formData.startDate,
      is_active: true,
      description: ''
    };

    if (editingRecurring) {
      handleUpdate(recurringData);
    } else {
      handleCreate(recurringData);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const newRecurring = await recurringApi.createRecurringExpense(data);
      setRecurringExpenses([...recurringExpenses, newRecurring]);
      resetForm();
      toast.success('Recurring expense created successfully!');
    } catch (err) {
      setError('Failed to create recurring expense');
      toast.error('Failed to create recurring expense');
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingRecurring) return;
    
    try {
      const updated = await recurringApi.updateRecurringExpense(editingRecurring.id, data);
      setRecurringExpenses(recurringExpenses.map(r => 
        r.id === editingRecurring.id ? updated : r
      ));
      resetForm();
      toast.success('Recurring expense updated successfully!');
    } catch (err) {
      setError('Failed to update recurring expense');
      toast.error('Failed to update recurring expense');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
    setEditingRecurring(null);
  };

  const handleEdit = (recurring: RecurringExpense) => {
    setEditingRecurring(recurring);
    setFormData({
      title: recurring.title,
      amount: recurring.amount.toString(),
      category: recurring.category,
      frequency: recurring.frequency,
      startDate: recurring.start_date
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      deleteRecurring(id);
    }
  };

  const deleteRecurring = async (id: string) => {
    try {
      await recurringApi.deleteRecurringExpense(id);
      setRecurringExpenses(recurringExpenses.filter(expense => expense.id !== id));
      toast.success('Recurring expense deleted successfully!');
    } catch (err) {
      setError('Failed to delete recurring expense');
      toast.error('Failed to delete recurring expense');
    }
  };

  const toggleActive = (id: string) => {
    toggleRecurringActive(id);
  };

  const toggleRecurringActive = async (id: string) => {
    try {
      const updated = await recurringApi.toggleActive(id);
      setRecurringExpenses(recurringExpenses.map(expense =>
        expense.id === id ? updated : expense
      ));
      toast.success(`Recurring expense ${updated.is_active ? 'activated' : 'paused'}!`);
    } catch (err) {
      setError('Failed to toggle recurring expense');
      toast.error('Failed to toggle recurring expense');
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

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recurring Expenses</h1>
            <p className="text-gray-600 mt-1">Manage your recurring transactions and subscriptions</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recurring</span>
          </button>
        </div>

        {/* Add Form Modal */}
        {(showAddForm || editingRecurring) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingRecurring ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Netflix Subscription"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Select category"
                    >
                      <option value="">Select</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Select frequency"
                    >
                      {frequencies.map(freq => (
                        <option key={freq.value} value={freq.value}>{freq.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingRecurring ? 'Update Recurring' : 'Add Recurring'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recurring Expenses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {recurringExpenses.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring expenses</h3>
              <p className="text-gray-500 mb-4">Set up recurring transactions to automate your expense tracking.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Recurring Expense
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recurringExpenses.map((expense) => (
                <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{expense.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                          {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFrequencyColor(expense.frequency)}`}>
                          {expense.frequency.charAt(0).toUpperCase() + expense.frequency.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{formatIndianCurrency(expense.amount)}</span>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Next: {new Date(expense.next_date).toLocaleDateString()}</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          expense.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {expense.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleActive(expense.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          expense.is_active 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {expense.is_active ? 'Pause' : 'Resume'}
                      </button>
                      <button 
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit recurring expense"
                        aria-label="Edit recurring expense"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete recurring expense"
                        aria-label="Delete recurring expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Recurring;