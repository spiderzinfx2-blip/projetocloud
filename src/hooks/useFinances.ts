import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useTeam } from './useTeam';

export type TransactionType = 'income' | 'expense';
export type TransactionRecurrence = 'once' | 'monthly' | 'weekly' | 'yearly';

export interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType;
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
  recurrence: TransactionRecurrence;
  tags?: string[];
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  type: 'savings' | 'expense_limit' | 'income_target';
  targetAmount: number;
  currentAmount: number;
  month: number;
  year: number;
  createdAt: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: 'salary', name: 'Salário', color: '#22c55e', type: 'income', icon: 'Briefcase' },
  { id: 'freelance', name: 'Freelance', color: '#3b82f6', type: 'income', icon: 'Laptop' },
  { id: 'investment', name: 'Investimentos', color: '#8b5cf6', type: 'income', icon: 'TrendingUp' },
  { id: 'gift', name: 'Presente', color: '#ec4899', type: 'income', icon: 'Gift' },
  { id: 'other-income', name: 'Outros', color: '#6b7280', type: 'income', icon: 'Plus' },
  // Expense
  { id: 'food', name: 'Alimentação', color: '#f97316', type: 'expense', icon: 'UtensilsCrossed' },
  { id: 'transport', name: 'Transporte', color: '#eab308', type: 'expense', icon: 'Car' },
  { id: 'housing', name: 'Moradia', color: '#14b8a6', type: 'expense', icon: 'Home' },
  { id: 'health', name: 'Saúde', color: '#ef4444', type: 'expense', icon: 'Heart' },
  { id: 'education', name: 'Educação', color: '#6366f1', type: 'expense', icon: 'GraduationCap' },
  { id: 'entertainment', name: 'Lazer', color: '#a855f7', type: 'expense', icon: 'Gamepad2' },
  { id: 'shopping', name: 'Compras', color: '#f43f5e', type: 'expense', icon: 'ShoppingBag' },
  { id: 'bills', name: 'Contas', color: '#0ea5e9', type: 'expense', icon: 'Receipt' },
  { id: 'subscription', name: 'Assinaturas', color: '#84cc16', type: 'expense', icon: 'CreditCard' },
  { id: 'card', name: 'Cartão', color: '#dc2626', type: 'expense', icon: 'CreditCard' },
  { id: 'market', name: 'Mercado', color: '#16a34a', type: 'expense', icon: 'ShoppingCart' },
  { id: 'other-expense', name: 'Outros', color: '#6b7280', type: 'expense', icon: 'MoreHorizontal' },
];

const FINANCES_KEY = 'finances_data';
const CATEGORIES_KEY = 'finances_categories';
const GOALS_KEY = 'finances_goals';

export function useFinances() {
  const { user } = useAuth();
  const { activeTeamId, getActiveTeam } = useTeam();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStorageKey = useCallback(() => {
    if (activeTeamId) {
      return `${FINANCES_KEY}_team_${activeTeamId}`;
    }
    return user ? `${FINANCES_KEY}_${user.id}` : FINANCES_KEY;
  }, [user, activeTeamId]);

  const getCategoriesKey = useCallback(() => {
    if (activeTeamId) {
      return `${CATEGORIES_KEY}_team_${activeTeamId}`;
    }
    return user ? `${CATEGORIES_KEY}_${user.id}` : CATEGORIES_KEY;
  }, [user, activeTeamId]);

  const getGoalsKey = useCallback(() => {
    if (activeTeamId) {
      return `${GOALS_KEY}_team_${activeTeamId}`;
    }
    return user ? `${GOALS_KEY}_${user.id}` : GOALS_KEY;
  }, [user, activeTeamId]);

  // Load data
  useEffect(() => {
    const storedTransactions = localStorage.getItem(getStorageKey());
    const storedCategories = localStorage.getItem(getCategoriesKey());
    const storedGoals = localStorage.getItem(getGoalsKey());

    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    } else {
      setTransactions([]);
    }

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }

    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    } else {
      setGoals([]);
    }

    setIsLoading(false);
  }, [getStorageKey, getCategoriesKey, getGoalsKey]);

  // Save transactions
  const saveTransactions = useCallback((data: Transaction[]) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
    setTransactions(data);
  }, [getStorageKey]);

  // Save categories
  const saveCategories = useCallback((data: Category[]) => {
    localStorage.setItem(getCategoriesKey(), JSON.stringify(data));
    setCategories(data);
  }, [getCategoriesKey]);

  // Save goals
  const saveGoals = useCallback((data: FinancialGoal[]) => {
    localStorage.setItem(getGoalsKey(), JSON.stringify(data));
    setGoals(data);
  }, [getGoalsKey]);

  // Add transaction
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    saveTransactions([...transactions, newTransaction]);
    return newTransaction;
  }, [transactions, saveTransactions]);

  // Update transaction
  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    saveTransactions(updated);
  }, [transactions, saveTransactions]);

  // Delete transaction
  const deleteTransaction = useCallback((id: string) => {
    saveTransactions(transactions.filter(t => t.id !== id));
  }, [transactions, saveTransactions]);

  // Add category
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    saveCategories([...categories, newCategory]);
    return newCategory;
  }, [categories, saveCategories]);

  // Update category
  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    const updated = categories.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    saveCategories(updated);
  }, [categories, saveCategories]);

  // Delete category
  const deleteCategory = useCallback((id: string) => {
    saveCategories(categories.filter(c => c.id !== id));
  }, [categories, saveCategories]);

  // Get monthly summary
  const getMonthlySummary = useCallback((year: number, month: number) => {
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    const byCategory = monthTransactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0 };
      }
      acc[t.category][t.type] += t.amount;
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    return { income, expense, balance, byCategory, transactions: monthTransactions };
  }, [transactions]);

  // Get yearly summary
  const getYearlySummary = useCallback((year: number) => {
    const yearTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year;
    });

    const monthlyData = Array.from({ length: 12 }, (_, month) => {
      const monthTrans = yearTransactions.filter(t => new Date(t.date).getMonth() === month);
      return {
        month,
        income: monthTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expense: monthTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      };
    });

    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);

    return { monthlyData, totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [transactions]);

  // Get recurring transactions
  const getRecurringTransactions = useCallback(() => {
    return transactions.filter(t => t.recurrence !== 'once');
  }, [transactions]);

  // Add goal
  const addGoal = useCallback((goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'currentAmount'>) => {
    const newGoal: FinancialGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };
    saveGoals([...goals, newGoal]);
    return newGoal;
  }, [goals, saveGoals]);

  // Update goal
  const updateGoal = useCallback((id: string, updates: Partial<FinancialGoal>) => {
    const updated = goals.map(g => 
      g.id === id ? { ...g, ...updates } : g
    );
    saveGoals(updated);
  }, [goals, saveGoals]);

  // Delete goal
  const deleteGoal = useCallback((id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
  }, [goals, saveGoals]);

  // Get monthly goals with progress
  const getMonthlyGoals = useCallback((year: number, month: number) => {
    const monthGoals = goals.filter(g => g.year === year && g.month === month);
    const summary = getMonthlySummary(year, month);
    
    return monthGoals.map(goal => {
      let currentAmount = 0;
      let progress = 0;
      
      switch (goal.type) {
        case 'income_target':
          currentAmount = summary.income;
          progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
          break;
        case 'expense_limit':
          currentAmount = summary.expense;
          progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
          break;
        case 'savings':
          currentAmount = summary.balance;
          progress = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
          break;
      }
      
      return {
        ...goal,
        currentAmount,
        progress: Math.min(progress, 100),
        isCompleted: goal.type === 'expense_limit' 
          ? currentAmount <= goal.targetAmount 
          : currentAmount >= goal.targetAmount,
        isOverBudget: goal.type === 'expense_limit' && currentAmount > goal.targetAmount,
      };
    });
  }, [goals, getMonthlySummary]);

  return {
    transactions,
    categories,
    goals,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addGoal,
    updateGoal,
    deleteGoal,
    getMonthlySummary,
    getYearlySummary,
    getRecurringTransactions,
    getMonthlyGoals,
  };
}
