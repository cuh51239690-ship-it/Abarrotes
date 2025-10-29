const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'abarrotes',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Función para inicializar la base de datos
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // Crear tabla de usuarios si no existe
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                direccion TEXT,
                telefono VARCHAR(20),
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Crear tabla de productos si no existe
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                precio DECIMAL(10,2) NOT NULL,
                descripcion TEXT,
                stock INT DEFAULT 0,
                activo BOOLEAN DEFAULT TRUE
            )
        `);
        
        // Insertar productos por defecto si no existen
        const [products] = await connection.execute('SELECT COUNT(*) as count FROM productos');
        if (products[0].count === 0) {
            await connection.execute(`
                INSERT INTO productos (nombre, precio, descripcion, stock) VALUES
                ('Canasta de Frutas', 12.99, 'Selección variada de frutas frescas de temporada', 50),
                ('Variedad de Enlatados', 8.50, 'Diferentes productos enlatados: verduras, frutas y legumbres', 100),
                ('Granos y Semillas', 6.75, 'Mezcla de granos y semillas nutritivas', 75),
                ('Productos Lácteos', 10.25, 'Variedad de productos lácteos frescos', 30)
            `);
            console.log('Productos por defecto insertados');
        }
        
        connection.release();
        console.log('Base de datos inicializada correctamente');
    } catch (error) {
        console.error('Error inicializando la base de datos:', error);
    }
}

module.exports = { pool, initializeDatabase };