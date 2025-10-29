const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const authController = {
    // Registro de usuario
    async register(req, res) {
        try {
            // Validar campos
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }
            
            const { nombre, email, password, direccion, telefono } = req.body;
            
            // Verificar si el usuario ya existe
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El correo electrónico ya está registrado'
                });
            }
            
            // Crear usuario
            const userId = await User.create({
                nombre,
                email,
                password,
                direccion,
                telefono
            });
            
            // Generar token JWT
            const token = jwt.sign(
                { userId }, 
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: '24h' }
            );
            
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                token,
                user: {
                    id: userId,
                    nombre,
                    email,
                    direccion,
                    telefono
                }
            });
            
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },
    
    // Inicio de sesión
    async login(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }
            
            const { email, password } = req.body;
            
            // Buscar usuario
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            
            // Verificar contraseña
            const isPasswordValid = await User.verifyPassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }
            
            // Generar token JWT
            const token = jwt.sign(
                { userId: user.id }, 
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: '24h' }
            );
            
            res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                token,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    direccion: user.direccion,
                    telefono: user.telefono,
                    fecha_registro: user.fecha_registro
                }
            });
            
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    },
    
    // Obtener perfil de usuario
    async getProfile(req, res) {
        try {
            res.json({
                success: true,
                user: req.user
            });
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
};

module.exports = authController;