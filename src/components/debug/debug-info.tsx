'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

export function DebugInfo() {
  const [debugData, setDebugData] = useState<any>(null);

  useEffect(() => {
    const fetchDebug = async () => {
      try {
        const [statsRes, expensesRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/expenses')
        ]);
        
        const stats = await statsRes.json();
        const expenses = await expensesRes.json();
        
        setDebugData({ stats, expenses });
      } catch (error) {
        console.error('Debug fetch error:', error);
      }
    };

    fetchDebug();
  }, []);

  if (!debugData) return null;

  return (
    <Card className="p-4 mt-4 bg-gray-50">
      <h3 className="font-medium mb-2">Debug Information</h3>
      <div className="text-xs">
        <div>Total Expenses Found: {debugData.expenses?.expenses?.length || 0}</div>
        <div>Stats Response: {JSON.stringify(debugData.stats, null, 2)}</div>
      </div>
    </Card>
  );
}
