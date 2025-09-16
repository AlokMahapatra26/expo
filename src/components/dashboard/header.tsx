'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddExpense: () => void;
}

export function Header({ onAddExpense }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/signin');
      router.refresh();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-medium">Expger</h1>
          <div className="flex gap-2">
            <Button onClick={onAddExpense}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 " />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
