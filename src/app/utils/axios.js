import axios from 'axios';
import jwtDecode from 'jwt-decode';

const api = axios.create({
    baseURL: process.env.NEXT_API_URL,
});

// Fonction pour vérifier si le token a expiré
function isTokenExpired(token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Temps actuel en secondes
    return decodedToken.exp < currentTime;
}

// Fonction pour rafraîchir le token
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
        const response = await api.post('/refresh-token', { refreshToken });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        throw error;
    }
}

// Ajouter un interceptor pour gérer les erreurs 401
api.interceptors.response.use(
    response => response,
    async (error) => {
        const { response } = error;
        if (response && response.status === 401) {
            try {
                const newAccessToken = await refreshAccessToken();
                // Reconfigurer la requête originale avec le nouveau token
                response.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return api(response.config);
            } catch (error) {
                console.error('Failed to refresh token:', error);
                // Rediriger vers la page de connexion si le refresh échoue
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;