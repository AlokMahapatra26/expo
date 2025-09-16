'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/dashboard/header';
import { Stats } from '@/components/dashboard/stats';
import { ExpenseList } from '@/components/dashboard/expense-list';
import { ExpenseForm } from '@/components/forms/expense-form';
import { Loading } from '@/components/ui/loading';

export default function DashboardPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          console.log('Not authenticated, redirecting to signin');
          router.push('/signin');
          return;
        }
      } catch (error) {
        console.log('Auth check failed, redirecting to signin');
        router.push('/signin');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Loading />; // Will redirect via useEffect
  }

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
