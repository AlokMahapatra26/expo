'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/loading';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has token
    const checkAuthAndRedirect = async () => {
      try {
        const response = await fetch('/api/auth/check');
        
        if (response.ok) {
          // User is authenticated, go to dashboard
          router.push('/dashboard');
        } else {
          // User is not authenticated, go to signin
          router.push('/signin');
        }
      } catch (error) {
        // Error checking auth, go to signin
        router.push('/signin');
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return <Loading />;
}
