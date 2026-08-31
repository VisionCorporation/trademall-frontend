declare global {
  interface Window {
    __env?: {
      API_BASE_URL?: string;
    };
  }
}

export function getApiBaseUrl(): string {
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    if (window.location.hostname === 'localhost') {
      return 'https://trademall-backend.onrender.com/api/v1';
    }
    return '/api';
  }

  const url = typeof process !== 'undefined' ? process.env?.['API_BASE_URL'] : undefined;
  return url || 'https://trademall-backend.onrender.com/api/v1';
}