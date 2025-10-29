// public/js/auth.js
const API_URL = 'http://localhost:3000/api';

class AuthService {
    // Guardar token en localStorage
    static setToken(token) {
        localStorage.setItem('token', token);
    }

    // Obtener token
    static getToken() {
        return localStorage.getItem('token');
    }

    // Remover token (logout)
    static removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Verificar si está autenticado
    static isAuthenticated() {
        return !!this.getToken();
    }

    // Guardar información del usuario
    static setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Obtener información del usuario
    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    // Registro
    static async register(userData) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            return data;
            console.log('✅ Usuario registrado:', { userId, nombre, email });
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    // Login
    static async login(credentials) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            console.log('✅ Login exitoso para usuario:', user.email);
            return data;
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }

    // Obtener perfil
    static async getProfile() {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            return { success: false, message: 'Error de conexión' };
        }
    }
}

// Uso en tus formularios
document.addEventListener('DOMContentLoaded', function() {
    // Manejo del formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userData = {
                nombre: document.getElementById('register-name').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value,
                telefono: document.getElementById('register-phone').value,
                direccion: document.getElementById('register-address').value
            };

            const result = await AuthService.register(userData);
            
            if (result.success) {
                AuthService.setToken(result.token);
                AuthService.setUser(result.user);
                showMessage('register-success', '¡Registro exitoso! Redirigiendo...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showMessage('register-error', result.message);
            }
        });
    }

    // Manejo del formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const credentials = {
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            };

            const result = await AuthService.login(credentials);
            
            if (result.success) {
                AuthService.setToken(result.token);
                AuthService.setUser(result.user);
                showMessage('login-success', '¡Inicio de sesión exitoso! Redirigiendo...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showMessage('login-error', result.message);
            }
        });
    }

    // Verificar si ya está autenticado
    if (AuthService.isAuthenticated() && window.location.pathname.includes('auth.html')) {
        window.location.href = 'index.html';
    }
});