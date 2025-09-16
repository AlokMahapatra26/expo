// Global fetch wrapper that handles auth errors
export async function apiRequest(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    // If unauthorized, redirect to signin
    if (response.status === 401) {
      window.location.href = '/signin';
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    throw new Error('Network error');
  }
}
