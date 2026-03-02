import axios from 'axios';

const createClient = (baseURL: string) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const authApi = createClient(import.meta.env.VITE_AUTH_SERVICE_URL);
export const flagApi = createClient(import.meta.env.VITE_FLAG_SERVICE_URL);
export const targetingApi = createClient(import.meta.env.VITE_TARGETING_SERVICE_URL);
export const evaluationApi = createClient(import.meta.env.VITE_EVALUATION_SERVICE_URL);
export const analyticsApi = createClient(import.meta.env.VITE_ANALYTICS_SERVICE_URL);
