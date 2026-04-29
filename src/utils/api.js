import axios from 'axios';

// Priorizamos la variable de entorno de Vercel (debe empezar con VITE_)
// Si no existe, usamos '/api' como respaldo (fallback)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para adjuntar el token JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar respuestas y errores globales
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Si el servidor responde con 401 (No autorizado), limpiamos y redirigimos
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      // Usamos replace para evitar que el usuario pueda volver atrás al estado de error
      window.location.replace('/login');
    }
    return Promise.reject(err);
  }
);

export default api;