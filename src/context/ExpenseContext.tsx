import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Expense } from '../types';
import { expenseApi } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // ✅ Import Auth Context

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
}

interface ExpenseContextType extends ExpenseState {
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refreshExpenses: () => Promise<void>;
  clearError: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

type ExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: { id: string; expense: Expense } }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload, isLoading: false, error: null };
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
        isLoading: false,
        error: null,
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload.expense : expense
        ),
        isLoading: false,
        error: null,
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, {
    expenses: [],
    isLoading: false,
    error: null,
  });

  const { isAuthenticated } = useAuth(); // ✅ Access auth status

  const refreshExpenses = async () => {
    if (!isAuthenticated) {
      console.log('[ExpenseContext] Skipping refreshExpenses — user not authenticated');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const expenses = await expenseApi.getExpenses();
      dispatch({ type: 'SET_EXPENSES', payload: expenses });
      console.log('[ExpenseContext] Expenses fetched successfully');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch expenses' });
      console.error('Failed to fetch expenses:', error);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newExpense = await expenseApi.createExpense(expenseData);
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
      toast.success('Expense added successfully!');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add expense' });
      toast.error('Failed to add expense');
      throw error;
    }
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedExpense = await expenseApi.updateExpense(id, expenseData);
      dispatch({ type: 'UPDATE_EXPENSE', payload: { id, expense: updatedExpense } });
      toast.success('Expense updated successfully!');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update expense' });
      toast.error('Failed to update expense');
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await expenseApi.deleteExpense(id);
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
      toast.success('Expense deleted successfully!');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete expense' });
      toast.error('Failed to delete expense');
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // ✅ Only load expenses after user logs in
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[ExpenseContext] User authenticated — fetching expenses');
      refreshExpenses();
    } else {
      console.log('[ExpenseContext] User not logged in — skipping fetch');
    }
  }, [isAuthenticated]); // run when login/logout changes

  return (
    <ExpenseContext.Provider
      value={{
        ...state,
        addExpense,
        updateExpense,
        deleteExpense,
        refreshExpenses,
        clearError,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};


// import React, { createContext, useContext, useReducer, useEffect } from 'react';
// import { Expense } from '../types';
// import { expenseApi } from '../services/api';
// import toast from 'react-hot-toast';

// interface ExpenseState {
//   expenses: Expense[];
//   isLoading: boolean;
//   error: string | null;
// }

// interface ExpenseContextType extends ExpenseState {
//   addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
//   updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
//   deleteExpense: (id: string) => Promise<void>;
//   refreshExpenses: () => Promise<void>;
//   clearError: () => void;
// }

// const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// type ExpenseAction =
//   | { type: 'SET_LOADING'; payload: boolean }
//   | { type: 'SET_EXPENSES'; payload: Expense[] }
//   | { type: 'ADD_EXPENSE'; payload: Expense }
//   | { type: 'UPDATE_EXPENSE'; payload: { id: string; expense: Expense } }
//   | { type: 'DELETE_EXPENSE'; payload: string }
//   | { type: 'SET_ERROR'; payload: string }
//   | { type: 'CLEAR_ERROR' };

// const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
//   switch (action.type) {
//     case 'SET_LOADING':
//       return { ...state, isLoading: action.payload };
//     case 'SET_EXPENSES':
//       return { ...state, expenses: action.payload, isLoading: false, error: null };
//     case 'ADD_EXPENSE':
//       return { 
//         ...state, 
//         expenses: [action.payload, ...state.expenses],
//         isLoading: false,
//         error: null
//       };
//     case 'UPDATE_EXPENSE':
//       return {
//         ...state,
//         expenses: state.expenses.map(expense =>
//           expense.id === action.payload.id ? action.payload.expense : expense
//         ),
//         isLoading: false,
//         error: null
//       };
//     case 'DELETE_EXPENSE':
//       return {
//         ...state,
//         expenses: state.expenses.filter(expense => expense.id !== action.payload),
//         isLoading: false,
//         error: null
//       };
//     case 'SET_ERROR':
//       return { ...state, error: action.payload, isLoading: false };
//     case 'CLEAR_ERROR':
//       return { ...state, error: null };
//     default:
//       return state;
//   }
// };

// export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [state, dispatch] = useReducer(expenseReducer, {
//     expenses: [],
//     isLoading: false,
//     error: null,
//   });

//   const refreshExpenses = async () => {
//     try {
//       dispatch({ type: 'SET_LOADING', payload: true });
//       const expenses = await expenseApi.getExpenses();
//       dispatch({ type: 'SET_EXPENSES', payload: expenses });
//     } catch (error) {
//       dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch expenses' });
//       console.error('Failed to fetch expenses:', error);
//     }
//   };

//   const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
//     try {
//       dispatch({ type: 'SET_LOADING', payload: true });
//       const newExpense = await expenseApi.createExpense(expenseData);
//       dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
//       toast.success('Expense added successfully!');
//     } catch (error) {
//       dispatch({ type: 'SET_ERROR', payload: 'Failed to add expense' });
//       toast.error('Failed to add expense');
//       throw error;
//     }
//   };

//   const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
//     try {
//       dispatch({ type: 'SET_LOADING', payload: true });
//       const updatedExpense = await expenseApi.updateExpense(id, expenseData);
//       dispatch({ type: 'UPDATE_EXPENSE', payload: { id, expense: updatedExpense } });
//       toast.success('Expense updated successfully!');
//     } catch (error) {
//       dispatch({ type: 'SET_ERROR', payload: 'Failed to update expense' });
//       toast.error('Failed to update expense');
//       throw error;
//     }
//   };

//   const deleteExpense = async (id: string) => {
//     try {
//       dispatch({ type: 'SET_LOADING', payload: true });
//       await expenseApi.deleteExpense(id);
//       dispatch({ type: 'DELETE_EXPENSE', payload: id });
//       toast.success('Expense deleted successfully!');
//     } catch (error) {
//       dispatch({ type: 'SET_ERROR', payload: 'Failed to delete expense' });
//       toast.error('Failed to delete expense');
//       throw error;
//     }
//   };

//   const clearError = () => {
//     dispatch({ type: 'CLEAR_ERROR' });
//   };

//   // Load expenses on mount
//   useEffect(() => {
//     refreshExpenses();
//   }, []);

//   return (
//     <ExpenseContext.Provider
//       value={{
//         ...state,
//         addExpense,
//         updateExpense,
//         deleteExpense,
//         refreshExpenses,
//         clearError,
//       }}
//     >
//       {children}
//     </ExpenseContext.Provider>
//   );
// };

// export const useExpenses = () => {
//   const context = useContext(ExpenseContext);
//   if (context === undefined) {
//     throw new Error('useExpenses must be used within an ExpenseProvider');
//   }
//   return context;
// };
