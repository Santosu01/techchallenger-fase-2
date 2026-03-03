import axios, { type AxiosInstance } from 'axios';

const createClient = (baseURL: string): AxiosInstance => {
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

// authApi: sempre usa VITE_MASTER_KEY para autenticação
authApi.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${import.meta.env.VITE_MASTER_KEY}`;
  return config;
});

// Função para adicionar interceptor de API key nos demais serviços
const addApiKeyInterceptor = (client: AxiosInstance): void => {
  client.interceptors.request.use((config) => {
    const apiKey = localStorage.getItem('togglemaster_api_key');
    if (apiKey) {
      // evaluationApi usa X-API-Key, outros usam Authorization Bearer
      if (config.baseURL?.includes('evaluation')) {
        config.headers['X-API-Key'] = apiKey;
      } else {
        config.headers.Authorization = `Bearer ${apiKey}`;
      }
    }
    return config;
  });
};

// Aplicar interceptor aos serviços que usam activeApiKey
const apiServices = [flagApi, targetingApi, evaluationApi, analyticsApi] as const;
apiServices.forEach(addApiKeyInterceptor);

// Interceptor de resposta para tratar erros 401
apiServices.forEach((client) => {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const apiKey = localStorage.getItem('togglemaster_api_key');
        if (!apiKey) {
          // Redirecionar para página de auth se não houver chave
          globalThis.location.href = '/auth';
        }
      }
      return Promise.reject(error);
    }
  );
});
