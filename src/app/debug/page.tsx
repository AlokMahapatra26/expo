'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const checkEverything = async () => {
      const cookies = document.cookie;
      
      try {
        const authCheck = await fetch('/api/auth/check');
        const authResult = await authCheck.json();
        
        setInfo({
          cookies,
          authCheck: authResult,
          currentPath: window.location.pathname,
        });
      } catch (error) {
        setInfo({
          cookies,
          error: error.message,
          currentPath: window.location.pathname,
        });
      }
    };

    checkEverything();
  }, []);

  return (
    <div className="p-4">
      <h1>Debug Info</h1>
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}
