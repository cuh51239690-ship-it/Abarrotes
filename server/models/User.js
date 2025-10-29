const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Crear usuario
    static async create(userData) {
        const { nombre, email, password, direccion, telefono } = userData;
        
        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO usuarios (nombre, email, password, direccion, telefono) VALUES (?, ?, ?, ?, ?)',
            [nombre, email, hashedPassword, direccion, telefono]
        );
        
        return result.insertId;
    }
    
    // Buscar usuario por email
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        
        return rows[0];
    }
    
    // Buscar usuario por ID
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, nombre, email, direccion, telefono, fecha_registro FROM usuarios WHERE id = ?',
            [id]
        );
        
        return rows[0];
    }
    
    // Verificar contraseña
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;