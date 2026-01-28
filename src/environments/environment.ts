declare global {
  interface Window {
    __env?: {
      API_BASE_URL?: string;
    };
  }
}

export const environment = {
  production: false,
  apiBaseUrl: window.__env?.API_BASE_URL || ''
};
