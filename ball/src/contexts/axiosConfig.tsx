import axios, { AxiosInstance } from 'axios';
import config from '../config';

// Creación de una instancia de Axios
const axiosInstance: AxiosInstance = axios.create({
  baseURL: config.API_URL, 
  timeout: 5000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function refreshToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      console.error("No refresh token found.");
      return null;
    }

    const response = await fetch(`${config.API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      console.error("Failed to refresh token:", response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.access) {
      localStorage.setItem("access_token", data.access);
      return data.access; // Retorna el nuevo token
    } else {
      console.error("No access token in response.");
      return null;
    }
  } catch (error) {
    console.error("Error while refreshing token:", error);
    return null;
  }
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${config.API_URL}/api/verify-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      console.error("Failed to verify token:", response.statusText);
      return false;
    }
    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error("Error while verifying token:", error);
    return false;
  }
}

// Interceptor para agregar el token a las solicitudes
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('access_token'); // Obtén el token desde el almacenamiento local
    if (token) {
      const expiryTime = JSON.parse(atob(token.split('.')[1])).exp;
      const isExpired = Date.now() >= expiryTime * 1000;

      if (isExpired) {
        const newToken = await refreshToken();
        if (newToken) {
          token = newToken;
        }
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// // Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => response, // Devuelve la respuesta si no hay errores
  (error) => {
    // Manejo de errores de respuesta
    if (error.response?.status === 401 ) {
      console.error('No autorizado: Redirigiendo al inicio de sesión.');
      // Podrías implementar una lógica para redirigir al usuario al login
      // window.location.href = '/login'; // Por ejemplo
    }
    return Promise.reject(error); // Propaga el error al componente que lo use
  }
);

export default axiosInstance;
