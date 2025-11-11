// src/services/api.ts
import axios from "axios";
import toast from "react-hot-toast";
import { Expense, User } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const getAccessToken = () => localStorage.getItem("auth_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");
const setAccessToken = (token: string) => localStorage.setItem("auth_token", token);

const clearAuth = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_data");
};

// ✅ Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Refresh expired access token
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuth();
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = axios
            .post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken })
            .then((res) => {
              const newAccess = res.data.access;
              setAccessToken(newAccess);
              api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
              return newAccess;
            })
            .finally(() => (isRefreshing = false));
        }

        const newAccessToken = await (refreshPromise as Promise<string>);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        clearAuth();
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

const sanitizeExpensePayload = (
  data: Omit<Expense, "id" | "userId" | "createdAt">
) => {
  const payload: Record<string, unknown> = {
    title: data.title.trim(),
    amount: Number(data.amount),
    category: data.category.toLowerCase(),
    date: data.date,
  };

  if (data.description && data.description.trim().length > 0) {
    payload.description = data.description.trim();
  }

  return payload;
};

type CreateExpensePayload = Omit<Expense, "id" | "userId" | "createdAt">;

interface RecurringExpensePayload {
  title: string;
  amount: number;
  category: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  start_date: string;
  end_date?: string | null;
  description?: string;
}

// ✅ Expense API
export const expenseApi = {
  async getExpenses(): Promise<Expense[]> {
    const res = await api.get("/expenses/");
    return res.data;
  },
  async createExpense(data: CreateExpensePayload): Promise<Expense> {
    const payload = sanitizeExpensePayload(data);
    const res = await api.post("/expenses/", payload);
    return res.data.expense || res.data;
  },
  async updateExpense(id: string, data: Partial<Expense>): Promise<Expense> {
    const payload: Record<string, unknown> = { ...data };

    if (typeof payload.category === "string") {
      payload.category = (payload.category as string).toLowerCase();
    }

    if (payload.amount !== undefined) {
      payload.amount = Number(payload.amount);
    }

    if (typeof payload.title === "string") {
      payload.title = payload.title.trim();
    }

    if (typeof payload.description === "string") {
      payload.description = payload.description.trim();
      if ((payload.description as string).length === 0) {
        delete payload.description;
      }
    }

    const res = await api.put(`/expenses/${id}/`, payload);
    return res.data.expense || res.data;
  },
  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}/`);
  },
};

// ✅ User API
export const userApi = {
  async getProfile(): Promise<User> {
    const res = await api.get("/profile/");
    const userData = res.data.user || res.data;
    localStorage.setItem("user_data", JSON.stringify(userData));
    return userData;
  },
  async updateProfile(userData: Partial<User> | FormData): Promise<User> {
    const config =
      userData instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
    const res = await api.put("/profile/", userData, config);
    const updated = res.data.user || res.data;
    localStorage.setItem("user_data", JSON.stringify(updated));
    toast.success("Profile updated!");
    return updated;
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post("/change-password/", {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword,
    });
    toast.success("Password changed!");
  },
};

// ✅ Reports API (this was missing)
export const reportsApi = {
  async getReports(startDate?: string, endDate?: string) {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const res = await api.get("/reports/", { params });
    return res.data;
  },
};

// ✅ Recurring Expense API
export const recurringApi = {
  async getRecurringExpenses() {
    const res = await api.get("/recurring/");
    return res.data;
  },

  async createRecurringExpense(data: RecurringExpensePayload) {
    const payload: Record<string, unknown> = {
      title: data.title.trim(),
      amount: Number(data.amount),
      category: data.category.toLowerCase(),
      frequency: data.frequency,
      start_date: data.start_date,
    };

    if (data.end_date) {
      payload.end_date = data.end_date;
    }

    if (data.description && data.description.trim().length > 0) {
      payload.description = data.description.trim();
    }

    const res = await api.post("/recurring/", payload);
    return res.data.recurring_expense || res.data;
  },

  async updateRecurringExpense(id: string, data: Partial<RecurringExpensePayload>) {
    const payload: Record<string, unknown> = { ...data };

    if (typeof payload.title === "string") {
      payload.title = payload.title.trim();
    }

    if (payload.amount !== undefined) {
      payload.amount = Number(payload.amount);
    }

    if (typeof payload.category === "string") {
      payload.category = (payload.category as string).toLowerCase();
    }

    if (typeof payload.description === "string") {
      payload.description = payload.description.trim();
      if ((payload.description as string).length === 0) {
        delete payload.description;
      }
    }

    const res = await api.put(`/recurring/${id}/`, payload);
    return res.data.recurring_expense || res.data;
  },

  async deleteRecurringExpense(id: string) {
    await api.delete(`/recurring/${id}/`);
  },

  async toggleActive(id: string) {
    const res = await api.post(`/recurring/${id}/toggle_active/`);
    return res.data.recurring_expense || res.data;
  },

  async generateRecurringExpenses() {
    const res = await api.post("/recurring/generate_all_recurring_expenses/");
    return res.data;
  },
};

// ✅ Notifications API
export const notificationApi = {
  async getNotifications() {
    const res = await api.get("/notifications/");
    return res.data;
  },
  async markAsRead(notificationId: string) {
    await api.post("/notifications/", { notification_id: notificationId });
  },
};

export default api;







// import axios from 'axios';
// import { Expense, User, ApiResponse } from '../types';
// import toast from 'react-hot-toast';

// const API_BASE_URL = 'http://localhost:8000/api'; // Django backend URL

// interface RecurringExpense {
//   id: string;
//   title: string;
//   amount: number;
//   category: string;
//   frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
//   start_date: string;
//   end_date?: string;
//   next_date: string;
//   is_active: boolean;
//   description?: string;
// }

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add auth token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('auth_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Response interceptor with JWT refresh-once logic
// let isRefreshing = false;
// let refreshPromise: Promise<string> | null = null;

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const status = error.response?.status;

//     // If unauthorized, try refresh once
//     if (status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const refreshToken = localStorage.getItem('refresh_token');

//       if (!refreshToken) {
//         localStorage.removeItem('auth_token');
//         localStorage.removeItem('user_data');
//         return Promise.reject(error);
//       }

//       try {
//         if (!isRefreshing) {
//           isRefreshing = true;
//           refreshPromise = api
//             .post('/token/refresh/', { refresh: refreshToken })
//             .then((res) => {
//               const newAccess = res.data.access as string;
//               localStorage.setItem('auth_token', newAccess);
//               return newAccess;
//             })
//             .finally(() => {
//               isRefreshing = false;
//             });
//         }

//         const newAccessToken = await (refreshPromise as Promise<string>);
//         // Retry original request with new token
//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (refreshErr) {
//         // Refresh failed → clear and reject
//         localStorage.removeItem('auth_token');
//         localStorage.removeItem('refresh_token');
//         localStorage.removeItem('user_data');
//         return Promise.reject(refreshErr);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// // Helper function to check if backend is available
// const isBackendAvailable = async (): Promise<boolean> => {
//   try {
//     await api.get('/');
//     return true;
//   } catch (error) {
//     console.warn('Backend not available, using localStorage fallback');
//     return false;
//   }
// };

// // Mock data fallback functions
// const getMockExpenses = (): Expense[] => {
//   const stored = localStorage.getItem('mock_expenses');
//   return stored ? JSON.parse(stored) : [];
// };

// const saveMockExpenses = (expenses: Expense[]) => {
//   localStorage.setItem('mock_expenses', JSON.stringify(expenses));
// };

// export const expenseApi = {
//   // Get all expenses for authenticated user
//   getExpenses: async (): Promise<Expense[]> => {
//     try {
//       const response = await api.get('/expenses/');
//       console.log('Expenses fetched from backend:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to fetch expenses from backend:', error);
//       // Only fallback to mock if backend is truly unavailable
//       const mockExpenses = getMockExpenses();
//       console.warn('Using localStorage fallback, expenses:', mockExpenses.length);
//       return mockExpenses;
//     }
//   },

//   // Search expenses
//   searchExpenses: async (query: string): Promise<Expense[]> => {
//     try {
//       const response = await api.get(`/expenses/?search=${query}`);
//       return response.data;
//     } catch (error) {
//       console.error('Failed to search expenses from backend:', error);
//       const expenses = getMockExpenses();
//       return expenses.filter(expense =>
//         expense.title.toLowerCase().includes(query.toLowerCase()) ||
//         expense.category.toLowerCase().includes(query.toLowerCase()) ||
//         expense.description?.toLowerCase().includes(query.toLowerCase()) ||
//         expense.amount.toString().includes(query)
//       );
//     }
//   },

//   // Create new expense
//   createExpense: async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt'>): Promise<Expense> => {
//     try {
//       console.log('Creating expense:', expenseData);
//       const response = await api.post('/expenses/', expenseData);
//       console.log('Expense created response:', response.data);

//       const savedExpense = response.data.expense || response.data;
//       toast.success('Expense saved successfully!');
//       return savedExpense;
//     } catch (error: any) {
//       console.error('Failed to create expense on backend:', error);
//       console.error('Error response:', error.response?.data);

//       // Fallback to localStorage only if backend is unavailable
//       if (error.response?.status === 401) {
//         toast.error('Please login to save expenses');
//         throw error;
//       }

//       const newExpense: Expense = {
//         ...expenseData,
//         id: Date.now().toString(),
//         userId: '1',
//         createdAt: new Date().toISOString(),
//       };

//       const expenses = getMockExpenses();
//       expenses.push(newExpense);
//       saveMockExpenses(expenses);
//       toast.warning('Expense saved locally (backend unavailable)');

//       return newExpense;
//     }
//   },

//   // Update expense
//   updateExpense: async (id: string, expenseData: Partial<Expense>): Promise<Expense> => {
//     try {
//       const response = await api.put(`/expenses/${id}/`, expenseData);
//       const updatedExpense = response.data.expense || response.data;
//       toast.success('Expense updated successfully!');
//       return updatedExpense;
//     } catch (error: any) {
//       console.error('Failed to update expense on backend:', error);

//       if (error.response?.status === 401) {
//         toast.error('Please login to update expenses');
//         throw error;
//       }

//       const expenses = getMockExpenses();
//       const index = expenses.findIndex(exp => exp.id === id);

//       if (index === -1) {
//         throw new Error('Expense not found');
//       }

//       const updatedExpense = { ...expenses[index], ...expenseData };
//       expenses[index] = updatedExpense;
//       saveMockExpenses(expenses);
//       toast.warning('Expense updated locally (backend unavailable)');

//       return updatedExpense;
//     }
//   },

//   // Delete expense
//   deleteExpense: async (id: string): Promise<void> => {
//     try {
//       await api.delete(`/expenses/${id}/`);
//       toast.success('Expense deleted successfully!');
//     } catch (error: any) {
//       console.error('Failed to delete expense on backend:', error);

//       if (error.response?.status === 401) {
//         toast.error('Please login to delete expenses');
//         throw error;
//       }

//       const expenses = getMockExpenses();
//       const filteredExpenses = expenses.filter(exp => exp.id !== id);
//       saveMockExpenses(filteredExpenses);
//       toast.warning('Expense deleted locally (backend unavailable)');
//     }
//   },

//   // Paginated and filterable expenses fetch
//   getExpensesPaginated: async ({ page = 1, pageSize = 20, startDate, endDate }: { page?: number, pageSize?: number, startDate?: string, endDate?: string }) => {
//     try {
//       if (await isBackendAvailable()) {
//         const params: any = { page, page_size: pageSize };
//         if (startDate) params.start_date = startDate;
//         if (endDate) params.end_date = endDate;
//         const response = await api.get('/expenses/', { params });
//         return response.data; // { results, count, next, previous }
//       } else {
//         // Fallback: filter and paginate mock data
//         let expenses = getMockExpenses();
//         if (startDate) expenses = expenses.filter(e => new Date(e.date) >= new Date(startDate));
//         if (endDate) expenses = expenses.filter(e => new Date(e.date) <= new Date(endDate));
//         const count = expenses.length;
//         const startIdx = (page - 1) * pageSize;
//         const endIdx = startIdx + pageSize;
//         const results = expenses.slice(startIdx, endIdx);
//         return { results, count, next: null, previous: null };
//       }
//     } catch (error) {
//       console.error('Failed to fetch paginated expenses:', error);
//       throw error;
//     }
//   },

//   // Get expenses grouped by month
//   getExpensesGroupedByMonth: async (year?: number, month?: number) => {
//     try {
//       if (await isBackendAvailable()) {
//         const params: any = {};
//         if (year) params.year = year;
//         if (month) params.month = month;
//         const response = await api.get('/expenses/monthly_grouped/', { params });
//         return response.data;
//       } else {
//         // Fallback: group mock data by month
//         let expenses = getMockExpenses();
        
//         // Filter by year/month if specified
//         if (year) {
//           expenses = expenses.filter(e => new Date(e.date).getFullYear() === year);
//         }
//         if (month) {
//           expenses = expenses.filter(e => new Date(e.date).getMonth() + 1 === month);
//         }
        
//         // Group by month
//         const grouped = expenses.reduce((acc, expense) => {
//           const date = new Date(expense.date);
//           const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          
//           if (!acc[yearMonth]) {
//             acc[yearMonth] = {
//               year_month: yearMonth,
//               year: date.getFullYear(),
//               month: date.getMonth() + 1,
//               month_name: date.toLocaleString('default', { month: 'long' }),
//               expenses: [],
//               total_amount: 0,
//               expense_count: 0
//             };
//           }
          
//           acc[yearMonth].expenses.push(expense);
//           acc[yearMonth].total_amount += expense.amount;
//           acc[yearMonth].expense_count += 1;
          
//           return acc;
//         }, {} as Record<string, any>);
        
//         // Convert to array and sort by date (newest first)
//         const result = Object.values(grouped).sort((a: any, b: any) => 
//           b.year_month.localeCompare(a.year_month)
//         );
        
//         return {
//           grouped_expenses: result,
//           total_months: result.length
//         };
//       }
//     } catch (error) {
//       console.error('Failed to fetch grouped expenses:', error);
//       throw error;
//     }
//   },
// };

// export const userApi = {
//   // Get user profile
//   getProfile: async (): Promise<User> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.get('/profile/');
//         const userData = response.data.user || response.data;
//         localStorage.setItem('user_data', JSON.stringify(userData));
//         return userData;
//       } else {
//         const storedUser = localStorage.getItem('user_data');
//         if (!storedUser) throw new Error('User not found');
//         return JSON.parse(storedUser);
//       }
//     } catch (error) {
//       console.error('Failed to fetch profile:', error);
//       const storedUser = localStorage.getItem('user_data');
//       if (storedUser) return JSON.parse(storedUser);
//       throw error;
//     }
//   },

//   // Update user profile
//   updateProfile: async (userData: Partial<User> | FormData): Promise<User> => {
//     try {
//       if (await isBackendAvailable()) {
//         const config = userData instanceof FormData ? 
//           { headers: { 'Content-Type': 'multipart/form-data' } } : 
//           {};
        
//         const response = await api.put('/profile/', userData, config);
//         const updatedUser = response.data.user || response.data;
        
//         localStorage.setItem('user_data', JSON.stringify(updatedUser));
//         toast.success('Profile updated successfully!');
        
//         return updatedUser;
//       } else {
//         const storedUser = localStorage.getItem('user_data');
//         if (!storedUser) throw new Error('User not found');
        
//         const user = JSON.parse(storedUser);
        
//         let updatedUser;
//         if (userData instanceof FormData) {
//           updatedUser = { ...user };
//           for (const [key, value] of userData.entries()) {
//             if (key !== 'profile_picture') {
//               updatedUser[key] = value;
//             }
//           }
//         } else {
//           updatedUser = { ...user, ...userData };
//         }
        
//         localStorage.setItem('user_data', JSON.stringify(updatedUser));
//         toast.success('Profile updated locally!');
        
//         return updatedUser;
//       }
//     } catch (error) {
//       console.error('Failed to update profile:', error);
//       toast.error('Failed to update profile');
//       throw error;
//     }
//   },

//   // Change password
//   changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
//     try {
//       if (await isBackendAvailable()) {
//         await api.post('/change-password/', { 
//           current_password: currentPassword, 
//           new_password: newPassword,
//           confirm_password: newPassword
//         });
//         toast.success('Password changed successfully!');
//       } else {
//         // Simulate password change for demo
//         toast.success('Password changed locally (demo mode)!');
//       }
//     } catch (error) {
//       console.error('Failed to change password:', error);
//       if (error.response?.data?.current_password) {
//         toast.error('Current password is incorrect');
//       } else {
//         toast.error('Failed to change password');
//       }
//       throw error;
//     }
//   },

//   // Forgot password
//   forgotPassword: async (email: string): Promise<{ message: string; reset_link?: string; token?: string }> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.post('/forgot-password/', { email });
//         toast.success('Password reset link sent to your email!');
//         return response.data;
//       } else {
//         // Mock implementation for offline mode
//         toast.success('Password reset link sent! (Offline mode)');
//         return {
//           message: 'Password reset link sent to your email',
//           reset_link: 'http://localhost:3000/reset-password?token=mock-token',
//           token: 'mock-token'
//         };
//       }
//     } catch (error: any) {
//       console.error('Failed to send password reset:', error);
//       const errorMessage = error.response?.data?.error || 'Failed to send password reset';
//       toast.error(errorMessage);
//       throw error;
//     }
//   },

//   // Reset password
//   resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<void> => {
//     try {
//       if (await isBackendAvailable()) {
//         await api.post('/reset-password/', {
//           token,
//           new_password: newPassword,
//           confirm_password: confirmPassword,
//         });
//         toast.success('Password reset successfully!');
//       } else {
//         // Mock implementation for offline mode
//         toast.success('Password reset successfully! (Offline mode)');
//       }
//     } catch (error: any) {
//       console.error('Failed to reset password:', error);
//       const errorMessage = error.response?.data?.error || 'Failed to reset password';
//       toast.error(errorMessage);
//       throw error;
//     }
//   },

//   // Get user settings and budget info
//   getSettings: async (): Promise<any> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.get('/budget/');
//         const settings = response.data;
        
//         // Store settings locally for offline access
//         localStorage.setItem('user_settings', JSON.stringify(settings));
        
//         return settings;
//       } else {
//         const storedSettings = localStorage.getItem('user_settings');
//         const storedUser = localStorage.getItem('user_data');
        
//         if (!storedUser) throw new Error('User not found');
        
//         const user = JSON.parse(storedUser);
//         const settings = storedSettings ? JSON.parse(storedSettings) : {};
        
//         // ALWAYS calculate actual current month expenses from stored expenses
//         const expenses = getMockExpenses();
//         const currentDate = new Date();
//         const currentMonth = currentDate.getMonth();
//         const currentYear = currentDate.getFullYear();
        
//         const currentMonthExpenses = expenses.filter(expense => {
//           const expenseDate = new Date(expense.date);
//           return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
//         });
        
//         const actualCurrentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
//         const monthlyBudget = settings.monthly_budget || 15000;
//         const budgetRemaining = monthlyBudget - actualCurrentMonthTotal;
//         const budgetPercentage = (actualCurrentMonthTotal / monthlyBudget) * 100;
        
//         // Always return fresh calculated data
//         return {
//           user: {
//             ...user,
//             monthly_budget: monthlyBudget,
//             alert_threshold: settings.alert_threshold || 80,
//             enable_alerts: settings.enable_alerts !== false,
//             notifications_enabled: settings.notifications_enabled !== false,
//             dark_mode: settings.dark_mode || false,
//             theme_color: settings.theme_color || 'blue',
//             compact_mode: settings.compact_mode || false,
//           },
//           budget_stats: {
//             monthly_budget: monthlyBudget,
//             current_month_expenses: actualCurrentMonthTotal,
//             budget_remaining: budgetRemaining,
//             budget_percentage: budgetPercentage,
//             daily_average: actualCurrentMonthTotal / currentDate.getDate(),
//             projected_spending: (actualCurrentMonthTotal / currentDate.getDate()) * 30,
//             days_in_month: currentDate.getDate(),
//             days_in_month_total: 30,
//           },
//           alerts: {
//             is_alert_threshold_reached: budgetPercentage >= (settings.alert_threshold || 80),
//             is_budget_exceeded: actualCurrentMonthTotal > monthlyBudget,
//             alert_threshold: settings.alert_threshold || 80,
//           }
//         };
//       }
//     } catch (error) {
//       console.error('Failed to fetch settings:', error);
//       throw error;
//     }
//   },

//   // Update user settings
//   updateSettings: async (settingsData: any): Promise<any> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.put('/budget/', settingsData);
//         const updatedSettings = response.data;
        
//         // Update local storage
//         localStorage.setItem('user_settings', JSON.stringify(updatedSettings));
        
//         // Update user data if included
//         if (settingsData.user || response.data.user) {
//           const userData = settingsData.user || response.data.user;
//           localStorage.setItem('user_data', JSON.stringify(userData));
//         }
        
//         toast.success('Settings updated successfully!');
//         return updatedSettings;
//       } else {
//         const storedSettings = localStorage.getItem('user_settings');
//         const storedUser = localStorage.getItem('user_data');
        
//         if (!storedUser) throw new Error('User not found');
        
//         const user = JSON.parse(storedUser);
//         const currentSettings = storedSettings ? JSON.parse(storedSettings) : {};
        
//         // ALWAYS recalculate budget data with fresh expense data
//         const expenses = getMockExpenses();
//         const currentDate = new Date();
//         const currentMonth = currentDate.getMonth();
//         const currentYear = currentDate.getFullYear();
        
//         const currentMonthExpenses = expenses.filter(expense => {
//           const expenseDate = new Date(expense.date);
//           return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
//         });
        
//         const actualCurrentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
//         const monthlyBudget = settingsData.monthly_budget || currentSettings.monthly_budget || 15000;
        
//         // Update settings
//         const updatedSettings = { ...currentSettings, ...settingsData };
//         updatedSettings.current_month_expenses = actualCurrentMonthTotal;
        
//         localStorage.setItem('user_settings', JSON.stringify(updatedSettings));
        
//         // Update user data if needed
//         if (settingsData.user) {
//           const updatedUser = { ...user, ...settingsData.user };
//           localStorage.setItem('user_data', JSON.stringify(updatedUser));
//         }
        
//         toast.success('Settings updated locally!');
//         return updatedSettings;
//       }
//     } catch (error) {
//       console.error('Failed to update settings:', error);
//       toast.error('Failed to update settings');
//       throw error;
//     }
//   },
// };

// export const recurringApi = {
//   // Get all recurring expenses
//   getRecurringExpenses: async (): Promise<RecurringExpense[]> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.get('/recurring/');
//         return response.data;
//       } else {
//         const stored = localStorage.getItem('recurring_expenses');
//         return stored ? JSON.parse(stored) : [];
//       }
//     } catch (error) {
//       console.error('Failed to fetch recurring expenses:', error);
//       const stored = localStorage.getItem('recurring_expenses');
//       return stored ? JSON.parse(stored) : [];
//     }
//   },

//   // Create recurring expense
//   createRecurringExpense: async (data: Omit<RecurringExpense, 'id'>): Promise<RecurringExpense> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.post('/recurring/', data);
//         toast.success('Recurring expense saved to backend!');
//         return response.data.recurring_expense || response.data;
//       } else {
//         const newRecurring: RecurringExpense = {
//           ...data,
//           id: Date.now().toString(),
//         };
        
//         const stored = localStorage.getItem('recurring_expenses');
//         const recurring = stored ? JSON.parse(stored) : [];
//         recurring.push(newRecurring);
//         localStorage.setItem('recurring_expenses', JSON.stringify(recurring));
//         toast.success('Recurring expense saved locally!');
        
//         return newRecurring;
//       }
//     } catch (error) {
//       console.error('Failed to create recurring expense:', error);
//       toast.error('Failed to create recurring expense');
//       throw error;
//     }
//   },

//   // Update recurring expense
//   updateRecurringExpense: async (id: string, data: Partial<RecurringExpense>): Promise<RecurringExpense> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.put(`/recurring/${id}/`, data);
//         toast.success('Recurring expense updated in backend!');
//         return response.data.recurring_expense || response.data;
//       } else {
//         const stored = localStorage.getItem('recurring_expenses');
//         const recurring = stored ? JSON.parse(stored) : [];
//         const index = recurring.findIndex((r: RecurringExpense) => r.id === id);
        
//         if (index === -1) throw new Error('Recurring expense not found');
        
//         const updated = { ...recurring[index], ...data };
//         recurring[index] = updated;
//         localStorage.setItem('recurring_expenses', JSON.stringify(recurring));
//         toast.success('Recurring expense updated locally!');
        
//         return updated;
//       }
//     } catch (error) {
//       console.error('Failed to update recurring expense:', error);
//       toast.error('Failed to update recurring expense');
//       throw error;
//     }
//   },

//   // Delete recurring expense
//   deleteRecurringExpense: async (id: string): Promise<void> => {
//     try {
//       if (await isBackendAvailable()) {
//         await api.delete(`/recurring/${id}/`);
//         toast.success('Recurring expense deleted from backend!');
//       } else {
//         const stored = localStorage.getItem('recurring_expenses');
//         const recurring = stored ? JSON.parse(stored) : [];
//         const filtered = recurring.filter((r: RecurringExpense) => r.id !== id);
//         localStorage.setItem('recurring_expenses', JSON.stringify(filtered));
//         toast.success('Recurring expense deleted locally!');
//       }
//     } catch (error) {
//       console.error('Failed to delete recurring expense:', error);
//       toast.error('Failed to delete recurring expense');
//       throw error;
//     }
//   },

//   // Toggle active status
//   toggleActive: async (id: string): Promise<RecurringExpense> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.post(`/recurring/${id}/toggle_active/`);
//         const updated = response.data.recurring_expense || response.data;
//         toast.success(`Recurring expense ${updated.is_active ? 'activated' : 'paused'}!`);
//         return updated;
//       } else {
//         const stored = localStorage.getItem('recurring_expenses');
//         const recurring = stored ? JSON.parse(stored) : [];
//         const index = recurring.findIndex((r: RecurringExpense) => r.id === id);
        
//         if (index === -1) throw new Error('Recurring expense not found');
        
//         recurring[index].is_active = !recurring[index].is_active;
//         localStorage.setItem('recurring_expenses', JSON.stringify(recurring));
//         toast.success(`Recurring expense ${recurring[index].is_active ? 'activated' : 'paused'}!`);
        
//         return recurring[index];
//       }
//     } catch (error) {
//       console.error('Failed to toggle recurring expense:', error);
//       toast.error('Failed to toggle recurring expense');
//       throw error;
//     }
//   },

//   // Generate recurring expenses for current month
//   generateRecurringExpenses: async (): Promise<{ generated_count: number }> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.post('/recurring/generate_all_recurring_expenses/');
//         toast.success(`Generated ${response.data.generated_count} recurring expenses!`);
//         return response.data;
//       } else {
//         // Mock implementation for offline mode
//         const stored = localStorage.getItem('recurring_expenses');
//         const recurring = stored ? JSON.parse(stored) : [];
        
//         const activeRecurring = recurring.filter((r: RecurringExpense) => r.is_active);
//         const today = new Date();
//         const currentMonth = today.getMonth();
//         const currentYear = today.getFullYear();
        
//         let generatedCount = 0;
//         const expenses = getMockExpenses();
        
//         activeRecurring.forEach((recurring: RecurringExpense) => {
//           const startDate = new Date(recurring.start_date);
//           const endDate = recurring.end_date ? new Date(recurring.end_date) : null;
          
//           // Generate expenses for current month
//           const currentDate = new Date(Math.max(startDate.getTime(), new Date(currentYear, currentMonth, 1).getTime()));
//           const monthEnd = new Date(currentYear, currentMonth + 1, 0);
          
//           while (currentDate <= monthEnd) {
//             if (endDate && currentDate > endDate) break;
            
//             // Check if expense already exists
//             const existingExpense = expenses.find(exp => 
//               exp.title === `${recurring.title} (Auto-generated)` &&
//               new Date(exp.date).getTime() === currentDate.getTime()
//             );
            
//             if (!existingExpense) {
//               const newExpense: Expense = {
//                 id: Date.now().toString() + Math.random(),
//                 title: `${recurring.title} (Auto-generated)`,
//                 amount: recurring.amount,
//                 category: recurring.category,
//                 date: currentDate.toISOString().split('T')[0],
//                 description: `Auto-generated from recurring expense: ${recurring.description || ''}`,
//                 userId: '1',
//                 createdAt: new Date().toISOString(),
//               };
              
//               expenses.push(newExpense);
//               generatedCount++;
//             }
            
//             // Move to next occurrence
//             if (recurring.frequency === 'daily') {
//               currentDate.setDate(currentDate.getDate() + 1);
//             } else if (recurring.frequency === 'weekly') {
//               currentDate.setDate(currentDate.getDate() + 7);
//             } else if (recurring.frequency === 'monthly') {
//               currentDate.setMonth(currentDate.getMonth() + 1);
//             } else if (recurring.frequency === 'yearly') {
//               currentDate.setFullYear(currentDate.getFullYear() + 1);
//             }
//           }
//         });
        
//         saveMockExpenses(expenses);
//         toast.success(`Generated ${generatedCount} recurring expenses!`);
//         return { generated_count: generatedCount };
//       }
//     } catch (error) {
//       console.error('Failed to generate recurring expenses:', error);
//       toast.error('Failed to generate recurring expenses');
//       throw error;
//     }
//   },
// };

// export const reportsApi = {
//   // Get reports data
//   getReports: async (startDate?: string, endDate?: string): Promise<any> => {
//     try {
//       if (await isBackendAvailable()) {
//         const params = new URLSearchParams();
//         if (startDate) params.append('start_date', startDate);
//         if (endDate) params.append('end_date', endDate);
        
//         const response = await api.get(`/reports/?${params.toString()}`);
//         return response.data;
//       } else {
//         const expenses = getMockExpenses();
        
//         // Calculate statistics
//         const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
//         const totalCount = expenses.length;
//         const dailyAverage = totalExpenses / (new Date().getDate());
        
//         // Category breakdown
//         const categoryTotals = expenses.reduce((acc, expense) => {
//           acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
//           return acc;
//         }, {} as Record<string, number>);
        
//         const categoryBreakdown = Object.entries(categoryTotals).reduce((acc, [category, amount]) => {
//           acc[category] = {
//             amount,
//             percentage: (amount / totalExpenses) * 100
//           };
//           return acc;
//         }, {} as Record<string, any>);
        
//         // Top category
//         const topCategory = Object.entries(categoryTotals).reduce((a, b) => 
//           categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b
//         , ['N/A', 0]);
        
//         // Monthly trend (mock data)
//         const monthlyTrend = [
//           { month: 'Jan 2024', amount: 1200 },
//           { month: 'Feb 2024', amount: 1500 },
//           { month: 'Mar 2024', amount: 1800 },
//           { month: 'Apr 2024', amount: 1400 },
//           { month: 'May 2024', amount: 1600 },
//           { month: 'Jun 2024', amount: 1900 },
//           { month: 'Jul 2024', amount: totalExpenses },
//         ];
        
//         return {
//           total_expenses: totalExpenses,
//           total_count: totalCount,
//           daily_average: dailyAverage,
//           category_breakdown: categoryBreakdown,
//           top_category: topCategory[0] !== 'N/A' ? {
//             name: topCategory[0],
//             amount: topCategory[1]
//           } : null,
//           monthly_trend: monthlyTrend,
//           date_range: {
//             start: startDate,
//             end: endDate
//           }
//         };
//       }
//     } catch (error) {
//       console.error('Failed to fetch reports:', error);
//       throw error;
//     }
//   },

//   // Get spending trend data for charts
//   getSpendingTrend: async (viewType: 'monthly' | 'yearly' = 'monthly', months: number = 12): Promise<any> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.get('/reports/spending_trend/', {
//           params: { view: viewType, months }
//         });
//         return response.data;
//       } else {
//         // Mock data for offline development
//         const mockData = viewType === 'monthly' ? [
//           { period: 'Jan 2024', amount: 1200, date: '2024-01-01' },
//           { period: 'Feb 2024', amount: 1500, date: '2024-02-01' },
//           { period: 'Mar 2024', amount: 1800, date: '2024-03-01' },
//           { period: 'Apr 2024', amount: 2000, date: '2024-04-01' },
//           { period: 'May 2024', amount: 2200, date: '2024-05-01' },
//           { period: 'Jun 2024', amount: 1900, date: '2024-06-01' },
//           { period: 'Jul 2024', amount: 2100, date: '2024-07-01' },
//           { period: 'Aug 2024', amount: 2400, date: '2024-08-01' },
//           { period: 'Sep 2024', amount: 1800, date: '2024-09-01' },
//           { period: 'Oct 2024', amount: 1600, date: '2024-10-01' },
//           { period: 'Nov 2024', amount: 2000, date: '2024-11-01' },
//           { period: 'Dec 2024', amount: 2500, date: '2024-12-01' }
//         ] : [
//           { period: '2022', amount: 18000, date: '2022-01-01' },
//           { period: '2023', amount: 22000, date: '2023-01-01' },
//           { period: '2024', amount: 25000, date: '2024-01-01' }
//         ];

//         return {
//           trend_data: mockData,
//           view_type: viewType,
//           total_periods: mockData.length
//         };
//       }
//     } catch (error) {
//       console.error('Failed to fetch spending trend:', error);
//       throw error;
//     }
//   },

//   // Get category summary data for charts
//   getCategorySummary: async (startDate?: string, endDate?: string): Promise<any> => {
//     try {
//       if (await isBackendAvailable()) {
//         const params: any = {};
//         if (startDate) params.start_date = startDate;
//         if (endDate) params.end_date = endDate;
        
//         const response = await api.get('/reports/category_summary/', { params });
//         return response.data;
//       } else {
//         // Mock data for offline development
//         return {
//           category_data: [
//             { category: 'Food', amount: 5000, percentage: 33.3, count: 15 },
//             { category: 'Transport', amount: 3000, percentage: 20.0, count: 8 },
//             { category: 'Entertainment', amount: 2000, percentage: 13.3, count: 5 },
//             { category: 'Utilities', amount: 2500, percentage: 16.7, count: 6 },
//             { category: 'Healthcare', amount: 1500, percentage: 10.0, count: 3 },
//             { category: 'Shopping', amount: 1000, percentage: 6.7, count: 4 }
//           ],
//           total_amount: 15000,
//           total_categories: 6
//         };
//       }
//     } catch (error) {
//       console.error('Failed to fetch category summary:', error);
//       throw error;
//     }
//   },
// };

// export const notificationApi = {
//   // Get notifications
//   getNotifications: async (): Promise<any> => {
//     try {
//       if (await isBackendAvailable()) {
//         const response = await api.get('/notifications/');
//         return response.data;
//       } else {
//         return {
//           notifications: [
//             {
//               id: '1',
//               title: 'Budget Alert',
//               message: 'You have spent 80% of your monthly budget',
//               type: 'budget_alert',
//               is_read: false,
//               created_at: new Date().toISOString()
//             }
//           ],
//           unread_count: 1
//         };
//       }
//     } catch (error) {
//       console.error('Failed to fetch notifications:', error);
//       return { notifications: [], unread_count: 0 };
//     }
//   },

//   // Mark notification as read
//   markAsRead: async (notificationId: string): Promise<void> => {
//     try {
//       if (await isBackendAvailable()) {
//         await api.post('/notifications/', { notification_id: notificationId });
//       }
//     } catch (error) {
//       console.warn('Mark as read API failed:', error);
//     }
//   }
// };

// export default api;

// import axios from 'axios';
// import { Expense, User } from '../types';
// import toast from 'react-hot-toast';

// // -----------------------------------------------------------------------------
// // BASE URL SETUP
// // -----------------------------------------------------------------------------
// const API_BASE_URL = 'http://127.0.0.1:8000/api/';

// // -----------------------------------------------------------------------------
// // AXIOS INSTANCE CONFIGURATION
// // -----------------------------------------------------------------------------
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// // -----------------------------------------------------------------------------
// // REQUEST INTERCEPTOR → attach token
// // -----------------------------------------------------------------------------
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('authToken'); // ✅ corrected key
//   if (token) {
//     config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//     console.debug('[api] Attached access token to request', {
//       url: config.url,
//       method: config.method,
//     });
//   } else {
//     console.debug('[api] No access token found for request', {
//       url: config.url,
//       method: config.method,
//     });
//   }
//   return config;
// });

// // -----------------------------------------------------------------------------
// // RESPONSE INTERCEPTOR → handle expired tokens
// // -----------------------------------------------------------------------------
// let isRefreshing = false;
// let refreshPromise: Promise<string> | null = null;

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const refreshToken = localStorage.getItem('refreshToken');
//       if (!refreshToken) {
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('user_data');
//         window.location.href = '/login';
//         return Promise.reject(error);
//       }

//       try {
//         if (!isRefreshing) {
//           isRefreshing = true;
//           refreshPromise = axios
//             .post(`${API_BASE_URL}token/refresh/`, { refresh: refreshToken })
//             .then((res) => {
//               const newAccess = res.data.access;
//               localStorage.setItem('authToken', newAccess);
//               api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
//               console.debug('[api] Refreshed access token via refresh endpoint');
//               return newAccess;
//             })
//             .finally(() => (isRefreshing = false));
//         }

//         const newAccessToken = await (refreshPromise as Promise<string>);
//         originalRequest.headers = originalRequest.headers || {};
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         console.debug('[api] Retrying original request with refreshed token', {
//           url: originalRequest.url,
//           method: originalRequest.method,
//         });
//         return api(originalRequest);
//       } catch (refreshErr) {
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('user_data');
//         console.warn('[api] Refresh token failed, redirecting to login');
//         window.location.href = '/login';
//         return Promise.reject(refreshErr);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// // -----------------------------------------------------------------------------
// // MOCK DATA HELPERS
// // -----------------------------------------------------------------------------
// const getMockExpenses = (): Expense[] => {
//   const stored = localStorage.getItem('mock_expenses');
//   return stored ? JSON.parse(stored) : [];
// };

// const saveMockExpenses = (expenses: Expense[]) => {
//   localStorage.setItem('mock_expenses', JSON.stringify(expenses));
// };

// // -----------------------------------------------------------------------------
// // EXPENSE API
// // -----------------------------------------------------------------------------
// export const expenseApi = {
//   getExpenses: async (): Promise<Expense[]> => {
//     try {
//       const res = await api.get('/expenses/');
//       return res.data;
//     } catch {
//       return getMockExpenses();
//     }
//   },

//   createExpense: async (data: Omit<Expense, 'id' | 'userId' | 'createdAt'>): Promise<Expense> => {
//     try {
//       const res = await api.post('/expenses/', data);
//       toast.success('Expense saved!');
//       return res.data.expense || res.data;
//     } catch (error: any) {
//       if (error.response?.status === 401) {
//         toast.error('Please login again.');
//         throw error;
//       }
//       const newExpense: Expense = {
//         ...data,
//         id: Date.now().toString(),
//         userId: '1',
//         createdAt: new Date().toISOString(),
//       };
//       const expenses = getMockExpenses();
//       expenses.push(newExpense);
//       saveMockExpenses(expenses);
//       toast('Saved locally (offline)');
//       return newExpense;
//     }
//   },

//   updateExpense: async (id: string, expenseData: Partial<Expense>): Promise<Expense> => {
//     try {
//       const res = await api.put(`/expenses/${id}/`, expenseData);
//       toast.success('Expense updated!');
//       return res.data.expense || res.data;
//     } catch (error: any) {
//       if (error.response?.status === 401) {
//         toast.error('Please login again.');
//         throw error;
//       }
//       const expenses = getMockExpenses();
//       const index = expenses.findIndex((e) => e.id === id);
//       const updated = { ...expenses[index], ...expenseData };
//       expenses[index] = updated;
//       saveMockExpenses(expenses);
//       toast('Updated locally (offline)');
//       return updated;
//     }
//   },

//   deleteExpense: async (id: string): Promise<void> => {
//     try {
//       await api.delete(`/expenses/${id}/`);
//       toast.success('Expense deleted!');
//     } catch (error: any) {
//       if (error.response?.status === 401) {
//         toast.error('Please login again.');
//         throw error;
//       }
//       const filtered = getMockExpenses().filter((e) => e.id !== id);
//       saveMockExpenses(filtered);
//       toast('Deleted locally (offline)');
//     }
//   },
// };

// // -----------------------------------------------------------------------------
// // USER API
// // -----------------------------------------------------------------------------
// export const userApi = {
//   getProfile: async (): Promise<User> => {
//     try {
//       const res = await api.get('/profile/');
//       const userData = res.data.user || res.data;
//       localStorage.setItem('user_data', JSON.stringify(userData));
//       return userData;
//     } catch (error) {
//       const stored = localStorage.getItem('user_data');
//       if (stored) return JSON.parse(stored);
//       throw error;
//     }
//   },

//   updateProfile: async (userData: Partial<User> | FormData): Promise<User> => {
//     try {
//       const config = userData instanceof FormData
//         ? { headers: { 'Content-Type': 'multipart/form-data' } }
//         : {};
//       const res = await api.put('/profile/', userData, config);
//       const updated = res.data.user || res.data;
//       localStorage.setItem('user_data', JSON.stringify(updated));
//       toast.success('Profile updated!');
//       return updated;
//     } catch (error) {
//       toast.error('Failed to update profile');
//       throw error;
//     }
//   },

//   changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
//     try {
//       await api.post('/change-password/', {
//         current_password: currentPassword,
//         new_password: newPassword,
//         confirm_password: newPassword,
//       });
//       toast.success('Password changed!');
//     } catch {
//       toast.error('Failed to change password');
//       throw new Error('Change password failed');
//     }
//   },
// };

// // -----------------------------------------------------------------------------
// // RECURRING EXPENSE API
// // -----------------------------------------------------------------------------
// interface RecurringExpense {
//   id: string;
//   title: string;
//   amount: number;
//   category: string;
//   frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
//   start_date: string;
//   end_date?: string;
//   next_date: string;
//   is_active: boolean;
//   description?: string;
// }

// export const recurringApi = {
//   getRecurringExpenses: async (): Promise<RecurringExpense[]> => {
//     try {
//       const res = await api.get('/recurring/');
//       return res.data;
//     } catch {
//       const stored = localStorage.getItem('recurring_expenses');
//       return stored ? JSON.parse(stored) : [];
//     }
//   },
// };

// // -----------------------------------------------------------------------------
// // REPORTS API
// // -----------------------------------------------------------------------------
// export const reportsApi = {
//   getReports: async (startDate?: string, endDate?: string): Promise<any> => {
//     try {
//       const params = new URLSearchParams();
//       if (startDate) params.append('start_date', startDate);
//       if (endDate) params.append('end_date', endDate);
//       const res = await api.get(`/reports/?${params.toString()}`);
//       return res.data;
//     } catch {
//       const expenses = getMockExpenses();
//       const total = expenses.reduce((sum, e) => sum + e.amount, 0);
//       return { total_expenses: total, count: expenses.length };
//     }
//   },
// };

// // -----------------------------------------------------------------------------
// // NOTIFICATIONS API
// // -----------------------------------------------------------------------------
// export const notificationApi = {
//   getNotifications: async (): Promise<any> => {
//     try {
//       const res = await api.get('/notifications/');
//       return res.data;
//     } catch {
//       return {
//         notifications: [
//           {
//             id: '1',
//             title: 'Budget Alert',
//             message: 'You have spent 80% of your monthly budget',
//             type: 'budget_alert',
//             is_read: false,
//             created_at: new Date().toISOString(),
//           },
//         ],
//         unread_count: 1,
//       };
//     }
//   },

//   markAsRead: async (notificationId: string): Promise<void> => {
//     try {
//       await api.post('/notifications/', { notification_id: notificationId });
//     } catch (err) {
//       console.warn('Mark as read failed:', err);
//     }
//   },
// };

// // -----------------------------------------------------------------------------
// // EXPORT DEFAULT
// // -----------------------------------------------------------------------------
// export default api;
