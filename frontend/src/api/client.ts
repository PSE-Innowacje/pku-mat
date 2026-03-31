const BASE_URL = '/api';

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (!path.includes('/auth/login') && !path.includes('/auth/me')) {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }
    const error = await response
      .json()
      .catch(() => ({ message: 'Wystapil blad' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
