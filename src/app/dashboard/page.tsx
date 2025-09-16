'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Stats } from '@/components/dashboard/stats';
import { ExpenseList } from '@/components/dashboard/expense-list';
import { ExpenseForm } from '@/components/forms/expense-form';

export default function DashboardPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header onAddExpense={() => setShowAddForm(true)} />
      
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <Stats key={`stats-${refreshKey}`} />
          
          <div>
            <h2 className="text-lg font-medium mb-4">Recent Transactions</h2>
            <ExpenseList 
              refresh={refreshKey > 0} 
              onRefresh={handleRefresh} 
            />
          </div>
        </div>
      </main>

      <ExpenseForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
