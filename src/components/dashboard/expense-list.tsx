'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Edit, Trash2, Plus, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExpenseForm } from '@/components/forms/expense-form';
import { formatCurrencyINR } from '@/lib/format-currency';

interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'expense' | 'income';
  createdAt?: string;
}

interface ExpenseListProps {
  refresh: boolean;
  onRefresh: () => void;
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
}

export function ExpenseList({ refresh, onRefresh }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchExpenses = async (page: number = 1) => {
    try {
      setError(null);
      const response = await fetch(`/api/expenses?page=${page}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
        setPagination(data.pagination);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(currentPage);
  }, [refresh, currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setExpenses(expenses.filter(expense => expense._id !== id));
        onRefresh(); // Refresh stats
        
        // If current page becomes empty and it's not the first page, go to previous page
        if (expenses.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
      setError('Failed to delete expense');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleEditSuccess = () => {
    fetchExpenses(currentPage);
    onRefresh(); // Refresh stats
    setEditingExpense(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4 border border-zinc-200 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-4 bg-zinc-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 bg-zinc-200 rounded w-20"></div>
                <div className="h-8 w-8 bg-zinc-200 rounded"></div>
                <div className="h-8 w-8 bg-zinc-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border border-red-200 bg-red-50">
        <p className="text-red-600 text-sm">Error: {error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => fetchExpenses(currentPage)}
        >
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {expenses.length === 0 ? (
          <Card className="p-8 border border-zinc-200 text-center">
            <div className="text-zinc-500">
              <p className="text-lg mb-2">No transactions found</p>
              <p className="text-sm">Add your first expense or income to get started!</p>
            </div>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense._id} className="p-4 border border-zinc-200 hover:border-zinc-300 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      expense.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {expense.type === 'income' ? (
                        <Plus className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{expense.description}</h3>
                        <span className="text-xs px-2 py-1 bg-zinc-100 rounded-full flex-shrink-0">
                          {expense.category}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                        {expense.createdAt && (
                          <span className="ml-2">
                            • Added {format(new Date(expense.createdAt), 'MMM dd')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right">
                    <div className={`font-medium ${
                      expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {expense.type === 'income' ? '+' : '-'}{formatCurrencyINR(expense.amount)}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleEdit(expense)}
                    title="Edit transaction"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(expense._id)}
                    disabled={deleting === expense._id}
                    title="Delete transaction"
                  >
                    {deleting === expense._id ? (
                      <div className="h-3 w-3 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          
          <div className="flex gap-1">
            {[...Array(pagination.pages)].map((_, index) => {
              const page = index + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      {pagination && (
        <div className="text-center text-sm text-zinc-500 mt-2">
          Showing {expenses.length} of {pagination.total} transactions
        </div>
      )}

      {/* Edit Form Modal */}
      {editingExpense && (
        <ExpenseForm
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={handleEditSuccess}
          expense={editingExpense}
        />
      )}
    </>
  );
}
