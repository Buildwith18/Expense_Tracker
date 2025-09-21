import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { User, AuthState } from '../types';
import { userApi } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      console.log('Auth: Login success', { user: action.payload.user.email });
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      console.log('Auth: Logout');
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            
            // Validate token is not expired (basic check)
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              try {
                const payload = JSON.parse(atob(tokenParts[1]));
                const currentTime = Date.now() / 1000;
                
                // If token is expired, clear it
                if (payload.exp && payload.exp < currentTime) {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user_data');
                  setIsLoading(false);
                  return;
                }
              } catch (tokenError) {
                console.warn('Token validation failed:', tokenError);
                // For mock tokens, don't fail validation
                if (!token.includes('mock.token')) {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user_data');
                  setIsLoading(false);
                  return;
                }
              }
            }
            
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
            console.log('Auth: Initialized from localStorage', { user: user.email });
            
            // Try to sync with backend (optional)
            try {
              await syncUserData();
            } catch (syncError) {
              console.warn('Failed to sync user data:', syncError);
              // Don't fail auth if sync fails
            }
          } catch (error) {
            console.error('Failed to parse stored auth data:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const syncUserData = async () => {
    try {
      const latestUser = await userApi.getProfile();
      dispatch({ type: 'UPDATE_USER', payload: latestUser });
    } catch (error) {
      console.warn('Failed to sync user data from backend:', error);
      // Don't throw error to avoid breaking auth flow
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Try real API first, fallback to mock
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/token/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        });
        
        if (response.ok) {
          const data = await response.json();
          const { user, tokens } = data;
          
          localStorage.setItem('auth_token', tokens.access);
          localStorage.setItem('user_data', JSON.stringify(user));
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: tokens.access } });
          toast.success('Logged in successfully!');
          return;
        }
      } catch (apiError) {
        console.warn('Backend login failed, using mock:', apiError);
      }
      
      // Fallback to mock login
      const mockUser: User = {
        id: '1',
        username: email.split('@')[0],
        email,
        firstName: 'John',
        lastName: 'Doe',
        currency: 'INR',
      };
      
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token';
      
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      // Initialize empty expenses and settings for new user
      localStorage.setItem('mock_expenses', JSON.stringify([]));
      localStorage.setItem('user_settings', JSON.stringify({
        monthly_budget: 15000,
        alert_threshold: 80,
        enable_alerts: true,
        notifications_enabled: true,
        dark_mode: false,
        theme_color: 'blue',
        compact_mode: false
      }));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: mockUser, token: mockToken } });
      toast.success('Logged in successfully (demo mode)!');
    } catch (error) {
      toast.error('Login failed');
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setIsLoading(true);
      // Try real API first, fallback to mock
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            password_confirm: userData.password,
            first_name: userData.firstName,
            last_name: userData.lastName,
            currency: 'INR'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const { user, tokens } = data;
          
          localStorage.setItem('auth_token', tokens.access);
          localStorage.setItem('user_data', JSON.stringify(user));
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: tokens.access } });
          toast.success('Account created successfully!');
          return;
        }
      } catch (apiError) {
        console.warn('Backend registration failed, using mock:', apiError);
      }
      
      // Fallback to mock registration
      const mockUser: User = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        currency: 'INR',
      };
      
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token';
      
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      // Initialize empty expenses and settings for new user
      localStorage.setItem('mock_expenses', JSON.stringify([]));
      localStorage.setItem('user_settings', JSON.stringify({
        monthly_budget: 15000,
        alert_threshold: 80,
        enable_alerts: true,
        notifications_enabled: true,
        dark_mode: false,
        theme_color: 'blue',
        compact_mode: false
      }));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: mockUser, token: mockToken } });
      toast.success('Account created successfully (demo mode)!');
    } catch (error) {
      toast.error('Registration failed');
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_settings');
    localStorage.removeItem('mock_expenses');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully!');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (state.user) {
      try {
        // Update via API first
        const updatedUser = await userApi.updateProfile(userData);
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      } catch (error) {
        // Fallback to local update
        const updatedUser = { ...state.user, ...userData };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        dispatch({ type: 'UPDATE_USER', payload: userData });
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};