import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  nome: string;
  name: string;
  email: string;
  username: string;
}

export interface UserData {
  id?: string;
  name?: string;
  email?: string;
  theme?: 'light' | 'dark';
  clientes?: Cliente[];
  servicos?: Servico[];
  trabalhos?: Trabalho[];
  categorias?: Categoria[];
  empresaConfig?: ConfigEmpresa;
  notionPages?: any[];
  trelloBoards?: any[];
  transacoes?: any[];
}

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  notas?: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  categoriaId?: string;
}

export interface Trabalho {
  id: string;
  clienteId: string;
  servicoId: string;
  descricao: string;
  valor: number;
  status: 'pendente' | '50%' | 'recebido' | 'cancelado';
  data: string;
}

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

export interface ConfigEmpresa {
  nome?: string;
  cnpj?: string;
  banner?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          nome: foundUser.nome || foundUser.name,
          name: foundUser.nome || foundUser.name,
          email: foundUser.email,
          username: foundUser.username || email.split('@')[0]
        };
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        toast({ title: 'Login realizado com sucesso!' });
        return true;
      } else {
        toast({ title: 'Email ou senha incorretos', variant: 'destructive' });
        return false;
      }
    } catch (error) {
      toast({ title: 'Erro ao fazer login', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const exists = users.find((u: any) => u.email === email);
      
      if (exists) {
        toast({ title: 'Este email já está cadastrado', variant: 'destructive' });
        return false;
      }
      
      const newUser = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        nome: name,
        name: name,
        email: email,
        password: password,
        username: email.split('@')[0]
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      const userData: User = {
        id: newUser.id,
        nome: newUser.nome,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username
      };
      
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      toast({ title: 'Conta criada com sucesso!' });
      return true;
    } catch (error) {
      toast({ title: 'Erro ao criar conta', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast({ title: 'Logout realizado com sucesso!' });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to save user data
export function saveUserData(userId: string, data: UserData) {
  try {
    localStorage.setItem(`userData_${userId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// Helper function to load user data
export function loadUserData(userId: string): UserData | null {
  try {
    const saved = localStorage.getItem(`userData_${userId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
}
