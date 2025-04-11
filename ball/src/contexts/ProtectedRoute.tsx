import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { refreshToken, validateToken } from './axiosConfig'; // Importamos las funciones

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      // Verificamos si el token ha expirado
      const expiryTime = JSON.parse(atob(token.split('.')[1])).exp;
      const isExpired = Date.now() >= expiryTime * 1000;

      if (isExpired) {
        // Si el token ha expirado, intentamos refrescarlo
        const newToken = await refreshToken();
        if (newToken) {
          const isValid = await validateToken(newToken); // Validar el nuevo token
          if (isValid) {
            setIsAuthenticated(true); // Usuario sigue autenticado
          } else {
            setIsAuthenticated(false); // El nuevo token no es válido
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
          }
        } else {
          setIsAuthenticated(false); // No se pudo refrescar el token
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      } else {
        // Si el token no ha expirado, validamos si es válido
        const isValid = await validateToken(token);
        if (isValid) {
          setIsAuthenticated(true); // Usuario sigue autenticado
        } else {
          setIsAuthenticated(false); // El token no es válido
          localStorage.removeItem("access_token");
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Mostrar loading mientras verificamos la autenticación
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
