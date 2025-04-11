// Configuración de URLs para la aplicación
const isDevelopment = import.meta.env.DEV;

export const BASE_DOMAIN = isDevelopment ? 'localhost:8000' : 'idonium.es';
export const API_URL = isDevelopment 
  ? `http://${BASE_DOMAIN}/api` 
  : `https://${BASE_DOMAIN}/api`;
export const BASE_URL = isDevelopment 
  ? `http://${BASE_DOMAIN}` 
  : `https://${BASE_DOMAIN}`;

export default {
  BASE_DOMAIN,
  API_URL,
  BASE_URL
};
