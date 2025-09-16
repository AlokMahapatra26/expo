'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrencyINR } from '@/lib/format-currency';

interface Stats {
  totalIncome: number;
  totalExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  balance: number;
  monthlyBalance: number;
  categoryBreakdown: Array<{ _id: string; total: number }>;
}

export function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4 border border-zinc-200 animate-pulse">
            <div className="h-4 bg-zinc-200 rounded mb-2"></div>
            <div className="h-6 bg-zinc-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border border-red-200 bg-red-50">
        <p className="text-red-600 text-sm">Error: {error}</p>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-4 border border-zinc-200">
        <p className="text-zinc-500 text-sm">No data available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-zinc-200">
          <div className="text-sm text-zinc-600 mb-1">Total Income</div>
          <div className="text-2xl font-medium text-green-600">
            {formatCurrencyINR(stats.totalIncome)}
          </div>
        </Card>

        <Card className="p-4 border border-zinc-200">
          <div className="text-sm text-zinc-600 mb-1">Total Expenses</div>
          <div className="text-2xl font-medium text-red-600">
            {formatCurrencyINR(stats.totalExpenses)}
          </div>
        </Card>

        <Card className="p-4 border border-zinc-200">
          <div className="text-sm text-zinc-600 mb-1">Current Balance</div>
          <div className={`text-2xl font-medium ${
            stats.balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrencyINR(stats.balance)}
          </div>
        </Card>

        <Card className="p-4 border border-zinc-200">
          <div className="text-sm text-zinc-600 mb-1">Monthly Balance</div>
          <div className={`text-2xl font-medium ${
            stats.monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrencyINR(stats.monthlyBalance)}
          </div>
        </Card>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-zinc-200">
          <div className="text-sm text-zinc-600 mb-1">This Month Income</div>
          <div className="text-xl font-medium text-green-600">
            {formatCurrencyINR(stats.monthlyIncome)}
          </div>
        </Card>

        <Card className="p-4 border border-zinc-200">
          <div className="text-sm text-zinc-600 mb-1">This Month Expenses</div>
          <div className="text-xl font-medium text-red-600">
            {formatCurrencyINR(stats.monthlyExpenses)}
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      {stats.categoryBreakdown.length > 0 && (
        <Card className="p-4 border border-zinc-200">
          <h3 className="text-lg font-medium mb-4">Top Spending Categories</h3>
          <div className="space-y-3">
            {stats.categoryBreakdown.slice(0, 5).map((category, index) => {
              const percentage = stats.totalExpenses > 0 
                ? (category.total / stats.totalExpenses * 100).toFixed(1)
                : '0';
              
              return (
                <div key={category._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-400" style={{
                      backgroundColor: `hsl(${index * 60}, 60%, 50%)`
                    }}></div>
                    <span className="text-sm font-medium">{category._id}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatCurrencyINR(category.total)}
                    </div>
                    <div className="text-xs text-zinc-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* No Data State */}
      {stats.totalIncome === 0 && stats.totalExpenses === 0 && (
        <Card className="p-8 border border-zinc-200 text-center">
          <div className="text-zinc-500">
            <p className="text-lg mb-2">No transactions yet</p>
            <p className="text-sm">Add your first income or expense to get started!</p>
          </div>
        </Card>
      )}
    </div>
  );
}
