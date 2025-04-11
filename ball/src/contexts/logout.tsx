export const logout = (): void => {
    // Eliminar los tokens del almacenamiento local
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Redirigir al usuario a la página de login
    window.location.href = '/login/'; // Redirige a la página de login
  };
  