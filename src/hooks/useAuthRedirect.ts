'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          console.log('Auth check failed, redirecting to signin');
          router.push('/signin');
        }
      } catch (error) {
        console.log('Auth check error, redirecting to signin');
        router.push('/signin');
      }
    };

    checkAuth();
  }, [router]);
}
