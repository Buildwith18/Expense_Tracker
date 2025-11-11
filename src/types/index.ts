export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  currency: string;
  profilePicture?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string | null;
  user?: string;
  formatted_amount?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}