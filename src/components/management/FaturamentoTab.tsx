import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, Download, 
  FileSpreadsheet, ChevronLeft, ChevronRight, BarChart3
} from 'lucide-react';
import { Trabalho, Cliente, Servico } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface FaturamentoTabProps {
  trabalhos: Trabalho[];
  clientes: Cliente[];
  servicos: Servico[];
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function FaturamentoTab({ trabalhos, clientes, servicos }: FaturamentoTabProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonth);

  // Calculate years available
  const yearsAvailable = useMemo(() => {
    const years = new Set<number>();
    trabalhos.forEach(t => {
      years.add(new Date(t.data).getFullYear());
    });
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [trabalhos]);

  // Filter trabalhos by period
  const filteredTrabalhos = useMemo(() => {
    return trabalhos.filter(t => {
      const date = new Date(t.data);
      if (date.getFullYear() !== selectedYear) return false;
      if (selectedMonth !== 'all' && date.getMonth() !== selectedMonth) return false;
      return true;
    });
  }, [trabalhos, selectedYear, selectedMonth]);

  // Calculate monthly data for the year
  const monthlyData = useMemo(() => {
    return months.map((name, index) => {
      const monthTrabalhos = trabalhos.filter(t => {
        const date = new Date(t.data);
        return date.getFullYear() === selectedYear && date.getMonth() === index;
      });

      const recebido = monthTrabalhos.reduce((sum, t) => {
        if (t.status === 'recebido') return sum + t.valor;
        if (t.status === '50%') return sum + (t.valor * 0.5);
        return sum;
      }, 0);

      const pendente = monthTrabalhos.reduce((sum, t) => {
        if (t.status === 'pendente') return sum + t.valor;
        if (t.status === '50%') return sum + (t.valor * 0.5);
        return sum;
      }, 0);

      const cancelado = monthTrabalhos.reduce((sum, t) => {
        if (t.status === 'cancelado') return sum + t.valor;
        return sum;
      }, 0);

      return {
        name,
        month: index,
        recebido,
        pendente,
        cancelado,
        total: recebido + pendente,
        count: monthTrabalhos.length
      };
    });
  }, [trabalhos, selectedYear]);

  // Calculate totals for selected period
  const totals = useMemo(() => {
    const recebido = filteredTrabalhos.reduce((sum, t) => {
      if (t.status === 'recebido') return sum + t.valor;
      if (t.status === '50%') return sum + (t.valor * 0.5);
      return sum;
    }, 0);

    const pendente = filteredTrabalhos.reduce((sum, t) => {
      if (t.status === 'pendente') return sum + t.valor;
      if (t.status === '50%') return sum + (t.valor * 0.5);
      return sum;
    }, 0);

    const cancelado = filteredTrabalhos.reduce((sum, t) => {
      if (t.status === 'cancelado') return sum + t.valor;
      return sum;
    }, 0);

    return { recebido, pendente, cancelado, total: recebido + pendente };
  }, [filteredTrabalhos]);

  // Annual totals
  const annualTotals = useMemo(() => {
    return monthlyData.reduce((acc, m) => ({
      recebido: acc.recebido + m.recebido,
      pendente: acc.pendente + m.pendente,
      cancelado: acc.cancelado + m.cancelado,
      total: acc.total + m.total,
      count: acc.count + m.count
    }), { recebido: 0, pendente: 0, cancelado: 0, total: 0, count: 0 });
  }, [monthlyData]);

  // Export to Excel (CSV format)
  const handleExport = (period: 'month' | 'year') => {
    let csv = 'Relatório de Faturamento\n';
    csv += `Período: ${period === 'month' ? `${months[selectedMonth as number]}/${selectedYear}` : selectedYear}\n\n`;
    
    if (period === 'year') {
      // Annual report
      csv += 'Mês,Recebido,Pendente,Cancelado,Total,Quantidade\n';
      monthlyData.forEach(m => {
        csv += `${m.name},${m.recebido.toFixed(2)},${m.pendente.toFixed(2)},${m.cancelado.toFixed(2)},${m.total.toFixed(2)},${m.count}\n`;
      });
      csv += `\nTOTAL ANUAL,${annualTotals.recebido.toFixed(2)},${annualTotals.pendente.toFixed(2)},${annualTotals.cancelado.toFixed(2)},${annualTotals.total.toFixed(2)},${annualTotals.count}\n`;
    } else {
      // Monthly report with details
      csv += 'Data,Cliente,Serviço,Descrição,Valor,Status\n';
      filteredTrabalhos.forEach(t => {
        const cliente = clientes.find(c => c.id === t.clienteId);
        const servico = servicos.find(s => s.id === t.servicoId);
        csv += `${new Date(t.data).toLocaleDateString('pt-BR')},"${cliente?.nome || ''}","${servico?.nome || ''}","${t.descricao || ''}",${t.valor.toFixed(2)},${t.status}\n`;
      });
      csv += `\n`;
      csv += `Recebido,${totals.recebido.toFixed(2)}\n`;
      csv += `Pendente,${totals.pendente.toFixed(2)}\n`;
      csv += `Cancelado,${totals.cancelado.toFixed(2)}\n`;
      csv += `TOTAL,${totals.total.toFixed(2)}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faturamento_${period === 'year' ? selectedYear : `${months[selectedMonth as number]}_${selectedYear}`}.csv`;
    a.click();
    toast({ title: `Relatório ${period === 'year' ? 'anual' : 'mensal'} exportado!` });
  };

  const maxMonthValue = Math.max(...monthlyData.map(m => m.total), 1);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Período:</span>
          </div>
          
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearsAvailable.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedMonth === 'all' ? 'all' : selectedMonth.toString()} 
            onValueChange={(v) => setSelectedMonth(v === 'all' ? 'all' : parseInt(v))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ano Inteiro</SelectItem>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExport('month')}
            disabled={selectedMonth === 'all'}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Mês
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('year')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Ano
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <span className="text-sm text-muted-foreground">Recebido</span>
          </div>
          <p className="text-2xl font-bold text-success">
            R$ {totals.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <span className="text-sm text-muted-foreground">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-warning">
            R$ {totals.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">Cancelado</span>
          </div>
          <p className="text-2xl font-bold text-destructive">
            R$ {totals.cancelado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            R$ {totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Faturamento por Mês - {selectedYear}</h3>
        </div>

        <div className="space-y-3">
          {monthlyData.map((data, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer",
                selectedMonth === index ? "bg-primary/10" : "hover:bg-muted/50"
              )}
              onClick={() => setSelectedMonth(index)}
            >
              <span className="w-24 text-sm font-medium">{data.name}</span>
              
              <div className="flex-1 flex gap-1 h-6">
                {/* Recebido bar */}
                <div 
                  className="bg-success rounded-l transition-all"
                  style={{ width: `${(data.recebido / maxMonthValue) * 100}%` }}
                />
                {/* Pendente bar */}
                <div 
                  className="bg-warning transition-all"
                  style={{ width: `${(data.pendente / maxMonthValue) * 100}%` }}
                />
                {/* Cancelado bar */}
                <div 
                  className="bg-destructive/50 rounded-r transition-all"
                  style={{ width: `${(data.cancelado / maxMonthValue) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-4 text-right min-w-[200px]">
                <span className="text-xs text-muted-foreground">{data.count} trabalhos</span>
                <span className="font-semibold text-sm">
                  R$ {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-success" />
            <span className="text-xs text-muted-foreground">Recebido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-warning" />
            <span className="text-xs text-muted-foreground">Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive/50" />
            <span className="text-xs text-muted-foreground">Cancelado</span>
          </div>
        </div>
      </div>

      {/* Annual Summary */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo Anual - {selectedYear}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-foreground">{annualTotals.count}</p>
            <p className="text-xs text-muted-foreground">Trabalhos</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-success/10">
            <p className="text-lg font-bold text-success">
              R$ {annualTotals.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Recebido</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-warning/10">
            <p className="text-lg font-bold text-warning">
              R$ {annualTotals.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Pendente</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-destructive/10">
            <p className="text-lg font-bold text-destructive">
              R$ {annualTotals.cancelado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Cancelado</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-primary/10">
            <p className="text-lg font-bold text-primary">
              R$ {annualTotals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions for Selected Period */}
      {filteredTrabalhos.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="text-lg font-semibold">
              Trabalhos - {selectedMonth === 'all' ? selectedYear : `${months[selectedMonth]}/${selectedYear}`}
            </h3>
          </div>
          
          <div className="divide-y divide-border max-h-96 overflow-y-auto">
            {filteredTrabalhos.map((trabalho) => {
              const cliente = clientes.find(c => c.id === trabalho.clienteId);
              const servico = servicos.find(s => s.id === trabalho.servicoId);
              
              const statusStyles: Record<string, string> = {
                'recebido': 'bg-success/10 text-success',
                '50%': 'bg-warning/10 text-warning',
                'pendente': 'bg-info/10 text-info',
                'cancelado': 'bg-destructive/10 text-destructive'
              };

              return (
                <div key={trabalho.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">{servico?.nome || trabalho.descricao || 'Serviço'}</p>
                    <p className="text-sm text-muted-foreground">
                      {cliente?.nome || 'Cliente'} • {new Date(trabalho.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium",
                      statusStyles[trabalho.status] || 'bg-muted text-muted-foreground'
                    )}>
                      {trabalho.status}
                    </span>
                    <p className="font-bold text-foreground min-w-[100px] text-right">
                      R$ {trabalho.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
