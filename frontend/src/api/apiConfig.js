const LOCAL_API_URL = 'http://localhost:5000';
const PRODUCTION_API_URL = 'https://shopkeepers.onrender.com';

export const getApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) return configuredUrl;

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_API_URL;
    }
  }

  return PRODUCTION_API_URL;
};