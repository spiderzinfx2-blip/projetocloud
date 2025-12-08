import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Minus,
  ChevronLeft, ChevronRight, Calendar, PieChart, BarChart3,
  Repeat, Tag, Trash2, Edit2, Settings, ArrowUpCircle, ArrowDownCircle,
  Wallet, Target, Filter, X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useFinances, Transaction, Category, TransactionType, TransactionRecurrence } from '@/hooks/useFinances';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid, Area, AreaChart } from 'recharts';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const RECURRENCE_OPTIONS: { value: TransactionRecurrence; label: string }[] = [
  { value: 'once', label: 'Única vez' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'yearly', label: 'Anual' },
];

export default function Financas() {
  const { user, login } = useAuth();
  const { 
    transactions, categories, isLoading,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, updateCategory, deleteCategory,
    getMonthlySummary, getYearlySummary, getRecurringTransactions 
  } = useFinances();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form state
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formRecurrence, setFormRecurrence] = useState<TransactionRecurrence>('once');

  // Category form state
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#3b82f6');
  const [catType, setCatType] = useState<TransactionType>('expense');
  const [catIcon, setCatIcon] = useState('Tag');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthlySummary = useMemo(() => getMonthlySummary(currentYear, currentMonth), [getMonthlySummary, currentYear, currentMonth]);
  const yearlySummary = useMemo(() => getYearlySummary(currentYear), [getYearlySummary, currentYear]);
  const recurringTransactions = useMemo(() => getRecurringTransactions(), [getRecurringTransactions]);

  const filteredTransactions = useMemo(() => {
    return monthlySummary.transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [monthlySummary.transactions, filterType, filterCategory]);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const pieChartData = useMemo(() => {
    const data: { name: string; value: number; color: string }[] = [];
    Object.entries(monthlySummary.byCategory).forEach(([catId, values]) => {
      const category = categories.find(c => c.id === catId);
      if (category && values.expense > 0) {
        data.push({
          name: category.name,
          value: values.expense,
          color: category.color,
        });
      }
    });
    return data.sort((a, b) => b.value - a.value);
  }, [monthlySummary.byCategory, categories]);

  const barChartData = useMemo(() => {
    return yearlySummary.monthlyData.map((m, i) => ({
      month: MONTHS[i].substring(0, 3),
      Receita: m.income,
      Despesa: m.expense,
    }));
  }, [yearlySummary]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const resetForm = () => {
    setFormType('expense');
    setFormCategory('');
    setFormDescription('');
    setFormAmount('');
    setFormDate(format(new Date(), 'yyyy-MM-dd'));
    setFormRecurrence('once');
    setEditingTransaction(null);
  };

  const handleOpenAddTransaction = (type: TransactionType) => {
    resetForm();
    setFormType(type);
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormType(transaction.type);
    setFormCategory(transaction.category);
    setFormDescription(transaction.description);
    setFormAmount(transaction.amount.toString());
    setFormDate(transaction.date);
    setFormRecurrence(transaction.recurrence);
    setShowTransactionModal(true);
  };

  const handleSaveTransaction = () => {
    if (!formCategory || !formDescription.trim() || !formAmount) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    const transactionData = {
      type: formType,
      category: formCategory,
      description: formDescription.trim(),
      amount: parseFloat(formAmount),
      date: formDate,
      recurrence: formRecurrence,
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
      toast({ title: 'Transação atualizada!' });
    } else {
      addTransaction(transactionData);
      toast({ title: `${formType === 'income' ? 'Receita' : 'Despesa'} adicionada!` });
    }

    setShowTransactionModal(false);
    resetForm();
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Excluir esta transação?')) {
      deleteTransaction(id);
      toast({ title: 'Transação excluída!' });
    }
  };

  const handleOpenAddCategory = () => {
    setCatName('');
    setCatColor('#3b82f6');
    setCatType('expense');
    setCatIcon('Tag');
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCatName(category.name);
    setCatColor(category.color);
    setCatType(category.type);
    setCatIcon(category.icon);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    if (!catName.trim()) {
      toast({ title: 'Digite o nome da categoria', variant: 'destructive' });
      return;
    }

    const categoryData = {
      name: catName.trim(),
      color: catColor,
      type: catType,
      icon: catIcon,
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, categoryData);
      toast({ title: 'Categoria atualizada!' });
    } else {
      addCategory(categoryData);
      toast({ title: 'Categoria criada!' });
    }

    setShowCategoryModal(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Excluir esta categoria?')) {
      deleteCategory(id);
      toast({ title: 'Categoria excluída!' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Wallet className="w-16 h-16 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Gestão Financeira</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Faça login para acessar sua gestão financeira pessoal.
          </p>
          <Button onClick={() => login('user@example.com', 'password')}>
            Entrar
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container-wide py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestão Financeira</h1>
            <p className="text-muted-foreground">Controle suas receitas e despesas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleOpenAddCategory}>
              <Tag className="w-4 h-4 mr-2" />
              Categorias
            </Button>
            <Button onClick={() => handleOpenAddTransaction('income')} className="bg-success hover:bg-success/90">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Receita
            </Button>
            <Button onClick={() => handleOpenAddTransaction('expense')} variant="destructive">
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Despesa
            </Button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Calendar className="w-5 h-5 text-primary" />
            {MONTHS[currentMonth]} {currentYear}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Receitas</span>
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(monthlySummary.income)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Despesas</span>
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
            </div>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(monthlySummary.expense)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Saldo</span>
              <div className={cn("p-2 rounded-lg", monthlySummary.balance >= 0 ? "bg-success/10" : "bg-destructive/10")}>
                <Wallet className={cn("w-4 h-4", monthlySummary.balance >= 0 ? "text-success" : "text-destructive")} />
              </div>
            </div>
            <p className={cn("text-2xl font-bold", monthlySummary.balance >= 0 ? "text-success" : "text-destructive")}>
              {formatCurrency(monthlySummary.balance)}
            </p>
          </motion.div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-xl mx-auto mb-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="recurring">Recorrentes</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart - Expenses by Category */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Despesas por Categoria
                </h3>
                {pieChartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nenhuma despesa neste mês
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  {pieChartData.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Bar Chart - Monthly Comparison */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border border-border p-5"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Comparativo Anual
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="Receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Yearly Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-card rounded-xl border border-border p-5"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Resumo Anual {currentYear}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <p className="text-sm text-muted-foreground mb-1">Total Receitas</p>
                    <p className="text-xl font-bold text-success">{formatCurrency(yearlySummary.totalIncome)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-sm text-muted-foreground mb-1">Total Despesas</p>
                    <p className="text-xl font-bold text-destructive">{formatCurrency(yearlySummary.totalExpense)}</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg border",
                    yearlySummary.balance >= 0 
                      ? "bg-success/5 border-success/20" 
                      : "bg-destructive/5 border-destructive/20"
                  )}>
                    <p className="text-sm text-muted-foreground mb-1">Saldo Anual</p>
                    <p className={cn("text-xl font-bold", yearlySummary.balance >= 0 ? "text-success" : "text-destructive")}>
                      {formatCurrency(yearlySummary.balance)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-4">
                <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[160px]">
                    <Tag className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(filterType !== 'all' || filterCategory !== 'all') && (
                  <Button variant="ghost" size="sm" onClick={() => { setFilterType('all'); setFilterCategory('all'); }}>
                    <X className="w-4 h-4 mr-1" /> Limpar
                  </Button>
                )}
              </div>

              {/* Transactions List */}
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma transação encontrada
                    </div>
                  ) : (
                    filteredTransactions.map((transaction) => {
                      const category = categories.find(c => c.id === transaction.category);
                      return (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border group",
                            transaction.type === 'income' 
                              ? "border-success/20 bg-success/5" 
                              : "border-destructive/20 bg-destructive/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${category?.color}20` }}
                            >
                              {transaction.type === 'income' ? (
                                <ArrowUpCircle className="w-5 h-5" style={{ color: category?.color }} />
                              ) : (
                                <ArrowDownCircle className="w-5 h-5" style={{ color: category?.color }} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {category?.name} • {format(new Date(transaction.date), 'dd MMM', { locale: ptBR })}
                                {transaction.recurrence !== 'once' && (
                                  <span className="ml-2 inline-flex items-center gap-1">
                                    <Repeat className="w-3 h-3" />
                                    {RECURRENCE_OPTIONS.find(r => r.value === transaction.recurrence)?.label}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className={cn(
                              "font-semibold",
                              transaction.type === 'income' ? 'text-success' : 'text-destructive'
                            )}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditTransaction(transaction)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTransaction(transaction.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </TabsContent>

          {/* Recurring Tab */}
          <TabsContent value="recurring">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-primary" />
                  Transações Recorrentes
                </h3>
              </div>

              <div className="space-y-2">
                {recurringTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma transação recorrente
                  </div>
                ) : (
                  recurringTransactions.map((transaction) => {
                    const category = categories.find(c => c.id === transaction.category);
                    return (
                      <div
                        key={transaction.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          transaction.type === 'income' 
                            ? "border-success/20 bg-success/5" 
                            : "border-destructive/20 bg-destructive/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${category?.color}20` }}
                          >
                            <Repeat className="w-5 h-5" style={{ color: category?.color }} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {category?.name} • {RECURRENCE_OPTIONS.find(r => r.value === transaction.recurrence)?.label}
                            </p>
                          </div>
                        </div>
                        <p className={cn(
                          "font-semibold",
                          transaction.type === 'income' ? 'text-success' : 'text-destructive'
                        )}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Categorias</h3>
                <Button size="sm" onClick={handleOpenAddCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Categories */}
                <div>
                  <h4 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Receitas
                  </h4>
                  <div className="space-y-2">
                    {incomeCategories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg border border-border group">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-foreground">{cat.name}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCategory(cat)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expense Categories */}
                <div>
                  <h4 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Despesas
                  </h4>
                  <div className="space-y-2">
                    {expenseCategories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg border border-border group">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-foreground">{cat.name}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCategory(cat)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Editar' : 'Nova'} {formType === 'income' ? 'Receita' : 'Despesa'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formType === 'income' ? 'default' : 'outline'}
                className={formType === 'income' ? 'bg-success hover:bg-success/90' : ''}
                onClick={() => setFormType('income')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Receita
              </Button>
              <Button
                type="button"
                variant={formType === 'expense' ? 'default' : 'outline'}
                className={formType === 'expense' ? 'bg-destructive hover:bg-destructive/90' : ''}
                onClick={() => setFormType('expense')}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Despesa
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {(formType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Ex: Pagamento cliente X"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recorrência</Label>
              <Select value={formRecurrence} onValueChange={(v) => setFormRecurrence(v as TransactionRecurrence)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransactionModal(false)}>Cancelar</Button>
            <Button onClick={handleSaveTransaction}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar' : 'Nova'} Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Nome da categoria"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={catType} onValueChange={(v) => setCatType(v as TransactionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  className="w-14 h-10 p-1"
                />
                <Input
                  value={catColor}
                  onChange={(e) => setCatColor(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryModal(false)}>Cancelar</Button>
            <Button onClick={handleSaveCategory}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
