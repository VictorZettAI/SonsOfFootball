import { refreshToken, validateToken } from './axiosConfig'; // Importamos las funciones

export const Check_Validation = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return false;
    }
    const expiryTime = JSON.parse(atob(token.split('.')[1])).exp;
    const isExpired = Date.now() >= expiryTime * 1000;

    if (isExpired) {
        const newToken = await refreshToken();
        if (newToken) {
            const isValid = await validateToken(newToken);
            if (isValid) {
                return true;
            } else {
                return false
            }
        }
        else {
            return false
        }
    }
    else {
        const isValid = await validateToken(token);
        if (isValid) {
            return true;
        } else {
            return false
        }
    }
};
